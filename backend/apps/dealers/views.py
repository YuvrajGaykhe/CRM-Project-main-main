from django.utils import timezone
from rest_framework import decorators, filters, response, status, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.audit.services import log_action
from shared.permissions.rbac import DealerPermission, get_role_slug, is_platform_admin

from .models import Dealer
from .serializers import DealerSerializer


class DealerViewSet(viewsets.ModelViewSet):
    serializer_class = DealerSerializer
    permission_classes = [IsAuthenticated, DealerPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "name",
        "business_type",
        "region",
        "state",
        "city",
        "gst_number",
        "contact_person",
        "mobile",
    ]
    ordering_fields = ["name", "state", "city", "tier", "status", "revenue_generated", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        queryset = Dealer.objects.select_related("territory_manager", "approved_by")
        region = self.request.query_params.get("region")
        state = self.request.query_params.get("state")
        status_filter = self.request.query_params.get("status")
        tier = self.request.query_params.get("tier")

        if region:
            queryset = queryset.filter(region__iexact=region)
        if state:
            queryset = queryset.filter(state__iexact=state)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if tier:
            queryset = queryset.filter(tier=tier)

        role_slug = get_role_slug(self.request.user)
        if role_slug == "dealer-manager" and not is_platform_admin(self.request.user):
            queryset = queryset.filter(territory_manager=self.request.user)

        return queryset

    def perform_create(self, serializer):
        dealer = serializer.save(created_by=self.request.user, updated_by=self.request.user)
        log_action(self.request.user, "dealer.created", dealer, request=self.request)

    def perform_update(self, serializer):
        dealer = serializer.save(updated_by=self.request.user)
        log_action(self.request.user, "dealer.updated", dealer, request=self.request)

    @decorators.action(methods=["post"], detail=True)
    def approve(self, request, pk=None):
        dealer = self.get_object()
        dealer.status = "active"
        dealer.approved_at = timezone.now()
        dealer.approved_by = request.user
        dealer.updated_by = request.user
        dealer.save(update_fields=["status", "approved_at", "approved_by", "updated_by", "updated_at"])
        log_action(request.user, "dealer.approved", dealer, request=request)
        return response.Response(self.get_serializer(dealer).data, status=status.HTTP_200_OK)
