# CraftSphere Frontend Generation - Complete Guide
**Version:** 1.0  
**Purpose:** Guide for using AI tools (Bolt/Lovable) to generate production-ready frontend  
**Last Updated:** January 25, 2026

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Files to Use](#files-to-use)
3. [Step-by-Step Instructions](#step-by-step-instructions)
4. [Prompt Components Breakdown](#prompt-components-breakdown)
5. [Tech Stack Summary](#tech-stack-summary)
6. [Expected Output](#expected-output)
7. [Quality Checklist](#quality-checklist)
8. [Post-Generation Steps](#post-generation-steps)

---

## 🚀 Quick Start

### For Bolt.new:
1. Visit https://bolt.new
2. Create new project
3. Paste the complete prompt from `BOLT_LOVABLE_PROMPT.md`
4. Attach these files:
   - `API_ENDPOINTS_BREAKDOWN.md`
   - `FRONTEND_INTEGRATION_GUIDE.md`
5. Click "Generate"
6. Review and iterate

### For Lovable.dev:
1. Visit https://lovable.dev
2. Click "Build"
3. Enter project name "CraftSphere"
4. Paste the complete prompt from `BOLT_LOVABLE_PROMPT.md`
5. Attach reference files (same as above)
6. Click "Create"
7. Review and customize

---

## 📁 Files to Use

### Primary Files (From Project Root):

```
CreateSphere/
├── BOLT_LOVABLE_PROMPT.md ← MAIN PROMPT (copy entire content)
├── API_ENDPOINTS_BREAKDOWN.md ← API reference for AI
├── FRONTEND_INTEGRATION_GUIDE.md ← Feature requirements
├── BACKEND_DOCUMENTATION.md ← Additional context (optional)
└── backend/ ← Can reference route files if needed
```

### How to Prepare Files:

**Option 1: Copy-Paste (Recommended)**
1. Open `BOLT_LOVABLE_PROMPT.md`
2. Copy everything between the markdown code blocks
3. Paste into Bolt/Lovable text area
4. Separately attach the reference files

**Option 2: Attach as Files**
1. Use "Attach files" button in Bolt/Lovable
2. Upload all three reference documents
3. In prompt, reference them like: "See attached API_ENDPOINTS_BREAKDOWN.md for endpoints"

---

## 📝 Step-by-Step Instructions

### Step 1: Prepare Your Environment

```bash
# Make sure you have these installed globally:
- Node.js 18+
- npm or yarn

# Note: Bolt/Lovable will generate the project, 
# but you'll need Node locally to run it afterward
```

### Step 2: Use the Prompt with Bolt/Lovable

**In Bolt.new:**
```
1. Click "Create" button
2. Choose "Next.js" template
3. In the chat, paste the entire BOLT_LOVABLE_PROMPT.md content
4. Wait for it to generate the project structure
5. Review the generated code in the editor
```

**In Lovable.dev:**
```
1. Click "Build"
2. Enter project details
3. In instructions/prompt field, paste the complete prompt
4. Select "Next.js 14" as framework
5. Click "Create Project"
6. Wait for generation to complete
```

### Step 3: Reference Files for Context

Add these references to your prompt message:

```
Also, here are detailed API documentation and implementation guides 
for reference. They are attached:

1. API_ENDPOINTS_BREAKDOWN.md - Lists all 77 API endpoints with:
   - HTTP methods (GET, POST, PUT, DELETE)
   - Full URLs
   - Required headers and authentication
   - Request/response examples with Axios
   - Parameter details and constraints

2. FRONTEND_INTEGRATION_GUIDE.md - Describes all UI features:
   - Step-by-step workflows for each feature
   - Required API endpoints for each feature
   - State management requirements
   - Error handling patterns
   - Validation rules

3. BACKEND_DOCUMENTATION.md (optional) - Overall architecture context:
   - Technology stack
   - Database models
   - Middleware details
   - Error handling approach

Use these as your reference for exact API integration details.
```

### Step 4: Wait for Generation

- Bolt typically takes 2-5 minutes to generate a complete project
- Lovable may take slightly longer
- The AI will build:
  - File structure
  - All pages and components
  - All forms and validation
  - Axios setup and interceptors
  - Zustand stores
  - shadcn/ui components
  - Tailwind CSS styling
  - Framer Motion animations

### Step 5: Review Generated Code

After generation, review:

- ✅ Project structure (proper Next.js App Router organization)
- ✅ All required pages exist
- ✅ All components are built
- ✅ Axios instance configured with interceptors
- ✅ Zustand stores created
- ✅ Zod schemas defined
- ✅ Forms using React Hook Form
- ✅ shadcn/ui components installed and used
- ✅ Tailwind CSS configured
- ✅ Framer Motion animations present
- ✅ Dark mode support
- ✅ TypeScript types defined

### Step 6: Export and Set Up Locally

**From Bolt.new:**
1. Click "Export" button
2. Choose "Download as ZIP"
3. Extract the ZIP file locally
4. Run `npm install`
5. Create `.env.local` with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   ```
6. Run `npm run dev`

**From Lovable.dev:**
1. Click "Export" or "Copy to Clipboard"
2. Create new directory locally
3. Initialize git: `git init`
4. Paste code into project
5. Run `npm install`
6. Create `.env.local` with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   ```
7. Run `npm run dev`

---

## 🔍 Prompt Components Breakdown

### 1. Project Overview Section
- **What it does:** Explains what CraftSphere is
- **Why it's important:** Gives AI context about the application's purpose
- **Content:** Features, user types, core functionality

### 2. Tech Stack Requirements
- **Specifies:** Framework, libraries, and tools to use
- **Ensures:** AI uses exact tech stack needed (Next.js, Axios, shadcn/ui, etc.)
- **Prevents:** AI from suggesting alternative technologies

### 3. Design Requirements
- **Sets:** Visual direction (Vercel/shadcn inspiration)
- **Includes:** Color schemes, animations, responsive design
- **Ensures:** Professional, modern appearance

### 4. Backend API Configuration
- **Defines:** Base URL, authentication method
- **Specifies:** Token handling and axios interceptors
- **Critical for:** Proper API integration

### 5. Core Modules Section
Each module describes:
- What pages/features are needed
- What functionality each page requires
- API endpoints each feature uses
- User interactions expected

**Modules included:**
1. Landing Page
2. Authentication
3. User Module
4. Creator Module
5. Product Module
6. Tutorial Module
7. Category Module
8. Review & Rating Module
9. Report Module
10. Chat Module
11. Chatbot Module
12. Admin Dashboard

### 6. Authentication & Authorization
- **Defines:** Which routes are protected
- **Specifies:** Role-based access (user/creator/admin)
- **Ensures:** Proper security implementation

### 7. State Management Details
- **Specifies:** Zustand stores needed
- **Defines:** What state each store manages
- **Includes:** Methods to update state

### 8. Form Components & Validation
- **Lists:** All forms needed in the app
- **Defines:** Zod schemas for validation
- **Ensures:** Consistent validation across app

### 9. UI Components (shadcn/ui)
- **Lists:** Specific shadcn components to use
- **Ensures:** Professional, accessible UI
- **Prevents:** Building UI from scratch

### 10. Animations (Framer Motion)
- **Specifies:** Where animations should be
- **Includes:** Page transitions, hover effects, message animations
- **Ensures:** Smooth, professional feel

### 11. Axios Setup & Interceptors
- **Critical section:** Defines API integration
- **Specifies:** Request/response interceptors
- **Includes:** Error handling strategy

### 12. File Structure
- **Shows:** Exact directory organization
- **Ensures:** Clean, maintainable code structure
- **Follows:** Next.js best practices

### 13. Feature Specifications
- **Details:** Each feature in depth
- **Includes:** UI layout, interactions, data flow
- **Covers:** Landing page, forms, dashboards, etc.

### 14. API Endpoints Reference
- **Lists:** All 77 endpoints briefly
- **Ensures:** AI knows what's available
- **Helps:** With proper endpoint integration

### 15. Deliverables Section
- **Specifies:** What should be completed
- **Sets:** Quality expectations
- **Includes:** Performance and accessibility requirements

---

## 🛠️ Tech Stack Summary

| Technology | Purpose | Usage |
|------------|---------|-------|
| **Next.js 14** | Framework | App Router, SSR, API routes |
| **React 18** | UI Library | Components, hooks |
| **Axios** | HTTP Client | API calls with interceptors |
| **shadcn/ui** | UI Components | Buttons, forms, dialogs, etc. |
| **Tailwind CSS** | Styling | Utility-first CSS framework |
| **Zustand** | State Management | Global state (auth, user, chat) |
| **React Hook Form** | Form Management | Form state and validation |
| **Zod** | Validation | Schema validation for forms |
| **Framer Motion** | Animations | Page transitions, component animations |
| **TypeScript** | Language | Type safety throughout app |

---

## 📤 Expected Output

When Bolt/Lovable completes generation, you'll have:

### File Structure:
```
src/
├── app/                    # All pages and routes
├── components/             # Reusable components
├── lib/                    # Utilities and config
├── store/                  # Zustand stores
├── schemas/                # Zod validation schemas
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript types
└── styles/                 # Global CSS
```

### Features Implemented:
- ✅ Complete landing page with hero, features, testimonials
- ✅ Full authentication flow (signup, login, email verification)
- ✅ User dashboard and profile management
- ✅ Creator onboarding (2-step wizard)
- ✅ Creator dashboard with product/tutorial management
- ✅ Product marketplace with search and filtering
- ✅ Tutorial explore page
- ✅ Creator profiles and follow system
- ✅ Product/Tutorial detail pages with reviews
- ✅ Chatbot interface with image analysis
- ✅ Chat/messaging functionality
- ✅ Admin panel with creator verification and moderation
- ✅ Responsive design on all devices
- ✅ Dark mode support
- ✅ Smooth animations with Framer Motion
- ✅ Form validation with Zod
- ✅ API integration with error handling
- ✅ Toast notifications
- ✅ Loading states and skeletons
- ✅ Error boundaries

---

## ✅ Quality Checklist

### After Generation, Verify:

**Project Setup:**
- [ ] `.env.local` configured with `NEXT_PUBLIC_API_URL=http://localhost:5001/api`
- [ ] All dependencies installed (`npm install` successful)
- [ ] Project runs without errors (`npm run dev` works)
- [ ] No console warnings on startup

**Authentication:**
- [ ] Sign up form works and validates
- [ ] Login form works correctly
- [ ] Email verification flow works
- [ ] Forgot password and reset password work
- [ ] Tokens stored in localStorage
- [ ] Axios automatically adds Authorization header
- [ ] 401 errors redirect to login

**Pages & Routes:**
- [ ] Landing page loads and looks good
- [ ] All protected routes redirect to login when not authenticated
- [ ] Role-based access works (creator/admin routes)
- [ ] Page transitions are smooth with animations

**API Integration:**
- [ ] GET requests fetch data correctly
- [ ] POST requests submit data correctly
- [ ] PUT requests update data correctly
- [ ] DELETE requests remove data correctly
- [ ] Error messages display properly
- [ ] Loading states show during API calls
- [ ] Pagination works on list pages

**Forms & Validation:**
- [ ] All forms validate inputs correctly
- [ ] Error messages display for invalid inputs
- [ ] Forms submit data to correct endpoints
- [ ] Form data is formatted correctly for API

**UI & Design:**
- [ ] Layout is clean and professional
- [ ] Colors are consistent throughout
- [ ] Typography is readable
- [ ] Spacing is consistent
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Dark mode works on all pages
- [ ] Images load correctly

**Animations:**
- [ ] Page transitions are smooth
- [ ] Component animations are not jarring
- [ ] Framer Motion is used appropriately
- [ ] Performance is good (no stuttering)

**State Management:**
- [ ] User data persists across page navigation
- [ ] Zustand stores work correctly
- [ ] Logout clears state properly

**Features:**
- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] Pagination navigates properly
- [ ] Chat sends and receives messages
- [ ] Reviews can be created, edited, deleted
- [ ] Products can be created, edited, deleted
- [ ] Favorites functionality works

---

## 🔧 Post-Generation Steps

### Step 1: Environment Setup

```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_APP_NAME=CraftSphere
```

### Step 2: Dependencies Installation

```bash
cd project-directory
npm install
```

### Step 3: Start Backend

```bash
# In separate terminal, start your backend API
cd backend
npm install
npm start
# Should run on http://localhost:5001
```

### Step 4: Start Frontend Development

```bash
npm run dev
# Frontend runs on http://localhost:3000
```

### Step 5: Test Key Features

```
1. Sign up as new user
2. Verify email
3. Log in
4. Create creator profile
5. Upload product
6. Browse products
7. Leave review
8. Test chat
9. Test chatbot
10. Test admin features (if admin account created)
```

### Step 6: Build for Production

```bash
npm run build
npm start
# Test production build locally
```

### Step 7: Deploy

**Option 1: Vercel (Recommended for Next.js)**
```bash
npm install -g vercel
vercel
# Follow prompts to deploy
```

**Option 2: Other Platforms**
- Upload to GitHub
- Connect to Netlify, Railway, Render, or similar
- Set environment variables in platform
- Deploy

---

## 🎯 Common Issues & Solutions

### Issue: "Module not found" errors
**Solution:** Run `npm install` again and restart dev server

### Issue: API calls not working
**Solution:** Check:
- Backend is running on http://localhost:5001
- `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Network tab in browser shows API calls

### Issue: Dark mode not working
**Solution:** Ensure Tailwind dark mode is configured in `tailwind.config.ts`

### Issue: Images not loading
**Solution:** Use `next/image` component, optimize images

### Issue: Forms not validating
**Solution:** Check Zod schemas are defined correctly, React Hook Form is configured

### Issue: Animations stuttering
**Solution:** Reduce animation complexity, use `will-change` CSS prop

---

## 📚 Reference Documentation

### For API Integration Questions:
👉 **See: API_ENDPOINTS_BREAKDOWN.md**
- All endpoint methods, URLs, parameters
- Axios request/response examples
- Error handling patterns

### For Feature Implementation Questions:
👉 **See: FRONTEND_INTEGRATION_GUIDE.md**
- Step-by-step feature workflows
- Required endpoints for each feature
- State management requirements
- Validation rules

### For Backend Understanding:
👉 **See: BACKEND_DOCUMENTATION.md**
- Architecture overview
- Database models
- Middleware explanations
- Error codes

---

## 🚀 Performance Optimization

After generation, optimize with:

```javascript
// Image optimization (already in next/image)
import Image from 'next/image'

// Code splitting
dynamic(() => import('components/heavy-component'), {
  loading: () => <div>Loading...</div>
})

// API caching
const cache = new Map()
if (cache.has(key)) return cache.get(key)

// Debounce search
const debouncedSearch = useCallback(
  debounce((query) => searchAPI(query), 300),
  []
)
```

---

## 📊 Performance Targets

| Metric | Target | How to Check |
|--------|--------|-------------|
| Lighthouse Score | 90+ | `npm run build && npm start`, audit with Lighthouse |
| First Contentful Paint | < 1.5s | DevTools Performance tab |
| Time to Interactive | < 3s | DevTools Performance tab |
| Bundle Size | < 200KB | `npm run build` output |
| API Response Time | < 500ms | Network tab in DevTools |

---

## 🔐 Security Checklist

- [ ] No sensitive data in frontend code
- [ ] API keys not hardcoded
- [ ] HTTPS enforced in production
- [ ] CORS properly configured on backend
- [ ] JWT tokens validated on every API call
- [ ] Protected routes redirecting properly
- [ ] User data sanitized before display
- [ ] Forms validating server-side too

---

## 📱 Browser Compatibility

Test on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🎓 Learning Resources

If you need to modify the generated code:

**Next.js Documentation:** https://nextjs.org/docs
**React Documentation:** https://react.dev
**Tailwind CSS:** https://tailwindcss.com/docs
**shadcn/ui:** https://ui.shadcn.com
**Axios:** https://axios-http.com
**Zustand:** https://github.com/pmndrs/zustand
**React Hook Form:** https://react-hook-form.com
**Zod:** https://zod.dev
**Framer Motion:** https://www.framer.com/motion

---

## 🤝 Next Steps After Generation

1. **Review Code Quality**
   - Check TypeScript types
   - Review component organization
   - Verify form validation

2. **Test All Features**
   - Create test accounts
   - Go through all workflows
   - Test error scenarios

3. **Customize If Needed**
   - Adjust colors/branding
   - Modify layouts
   - Add custom features

4. **Deploy to Production**
   - Build and test
   - Deploy to Vercel or similar
   - Set up CI/CD

5. **Monitor & Maintain**
   - Check error logs
   - Monitor performance
   - Update dependencies

---

## 📞 Support

If you encounter issues:

1. **Check the documentation files** first
2. **Review Bolt/Lovable output** for error messages
3. **Check backend API logs** for API errors
4. **Use browser DevTools** to debug
5. **Check console** for JavaScript errors

---

## ✨ Summary

You now have:

1. ✅ **BOLT_LOVABLE_PROMPT.md** - Complete prompt for AI code generation
2. ✅ **API_ENDPOINTS_BREAKDOWN.md** - All 77 endpoints documented
3. ✅ **FRONTEND_INTEGRATION_GUIDE.md** - Feature implementation guide
4. ✅ **This file** - Step-by-step generation and setup guide

**To generate your frontend:**
1. Copy the entire BOLT_LOVABLE_PROMPT.md content
2. Go to Bolt.new or Lovable.dev
3. Paste prompt and attach reference files
4. Wait for generation
5. Review and export
6. Follow post-generation steps

**Your production-ready CraftSphere frontend will be generated in 5-10 minutes!** 🚀

---

**Last Updated:** January 25, 2026  
**Status:** ✅ Ready for AI Generation
