from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "notification_type", "user", "read_at", "created_at")
    search_fields = ("title", "message", "user__email", "user__username")
    list_filter = ("notification_type", "read_at")
