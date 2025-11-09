# Quick Fix for "Failed to fetch" Error

## Immediate Steps:

### 1. Ensure Backend Server is Running

Open a terminal in the `backend/` directory and run:

**Windows:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

**macOS/Linux:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

You should see: `Starting development server at http://127.0.0.1:8000/`

### 2. Create Frontend .env File

In the project root (same level as `package.json`), create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Restart Frontend Server

After creating/updating `.env`, restart the frontend:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. Verify Both Servers Are Running

- Backend: http://localhost:8000 (should show Django welcome page or API docs)
- Frontend: http://localhost:8080 (should show PortfolioAI)

### 5. Test the Connection

Open browser DevTools (F12) → Network tab → Try registering again
- Check if request goes to `http://localhost:8000/api/v1/auth/register/`
- Look for CORS errors in Console tab

## Common Issues:

**If backend shows "port already in use":**
- Kill existing Python processes or change port:
  ```bash
  python manage.py runserver 8001
  ```
- Update `.env`: `VITE_API_URL=http://localhost:8001/api/v1`

**If still getting "Failed to fetch":**
1. Check browser console for specific error
2. Verify backend is accessible: Open http://localhost:8000/api/docs in browser
3. Check CORS in backend `settings.py` includes `http://localhost:8080`

