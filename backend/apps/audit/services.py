from .models import AuditLog


def log_action(user, action, instance=None, metadata=None, request=None):
    metadata = metadata or {}
    ip_address = None
    user_agent = ""

    if request is not None:
        ip_address = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0]
        ip_address = ip_address or request.META.get("REMOTE_ADDR")
        user_agent = request.META.get("HTTP_USER_AGENT", "")

    entity_type = "system"
    entity_id = ""
    if instance is not None:
        entity_type = instance._meta.label_lower
        entity_id = str(getattr(instance, "pk", ""))

    return AuditLog.objects.create(
        user=user if getattr(user, "is_authenticated", False) else None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata=metadata,
        ip_address=ip_address or None,
        user_agent=user_agent,
    )
