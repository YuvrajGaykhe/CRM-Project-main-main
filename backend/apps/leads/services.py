from apps.notifications.services import create_notification

from .models import Lead, LeadTimelineEvent


def create_timeline_event(lead, action, message="", metadata=None, user=None):
    return LeadTimelineEvent.objects.create(
        lead=lead,
        action=action,
        message=message,
        metadata=metadata or {},
        created_by=user if getattr(user, "is_authenticated", False) else None,
    )


def notify_assignment(lead):
    if not lead.assigned_executive:
        return None
    return create_notification(
        user=lead.assigned_executive,
        notification_type="lead_assignment",
        title=f"New Sigma lead assigned: {lead.full_name}",
        message=f"{lead.city}, {lead.state} inquiry for {lead.interested_product or 'Sigma Audio'}",
        payload={"lead_id": lead.id, "lead_uid": lead.lead_id},
    )


def create_lead_from_inquiry(payload, source="website_form"):
    product = payload.get("interested_product")
    lead = Lead.objects.create(
        full_name=payload.get("full_name") or payload.get("name") or "Website Inquiry",
        mobile_number=payload.get("mobile_number") or payload.get("mobile") or "",
        whatsapp_number=payload.get("whatsapp_number") or payload.get("whatsapp") or "",
        email=payload.get("email") or "",
        company_name=payload.get("company_name") or payload.get("company") or "",
        city=payload.get("city") or "",
        state=payload.get("state") or "",
        pincode=payload.get("pincode") or "",
        interested_product=product,
        lead_source=payload.get("lead_source") or source,
        inquiry_type=payload.get("inquiry_type") or "product",
        priority_level=payload.get("priority_level") or "medium",
        notes=payload.get("notes") or "",
        metadata=payload,
    )
    create_timeline_event(
        lead,
        "inquiry_captured",
        "Lead created from Sigma Audio inquiry integration.",
        metadata={"source": source},
    )
    notify_assignment(lead)
    return lead
