# CraftSphere - Complete API Endpoints Breakdown for Frontend
**Version:** 1.0  
**Last Updated:** January 25, 2026  
**Backend Base URL:** `http://localhost:5001/api`  
**Format:** Axios Implementation Guide with Parameters & Headers

---

## Table of Contents

1. [HTTP Header Configuration](#http-header-configuration)
2. [Authentication Endpoints](#authentication-endpoints)
3. [User Endpoints](#user-endpoints)
4. [Creator Endpoints](#creator-endpoints)
5. [Product Endpoints](#product-endpoints)
6. [Tutorial Endpoints](#tutorial-endpoints)
7. [Category Endpoints](#category-endpoints)
8. [Review Endpoints](#review-endpoints)
9. [Report Endpoints](#report-endpoints)
10. [Chat Endpoints](#chat-endpoints)
11. [Chatbot Endpoints](#chatbot-endpoints)
12. [Admin Endpoints](#admin-endpoints)

---

## HTTP Header Configuration

### Headers for All Requests

```javascript
// Common headers for all requests
const COMMON_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json"
};

// Headers with authentication
const AUTH_HEADERS = {
  ...COMMON_HEADERS,
  "Authorization": `Bearer ${token}`
};

// File upload headers (for multipart/form-data)
// NOTE: Axios automatically sets Content-Type to multipart/form-data
// when FormData is used, so don't manually set it
const UPLOAD_HEADERS = {
  "Accept": "application/json"
  // Content-Type will be set automatically by axios
};
```

### Axios Instance Configuration

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Create axios instance with default config
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## Authentication Endpoints

### 1. User Registration

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/auth/register` |
| **Full URL** | `http://localhost:5001/api/auth/register` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Request Body

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | Min 3 chars, max 100 chars |
| email | string | Yes | Valid email format, unique |
| password | string | Yes | Min 8 chars, must include uppercase, lowercase, number, special char |

#### Request Example (Axios)

```javascript
const handleSignup = async (formData) => {
  try {
    const response = await axiosInstance.post('/auth/register', {
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password
    });
    
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 201)

```json
{
  "success": true,
  "message": "Account created. Please verify your email to login.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "emailVerified": false,
    "createdAt": "2024-01-25T10:00:00Z"
  }
}
```

#### Response (Error - 400)

```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

### 2. User Login

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/auth/login` |
| **Full URL** | `http://localhost:5001/api/auth/login` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Request Body

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

#### Request Example (Axios)

```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      email: email.toLowerCase().trim(),
      password: password
    });
    
    const { token, user } = response.data.data;
    
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', user.role);
    
    console.log('Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "creator",
      "avatarUrl": "https://...",
      "emailVerified": true,
      "creatorProfile": {
        "displayName": "John's Crafts",
        "verified": true,
        "isDeactivated": false
      }
    }
  }
}
```

#### Response (Error - 401)

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Verify Email

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/auth/verify-email` |
| **Full URL** | `http://localhost:5001/api/auth/verify-email?token=xyz` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | Email verification token from email link |

#### Request Example (Axios)

```javascript
const handleVerifyEmail = async (token) => {
  try {
    const response = await axiosInstance.get('/auth/verify-email', {
      params: {
        token: token
      }
    });
    
    console.log('Email verified:', response.data);
    return response.data;
  } catch (error) {
    console.error('Verification failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

#### Response (Error - 400)

```json
{
  "success": false,
  "message": "Token expired"
}
```

---

### 4. Resend Verification Email

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/auth/resend-verification` |
| **Full URL** | `http://localhost:5001/api/auth/resend-verification` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Request Body

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |

#### Request Example (Axios)

```javascript
const handleResendVerification = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/resend-verification', {
      email: email.toLowerCase().trim()
    });
    
    console.log('Verification email sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Resend failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Verification email sent again."
}
```

---

### 5. Forgot Password

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/auth/forgot-password` |
| **Full URL** | `http://localhost:5001/api/auth/forgot-password` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Request Body

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |

#### Request Example (Axios)

```javascript
const handleForgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email: email.toLowerCase().trim()
    });
    
    console.log('Reset link sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Request failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Password reset link sent to email."
}
```

---

### 6. Reset Password

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/auth/reset-password` |
| **Full URL** | `http://localhost:5001/api/auth/reset-password?token=xyz` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | Password reset token from email |

#### Request Body

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| newPassword | string | Yes | Min 8 chars, include uppercase, lowercase, number, special char |

#### Request Example (Axios)

```javascript
const handleResetPassword = async (token, newPassword) => {
  try {
    const response = await axiosInstance.post(
      '/auth/reset-password',
      {
        newPassword: newPassword
      },
      {
        params: {
          token: token
        }
      }
    );
    
    console.log('Password reset:', response.data);
    return response.data;
  } catch (error) {
    console.error('Reset failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Password reset successful. You can login now."
}
```

---

### 7. Logout

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/auth/logout` |
| **Full URL** | `http://localhost:5001/api/auth/logout` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Request Body

Empty object or no body required.

#### Request Example (Axios)

```javascript
const handleLogout = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout', {});
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    
    console.log('Logged out:', response.data);
    return response.data;
  } catch (error) {
    console.error('Logout failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### 1. Get My Profile

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/users/me/profile` |
| **Full URL** | `http://localhost:5001/api/users/me/profile` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Request Example (Axios)

```javascript
const getMyProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/me/profile');
    
    console.log('Profile loaded:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load profile:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "creator",
    "avatarUrl": "https://example.com/avatar.jpg",
    "emailVerified": true,
    "isBlocked": false,
    "onboardingStatus": "creator_completed",
    "creatorProfile": {
      "displayName": "John's Crafts",
      "tagline": "DIY Expert",
      "fullBio": "Passionate about handmade crafts...",
      "verified": true,
      "followersCount": 150,
      "rating": 4.8,
      "isDeactivated": false
    }
  }
}
```

---

### 2. Update My Profile

| Field | Value |
|-------|-------|
| **Method** | PUT |
| **Endpoint** | `/users/me/profile` |
| **Full URL** | `http://localhost:5001/api/users/me/profile` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | No | Max 100 chars |
| avatarUrl | string | No | Valid image URL |

#### Request Example (Axios)

```javascript
const updateMyProfile = async (updates) => {
  try {
    const response = await axiosInstance.put(
      '/users/me/profile',
      {
        name: updates.name?.trim(),
        avatarUrl: updates.avatarUrl
      }
    );
    
    console.log('Profile updated:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Update failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe Updated",
    "email": "john@example.com",
    "role": "creator",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "creatorProfile": { ... }
  }
}
```

---

### 3. Follow Creator

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/users/follow/:creatorId` |
| **Full URL** | `http://localhost:5001/api/users/follow/507f1f77bcf86cd799439012` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| creatorId | string | Yes | MongoDB ID of creator to follow |

#### Request Example (Axios)

```javascript
const followCreator = async (creatorId) => {
  try {
    const response = await axiosInstance.post(
      `/users/follow/${creatorId}`,
      {}
    );
    
    console.log('Creator followed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Follow failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Creator followed"
}
```

---

### 4. Unfollow Creator

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/users/unfollow/:creatorId` |
| **Full URL** | `http://localhost:5001/api/users/unfollow/507f1f77bcf86cd799439012` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| creatorId | string | Yes | MongoDB ID of creator to unfollow |

#### Request Example (Axios)

```javascript
const unfollowCreator = async (creatorId) => {
  try {
    const response = await axiosInstance.post(
      `/users/unfollow/${creatorId}`,
      {}
    );
    
    console.log('Creator unfollowed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Unfollow failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Creator unfollowed"
}
```

---

### 5. Get My Following List

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/users/me/following` |
| **Full URL** | `http://localhost:5001/api/users/me/following` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Request Example (Axios)

```javascript
const getMyFollowing = async () => {
  try {
    const response = await axiosInstance.get('/users/me/following');
    
    console.log('Following list:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load following:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Creator Name",
      "avatarUrl": "https://...",
      "creatorProfile": {
        "displayName": "Creator Display",
        "tagline": "My tagline",
        "followersCount": 100
      }
    }
  ]
}
```

---

### 6. Add Product to Favorites

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/users/favorites/:productId` |
| **Full URL** | `http://localhost:5001/api/users/favorites/507f1f77bcf86cd799439013` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | MongoDB ID of product |

#### Request Example (Axios)

```javascript
const addFavoriteProduct = async (productId) => {
  try {
    const response = await axiosInstance.post(
      `/users/favorites/${productId}`,
      {}
    );
    
    console.log('Added to favorites:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to add favorite:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Product added to favorites"
}
```

---

### 7. Remove Product from Favorites

| Field | Value |
|-------|-------|
| **Method** | DELETE |
| **Endpoint** | `/users/favorites/:productId` |
| **Full URL** | `http://localhost:5001/api/users/favorites/507f1f77bcf86cd799439013` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | MongoDB ID of product |

#### Request Example (Axios)

```javascript
const removeFavoriteProduct = async (productId) => {
  try {
    const response = await axiosInstance.delete(
      `/users/favorites/${productId}`
    );
    
    console.log('Removed from favorites:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to remove favorite:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Product removed from favorites"
}
```

---

### 8. Get My Favorites

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/users/me/favorites` |
| **Full URL** | `http://localhost:5001/api/users/me/favorites` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Request Example (Axios)

```javascript
const getMyFavorites = async () => {
  try {
    const response = await axiosInstance.get('/users/me/favorites');
    
    console.log('Favorites:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load favorites:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Handmade Ceramic Pot",
      "images": ["https://..."],
      "price": 29.99,
      "averageRating": 4.5,
      "reviewsCount": 12
    }
  ]
}
```

---

## Creator Endpoints

### 1. List All Creators (Public)

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/creators` |
| **Full URL** | `http://localhost:5001/api/creators?page=1&limit=12` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Query Parameters

| Parameter | Type | Required | Default | Max |
|-----------|------|----------|---------|-----|
| page | number | No | 1 | - |
| limit | number | No | 12 | 50 |

#### Request Example (Axios)

```javascript
const listCreators = async (page = 1, limit = 12) => {
  try {
    const response = await axiosInstance.get('/creators', {
      params: {
        page: Math.max(page, 1),
        limit: Math.min(limit, 50)
      }
    });
    
    console.log('Creators:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to load creators:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "page": 1,
  "totalPages": 5,
  "count": 12,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "avatarUrl": "https://...",
      "creatorProfile": {
        "displayName": "John's Crafts",
        "tagline": "DIY Expert",
        "fullBio": "...",
        "verified": true,
        "followersCount": 150,
        "rating": 4.8
      }
    }
  ]
}
```

---

### 2. Search Creators

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/creators/search` |
| **Full URL** | `http://localhost:5001/api/creators/search?q=john&limit=20` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (name, displayName, tagline, bio) |
| limit | number | No | Max 50, default 20 |

#### Request Example (Axios)

```javascript
const searchCreators = async (query, limit = 20) => {
  try {
    const response = await axiosInstance.get('/creators/search', {
      params: {
        q: query.trim(),
        limit: Math.min(limit, 50)
      }
    });
    
    console.log('Search results:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Search failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

---

### 3. Get Creator Public Profile

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/creators/:creatorId` |
| **Full URL** | `http://localhost:5001/api/creators/507f1f77bcf86cd799439012` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| creatorId | string | Yes | MongoDB ID of creator |

#### Request Example (Axios)

```javascript
const getCreatorPublicProfile = async (creatorId) => {
  try {
    const response = await axiosInstance.get(`/creators/${creatorId}`);
    
    console.log('Creator profile:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load profile:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "https://...",
    "creatorProfile": {
      "displayName": "John's Crafts",
      "tagline": "DIY Expert",
      "fullBio": "Passionate about handmade crafts...",
      "verified": true,
      "followersCount": 150,
      "rating": 4.8,
      "isDeactivated": false
    }
  }
}
```

---

### 4. List Creators by Category

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/creators/category/:categoryId` |
| **Full URL** | `http://localhost:5001/api/creators/category/507f1f77bcf86cd799439050?page=1&limit=12` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| categoryId | string | Yes | MongoDB ID of category |

#### Query Parameters

| Parameter | Type | Required | Default | Max |
|-----------|------|----------|---------|-----|
| page | number | No | 1 | - |
| limit | number | No | 12 | 50 |

#### Request Example (Axios)

```javascript
const listCreatorsByCategory = async (categoryId, page = 1, limit = 12) => {
  try {
    const response = await axiosInstance.get(
      `/creators/category/${categoryId}`,
      {
        params: { page, limit: Math.min(limit, 50) }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to load creators:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 5. Start Creator Onboarding

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/creators/start` |
| **Full URL** | `http://localhost:5001/api/creators/start` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None (user only) |

#### Request Example (Axios)

```javascript
const startCreatorOnboarding = async () => {
  try {
    const response = await axiosInstance.post('/creators/start', {});
    
    console.log('Onboarding started:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to start:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Creator onboarding started"
}
```

---

### 6. Complete Creator Setup

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/creators/complete` |
| **Full URL** | `http://localhost:5001/api/creators/complete` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Request Body

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| displayName | string | Yes | Min 3 chars, max 100 |
| tagline | string | No | Max 100 chars |
| fullBio | string | Yes | Min 20 chars, max 500 |
| portfolio | array | No | Array of URLs |
| categories | array | Yes | Array of category IDs, min 1 |

#### Request Example (Axios)

```javascript
const completeCreatorSetup = async (profileData) => {
  try {
    const response = await axiosInstance.post('/creators/complete', {
      displayName: profileData.displayName.trim(),
      tagline: profileData.tagline?.trim() || "",
      fullBio: profileData.fullBio.trim(),
      portfolio: profileData.portfolio || [],
      categories: profileData.categories
    });
    
    console.log('Creator setup completed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Setup failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Creator profile setup completed",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "displayName": "John's Crafts",
    "tagline": "DIY Expert",
    "fullBio": "...",
    "portfolio": [],
    "categories": ["507f1f77bcf86cd799439050"],
    "verified": false,
    "followersCount": 0,
    "isDeactivated": false
  }
}
```

---

### 7. Get My Creator Profile

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/creators/me/profile` |
| **Full URL** | `http://localhost:5001/api/creators/me/profile` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | creator |

#### Request Example (Axios)

```javascript
const getMyCreatorProfile = async () => {
  try {
    const response = await axiosInstance.get('/creators/me/profile');
    
    console.log('My creator profile:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "creator"
    },
    "creatorProfile": {
      "_id": "507f1f77bcf86cd799439012",
      "displayName": "John's Crafts",
      "tagline": "DIY Expert",
      "fullBio": "...",
      "verified": true,
      "followersCount": 150,
      "rating": 4.8,
      "isDeactivated": false
    }
  }
}
```

---

### 8. Update Creator Profile

| Field | Value |
|-------|-------|
| **Method** | PUT |
| **Endpoint** | `/creators/me/profile` |
| **Full URL** | `http://localhost:5001/api/creators/me/profile` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | creator |

#### Request Body

| Field | Type | Required |
|-------|------|----------|
| displayName | string | No |
| tagline | string | No |
| fullBio | string | No |
| portfolio | array | No |
| categories | array | No |

#### Request Example (Axios)

```javascript
const updateCreatorProfile = async (updates) => {
  try {
    const response = await axiosInstance.put(
      '/creators/me/profile',
      {
        displayName: updates.displayName?.trim(),
        tagline: updates.tagline?.trim(),
        fullBio: updates.fullBio?.trim(),
        portfolio: updates.portfolio,
        categories: updates.categories
      }
    );
    
    console.log('Profile updated:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Update failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Creator profile updated",
  "data": { ... }
}
```

---

### 9. Deactivate Creator Profile

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/creators/me/deactivate` |
| **Full URL** | `http://localhost:5001/api/creators/me/deactivate` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | creator |

#### Request Example (Axios)

```javascript
const deactivateCreator = async () => {
  try {
    const response = await axiosInstance.post('/creators/me/deactivate', {});
    
    console.log('Creator deactivated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Deactivation failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Creator mode deactivated"
}
```

---

### 10. Reactivate Creator Profile

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/creators/me/reactivate` |
| **Full URL** | `http://localhost:5001/api/creators/me/reactivate` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Request Example (Axios)

```javascript
const reactivateCreator = async () => {
  try {
    const response = await axiosInstance.post('/creators/me/reactivate', {});
    
    console.log('Creator reactivated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Reactivation failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Creator mode reactivated"
}
```

---

## Product Endpoints

### 1. List All Products (Explore Feed)

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/products` |
| **Full URL** | `http://localhost:5001/api/products?page=1&limit=12&sort=newest` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Query Parameters

| Parameter | Type | Required | Default | Options |
|-----------|------|----------|---------|---------|
| page | number | No | 1 | - |
| limit | number | No | 12 | max 50 |
| sort | string | No | newest | newest, oldest |

#### Request Example (Axios)

```javascript
const listAllProducts = async (page = 1, limit = 12, sort = 'newest') => {
  try {
    const response = await axiosInstance.get('/products', {
      params: {
        page: Math.max(page, 1),
        limit: Math.min(limit, 50),
        sort: sort
      }
    });
    
    console.log('Products:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to load products:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "page": 1,
  "totalPages": 8,
  "count": 12,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Handmade Ceramic Pot",
      "images": ["https://..."],
      "creatorId": "507f1f77bcf86cd799439012",
      "categoryId": "507f1f77bcf86cd799439050",
      "shortDescription": "Beautiful handcrafted ceramic...",
      "description": "...",
      "averageRating": 4.5,
      "reviewsCount": 12,
      "isCustomizable": true,
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

### 2. Search Products

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/products/search` |
| **Full URL** | `http://localhost:5001/api/products/search?q=ceramic&limit=20` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (title, description) |
| limit | number | No | Max 50, default 20 |

#### Request Example (Axios)

```javascript
const searchProducts = async (query, limit = 20) => {
  try {
    const response = await axiosInstance.get('/products/search', {
      params: {
        q: query.trim(),
        limit: Math.min(limit, 50)
      }
    });
    
    console.log('Search results:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Search failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

---

### 3. Get Product by Category

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/products/category/:categoryId` |
| **Full URL** | `http://localhost:5001/api/products/category/507f1f77bcf86cd799439050?page=1` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| categoryId | string | Yes | MongoDB ID of category |

#### Query Parameters

| Parameter | Type | Required | Default | Max |
|-----------|------|----------|---------|-----|
| page | number | No | 1 | - |
| limit | number | No | 12 | 50 |

#### Request Example (Axios)

```javascript
const getProductsByCategory = async (categoryId, page = 1, limit = 12) => {
  try {
    const response = await axiosInstance.get(
      `/products/category/${categoryId}`,
      {
        params: { page, limit: Math.min(limit, 50) }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 4. Get Products by Creator

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/products/creator/:creatorId` |
| **Full URL** | `http://localhost:5001/api/products/creator/507f1f77bcf86cd799439012?page=1` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| creatorId | string | Yes | MongoDB ID of creator |

#### Query Parameters

| Parameter | Type | Required | Default | Max |
|-----------|------|----------|---------|-----|
| page | number | No | 1 | - |
| limit | number | No | 12 | 50 |

#### Request Example (Axios)

```javascript
const getProductsByCreator = async (creatorId, page = 1, limit = 12) => {
  try {
    const response = await axiosInstance.get(
      `/products/creator/${creatorId}`,
      {
        params: { page, limit: Math.min(limit, 50) }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 5. Get Single Product Details

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/products/:productId` |
| **Full URL** | `http://localhost:5001/api/products/507f1f77bcf86cd799439013` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | MongoDB ID of product |

#### Request Example (Axios)

```javascript
const getProductDetails = async (productId) => {
  try {
    const response = await axiosInstance.get(`/products/${productId}`);
    
    console.log('Product details:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Handmade Ceramic Pot",
    "description": "Beautiful handcrafted ceramic pot...",
    "shortDescription": "Beautiful handcrafted ceramic...",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "price": 29.99,
    "creatorId": "507f1f77bcf86cd799439012",
    "categoryId": "507f1f77bcf86cd799439050",
    "averageRating": 4.5,
    "reviewsCount": 12,
    "isCustomizable": true,
    "customizationOptions": ["Color", "Size"],
    "status": "active",
    "visibility": "public",
    "createdAt": "2024-01-20T10:00:00Z",
    "creatorInfo": {
      "displayName": "John's Crafts",
      "tagline": "DIY Expert",
      "avatarUrl": "https://...",
      "verified": true
    }
  }
}
```

---

### 6. Create Product (Creator)

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/products` |
| **Full URL** | `http://localhost:5001/api/products` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | creator |

#### Request Body

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | Yes | Min 5, max 200 chars |
| description | string | Yes | Min 20, max 5000 chars |
| shortDescription | string | No | Max 500 chars |
| price | number | Yes | Min 0.99, max 10000 |
| images | array | Yes | Min 1 image, max 10 URLs |
| categoryId | string | Yes | Valid MongoDB ID |
| isCustomizable | boolean | No | Default false |
| customizationOptions | array | No | Array of strings |

#### Request Example (Axios)

```javascript
const createProduct = async (productData) => {
  try {
    const response = await axiosInstance.post('/products', {
      title: productData.title.trim(),
      description: productData.description.trim(),
      shortDescription: productData.shortDescription?.trim(),
      price: parseFloat(productData.price),
      images: productData.images,
      categoryId: productData.categoryId,
      isCustomizable: productData.isCustomizable || false,
      customizationOptions: productData.customizationOptions || []
    });
    
    console.log('Product created:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Creation failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 201)

```json
{
  "success": true,
  "message": "Product published successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Handmade Ceramic Pot",
    "description": "...",
    "price": 29.99,
    "creatorId": "507f1f77bcf86cd799439011",
    "status": "active",
    "visibility": "public"
  }
}
```

---

### 7. Update Product (Creator)

| Field | Value |
|-------|-------|
| **Method** | PUT |
| **Endpoint** | `/products/:productId` |
| **Full URL** | `http://localhost:5001/api/products/507f1f77bcf86cd799439013` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | creator |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | MongoDB ID of product (must be creator's own) |

#### Request Body

| Field | Type | Required |
|-------|------|----------|
| title | string | No |
| description | string | No |
| shortDescription | string | No |
| price | number | No |
| images | array | No |
| categoryId | string | No |
| isCustomizable | boolean | No |
| customizationOptions | array | No |

#### Request Example (Axios)

```javascript
const updateProduct = async (productId, updates) => {
  try {
    const response = await axiosInstance.put(
      `/products/${productId}`,
      {
        title: updates.title?.trim(),
        description: updates.description?.trim(),
        price: updates.price ? parseFloat(updates.price) : undefined,
        images: updates.images,
        categoryId: updates.categoryId,
        isCustomizable: updates.isCustomizable,
        customizationOptions: updates.customizationOptions
      }
    );
    
    console.log('Product updated:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Update failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { ... }
}
```

---

### 8. Delete Product (Creator)

| Field | Value |
|-------|-------|
| **Method** | DELETE |
| **Endpoint** | `/products/:productId` |
| **Full URL** | `http://localhost:5001/api/products/507f1f77bcf86cd799439013` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | creator |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | MongoDB ID of product |

#### Request Example (Axios)

```javascript
const deleteProduct = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/products/${productId}`);
    
    console.log('Product deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Deletion failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Product removed successfully"
}
```

---

### 9. Restore Deleted Product (Creator)

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/products/:productId/restore` |
| **Full URL** | `http://localhost:5001/api/products/507f1f77bcf86cd799439013/restore` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | creator |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| productId | string | Yes | MongoDB ID of deleted product |

#### Request Example (Axios)

```javascript
const restoreProduct = async (productId) => {
  try {
    const response = await axiosInstance.post(
      `/products/${productId}/restore`,
      {}
    );
    
    console.log('Product restored:', response.data);
    return response.data;
  } catch (error) {
    console.error('Restore failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Product restored successfully"
}
```

---

### 10. List My Products (Creator Dashboard)

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/products/me/list` |
| **Full URL** | `http://localhost:5001/api/products/me/list` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | creator |

#### Request Example (Axios)

```javascript
const listMyProducts = async () => {
  try {
    const response = await axiosInstance.get('/products/me/list');
    
    console.log('My products:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Handmade Ceramic Pot",
      "price": 29.99,
      "status": "active",
      "averageRating": 4.5,
      "reviewsCount": 12
    }
  ]
}
```

---

## Tutorial Endpoints

### 1. List All Tutorials (Public)

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/tutorials` |
| **Full URL** | `http://localhost:5001/api/tutorials?page=1&limit=12&sort=newest` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Query Parameters

| Parameter | Type | Required | Default | Options |
|-----------|------|----------|---------|---------|
| page | number | No | 1 | - |
| limit | number | No | 12 | max 50 |
| sort | string | No | newest | newest, oldest |

#### Request Example (Axios)

```javascript
const listAllTutorials = async (page = 1, limit = 12, sort = 'newest') => {
  try {
    const response = await axiosInstance.get('/tutorials', {
      params: {
        page: Math.max(page, 1),
        limit: Math.min(limit, 50),
        sort: sort
      }
    });
    
    console.log('Tutorials:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "page": 1,
  "totalPages": 5,
  "count": 12,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "title": "How to Make Ceramic Pots",
      "description": "...",
      "type": "video",
      "duration": 45,
      "creator": { ... },
      "averageRating": 4.7,
      "reviewsCount": 25
    }
  ]
}
```

---

### 2. Search Tutorials

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/tutorials/search` |
| **Full URL** | `http://localhost:5001/api/tutorials/search?q=pottery&limit=20` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (title, description) |
| limit | number | No | Max 50, default 20 |

#### Request Example (Axios)

```javascript
const searchTutorials = async (query, limit = 20) => {
  try {
    const response = await axiosInstance.get('/tutorials/search', {
      params: {
        q: query.trim(),
        limit: Math.min(limit, 50)
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Search failed:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 3. Get Tutorials by Category

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/tutorials/category/:categoryId` |
| **Full URL** | `http://localhost:5001/api/tutorials/category/507f1f77bcf86cd799439050?page=1` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Path Parameters & Query

| Parameter | Type | Required |
|-----------|------|----------|
| categoryId | string (path) | Yes |
| page | number (query) | No |
| limit | number (query) | No |

#### Request Example (Axios)

```javascript
const getTutorialsByCategory = async (categoryId, page = 1) => {
  try {
    const response = await axiosInstance.get(
      `/tutorials/category/${categoryId}`,
      {
        params: { page, limit: 12 }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 4. Get Tutorials by Creator

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/tutorials/creator/:creatorId` |
| **Full URL** | `http://localhost:5001/api/tutorials/creator/507f1f77bcf86cd799439012?page=1` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Request Example (Axios)

```javascript
const getTutorialsByCreator = async (creatorId, page = 1) => {
  try {
    const response = await axiosInstance.get(
      `/tutorials/creator/${creatorId}`,
      {
        params: { page, limit: 12 }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 5. Get Single Tutorial Details

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/tutorials/:tutorialId` |
| **Full URL** | `http://localhost:5001/api/tutorials/507f1f77bcf86cd799439020` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Request Example (Axios)

```javascript
const getTutorialDetails = async (tutorialId) => {
  try {
    const response = await axiosInstance.get(`/tutorials/${tutorialId}`);
    
    console.log('Tutorial details:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "How to Make Ceramic Pots",
    "description": "Complete guide to making handmade ceramic pots...",
    "type": "video",
    "duration": 45,
    "videoUrl": "https://...",
    "thumbnailUrl": "https://...",
    "creatorId": "507f1f77bcf86cd799439012",
    "categoryId": "507f1f77bcf86cd799439050",
    "averageRating": 4.7,
    "reviewsCount": 25,
    "difficulty": "intermediate",
    "creatorInfo": { ... }
  }
}
```

---

### 6. Create Tutorial (Creator)

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/tutorials` |
| **Full URL** | `http://localhost:5001/api/tutorials` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | creator |

#### Request Body

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | Yes | Min 5, max 200 chars |
| description | string | Yes | Min 20, max 5000 chars |
| type | string | Yes | video, article, interactive |
| videoUrl | string | Conditional | Required if type is "video" |
| duration | number | Conditional | Required if type is "video" (in minutes) |
| categoryId | string | Yes | Valid MongoDB ID |
| difficulty | string | No | beginner, intermediate, advanced |
| thumbnailUrl | string | No | Valid image URL |

#### Request Example (Axios)

```javascript
const createTutorial = async (tutorialData) => {
  try {
    const response = await axiosInstance.post('/tutorials', {
      title: tutorialData.title.trim(),
      description: tutorialData.description.trim(),
      type: tutorialData.type,
      videoUrl: tutorialData.videoUrl,
      duration: tutorialData.duration ? parseInt(tutorialData.duration) : null,
      categoryId: tutorialData.categoryId,
      difficulty: tutorialData.difficulty || 'beginner',
      thumbnailUrl: tutorialData.thumbnailUrl
    });
    
    console.log('Tutorial created:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Creation failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 201)

```json
{
  "success": true,
  "message": "Tutorial published successfully",
  "data": { ... }
}
```

---

### 7. Update Tutorial (Creator)

| Field | Value |
|-------|-------|
| **Method** | PUT |
| **Endpoint** | `/tutorials/:tutorialId` |
| **Full URL** | `http://localhost:5001/api/tutorials/507f1f77bcf86cd799439020` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | creator |

#### Request Body

All fields are optional (partial updates supported).

#### Request Example (Axios)

```javascript
const updateTutorial = async (tutorialId, updates) => {
  try {
    const response = await axiosInstance.put(
      `/tutorials/${tutorialId}`,
      {
        title: updates.title?.trim(),
        description: updates.description?.trim(),
        duration: updates.duration ? parseInt(updates.duration) : undefined,
        difficulty: updates.difficulty,
        thumbnailUrl: updates.thumbnailUrl
      }
    );
    
    console.log('Tutorial updated:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Update failed:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 8. Delete Tutorial (Creator)

| Field | Value |
|-------|-------|
| **Method** | DELETE |
| **Endpoint** | `/tutorials/:tutorialId` |
| **Full URL** | `http://localhost:5001/api/tutorials/507f1f77bcf86cd799439020` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | creator |

#### Request Example (Axios)

```javascript
const deleteTutorial = async (tutorialId) => {
  try {
    const response = await axiosInstance.delete(`/tutorials/${tutorialId}`);
    
    console.log('Tutorial deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Deletion failed:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 9. Restore Deleted Tutorial (Creator)

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/tutorials/:tutorialId/restore` |
| **Full URL** | `http://localhost:5001/api/tutorials/507f1f77bcf86cd799439020/restore` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | creator |

#### Request Example (Axios)

```javascript
const restoreTutorial = async (tutorialId) => {
  try {
    const response = await axiosInstance.post(
      `/tutorials/${tutorialId}/restore`,
      {}
    );
    
    console.log('Tutorial restored:', response.data);
    return response.data;
  } catch (error) {
    console.error('Restore failed:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 10. List My Tutorials (Creator Dashboard)

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/tutorials/me/list` |
| **Full URL** | `http://localhost:5001/api/tutorials/me/list` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | creator |

#### Request Example (Axios)

```javascript
const listMyTutorials = async () => {
  try {
    const response = await axiosInstance.get('/tutorials/me/list');
    
    console.log('My tutorials:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

---

## Category Endpoints

### 1. Get All Active Categories (Public)

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/categories` |
| **Full URL** | `http://localhost:5001/api/categories` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Request Example (Axios)

```javascript
const getAllCategories = async () => {
  try {
    const response = await axiosInstance.get('/categories');
    
    console.log('Categories:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "name": "Pottery",
      "slug": "pottery",
      "description": "Handmade pottery items",
      "icon": "🏺",
      "isActive": true
    }
  ]
}
```

---

### 2. Get Category by Slug

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/categories/:slug` |
| **Full URL** | `http://localhost:5001/api/categories/pottery` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| slug | string | Yes | URL-friendly category name |

#### Request Example (Axios)

```javascript
const getCategoryBySlug = async (slug) => {
  try {
    const response = await axiosInstance.get(`/categories/${slug}`);
    
    console.log('Category:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "name": "Pottery",
    "slug": "pottery",
    "description": "Handmade pottery items",
    "icon": "🏺",
    "isActive": true
  }
}
```

---

### 3. Create Category (Admin)

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/categories` |
| **Full URL** | `http://localhost:5001/api/categories` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | admin |

#### Request Body

| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| description | string | No |
| icon | string | No |

#### Request Example (Axios)

```javascript
const createCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post('/categories', {
      name: categoryData.name.trim(),
      description: categoryData.description?.trim(),
      icon: categoryData.icon
    });
    
    console.log('Category created:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Creation failed:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 4. Update Category (Admin)

| Field | Value |
|-------|-------|
| **Method** | PUT |
| **Endpoint** | `/categories/:id` |
| **Full URL** | `http://localhost:5001/api/categories/507f1f77bcf86cd799439050` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | admin |

#### Request Example (Axios)

```javascript
const updateCategory = async (categoryId, updates) => {
  try {
    const response = await axiosInstance.put(
      `/categories/${categoryId}`,
      {
        name: updates.name?.trim(),
        description: updates.description?.trim(),
        icon: updates.icon
      }
    );
    
    console.log('Category updated:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Update failed:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 5. Deactivate Category (Admin)

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/categories/:id/deactivate` |
| **Full URL** | `http://localhost:5001/api/categories/507f1f77bcf86cd799439050/deactivate` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | admin |

#### Request Example (Axios)

```javascript
const deactivateCategory = async (categoryId) => {
  try {
    const response = await axiosInstance.post(
      `/categories/${categoryId}/deactivate`,
      {}
    );
    
    console.log('Category deactivated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Deactivation failed:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 6. Reactivate Category (Admin)

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/categories/:id/reactivate` |
| **Full URL** | `http://localhost:5001/api/categories/507f1f77bcf86cd799439050/reactivate` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | admin |

#### Request Example (Axios)

```javascript
const reactivateCategory = async (categoryId) => {
  try {
    const response = await axiosInstance.post(
      `/categories/${categoryId}/reactivate`,
      {}
    );
    
    console.log('Category reactivated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Reactivation failed:', error.response?.data?.message);
    throw error;
  }
};
```

---

## Review Endpoints

### 1. Get Reviews for Target

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/reviews/:targetType/:targetId` |
| **Full URL** | `http://localhost:5001/api/reviews/product/507f1f77bcf86cd799439013` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Options |
|-----------|------|----------|---------|
| targetType | string | Yes | product, tutorial |
| targetId | string | Yes | MongoDB ID |

#### Request Example (Axios)

```javascript
const getReviews = async (targetType, targetId) => {
  try {
    const response = await axiosInstance.get(
      `/reviews/${targetType}/${targetId}`
    );
    
    console.log('Reviews:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "userId": "507f1f77bcf86cd799439011",
      "rating": 5,
      "comment": "Excellent product!",
      "createdAt": "2024-01-20T10:00:00Z",
      "user": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Jane Doe",
        "avatarUrl": "https://..."
      }
    }
  ]
}
```

---

### 2. Create Review

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/reviews` |
| **Full URL** | `http://localhost:5001/api/reviews` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Request Body

| Field | Type | Required | Options |
|-------|------|----------|---------|
| targetId | string | Yes | MongoDB ID |
| targetType | string | Yes | product, tutorial |
| rating | number | No | 1-5 (or null) |
| comment | string | No | Max 1000 chars (or empty) |

#### Request Example (Axios)

```javascript
const createReview = async (reviewData) => {
  try {
    const response = await axiosInstance.post('/reviews', {
      targetId: reviewData.targetId,
      targetType: reviewData.targetType,
      rating: reviewData.rating || null,
      comment: reviewData.comment?.trim() || ""
    });
    
    console.log('Review created:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Creation failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 201)

```json
{
  "success": true,
  "message": "Feedback submitted",
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "userId": "507f1f77bcf86cd799439011",
    "targetId": "507f1f77bcf86cd799439013",
    "targetType": "product",
    "rating": 5,
    "comment": "Excellent product!",
    "createdAt": "2024-01-20T10:00:00Z"
  }
}
```

---

### 3. Update Review

| Field | Value |
|-------|-------|
| **Method** | PUT |
| **Endpoint** | `/reviews/:reviewId` |
| **Full URL** | `http://localhost:5001/api/reviews/507f1f77bcf86cd799439030` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| reviewId | string | Yes | MongoDB ID (must be own review) |

#### Request Body

| Field | Type | Required |
|-------|------|----------|
| rating | number | No |
| comment | string | No |

#### Request Example (Axios)

```javascript
const updateReview = async (reviewId, updates) => {
  try {
    const response = await axiosInstance.put(
      `/reviews/${reviewId}`,
      {
        rating: updates.rating || null,
        comment: updates.comment?.trim()
      }
    );
    
    console.log('Review updated:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Update failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Feedback updated",
  "data": { ... }
}
```

---

### 4. Delete Review

| Field | Value |
|-------|-------|
| **Method** | DELETE |
| **Endpoint** | `/reviews/:reviewId` |
| **Full URL** | `http://localhost:5001/api/reviews/507f1f77bcf86cd799439030` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Request Example (Axios)

```javascript
const deleteReview = async (reviewId) => {
  try {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    
    console.log('Review deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Deletion failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Feedback removed"
}
```

---

## Report Endpoints

### 1. Submit Report

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/reports` |
| **Full URL** | `http://localhost:5001/api/reports` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Request Body

| Field | Type | Required | Options |
|-------|------|----------|---------|
| targetId | string | Yes | MongoDB ID |
| targetType | string | Yes | product, tutorial, user |
| reasonCode | string | Yes | inappropriate, spam, scam, other |
| additionalNote | string | No | Max 500 chars |

#### Request Example (Axios)

```javascript
const submitReport = async (reportData) => {
  try {
    const response = await axiosInstance.post('/reports', {
      targetId: reportData.targetId,
      targetType: reportData.targetType,
      reasonCode: reportData.reasonCode,
      additionalNote: reportData.additionalNote?.trim() || ""
    });
    
    console.log('Report submitted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Submission failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 201)

```json
{
  "success": true,
  "message": "Report submitted",
  "action": "stored|hidden|warned"
}
```

---

### 2. Get Reports for Target (Self Only)

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/reports/:targetType/:targetId` |
| **Full URL** | `http://localhost:5001/api/reports/product/507f1f77bcf86cd799439013` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| targetType | string | Yes |
| targetId | string | Yes |

#### Request Example (Axios)

```javascript
const getReportsForTarget = async (targetType, targetId) => {
  try {
    const response = await axiosInstance.get(
      `/reports/${targetType}/${targetId}`
    );
    
    console.log('Reports:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 3,
  "data": [ ... ]
}
```

---

## Chat Endpoints

### 1. List My Conversations

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/chat/conversations` |
| **Full URL** | `http://localhost:5001/api/chat/conversations` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Request Example (Axios)

```javascript
const listMyConversations = async () => {
  try {
    const response = await axiosInstance.get('/chat/conversations');
    
    console.log('Conversations:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "participants": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
      "otherUserName": "John Doe",
      "lastMessage": "Thanks for the help!",
      "lastMessageAt": "2024-01-25T10:00:00Z",
      "unreadCount": 2
    }
  ]
}
```

---

### 2. Open Conversation with User

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/chat/open/:userId` |
| **Full URL** | `http://localhost:5001/api/chat/open/507f1f77bcf86cd799439012` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | MongoDB ID of user to chat with |

#### Request Example (Axios)

```javascript
const openConversation = async (userId) => {
  try {
    const response = await axiosInstance.post(
      `/chat/open/${userId}`,
      {}
    );
    
    console.log('Conversation opened:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to open:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Conversation retrieved/created",
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "participants": [ ... ],
    "conversationId": "507f1f77bcf86cd799439040"
  }
}
```

---

### 3. Get Messages in Conversation

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/chat/:conversationId` |
| **Full URL** | `http://localhost:5001/api/chat/507f1f77bcf86cd799439040` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| conversationId | string | Yes | MongoDB ID of conversation |

#### Request Example (Axios)

```javascript
const getMessages = async (conversationId) => {
  try {
    const response = await axiosInstance.get(`/chat/${conversationId}`);
    
    console.log('Messages:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439041",
      "sender": "507f1f77bcf86cd799439011",
      "message": "Hi there!",
      "createdAt": "2024-01-25T10:00:00Z",
      "senderInfo": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Jane Doe",
        "avatarUrl": "https://..."
      }
    }
  ]
}
```

---

### 4. Send Message

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/chat/:conversationId` |
| **Full URL** | `http://localhost:5001/api/chat/507f1f77bcf86cd799439040` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {token}` |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| conversationId | string | Yes | MongoDB ID of conversation |

#### Request Body

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| message | string | Yes | Min 1, max 5000 chars |

#### Request Example (Axios)

```javascript
const sendMessage = async (conversationId, message) => {
  try {
    const response = await axiosInstance.post(
      `/chat/${conversationId}`,
      {
        message: message.trim()
      }
    );
    
    console.log('Message sent:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to send:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 201)

```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "_id": "507f1f77bcf86cd799439041",
    "sender": "507f1f77bcf86cd799439011",
    "message": "Thanks for the help!",
    "createdAt": "2024-01-25T10:05:00Z"
  }
}
```

---

## Chatbot Endpoints

### 1. Analyze Image with Chatbot

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/chatbot/analyze` |
| **Full URL** | `http://localhost:5001/api/chatbot/analyze` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Content-Type** | multipart/form-data |
| **Role Required** | None |

#### Request Body (Multipart Form Data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | file | Yes | Image file (max 10MB) |
| text | string | No | User's description/query |
| sessionId | string | No | Existing session ID to continue conversation |

#### Request Example (Axios)

```javascript
const analyzeImage = async (imageFile, text = "", sessionId = "") => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (text) formData.append('text', text);
    if (sessionId) formData.append('sessionId', sessionId);
    
    // Important: Don't set Content-Type header, axios handles it
    const response = await axiosInstance.post(
      '/chatbot/analyze',
      formData
      // axios automatically sets Content-Type: multipart/form-data
    );
    
    console.log('Analysis:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Analysis failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "sessionId": "sess_5bae1c3d-6c4a-49b3-a09d-4c0a9a769ad5",
    "analysis": "Based on the image, this appears to be... [AI analysis]",
    "suggestions": ["You could make...", "Try using..."],
    "relatedProducts": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Ceramic Tools Set",
        "price": 19.99
      }
    ]
  }
}
```

---

### 2. Generate Image with AI

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/chatbot/generate-image` |
| **Full URL** | `http://localhost:5001/api/chatbot/generate-image` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt | string | Yes | Detailed image description (max 500 chars) |
| sessionId | string | No | Session ID for context |

#### Request Example (Axios)

```javascript
const generateImage = async (prompt, sessionId = "") => {
  try {
    const response = await axiosInstance.post('/chatbot/generate-image', {
      prompt: prompt.trim(),
      sessionId: sessionId
    });
    
    console.log('Image generated:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Generation failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "imageUrl": "https://generated-image-url.jpg",
    "sessionId": "sess_5bae1c3d-6c4a-49b3-a09d-4c0a9a769ad5",
    "generatedAt": "2024-01-25T10:00:00Z"
  }
}
```

---

### 3. Get Chatbot Session

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/chatbot/session/:sessionId` |
| **Full URL** | `http://localhost:5001/api/chatbot/session/sess_5bae1c3d-6c4a-49b3-a09d-4c0a9a769ad5` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | string | Yes | Session ID |

#### Request Example (Axios)

```javascript
const getChatbotSession = async (sessionId) => {
  try {
    const response = await axiosInstance.get(`/chatbot/session/${sessionId}`);
    
    console.log('Session:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "_id": "sess_5bae1c3d-6c4a-49b3-a09d-4c0a9a769ad5",
    "title": "DIY Pottery Bowl",
    "status": "active",
    "messages": [ ... ],
    "createdAt": "2024-01-25T10:00:00Z",
    "lastActivityAt": "2024-01-25T10:15:00Z"
  }
}
```

---

### 4. End Chatbot Session

| Field | Value |
|-------|-------|
| **Method** | DELETE |
| **Endpoint** | `/chatbot/session/:sessionId` |
| **Full URL** | `http://localhost:5001/api/chatbot/session/sess_5bae1c3d-6c4a-49b3-a09d-4c0a9a769ad5` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Request Example (Axios)

```javascript
const endChatbotSession = async (sessionId) => {
  try {
    const response = await axiosInstance.delete(`/chatbot/session/${sessionId}`);
    
    console.log('Session ended:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to end session:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Session ended"
}
```

---

### 5. List All Chatbot Sessions (Admin)

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/chatbot/admin/sessions` |
| **Full URL** | `http://localhost:5001/api/chatbot/admin/sessions` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Request Example (Axios)

```javascript
const listChatbotSessions = async () => {
  try {
    const response = await axiosInstance.get('/chatbot/admin/sessions');
    
    console.log('Sessions:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 10,
  "data": [ ... ]
}
```

---

## Admin Endpoints

### 1. Admin Login

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/admin/login` |
| **Full URL** | `http://localhost:5001/api/admin/login` |
| **Authentication Required** | No |
| **Auth Header** | Not needed |
| **Role Required** | None |

#### Request Body

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

#### Request Example (Axios)

```javascript
const adminLogin = async (email, password) => {
  try {
    const response = await axiosInstance.post(
      '/admin/login',
      {
        email: email.toLowerCase().trim(),
        password: password
      }
    );
    
    const { token } = response.data.data;
    localStorage.setItem('adminToken', token);
    
    console.log('Admin login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "token": "eyJhbGc...",
    "admin": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

---

### 2. List Pending Creator Verifications

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/admin/creators/verification/pending` |
| **Full URL** | `http://localhost:5001/api/admin/creators/verification/pending` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {adminToken}` |
| **Role Required** | admin |

#### Request Example (Axios)

```javascript
const listPendingCreators = async () => {
  try {
    const response = await axiosInstance.get(
      '/admin/creators/verification/pending'
    );
    
    console.log('Pending creators:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "creatorProfile": {
        "displayName": "John's Crafts",
        "fullBio": "...",
        "followersCount": 50,
        "verified": false
      },
      "priorityScore": 8.5,
      "submittedAt": "2024-01-25T10:00:00Z"
    }
  ]
}
```

---

### 3. Approve Creator Verification

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/admin/creators/:creatorId/verify` |
| **Full URL** | `http://localhost:5001/api/admin/creators/507f1f77bcf86cd799439012/verify` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {adminToken}` |
| **Role Required** | admin |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| creatorId | string | Yes | MongoDB ID of creator user |

#### Request Example (Axios)

```javascript
const approveCreator = async (creatorId) => {
  try {
    const response = await axiosInstance.post(
      `/admin/creators/${creatorId}/verify`,
      {}
    );
    
    console.log('Creator approved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Approval failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Creator verified successfully"
}
```

---

### 4. Reject Creator Verification

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/admin/creators/:creatorId/reject` |
| **Full URL** | `http://localhost:5001/api/admin/creators/507f1f77bcf86cd799439012/reject` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {adminToken}` |
| **Role Required** | admin |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| creatorId | string | Yes | MongoDB ID of creator user |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | No | Reason for rejection |

#### Request Example (Axios)

```javascript
const rejectCreator = async (creatorId, reason) => {
  try {
    const response = await axiosInstance.post(
      `/admin/creators/${creatorId}/reject`,
      {
        reason: reason || "Application does not meet standards"
      }
    );
    
    console.log('Creator rejected:', response.data);
    return response.data;
  } catch (error) {
    console.error('Rejection failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Creator application rejected"
}
```

---

### 5. Revoke Creator Verification

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/admin/creators/:creatorId/revoke` |
| **Full URL** | `http://localhost:5001/api/admin/creators/507f1f77bcf86cd799439012/revoke` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {adminToken}` |
| **Role Required** | admin |

#### Request Example (Axios)

```javascript
const revokeCreator = async (creatorId) => {
  try {
    const response = await axiosInstance.post(
      `/admin/creators/${creatorId}/revoke`,
      {}
    );
    
    console.log('Creator verification revoked:', response.data);
    return response.data;
  } catch (error) {
    console.error('Revocation failed:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 6. List Priority Reports

| Field | Value |
|-------|-------|
| **Method** | GET |
| **Endpoint** | `/admin/reports/priority` |
| **Full URL** | `http://localhost:5001/api/admin/reports/priority` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {adminToken}` |
| **Role Required** | admin |

#### Request Example (Axios)

```javascript
const listPriorityReports = async () => {
  try {
    const response = await axiosInstance.get('/admin/reports/priority');
    
    console.log('Priority reports:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to load:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": {
        "targetType": "product",
        "targetId": "507f1f77bcf86cd799439013"
      },
      "count": 5,
      "latestAt": "2024-01-25T10:00:00Z",
      "priority": 9.2
    }
  ]
}
```

---

### 7. Hide Content

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/admin/content/:targetType/:targetId/hide` |
| **Full URL** | `http://localhost:5001/api/admin/content/product/507f1f77bcf86cd799439013/hide` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {adminToken}` |
| **Role Required** | admin |

#### Path Parameters

| Parameter | Type | Required | Options |
|-----------|------|----------|---------|
| targetType | string | Yes | product, tutorial |
| targetId | string | Yes | MongoDB ID |

#### Request Example (Axios)

```javascript
const hideContent = async (targetType, targetId) => {
  try {
    const response = await axiosInstance.post(
      `/admin/content/${targetType}/${targetId}/hide`,
      {}
    );
    
    console.log('Content hidden:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to hide:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Content hidden from feed"
}
```

---

### 8. Restore Hidden Content

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/admin/content/:targetType/:targetId/restore` |
| **Full URL** | `http://localhost:5001/api/admin/content/product/507f1f77bcf86cd799439013/restore` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {adminToken}` |
| **Role Required** | admin |

#### Request Example (Axios)

```javascript
const restoreContent = async (targetType, targetId) => {
  try {
    const response = await axiosInstance.post(
      `/admin/content/${targetType}/${targetId}/restore`,
      {}
    );
    
    console.log('Content restored:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to restore:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 9. Remove Content Permanently

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/admin/content/:targetType/:targetId/remove` |
| **Full URL** | `http://localhost:5001/api/admin/content/product/507f1f77bcf86cd799439013/remove` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {adminToken}` |
| **Role Required** | admin |

#### Request Example (Axios)

```javascript
const removeContent = async (targetType, targetId) => {
  try {
    const response = await axiosInstance.post(
      `/admin/content/${targetType}/${targetId}/remove`,
      {}
    );
    
    console.log('Content removed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to remove:', error.response?.data?.message);
    throw error;
  }
};
```

---

### 10. Moderate User Account

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/admin/moderate/:targetId` |
| **Full URL** | `http://localhost:5001/api/admin/moderate/507f1f77bcf86cd799439011` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {adminToken}` |
| **Role Required** | admin |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| targetId | string | Yes | MongoDB ID of user to moderate |

#### Request Body

| Field | Type | Required | Options |
|-------|------|----------|---------|
| action | string | Yes | block, unblock, warn, clear_warning |
| reason | string | No | Moderation reason |

#### Request Example (Axios)

```javascript
const moderateUser = async (userId, action, reason = "") => {
  try {
    const response = await axiosInstance.post(
      `/admin/moderate/${userId}`,
      {
        action: action, // block, unblock, warn, clear_warning
        reason: reason.trim()
      }
    );
    
    console.log('User moderated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Moderation failed:', error.response?.data?.message);
    throw error;
  }
};
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "User account blocked"
}
```

---

### 11. Resolve Report

| Field | Value |
|-------|-------|
| **Method** | POST |
| **Endpoint** | `/admin/reports/:reportId/resolve` |
| **Full URL** | `http://localhost:5001/api/admin/reports/507f1f77bcf86cd799439031/resolve` |
| **Authentication Required** | Yes |
| **Auth Header** | `Authorization: Bearer {adminToken}` |
| **Role Required** | admin |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| reportId | string | Yes | MongoDB ID of report |

#### Request Body

| Field | Type | Required | Options |
|-------|------|----------|---------|
| resolution | string | Yes | approved, rejected, no_action |
| note | string | No | Admin notes |

#### Request Example (Axios)

```javascript
const resolveReport = async (reportId, resolution, note = "") => {
  try {
    const response = await axiosInstance.post(
      `/admin/reports/${reportId}/resolve`,
      {
        resolution: resolution,
        note: note.trim()
      }
    );
    
    console.log('Report resolved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Resolution failed:', error.response?.data?.message);
    throw error;
  }
};
```

---

## Quick Reference Table - All Endpoints

| # | Module | Method | Endpoint | Auth | Role | Status |
|---|--------|--------|----------|------|------|--------|
| 1 | Auth | POST | /auth/register | No | - | ✓ |
| 2 | Auth | POST | /auth/login | No | - | ✓ |
| 3 | Auth | GET | /auth/verify-email | No | - | ✓ |
| 4 | Auth | POST | /auth/resend-verification | No | - | ✓ |
| 5 | Auth | POST | /auth/forgot-password | No | - | ✓ |
| 6 | Auth | POST | /auth/reset-password | No | - | ✓ |
| 7 | Auth | POST | /auth/logout | Yes | - | ✓ |
| 8 | Users | GET | /users/me/profile | Yes | - | ✓ |
| 9 | Users | PUT | /users/me/profile | Yes | - | ✓ |
| 10 | Users | POST | /users/follow/:creatorId | Yes | - | ✓ |
| 11 | Users | POST | /users/unfollow/:creatorId | Yes | - | ✓ |
| 12 | Users | GET | /users/me/following | Yes | - | ✓ |
| 13 | Users | POST | /users/favorites/:productId | Yes | - | ✓ |
| 14 | Users | DELETE | /users/favorites/:productId | Yes | - | ✓ |
| 15 | Users | GET | /users/me/favorites | Yes | - | ✓ |
| 16 | Creators | GET | /creators | No | - | ✓ |
| 17 | Creators | GET | /creators/search | No | - | ✓ |
| 18 | Creators | GET | /creators/:creatorId | No | - | ✓ |
| 19 | Creators | GET | /creators/category/:categoryId | No | - | ✓ |
| 20 | Creators | POST | /creators/start | Yes | - | ✓ |
| 21 | Creators | POST | /creators/complete | Yes | - | ✓ |
| 22 | Creators | GET | /creators/me/profile | Yes | creator | ✓ |
| 23 | Creators | PUT | /creators/me/profile | Yes | creator | ✓ |
| 24 | Creators | POST | /creators/me/deactivate | Yes | creator | ✓ |
| 25 | Creators | POST | /creators/me/reactivate | Yes | - | ✓ |
| 26 | Products | GET | /products | No | - | ✓ |
| 27 | Products | GET | /products/search | No | - | ✓ |
| 28 | Products | GET | /products/category/:categoryId | No | - | ✓ |
| 29 | Products | GET | /products/creator/:creatorId | No | - | ✓ |
| 30 | Products | GET | /products/:productId | No | - | ✓ |
| 31 | Products | POST | /products | Yes | creator | ✓ |
| 32 | Products | PUT | /products/:productId | Yes | creator | ✓ |
| 33 | Products | DELETE | /products/:productId | Yes | creator | ✓ |
| 34 | Products | POST | /products/:productId/restore | Yes | creator | ✓ |
| 35 | Products | GET | /products/me/list | Yes | creator | ✓ |
| 36 | Tutorials | GET | /tutorials | No | - | ✓ |
| 37 | Tutorials | GET | /tutorials/search | No | - | ✓ |
| 38 | Tutorials | GET | /tutorials/category/:categoryId | No | - | ✓ |
| 39 | Tutorials | GET | /tutorials/creator/:creatorId | No | - | ✓ |
| 40 | Tutorials | GET | /tutorials/:tutorialId | No | - | ✓ |
| 41 | Tutorials | POST | /tutorials | Yes | creator | ✓ |
| 42 | Tutorials | PUT | /tutorials/:tutorialId | Yes | creator | ✓ |
| 43 | Tutorials | DELETE | /tutorials/:tutorialId | Yes | creator | ✓ |
| 44 | Tutorials | POST | /tutorials/:tutorialId/restore | Yes | creator | ✓ |
| 45 | Tutorials | GET | /tutorials/me/list | Yes | creator | ✓ |
| 46 | Categories | GET | /categories | No | - | ✓ |
| 47 | Categories | GET | /categories/:slug | No | - | ✓ |
| 48 | Categories | POST | /categories | Yes | admin | ✓ |
| 49 | Categories | PUT | /categories/:id | Yes | admin | ✓ |
| 50 | Categories | POST | /categories/:id/deactivate | Yes | admin | ✓ |
| 51 | Categories | POST | /categories/:id/reactivate | Yes | admin | ✓ |
| 52 | Reviews | GET | /reviews/:targetType/:targetId | No | - | ✓ |
| 53 | Reviews | POST | /reviews | Yes | - | ✓ |
| 54 | Reviews | PUT | /reviews/:reviewId | Yes | - | ✓ |
| 55 | Reviews | DELETE | /reviews/:reviewId | Yes | - | ✓ |
| 56 | Reports | POST | /reports | Yes | - | ✓ |
| 57 | Reports | GET | /reports/:targetType/:targetId | Yes | - | ✓ |
| 58 | Chat | GET | /chat/conversations | Yes | - | ✓ |
| 59 | Chat | POST | /chat/open/:userId | Yes | - | ✓ |
| 60 | Chat | GET | /chat/:conversationId | Yes | - | ✓ |
| 61 | Chat | POST | /chat/:conversationId | Yes | - | ✓ |
| 62 | Chatbot | POST | /chatbot/analyze | No | - | ✓ |
| 63 | Chatbot | POST | /chatbot/generate-image | No | - | ✓ |
| 64 | Chatbot | GET | /chatbot/session/:sessionId | No | - | ✓ |
| 65 | Chatbot | DELETE | /chatbot/session/:sessionId | No | - | ✓ |
| 66 | Chatbot | GET | /chatbot/admin/sessions | No | - | ✓ |
| 67 | Admin | POST | /admin/login | No | - | ✓ |
| 68 | Admin | GET | /admin/creators/verification/pending | Yes | admin | ✓ |
| 69 | Admin | POST | /admin/creators/:creatorId/verify | Yes | admin | ✓ |
| 70 | Admin | POST | /admin/creators/:creatorId/reject | Yes | admin | ✓ |
| 71 | Admin | POST | /admin/creators/:creatorId/revoke | Yes | admin | ✓ |
| 72 | Admin | GET | /admin/reports/priority | Yes | admin | ✓ |
| 73 | Admin | POST | /admin/content/:targetType/:targetId/hide | Yes | admin | ✓ |
| 74 | Admin | POST | /admin/content/:targetType/:targetId/restore | Yes | admin | ✓ |
| 75 | Admin | POST | /admin/content/:targetType/:targetId/remove | Yes | admin | ✓ |
| 76 | Admin | POST | /admin/moderate/:targetId | Yes | admin | ✓ |
| 77 | Admin | POST | /admin/reports/:reportId/resolve | Yes | admin | ✓ |

---

## Common Axios Patterns & Best Practices

### Error Handling Pattern

```javascript
try {
  const response = await axiosInstance.get('/endpoint');
  return response.data;
} catch (error) {
  // Handle different status codes
  if (error.response?.status === 401) {
    // Unauthorized - clear token and redirect
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Forbidden - show permission error
    console.error('Permission denied');
  } else if (error.response?.status === 404) {
    // Not found - show 404 page
    console.error('Resource not found');
  } else if (error.response?.status === 500) {
    // Server error
    console.error('Server error');
  }
  
  throw error;
}
```

### Request Cancellation (for list views with pagination)

```javascript
let cancelTokenSource = null;

const fetchProducts = async (page) => {
  // Cancel previous request if still pending
  if (cancelTokenSource) {
    cancelTokenSource.cancel('Request cancelled');
  }
  
  cancelTokenSource = axios.CancelToken.source();
  
  try {
    const response = await axiosInstance.get('/products', {
      params: { page },
      cancelToken: cancelTokenSource.token
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request was cancelled');
    } else {
      throw error;
    }
  }
};
```

### File Upload (Chatbot Image)

```javascript
const uploadImage = async (file, additionalData = {}) => {
  const formData = new FormData();
  formData.append('image', file);
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key]);
  });
  
  // DO NOT manually set Content-Type header
  // axios will automatically set it to multipart/form-data
  const response = await axiosInstance.post(
    '/chatbot/analyze',
    formData
  );
  
  return response.data;
};
```

### Rate Limiting Handling

```javascript
let requestCount = 0;
const maxRequests = 10;
const resetTime = 60000; // 1 minute

const checkRateLimit = async () => {
  if (requestCount >= maxRequests) {
    showError('Too many requests. Please wait a moment.');
    return false;
  }
  requestCount++;
  return true;
};

// Reset counter periodically
setInterval(() => {
  requestCount = 0;
}, resetTime);
```

---

**Document Complete**  
**Total Endpoints:** 77  
**All endpoints include:** Method, URL, Auth requirements, Parameters, Headers, Request/Response examples with Axios implementation
