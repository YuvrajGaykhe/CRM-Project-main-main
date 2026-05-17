from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save

# Create your models here.


class User(AbstractUser):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.ForeignKey(
        "accounts.Role", on_delete=models.SET_NULL, null=True, blank=True
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    bio = models.CharField(max_length=1000)
    verified = models.BooleanField(default=False)


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, "profile"):
        instance.profile.save()


class Record(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(max_length=100)
    phone = models.CharField(max_length=15)
    address = models.CharField(max_length=100)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    zipcode = models.CharField(max_length=20)


class Contact(models.Model):
    record = models.ForeignKey(Record, related_name="contacts", on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    title = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Interaction(models.Model):
    INTERACTION_TYPES = [
        ("call", "Call"),
        ("email", "Email"),
        ("meeting", "Meeting"),
        ("other", "Other"),
    ]

    contact = models.ForeignKey(
        Contact, related_name="interactions", on_delete=models.CASCADE
    )
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    summary = models.CharField(max_length=200)
    occurred_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)


class Task(models.Model):
    STATUS_CHOICES = [
        ("todo", "To Do"),
        ("in_progress", "In Progress"),
        ("blocked", "Blocked"),
        ("done", "Done"),
    ]
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    record = models.ForeignKey(
        Record, related_name="tasks", on_delete=models.SET_NULL, null=True, blank=True
    )
    assigned_to = models.ForeignKey(
        User, related_name="tasks", on_delete=models.SET_NULL, null=True, blank=True
    )
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="todo"
    )
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default="medium"
    )
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)
