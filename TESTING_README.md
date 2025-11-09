# PortfolioAI Testing Documentation

This directory contains comprehensive testing documentation and tools for the PortfolioAI application.

## 📚 Documentation Files

### 1. [TESTING_GUIDE.md](./TESTING_GUIDE.md)
**Comprehensive Testing Guide** - Detailed testing procedures for all features, functionalities, and user flows.

**Contents:**
- Prerequisites & Setup
- Authentication Testing (7 test cases)
- Resume Upload & Parsing Testing (6 test cases)
- AI Content Generation Testing (4 test cases)
- Template Selection Testing (5 test cases)
- **Template Preview Testing (5 test cases)** (NEW)
- Portfolio Builder Testing (10+ test cases including Profile Photo, AI Assistant, SEO)
- Portfolio Preview & Publishing Testing (8+ test cases including Navigation, Empty State, Interactive Elements)
- Dashboard Testing (5 test cases)
- Projects & Blog Management Testing
- API Endpoint Testing
- Error Handling & Edge Cases
- Integration Testing
- Performance Testing
- Security Testing

**Use this for:**
- Complete feature testing
- Detailed test procedures
- Understanding system behavior
- Training new testers

### 2. [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)
**Quick Testing Checklist** - Rapid testing checklist for quick test cycles.

**Contents:**
- Quick reference checklist
- Critical path testing
- Quick test script (23 minutes)
- Browser compatibility checklist
- Device testing checklist

**Use this for:**
- Quick smoke tests
- Pre-release checks
- Daily testing cycles
- Regression testing

**New Features Testing:**
- **Template Preview**: Preview button, modal, viewport controls, example data, accessibility
- **Profile Photo Management**: Upload, validation, display, fallback handling
- **AI Assistant**: Suggestions panel, content generation, keyword generation, SEO optimization
- **SEO Settings**: Meta tags, character counters, AI optimization, keyword generation
- **Portfolio Navigation**: Smooth scroll, active section detection, mobile menu
- **Empty State Handling**: Detection, helpful UI, quick actions
- **Interactive Elements**: Animations, hover effects, scroll animations, reduced motion support

## 🛠️ Testing Tools

### 1. `backend/test_api.py`
**Basic API Test Script** - Simple script to verify API endpoints are working.

**Usage:**
```bash
cd backend
python test_api.py
```

**Tests:**
- Registration endpoint
- URL patterns
- CORS configuration

### 2. `backend/comprehensive_test_api.py`
**Comprehensive API Test Script** - Automated testing for all major API endpoints.

**Usage:**
```bash
cd backend
python comprehensive_test_api.py
```

**Tests:**
- Authentication (Registration, Login, Token Refresh)
- Templates (List, Detail)
- Portfolios (CRUD, Components, Publish, Preview)
- Resumes (Upload, List, Parse)
- AI Services (Generate Bio, Project Description, Improve Text)
- Error Handling (Unauthenticated, Invalid Token, Invalid IDs)

**Output:**
- Test results with pass/fail/skip status
- Summary statistics
- Failed test list
- Skipped test list (requires configuration)

## 🧪 Testing Workflows

### Quick Smoke Test (5 minutes)
1. Run `backend/test_api.py`
2. Check basic API connectivity
3. Verify authentication works

### Standard Test Cycle (30 minutes)
1. Follow [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)
2. Test critical paths
3. Verify major features
4. **Test template previews for all 5 templates** (NEW)

### Comprehensive Test (2-3 hours)
1. Follow [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. Test all features systematically
3. Document any issues found

### Automated API Testing (5 minutes)
1. Run `backend/comprehensive_test_api.py`
2. Review test results
3. Investigate any failures

## 📋 Test Categories

### Functional Testing
- ✅ All features work as expected
- ✅ User flows complete successfully
- ✅ Data persists correctly
- ✅ UI interactions work

### Integration Testing
- ✅ Components work together
- ✅ Data flows between features
- ✅ API and frontend integrated
- ✅ Database operations correct

### Error Handling
- ✅ Invalid inputs handled
- ✅ Network errors handled
- ✅ API errors displayed
- ✅ User-friendly error messages

### Performance Testing
- ✅ Page load times acceptable
- ✅ API response times acceptable
- ✅ File uploads work efficiently
- ✅ Large data handled correctly

### Security Testing
- ✅ Authentication enforced
- ✅ Authorization correct
- ✅ Input validation works
- ✅ XSS/SQL injection prevented

### Browser Compatibility
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Responsive Design
- ✅ Desktop (1920x1080)
- ✅ Laptop (1366x768)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667, 414x896)

## 🚀 Getting Started

### For New Testers

1. **Read the Overview**
   - Review this README
   - Understand project structure
   - Check prerequisites

2. **Set Up Environment**
   - Follow setup instructions in TESTING_GUIDE.md
   - Configure test accounts
   - Prepare test data

3. **Start with Quick Tests**
   - Run `backend/test_api.py`
   - Follow TESTING_CHECKLIST.md
   - Get familiar with the application

4. **Progress to Comprehensive Testing**
   - Follow TESTING_GUIDE.md systematically
   - Document findings
   - Report issues

### For Developers

1. **Before Committing**
   - Run `backend/comprehensive_test_api.py`
   - Fix any failing tests
   - Verify critical paths

2. **Before Release**
   - Complete TESTING_CHECKLIST.md
   - Test all critical features
   - Verify error handling

3. **After Major Changes**
   - Run full test suite
   - Test affected features
   - Verify integration

## 📊 Test Results Tracking

### Test Status
- ✅ **PASS** - Test passed successfully
- ✗ **FAIL** - Test failed, needs investigation
- ⊘ **SKIP** - Test skipped (requires configuration or not applicable)

### Reporting Issues

When reporting test failures, include:

1. **Test Case Number** (from TESTING_GUIDE.md)
2. **Steps to Reproduce**
3. **Expected Behavior**
4. **Actual Behavior**
5. **Screenshots/Logs**
6. **Environment Details**
   - Browser and version
   - OS and version
   - Backend version
   - Frontend version

## 🔧 Configuration

### Required Environment Variables

**Backend (.env):**
```env
SECRET_KEY=your-secret-key
DEBUG=True
OPENAI_API_KEY=your-openai-key (for AI features)
GEMINI_API_KEY=your-gemini-key (optional, for AI features)
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Test Data

- Sample resume files (PDF, DOCX)
- Test user accounts
- Sample portfolio data

## 📝 Best Practices

1. **Test Systematically**
   - Follow test cases in order
   - Don't skip steps
   - Document findings

2. **Test Edge Cases**
   - Empty states
   - Large data
   - Invalid inputs
   - Network errors

3. **Verify Data Integrity**
   - Data persists correctly
   - No data loss
   - Relationships maintained

4. **Check User Experience**
   - Loading states
   - Error messages
   - Success feedback
   - Navigation flows

5. **Test Across Browsers**
   - Different browsers
   - Different devices
   - Different screen sizes

## 🎯 Testing Priorities

### Critical (Must Test Before Release)
- ✅ User authentication
- ✅ Resume upload and parsing
- ✅ **Template preview functionality** (NEW)
- ✅ Portfolio creation
- ✅ **Profile photo upload and display** (NEW)
- ✅ **AI Assistant functionality** (NEW)
- ✅ Portfolio preview
- ✅ **Portfolio navigation** (NEW)
- ✅ Portfolio publishing

### High Priority
- ✅ AI content generation
- ✅ Template selection
- ✅ **Template preview with example data** (NEW)
- ✅ **SEO optimization and settings** (NEW)
- ✅ **AI-powered content suggestions** (NEW)
- ✅ Component management
- ✅ Dashboard functionality
- ✅ **Interactive elements and animations** (NEW)

### Medium Priority
- ✅ Projects management
- ✅ Blog management
- ✅ Analytics
- ✅ Export functionality

## 📞 Support

For questions or issues with testing:

1. Check documentation first
2. Review test scripts
3. Check existing issues
4. Contact development team

---

## 🆕 Version 2.0 Features

### New Testing Areas

**Profile Photo Management:**
- Upload, validation, display, fallback handling
- Test Cases: 29.3-29.5 in TESTING_GUIDE.md

**AI Assistant:**
- Suggestions panel, content generation, keyword generation
- Test Cases: 30-30.2 in TESTING_GUIDE.md

**SEO Optimization:**
- Meta tags, character counters, AI optimization
- Test Cases: 31-31.2 in TESTING_GUIDE.md

**Portfolio Navigation:**
- Smooth scroll, active section detection, mobile menu
- Test Cases: 32-32.2 in TESTING_GUIDE.md

**Empty State Handling:**
- Detection, helpful UI, quick actions
- Test Cases: 33-33.1 in TESTING_GUIDE.md

**Interactive Elements:**
- Animations, hover effects, scroll animations
- Test Cases: 34-34.4 in TESTING_GUIDE.md

---

**Last Updated:** [Current Date]
**Version:** 2.0.0

