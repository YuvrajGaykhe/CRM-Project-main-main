from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from .models import Attachment


class ContentTypeReferenceField(serializers.Field):
    default_error_messages = {
        "invalid": "Use content_type id or '<app_label>.<model>'.",
        "not_found": "Invalid content_type reference.",
    }

    def to_representation(self, value):
        return value.pk if value else None

    def to_internal_value(self, data):
        if isinstance(data, int) or (isinstance(data, str) and data.isdigit()):
            try:
                return ContentType.objects.get(pk=int(data))
            except ContentType.DoesNotExist:
                self.fail("not_found")

        if isinstance(data, str) and "." in data:
            app_label, model = data.split(".", 1)
            try:
                return ContentType.objects.get(app_label=app_label, model=model)
            except ContentType.DoesNotExist:
                self.fail("not_found")

        self.fail("invalid")


class AttachmentSerializer(serializers.ModelSerializer):
    content_type = ContentTypeReferenceField()
    uploaded_by_name = serializers.CharField(source="uploaded_by.username", read_only=True)
    file = serializers.FileField(write_only=True, required=True)
    file_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Attachment
        fields = [
            "id",
            "content_type",
            "object_id",
            "file_type",
            "file_name",
            "file",
            "file_url",
            "mime_type",
            "size_bytes",
            "uploaded_by",
            "uploaded_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["file_url", "mime_type", "size_bytes", "uploaded_by", "created_at", "updated_at"]
        extra_kwargs = {
            "file_name": {"required": False},
        }

    def get_file_url(self, obj):
        file_url = obj.file_url
        if not file_url:
            return ""
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(file_url)
        return file_url

    def create(self, validated_data):
        uploaded_file = validated_data.get("file")
        if uploaded_file:
            if not validated_data.get("file_name"):
                validated_data["file_name"] = uploaded_file.name
            validated_data["mime_type"] = uploaded_file.content_type or ""
            validated_data["size_bytes"] = uploaded_file.size or 0
        return super().create(validated_data)

    def update(self, instance, validated_data):
        uploaded_file = validated_data.get("file")
        if uploaded_file:
            if not validated_data.get("file_name"):
                validated_data["file_name"] = uploaded_file.name
            validated_data["mime_type"] = uploaded_file.content_type or ""
            validated_data["size_bytes"] = uploaded_file.size or 0
        return super().update(instance, validated_data)
