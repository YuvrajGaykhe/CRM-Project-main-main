from django.contrib import admin

from .models import FollowUp


@admin.register(FollowUp)
class FollowUpAdmin(admin.ModelAdmin):
    list_display = ("lead", "scheduled_at", "status", "channel", "assigned_to")
    search_fields = ("lead__lead_id", "lead__full_name", "outcome")
    list_filter = ("status", "channel")
