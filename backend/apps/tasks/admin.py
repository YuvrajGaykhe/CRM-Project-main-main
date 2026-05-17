from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "task_type", "status", "priority", "due_at", "assigned_to")
    search_fields = ("title", "description", "lead__lead_id", "dealer__name")
    list_filter = ("task_type", "status", "priority")
