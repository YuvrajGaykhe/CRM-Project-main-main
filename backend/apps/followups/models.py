from django.conf import settings
from django.db import models

from shared.models import OwnedModel


class FollowUp(OwnedModel):
    CHANNEL_CHOICES = [
        ("call", "Call"),
        ("whatsapp", "WhatsApp"),
        ("email", "Email"),
        ("meeting", "Meeting"),
        ("site_visit", "Site Visit"),
    ]
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("completed", "Completed"),
        ("missed", "Missed"),
        ("cancelled", "Cancelled"),
        ("rescheduled", "Rescheduled"),
    ]

    lead = models.ForeignKey("leads.Lead", related_name="followups", on_delete=models.CASCADE)
    scheduled_at = models.DateTimeField(db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=24, choices=STATUS_CHOICES, default="scheduled", db_index=True
    )
    channel = models.CharField(max_length=24, choices=CHANNEL_CHOICES, default="call")
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sigma_followups",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    outcome = models.TextField(blank=True)

    class Meta:
        ordering = ["scheduled_at"]
        indexes = [
            models.Index(fields=["assigned_to", "status"]),
            models.Index(fields=["scheduled_at", "status"]),
        ]

    def __str__(self):
        return f"{self.lead.lead_id} follow-up at {self.scheduled_at}"
