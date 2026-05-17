"""
Analytics service layer for Sigma Audio CRM.
Computes lead trends, conversion funnels, employee performance,
regional revenue, and activity feeds.
"""
import datetime
from collections import defaultdict

from django.conf import settings
from django.db.models import Avg, Count, F, Q, Sum
from django.db.models.functions import TruncDate, TruncWeek
from django.utils import timezone

from apps.audit.models import AuditLog
from apps.dealers.models import Dealer
from apps.followups.models import FollowUp
from apps.leads.models import Lead
from apps.products.models import Product
from apps.tasks.models import Task


def _parse_date_range(params):
    """Extract (start, end) datetime from request query params."""
    today = timezone.localdate()
    preset = params.get("range", "30d")
    presets = {
        "7d": 7,
        "14d": 14,
        "30d": 30,
        "90d": 90,
        "180d": 180,
        "365d": 365,
    }
    from_str = params.get("from")
    to_str = params.get("to")

    if from_str and to_str:
        try:
            start = datetime.date.fromisoformat(from_str)
            end = datetime.date.fromisoformat(to_str)
            return start, end
        except (ValueError, TypeError):
            pass

    days = presets.get(preset, 30)
    return today - datetime.timedelta(days=days), today


def get_lead_trends(params=None):
    """Daily lead creation counts with status breakdown over a date range."""
    params = params or {}
    start, end = _parse_date_range(params)

    leads = (
        Lead.objects.filter(created_at__date__gte=start, created_at__date__lte=end)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )

    status_breakdown = list(
        Lead.objects.filter(created_at__date__gte=start, created_at__date__lte=end)
        .values("status")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    source_breakdown = list(
        Lead.objects.filter(created_at__date__gte=start, created_at__date__lte=end)
        .values("lead_source")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    priority_breakdown = list(
        Lead.objects.filter(created_at__date__gte=start, created_at__date__lte=end)
        .values("priority_level")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    return {
        "daily": [{"date": str(row["day"]), "count": row["count"]} for row in leads],
        "status_breakdown": status_breakdown,
        "source_breakdown": source_breakdown,
        "priority_breakdown": priority_breakdown,
        "date_range": {"from": str(start), "to": str(end)},
    }


def get_conversion_funnel():
    """Stage-by-stage lead funnel with counts and conversion rates."""
    stage_order = [
        "new",
        "attempted_contact",
        "contacted",
        "interested",
        "negotiation",
        "dealer_assigned",
        "converted",
    ]

    counts = {
        row["status"]: row["count"]
        for row in Lead.objects.values("status").annotate(count=Count("id"))
    }

    total = sum(counts.values()) or 1
    funnel = []
    running = total
    for stage in stage_order:
        count = counts.get(stage, 0)
        funnel.append({
            "stage": stage,
            "count": count,
            "percentage": round((count / total) * 100, 1),
            "drop_off": round(((running - count) / running) * 100, 1) if running else 0,
        })
        running = count or running

    lost = counts.get("lost", 0)
    closed = counts.get("closed", 0)
    funnel.append({"stage": "lost", "count": lost, "percentage": round((lost / total) * 100, 1), "drop_off": 0})
    funnel.append({"stage": "closed", "count": closed, "percentage": round((closed / total) * 100, 1), "drop_off": 0})

    return {
        "funnel": funnel,
        "total_leads": total,
        "converted": counts.get("converted", 0),
        "conversion_rate": round((counts.get("converted", 0) / total) * 100, 2),
    }


def get_employee_performance(params=None):
    """Per-employee lead and follow-up metrics."""
    params = params or {}
    start, end = _parse_date_range(params)
    User = __import__("django.contrib.auth", fromlist=["get_user_model"]).get_user_model()

    employees = (
        User.objects.filter(is_active=True)
        .annotate(
            leads_assigned=Count(
                "assigned_sigma_leads",
                filter=Q(assigned_sigma_leads__created_at__date__gte=start,
                         assigned_sigma_leads__created_at__date__lte=end),
            ),
            leads_converted=Count(
                "assigned_sigma_leads",
                filter=Q(assigned_sigma_leads__status="converted",
                         assigned_sigma_leads__created_at__date__gte=start,
                         assigned_sigma_leads__created_at__date__lte=end),
            ),
            followups_completed=Count(
                "sigma_followups",
                filter=Q(sigma_followups__status="completed",
                         sigma_followups__created_at__date__gte=start,
                         sigma_followups__created_at__date__lte=end),
            ),
            followups_total=Count(
                "sigma_followups",
                filter=Q(sigma_followups__created_at__date__gte=start,
                         sigma_followups__created_at__date__lte=end),
            ),
            tasks_done=Count(
                "sigma_tasks",
                filter=Q(sigma_tasks__status="done",
                         sigma_tasks__created_at__date__gte=start,
                         sigma_tasks__created_at__date__lte=end),
            ),
        )
        .filter(Q(leads_assigned__gt=0) | Q(followups_total__gt=0) | Q(tasks_done__gt=0))
        .values(
            "id", "username", "email",
            "leads_assigned", "leads_converted",
            "followups_completed", "followups_total",
            "tasks_done",
        )
        .order_by("-leads_converted", "-leads_assigned")
    )

    result = []
    for emp in employees:
        conv_rate = round((emp["leads_converted"] / emp["leads_assigned"]) * 100, 1) if emp["leads_assigned"] else 0
        followup_rate = round((emp["followups_completed"] / emp["followups_total"]) * 100, 1) if emp["followups_total"] else 0
        result.append({
            **emp,
            "conversion_rate": conv_rate,
            "followup_efficiency": followup_rate,
        })

    return result


def get_dealer_analytics(params=None):
    """Dealer revenue trends, tier distribution, regional comparison."""
    params = params or {}

    tier_distribution = list(
        Dealer.objects.values("tier").annotate(count=Count("id")).order_by("-count")
    )

    regional_revenue = list(
        Dealer.objects.filter(status="active")
        .values("region")
        .annotate(
            count=Count("id"),
            total_revenue=Sum("revenue_generated"),
            avg_leads=Avg("active_leads_count"),
        )
        .order_by("-total_revenue")
    )

    top_dealers = list(
        Dealer.objects.filter(status="active")
        .values("id", "name", "city", "state", "region", "tier", "revenue_generated", "active_leads_count")
        .order_by("-revenue_generated")[:15]
    )

    status_distribution = list(
        Dealer.objects.values("status").annotate(count=Count("id")).order_by("-count")
    )

    return {
        "tier_distribution": tier_distribution,
        "regional_revenue": regional_revenue,
        "top_dealers": top_dealers,
        "status_distribution": status_distribution,
        "total_dealers": Dealer.objects.count(),
        "active_dealers": Dealer.objects.filter(status="active").count(),
    }


def get_product_analytics(params=None):
    """Product inquiry trends and demand metrics."""
    params = params or {}
    start, end = _parse_date_range(params)

    products = list(
        Product.objects.filter(is_active=True)
        .annotate(
            total_inquiries=Count("leads"),
            period_inquiries=Count(
                "leads",
                filter=Q(leads__created_at__date__gte=start, leads__created_at__date__lte=end),
            ),
        )
        .values("id", "sku", "name", "category", "rms_power", "demand_score",
                "total_inquiries", "period_inquiries")
        .order_by("-total_inquiries")
    )

    # Daily product inquiry trends
    daily_by_product = (
        Lead.objects.filter(
            interested_product__isnull=False,
            created_at__date__gte=start,
            created_at__date__lte=end,
        )
        .annotate(day=TruncDate("created_at"))
        .values("day", "interested_product__sku")
        .annotate(count=Count("id"))
        .order_by("day")
    )

    trends = defaultdict(list)
    for row in daily_by_product:
        trends[row["interested_product__sku"]].append({
            "date": str(row["day"]),
            "count": row["count"],
        })

    return {
        "products": products,
        "daily_trends": dict(trends),
    }


def get_activity_feed(limit=50):
    """Recent audit log entries with human-readable labels."""
    ACTION_LABELS = {
        "lead.created": "New lead captured",
        "lead.updated": "Lead updated",
        "lead.note_added": "Note added to lead",
        "lead.dealer_assigned": "Dealer assigned to lead",
        "dealer.created": "New dealer onboarded",
        "dealer.updated": "Dealer updated",
        "dealer.approved": "Dealer approved",
        "task.created": "Task created",
        "task.completed": "Task completed",
        "followup.created": "Follow-up scheduled",
        "followup.completed": "Follow-up completed",
    }

    entries = (
        AuditLog.objects.select_related("user")
        .order_by("-created_at")[:limit]
    )

    return [
        {
            "id": entry.id,
            "action": entry.action,
            "label": ACTION_LABELS.get(entry.action, entry.action.replace(".", " ").title()),
            "entity_type": entry.entity_type,
            "entity_id": entry.entity_id,
            "user_name": entry.user.username if entry.user else "System",
            "created_at": entry.created_at.isoformat(),
        }
        for entry in entries
    ]
