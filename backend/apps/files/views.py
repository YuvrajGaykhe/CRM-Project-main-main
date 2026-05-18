from rest_framework import filters, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated

from apps.audit.services import log_action

from .models import Attachment
from .serializers import AttachmentSerializer


class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["file_name", "file_type", "mime_type"]
    ordering_fields = ["created_at", "file_type", "file_name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Attachment.objects.select_related("content_type", "uploaded_by")
        file_type = self.request.query_params.get("file_type")
        content_type = self.request.query_params.get("content_type")
        object_id = self.request.query_params.get("object_id")

        if file_type:
            queryset = queryset.filter(file_type=file_type)
        if content_type:
            if content_type.isdigit():
                queryset = queryset.filter(content_type_id=int(content_type))
            elif "." in content_type:
                app_label, model = content_type.split(".", 1)
                queryset = queryset.filter(content_type__app_label=app_label, content_type__model=model)
            else:
                queryset = queryset.none()
        if object_id and object_id.isdigit():
            queryset = queryset.filter(object_id=int(object_id))
        return queryset

    def perform_create(self, serializer):
        attachment = serializer.save(uploaded_by=self.request.user)
        log_action(self.request.user, "attachment.created", attachment, request=self.request)
