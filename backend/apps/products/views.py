from django.db.models import Count
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.audit.services import log_action
from shared.permissions.rbac import ProductPermission

from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, ProductPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["sku", "name", "category", "vehicle_fitment"]
    ordering_fields = ["sku", "name", "demand_score", "created_at"]
    ordering = ["sku"]

    def get_queryset(self):
        return Product.objects.annotate(inquiry_count=Count("leads")).all()

    def perform_create(self, serializer):
        product = serializer.save(created_by=self.request.user, updated_by=self.request.user)
        log_action(self.request.user, "product.created", product, request=self.request)

    def perform_update(self, serializer):
        product = serializer.save(updated_by=self.request.user)
        log_action(self.request.user, "product.updated", product, request=self.request)
