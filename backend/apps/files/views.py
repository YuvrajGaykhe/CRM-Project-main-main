from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.audit.services import log_action

from .models import Attachment
from .serializers import AttachmentSerializer


class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["file_name", "file_type", "mime_type"]
    ordering_fields = ["created_at", "file_type", "file_name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Attachment.objects.select_related("content_type", "uploaded_by")
        file_type = self.request.query_params.get("file_type")
        if file_type:
            queryset = queryset.filter(file_type=file_type)
        return queryset

    def perform_create(self, serializer):
        attachment = serializer.save(uploaded_by=self.request.user)
        log_action(self.request.user, "attachment.created", attachment, request=self.request)
