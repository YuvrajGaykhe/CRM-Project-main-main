from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    inquiry_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "sku",
            "name",
            "category",
            "rms_power",
            "vehicle_fitment",
            "description",
            "specifications",
            "image_url",
            "brochure_url",
            "is_active",
            "demand_score",
            "inquiry_count",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["created_at", "updated_at", "created_by", "updated_by"]
