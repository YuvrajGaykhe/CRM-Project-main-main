from django.db import models

from shared.models import OwnedModel


class Product(OwnedModel):
    CATEGORY_CHOICES = [
        ("amplifier", "Amplifier"),
        ("accessory", "Accessory"),
        ("bundle", "Bundle"),
    ]

    sku = models.CharField(max_length=40, unique=True, db_index=True)
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES, default="amplifier")
    rms_power = models.CharField(max_length=80, blank=True)
    vehicle_fitment = models.CharField(max_length=160, blank=True)
    description = models.TextField(blank=True)
    specifications = models.JSONField(default=dict, blank=True)
    image_url = models.URLField(blank=True)
    brochure_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    demand_score = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sku"]
        indexes = [
            models.Index(fields=["sku", "is_active"]),
            models.Index(fields=["category", "is_active"]),
        ]

    def __str__(self):
        return f"{self.sku} - {self.name}"
