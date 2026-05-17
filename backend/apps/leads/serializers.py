from rest_framework import serializers

from .models import Lead, LeadNote, LeadTimelineEvent


class LeadSerializer(serializers.ModelSerializer):
    interested_product_name = serializers.CharField(source="interested_product.name", read_only=True)
    interested_product_sku = serializers.CharField(source="interested_product.sku", read_only=True)
    assigned_executive_name = serializers.CharField(source="assigned_executive.username", read_only=True)
    assigned_dealer_name = serializers.CharField(source="assigned_dealer.name", read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id",
            "lead_id",
            "full_name",
            "mobile_number",
            "whatsapp_number",
            "email",
            "company_name",
            "city",
            "state",
            "pincode",
            "interested_product",
            "interested_product_name",
            "interested_product_sku",
            "lead_source",
            "inquiry_type",
            "priority_level",
            "assigned_executive",
            "assigned_executive_name",
            "assigned_dealer",
            "assigned_dealer_name",
            "notes",
            "last_followup_at",
            "next_followup_at",
            "conversion_probability",
            "status",
            "lost_reason",
            "metadata",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = [
            "lead_id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]


class LeadNoteSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = LeadNote
        fields = [
            "id",
            "lead",
            "note",
            "is_internal",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["lead", "created_by", "created_at", "updated_at"]


class LeadTimelineEventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = LeadTimelineEvent
        fields = [
            "id",
            "lead",
            "action",
            "message",
            "metadata",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["lead", "created_by", "created_at", "updated_at"]
