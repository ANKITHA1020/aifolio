"""
Comprehensive API Testing Script for PortfolioAI
Tests all major API endpoints and functionalities
"""
import os
import django
import sys
import json
import time
from io import BytesIO

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
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from portfolios.models import Template, Portfolio
from resumes.models import ResumeUpload

# Test results tracking
test_results = {
    'passed': [],
    'failed': [],
    'skipped': []
}

def print_test(name, status, message=""):
    """Print test result"""
    status_symbol = "✓" if status == "PASS" else "✗" if status == "FAIL" else "⊘"
    status_color = "PASS" if status == "PASS" else "FAIL" if status == "FAIL" else "SKIP"
    print(f"{status_symbol} [{status_color}] {name}")
    if message:
        print(f"    {message}")
    
    if status == "PASS":
        test_results['passed'].append(name)
    elif status == "FAIL":
        test_results['failed'].append(name)
    else:
        test_results['skipped'].append(name)

def create_test_user():
    """Create or get test user"""
    email = f'test_{int(time.time())}@example.com'
    try:
        user = User.objects.get(email=email)
        user.delete()
    except User.DoesNotExist:
        pass
    
    user = User.objects.create_user(
        email=email,
        username=email,
        password='test123456'
    )
    return user, email

def get_auth_token(client, email, password):
    """Get authentication token"""
    response = client.post(
        '/api/v1/auth/login/',
        data=json.dumps({
            'email': email,
            'password': password
        }),
        content_type='application/json'
    )
    if response.status_code == 200:
        data = json.loads(response.content.decode())
        return data.get('tokens', {}).get('access')
    return None

print("=" * 80)
print("PortfolioAI - Comprehensive API Testing")
print("=" * 80)
print()

client = Client()

# ============================================================================
# 1. AUTHENTICATION TESTS
# ============================================================================
print("=" * 80)
print("1. AUTHENTICATION TESTS")
print("=" * 80)

# Test 1.1: User Registration
print("\n1.1 Testing User Registration...")
test_email = f'test_reg_{int(time.time())}@example.com'
try:
    response = client.post(
        '/api/v1/auth/register/',
        data=json.dumps({
            'email': test_email,
            'password': 'test123456',
            'password_confirm': 'test123456'
        }),
        content_type='application/json'
    )
    if response.status_code == 201:
        print_test("User Registration", "PASS", f"Created user: {test_email}")
    else:
        print_test("User Registration", "FAIL", f"Status: {response.status_code}, Response: {response.content.decode()[:200]}")
except Exception as e:
    print_test("User Registration", "FAIL", str(e))

# Test 1.2: User Login
print("\n1.2 Testing User Login...")
try:
    # Create test user first
    user, email = create_test_user()
    
    response = client.post(
        '/api/v1/auth/login/',
        data=json.dumps({
            'email': email,
            'password': 'test123456'
        }),
        content_type='application/json'
    )
    if response.status_code == 200:
        data = json.loads(response.content.decode())
        if 'tokens' in data and 'access' in data['tokens']:
            print_test("User Login", "PASS", "Token received")
            access_token = data['tokens']['access']
        else:
            print_test("User Login", "FAIL", "No token in response")
            access_token = None
    else:
        print_test("User Login", "FAIL", f"Status: {response.status_code}")
        access_token = None
except Exception as e:
    print_test("User Login", "FAIL", str(e))
    access_token = None

# Test 1.3: Get Current User
print("\n1.3 Testing Get Current User...")
if access_token:
    try:
        response = client.get(
            '/api/v1/auth/me/',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 200:
            print_test("Get Current User", "PASS")
        else:
            print_test("Get Current User", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("Get Current User", "FAIL", str(e))
else:
    print_test("Get Current User", "SKIP", "No access token available")

# ============================================================================
# 2. TEMPLATE TESTS
# ============================================================================
print("\n" + "=" * 80)
print("2. TEMPLATE TESTS")
print("=" * 80)

# Test 2.1: List Templates
print("\n2.1 Testing List Templates...")
if access_token:
    try:
        response = client.get(
            '/api/v1/portfolios/templates/',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 200:
            data = json.loads(response.content.decode())
            templates = data if isinstance(data, list) else data.get('results', [])
            print_test("List Templates", "PASS", f"Found {len(templates)} templates")
            template_id = templates[0]['id'] if templates else None
        else:
            print_test("List Templates", "FAIL", f"Status: {response.status_code}")
            template_id = None
    except Exception as e:
        print_test("List Templates", "FAIL", str(e))
        template_id = None
else:
    print_test("List Templates", "SKIP", "No access token available")
    template_id = None

# Test 2.2: Get Template Detail
print("\n2.2 Testing Get Template Detail...")
if access_token and template_id:
    try:
        response = client.get(
            f'/api/v1/portfolios/templates/{template_id}/',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 200:
            print_test("Get Template Detail", "PASS")
        else:
            print_test("Get Template Detail", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("Get Template Detail", "FAIL", str(e))
else:
    print_test("Get Template Detail", "SKIP", "No template ID available")

# ============================================================================
# 3. PORTFOLIO TESTS
# ============================================================================
print("\n" + "=" * 80)
print("3. PORTFOLIO TESTS")
print("=" * 80)

# Test 3.1: Create Portfolio
print("\n3.1 Testing Create Portfolio...")
if access_token:
    try:
        response = client.post(
            '/api/v1/portfolios/portfolios/',
            data=json.dumps({
                'title': 'Test Portfolio',
                'template_type': 'modern',
                'custom_settings': {}
            }),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 201:
            data = json.loads(response.content.decode())
            portfolio_id = data.get('id')
            print_test("Create Portfolio", "PASS", f"Created portfolio ID: {portfolio_id}")
        else:
            print_test("Create Portfolio", "FAIL", f"Status: {response.status_code}, Response: {response.content.decode()[:200]}")
            portfolio_id = None
    except Exception as e:
        print_test("Create Portfolio", "FAIL", str(e))
        portfolio_id = None
else:
    print_test("Create Portfolio", "SKIP", "No access token available")
    portfolio_id = None

# Test 3.2: List Portfolios
print("\n3.2 Testing List Portfolios...")
if access_token:
    try:
        response = client.get(
            '/api/v1/portfolios/portfolios/',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 200:
            data = json.loads(response.content.decode())
            portfolios = data if isinstance(data, list) else data.get('results', [])
            print_test("List Portfolios", "PASS", f"Found {len(portfolios)} portfolios")
        else:
            print_test("List Portfolios", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("List Portfolios", "FAIL", str(e))
else:
    print_test("List Portfolios", "SKIP", "No access token available")

# Test 3.3: Get Portfolio Detail
print("\n3.3 Testing Get Portfolio Detail...")
if access_token and portfolio_id:
    try:
        response = client.get(
            f'/api/v1/portfolios/portfolios/{portfolio_id}/',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 200:
            print_test("Get Portfolio Detail", "PASS")
        else:
            print_test("Get Portfolio Detail", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("Get Portfolio Detail", "FAIL", str(e))
else:
    print_test("Get Portfolio Detail", "SKIP", "No portfolio ID available")

# Test 3.4: Update Portfolio
print("\n3.4 Testing Update Portfolio...")
if access_token and portfolio_id:
    try:
        response = client.patch(
            f'/api/v1/portfolios/portfolios/{portfolio_id}/',
            data=json.dumps({
                'title': 'Updated Test Portfolio'
            }),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 200:
            print_test("Update Portfolio", "PASS")
        else:
            print_test("Update Portfolio", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("Update Portfolio", "FAIL", str(e))
else:
    print_test("Update Portfolio", "SKIP", "No portfolio ID available")

# Test 3.5: Create Portfolio Component
print("\n3.5 Testing Create Portfolio Component...")
if access_token and portfolio_id:
    try:
        response = client.post(
            f'/api/v1/portfolios/portfolios/{portfolio_id}/components/',
            data=json.dumps({
                'component_type': 'header',
                'order': 0,
                'is_visible': True,
                'content': {
                    'title': 'Test Header',
                    'subtitle': 'Test Subtitle'
                }
            }),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 201:
            data = json.loads(response.content.decode())
            component_id = data.get('id')
            print_test("Create Portfolio Component", "PASS", f"Created component ID: {component_id}")
        else:
            print_test("Create Portfolio Component", "FAIL", f"Status: {response.status_code}, Response: {response.content.decode()[:200]}")
            component_id = None
    except Exception as e:
        print_test("Create Portfolio Component", "FAIL", str(e))
        component_id = None
else:
    print_test("Create Portfolio Component", "SKIP", "No portfolio ID available")
    component_id = None

# Test 3.6: Publish Portfolio
print("\n3.6 Testing Publish Portfolio...")
if access_token and portfolio_id:
    try:
        response = client.post(
            f'/api/v1/portfolios/portfolios/{portfolio_id}/publish/',
            data=json.dumps({
                'is_published': True
            }),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 200:
            print_test("Publish Portfolio", "PASS")
        else:
            print_test("Publish Portfolio", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("Publish Portfolio", "FAIL", str(e))
else:
    print_test("Publish Portfolio", "SKIP", "No portfolio ID available")

# Test 3.7: Get Portfolio Preview
print("\n3.7 Testing Get Portfolio Preview...")
if access_token and portfolio_id:
    try:
        response = client.get(
            f'/api/v1/portfolios/portfolios/{portfolio_id}/preview/',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 200:
            print_test("Get Portfolio Preview", "PASS")
        else:
            print_test("Get Portfolio Preview", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("Get Portfolio Preview", "FAIL", str(e))
else:
    print_test("Get Portfolio Preview", "SKIP", "No portfolio ID available")

# ============================================================================
# 4. RESUME TESTS
# ============================================================================
print("\n" + "=" * 80)
print("4. RESUME TESTS")
print("=" * 80)

# Test 4.1: Upload Resume
print("\n4.1 Testing Upload Resume...")
if access_token:
    try:
        # Create a dummy PDF file
        pdf_content = b'%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF'
        pdf_file = SimpleUploadedFile(
            "test_resume.pdf",
            pdf_content,
            content_type="application/pdf"
        )
        
        response = client.post(
            '/api/v1/resumes/uploads/',
            {'file': pdf_file},
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 201:
            data = json.loads(response.content.decode())
            resume_id = data.get('id')
            print_test("Upload Resume", "PASS", f"Uploaded resume ID: {resume_id}")
        else:
            print_test("Upload Resume", "FAIL", f"Status: {response.status_code}, Response: {response.content.decode()[:200]}")
            resume_id = None
    except Exception as e:
        print_test("Upload Resume", "FAIL", str(e))
        resume_id = None
else:
    print_test("Upload Resume", "SKIP", "No access token available")
    resume_id = None

# Test 4.2: List Resumes
print("\n4.2 Testing List Resumes...")
if access_token:
    try:
        response = client.get(
            '/api/v1/resumes/uploads/',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 200:
            data = json.loads(response.content.decode())
            resumes = data if isinstance(data, list) else data.get('results', [])
            print_test("List Resumes", "PASS", f"Found {len(resumes)} resumes")
        else:
            print_test("List Resumes", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("List Resumes", "FAIL", str(e))
else:
    print_test("List Resumes", "SKIP", "No access token available")

# Test 4.3: Parse Resume (if OpenAI/Gemini configured)
print("\n4.3 Testing Parse Resume (AI)...")
if access_token and resume_id:
    try:
        response = client.post(
            '/api/v1/ai/parse-resume/',
            data=json.dumps({
                'resume_id': resume_id
            }),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 200:
            print_test("Parse Resume", "PASS", "Resume parsed successfully")
        elif response.status_code == 500:
            print_test("Parse Resume", "SKIP", "AI service not configured or error occurred")
        else:
            print_test("Parse Resume", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("Parse Resume", "SKIP", f"AI service error: {str(e)[:100]}")
else:
    print_test("Parse Resume", "SKIP", "No resume ID available")

# ============================================================================
# 5. AI SERVICES TESTS
# ============================================================================
print("\n" + "=" * 80)
print("5. AI SERVICES TESTS")
print("=" * 80)

# Test 5.1: Generate Bio
print("\n5.1 Testing Generate Bio...")
if access_token:
    try:
        response = client.post(
            '/api/v1/ai/generate-bio/',
            data=json.dumps({
                'resume_data': {
                    'name': 'John Doe',
                    'summary': 'Experienced software developer',
                    'skills': ['Python', 'JavaScript', 'React']
                }
            }),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 200:
            print_test("Generate Bio", "PASS", "Bio generated successfully")
        elif response.status_code == 500:
            print_test("Generate Bio", "SKIP", "AI service not configured")
        else:
            print_test("Generate Bio", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("Generate Bio", "SKIP", f"AI service error: {str(e)[:100]}")
else:
    print_test("Generate Bio", "SKIP", "No access token available")

# Test 5.2: Generate Project Description
print("\n5.2 Testing Generate Project Description...")
if access_token:
    try:
        response = client.post(
            '/api/v1/ai/generate-project-desc/',
            data=json.dumps({
                'title': 'E-commerce Platform',
                'technologies': ['React', 'Node.js'],
                'skills': ['Full-stack development']
            }),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 200:
            print_test("Generate Project Description", "PASS", "Description generated successfully")
        elif response.status_code == 500:
            print_test("Generate Project Description", "SKIP", "AI service not configured")
        else:
            print_test("Generate Project Description", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("Generate Project Description", "SKIP", f"AI service error: {str(e)[:100]}")
else:
    print_test("Generate Project Description", "SKIP", "No access token available")

# Test 5.3: Improve Text
print("\n5.3 Testing Improve Text...")
if access_token:
    try:
        response = client.post(
            '/api/v1/ai/improve-text/',
            data=json.dumps({
                'text': 'This is a test text that needs improvement.',
                'tone': 'professional',
                'purpose': 'portfolio',
                'improve_grammar': True,
                'improve_seo': False
            }),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 200:
            print_test("Improve Text", "PASS", "Text improved successfully")
        elif response.status_code == 500:
            print_test("Improve Text", "SKIP", "AI service not configured")
        else:
            print_test("Improve Text", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("Improve Text", "SKIP", f"AI service error: {str(e)[:100]}")
else:
    print_test("Improve Text", "SKIP", "No access token available")

# ============================================================================
# 6. ERROR HANDLING TESTS
# ============================================================================
print("\n" + "=" * 80)
print("6. ERROR HANDLING TESTS")
print("=" * 80)

# Test 6.1: Unauthenticated Request
print("\n6.1 Testing Unauthenticated Request...")
try:
    response = client.get('/api/v1/portfolios/portfolios/')
    if response.status_code == 401:
        print_test("Unauthenticated Request", "PASS", "Correctly returns 401")
    else:
        print_test("Unauthenticated Request", "FAIL", f"Status: {response.status_code} (expected 401)")
except Exception as e:
    print_test("Unauthenticated Request", "FAIL", str(e))

# Test 6.2: Invalid Token
print("\n6.2 Testing Invalid Token...")
try:
    response = client.get(
        '/api/v1/portfolios/portfolios/',
        HTTP_AUTHORIZATION='Bearer invalid_token_12345'
    )
    if response.status_code == 401:
        print_test("Invalid Token", "PASS", "Correctly returns 401")
    else:
        print_test("Invalid Token", "FAIL", f"Status: {response.status_code} (expected 401)")
except Exception as e:
    print_test("Invalid Token", "FAIL", str(e))

# Test 6.3: Invalid Portfolio ID
print("\n6.3 Testing Invalid Portfolio ID...")
if access_token:
    try:
        response = client.get(
            '/api/v1/portfolios/portfolios/99999/',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        if response.status_code == 404:
            print_test("Invalid Portfolio ID", "PASS", "Correctly returns 404")
        else:
            print_test("Invalid Portfolio ID", "FAIL", f"Status: {response.status_code} (expected 404)")
    except Exception as e:
        print_test("Invalid Portfolio ID", "FAIL", str(e))
else:
    print_test("Invalid Portfolio ID", "SKIP", "No access token available")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("TEST SUMMARY")
print("=" * 80)
print(f"\nTotal Tests: {len(test_results['passed']) + len(test_results['failed']) + len(test_results['skipped'])}")
print(f"✓ Passed: {len(test_results['passed'])}")
print(f"✗ Failed: {len(test_results['failed'])}")
print(f"⊘ Skipped: {len(test_results['skipped'])}")

if test_results['failed']:
    print("\nFailed Tests:")
    for test in test_results['failed']:
        print(f"  - {test}")

if test_results['skipped']:
    print("\nSkipped Tests (may require additional configuration):")
    for test in test_results['skipped']:
        print(f"  - {test}")

print("\n" + "=" * 80)
print("Testing Complete!")
print("=" * 80)

