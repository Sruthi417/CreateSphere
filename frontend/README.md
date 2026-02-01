# CraftSphere - Creative DIY Marketplace

A comprehensive creative marketplace platform where users can discover, purchase, and review handmade products and tutorials, creators can upload their products, and admins manage verifications and content moderation.

## 🚀 Features

### User Features
- **Authentication**: Login, Signup, Email Verification, Password Reset
- **Profile Management**: Edit profile, avatar, and settings
- **Favorites**: Save products to favorites list
- **Following**: Follow your favorite creators
- **Messaging**: Direct chat with creators
- **AI Chatbot**: Get personalized craft ideas with image analysis

### Creator Features
- **Creator Onboarding**: 2-step process to become a creator
- **Product Management**: Create, edit, delete, restore products
- **Tutorial Management**: Create video/article/guide tutorials
- **Dashboard**: Overview of stats, followers, and content
- **Profile Customization**: Bio, tagline, portfolio, categories

### Admin Features
- **Creator Verification**: Approve or reject creator applications
- **Content Moderation**: Hide, restore, or remove reported content
- **Reports Management**: Review and resolve priority reports
- **User Management**: Block/unblock users

### Marketplace Features
- **Explore Products**: Browse, search, filter by category
- **Explore Tutorials**: Video, article, and guide formats
- **Explore Creators**: Find and follow talented artisans
- **Reviews & Ratings**: Leave reviews on products/tutorials
- **Reporting**: Report inappropriate content

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI Kit**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Form Management**: React Hook Form + Zod
- **Animations**: Framer Motion
- **API Client**: Axios with interceptors
- **Authentication**: JWT (localStorage-based)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/               # Authentication pages
│   ├── explore/            # Marketplace browsing
│   ├── product/            # Product CRUD
│   ├── tutorial/           # Tutorial CRUD
│   ├── creator/            # Creator dashboard & profile
│   ├── user/               # User profile & settings
│   ├── chat/               # Messaging
│   ├── chatbot/            # AI assistant
│   └── admin/              # Admin dashboard
├── components/             # Reusable components
│   ├── cards/              # Product, Tutorial, Creator cards
│   ├── modals/             # Dialog components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities
│   ├── axios.js            # Axios instance with interceptors
│   ├── api-client.js       # API call functions
│   └── utils.js            # Helper functions
├── store/                  # Zustand stores
│   ├── auth-store.js       # Authentication state
│   ├── ui-store.js         # UI state (dark mode, sidebar)
│   └── chat-store.js       # Chat/messaging state
└── schemas/                # Zod validation schemas
    ├── auth.js             # Authentication schemas
    ├── creator.js          # Creator/product/tutorial schemas
    └── review.js           # Review and report schemas
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- Yarn package manager
- Backend API running at `http://localhost:5001/api`

### Installation

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Configure environment**:
   The `.env` file should contain:
   ```env
   NEXT_PUBLIC_BASE_URL=your-frontend-url
   ```

3. **Start development server**:
   ```bash
   yarn dev
   ```

4. **Access the app**:
   Open `http://localhost:3000` in your browser

## 🔌 Backend API Configuration

This frontend connects to an external backend API. Update the base URL in `/lib/axios.js` if needed:

```javascript
const API_BASE_URL = 'http://localhost:5001/api';
```

### Required API Endpoints

The backend should provide these endpoints:

- **Auth**: `/auth/register`, `/auth/login`, `/auth/verify-email`, etc.
- **Users**: `/users/me/profile`, `/users/follow/:id`, `/users/favorites/:id`
- **Creators**: `/creators`, `/creators/me/profile`, `/creators/start`, `/creators/complete`
- **Products**: `/products`, `/products/:id`, `/products/category/:id`
- **Tutorials**: `/tutorials`, `/tutorials/:id`
- **Categories**: `/categories`
- **Reviews**: `/reviews/:targetType/:targetId`
- **Reports**: `/reports`
- **Chat**: `/chat/conversations`, `/chat/:conversationId`
- **Chatbot**: `/chatbot/analyze`, `/chatbot/generate-image`
- **Admin**: `/admin/login`, `/admin/creators/verification/pending`, etc.

## 🎨 Design System

The UI follows a clean, modern design inspired by Vercel and shadcn:
- **Colors**: White, black, grays with accent colors
- **Typography**: Clean, consistent font sizing
- **Spacing**: 8px grid system
- **Animations**: Smooth Framer Motion transitions
- **Dark Mode**: Toggle available (stored in localStorage)

## 📱 Responsive Design

The app is fully responsive:
- Mobile hamburger menu
- Stack layouts on small screens
- Touch-friendly interactions
- Proper spacing on all devices

## 🔐 Authentication Flow

1. User signs up → Receives verification email
2. User verifies email → Can log in
3. JWT token stored in localStorage
4. Axios interceptor auto-adds token to requests
5. 401 responses redirect to login

## 👨‍💻 Creator Flow

1. User clicks "Become a Creator"
2. Step 1: Welcome screen with benefits
3. Step 2: Profile setup (name, bio, categories)
4. Creator can now add products and tutorials
5. Admin reviews and approves/rejects verification

## 📝 License

MIT License
