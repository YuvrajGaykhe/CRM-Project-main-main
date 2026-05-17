from django.contrib import admin

from .models import Attachment


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ("file_name", "file_type", "uploaded_by", "created_at")
    search_fields = ("file_name", "file_type", "mime_type")
    list_filter = ("file_type",)
