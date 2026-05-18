from decimal import Decimal

from django.db.models import Q, Sum
from rest_framework import serializers

from .models import Dealer

ACTIVE_LEAD_STATUSES = (
    "new",
    "attempted_contact",
    "contacted",
    "interested",
    "negotiation",
    "dealer_assigned",
)


class DealerSerializer(serializers.ModelSerializer):
    territory_manager_name = serializers.CharField(
        source="territory_manager.username", read_only=True
    )
    revenue_generated = serializers.SerializerMethodField()
    active_leads_count = serializers.SerializerMethodField()

    class Meta:
        model = Dealer
        fields = [
            "id",
            "name",
            "business_type",
            "region",
            "state",
            "city",
            "pincode",
            "gst_number",
            "contact_person",
            "mobile",
            "whatsapp",
            "email",
            "territory_manager",
            "territory_manager_name",
            "tier",
            "status",
            "monthly_performance",
            "product_demand",
            "revenue_generated",
            "active_leads_count",
            "notes",
            "approved_at",
            "approved_by",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = [
            "revenue_generated",
            "active_leads_count",
            "approved_at",
            "approved_by",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]

    def get_active_leads_count(self, obj):
        annotated_value = getattr(obj, "annotated_active_leads_count", None)
        if annotated_value is not None:
            return annotated_value
        return obj.assigned_leads.filter(status__in=ACTIVE_LEAD_STATUSES).count()

    def get_revenue_generated(self, obj):
        annotated_value = getattr(obj, "annotated_revenue_generated", None)
        if annotated_value is None:
            annotated_value = (
                obj.assigned_leads.filter(status="converted").aggregate(
                    total=Sum("conversion_probability")
                )["total"]
                or 0
            )
        return f"{Decimal(annotated_value):.2f}"
