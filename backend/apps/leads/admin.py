from django.contrib import admin

from .models import Lead, LeadNote, LeadTimelineEvent


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("lead_id", "full_name", "city", "state", "lead_source", "status", "priority_level")
    search_fields = ("lead_id", "full_name", "mobile_number", "whatsapp_number", "email", "city", "state")
    list_filter = ("status", "priority_level", "lead_source", "state")


@admin.register(LeadNote)
class LeadNoteAdmin(admin.ModelAdmin):
    list_display = ("lead", "created_by", "created_at", "is_internal")
    search_fields = ("lead__lead_id", "note")


@admin.register(LeadTimelineEvent)
class LeadTimelineEventAdmin(admin.ModelAdmin):
    list_display = ("lead", "action", "created_by", "created_at")
    search_fields = ("lead__lead_id", "action", "message")
