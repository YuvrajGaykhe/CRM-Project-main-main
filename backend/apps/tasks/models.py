from django.conf import settings
from django.db import models

from shared.models import OwnedModel


class Task(OwnedModel):
    STATUS_CHOICES = [
        ("todo", "To Do"),
        ("in_progress", "In Progress"),
        ("blocked", "Blocked"),
        ("done", "Done"),
        ("cancelled", "Cancelled"),
    ]
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]
    TASK_TYPE_CHOICES = [
        ("followup", "Follow-up"),
        ("callback", "Callback"),
        ("meeting", "Meeting"),
        ("dealer_onboarding", "Dealer Onboarding"),
        ("support", "Support"),
        ("internal", "Internal"),
    ]

    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    task_type = models.CharField(max_length=40, choices=TASK_TYPE_CHOICES, default="followup")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="todo", db_index=True)
    priority = models.CharField(
        max_length=20, choices=PRIORITY_CHOICES, default="medium", db_index=True
    )
    due_at = models.DateTimeField(null=True, blank=True, db_index=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sigma_tasks",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    lead = models.ForeignKey(
        "leads.Lead",
        related_name="tasks",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    dealer = models.ForeignKey(
        "dealers.Dealer",
        related_name="tasks",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["status", "due_at", "-created_at"]
        indexes = [
            models.Index(fields=["assigned_to", "status"]),
            models.Index(fields=["due_at", "status"]),
            models.Index(fields=["priority", "status"]),
        ]

    def __str__(self):
        return self.title
