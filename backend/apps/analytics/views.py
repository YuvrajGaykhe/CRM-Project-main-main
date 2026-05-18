"""
Analytics views for Sigma Audio CRM.
Provides dashboard overview, lead analytics, dealer analytics,
product analytics, employee performance, and activity feed endpoints.
"""
from django.core.cache import cache
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.dealers.models import Dealer
from apps.followups.models import FollowUp
from apps.leads.models import Lead
from apps.products.models import Product
from apps.tasks.models import Task
from shared.permissions.rbac import AnalyticsPermission

from . import services

ANALYTICS_OVERVIEW_CACHE_KEY = "analytics_overview"
ANALYTICS_OVERVIEW_CACHE_TTL = 60 * 5


class AnalyticsOverviewAPIView(APIView):
    """Dashboard KPI overview — all key metrics in one call."""
    permission_classes = [AnalyticsPermission]

    def get(self, request):
        cached_data = cache.get(ANALYTICS_OVERVIEW_CACHE_KEY)
        if cached_data is not None:
            return Response(cached_data)

        today = timezone.localdate()
        now = timezone.now()

        status_rows = list(
            Lead.objects.values("status").annotate(
                count=Count("id"),
                today_count=Count("id", filter=Q(created_at__date=today)),
            )
        )
        leads_by_status = {row["status"]: row["count"] for row in status_rows}
        total_leads = sum(leads_by_status.values())
        converted_leads = leads_by_status.get("converted", 0)
        leads_today = sum(row["today_count"] for row in status_rows)
        conversion_rate = round((converted_leads / total_leads) * 100, 2) if total_leads else 0

        leads_by_state = list(
            Lead.objects.values("state").annotate(count=Count("id")).order_by("-count")[:12]
        )
        product_inquiries = list(
            Product.objects.annotate(inquiries=Count("leads"))
            .values("id", "sku", "name", "inquiries", "demand_score")
            .order_by("-inquiries")
        )
        dealer_ranking = list(
            Dealer.objects.values("id", "name", "state", "city", "tier", "revenue_generated")
            .order_by("-revenue_generated")[:10]
        )

        followup_metrics = FollowUp.objects.aggregate(
            total_followups=Count("id"),
            completed_followups=Count("id", filter=Q(status="completed")),
            pending_followups=Count(
                "id",
                filter=Q(status="scheduled", scheduled_at__date__lte=today),
            ),
            overdue_followups=Count(
                "id",
                filter=Q(status="scheduled", scheduled_at__lt=now),
            ),
        )
        total_followups = followup_metrics["total_followups"] or 0
        completed_followups = followup_metrics["completed_followups"] or 0
        followup_efficiency = round((completed_followups / total_followups) * 100, 1) if total_followups else 0

        dealer_metrics = Dealer.objects.aggregate(
            monthly_revenue=Sum("revenue_generated"),
            active_dealers=Count("id", filter=Q(status="active")),
        )
        task_metrics = Task.objects.aggregate(
            open_tasks=Count("id", filter=~Q(status__in=["done", "cancelled"]))
        )

        # Recent activity for pulse
        activity_feed = services.get_activity_feed(limit=10)

        data = {
            "kpis": {
                "total_leads": total_leads,
                "leads_today": leads_today,
                "pending_followups": followup_metrics["pending_followups"] or 0,
                "converted_leads": converted_leads,
                "conversion_rate": conversion_rate,
                "monthly_revenue": dealer_metrics["monthly_revenue"] or 0,
                "active_dealers": dealer_metrics["active_dealers"] or 0,
                "open_tasks": task_metrics["open_tasks"] or 0,
                "followup_efficiency": followup_efficiency,
                "overdue_followups": followup_metrics["overdue_followups"] or 0,
            },
            "lead_funnel": leads_by_status,
            "state_wise_leads": leads_by_state,
            "product_inquiries": product_inquiries,
            "dealer_ranking": dealer_ranking,
            "activity_feed": activity_feed,
        }
        cache.set(ANALYTICS_OVERVIEW_CACHE_KEY, data, ANALYTICS_OVERVIEW_CACHE_TTL)
        return Response(data)


class AnalyticsLeadsAPIView(APIView):
    """Lead trends, source breakdown, funnel with date-range support."""
    permission_classes = [AnalyticsPermission]

    def get(self, request):
        trends = services.get_lead_trends(request.query_params)
        funnel = services.get_conversion_funnel()
        return Response({
            "trends": trends,
            "funnel": funnel,
        })


class AnalyticsDealersAPIView(APIView):
    """Dealer revenue, tier distribution, regional comparison."""
    permission_classes = [AnalyticsPermission]

    def get(self, request):
        return Response(services.get_dealer_analytics(request.query_params))


class AnalyticsProductsAPIView(APIView):
    """Product inquiry trends and demand metrics."""
    permission_classes = [AnalyticsPermission]

    def get(self, request):
        return Response(services.get_product_analytics(request.query_params))


class AnalyticsEmployeeAPIView(APIView):
    """Employee performance: leads, conversions, follow-up efficiency."""
    permission_classes = [AnalyticsPermission]

    def get(self, request):
        return Response(services.get_employee_performance(request.query_params))


class AnalyticsActivityAPIView(APIView):
    """Recent system activity feed."""
    permission_classes = [AnalyticsPermission]

    def get(self, request):
        limit = int(request.query_params.get("limit", 50))
        limit = min(limit, 200)
        return Response(services.get_activity_feed(limit=limit))
