# Running PortfolioAI Locally

This guide will help you set up and run the PortfolioAI project on your local machine.

## Prerequisites

- Python 3.8+ (Python 3.13 recommended)
- Node.js 18+ and npm
- Git

## Project Structure

```
synth-canvas-port-8a1967d5-main/
├── backend/          # Django backend API
└── src/             # React frontend
```

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment (Recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** If you encounter installation errors with Pillow on Python 3.13, the requirements.txt already uses `Pillow>=10.0.0` which should automatically install a compatible version (12.0.0+).

### 4. Set Up Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```env
# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Media Files
MEDIA_ROOT=media
MEDIA_URL=/media/

# Static Files
STATIC_ROOT=staticfiles
STATIC_URL=/static/

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080

# Email Configuration (for django-allauth)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# OpenAI API (add when you have the key)
OPENAI_API_KEY=

# Google OAuth (add when you have credentials)
GOOGLE_OAUTH2_CLIENT_ID=
GOOGLE_OAUTH2_CLIENT_SECRET=

# GitHub OAuth (add when you have credentials)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_LIFETIME=24
JWT_REFRESH_TOKEN_LIFETIME=7
```

**Important:** Generate a secure `SECRET_KEY` for production. You can use:

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### 5. Run Migrations

```bash
python manage.py migrate
```

### 6. Create Superuser (Optional)

For admin access:

```bash
python manage.py createsuperuser
```

### 7. Create Site (Required for django-allauth)

**Option 1: Using Django Shell (Interactive)**

```bash
python manage.py shell
```

Then run:

```python
from django.contrib.sites.models import Site
try:
    site = Site.objects.get(pk=1)
except Site.DoesNotExist:
    site = Site.objects.create(pk=1)
site.domain = 'localhost:8000'
site.name = 'PortfolioAI'
site.save()
print(f"Site configured successfully! Domain: {site.domain}, Name: {site.name}")
exit()
```

**Option 2: Using One-Line Command**

For **Windows PowerShell:**
```powershell
python manage.py shell -c "from django.contrib.sites.models import Site; site, _ = Site.objects.get_or_create(pk=1); site.domain = 'localhost:8000'; site.name = 'PortfolioAI'; site.save(); print('Site configured successfully!')"
```

For **macOS/Linux (bash):**
```bash
python manage.py shell -c "from django.contrib.sites.models import Site; site, _ = Site.objects.get_or_create(pk=1); site.domain = 'localhost:8000'; site.name = 'PortfolioAI'; site.save(); print('Site configured successfully!')"
```

**Option 3: Using a Python Script**

Create a file `setup_site.py` in the `backend/` directory:

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolioai_backend.settings')
django.setup()

from django.contrib.sites.models import Site

site, created = Site.objects.get_or_create(pk=1)
site.domain = 'localhost:8000'
site.name = 'PortfolioAI'
site.save()

print(f"Site {'created' if created else 'updated'} successfully!")
print(f"Domain: {site.domain}")
print(f"Name: {site.name}")
```

Then run (make sure your virtual environment is activated):

**Windows PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
python setup_site.py
```

**macOS/Linux:**
```bash
source venv/bin/activate
python setup_site.py
```

**Note:** If you haven't installed dependencies yet, run `pip install -r requirements.txt` first.

### 8. Run Development Server

```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

## Frontend Setup

### 1. Navigate to Project Root

```bash
cd ..  # If you're in backend directory
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 4. Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:8080`

## Running Both Servers

You need to run both the backend and frontend servers simultaneously.

### Option 1: Two Terminal Windows

**Terminal 1 (Backend):**
```bash
cd backend
# Activate venv if using one
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

### Option 2: Background Processes

**Backend (background):**
```bash
cd backend
python manage.py runserver &
```

**Frontend:**
```bash
npm run dev
```

## Accessing the Application

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:8000/admin
- **API Documentation:** http://localhost:8000/api/docs

## Testing the Setup

1. Open http://localhost:8080 in your browser
2. Navigate to the Auth page
3. Create a new account or sign in
4. You should be redirected to the Dashboard

## API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - Register new user
- `POST /api/v1/auth/login/` - Login user
- `POST /api/v1/auth/logout/` - Logout user
- `GET /api/v1/auth/me/` - Get current user
- `POST /api/v1/auth/token/refresh/` - Refresh JWT token

### User Profile
- `GET /api/v1/users/profile/` - Get user profile
- `PUT /api/v1/users/profile/` - Update user profile

### Portfolios
- `GET /api/v1/portfolios/portfolios/` - List portfolios
- `POST /api/v1/portfolios/portfolios/` - Create portfolio
- `GET /api/v1/portfolios/portfolios/{id}/` - Get portfolio
- `PUT /api/v1/portfolios/portfolios/{id}/` - Update portfolio
- `DELETE /api/v1/portfolios/portfolios/{id}/` - Delete portfolio

### Projects
- `GET /api/v1/projects/projects/` - List projects
- `POST /api/v1/projects/projects/` - Create project
- `GET /api/v1/projects/projects/{id}/` - Get project
- `PUT /api/v1/projects/projects/{id}/` - Update project
- `DELETE /api/v1/projects/projects/{id}/` - Delete project

### Blogs
- `GET /api/v1/blogs/posts/` - List blog posts
- `POST /api/v1/blogs/posts/` - Create blog post
- `GET /api/v1/blogs/posts/{id}/` - Get blog post
- `PUT /api/v1/blogs/posts/{id}/` - Update blog post
- `DELETE /api/v1/blogs/posts/{id}/` - Delete blog post

### Resumes
- `GET /api/v1/resumes/uploads/` - List resume uploads
- `POST /api/v1/resumes/uploads/` - Upload resume
- `POST /api/v1/resumes/uploads/{id}/parse/` - Parse resume

### AI Services
- `POST /api/v1/ai/parse-resume/` - Parse resume (AI)
- `POST /api/v1/ai/generate-bio/` - Generate bio from resume
- `POST /api/v1/ai/extract-skills/` - Extract skills from resume
- `POST /api/v1/ai/generate-project-desc/` - Generate project description
- `POST /api/v1/ai/improve-text/` - Improve text with AI
- `POST /api/v1/ai/analyze-seo/` - Analyze SEO

## Troubleshooting

### Registration/API Connection Errors

**"Failed to fetch" Error:**
This usually means the frontend cannot connect to the backend. Check:

1. **Verify backend server is running:**
   ```bash
   # In backend directory
   .\venv\Scripts\Activate.ps1  # Windows
   # or
   source venv/bin/activate      # macOS/Linux
   python manage.py runserver
   ```
   You should see: `Starting development server at http://127.0.0.1:8000/`

2. **Test backend endpoint:**
   ```bash
   cd backend
   python test_api.py
   ```
   This will verify the API endpoints are configured correctly.

3. **Check frontend environment variable:**
   Ensure `.env` file in project root contains:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```
   After creating/updating `.env`, restart the frontend server.

4. **Verify CORS settings:**
   Check `backend/portfolioai_backend/settings.py` has:
   ```python
   CORS_ALLOWED_ORIGINS = [
       'http://localhost:8080',
   ]
   ```

5. **Clear browser cache and restart both servers:**
   ```bash
   # Stop both servers (Ctrl+C)
   # Restart backend
   cd backend
   python manage.py runserver
   
   # In another terminal, restart frontend
   npm run dev
   ```

### Backend Issues

**Migration Errors:**
```bash
python manage.py makemigrations
python manage.py migrate
```

**Port Already in Use:**
Change the port in `backend/portfolioai_backend/settings.py` or run:
```bash
python manage.py runserver 8001
```

**Import Errors:**
Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

**404 Errors on API Endpoints:**
1. Verify the server is running from the `backend/` directory
2. Check that migrations have been run: `python manage.py migrate`
3. Ensure `accounts` app is in `INSTALLED_APPS` in `settings.py`

### Frontend Issues

**API Connection Errors:**
- Verify `VITE_API_URL` is set correctly in `.env`
- Ensure backend server is running
- Check CORS settings in Django settings
- **If you see "Failed to connect to the server":**
  1. Check if multiple Django processes are running on port 8000:
     ```bash
     # Windows PowerShell
     netstat -ano | findstr :8000
     ```
  2. Stop all Django processes and restart:
     ```bash
     # Windows PowerShell - Stop all Python processes (be careful!)
     Get-Process python | Where-Object {$_.Path -like "*venv*"} | Stop-Process -Force
     
     # Then restart the server
     cd backend
     .\venv\Scripts\python.exe manage.py runserver 8000
     ```
  3. Verify server is responding:
     ```bash
     # Test in browser: http://localhost:8000/api/docs
     # Should show API documentation
     ```
  4. Check CORS settings in `backend/portfolioai_backend/settings.py`:
     - In DEBUG mode, `CORS_ALLOW_ALL_ORIGINS = True` should be set
     - Ensure `corsheaders.middleware.CorsMiddleware` is in MIDDLEWARE

**Build Errors:**
```bash
rm -rf node_modules
npm install
```

### Database Issues

**Reset Database (Development Only):**
```bash
rm backend/db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

## Next Steps

1. **Add API Keys:** When you receive API keys, update the `.env` file:
   - `OPENAI_API_KEY` - For AI features
   - `GOOGLE_OAUTH2_CLIENT_ID` and `GOOGLE_OAUTH2_CLIENT_SECRET` - For Google OAuth
   - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` - For GitHub OAuth

2. **Email Configuration:** Update email settings in `.env` for production email verification

3. **Database:** For production, consider using PostgreSQL instead of SQLite

## Development Tips

- Use Django admin panel (`http://localhost:8000/admin`) to manage data
- Check API documentation at `http://localhost:8000/api/docs`
- Use browser DevTools Network tab to debug API calls
- Check Django console output for backend errors
- Check browser console for frontend errors

## Production Deployment

Before deploying to production:

1. Set `DEBUG=False` in `.env`
2. Generate new `SECRET_KEY`
3. Configure proper database (PostgreSQL recommended)
4. Set up proper email backend
5. Configure CORS with production frontend URL
6. Set up static file serving (WhiteNoise or CDN)
7. Configure media file storage (AWS S3, etc.)
8. Set up SSL/HTTPS

