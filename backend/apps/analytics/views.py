"""
Analytics views for Sigma Audio CRM.
Provides dashboard overview, lead analytics, dealer analytics,
product analytics, employee performance, and activity feed endpoints.
"""
from django.db.models import Count, Sum
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


class AnalyticsOverviewAPIView(APIView):
    """Dashboard KPI overview — all key metrics in one call."""
    permission_classes = [AnalyticsPermission]

    def get(self, request):
        today = timezone.localdate()
        total_leads = Lead.objects.count()
        converted_leads = Lead.objects.filter(status="converted").count()
        conversion_rate = round((converted_leads / total_leads) * 100, 2) if total_leads else 0

        leads_by_status = {
            row["status"]: row["count"]
            for row in Lead.objects.values("status").annotate(count=Count("id"))
        }
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

        # Follow-up efficiency
        total_followups = FollowUp.objects.count()
        completed_followups = FollowUp.objects.filter(status="completed").count()
        followup_efficiency = round((completed_followups / total_followups) * 100, 1) if total_followups else 0

        # Recent activity for pulse
        activity_feed = services.get_activity_feed(limit=10)

        return Response(
            {
                "kpis": {
                    "total_leads": total_leads,
                    "leads_today": Lead.objects.filter(created_at__date=today).count(),
                    "pending_followups": FollowUp.objects.filter(
                        status="scheduled", scheduled_at__date__lte=today
                    ).count(),
                    "converted_leads": converted_leads,
                    "conversion_rate": conversion_rate,
                    "monthly_revenue": Dealer.objects.aggregate(total=Sum("revenue_generated"))["total"] or 0,
                    "active_dealers": Dealer.objects.filter(status="active").count(),
                    "open_tasks": Task.objects.exclude(status__in=["done", "cancelled"]).count(),
                    "followup_efficiency": followup_efficiency,
                    "overdue_followups": FollowUp.objects.filter(
                        status="scheduled", scheduled_at__lt=timezone.now()
                    ).count(),
                },
                "lead_funnel": leads_by_status,
                "state_wise_leads": leads_by_state,
                "product_inquiries": product_inquiries,
                "dealer_ranking": dealer_ranking,
                "activity_feed": activity_feed,
            }
        )


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
