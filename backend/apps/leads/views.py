import csv
import io

from django.db.models import Count
from django.http import StreamingHttpResponse
from rest_framework import decorators, filters, response, status, viewsets
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated

from apps.audit.services import log_action
from apps.notifications.services import create_notification
from shared.permissions.rbac import LeadPermission, get_role_slug, is_platform_admin

from .models import Lead, LeadNote, LeadTimelineEvent
from .serializers import LeadNoteSerializer, LeadSerializer, LeadTimelineEventSerializer
from .services import create_timeline_event, notify_assignment


CSV_EXPORT_FIELDS = [
    "lead_id", "full_name", "mobile_number", "whatsapp_number", "email",
    "company_name", "city", "state", "pincode", "lead_source",
    "inquiry_type", "priority_level", "status", "conversion_probability",
    "notes", "created_at",
]

CSV_IMPORT_FIELDS = [
    "full_name", "mobile_number", "whatsapp_number", "email",
    "company_name", "city", "state", "pincode", "lead_source",
    "inquiry_type", "priority_level", "notes",
]


class Echo:
    """Pseudo-buffer for streaming CSV rows."""
    def write(self, value):
        return value


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated, LeadPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "lead_id",
        "full_name",
        "mobile_number",
        "whatsapp_number",
        "email",
        "company_name",
        "city",
        "state",
        "pincode",
        "notes",
    ]
    ordering_fields = [
        "created_at",
        "updated_at",
        "next_followup_at",
        "priority_level",
        "conversion_probability",
        "status",
    ]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Lead.objects.select_related(
            "interested_product",
            "assigned_executive",
            "assigned_dealer",
        )
        status_filter = self.request.query_params.get("status")
        state = self.request.query_params.get("state")
        source = self.request.query_params.get("source")
        priority = self.request.query_params.get("priority")
        product_id = self.request.query_params.get("product")
        assigned_to = self.request.query_params.get("assigned_to")

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if state:
            queryset = queryset.filter(state__iexact=state)
        if source:
            queryset = queryset.filter(lead_source=source)
        if priority:
            queryset = queryset.filter(priority_level=priority)
        if product_id:
            queryset = queryset.filter(interested_product_id=product_id)
        if assigned_to:
            queryset = queryset.filter(assigned_executive_id=assigned_to)

        role_slug = get_role_slug(self.request.user)
        if role_slug == "sales-executive" and not is_platform_admin(self.request.user):
            queryset = queryset.filter(assigned_executive=self.request.user)

        return queryset

    def perform_create(self, serializer):
        lead = serializer.save(created_by=self.request.user, updated_by=self.request.user)
        create_timeline_event(
            lead,
            "lead.created",
            "Lead created in Sigma Audio CRM.",
            user=self.request.user,
        )
        notify_assignment(lead)
        log_action(self.request.user, "lead.created", lead, request=self.request)

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        old_assignee_id = serializer.instance.assigned_executive_id
        lead = serializer.save(updated_by=self.request.user)

        if old_status != lead.status:
            create_timeline_event(
                lead,
                "lead.status_changed",
                f"Status changed from {old_status} to {lead.status}.",
                metadata={"from": old_status, "to": lead.status},
                user=self.request.user,
            )
        if old_assignee_id != lead.assigned_executive_id:
            create_timeline_event(
                lead,
                "lead.assigned",
                "Lead assignment updated.",
                metadata={"assigned_executive_id": lead.assigned_executive_id},
                user=self.request.user,
            )
            notify_assignment(lead)

        log_action(self.request.user, "lead.updated", lead, request=self.request)

    @decorators.action(methods=["get"], detail=False)
    def kanban(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        data = {
            row["status"]: row["count"]
            for row in queryset.values("status").annotate(count=Count("id"))
        }
        return response.Response(data)

    @decorators.action(methods=["post"], detail=True)
    def notes(self, request, pk=None):
        lead = self.get_object()
        serializer = LeadNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = serializer.save(lead=lead, created_by=request.user)
        create_timeline_event(
            lead,
            "lead.note_added",
            "A note was added to the lead.",
            metadata={"note_id": note.id},
            user=request.user,
        )
        log_action(request.user, "lead.note_added", note, request=request)
        return response.Response(LeadNoteSerializer(note).data, status=status.HTTP_201_CREATED)

    @decorators.action(methods=["get"], detail=True)
    def timeline(self, request, pk=None):
        lead = self.get_object()
        events = lead.timeline.select_related("created_by").all()
        return response.Response(LeadTimelineEventSerializer(events, many=True).data)

    @decorators.action(methods=["post"], detail=True)
    def assign_dealer(self, request, pk=None):
        lead = self.get_object()
        dealer_id = request.data.get("dealer_id")
        if not dealer_id:
            return response.Response(
                {"dealer_id": "This field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        lead.assigned_dealer_id = dealer_id
        lead.status = "dealer_assigned"
        lead.updated_by = request.user
        lead.save(update_fields=["assigned_dealer", "status", "updated_by", "updated_at"])
        create_timeline_event(
            lead,
            "lead.dealer_assigned",
            "Dealer was assigned to the lead.",
            metadata={"dealer_id": dealer_id},
            user=request.user,
        )
        create_notification(
            lead.assigned_executive,
            "lead_assignment",
            f"Dealer assigned for {lead.full_name}",
            payload={"lead_id": lead.id, "dealer_id": dealer_id},
        )
        log_action(request.user, "lead.dealer_assigned", lead, request=request)
        return response.Response(self.get_serializer(lead).data)

    @decorators.action(methods=["get"], detail=False, url_path="export_csv")
    def export_csv(self, request):
        """Stream filtered leads as CSV download."""
        queryset = self.filter_queryset(self.get_queryset())
        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)

        def rows():
            yield writer.write(CSV_EXPORT_FIELDS)
            for lead in queryset.iterator(chunk_size=500):
                yield writer.write([
                    lead.lead_id,
                    lead.full_name,
                    lead.mobile_number,
                    lead.whatsapp_number,
                    lead.email,
                    lead.company_name,
                    lead.city,
                    lead.state,
                    lead.pincode,
                    lead.lead_source,
                    lead.inquiry_type,
                    lead.priority_level,
                    lead.status,
                    lead.conversion_probability,
                    lead.notes,
                    lead.created_at.isoformat() if lead.created_at else "",
                ])

        resp = StreamingHttpResponse(rows(), content_type="text/csv")
        resp["Content-Disposition"] = 'attachment; filename="sigma_leads_export.csv"'
        log_action(request.user, "lead.csv_exported", metadata={"count": queryset.count()}, request=request)
        return resp

    @decorators.action(methods=["post"], detail=False, url_path="import_csv", parser_classes=[MultiPartParser])
    def import_csv(self, request):
        """Bulk create leads from an uploaded CSV file."""
        csv_file = request.FILES.get("file")
        if not csv_file:
            return response.Response(
                {"file": "CSV file is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        decoded = csv_file.read().decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(decoded))
        created_count = 0
        errors = []

        for row_num, row in enumerate(reader, start=2):
            try:
                lead = Lead.objects.create(
                    full_name=row.get("full_name", "").strip(),
                    mobile_number=row.get("mobile_number", "").strip(),
                    whatsapp_number=row.get("whatsapp_number", "").strip(),
                    email=row.get("email", "").strip(),
                    company_name=row.get("company_name", "").strip(),
                    city=row.get("city", "").strip(),
                    state=row.get("state", "").strip(),
                    pincode=row.get("pincode", "").strip(),
                    lead_source=row.get("lead_source", "manual_entry").strip() or "manual_entry",
                    inquiry_type=row.get("inquiry_type", "product").strip() or "product",
                    priority_level=row.get("priority_level", "medium").strip() or "medium",
                    notes=row.get("notes", "").strip(),
                    created_by=request.user,
                    updated_by=request.user,
                )
                create_timeline_event(lead, "lead.csv_imported", "Lead imported via CSV upload.", user=request.user)
                created_count += 1
            except Exception as exc:
                errors.append({"row": row_num, "error": str(exc)})
                if len(errors) >= 50:
                    break

        log_action(
            request.user,
            "lead.csv_imported",
            metadata={"created": created_count, "errors": len(errors)},
            request=request,
        )

        return response.Response(
            {"created": created_count, "errors": errors},
            status=status.HTTP_201_CREATED,
        )


class LeadNoteViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LeadNoteSerializer
    permission_classes = [IsAuthenticated, LeadPermission]

    def get_queryset(self):
        return LeadNote.objects.select_related("lead", "created_by").all()


class LeadTimelineViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LeadTimelineEventSerializer
    permission_classes = [IsAuthenticated, LeadPermission]

    def get_queryset(self):
        return LeadTimelineEvent.objects.select_related("lead", "created_by").all()
