from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import RoleViewSet, UserViewSet
from apps.analytics.views import (
    AnalyticsActivityAPIView,
    AnalyticsDealersAPIView,
    AnalyticsEmployeeAPIView,
    AnalyticsLeadsAPIView,
    AnalyticsOverviewAPIView,
    AnalyticsProductsAPIView,
)
from apps.audit.views import AuditLogViewSet
from apps.dealers.views import DealerViewSet
from apps.files.views import AttachmentViewSet
from apps.followups.views import FollowUpViewSet
from apps.integrations.views import InquiryEventViewSet
from apps.leads.views import LeadNoteViewSet, LeadTimelineViewSet, LeadViewSet
from apps.notifications.views import NotificationViewSet
from apps.products.views import ProductViewSet
from apps.tasks.views import TaskViewSet
from shared.views import GlobalSearchAPIView

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")
router.register("roles", RoleViewSet, basename="role")
router.register("leads", LeadViewSet, basename="lead")
router.register("lead-notes", LeadNoteViewSet, basename="lead-note")
router.register("lead-timeline", LeadTimelineViewSet, basename="lead-timeline")
router.register("dealers", DealerViewSet, basename="dealer")
router.register("products", ProductViewSet, basename="product")
router.register("tasks", TaskViewSet, basename="task")
router.register("followups", FollowUpViewSet, basename="followup")
router.register("notifications", NotificationViewSet, basename="notification")
router.register("attachments", AttachmentViewSet, basename="attachment")
router.register("audit-logs", AuditLogViewSet, basename="audit-log")
router.register("inquiry-events", InquiryEventViewSet, basename="inquiry-event")

urlpatterns = [
    path("", include(router.urls)),
    # Analytics endpoints
    path("analytics/overview/", AnalyticsOverviewAPIView.as_view(), name="analytics-overview"),
    path("analytics/leads/", AnalyticsLeadsAPIView.as_view(), name="analytics-leads"),
    path("analytics/dealers/", AnalyticsDealersAPIView.as_view(), name="analytics-dealers"),
    path("analytics/products/", AnalyticsProductsAPIView.as_view(), name="analytics-products"),
    path("analytics/employees/", AnalyticsEmployeeAPIView.as_view(), name="analytics-employees"),
    path("analytics/activity/", AnalyticsActivityAPIView.as_view(), name="analytics-activity"),
    # Global search
    path("search/", GlobalSearchAPIView.as_view(), name="global-search"),
]
