from django.contrib import admin

from .models import InquiryEvent


@admin.register(InquiryEvent)
class InquiryEventAdmin(admin.ModelAdmin):
    list_display = ("source", "status", "lead", "created_at")
    search_fields = ("source", "status", "error_message")
    list_filter = ("source", "status")
