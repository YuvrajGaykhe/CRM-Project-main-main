from django.db import models

from shared.models import TimestampedModel


class InquiryEvent(TimestampedModel):
    SOURCE_CHOICES = [
        ("website_form", "Website Form"),
        ("whatsapp_click", "WhatsApp Click"),
        ("dealer_inquiry_click", "Dealer Inquiry Click"),
        ("product_detail_request", "Product Detail Request"),
        ("brochure_request", "Brochure Request"),
    ]
    STATUS_CHOICES = [
        ("received", "Received"),
        ("processed", "Processed"),
        ("failed", "Failed"),
    ]

    source = models.CharField(max_length=40, choices=SOURCE_CHOICES, db_index=True)
    status = models.CharField(max_length=24, choices=STATUS_CHOICES, default="received", db_index=True)
    payload = models.JSONField(default=dict)
    lead = models.ForeignKey(
        "leads.Lead",
        related_name="inquiry_events",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["source", "status"]),
            models.Index(fields=["created_at", "status"]),
        ]

    def __str__(self):
        return f"{self.source} {self.status}"
