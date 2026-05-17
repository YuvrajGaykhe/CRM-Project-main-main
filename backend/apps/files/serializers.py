from rest_framework import serializers

from .models import Attachment


class AttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source="uploaded_by.username", read_only=True)

    class Meta:
        model = Attachment
        fields = [
            "id",
            "content_type",
            "object_id",
            "file_type",
            "file_name",
            "file_url",
            "mime_type",
            "size_bytes",
            "uploaded_by",
            "uploaded_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["uploaded_by", "created_at", "updated_at"]
