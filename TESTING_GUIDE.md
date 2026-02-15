# CreateSphere Project Test Cases Documentation

This document outlines the comprehensive test cases for the CreateSphere platform, covering Authentication, Image Processing, AI Chatbot functionality, and more.

---

## 1. User Authentication & Authorization
### Registration
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| AUTH_REG_01 | Register with valid details (Name, Email, Password) | Account created, verification email sent. |
| AUTH_REG_02 | Register with an already existing email | Error: "Email already registered." |
| AUTH_REG_03 | Register with weak password (e.g., < 6 chars) | Validation error: Password too short. |
| AUTH_REG_04 | Register with invalid email format (no @ or .com) | Validation error: Invalid email format. |

### Email Verification
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| AUTH_VER_01 | Click valid verification link from email | Account verified, user can now login. |
| AUTH_VER_02 | Click expired or malformed verification link | Error: "Invalid or expired token." |
| AUTH_VER_03 | Attempt to login before verifying email | Error: "Please verify your email to login." |

### Login/Logout
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| AUTH_LOG_01 | Login with correct credentials | JWT token issued, user redirected to Home/Dashboard. |
| AUTH_LOG_02 | Login with incorrect password | Error: "Invalid credentials." |
| AUTH_LOG_03 | Request password reset for existing email | Reset link sent to email. |
| AUTH_LOG_04 | Logout from session | Session cleared, user redirected to login page. |

---

## 2. Image Uploading & Profile Management
### Avatar Upload
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| IMG_UPL_01 | Upload a valid PNG/JPG image as profile picture | Image successfully uploaded and displayed. |
| IMG_UPL_02 | Upload a very large file (> 5MB) | Error: "File too large." |
| IMG_UPL_03 | Upload a non-image file (e.g., .txt, .pdf) | Error: "Invalid file type." |
| IMG_UPL_04 | Update profile details (Name, Bio) without image | Details updated successfully. |

---

## 3. AI Chatbot: Waste Material Analysis (Vision)
### Image Analysis
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| CHAT_VIS_01 | Upload image of a plastic bottle and cardboard | AI correctly identifies "plastic bottle" and "cardboard" as materials. |
| CHAT_VIS_02 | Upload image with no recognizable materials | AI responds naturally asking for a clearer picture. |
| CHAT_VIS_03 | Send text description of materials instead of image | AI extracts materials from text correctly. |
| CHAT_VIS_04 | Upload high-resolution image (> 2K) | System handles processing without timeout. |

---

## 4. AI Chatbot: Craft Idea Generation
### Generation Logic
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| CHAT_GEN_01 | Request 3 craft ideas for "Plastic Bottle" | AI returns exactly 3 cards with steps and descriptions. |
| CHAT_GEN_02 | Request ideas for materials that don't make sense (e.g. "dirt") | AI provides creative reuse suggestions OR asks for more items. |
| CHAT_GEN_03 | View YouTube links for a generated idea | Links lead to relevant DIY tutorials. |
| CHAT_GEN_04 | Ask a follow-up question (e.g., "Can I use glue instead?") | AI responds conversationally based on session history. |

---

## 5. AI Chatbot: Craft Visualization (Image Generation)
### FLUX Generation
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| CHAT_IMG_01 | Click "Visualize" on a generated craft card | AI generates a realistic image of the finished craft using FLUX. |
| CHAT_IMG_02 | Generate multiple visualizations in one session | Each image is stored and accessible in the chat history. |
| CHAT_IMG_03 | Prompt injection/Safety check | AI Filters or refuses inappropriate image prompts. |

---

## 6. Admin Verification System
### Creator Verification
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| ADMIN_VER_01 | Admin approves a pending creator application | User role changes to 'verified creator'. |
| ADMIN_VER_02 | Admin rejects an application with feedback | Creator remains 'unverified', sees feedback in profile. |
| ADMIN_VER_03 | Auto-verification check (e.g. 2 products + 3 reviews) | User is automatically flagged as 'verified' by system logic. |

---

## 7. Community & Social Features
### Follow/Unfollow
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| SOC_FOL_01 | Follow a creator | Follower count increases, button changes to "Following". |
| SOC_FOL_02 | Refresh page after following | State persists (still shows "Following"). |
| SOC_FOL_03 | Unfollow a creator | Follower count decreases, button changes back to "Follow". |

---

## 9. Product & Tutorial Reviews
### Review Submission
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| REV_SUB_01 | Submit a 5-star rating and comment on a product | Feedback submitted successfully; rating visible on product card. |
| REV_SUB_02 | Submit only a rating (no comment) | Supported; rating is recorded and average updated. |
| REV_SUB_03 | Submit a review on a tutorial | Success; tutorial's feedback section updates. |
| REV_SUB_04 | Attempt to review a non-existent product ID | Error: "Target not found." |

### Management & Stats
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| REV_MGT_01 | Edit a previously submitted comment | Review is updated and timestamped. |
| REV_MGT_02 | Delete a review | Review removed; product/tutorial average rating recalculated. |
| REV_MGT_03 | Auto-Verify Creator (Review Trigger) | If creator reaches 3 reviews, check if auto-verification status updates. |

---

## 10. Reporting & Moderation
### User Reporting
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| RPT_SUB_01 | Report a product for "Inappropriate Content" | Report stored; creator notified in dashboard. |
| RPT_SUB_02 | Attempt to report the same item twice (same user) | Error: "You have already reported this item." |
| RPT_SUB_03 | Report with an empty reason code | Validation error if not provided. |

### Auto-Moderation (Thresholds)
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| RPT_MOD_01 | Item reaches 3 reports from different users | System automatically flags/hides item (Auto-strike). |
| RPT_MOD_02 | Admin views reported items list | List displays targets with highest report counts first. |
| RPT_MOD_03 | Admin clears a report / Validates content | Strike removed; item status restored to "active". |
---

## 11. General UI/UX & Edge Cases
### Responsiveness & Design
| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| UI_NAV_01 | Toggle Dark/Light mode | All components (cards, sidebar, text) adapt theme instantly. |
| UI_NAV_02 | Access chat on mobile device | Layout is responsive, floating chat button works. |
| UI_ERR_01 | Access a protected route without login | Redirected to login page. |
| UI_ERR_02 | 404 Page (Invalid URL) | Custom "Not Found" page appears with a link back to Home. |
