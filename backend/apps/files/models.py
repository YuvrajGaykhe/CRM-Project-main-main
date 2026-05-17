from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from shared.models import TimestampedModel


class Attachment(TimestampedModel):
    FILE_TYPE_CHOICES = [
        ("brochure", "Brochure"),
        ("lead_attachment", "Lead Attachment"),
        ("dealer_document", "Dealer Document"),
        ("invoice", "Invoice"),
        ("warranty", "Warranty"),
        ("other", "Other"),
    ]

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")
    file_type = models.CharField(max_length=40, choices=FILE_TYPE_CHOICES, default="other")
    file_name = models.CharField(max_length=180)
    file_url = models.URLField()
    mime_type = models.CharField(max_length=120, blank=True)
    size_bytes = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sigma_attachments",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
            models.Index(fields=["file_type", "created_at"]),
        ]

    def __str__(self):
        return self.file_name
