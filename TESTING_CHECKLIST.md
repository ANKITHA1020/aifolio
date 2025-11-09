# PortfolioAI - Quick Testing Checklist

Quick reference checklist for testing all features. Use this for rapid testing cycles.

## ✅ Authentication

- [1] Register new user with valid email/password
- [ ] Register with invalid email (should fail)
- [ ] Register with short password (should fail)
- [ ] Register with mismatched passwords (should fail)
- [ ] Register with duplicate email (should fail)
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Logout successfully
- [ ] Token refresh works automatically
- [ ] Protected routes redirect to auth when not logged in

## ✅ Resume Upload & Parsing

- [ ] Upload PDF resume successfully
- [ ] Upload DOCX resume successfully
- [ ] Upload invalid file type (should fail)
- [ ] Upload large file > 10MB (should fail)
- [ ] Parse resume with AI extraction
- [ ] View extracted data (name, email, phone, experience, education, skills)
- [ ] Delete resume
- [ ] Multiple resumes can be uploaded
- [ ] Select different resumes to view their data

## ✅ AI Content Generation

- [ ] Generate bio from resume data
- [ ] Generate bio without resume data (should show error)
- [ ] Generate project description with title/technologies
- [ ] Generate project description without title (should fail)
- [ ] Improve text with grammar correction
- [ ] Improve text with SEO optimization
- [ ] Improve text with different tones (professional, casual, formal, friendly)
- [ ] Copy generated content to clipboard
- [ ] Edit generated content

## ✅ Template Selection

- [ ] View all templates in grid view
- [ ] View all templates in list view
- [ ] Filter templates by type (All, Classic, Modern, etc.)
- [ ] **Preview button (eye icon) visible on template cards** (NEW)
- [ ] **Click preview button opens preview modal** (NEW)
- [ ] **Preview modal displays template name and description** (NEW)
- [ ] **Live preview renders with example data** (NEW)
- [ ] **Example data matches template theme** (NEW)
  - [ ] Classic: Professional corporate data
  - [ ] Designer: Creative portfolio with visuals
  - [ ] Developer: Technical with code snippets
  - [ ] Minimalist: Clean, minimal content
  - [ ] Modern: Contemporary, bold presentation
- [ ] **Viewport controls work (Desktop, Tablet, Mobile)** (NEW)
- [ ] **Preview is scrollable** (NEW)
- [ ] **Close button (X) closes preview** (NEW)
- [ ] **Escape key closes preview** (NEW)
- [ ] **Keyboard navigation works in preview** (NEW)
- [ ] **ARIA labels present for accessibility** (NEW)
- [ ] Select a template
- [ ] Continue to portfolio builder with selected template
- [ ] Template information displays correctly

## ✅ Portfolio Builder

- [ ] Create new portfolio with title
- [ ] Create portfolio without title (should fail)
- [ ] Add Header component
- [ ] Add About component
- [ ] Add Skills component
- [ ] Add Projects component
- [ ] Add Contact component
- [ ] Edit component content
- [ ] Reorder components (up/down arrows)
- [ ] Delete component
- [ ] Save portfolio
- [ ] Update existing portfolio
- [ ] Preview button works (requires saved portfolio)
- [ ] **Profile Photo Upload section visible** (NEW)
- [ ] **Upload profile photo successfully** (NEW)
- [ ] **Profile photo displays in preview** (NEW)
- [ ] **AI Assistant panel visible** (NEW)
- [ ] **AI suggestions load and display** (NEW)
- [ ] **Apply AI suggestions works** (NEW)
- [ ] **SEO Settings section visible** (NEW)
- [ ] **Enter SEO title, description, keywords** (NEW)
- [ ] **Generate keywords with AI** (NEW)
- [ ] **Optimize SEO with AI** (NEW)
- [ ] **Save SEO settings** (NEW)

## ✅ Portfolio Preview & Publishing

- [ ] Preview portfolio loads correctly
- [ ] All components render in preview
- [ ] Switch between desktop/tablet/mobile views
- [ ] Publish portfolio
- [ ] Unpublish portfolio
- [ ] Share button appears when published
- [ ] Copy share link to clipboard
- [ ] Share link format is correct
- [ ] Template styling applied correctly (Modern, Classic, Developer, Designer, Minimalist)
- [ ] **Profile photo displays in portfolio header** (NEW)
- [ ] **Navigation bar visible (if components exist)** (NEW)
- [ ] **Navigation items scroll to sections** (NEW)
- [ ] **Active section highlighted in navigation** (NEW)
- [ ] **Mobile navigation menu works** (NEW)
- [ ] **Empty state shows when portfolio is empty** (NEW)
- [ ] **Empty state buttons navigate correctly** (NEW)
- [ ] **Hover effects work on cards and buttons** (NEW)
- [ ] **Smooth animations on scroll** (NEW)

## ✅ Dashboard

- [ ] Dashboard loads after login
- [ ] User email displayed
- [ ] Portfolio statistics correct (Total, Published, Drafts)
- [ ] Recent portfolios displayed (if any)
- [ ] Empty state shown when no portfolios
- [ ] Quick action cards work:
  - [ ] Upload Resume
  - [ ] Generate Content
  - [ ] Choose Template
  - [ ] Preview Portfolio
- [ ] Click portfolio card navigates to preview
- [ ] "Start Building Now" button works

## ✅ Error Handling

- [ ] Network error shows user-friendly message
- [ ] Backend offline shows connection error
- [ ] Invalid API response handled gracefully
- [ ] Form validation errors displayed
- [ ] File upload errors displayed
- [ ] AI service errors displayed
- [ ] 404 errors handled
- [ ] 401 errors redirect to auth

## ✅ Edge Cases

- [ ] Empty portfolio (no components)
- [ ] Portfolio with many components (20+)
- [ ] Very long text in bio/description
- [ ] Special characters in text fields
- [ ] Multiple tabs open simultaneously
- [ ] Browser back/forward navigation
- [ ] Page refresh maintains state (where applicable)

## ✅ Responsive Design

- [ ] Desktop view (1920x1080)
- [ ] Laptop view (1366x768)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)
- [ ] All features work on mobile
- [ ] Touch interactions work on mobile

## ✅ Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## ✅ Performance

- [ ] Dashboard loads < 2 seconds
- [ ] Portfolio builder loads < 2 seconds
- [ ] Resume upload < 5 seconds (for 2MB file)
- [ ] Resume parsing < 10 seconds
- [ ] Content generation < 5 seconds
- [ ] Portfolio preview loads < 3 seconds

## ✅ Security

- [ ] Cannot access other user's portfolios
- [ ] Cannot modify other user's data
- [ ] Tokens stored securely
- [ ] XSS attempts blocked
- [ ] SQL injection attempts blocked
- [ ] File upload validation works

## ✅ Integration Flows

- [ ] Complete flow: Register → Upload Resume → Parse → Generate Content → Choose Template → Build Portfolio → Publish
- [ ] Resume data flows to content generation
- [ ] Generated content can be used in portfolio
- [ ] Template selection flows to portfolio builder
- [ ] Portfolio components render in preview

---

## Quick Test Script

Run this for a complete smoke test:

1. **Register & Login** (2 min)
   - Register new user
   - Login with credentials

2. **Resume Flow** (5 min)
   - Upload resume
   - Parse resume
   - View extracted data

3. **Content Generation** (3 min)
   - Generate bio
   - Generate project description
   - Improve text

4. **Portfolio Creation** (15 min)
   - Choose template
   - **Preview templates with example data** (NEW - 2 min)
   - Create portfolio
   - **Upload profile photo** (NEW - 1 min)
   - **Use AI Assistant to get suggestions** (NEW - 1 min)
   - **Configure SEO settings** (NEW - 1 min)
   - Add 3-4 components
   - Edit component content
   - Save portfolio

5. **Preview & Publish** (5 min)
   - Preview portfolio
   - **Test navigation between sections** (NEW - 1 min)
   - **Verify profile photo displays** (NEW)
   - **Test interactive elements (hover, animations)** (NEW - 1 min)
   - Test responsive views
   - Publish portfolio
   - Share link

**Total Time: ~30 minutes**

---

## Critical Path Testing

For urgent releases, test only these critical paths:

1. ✅ User can register and login
2. ✅ User can upload and parse resume
3. ✅ User can create portfolio
4. ✅ User can preview portfolio
5. ✅ User can publish portfolio

---

## New Features Checklist (v2.0)

### Profile Photo Management
- [ ] Upload profile photo in portfolio builder
- [ ] Photo displays in all template headers
- [ ] Fallback to user profile photo works
- [ ] Photo removal works
- [ ] Photo validation (file type, size) works

### AI Assistant
- [ ] AI Assistant panel visible in portfolio builder
- [ ] Suggestions load and display
- [ ] Apply suggestions works
- [ ] Keyword generation works
- [ ] Meta description generation works

### SEO Settings
- [ ] SEO Settings section visible
- [ ] Enter and save SEO title, description, keywords
- [ ] Character counters work correctly
- [ ] AI optimization works
- [ ] Keywords generation works

### Portfolio Navigation
- [ ] Navigation bar visible in preview
- [ ] Navigation items scroll to sections
- [ ] Active section highlighted
- [ ] Mobile menu works

### Empty State
- [ ] Empty state shows when portfolio is empty
- [ ] Empty state buttons work
- [ ] Helpful guidance displayed

### Interactive Elements
- [ ] Hover effects work
- [ ] Animations smooth
- [ ] Reduced motion respected

---

**Last Updated:** [Current Date]
**Version:** 2.0.0

