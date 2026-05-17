from rest_framework import serializers

from .models import InquiryEvent


class InquiryEventSerializer(serializers.ModelSerializer):
    lead_uid = serializers.CharField(source="lead.lead_id", read_only=True)

    class Meta:
        model = InquiryEvent
        fields = [
            "id",
            "source",
            "status",
            "payload",
            "lead",
            "lead_uid",
            "error_message",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["status", "lead", "lead_uid", "error_message", "created_at", "updated_at"]
