# PortfolioAI - Comprehensive Testing Guide

This guide provides detailed testing procedures for all features, functionalities, and user flows in the PortfolioAI application.

## Table of Contents

1. [Prerequisites & Setup](#prerequisites--setup)
2. [Authentication Testing](#authentication-testing)
3. [Resume Upload & Parsing Testing](#resume-upload--parsing-testing)
4. [AI Content Generation Testing](#ai-content-generation-testing)
5. [Template Selection Testing](#template-selection-testing)
6. [Portfolio Builder Testing](#portfolio-builder-testing)
7. [Portfolio Preview & Publishing Testing](#portfolio-preview--publishing-testing)
8. [Dashboard Testing](#dashboard-testing)
9. [Projects Management Testing](#projects-management-testing)
10. [Blog Management Testing](#blog-management-testing)
11. [API Endpoint Testing](#api-endpoint-testing)
12. [Error Handling & Edge Cases](#error-handling--edge-cases)
13. [Integration Testing](#integration-testing)
14. [Performance Testing](#performance-testing)
15. [Security Testing](#security-testing)

---

## Prerequisites & Setup

### Backend Setup

1. **Activate Virtual Environment**
   ```bash
   cd backend
   # Windows
   .\venv\Scripts\Activate.ps1
   # macOS/Linux
   source venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   - Create `.env` file in `backend/` directory
   - Set required variables:
     ```env
     SECRET_KEY=your-secret-key
     DEBUG=True
     OPENAI_API_KEY=your-openai-api-key
     GEMINI_API_KEY=your-gemini-api-key (optional)
     ```

4. **Run Migrations**
   ```bash
   python manage.py migrate
   ```

5. **Seed Templates**
   ```bash
   python manage.py seed_templates
   ```

6. **Start Backend Server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   - Create `.env` file in project root:
     ```env
     VITE_API_URL=http://localhost:8000/api/v1
     ```

3. **Start Frontend Server**
   ```bash
   npm run dev
   ```

### Test Data Preparation

1. **Sample Resume Files**
   - Prepare test PDF resume: `test_resume.pdf`
   - Prepare test DOCX resume: `test_resume.docx`
   - Ensure files are under 10MB

2. **Test User Accounts**
   - Create test accounts with different email domains
   - Prepare accounts for OAuth testing (if applicable)

---

## Authentication Testing

### Test Case 1: User Registration

**Steps:**
1. Navigate to `/auth`
2. Click "Sign Up" tab
3. Enter email: `testuser@example.com`
4. Enter password: `Test123456`
5. Confirm password: `Test123456`
6. Click "Create Account"

**Expected Results:**
- ✅ Success toast message appears
- ✅ User is automatically logged in
- ✅ Redirected to `/dashboard`
- ✅ JWT tokens stored in localStorage
- ✅ User email displayed on dashboard

**API Test:**
```bash
POST /api/v1/auth/register/
{
  "email": "testuser@example.com",
  "password": "Test123456",
  "password_confirm": "Test123456"
}
Expected: 201 Created
```

### Test Case 2: User Registration - Validation Errors

**Test 2.1: Invalid Email**
- Enter: `invalid-email`
- Expected: Error message "Please enter a valid email address"

**Test 2.2: Short Password**
- Enter password: `12345`
- Expected: Error message "Password must be at least 6 characters"

**Test 2.3: Password Mismatch**
- Password: `Test123456`
- Confirm: `Test1234567`
- Expected: Error message "Passwords don't match"

**Test 2.4: Duplicate Email**
- Register with existing email
- Expected: Error message "This email is already registered"

### Test Case 3: User Login

**Steps:**
1. Navigate to `/auth`
2. Click "Sign In" tab
3. Enter registered email
4. Enter password
5. Click "Sign In"

**Expected Results:**
- ✅ Success toast message
- ✅ Redirected to `/dashboard`
- ✅ JWT tokens stored
- ✅ User data loaded correctly

**API Test:**
```bash
POST /api/v1/auth/login/
{
  "email": "testuser@example.com",
  "password": "Test123456"
}
Expected: 200 OK with tokens
```

### Test Case 4: User Login - Invalid Credentials

**Test 4.1: Wrong Password**
- Enter correct email, wrong password
- Expected: Error message "Invalid credentials"

**Test 4.2: Non-existent Email**
- Enter unregistered email
- Expected: Error message "Invalid credentials"

### Test Case 5: Token Refresh

**Steps:**
1. Login successfully
2. Wait for access token to expire (or manually expire it)
3. Make API request
4. Check if token is automatically refreshed

**Expected Results:**
- ✅ Token refresh happens automatically
- ✅ Request succeeds with new token
- ✅ User remains authenticated

**API Test:**
```bash
POST /api/v1/auth/token/refresh/
{
  "refresh": "refresh_token_here"
}
Expected: 200 OK with new access token
```

### Test Case 6: User Logout

**Steps:**
1. Login successfully
2. Click "Sign Out" button
3. Check localStorage

**Expected Results:**
- ✅ Success toast message
- ✅ Tokens cleared from localStorage
- ✅ Redirected to landing page
- ✅ Cannot access protected routes

**API Test:**
```bash
POST /api/v1/auth/logout/
{
  "refresh": "refresh_token_here"
}
Expected: 200 OK
```

### Test Case 7: Protected Route Access

**Steps:**
1. Clear localStorage (remove tokens)
2. Try to access `/dashboard` directly
3. Try to access `/upload-resume` directly

**Expected Results:**
- ✅ Redirected to `/auth`
- ✅ Cannot access protected routes without authentication

---

## Resume Upload & Parsing Testing

### Test Case 8: Resume Upload - PDF

**Steps:**
1. Navigate to `/upload-resume`
2. Click upload area or drag & drop
3. Select PDF file (`test_resume.pdf`)
4. Wait for upload to complete

**Expected Results:**
- ✅ File uploads successfully
- ✅ Success toast message
- ✅ Resume appears in "Your Resumes" list
- ✅ Status shows "Pending"
- ✅ Upload date/time displayed
- ✅ File name displayed correctly

**API Test:**
```bash
POST /api/v1/resumes/uploads/
Content-Type: multipart/form-data
file: <PDF file>
Expected: 201 Created
```

### Test Case 9: Resume Upload - DOCX

**Steps:**
1. Navigate to `/upload-resume`
2. Upload DOCX file (`test_resume.docx`)

**Expected Results:**
- ✅ Same as Test Case 8
- ✅ DOCX file handled correctly

### Test Case 10: Resume Upload - Invalid File Types

**Test 10.1: Image File**
- Upload `.jpg` or `.png` file
- Expected: Error message "Invalid file type"

**Test 10.2: Text File**
- Upload `.txt` file
- Expected: Error message "Invalid file type"

**Test 10.3: Large File**
- Upload file > 10MB
- Expected: Error message "File too large"

### Test Case 11: Resume Parsing - AI Extraction

**Steps:**
1. Upload a resume (PDF or DOCX)
2. Click "Extract" button on uploaded resume
3. Wait for parsing to complete

**Expected Results:**
- ✅ Status changes to "Processing" then "Completed"
- ✅ Extracted data appears in "Extracted Information" panel
- ✅ Name, email, phone extracted correctly
- ✅ Experience entries displayed
- ✅ Education entries displayed
- ✅ Skills list displayed
- ✅ Summary/bio extracted

**API Test:**
```bash
POST /api/v1/ai/parse-resume/
{
  "resume_id": 1
}
Expected: 200 OK with structured_data
```

### Test Case 12: Resume Parsing - View Extracted Data

**Steps:**
1. After parsing, click on resume in list
2. Review extracted information

**Expected Results:**
- ✅ All fields displayed correctly
- ✅ Experience cards show: title, company, dates, description
- ✅ Skills displayed as tags
- ✅ Education entries formatted correctly
- ✅ "Use This Data to Generate Content" button visible

### Test Case 13: Resume Management

**Test 13.1: Delete Resume**
- Click delete button (trash icon)
- Confirm deletion
- Expected: Resume removed from list, success message

**Test 13.2: Multiple Resumes**
- Upload 3-5 resumes
- Expected: All displayed in list, can select any

**Test 13.3: Resume Selection**
- Click different resumes in list
- Expected: Extracted data updates for selected resume

---

## AI Content Generation Testing

### Test Case 14: Generate Bio from Resume Data

**Steps:**
1. Navigate to `/generate-content`
2. Ensure resume data is available (from upload-resume flow)
3. Click "Generate Bio" tab
4. Click "Generate Bio" button
5. Wait for generation

**Expected Results:**
- ✅ Bio generated successfully
- ✅ Bio is professional and relevant
- ✅ Bio uses information from resume
- ✅ Can copy bio to clipboard
- ✅ Can edit generated bio

**API Test:**
```bash
POST /api/v1/ai/generate-bio/
{
  "resume_data": {
    "name": "John Doe",
    "summary": "...",
    "experience": [...],
    "skills": [...]
  }
}
Expected: 200 OK with bio text
```

### Test Case 15: Generate Project Description

**Steps:**
1. Navigate to `/generate-content`
2. Click "Project Description" tab
3. Enter project title: "E-commerce Platform"
4. Enter technologies: "React, Node.js, PostgreSQL"
5. Enter skills: "Full-stack development, API design"
6. Click "Generate Description"

**Expected Results:**
- ✅ Description generated successfully
- ✅ Description includes technologies mentioned
- ✅ Description is professional
- ✅ Can copy description
- ✅ Can edit description

**API Test:**
```bash
POST /api/v1/ai/generate-project-desc/
{
  "title": "E-commerce Platform",
  "technologies": ["React", "Node.js"],
  "skills": ["Full-stack development"]
}
Expected: 200 OK with description
```

### Test Case 16: Improve Text

**Steps:**
1. Navigate to `/generate-content`
2. Click "Improve Text" tab
3. Enter text to improve
4. Select tone: "Professional"
5. Select purpose: "Portfolio"
6. Check "Improve Grammar"
7. Check "Optimize for SEO"
8. Click "Improve Text"

**Expected Results:**
- ✅ Improved text generated
- ✅ Grammar improved
- ✅ SEO optimized (if checked)
- ✅ Tone matches selection
- ✅ Can copy improved text

**API Test:**
```bash
POST /api/v1/ai/improve-text/
{
  "text": "Original text here",
  "tone": "professional",
  "purpose": "portfolio",
  "improve_grammar": true,
  "improve_seo": true
}
Expected: 200 OK with improved_text
```

### Test Case 17: AI Services - Error Handling

**Test 17.1: No Resume Data**
- Navigate to generate-content without resume data
- Expected: Message "No resume data available" with link to upload

**Test 17.2: Empty Project Title**
- Try to generate project description without title
- Expected: Error message "Please enter a project title"

**Test 17.3: Empty Text**
- Try to improve empty text
- Expected: Error message "Please enter some text to improve"

**Test 17.4: API Failure**
- Disable API key or simulate API error
- Expected: Error message with details

---

## Template Selection Testing

### Test Case 18: Browse Templates

**Steps:**
1. Navigate to `/choose-template`
2. View template cards

**Expected Results:**
- ✅ All 5 templates displayed
- ✅ Template names visible
- ✅ Template descriptions visible
- ✅ Template types visible (Classic, Modern, etc.)
- ✅ Grid view by default

**API Test:**
```bash
GET /api/v1/portfolios/templates/
Expected: 200 OK with template list
```

### Test Case 19: Filter Templates

**Steps:**
1. Navigate to `/choose-template`
2. Click filter buttons (All, Classic, Modern, etc.)

**Expected Results:**
- ✅ Templates filtered by type
- ✅ "All" shows all templates
- ✅ Each type filter shows only that type
- ✅ Active filter highlighted

### Test Case 20: View Mode Toggle

**Steps:**
1. Navigate to `/choose-template`
2. Click grid/list view toggle

**Expected Results:**
- ✅ Grid view: Cards in grid layout
- ✅ List view: Cards in list layout
- ✅ View mode persists during session

### Test Case 21: Select Template

**Steps:**
1. Navigate to `/choose-template`
2. Click on a template card
3. Click "Continue with [Template Name]"

**Expected Results:**
- ✅ Template selected (highlighted)
- ✅ Selection toast message appears
- ✅ "Continue" button appears at bottom of page
- ✅ Clicking continue navigates to `/portfolio-builder`
- ✅ Selected template passed to builder via navigation state
- ✅ Portfolio builder loads without errors
- ✅ Template information displayed in builder (template name shown)
- ✅ Portfolio initialized with selected template type

**API Test:**
```bash
GET /api/v1/portfolios/templates/{id}/
Expected: 200 OK with template details
```

### Test Case 22: Template Details

**Steps:**
1. View template card
2. Check template information

**Expected Results:**
- ✅ Template name displayed
- ✅ Template description displayed
- ✅ Template type displayed
- ✅ Preview image (if available)

### Test Case 22.1: Template Selection - Error Handling

**Test 22.1.1: Navigate to Builder Without Template**
- Navigate directly to `/portfolio-builder` without selecting template
- Expected: Portfolio builder loads with default template type ("modern")
- Expected: No errors in console
- Expected: Builder is functional

**Test 22.1.2: Continue Without Selecting Template**
- Navigate to `/choose-template`
- Try to click "Continue" without selecting a template
- Expected: Error toast message "Please select a template to continue"
- Expected: "Continue" button not visible or disabled

### Test Case 23: Template Preview

**Steps:**
1. Navigate to `/choose-template`
2. Click the preview button (eye icon) on any template card

**Expected Results:**
- ✅ Preview modal opens
- ✅ Modal displays template name and description in header
- ✅ Live preview of template with example data rendered
- ✅ Example data matches template theme:
  - Classic: Professional corporate portfolio data
  - Designer: Creative portfolio with visual projects
  - Developer: Technical portfolio with code snippets
  - Minimalist: Clean, minimal content
  - Modern: Contemporary, bold presentation
- ✅ Preview is scrollable
- ✅ Close button (X) visible in top-right
- ✅ Modal can be closed by clicking X button
- ✅ Modal can be closed by pressing Escape key
- ✅ Modal can be closed by clicking outside (overlay)

**Accessibility Tests:**
- ✅ Modal has proper ARIA labels (`aria-labelledby`, `aria-describedby`)
- ✅ Close button has `aria-label="Close preview"`
- ✅ Keyboard navigation works (Tab, Shift+Tab, Escape)
- ✅ Focus trap within modal (Tab doesn't escape modal)
- ✅ Screen reader announces modal opening
- ✅ Skip link available for accessibility

### Test Case 24: Preview Viewport Controls

**Steps:**
1. Open template preview modal
2. Click viewport control buttons (Desktop, Tablet, Mobile)

**Expected Results:**
- ✅ Three viewport buttons visible: Desktop, Tablet, Mobile
- ✅ Desktop view shows full-width preview
- ✅ Tablet view shows medium-width preview (scaled)
- ✅ Mobile view shows narrow preview (scaled)
- ✅ Active viewport button highlighted
- ✅ Preview scales appropriately for each viewport
- ✅ Content remains readable at all viewport sizes
- ✅ Keyboard navigation: Arrow keys switch viewports
- ✅ Viewport buttons have proper ARIA labels

**Viewport Size Tests:**
- ✅ Desktop: Full preview width, no scaling
- ✅ Tablet: Max-width ~768px, slight scaling
- ✅ Mobile: Max-width ~375px, more scaling
- ✅ Transitions between viewports are smooth

### Test Case 25: Preview Example Data

**Steps:**
1. Open preview for each template type
2. Verify example data matches template theme

**Expected Results for Classic Template:**
- ✅ Professional name and title (e.g., "John Anderson - Senior Business Analyst")
- ✅ Corporate-style bio text
- ✅ Business skills (Strategic Planning, Data Analysis, etc.)
- ✅ Professional projects with business descriptions
- ✅ Contact information with LinkedIn

**Expected Results for Designer Template:**
- ✅ Creative name and title (e.g., "Sarah Martinez - Creative Director")
- ✅ Design-focused bio text
- ✅ Creative skills (Brand Identity, UI/UX Design, etc.)
- ✅ Visual projects with design descriptions
- ✅ Image gallery visible
- ✅ Portfolio-style contact information

**Expected Results for Developer Template:**
- ✅ Technical name and title (e.g., "Alex Chen - Full-Stack Developer")
- ✅ Developer-focused bio text
- ✅ Technical skills (React, Node.js, Python, etc.)
- ✅ Code projects with GitHub links
- ✅ Code snippets displayed with syntax highlighting
- ✅ Technical contact (GitHub, LinkedIn)

**Expected Results for Minimalist Template:**
- ✅ Simple name and title (e.g., "Emma Wilson - Product Manager")
- ✅ Concise bio text
- ✅ Essential skills only
- ✅ Minimal project descriptions
- ✅ Simple contact information

**Expected Results for Modern Template:**
- ✅ Contemporary name and title (e.g., "Jordan Taylor - Digital Strategist")
- ✅ Modern, bold bio text
- ✅ Contemporary skills
- ✅ Modern project descriptions
- ✅ Full contact information

### Test Case 26: Preview Performance

**Steps:**
1. Open preview modal
2. Switch between different templates
3. Switch viewports multiple times

**Expected Results:**
- ✅ Modal opens quickly (< 500ms)
- ✅ Template renders without lag
- ✅ Viewport switching is smooth
- ✅ No memory leaks (open/close multiple times)
- ✅ Scroll performance is smooth
- ✅ No console errors

### Test Case 27: Preview Error Handling

**Test 27.1: Preview with Missing Template Data**
- Open preview when template data is incomplete
- Expected: Preview still renders with available data
- Expected: No errors in console

**Test 27.2: Preview Modal State Management**
- Open preview, close it, open another template
- Expected: Previous preview state cleared
- Expected: New template preview loads correctly
- Expected: Viewport resets to Desktop

---

## Portfolio Builder Testing

### Test Case 23: Create New Portfolio

**Steps:**
1. Navigate to `/portfolio-builder` (with selected template)
2. Enter portfolio title: "John Doe - Full Stack Developer"
3. Add components (Header, About, Skills, etc.)
4. Edit component content
5. Click "Save"

**Expected Results:**
- ✅ Portfolio builder page loads without errors
- ✅ No React errors in browser console
- ✅ Template information displayed (if template was selected)
- ✅ Portfolio title input field is functional
- ✅ Portfolio created successfully
- ✅ Success toast message appears
- ✅ Portfolio ID appears in URL after save
- ✅ Components saved correctly
- ✅ Can preview portfolio after saving

**API Test:**
```bash
POST /api/v1/portfolios/portfolios/
{
  "title": "John Doe - Full Stack Developer",
  "template": 1,
  "template_type": "modern",
  "custom_settings": {}
}
Expected: 201 Created
```

### Test Case 24: Add Components

**Test 24.1: Add Header Component**
- Click "Add Header" button
- Edit title and subtitle
- Expected: Header component added and editable

**Test 24.2: Add About Component**
- Click "Add About" button
- Enter bio text
- Expected: About component added with bio

**Test 24.3: Add Skills Component**
- Click "Add Skills" button
- Enter skills (comma-separated)
- Expected: Skills component added

**Test 24.4: Add Projects Component**
- Click "Add Projects" button
- Expected: Projects component added

**Test 24.5: Add Contact Component**
- Click "Add Contact" button
- Enter email and phone
- Expected: Contact component added

**API Test:**
```bash
POST /api/v1/portfolios/portfolios/{id}/components/
{
  "component_type": "header",
  "order": 0,
  "is_visible": true,
  "content": {
    "title": "John Doe",
    "subtitle": "Full Stack Developer"
  }
}
Expected: 201 Created
```

### Test Case 25: Edit Component Content

**Steps:**
1. Add a component
2. Click eye icon to edit
3. Modify content in sidebar
4. Click "Save"

**Expected Results:**
- ✅ Component editor opens in sidebar
- ✅ Content fields editable
- ✅ Changes saved on "Save"
- ✅ Component updated in list

**API Test:**
```bash
PATCH /api/v1/portfolios/portfolios/{id}/components/{component_id}/
{
  "content": {
    "title": "Updated Title"
  }
}
Expected: 200 OK
```

### Test Case 26: Reorder Components

**Steps:**
1. Add multiple components
2. Use up/down arrows to reorder
3. Save portfolio

**Expected Results:**
- ✅ Components reordered correctly
- ✅ Order numbers updated
- ✅ Up arrow disabled for first component
- ✅ Down arrow disabled for last component

### Test Case 27: Delete Component

**Steps:**
1. Add a component
2. Click delete button (trash icon)
3. Confirm deletion

**Expected Results:**
- ✅ Component removed from list
- ✅ Order numbers updated
- ✅ Changes saved

**API Test:**
```bash
DELETE /api/v1/portfolios/portfolios/{id}/components/{component_id}/
Expected: 204 No Content
```

### Test Case 28: Update Existing Portfolio

**Steps:**
1. Navigate to `/portfolio-builder?id={portfolio_id}`
2. Modify title or components
3. Click "Save"

**Expected Results:**
- ✅ Portfolio loaded correctly
- ✅ Changes saved
- ✅ Success message
- ✅ Updated data persisted

**API Test:**
```bash
PATCH /api/v1/portfolios/portfolios/{id}/
{
  "title": "Updated Title"
}
Expected: 200 OK
```

### Test Case 29: Portfolio Builder - Validation

**Test 29.1: Empty Title**
- Try to save without title
- Expected: Error message "Please enter a portfolio title"

**Test 29.2: No Components**
- Save portfolio with no components
- Expected: Portfolio saved (empty portfolio allowed)

### Test Case 29.3: Profile Photo Upload

**Steps:**
1. Navigate to `/portfolio-builder?id={portfolio_id}`
2. Scroll to Profile Photo section in sidebar
3. Click "Upload Photo" button
4. Select an image file (JPG, PNG)
5. Wait for upload to complete

**Expected Results:**
- ✅ Photo uploads successfully
- ✅ Preview shows uploaded photo
- ✅ Photo displays in portfolio preview
- ✅ Success toast message appears
- ✅ Photo appears in all template headers

**Test 29.4: Profile Photo Validation**
- Upload non-image file
- Expected: Error "File must be an image"
- Upload file > 5MB
- Expected: Error "File size must be less than 5MB"

**Test 29.5: Profile Photo Removal**
- Click "Remove" button on uploaded photo
- Expected: Photo removed, fallback to user profile photo

### Test Case 30: AI Assistant

**Steps:**
1. Navigate to `/portfolio-builder?id={portfolio_id}`
2. View AI Assistant panel in sidebar
3. Wait for suggestions to load

**Expected Results:**
- ✅ AI Assistant panel visible
- ✅ Suggestions displayed (if any)
- ✅ Priority badges shown (high/medium/low)
- ✅ "Apply" buttons work for suggestions
- ✅ Keywords suggested (if not set)
- ✅ Meta description suggested (if not set)
- ✅ Refresh button reloads suggestions

**Test 30.1: AI Content Generation**
- Click "Apply" on a suggestion to add component
- Expected: Component added or editor opened
- Click "Apply" on fill content suggestion
- Expected: Component editor opens for editing

**Test 30.2: AI Keyword Generation**
- Click "Generate" button in keywords section
- Expected: Keywords generated and populated
- Expected: Keywords are relevant to portfolio content

### Test Case 31: SEO Settings

**Steps:**
1. Navigate to `/portfolio-builder?id={portfolio_id}`
2. Scroll to SEO Settings section
3. Enter SEO title, description, keywords
4. Click "Save SEO Settings"

**Expected Results:**
- ✅ SEO title accepts 0-60 characters
- ✅ Character counter shows current length
- ✅ Meta description accepts 0-160 characters
- ✅ Keywords can be comma-separated
- ✅ "Optimize with AI" button works
- ✅ Settings saved successfully

**Test 31.1: SEO Optimization**
- Click "Optimize with AI" button
- Expected: SEO analysis performed
- Expected: Optimized meta description generated
- Expected: Optimized keywords generated
- Expected: SEO score displayed

**Test 31.2: SEO Character Limits**
- Enter title > 60 characters
- Expected: Character counter shows warning (red)
- Enter description > 160 characters
- Expected: Character counter shows warning (red)
- Enter description < 120 characters
- Expected: Character counter shows warning (yellow)

### Test Case 32: Portfolio Navigation

**Steps:**
1. Navigate to `/portfolio-preview/{id}`
2. View navigation bar (if portfolio has components)
3. Click navigation items

**Expected Results:**
- ✅ Navigation bar visible (if components exist)
- ✅ Navigation items match component types
- ✅ Clicking item scrolls to section smoothly
- ✅ Active section highlighted in navigation
- ✅ Mobile menu works (hamburger icon)
- ✅ Navigation sticky (stays visible while scrolling)

**Test 32.1: Active Section Detection**
- Scroll through portfolio
- Expected: Active section updates in navigation
- Expected: Correct section highlighted

**Test 32.2: Mobile Navigation**
- Resize window to mobile size
- Expected: Hamburger menu appears
- Click hamburger menu
- Expected: Mobile menu opens
- Click menu item
- Expected: Scrolls to section, menu closes

### Test Case 33: Empty State Handling

**Steps:**
1. Create a new portfolio with no components
2. Navigate to `/portfolio-preview/{id}`
3. View empty state

**Expected Results:**
- ✅ Empty state message displayed
- ✅ "Add Components" button visible
- ✅ "Use AI to Generate Content" button visible
- ✅ Buttons navigate to portfolio builder
- ✅ Helpful guidance message shown

**Test 33.1: Empty State with No Content**
- Portfolio with components but empty content
- Expected: Empty state still shown
- Expected: Helpful message displayed

### Test Case 34: Interactive Elements

**Test 34.1: Hover Effects**
- Hover over project cards
- Expected: Cards lift up with shadow
- Hover over skill tags
- Expected: Tags scale slightly
- Hover over buttons
- Expected: Buttons lift with shadow

**Test 34.2: Animations**
- Scroll through portfolio
- Expected: Sections fade in smoothly
- Expected: Smooth scroll behavior
- Expected: No janky animations

**Test 34.3: Profile Photo Hover**
- Hover over profile photo in header
- Expected: Photo scales slightly
- Expected: Shadow effect appears

**Test 34.4: Reduced Motion**
- Enable "prefers-reduced-motion" in browser
- Expected: Animations disabled or minimal
- Expected: Still functional without animations

---

## Portfolio Preview & Publishing Testing

### Test Case 35: Preview Portfolio

**Steps:**
1. Create/edit a portfolio
2. Click "Preview" button
3. Or navigate to `/portfolio-preview/{id}`

**Expected Results:**
- ✅ Portfolio preview loads
- ✅ All components rendered correctly
- ✅ Template styling applied
- ✅ Content displayed as entered
- ✅ Responsive layout visible

**API Test:**
```bash
GET /api/v1/portfolios/portfolios/{id}/preview/
Expected: 200 OK with portfolio data
```

### Test Case 36: Responsive Preview Views

**Test 36.1: Desktop View**
- Click desktop icon
- Expected: Full-width preview

**Test 36.2: Tablet View**
- Click tablet icon
- Expected: Medium-width preview (max-w-2xl)

**Test 36.3: Mobile View**
- Click mobile icon
- Expected: Narrow preview (max-w-sm)

### Test Case 37: Publish Portfolio

**Steps:**
1. Navigate to portfolio preview
2. Click "Publish" button
3. Wait for confirmation

**Expected Results:**
- ✅ Portfolio published successfully
- ✅ Success toast message
- ✅ "Unpublish" button appears
- ✅ Share button appears
- ✅ Portfolio slug generated
- ✅ Shareable URL displayed

**API Test:**
```bash
POST /api/v1/portfolios/portfolios/{id}/publish/
{
  "is_published": true
}
Expected: 200 OK
```

### Test Case 38: Unpublish Portfolio

**Steps:**
1. With published portfolio
2. Click "Unpublish" button

**Expected Results:**
- ✅ Portfolio unpublished
- ✅ Success message
- ✅ "Publish" button appears
- ✅ Share button hidden
- ✅ Portfolio no longer publicly accessible

### Test Case 39: Share Portfolio

**Steps:**
1. Publish a portfolio
2. Click "Share" or "Copy Link" button

**Expected Results:**
- ✅ URL copied to clipboard
- ✅ Success toast message
- ✅ URL format: `{origin}/portfolio/{slug}`
- ✅ URL is accessible (if published)

### Test Case 40: Template Rendering

**Test 40.1: Modern Template**
- Create portfolio with Modern template
- Preview
- Expected: Modern styling applied
- Expected: Profile photo displays (if uploaded)

**Test 40.2: Classic Template**
- Create portfolio with Classic template
- Preview
- Expected: Classic styling applied
- Expected: Profile photo displays (if uploaded)

**Test 40.3: Developer Template**
- Create portfolio with Developer template
- Preview
- Expected: Developer styling applied
- Expected: Profile photo displays (if uploaded)

**Test 40.4: Designer Template**
- Create portfolio with Designer template
- Preview
- Expected: Designer styling applied
- Expected: Profile photo displays (if uploaded)

**Test 40.5: Minimalist Template**
- Create portfolio with Minimalist template
- Preview
- Expected: Minimalist styling applied
- Expected: Profile photo displays (if uploaded)

---

## Dashboard Testing

### Test Case 41: Dashboard Load

**Steps:**
1. Login successfully
2. Navigate to `/dashboard`

**Expected Results:**
- ✅ Dashboard loads without errors
- ✅ User email displayed
- ✅ Welcome message shown
- ✅ Quick stats displayed
- ✅ Recent portfolios listed (if any)
- ✅ Quick actions visible

**API Test:**
```bash
GET /api/v1/auth/me/
Expected: 200 OK with user data

GET /api/v1/portfolios/portfolios/
Expected: 200 OK with portfolio list
```

### Test Case 42: Dashboard Statistics

**Steps:**
1. Create multiple portfolios (some published, some drafts)
2. View dashboard

**Expected Results:**
- ✅ "Portfolios Created" count correct
- ✅ "Published" count correct
- ✅ "Drafts" count correct
- ✅ Stats update in real-time

### Test Case 43: Recent Portfolios

**Steps:**
1. Create 5+ portfolios
2. View dashboard

**Expected Results:**
- ✅ Recent portfolios displayed (up to 6)
- ✅ Portfolio titles visible
- ✅ Template type shown
- ✅ Published status badge (if published)
- ✅ "View" and "Edit" buttons work
- ✅ Clicking portfolio navigates to preview

### Test Case 44: Quick Actions

**Test 44.1: Upload Resume**
- Click "Upload Resume" card
- Expected: Navigate to `/upload-resume`

**Test 44.2: Generate Content**
- Click "Generate Content" card
- Expected: Navigate to `/generate-content`

**Test 44.3: Choose Template**
- Click "Choose Template" card
- Expected: Navigate to `/choose-template`

**Test 44.4: Preview Portfolio**
- Click "Preview Portfolio" card
- Expected: Navigate to first portfolio preview or template selection

### Test Case 45: Getting Started Guide

**Steps:**
1. View dashboard
2. Scroll to "Getting Started" section

**Expected Results:**
- ✅ 4-step guide displayed
- ✅ Steps numbered correctly
- ✅ "Start Building Now" button works
- ✅ Button navigates to `/upload-resume`

---

## Projects Management Testing

### Test Case 46: Create Project

**Steps:**
1. Navigate to projects section (if available in UI)
2. Create new project
3. Enter title, description, technologies
4. Save

**Expected Results:**
- ✅ Project created successfully
- ✅ Project appears in list
- ✅ Can be linked to portfolio

**API Test:**
```bash
POST /api/v1/projects/projects/
{
  "title": "E-commerce Platform",
  "description": "Full description",
  "short_description": "Short desc",
  "github_url": "https://github.com/...",
  "live_url": "https://example.com"
}
Expected: 201 Created
```

### Test Case 47: List Projects

**API Test:**
```bash
GET /api/v1/projects/projects/
Expected: 200 OK with project list
```

### Test Case 48: Update Project

**API Test:**
```bash
PATCH /api/v1/projects/projects/{id}/
{
  "title": "Updated Title"
}
Expected: 200 OK
```

### Test Case 49: Delete Project

**API Test:**
```bash
DELETE /api/v1/projects/projects/{id}/
Expected: 204 No Content
```

---

## Blog Management Testing

### Test Case 50: Create Blog Post

**API Test:**
```bash
POST /api/v1/blogs/posts/
{
  "title": "My First Blog Post",
  "content": "Blog content here",
  "excerpt": "Short excerpt"
}
Expected: 201 Created
```

### Test Case 51: List Blog Posts

**API Test:**
```bash
GET /api/v1/blogs/posts/
Expected: 200 OK with blog post list
```

### Test Case 52: Update Blog Post

**API Test:**
```bash
PATCH /api/v1/blogs/posts/{id}/
{
  "title": "Updated Title"
}
Expected: 200 OK
```

### Test Case 53: Delete Blog Post

**API Test:**
```bash
DELETE /api/v1/blogs/posts/{id}/
Expected: 204 No Content
```

---

## API Endpoint Testing

### Test Case 54: API Authentication

**Test 54.1: Authenticated Request**
```bash
GET /api/v1/portfolios/portfolios/
Headers: Authorization: Bearer {access_token}
Expected: 200 OK
```

**Test 54.2: Unauthenticated Request**
```bash
GET /api/v1/portfolios/portfolios/
Expected: 401 Unauthorized
```

**Test 54.3: Invalid Token**
```bash
GET /api/v1/portfolios/portfolios/
Headers: Authorization: Bearer invalid_token
Expected: 401 Unauthorized
```

### Test Case 55: API Error Handling

**Test 55.1: 400 Bad Request**
- Send invalid data
- Expected: 400 with error details

**Test 55.2: 404 Not Found**
- Request non-existent resource
- Expected: 404 with error message

**Test 55.3: 500 Internal Server Error**
- Trigger server error
- Expected: 500 with error message

### Test Case 56: API Pagination

**Test:**
```bash
GET /api/v1/portfolios/portfolios/?page=1&page_size=10
Expected: 200 OK with paginated results
```

### Test Case 57: API Filtering

**Test:**
```bash
GET /api/v1/portfolios/templates/?type=modern
Expected: 200 OK with filtered results
```

---

## Error Handling & Edge Cases

### Test Case 58: Network Errors

**Test 58.1: Backend Offline**
- Stop backend server
- Try to make API request
- Expected: Error message "Failed to connect to the server"

**Test 58.2: Slow Network**
- Simulate slow network
- Expected: Loading indicators shown
- Expected: Request eventually completes

### Test Case 59: Invalid Data

**Test 59.1: Malformed JSON**
- Send invalid JSON in request
- Expected: 400 Bad Request

**Test 59.2: Missing Required Fields**
- Submit form without required fields
- Expected: Validation errors displayed

**Test 59.3: Invalid File Format**
- Upload invalid file type
- Expected: Error message with allowed types

**Test 59.4: Profile Photo File Validation**
- Upload non-image file as profile photo
- Expected: Error "File must be an image"
- Upload file > 5MB
- Expected: Error "File size must be less than 5MB"

### Test Case 60: Concurrent Operations

**Test 60.1: Multiple Tabs**
- Open portfolio in multiple tabs
- Edit in one tab
- Expected: Changes reflected correctly

**Test 60.2: Simultaneous Edits**
- Two users edit same portfolio (if multi-user)
- Expected: Last save wins or conflict resolution

### Test Case 61: Large Data

**Test 61.1: Large Resume File**
- Upload resume near size limit (9.9MB)
- Expected: Upload succeeds

**Test 61.2: Many Components**
- Add 20+ components to portfolio
- Expected: All components saved and displayed

**Test 61.3: Long Text Fields**
- Enter very long text in bio/description
- Expected: Text saved and displayed correctly

**Test 61.4: Large Profile Photo**
- Upload profile photo near size limit (4.9MB)
- Expected: Upload succeeds

### Test Case 62: Empty States

**Test 62.1: No Portfolios**
- New user with no portfolios
- Expected: Empty state message on dashboard

**Test 62.2: No Resumes**
- User with no uploaded resumes
- Expected: Empty state on upload page

**Test 62.3: No Components**
- Portfolio with no components
- Expected: Empty state in preview with helpful actions

---

## Integration Testing

### Test Case 63: Complete User Flow - Resume to Published Portfolio

**End-to-End Flow:**
1. Register new account
2. Upload resume
3. Parse resume with AI
4. Generate bio from resume data
5. Choose template
6. **Preview template with example data** (NEW)
7. Create portfolio with generated content
8. **Upload profile photo** (NEW)
9. **Use AI Assistant to get suggestions** (NEW)
10. **Configure SEO settings** (NEW)
11. Add components (Header, About, Skills, Projects)
12. Edit component content
13. Save portfolio
14. Preview portfolio
15. **Test navigation between sections** (NEW)
16. Publish portfolio
17. Share portfolio link

**Expected Results:**
- ✅ All steps complete successfully
- ✅ Data flows correctly between steps
- ✅ No data loss
- ✅ Portfolio is accessible via share link
- ✅ Profile photo displays correctly
- ✅ SEO settings applied

### Test Case 64: Resume Data Integration

**Steps:**
1. Upload and parse resume
2. Navigate to generate-content
3. Verify resume data is available
4. Generate bio
5. Use bio in portfolio About component

**Expected Results:**
- ✅ Resume data persists across pages
- ✅ Bio generation uses resume data
- ✅ Generated content can be used in portfolio

### Test Case 65: Template to Portfolio Integration

**Steps:**
1. Select template
2. Navigate to portfolio builder
3. Verify template is applied
4. Create portfolio
5. **Upload profile photo** (NEW)
6. Preview portfolio
7. Verify template styling
8. **Verify profile photo displays** (NEW)

**Expected Results:**
- ✅ Template selection persists
- ✅ Template applied correctly
- ✅ Styling matches template type
- ✅ Profile photo displays in header

### Test Case 66: AI Integration Flow

**Steps:**
1. Create portfolio
2. Open AI Assistant panel
3. Review suggestions
4. Apply suggestion to add component
5. Use AI to generate content for component
6. Use AI to optimize SEO
7. Save portfolio

**Expected Results:**
- ✅ AI suggestions load correctly
- ✅ Applying suggestions works
- ✅ Content generation works
- ✅ SEO optimization works
- ✅ All AI features integrated seamlessly

---

## Performance Testing

### Test Case 67: Page Load Times

**Test:**
- Measure load times for:
  - Dashboard: < 2 seconds
  - Portfolio Builder: < 2 seconds
  - Portfolio Preview: < 3 seconds
  - Resume Upload: < 1 second

### Test Case 68: API Response Times

**Test:**
- Measure API response times:
  - Authentication: < 500ms
  - Resume parsing: < 10 seconds (AI dependent)
  - Content generation: < 5 seconds (AI dependent)
  - **AI content generation: < 5 seconds** (NEW)
  - **SEO optimization: < 3 seconds** (NEW)
  - **Profile photo upload: < 2 seconds** (NEW)
  - Portfolio CRUD: < 500ms

### Test Case 69: File Upload Performance

**Test:**
- Upload files of various sizes:
  - Small (100KB): < 2 seconds
  - Medium (2MB): < 5 seconds
  - Large (9MB): < 15 seconds
  - **Profile photo (1MB): < 3 seconds** (NEW)

### Test Case 70: Concurrent Users

**Test:**
- Simulate multiple users:
  - 10 concurrent users
  - 50 concurrent users
  - Expected: System handles load gracefully

### Test Case 71: Animation Performance

**Test:**
- Scroll through portfolio with animations
- Expected: Smooth 60fps animations
- Expected: No jank or stuttering
- Expected: Animations don't block UI

---

## Security Testing

### Test Case 72: Authentication Security

**Test 72.1: Token Storage**
- Check localStorage
- Expected: Tokens stored securely
- Expected: No sensitive data in localStorage

**Test 72.2: Token Expiration**
- Wait for token expiration
- Expected: Automatic refresh or re-authentication

**Test 72.3: XSS Prevention**
- Enter script tags in text fields
- Expected: Scripts not executed

### Test Case 73: Authorization

**Test 73.1: Access Other User's Portfolio**
- Try to access portfolio with different user's ID
- Expected: 403 Forbidden or 404 Not Found

**Test 73.2: Modify Other User's Data**
- Try to update another user's portfolio
- Expected: 403 Forbidden

**Test 73.3: Upload Photo to Other User's Portfolio**
- Try to upload photo to another user's portfolio
- Expected: 403 Forbidden

### Test Case 74: Input Validation

**Test 74.1: SQL Injection**
- Enter SQL injection attempts
- Expected: Input sanitized, no SQL execution

**Test 74.2: File Upload Security**
- Try to upload executable files
- Expected: File type validation prevents upload
- Try to upload malicious image files
- Expected: File validation prevents upload

**Test 74.3: Profile Photo Validation**
- Upload non-image file as profile photo
- Expected: Validation error
- Upload oversized image
- Expected: Size validation error

### Test Case 75: CORS Configuration

**Test:**
- Make request from unauthorized origin
- Expected: CORS error or request blocked

---

## Testing Checklist

### Pre-Release Checklist

- [ ] All authentication flows tested
- [ ] Resume upload and parsing tested
- [ ] AI content generation tested
- [ ] Template selection tested
- [ ] Portfolio builder tested
- [ ] Portfolio preview and publishing tested
- [ ] Dashboard tested
- [ ] API endpoints tested
- [ ] Error handling tested
- [ ] Edge cases tested
- [ ] Integration flows tested
- [ ] Performance acceptable
- [ ] Security tested
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness tested
- [ ] Accessibility tested (keyboard navigation, screen readers)

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Device Testing

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667, 414x896)

---

## Automated Testing

### Running Backend Tests

```bash
cd backend
python manage.py test
```

### Running Specific Test Suites

```bash
# Test accounts
python manage.py test accounts

# Test portfolios
python manage.py test portfolios

# Test AI services
python manage.py test ai_services

# Test resumes
python manage.py test resumes
```

### Running Frontend Tests

```bash
# If using Jest/Vitest
npm test

# Run with coverage
npm test -- --coverage
```

### API Testing Script

```bash
cd backend
python test_api.py
```

---

## Test Data Management

### Creating Test Users

```python
# Django shell
from django.contrib.auth.models import User
user = User.objects.create_user(
    email='test@example.com',
    password='test123456'
)
```

### Creating Test Portfolios

```python
# Django shell
from portfolios.models import Portfolio, Template
from django.contrib.auth.models import User

user = User.objects.get(email='test@example.com')
template = Template.objects.first()
portfolio = Portfolio.objects.create(
    user=user,
    title='Test Portfolio',
    template=template,
    template_type='modern'
)
```

---

## Reporting Issues

When reporting bugs, include:

1. **Test Case Number** (if applicable)
2. **Steps to Reproduce**
3. **Expected Behavior**
4. **Actual Behavior**
5. **Screenshots/Logs**
6. **Browser/Device Information**
7. **Console Errors** (if any)

---

## Conclusion

This testing guide covers all major features and functionalities of PortfolioAI. Regular testing ensures:

- ✅ Features work as expected
- ✅ User experience is smooth
- ✅ Data integrity is maintained
- ✅ Security is enforced
- ✅ Performance is acceptable

**Last Updated:** [Current Date]
**Version:** 1.0.0

