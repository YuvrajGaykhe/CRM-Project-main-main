from django.conf import settings
from django.db import models

from shared.models import TimestampedModel


class Notification(TimestampedModel):
    TYPE_CHOICES = [
        ("lead_assignment", "Lead Assignment"),
        ("new_inquiry", "New Inquiry"),
        ("followup_due", "Follow-up Due"),
        ("overdue_task", "Overdue Task"),
        ("dealer_approval", "Dealer Approval"),
        ("system", "System"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sigma_notifications",
        on_delete=models.CASCADE,
    )
    notification_type = models.CharField(max_length=40, choices=TYPE_CHOICES, db_index=True)
    title = models.CharField(max_length=160)
    message = models.TextField(blank=True)
    payload = models.JSONField(default=dict, blank=True)
    read_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "read_at"]),
            models.Index(fields=["notification_type", "created_at"]),
        ]

    def __str__(self):
        return self.title
