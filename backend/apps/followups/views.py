from django.utils import timezone
from rest_framework import decorators, filters, response, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.audit.services import log_action
from apps.leads.services import create_timeline_event
from shared.permissions.rbac import TaskPermission, get_role_slug, is_platform_admin

from .models import FollowUp
from .serializers import FollowUpSerializer


class FollowUpViewSet(viewsets.ModelViewSet):
    serializer_class = FollowUpSerializer
    permission_classes = [IsAuthenticated, TaskPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["lead__lead_id", "lead__full_name", "outcome"]
    ordering_fields = ["scheduled_at", "status", "created_at"]
    ordering = ["scheduled_at"]

    def get_queryset(self):
        queryset = FollowUp.objects.select_related("lead", "assigned_to")
        status_filter = self.request.query_params.get("status")
        channel = self.request.query_params.get("channel")
        assigned_to = self.request.query_params.get("assigned_to")

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if channel:
            queryset = queryset.filter(channel=channel)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)

        role_slug = get_role_slug(self.request.user)
        if role_slug in {"sales-executive", "support-staff"} and not is_platform_admin(self.request.user):
            queryset = queryset.filter(assigned_to=self.request.user)

        return queryset

    def perform_create(self, serializer):
        followup = serializer.save(created_by=self.request.user, updated_by=self.request.user)
        followup.lead.next_followup_at = followup.scheduled_at
        followup.lead.save(update_fields=["next_followup_at", "updated_at"])
        create_timeline_event(
            followup.lead,
            "followup.scheduled",
            "Follow-up scheduled.",
            metadata={"followup_id": followup.id, "scheduled_at": followup.scheduled_at.isoformat()},
            user=self.request.user,
        )
        log_action(self.request.user, "followup.created", followup, request=self.request)

    def perform_update(self, serializer):
        followup = serializer.save(updated_by=self.request.user)
        log_action(self.request.user, "followup.updated", followup, request=self.request)

    @decorators.action(methods=["post"], detail=True)
    def complete(self, request, pk=None):
        followup = self.get_object()
        followup.status = "completed"
        followup.completed_at = timezone.now()
        followup.outcome = request.data.get("outcome", followup.outcome)
        followup.updated_by = request.user
        followup.save(update_fields=["status", "completed_at", "outcome", "updated_by", "updated_at"])
        followup.lead.last_followup_at = followup.completed_at
        followup.lead.save(update_fields=["last_followup_at", "updated_at"])
        create_timeline_event(
            followup.lead,
            "followup.completed",
            "Follow-up completed.",
            metadata={"followup_id": followup.id},
            user=request.user,
        )
        log_action(request.user, "followup.completed", followup, request=request)
        return response.Response(self.get_serializer(followup).data)
