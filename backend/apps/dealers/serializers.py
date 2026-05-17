from rest_framework import serializers

from .models import Dealer


class DealerSerializer(serializers.ModelSerializer):
    territory_manager_name = serializers.CharField(
        source="territory_manager.username", read_only=True
    )

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
            "approved_at",
            "approved_by",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
