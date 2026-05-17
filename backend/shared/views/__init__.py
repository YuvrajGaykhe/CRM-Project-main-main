"""
Global search across Sigma Audio CRM entities.
Searches leads, dealers, products, and tasks in a single query.
"""
from django.db.models import Q, Value, CharField
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.dealers.models import Dealer
from apps.leads.models import Lead
from apps.products.models import Product
from apps.tasks.models import Task


class GlobalSearchAPIView(APIView):
    """Unified search across leads, dealers, products, and tasks."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if len(query) < 2:
            return Response({"results": [], "query": query})

        limit = min(int(request.query_params.get("limit", 8)), 20)

        leads = list(
            Lead.objects.filter(
                Q(lead_id__icontains=query)
                | Q(full_name__icontains=query)
                | Q(mobile_number__icontains=query)
                | Q(email__icontains=query)
                | Q(company_name__icontains=query)
                | Q(city__icontains=query)
                | Q(state__icontains=query)
            )
            .values("id", "lead_id", "full_name", "city", "state", "status")
            .order_by("-created_at")[:limit]
        )

        dealers = list(
            Dealer.objects.filter(
                Q(name__icontains=query)
                | Q(gst_number__icontains=query)
                | Q(contact_person__icontains=query)
                | Q(mobile__icontains=query)
                | Q(city__icontains=query)
                | Q(state__icontains=query)
            )
            .values("id", "name", "city", "state", "status", "tier")
            .order_by("name")[:limit]
        )

        products = list(
            Product.objects.filter(
                Q(sku__icontains=query)
                | Q(name__icontains=query)
                | Q(description__icontains=query)
                | Q(vehicle_fitment__icontains=query)
            )
            .values("id", "sku", "name", "category", "is_active")
            .order_by("sku")[:limit]
        )

        tasks = list(
            Task.objects.filter(
                Q(title__icontains=query)
                | Q(description__icontains=query)
            )
            .values("id", "title", "status", "priority", "task_type")
            .order_by("-created_at")[:limit]
        )

        results = []
        for lead in leads:
            results.append({
                "type": "lead",
                "id": lead["id"],
                "title": lead["full_name"],
                "subtitle": f"{lead['lead_id']} · {lead['city']}, {lead['state']}",
                "status": lead["status"],
                "url": f"/dashboard/leads",
            })
        for dealer in dealers:
            results.append({
                "type": "dealer",
                "id": dealer["id"],
                "title": dealer["name"],
                "subtitle": f"{dealer['city']}, {dealer['state']} · {dealer['tier']}",
                "status": dealer["status"],
                "url": f"/dashboard/dealers",
            })
        for product in products:
            results.append({
                "type": "product",
                "id": product["id"],
                "title": f"{product['sku']} — {product['name']}",
                "subtitle": product["category"],
                "status": "active" if product["is_active"] else "inactive",
                "url": f"/dashboard/products",
            })
        for task in tasks:
            results.append({
                "type": "task",
                "id": task["id"],
                "title": task["title"],
                "subtitle": f"{task['task_type']} · {task['priority']}",
                "status": task["status"],
                "url": f"/dashboard/tasks",
            })

        return Response({
            "results": results,
            "query": query,
            "counts": {
                "leads": len(leads),
                "dealers": len(dealers),
                "products": len(products),
                "tasks": len(tasks),
            },
        })
