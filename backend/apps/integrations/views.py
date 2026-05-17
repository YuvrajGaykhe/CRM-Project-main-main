from rest_framework import filters, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.leads.services import create_lead_from_inquiry

from .models import InquiryEvent
from .serializers import InquiryEventSerializer


class InquiryEventViewSet(viewsets.ModelViewSet):
    serializer_class = InquiryEventSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "source", "status"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = InquiryEvent.objects.select_related("lead")
        source = self.request.query_params.get("source")
        status_filter = self.request.query_params.get("status")
        if source:
            queryset = queryset.filter(source=source)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = serializer.save()
        try:
            lead = create_lead_from_inquiry(
                event.payload,
                source=event.source.replace("_click", ""),
            )
            event.lead = lead
            event.status = "processed"
            event.save(update_fields=["lead", "status", "updated_at"])
        except Exception as exc:
            event.status = "failed"
            event.error_message = str(exc)
            event.save(update_fields=["status", "error_message", "updated_at"])
        headers = self.get_success_headers(serializer.data)
        return Response(
            InquiryEventSerializer(event).data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )
