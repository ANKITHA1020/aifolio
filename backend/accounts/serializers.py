from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model
    """
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'email', 'first_name', 'last_name', 'bio', 'photo',
            'theme_preference', 'role', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'role']
    
    def update(self, instance, validated_data):
        """
        Update UserProfile and related User fields
        """
        # Extract user-related fields
        user_data = validated_data.pop('user', {})
        
        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update user fields if provided
        if user_data:
            user = instance.user
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            user.save()
        
        return instance


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    bio = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name', 'bio']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs
    
    def create(self, validated_data):
        password_confirm = validated_data.pop('password_confirm')
        password = validated_data.pop('password')  # Extract password before creating user
        bio = validated_data.pop('bio', '')
        validated_data['username'] = validated_data['email']  # Use email as username
        
        # Create user with password properly
        user = User.objects.create_user(
            password=password,  # Pass password as separate argument
            **validated_data
        )
        
        # Wait for signal to create profile, or create if missing
        # The signal should create it, but we handle the case where it doesn't
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            # If profile doesn't exist, create it
            profile = UserProfile.objects.create(user=user)
        
        # Update profile bio if provided
        if bio:
            profile.bio = bio
            profile.save()
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Django uses username field for authentication
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError({'non_field_errors': ['Invalid email or password']})
            
            user = authenticate(username=user.username, password=password)
            if not user:
                raise serializers.ValidationError({'non_field_errors': ['Invalid email or password']})
            
            if not user.is_active:
                raise serializers.ValidationError({'non_field_errors': ['User account is disabled']})
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError({'non_field_errors': ['Must include "email" and "password"']})


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model with profile
    """
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'profile', 'date_joined']
        read_only_fields = ['id', 'date_joined']

