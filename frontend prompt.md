# CraftSphere Frontend - Bolt/Lovable AI Prompt
**Version:** 1.0  
**Target:** Production-Ready Next.js Application  
**Created:** January 25, 2026

---

## 🎯 MAIN PROMPT FOR BOLT/LOVABLE

```
You are an expert full-stack Next.js developer tasked with building a production-ready 
creative DIY/craft marketplace platform called "CraftSphere" (CreateSphere).

PROJECT OVERVIEW:
================
CraftSphere is a comprehensive creative marketplace platform where:
- Regular users can discover, purchase, and review handmade products and tutorials
- Creators can upload their products, tutorials, and become verified
- Admins manage creator verifications, content moderation, and reports
- All users can chat with each other and use an AI chatbot for craft advice

TECH STACK REQUIREMENTS:
=======================
Framework: Next.js 14+ (App Router)
API Client: Axios with custom interceptors
Form Management: React Hook Form (for all forms)
UI Kit: shadcn/ui components
State Management: Zustand
Animations: Framer Motion
Validation: Zod (schema validation)
Styling: Tailwind CSS
Authentication: JWT (localStorage-based with axios interceptors)
Database Connection: RESTful API (provided endpoints)

DESIGN REQUIREMENTS:
====================
- Website interface should be inspired by Vercel.com and shadcn official website
- Clean, modern, minimalist design with proper typography
- Smooth animations and transitions using Framer Motion
- Dark mode support (default to light, toggle available)
- Fully responsive (mobile, tablet, desktop)
- Proper landing page with hero section, features, pricing (if applicable), testimonials
- Professional color scheme (white, black, grays, with accent colors)
- Proper loading states, skeletons, and error boundaries

BACKEND API CONFIGURATION:
==========================
Base URL: http://localhost:5001/api
All protected endpoints require: Authorization: Bearer {token}
Token storage: localStorage.setItem('authToken', token)
User role storage: localStorage.setItem('userRole', role)
Token auto-injection via axios interceptor for all protected requests
Auto-redirect to login on 401 unauthorized response

CORE MODULES TO BUILD:
======================

1. LANDING PAGE
   - Hero section with call-to-action buttons (Sign Up, Start Creating, Browse)
   - Feature showcase section (3-4 key features with icons)
   - How it works section with step-by-step flow
   - Creator spotlight section
   - Testimonials/reviews section
   - Newsletter signup
   - Footer with links
   - Smooth scroll animations with Framer Motion

2. AUTHENTICATION SYSTEM
   - Sign Up page with form validation (name, email, password)
   - Login page with email/password
   - Email verification flow (verify-email page with token from URL)
   - Forgot Password page (send reset email)
   - Reset Password page (with token from URL)
   - Resend Verification Email option
   - Form validation with Zod
   - Error messages displayed clearly
   - Automatic redirect after successful auth actions

3. USER MODULE
   - User dashboard showing user info
   - Edit profile page (name, avatar URL)
   - Follow/Unfollow creators functionality
   - My Following list page
   - Add to favorites functionality (on product cards)
   - My Favorites page with all favorited products
   - User settings page
   - Logout button in navbar

4. CREATOR MODULE
   - Creator onboarding flow (2-step process)
   - Creator profile setup (displayName, tagline, bio, portfolio, categories)
   - Creator dashboard showing:
     * Profile overview (stats: followers, rating, products count)
     * Products list with create/edit/delete/restore buttons
     * Tutorials list with create/edit/delete/restore buttons
     * Creator profile editing
     * Deactivate/Reactivate creator mode buttons
   - Public creator profile page (view any creator)
   - Creator search and filtering
   - Creator cards on explore page

5. PRODUCT MODULE
   - Explore Products page (marketplace feed with pagination)
   - Product search functionality
   - Filter by category
   - Sort by newest/oldest
   - Single product detail page showing:
     * Product images (carousel)
     * Product details (title, description, price, rating)
     * Creator info with link to profile
     * Customization options (if available)
     * Reviews section
     * Report button
   - Creator: Create product form with all fields (title, description, price, images, category, customization)
   - Creator: Edit product form
   - Creator: Delete product with confirmation
   - Creator: Restore deleted products
   - Add to favorites button on product cards
   - Average rating display

6. TUTORIAL MODULE
   - Explore Tutorials page (similar to products)
   - Tutorial search and filtering
   - Single tutorial detail page
   - Tutorial cards showing difficulty level, duration
   - Creator: Create tutorial form (title, description, type, videoUrl, duration, difficulty, category)
   - Creator: Edit tutorial form
   - Creator: Delete tutorial with confirmation
   - Creator: Restore deleted tutorials

7. CATEGORY MODULE
   - Category listing
   - Category filtering on products/tutorials pages
   - Category badges/chips on content cards
   - Admin: Category management (CRUD)

8. REVIEW & RATING MODULE
   - Display reviews on product/tutorial detail pages
   - Leave review form (rating 1-5 stars, optional comment)
   - Edit own review functionality
   - Delete own review functionality
   - Review list showing reviewer name, avatar, date, rating, comment
   - Update product/tutorial rating display when reviews change
   - Form validation: rating 1-5, comment max 1000 chars

9. REPORT MODULE
   - Report button on all content (products, tutorials)
   - Report modal/dialog with:
     * Reason dropdown (inappropriate, spam, scam, other)
     * Additional notes textarea (max 500 chars)
     * Submit/Cancel buttons
   - Success message after report submission
   - Error if already reported

10. CHAT MODULE
    - Chat inbox page showing all conversations
    - Conversation list with:
      * User avatar and name
      * Last message preview
      * Last message timestamp
      * Unread count badge (if applicable)
    - Chat thread page (click conversation to open)
    - Message display (own messages right-aligned, others left-aligned)
    - Message input form at bottom
    - Send button
    - Open DM functionality (from creator profile)
    - Smooth message animations on send
    - Load conversation history

11. CHATBOT MODULE
    - Chatbot chat interface page
    - Image upload input (with preview)
    - Text input for description/query
    - Submit button to analyze image
    - Display AI analysis result
    - "Generate Image" button to create AI images
    - Session management (restore previous sessions)
    - End session button
    - Display related product suggestions from analysis
    - Loading states during API calls

12. ADMIN DASHBOARD
    - Admin login page (separate from user login)
    - Admin dashboard with overview cards:
      * Pending creator verifications count
      * Priority reports count
      * Total users/products/tutorials count
    - Creator Verification section:
      * List of pending creator verifications
      * Each creator card showing profile info, followers, priority score
      * Approve/Reject buttons
      * Rejection reason modal if rejecting
    - Reports section:
      * Priority reports list
      * Each report showing target type, report count, latest timestamp
      * Hide/Restore/Remove content buttons
    - User moderation section:
      * Search user by email
      * Block/Unblock user button
      * View user details
    - Chatbot sessions list (view all sessions, user analytics)

AUTHENTICATION & AUTHORIZATION:
================================
Protected Routes:
- /user/* (requires auth, any role)
- /creator/* (requires auth, creator role)
- /admin/* (requires auth, admin role)
- /chat/* (requires auth)
- /my-favorites (requires auth)
- /product/create (requires auth, creator role)
- /tutorial/create (requires auth, creator role)

Public Routes:
- / (landing page)
- /auth/login
- /auth/signup
- /auth/verify-email
- /auth/forgot-password
- /auth/reset-password
- /explore/products
- /explore/tutorials
- /explore/creators
- /product/:id (product detail)
- /tutorial/:id (tutorial detail)
- /creator/:id (creator profile)

Navigation:
- Navbar component with logo, search bar, navigation links
- Links change based on auth status and user role
- Logged in user sees: Profile, Favorites, Messages, Logout
- Creator sees: Creator Dashboard, My Products, My Tutorials
- Admin sees: Admin Dashboard

STATE MANAGEMENT (Zustand):
===========================
Create stores for:
1. authStore
   - authToken (JWT)
   - user (user object)
   - userRole (user, creator, admin)
   - emailVerified
   - isBlocked
   - isAuthenticated
   - setAuthToken()
   - setUser()
   - logout()
   - setUserRole()
   - setCreatorProfile()

2. creatorStore
   - creatorProfile (if user is creator)
   - onboardingStatus
   - creatorProducts
   - creatorTutorials
   - setCreatorProfile()
   - setProducts()
   - setTutorials()

3. uiStore
   - darkMode
   - sidebarOpen
   - toggleDarkMode()
   - toggleSidebar()

4. chatStore
   - conversations
   - currentConversation
   - messages
   - setConversations()
   - setMessages()
   - addMessage()

FORM COMPONENTS (React Hook Form + Zod):
=========================================
Create reusable form components for:
- Input field with label, placeholder, error display
- Password input with show/hide toggle
- Textarea with char count
- Select/dropdown
- Checkbox
- Radio group
- File upload (for product images, profile avatar)
- Image carousel uploader (for multiple images)
- Date picker
- Star rating picker (1-5)

FORM SCHEMAS (Zod):
===================
Define schemas for:
- User registration (name, email, password validation)
- User login (email, password)
- Profile update (name, avatar)
- Creator setup (displayName, bio, categories, etc.)
- Product creation (title, description, price, images, etc.)
- Tutorial creation (title, description, type, duration, etc.)
- Review submission (rating 1-5, comment)
- Report submission (reason, notes)
- Message sending (message text)
- Category creation/update (admin)

UI COMPONENTS (shadcn/ui):
==========================
Use these shadcn/ui components:
- Button (primary, secondary, outline, ghost variants)
- Card (for content cards)
- Dialog/Modal (for confirmations, forms)
- Dropdown Menu (for user menu)
- Input (for text fields)
- Textarea (for long text)
- Select (for dropdowns)
- Tabs (for dashboard sections)
- Badge (for status, tags)
- Avatar (for user/creator avatars)
- Skeleton (for loading states)
- Toast/Sonner (for notifications)
- Navbar (custom, using components)
- Sidebar (for admin, collapsible)
- Table (for admin data)
- Pagination (for list pages)
- Breadcrumb (for navigation)
- Progress bar (for upload progress)
- Slider (for price range filter)
- Checkbox (for filters)
- Switch (for dark mode toggle)

ANIMATIONS (Framer Motion):
===========================
Add animations for:
- Page transitions (fade in/slide)
- Component entrance animations
- Hover effects on cards/buttons
- Loading spinners (custom)
- Success/error notifications (toast)
- Modal entrance (scale + fade)
- Sidebar collapse/expand
- Search results appearing
- Messages sliding in (chat)
- Product cards stagger animation on grid
- Smooth scroll to section
- Button ripple effect on click

AXIOS SETUP & INTERCEPTORS:
===========================
Create axiosInstance with:
1. Base URL: http://localhost:5001/api
2. Default headers: Content-Type: application/json
3. Request interceptor:
   - Auto-add Authorization: Bearer {token} header
   - Check if token exists in localStorage
4. Response interceptor:
   - Handle 401 errors: clear localStorage, redirect to login
   - Handle 403 errors: show permission denied toast
   - Handle 404 errors: show not found toast
   - Handle 500 errors: show server error toast
5. Error handling:
   - Centralized error handling
   - Show user-friendly error messages
   - Log errors to console in development

FILE STRUCTURE (Next.js App Router):
====================================
```
src/
├── app/
│   ├── layout.tsx (root layout)
│   ├── page.tsx (landing page)
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── verify-email/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── explore/
│   │   ├── products/page.tsx
│   │   ├── tutorials/page.tsx
│   │   ├── creators/page.tsx
│   │   └── [id]/page.tsx
│   ├── product/
│   │   ├── [id]/page.tsx (detail)
│   │   ├── create/page.tsx
│   │   └── [id]/edit/page.tsx
│   ├── tutorial/
│   │   ├── [id]/page.tsx
│   │   ├── create/page.tsx
│   │   └── [id]/edit/page.tsx
│   ├── creator/
│   │   ├── [id]/page.tsx (public profile)
│   │   ├── dashboard/page.tsx
│   │   ├── onboarding/page.tsx
│   │   └── settings/page.tsx
│   ├── user/
│   │   ├── profile/page.tsx
│   │   ├── following/page.tsx
│   │   ├── favorites/page.tsx
│   │   └── settings/page.tsx
│   ├── chat/
│   │   ├── page.tsx (conversations list)
│   │   └── [conversationId]/page.tsx (thread)
│   ├── chatbot/
│   │   └── page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── creators/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── users/page.tsx
│   │   └── chatbot/page.tsx
│   └── error.tsx, loading.tsx, not-found.tsx
├── components/
│   ├── navbar.tsx
│   ├── sidebar.tsx
│   ├── footer.tsx
│   ├── forms/
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── product-form.tsx
│   │   ├── tutorial-form.tsx
│   │   ├── review-form.tsx
│   │   ├── report-modal.tsx
│   │   └── ...
│   ├── cards/
│   │   ├── product-card.tsx
│   │   ├── tutorial-card.tsx
│   │   ├── creator-card.tsx
│   │   └── ...
│   ├── modals/
│   │   ├── confirmation-dialog.tsx
│   │   ├── report-modal.tsx
│   │   └── ...
│   └── ui/ (shadcn components)
├── lib/
│   ├── axios.ts (axios instance with interceptors)
│   ├── api-client.ts (API call functions)
│   └── utils.ts (utility functions)
├── store/
│   ├── auth-store.ts (Zustand)
│   ├── creator-store.ts
│   ├── chat-store.ts
│   ├── ui-store.ts
│   └── ...
├── schemas/
│   ├── auth.ts (Zod schemas)
│   ├── product.ts
│   ├── tutorial.ts
│   ├── review.ts
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useCreator.ts
│   ├── useApi.ts (for API calls with loading/error states)
│   └── ...
├── types/
│   ├── index.ts (TypeScript types)
│   ├── api.ts (API response types)
│   └── ...
├── styles/
│   └── globals.css (Tailwind + custom styles)
└── public/
    └── (images, icons, etc.)
```

DETAILED FEATURE SPECIFICATIONS:
================================

LANDING PAGE:
- Hero section with large heading, subheading, and CTA buttons
- Feature cards section (3-4 features)
- How it works section with numbered steps
- Popular creators/products section (carousel)
- Stats section (total users, products, tutorials)
- Call to action section before footer
- Footer with links, social media, newsletter signup

NAVBAR:
- Logo on left
- Centered navigation links (Explore, About, Contact)
- Search bar (with debounce)
- Right side: Login/SignUp (if not authenticated) or User menu (if authenticated)
- Mobile hamburger menu
- Sticky/fixed at top
- Smooth transitions

USER DASHBOARD:
- Profile card showing avatar, name, email
- Stats cards (followers, following, favorites)
- Edit profile button
- Tabs for different sections (if applicable)
- Recent activity or quick actions

PRODUCT DETAIL PAGE:
- Large product image carousel (left side)
- Product info panel (right side):
  * Title, price, rating (stars), review count
  * Category badge
  * Description
  * Customization options
  * Add to favorites button
  * Report button
- Creator info card:
  * Creator avatar, name, verified badge
  * Creator tagline/bio
  * Followers count
  * Follow button
  * Link to creator profile
- Reviews section:
  * Leave review form (if logged in)
  * Reviews list with user info, rating, comment, date
  * Edit/delete buttons for own reviews

MARKETPLACE (EXPLORE):
- Search bar at top
- Category filter pills (horizontal scroll or sidebar)
- Sort dropdown (newest, oldest, most popular)
- Product/Tutorial grid with pagination
- Smooth animations on grid items
- Empty state when no results
- Loading skeleton cards while fetching

CREATOR ONBOARDING (2-STEP):
Step 1: Welcome screen explaining creator benefits
Step 2: Form with:
- Display name (required)
- Tagline (optional)
- Bio (required, min 20 chars)
- Categories (multi-select, required min 1)
- Portfolio URLs (optional)
- Submit button

PRODUCT CREATION FORM:
- Title input (required)
- Description textarea (required, with char count)
- Price input (required, number)
- Category select (required)
- Images uploader (required, min 1, max 10 images)
- Customization toggle
- Customization options textarea (if toggled)
- Submit button
- Form validation with error messages

ADMIN DASHBOARD:
- Overview cards showing key metrics
- Sidebar with navigation to different sections
- Creator verification section with approve/reject
- Reports section with prioritized list
- User management section
- Dark/light mode toggle
- Admin profile/logout

ERROR HANDLING:
- Global error boundary component
- 404 page for missing routes
- Loading states on all async operations
- Toast notifications for success/error messages
- Empty states for no data scenarios
- User-friendly error messages

RESPONSIVE DESIGN:
- Mobile-first approach
- Hamburger menu on mobile
- Stack layout on mobile (no sidebar on mobile)
- Touch-friendly buttons and inputs
- Readable font sizes on all devices
- Proper spacing and padding

PRODUCTION READY REQUIREMENTS:
==============================
- All environment variables in .env.local
- Proper TypeScript types throughout
- Error handling and try-catch blocks
- Loading and error states for all API calls
- Form validation with Zod
- Proper error boundaries
- Accessible components (ARIA labels)
- SEO meta tags on pages
- Images optimized (next/image)
- Code splitting and lazy loading
- Proper cache headers
- Security: no sensitive data in frontend code
- CORS handled by backend
- Proper redirects based on auth status
- Protected routes working correctly

IMPORTANT API ENDPOINTS REFERENCE:
==================================
Authentication:
POST /auth/register - Register new user
POST /auth/login - Login user
GET /auth/verify-email?token=xyz - Verify email
POST /auth/resend-verification - Resend verification
POST /auth/forgot-password - Request password reset
POST /auth/reset-password?token=xyz - Reset password
POST /auth/logout - Logout

Products:
GET /products?page=1&limit=12 - List all products
GET /products/search?q=query - Search products
GET /products/category/:categoryId - Products by category
GET /products/:productId - Get product details
POST /products - Create product (creator)
PUT /products/:productId - Update product (creator)
DELETE /products/:productId - Delete product (creator)
POST /products/:productId/restore - Restore deleted product

Tutorials:
GET /tutorials?page=1&limit=12 - List all tutorials
GET /tutorials/search?q=query - Search tutorials
GET /tutorials/category/:categoryId - Tutorials by category
GET /tutorials/:tutorialId - Get tutorial details
POST /tutorials - Create tutorial (creator)
PUT /tutorials/:tutorialId - Update tutorial (creator)
DELETE /tutorials/:tutorialId - Delete tutorial (creator)
POST /tutorials/:tutorialId/restore - Restore deleted tutorial

Creators:
GET /creators?page=1&limit=12 - List creators
GET /creators/search?q=query - Search creators
GET /creators/:creatorId - Creator public profile
POST /creators/start - Start creator onboarding
POST /creators/complete - Complete creator setup
GET /creators/me/profile - Get my creator profile (creator)
PUT /creators/me/profile - Update my profile (creator)
POST /creators/me/deactivate - Deactivate creator mode
POST /creators/me/reactivate - Reactivate creator mode

Users:
GET /users/me/profile - Get my profile
PUT /users/me/profile - Update my profile
POST /users/follow/:creatorId - Follow creator
POST /users/unfollow/:creatorId - Unfollow creator
GET /users/me/following - Get my following list
POST /users/favorites/:productId - Add to favorites
DELETE /users/favorites/:productId - Remove from favorites
GET /users/me/favorites - Get my favorites

Reviews:
GET /reviews/:targetType/:targetId - Get reviews
POST /reviews - Create review
PUT /reviews/:reviewId - Update review
DELETE /reviews/:reviewId - Delete review

Reports:
POST /reports - Submit report
GET /reports/:targetType/:targetId - Get reports

Chat:
GET /chat/conversations - Get all conversations
POST /chat/open/:userId - Open/create conversation
GET /chat/:conversationId - Get messages in conversation
POST /chat/:conversationId - Send message

Categories:
GET /categories - Get all categories
GET /categories/:slug - Get category by slug
POST /categories - Create category (admin)
PUT /categories/:id - Update category (admin)

Admin:
POST /admin/login - Admin login
GET /admin/creators/verification/pending - Pending verifications
POST /admin/creators/:creatorId/verify - Approve creator
POST /admin/creators/:creatorId/reject - Reject creator
GET /admin/reports/priority - Get priority reports
POST /admin/content/:targetType/:targetId/hide - Hide content
POST /admin/content/:targetType/:targetId/remove - Remove content
POST /admin/moderate/:targetId - Moderate user

Chatbot:
POST /chatbot/analyze - Analyze image with AI
POST /chatbot/generate-image - Generate image with AI
GET /chatbot/session/:sessionId - Get session
DELETE /chatbot/session/:sessionId - End session

DELIVERABLES:
=============
1. Fully functional Next.js application
2. All pages and components built and styled
3. All forms with validation and error handling
4. Working authentication flow (login, signup, logout)
5. Working CRUD operations for products and tutorials
6. Working creator onboarding flow
7. Working admin dashboard with all features
8. Proper error handling and loading states
9. Responsive design working on all devices
10. Dark mode support
11. All animations working smoothly
12. TypeScript types properly defined
13. Environment variables configured
14. README with setup instructions
15. Code should be clean, well-organized, and well-commented

DESIGN INSPIRATION:
===================
Look at these websites for design inspiration:
- Vercel.com (minimal, clean, professional)
- shadcn official website (modern, component-focused)
- Dribbble (for UI/UX trends)
- Figma community (for design systems)

Use:
- Consistent spacing (8px or 16px grid)
- Proper color hierarchy (primary, secondary, accent)
- Clear typography (2-3 font weights, 3-4 sizes)
- Proper contrast ratios for accessibility
- Consistent border radius
- Subtle shadows for depth
- Proper whitespace

PERFORMANCE REQUIREMENTS:
=========================
- Pages load in under 3 seconds
- Images lazy-loaded
- Code split by route
- API calls cached where appropriate
- Optimized bundle size
- Lighthouse score 90+

BUILD & DEPLOYMENT:
===================
- npm run build should complete without errors
- npm run dev should run locally without errors
- next/image used for all images
- Environment variables properly configured
- No console errors or warnings
- Ready for deployment on Vercel or similar

CREATE THIS ENTIRE PRODUCTION-READY FRONTEND APPLICATION NOW.
Make sure every feature works, every page is beautiful, and 
the entire application is polished and professional.
```

---

## REFERENCE DOCUMENTATION

Include the following documentation when providing to Bolt/Lovable:

### API ENDPOINTS BREAKDOWN
[Include the complete API_ENDPOINTS_BREAKDOWN.md file content here]

### FRONTEND INTEGRATION GUIDE
[Include the complete FRONTEND_INTEGRATION_GUIDE.md file content here]

### AUTHENTICATION STATE MANAGEMENT
```
Store in localStorage:
- authToken: JWT token for API calls
- userRole: "user" | "creator" | "admin"
- adminToken: JWT for admin operations

Store in Zustand (memory):
- user: complete user object
- creatorProfile: creator profile if user is creator
- isAuthenticated: boolean
- isAdminAuthenticated: boolean

Axios will automatically add:
Authorization: Bearer {authToken} to all protected requests
And handle 401 errors by clearing tokens and redirecting to login
```

### STYLING APPROACH
Use Tailwind CSS with shadcn/ui components. The design should be:
- Clean and minimal like Vercel/shadcn
- Professional and modern
- Accessible (WCAG AA compliant)
- Responsive on all devices
- Dark mode compatible
- Consistent spacing and colors

### NAVIGATION STRUCTURE
```
Public Routes:
/ → Landing page
/auth/login → Login
/auth/signup → Signup
/auth/verify-email → Email verification
/auth/forgot-password → Forgot password
/auth/reset-password → Reset password
/explore/products → Browse products
/explore/tutorials → Browse tutorials
/explore/creators → Browse creators
/product/[id] → Product detail
/tutorial/[id] → Tutorial detail
/creator/[id] → Creator profile

Protected Routes (User):
/user/profile → User profile
/user/following → Following list
/user/favorites → Favorite products
/user/settings → User settings
/chat → Chat inbox
/chat/[conversationId] → Chat thread
/chatbot → AI Chatbot

Protected Routes (Creator):
/creator/dashboard → Creator dashboard
/creator/onboarding → Creator onboarding
/creator/settings → Creator settings
/product/create → Create product
/product/[id]/edit → Edit product
/tutorial/create → Create tutorial
/tutorial/[id]/edit → Edit tutorial

Protected Routes (Admin):
/admin/login → Admin login
/admin/dashboard → Admin overview
/admin/creators → Creator verifications
/admin/reports → Content reports
/admin/users → User management
/admin/chatbot → Chatbot sessions
```

---

## ADDITIONAL INSTRUCTIONS

1. **Install shadcn/ui components** at the beginning of the project
2. **Create Zustand stores** before building components
3. **Define Zod schemas** for all forms before creating form components
4. **Set up axios instance** with interceptors before making any API calls
5. **Create TypeScript types** for all API responses
6. **Use React Hook Form** for all forms (combined with Zod)
7. **Add Framer Motion animations** gradually during component development
8. **Test all protected routes** to ensure proper redirects
9. **Test all forms** with validation and API integration
10. **Test responsive design** on multiple devices
11. **Optimize images** using next/image
12. **Add proper error boundaries** at route level
13. **Implement loading states** for all async operations
14. **Add success/error toasts** for user feedback
15. **Ensure all API endpoints** match the provided documentation

---

## CHECKLIST FOR PRODUCTION READINESS

- [ ] All pages render correctly
- [ ] All forms validate and submit
- [ ] All API calls work with proper error handling
- [ ] Authentication flow works end-to-end
- [ ] Protected routes redirect properly
- [ ] Dark mode works on all pages
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] All animations are smooth and performant
- [ ] Images load fast and are optimized
- [ ] No console errors or warnings
- [ ] TypeScript types are properly defined
- [ ] Environment variables configured correctly
- [ ] Build completes without errors
- [ ] Lighthouse score 90+
- [ ] All user interactions are smooth
- [ ] All notifications (toasts) work properly
- [ ] All modals/dialogs work correctly
- [ ] Search functionality works
- [ ] Pagination works on list pages
- [ ] Filters work on explore pages
- [ ] Creator onboarding flow works
- [ ] Product/Tutorial CRUD works
- [ ] Admin features work correctly
- [ ] Chat functionality works
- [ ] Chatbot image analysis works
- [ ] AI image generation works

---

## FILES TO INCLUDE WITH THIS PROMPT

When providing this prompt to Bolt/Lovable, also attach/reference these files:

1. **API_ENDPOINTS_BREAKDOWN.md** - Complete API documentation with Axios examples
2. **FRONTEND_INTEGRATION_GUIDE.md** - Step-by-step feature implementation guide
3. **Backend Routes** - All route files from the backend (for reference)

---

## EXAMPLE USAGE IN BOLT/LOVABLE

1. Copy this entire prompt
2. Go to Bolt or Lovable AI
3. Create a new project
4. Paste the prompt in the message
5. Attach the three reference files (API_ENDPOINTS_BREAKDOWN.md, FRONTEND_INTEGRATION_GUIDE.md, and backend routes)
6. Click "Generate"
7. Wait for the AI to build the entire application
8. Review the generated code
9. Make any adjustments if needed
10. Export and deploy

---

**PROMPT READY FOR BOLT/LOVABLE** ✅

This prompt provides complete specifications for building a production-ready CraftSphere frontend that integrates perfectly with your backend API.
