from django.shortcuts import render
from .models import User, Record, Contact, Interaction, Task

# Create your views here.

from .serializers import (
    MyTOPS,
    RegistrationSerializer,
    RecordSerializer,
    ContactSerializer,
    InteractionSerializer,
    TaskSerializer,
    UserSerializer,
)
from django.shortcuts import render, get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.urls import reverse_lazy
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.db.models import Count


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTOPS


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegistrationSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protectedView(request):
    output = f"Welcome {request.user}, Authentication SUccessful"
    return Response({"response": output}, status=status.HTTP_200_OK)


@api_view(["GET"])
def view_all_routes(request):
    data = ["api/token/refresh/", "api/register/", "api/token/"]

    return Response(data)


class RecordListCreateAPIView(generics.ListCreateAPIView):
    queryset = Record.objects.all()
    serializer_class = RecordSerializer

class RecordRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Record.objects.all()
    serializer_class = RecordSerializer


class ContactListCreateAPIView(generics.ListCreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


class ContactRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


class InteractionListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = InteractionSerializer

    def get_queryset(self):
        contact_id = self.kwargs.get("contact_id")
        if contact_id is None:
            return Interaction.objects.all()
        return Interaction.objects.filter(contact_id=contact_id)

    def perform_create(self, serializer):
        contact_id = self.kwargs.get("contact_id")
        if contact_id is not None:
            serializer.save(contact_id=contact_id)
        else:
            serializer.save()


class InteractionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Interaction.objects.all()
    serializer_class = InteractionSerializer


class TaskListCreateAPIView(generics.ListCreateAPIView):
    queryset = Task.objects.all().select_related("record", "assigned_to")
    serializer_class = TaskSerializer


class TaskRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all().select_related("record", "assigned_to")
    serializer_class = TaskSerializer


class UserListAPIView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


@api_view(["GET"])
def analytics_view(request):
    totals = {
        "customers": Record.objects.count(),
        "contacts": Contact.objects.count(),
        "interactions": Interaction.objects.count(),
        "tasks": Task.objects.count(),
        "open_tasks": Task.objects.exclude(status="done").count(),
    }

    tasks_by_status = {
        row["status"]: row["count"]
        for row in Task.objects.values("status").annotate(count=Count("id"))
    }

    interactions_by_type = {
        row["interaction_type"]: row["count"]
        for row in Interaction.objects.values("interaction_type").annotate(
            count=Count("id")
        )
    }

    return Response(
        {
            "totals": totals,
            "tasks_by_status": tasks_by_status,
            "interactions_by_type": interactions_by_type,
        }
    )