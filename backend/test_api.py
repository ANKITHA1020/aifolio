"""
Test script to verify backend API endpoints are working
Run this to diagnose API connection issues
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolioai_backend.settings')

# Add 'testserver' to ALLOWED_HOSTS for test client
current_hosts = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1')
if 'testserver' not in current_hosts:
    os.environ['ALLOWED_HOSTS'] = f'{current_hosts},testserver'

django.setup()

# Ensure testserver is in ALLOWED_HOSTS after setup
from django.conf import settings
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append('testserver')

from django.test import Client
from django.urls import reverse
from django.contrib.auth.models import User
import json
import time

client = Client()

print("=" * 60)
print("Testing Backend API Endpoints")
print("=" * 60)

# Test 1: Check if API endpoint exists
print("\n1. Testing registration endpoint...")
try:
    # Use unique email with timestamp to avoid duplicate user errors
    test_email = f'test_{int(time.time())}@example.com'
    
    # Try to delete test user if it exists (cleanup from previous runs)
    try:
        existing_user = User.objects.get(email='test@example.com')
        existing_user.delete()
        print("   (Cleaned up existing test user)")
    except User.DoesNotExist:
        pass
    
    response = client.post(
        '/api/v1/auth/register/',
        data=json.dumps({
            'email': test_email,
            'password': 'test123456',
            'password_confirm': 'test123456'
        }),
        content_type='application/json'
    )
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 201:
        print("   ✓ Registration endpoint is working!")
        print(f"   ✓ Created test user: {test_email}")
    elif response.status_code == 400:
        # Check if it's a validation error (expected) or something else
        try:
            response_data = json.loads(response.content.decode())
            if 'email' in response_data or 'password' in response_data:
                print("   ✓ Endpoint exists (validation error - this is expected)")
            else:
                print(f"   ⚠ Endpoint exists but returned 400: {response_data}")
        except:
            print("   ✓ Endpoint exists (returned 400 - validation error expected)")
    elif response.status_code == 404:
        print("   ✗ Endpoint not found - URL routing issue!")
        print(f"   Response: {response.content.decode()[:200]}")
    elif response.status_code == 500:
        print("   ✗ Internal Server Error - check server logs")
        print(f"   Response: {response.content.decode()[:500]}")
    else:
        print(f"   Response: {response.content.decode()[:200]}")
except Exception as e:
    print(f"   ✗ Error: {e}")
    import traceback
    print(f"   Traceback: {traceback.format_exc()[:300]}")

# Test 2: List all URL patterns
print("\n2. Available URL patterns:")
try:
    from django.urls import get_resolver
    resolver = get_resolver()
    patterns = []
    def show_urls(urllist, depth=0):
        for entry in urllist:
            if hasattr(entry, 'url_patterns'):
                show_urls(entry.url_patterns, depth + 1)
            else:
                indent = "  " * depth
                patterns.append(f"{indent}{entry.pattern}")
    
    show_urls(resolver.url_patterns)
    
    auth_patterns = [p for p in patterns if 'auth' in p or 'register' in p]
    if auth_patterns:
        print("   Auth-related patterns found:")
        for pattern in auth_patterns[:10]:
            print(f"   {pattern}")
    else:
        print("   ⚠ No auth patterns found in URL configuration")
except Exception as e:
    print(f"   ✗ Error listing URLs: {e}")

# Test 3: Check CORS middleware
print("\n3. Checking CORS configuration...")
try:
    from django.conf import settings
    if 'corsheaders' in settings.INSTALLED_APPS:
        print("   ✓ corsheaders is installed")
        print(f"   Allowed origins: {settings.CORS_ALLOWED_ORIGINS}")
    else:
        print("   ✗ corsheaders not in INSTALLED_APPS")
except Exception as e:
    print(f"   ✗ Error: {e}")

print("\n" + "=" * 60)
print("Test complete!")
print("=" * 60)

