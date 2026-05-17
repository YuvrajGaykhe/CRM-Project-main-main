from rest_framework import serializers

from .models import FollowUp


class FollowUpSerializer(serializers.ModelSerializer):
    lead_uid = serializers.CharField(source="lead.lead_id", read_only=True)
    lead_name = serializers.CharField(source="lead.full_name", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True)

    class Meta:
        model = FollowUp
        fields = [
            "id",
            "lead",
            "lead_uid",
            "lead_name",
            "scheduled_at",
            "completed_at",
            "status",
            "channel",
            "assigned_to",
            "assigned_to_name",
            "outcome",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["created_at", "updated_at", "created_by", "updated_by"]
