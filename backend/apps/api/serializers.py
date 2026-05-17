from rest_framework_simplejwt.tokens import Token
from .models import User, Record, Contact, Interaction, Task
from apps.accounts.models import Role
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "full_name", "role", "permissions"]

    def get_role(self, obj):
        return obj.role.slug if obj.role else None

    def get_full_name(self, obj):
        profile = getattr(obj, "profile", None)
        return getattr(profile, "full_name", "") or obj.get_full_name() or obj.username

    def get_permissions(self, obj):
        return obj.role.permissions if obj.role else []


class MyTOPS(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        profile = getattr(user, "profile", None)
        token["full_name"] = getattr(profile, "full_name", "") or user.username
        token["username"] = user.username
        token["email"] = user.email
        token["bio"] = getattr(profile, "bio", "")
        token["role"] = user.role.slug if user.role else None
        token["permissions"] = user.role.permissions if user.role else []

        return token


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    full_name = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["full_name", "email", "username", "password", "password2"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password": "Password Fields Didn't Match"}
            )
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data["username"], email=validated_data["email"]
        )
        user.set_password(validated_data["password"])

        role, _ = Role.objects.get_or_create(
            slug="sales-executive", defaults={"name": "Sales Executive"}
        )
        user.role = role

        user.save()

        if "full_name" in validated_data:
            user.profile.full_name = validated_data["full_name"]
            user.profile.save()

        return user


class RecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Record
        fields = '__all__'


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = "__all__"


class InteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interaction
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"
