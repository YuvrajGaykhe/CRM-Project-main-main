from django.conf import settings
from django.db import models

from shared.models import OwnedModel


class Dealer(OwnedModel):
    BUSINESS_TYPE_CHOICES = [
        ("dealer", "Dealer"),
        ("distributor", "Distributor"),
        ("retailer", "Retailer"),
        ("installer", "Installer"),
        ("fleet_partner", "Fleet Partner"),
    ]
    TIER_CHOICES = [
        ("platinum", "Platinum"),
        ("gold", "Gold"),
        ("silver", "Silver"),
        ("bronze", "Bronze"),
        ("prospect", "Prospect"),
    ]
    STATUS_CHOICES = [
        ("prospect", "Prospect"),
        ("pending_approval", "Pending Approval"),
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("suspended", "Suspended"),
    ]

    name = models.CharField(max_length=160, db_index=True)
    business_type = models.CharField(max_length=40, choices=BUSINESS_TYPE_CHOICES)
    region = models.CharField(max_length=80, db_index=True)
    state = models.CharField(max_length=80, db_index=True)
    city = models.CharField(max_length=80, db_index=True)
    pincode = models.CharField(max_length=12, blank=True, db_index=True)
    gst_number = models.CharField(max_length=32, blank=True, db_index=True)
    contact_person = models.CharField(max_length=120, blank=True)
    mobile = models.CharField(max_length=20, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    territory_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="managed_dealers",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default="prospect", db_index=True)
    status = models.CharField(
        max_length=32, choices=STATUS_CHOICES, default="prospect", db_index=True
    )
    monthly_performance = models.JSONField(default=dict, blank=True)
    product_demand = models.JSONField(default=dict, blank=True)
    # DEPRECATED - use annotated revenue_generated from DealerViewSet.
    revenue_generated = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    # DEPRECATED - use annotated active_leads_count from DealerViewSet.
    active_leads_count = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="approved_dealers",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["state", "city"]),
            models.Index(fields=["region", "status"]),
            models.Index(fields=["tier", "status"]),
        ]

    def __str__(self):
        return self.name
