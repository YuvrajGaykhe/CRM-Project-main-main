import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from shared.models import OwnedModel, TimestampedModel


def generate_lead_id():
    return f"SIG-{uuid.uuid4().hex[:8].upper()}"


class Lead(OwnedModel):
    SOURCE_CHOICES = [
        ("website_form", "Website Form"),
        ("whatsapp", "WhatsApp"),
        ("dealer_inquiry", "Dealer Inquiry"),
        ("distributor", "Distributor"),
        ("direct_call", "Direct Call"),
        ("manual_entry", "Manual Entry"),
        ("social_media", "Social Media"),
    ]
    INQUIRY_TYPE_CHOICES = [
        ("product", "Product"),
        ("dealer", "Dealer"),
        ("distributor", "Distributor"),
        ("support", "Support"),
        ("brochure", "Brochure"),
    ]
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]
    STATUS_CHOICES = [
        ("new", "New"),
        ("attempted_contact", "Attempted Contact"),
        ("contacted", "Contacted"),
        ("interested", "Interested"),
        ("negotiation", "Negotiation"),
        ("dealer_assigned", "Dealer Assigned"),
        ("converted", "Converted"),
        ("lost", "Lost"),
        ("closed", "Closed"),
    ]

    lead_id = models.CharField(max_length=32, unique=True, default=generate_lead_id, db_index=True)
    full_name = models.CharField(max_length=140)
    mobile_number = models.CharField(max_length=20, db_index=True)
    whatsapp_number = models.CharField(max_length=20, blank=True, db_index=True)
    email = models.EmailField(blank=True)
    company_name = models.CharField(max_length=160, blank=True)
    city = models.CharField(max_length=80, db_index=True)
    state = models.CharField(max_length=80, db_index=True)
    pincode = models.CharField(max_length=12, blank=True, db_index=True)
    interested_product = models.ForeignKey(
        "products.Product",
        related_name="leads",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    lead_source = models.CharField(max_length=40, choices=SOURCE_CHOICES, db_index=True)
    inquiry_type = models.CharField(max_length=40, choices=INQUIRY_TYPE_CHOICES, default="product")
    priority_level = models.CharField(
        max_length=20, choices=PRIORITY_CHOICES, default="medium", db_index=True
    )
    assigned_executive = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="assigned_sigma_leads",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    assigned_dealer = models.ForeignKey(
        "dealers.Dealer",
        related_name="assigned_leads",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    notes = models.TextField(blank=True)
    last_followup_at = models.DateTimeField(null=True, blank=True, db_index=True)
    next_followup_at = models.DateTimeField(null=True, blank=True, db_index=True)
    conversion_probability = models.PositiveSmallIntegerField(
        default=20,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    status = models.CharField(max_length=40, choices=STATUS_CHOICES, default="new", db_index=True)
    lost_reason = models.CharField(max_length=200, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "priority_level"]),
            models.Index(fields=["state", "city"]),
            models.Index(fields=["lead_source", "created_at"]),
            models.Index(fields=["assigned_executive", "status"]),
            models.Index(fields=["next_followup_at", "status"]),
        ]

    def __str__(self):
        return f"{self.lead_id} - {self.full_name}"


class LeadNote(TimestampedModel):
    lead = models.ForeignKey(Lead, related_name="lead_notes", on_delete=models.CASCADE)
    note = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sigma_lead_notes",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    is_internal = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Note for {self.lead.lead_id}"


class LeadTimelineEvent(TimestampedModel):
    lead = models.ForeignKey(Lead, related_name="timeline", on_delete=models.CASCADE)
    action = models.CharField(max_length=120, db_index=True)
    message = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sigma_lead_timeline_events",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["lead", "created_at"]),
            models.Index(fields=["action", "created_at"]),
        ]

    def __str__(self):
        return f"{self.lead.lead_id}: {self.action}"
