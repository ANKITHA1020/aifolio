from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.shortcuts import redirect
from django.db import IntegrityError
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.providers.google.views import oauth2_login
from allauth.socialaccount.providers.github.views import oauth2_login as github_oauth2_login
import logging
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    UserProfileSerializer
)
from .models import UserProfile

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """
    Register a new user
    """
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except IntegrityError as e:
        # Handle duplicate email/username
        error_message = str(e)
        if 'email' in error_message.lower() or 'unique' in error_message.lower():
            return Response(
                {'email': ['A user with this email already exists.']}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(
            {'error': 'Email or username already exists'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        # Log the error for debugging
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'Registration failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    Login user and return JWT tokens
    """
    try:
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Optionally log the user in (for session auth compatibility)
            try:
                login(request, user)
            except Exception:
                # Session login might fail, but JWT auth still works
                pass
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        # Log the error for debugging
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'Login failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    Logout user (blacklist refresh token)
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def profile_view(request):
    """
    Get or update user profile
    Supports both JSON and multipart/form-data (for file uploads)
    """
    try:
        # Get or create profile
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            # Create profile if it doesn't exist
            profile = UserProfile.objects.create(user=request.user)
            logger.info(f"Created profile for user {request.user.email}")
        
        if request.method == 'GET':
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            # Prepare data for serializer
            # Handle both regular data and FormData
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            
            # Remove photo from data if it's in FILES (will handle separately)
            if 'photo' in request.FILES:
                data.pop('photo', None)
            
            # Validate file if provided
            if 'photo' in request.FILES:
                photo = request.FILES['photo']
                # Validate file type
                if not photo.content_type.startswith('image/'):
                    return Response(
                        {'error': 'File must be an image (JPG, PNG, or GIF)'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                # Validate file size (max 2MB)
                if photo.size > 2 * 1024 * 1024:
                    return Response(
                        {'error': 'File size must be less than 2MB'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Create serializer with data (excluding photo)
            # The serializer will handle nested user fields (first_name, last_name) automatically
            serializer = UserProfileSerializer(profile, data=data, partial=True)
            
            if serializer.is_valid():
                # Save profile fields (bio, theme_preference, etc.) and user fields (first_name, last_name)
                # The serializer's update method handles nested user fields
                serializer.save()
                
                # Handle file upload for photo (after serializer save)
                if 'photo' in request.FILES:
                    try:
                        profile.photo = request.FILES['photo']
                        profile.save()
                        logger.info(f"Updated photo for user {request.user.email}")
                    except Exception as e:
                        logger.error(f"Error saving photo: {str(e)}")
                        return Response(
                            {'error': f'Failed to save photo: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                
                # Refresh profile from database to get updated data
                profile.refresh_from_db()
                request.user.refresh_from_db()
                
                # Return updated profile data
                updated_serializer = UserProfileSerializer(profile)
                return Response(updated_serializer.data, status=status.HTTP_200_OK)
            
            # Serializer validation failed
            logger.warning(f"Profile update validation failed for user {request.user.email}: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            return Response(
                {'error': 'Method not allowed'},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
    
    except Exception as e:
        # Log the full error for debugging
        logger.error(f"Error in profile_view for user {request.user.email}: {str(e)}", exc_info=True)
        return Response(
            {'error': f'An error occurred while updating your profile: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    """
    Get current authenticated user
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def oauth_callback(request):
    """
    Handle OAuth callback and generate JWT tokens
    """
    provider = request.data.get('provider')
    access_token = request.data.get('access_token')
    
    if not provider or not access_token:
        return Response(
            {'error': 'Provider and access_token are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # For now, we'll use a simplified approach
        # In production, you'd verify the token with the provider
        # and get user info, then create/update user
        
        # This is a placeholder - actual implementation would:
        # 1. Verify token with Google/GitHub API
        # 2. Get user info (email, name, etc.)
        # 3. Create or get user
        # 4. Generate JWT tokens
        
        return Response(
            {'error': 'OAuth implementation requires provider API verification'},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def oauth_redirect(request):
    """
    Get OAuth redirect URLs for frontend
    """
    from django.conf import settings
    from urllib.parse import urlencode
    
    provider = request.GET.get('provider')
    redirect_uri = request.GET.get('redirect_uri', 'http://localhost:8080/auth/callback')
    
    if provider == 'google':
        google_client_id = settings.SOCIALACCOUNT_PROVIDERS.get('google', {}).get('APP', {}).get('client_id', '')
        if not google_client_id:
            return Response(
                {'error': 'Google OAuth not configured'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        params = {
            'client_id': google_client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'online',
        }
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
        return Response({'auth_url': auth_url})
    
    elif provider == 'github':
        github_client_id = settings.SOCIALACCOUNT_PROVIDERS.get('github', {}).get('APP', {}).get('client_id', '')
        if not github_client_id:
            return Response(
                {'error': 'GitHub OAuth not configured'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        params = {
            'client_id': github_client_id,
            'redirect_uri': redirect_uri,
            'scope': 'user:email',
        }
        auth_url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
        return Response({'auth_url': auth_url})
    
    return Response(
        {'error': 'Invalid provider'},
        status=status.HTTP_400_BAD_REQUEST
    )
