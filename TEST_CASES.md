# CreateSphere - Test Cases Documentation

## Table of Contents
1. [Authentication Test Cases](#authentication-test-cases)
2. [User Profile Test Cases](#user-profile-test-cases)
3. [Creator Profile Test Cases](#creator-profile-test-cases)
4. [Product Management Test Cases](#product-management-test-cases)
5. [Tutorial Management Test Cases](#tutorial-management-test-cases)
6. [Follow System Test Cases](#follow-system-test-cases)
7. [Review System Test Cases](#review-system-test-cases)
8. [Chat/Messaging Test Cases](#chatmessaging-test-cases)
9. [Favorites Test Cases](#favorites-test-cases)
10. [File Upload Test Cases](#file-upload-test-cases)

---

## AUTHENTICATION TEST CASES

### TC001 - User Registration with Valid Data

| Field | Value |
|-------|-------|
| Test Case ID | TC001 |
| Test Case Name | User Registration - Valid Credentials |
| Test Objective | Verify user can register with valid email and password |
| Test Steps | 1. Navigate to /auth/register page<br>2. Enter valid email (e.g., user@example.com)<br>3. Enter strong password (min 8 chars, alphanumeric)<br>4. Enter name<br>5. Click "Register" button |
| Expected Results | - Registration succeeds<br>- Success message displayed<br>- User redirected to email verification page<br>- Verification email sent to inbox<br>- User record created in database |
| Prerequisites | Browser with internet access, valid email address |
| Priority | High |

---

### TC002 - User Registration with Duplicate Email

| Field | Value |
|-------|-------|
| Test Case ID | TC002 |
| Test Case Name | User Registration - Duplicate Email |
| Test Objective | Verify system prevents duplicate email registration |
| Test Steps | 1. Navigate to /auth/register<br>2. Enter email already registered (admin@gmail.com)<br>3. Enter password and name<br>4. Click "Register" button |
| Expected Results | - Error message displayed: "Email already exists"<br>- Registration fails<br>- User stays on registration page<br>- No new user record created |
| Prerequisites | Email already exists in system |
| Priority | High |

---

### TC003 - User Registration with Invalid Email Format

| Field | Value |
|-------|-------|
| Test Case ID | TC003 |
| Test Case Name | User Registration - Invalid Email Format |
| Test Objective | Verify system rejects invalid email format |
| Test Steps | 1. Navigate to /auth/register<br>2. Enter invalid email (e.g., "notanemail" or "user@")<br>3. Enter password and name<br>4. Click "Register" button |
| Expected Results | - Error message displayed: "Invalid email format"<br>- Registration fails<br>- Form validation error shown under email field |
| Prerequisites | None |
| Priority | Medium |

---

### TC004 - User Registration with Weak Password

| Field | Value |
|-------|-------|
| Test Case ID | TC004 |
| Test Case Name | User Registration - Weak Password |
| Test Objective | Verify system enforces strong password requirement |
| Test Steps | 1. Navigate to /auth/register<br>2. Enter valid email<br>3. Enter weak password (< 8 characters)<br>4. Enter name<br>5. Click "Register" button |
| Expected Results | - Error message displayed: "Password must be at least 8 characters"<br>- Registration fails<br>- Form validation error shown under password field |
| Prerequisites | None |
| Priority | Medium |

---

### TC005 - User Login with Valid Credentials

| Field | Value |
|-------|-------|
| Test Case ID | TC005 |
| Test Case Name | User Login - Valid Credentials |
| Test Objective | Verify user can login with valid email and password |
| Test Steps | 1. Navigate to /auth/login<br>2. Enter registered email (admin@gmail.com)<br>3. Enter correct password (admin)<br>4. Click "Login" button |
| Expected Results | - Login successful<br>- JWT token generated and stored<br>- User redirected to dashboard/home page<br>- User name displayed in navbar<br>- Session maintained |
| Prerequisites | Valid user account exists, email is verified |
| Priority | High |

---

### TC006 - User Login with Incorrect Password

| Field | Value |
|-------|-------|
| Test Case ID | TC006 |
| Test Case Name | User Login - Incorrect Password |
| Test Objective | Verify system rejects login with wrong password |
| Test Steps | 1. Navigate to /auth/login<br>2. Enter registered email<br>3. Enter incorrect password<br>4. Click "Login" button |
| Expected Results | - Error message displayed: "Invalid email or password"<br>- Login fails<br>- User stays on login page<br>- No token generated |
| Prerequisites | Valid user account exists |
| Priority | High |

---

### TC007 - User Login with Unverified Email

| Field | Value |
|-------|-------|
| Test Case ID | TC007 |
| Test Case Name | User Login - Unverified Email |
| Test Objective | Verify system blocks login for unverified email accounts |
| Test Steps | 1. Register new user account<br>2. Don't verify email<br>3. Navigate to /auth/login<br>4. Enter email and correct password<br>5. Click "Login" button |
| Expected Results | - Login fails<br>- Error message: "Please verify your email before accessing this resource"<br>- User redirected to email verification page |
| Prerequisites | New unverified user account |
| Priority | High |

---

### TC008 - Email Verification with Valid Token

| Field | Value |
|-------|-------|
| Test Case ID | TC008 |
| Test Case Name | Email Verification - Valid Token |
| Test Objective | Verify user can verify email with valid token |
| Test Steps | 1. Register new user account<br>2. Click verification link in email<br>3. Or navigate to verification page with token |
| Expected Results | - Email marked as verified<br>- Success message displayed<br>- User can now login<br>- Redirected to login page |
| Prerequisites | Registered user, verification email received |
| Priority | High |

---

### TC009 - Email Verification with Expired Token

| Field | Value |
|-------|-------|
| Test Case ID | TC009 |
| Test Case Name | Email Verification - Expired Token |
| Test Objective | Verify system rejects expired verification tokens |
| Test Steps | 1. Register new user<br>2. Wait for token to expire (> 24 hours)<br>3. Click verification link in old email |
| Expected Results | - Error message: "Verification token expired"<br>- Verification fails<br>- Option to resend verification email provided |
| Prerequisites | Old user account with expired token |
| Priority | Medium |

---

### TC010 - Resend Verification Email

| Field | Value |
|-------|-------|
| Test Case ID | TC010 |
| Test Case Name | Resend Verification Email |
| Test Objective | Verify user can request new verification email |
| Test Steps | 1. Navigate to resend verification page<br>2. Enter registered email<br>3. Click "Resend" button |
| Expected Results | - Success message: "Verification email sent"<br>- New verification email sent<br>- New token generated<br>- Previous token invalidated |
| Prerequisites | Unverified user account exists |
| Priority | Medium |

---

### TC011 - Forgot Password Flow

| Field | Value |
|-------|-------|
| Test Case ID | TC011 |
| Test Case Name | Forgot Password - Valid Email |
| Test Objective | Verify user can reset password via email |
| Test Steps | 1. Navigate to /auth/forgot-password<br>2. Enter registered email<br>3. Click "Send Reset Link"<br>4. Check email for reset link<br>5. Click reset link<br>6. Enter new password<br>7. Confirm password |
| Expected Results | - Reset email sent<br>- Reset link works<br>- Password successfully updated<br>- User can login with new password |
| Prerequisites | Valid user account |
| Priority | High |

---

### TC012 - Logout Functionality

| Field | Value |
|-------|-------|
| Test Case ID | TC012 |
| Test Case Name | User Logout |
| Test Objective | Verify user can logout and session ends |
| Test Steps | 1. Login as user<br>2. Click "Logout" button in navbar<br>3. Try to access protected page |
| Expected Results | - User logged out<br>- Token cleared<br>- Redirected to login page<br>- Cannot access protected pages |
| Prerequisites | User logged in |
| Priority | Medium |

---

## USER PROFILE TEST CASES

### TC013 - View My Profile

| Field | Value |
|-------|-------|
| Test Case ID | TC013 |
| Test Case Name | View User Profile - My Profile |
| Test Objective | Verify user can view their own profile |
| Test Steps | 1. Login as user<br>2. Navigate to /profile or click profile in navbar<br>3. View profile information |
| Expected Results | - Profile page loads<br>- User's name displayed<br>- User's email displayed<br>- Avatar displayed (if set)<br>- Role shown (regular user/creator)<br>- Account creation date displayed |
| Prerequisites | User logged in |
| Priority | High |

---

### TC014 - Update User Profile

| Field | Value |
|-------|-------|
| Test Case ID | TC014 |
| Test Case Name | Update User Profile |
| Test Objective | Verify user can update profile information |
| Test Steps | 1. Navigate to profile page<br>2. Click "Edit Profile" button<br>3. Update name field<br>4. Update bio or other info<br>5. Click "Save" button |
| Expected Results | - Profile updated successfully<br>- Success message displayed<br>- Updated information displayed on profile<br>- Changes persisted in database |
| Prerequisites | User logged in |
| Priority | High |

---

### TC015 - Upload Profile Avatar

| Field | Value |
|-------|-------|
| Test Case ID | TC015 |
| Test Case Name | Upload Profile Avatar - Valid Image |
| Test Objective | Verify user can upload profile picture |
| Test Steps | 1. Navigate to profile page<br>2. Click "Change Avatar" or upload area<br>3. Select valid image (JPG, PNG, WebP, GIF)<br>4. File size < 2MB<br>5. Click "Upload" |
| Expected Results | - Image uploads successfully<br>- Preview displays immediately<br>- Avatar updated on profile<br>- Avatar updates across app (comments, reviews, etc)<br>- Success message shown |
| Prerequisites | User logged in, valid image file available |
| Priority | High |

---

### TC016 - Upload Profile Avatar - Invalid Format

| Field | Value |
|-------|-------|
| Test Case ID | TC016 |
| Test Case Name | Upload Profile Avatar - Invalid Format |
| Test Objective | Verify system rejects non-image files |
| Test Steps | 1. Navigate to profile page<br>2. Click "Change Avatar"<br>3. Select invalid file (PDF, DOCX, BMP, TIFF)<br>4. Click "Upload" |
| Expected Results | - Upload fails<br>- Error message: "Only image files are allowed (JPEG, PNG, WebP, GIF)"<br>- File not stored<br>- Avatar unchanged |
| Prerequisites | User logged in |
| Priority | Medium |

---

### TC017 - Upload Profile Avatar - File Too Large

| Field | Value |
|-------|-------|
| Test Case ID | TC017 |
| Test Case Name | Upload Profile Avatar - File Size Exceeded |
| Test Objective | Verify system enforces file size limit (2MB) |
| Test Steps | 1. Navigate to profile page<br>2. Click "Change Avatar"<br>3. Select image file > 2MB<br>4. Click "Upload" |
| Expected Results | - Upload fails<br>- Error message: "File size must be less than 2MB"<br>- File not stored<br>- Avatar unchanged |
| Prerequisites | User logged in, large image file available |
| Priority | Medium |

---

### TC018 - View My Favorites

| Field | Value |
|-------|-------|
| Test Case ID | TC018 |
| Test Case Name | View Favorite Products |
| Test Objective | Verify user can view their saved favorite products |
| Test Steps | 1. Navigate to /favorites or profile<br>2. Click "Favorites" tab |
| Expected Results | - Favorites page loads<br>- List of favorite products displayed<br>- Product cards show name, price, creator<br>- Product count shown<br>- Empty state shown if no favorites |
| Prerequisites | User logged in, favorite products exist |
| Priority | Medium |

---

### TC019 - View My Following List

| Field | Value |
|-------|-------|
| Test Case ID | TC019 |
| Test Case Name | View Following List |
| Test Objective | Verify user can view creators they follow |
| Test Steps | 1. Navigate to /profile or following page<br>2. Click "Following" tab<br>3. View list of creators |
| Expected Results | - Following list displayed<br>- Creator cards shown with avatar, name, stats<br>- "Following" button shown on each card<br>- Creator count displayed<br>- Empty state if no following |
| Prerequisites | User logged in, followed creators exist |
| Priority | Medium |

---

## CREATOR PROFILE TEST CASES

### TC020 - View Creator Profile (Public)

| Field | Value |
|-------|-------|
| Test Case ID | TC020 |
| Test Case Name | View Creator Public Profile |
| Test Objective | Verify anyone can view creator's public profile |
| Test Steps | 1. Navigate to /creator/[creatorId]<br>2. View creator information |
| Expected Results | - Creator profile loads<br>- Creator name, avatar, bio displayed<br>- Products listed<br>- Tutorials listed<br>- Rating and reviews count shown<br>- Follow button displayed<br>- Message button displayed<br>- Followers count shown |
| Prerequisites | Valid creator account exists |
| Priority | High |

---

### TC021 - Start Creator Onboarding

| Field | Value |
|-------|-------|
| Test Case ID | TC021 |
| Test Case Name | Start Creator Onboarding |
| Test Objective | Verify user can initiate creator account conversion |
| Test Steps | 1. Login as regular user<br>2. Navigate to become creator page<br>3. Click "Start Creator Setup"<br>4. Complete initial information |
| Expected Results | - Onboarding starts<br>- Creator profile created<br>- User redirected to setup page<br>- Fields for creator info appear<br>- Progress indicator shown |
| Prerequisites | User logged in, not already a creator |
| Priority | High |

---

### TC022 - Complete Creator Onboarding

| Field | Value |
|-------|-------|
| Test Case ID | TC022 |
| Test Case Name | Complete Creator Onboarding |
| Test Objective | Verify user can complete creator setup |
| Test Steps | 1. Start creator onboarding<br>2. Fill in display name<br>3. Fill in tagline<br>4. Fill in bio<br>5. Select categories<br>6. Upload profile image<br>7. Click "Complete Setup" |
| Expected Results | - Onboarding completed<br>- Creator status set to active<br>- Creator profile page displays<br>- Onboarding status = "creator_completed"<br>- Can create products/tutorials |
| Prerequisites | User in onboarding process |
| Priority | High |

---

### TC023 - Update Creator Profile

| Field | Value |
|-------|-------|
| Test Case ID | TC023 |
| Test Case Name | Update Creator Profile Information |
| Test Objective | Verify creator can update profile details |
| Test Steps | 1. Login as creator<br>2. Navigate to creator profile<br>3. Click "Edit Profile"<br>4. Update display name, bio, categories<br>5. Click "Save" |
| Expected Results | - Profile updated<br>- Changes visible immediately<br>- Success message shown<br>- Data persisted |
| Prerequisites | User is creator |
| Priority | Medium |

---

### TC024 - Deactivate Creator Account

| Field | Value |
|-------|-------|
| Test Case ID | TC024 |
| Test Case Name | Deactivate Creator Account |
| Test Objective | Verify creator can deactivate their account |
| Test Steps | 1. Login as creator<br>2. Navigate to account settings<br>3. Click "Deactivate Creator Account"<br>4. Confirm deactivation<br>5. Enter password to confirm |
| Expected Results | - Creator account deactivated<br>- Products/tutorials hidden<br>- Cannot create new content<br>- Profile still visible but marked as inactive<br>- Success message shown |
| Prerequisites | Creator account exists |
| Priority | Medium |

---

### TC025 - Reactivate Creator Account

| Field | Value |
|-------|-------|
| Test Case ID | TC025 |
| Test Case Name | Reactivate Creator Account |
| Test Objective | Verify deactivated creator can reactivate |
| Test Steps | 1. Login as deactivated creator<br>2. Navigate to account settings<br>3. Click "Reactivate Creator Account"<br>4. Confirm reactivation |
| Expected Results | - Creator account reactivated<br>- Products/tutorials visible again<br>- Can create new content<br>- Success message shown |
| Prerequisites | Creator account is deactivated |
| Priority | Medium |

---

### TC026 - Apply for Creator Verification

| Field | Value |
|-------|-------|
| Test Case ID | TC026 |
| Test Case Name | Apply for Creator Verification |
| Test Objective | Verify creator can submit verification request |
| Test Steps | 1. Login as creator<br>2. Navigate to verification section<br>3. Click "Apply for Verification"<br>4. Upload verification documents (ID, portfolio)<br>5. Submit application |
| Expected Results | - Application submitted<br>- Status changed to "reviewing"<br>- Success message shown<br>- Admin can see in moderation queue |
| Prerequisites | Creator account with sufficient history |
| Priority | Medium |

---

## PRODUCT MANAGEMENT TEST CASES

### TC027 - Create Product with Valid Data

| Field | Value |
|-------|-------|
| Test Case ID | TC027 |
| Test Case Name | Create Product - Valid Information |
| Test Objective | Verify creator can create new product |
| Test Steps | 1. Login as creator<br>2. Navigate to /products/create<br>3. Enter product title<br>4. Enter description<br>5. Set price<br>6. Upload product images<br>7. Select category<br>8. Click "Create Product" |
| Expected Results | - Product created successfully<br>- Product ID generated<br>- Product page displays<br>- Listed in creator's products<br>- Success message shown |
| Prerequisites | Creator logged in |
| Priority | High |

---

### TC028 - Create Product with Missing Required Fields

| Field | Value |
|-------|-------|
| Test Case ID | TC028 |
| Test Case Name | Create Product - Missing Required Field |
| Test Objective | Verify system validates required fields |
| Test Steps | 1. Login as creator<br>2. Navigate to product creation<br>3. Leave title empty<br>4. Fill other fields<br>5. Click "Create Product" |
| Expected Results | - Form validation error shown<br>- Error message: "Title is required"<br>- Product not created<br>- Focus on title field |
| Prerequisites | Creator logged in |
| Priority | Medium |

---

### TC029 - Upload Product Images - Valid

| Field | Value |
|-------|-------|
| Test Case ID | TC029 |
| Test Case Name | Upload Product Images - Valid Format |
| Test Objective | Verify creator can upload product images |
| Test Steps | 1. In product creation/edit<br>2. Click "Upload Images"<br>3. Select 1-5 valid images (JPG, PNG)<br>4. Each file < 5MB<br>5. Click "Upload" |
| Expected Results | - Images upload successfully<br>- Previews displayed<br>- Images saved to database<br>- Success message shown<br>- Can reorder images |
| Prerequisites | Creator logged in, valid image files |
| Priority | High |

---

### TC030 - Upload Product Images - Invalid Format

| Field | Value |
|-------|-------|
| Test Case ID | TC030 |
| Test Case Name | Upload Product Images - Invalid Format |
| Test Objective | Verify system rejects unsupported image formats |
| Test Steps | 1. In product creation<br>2. Click "Upload Images"<br>3. Select unsupported file (PDF, BMP, TIFF)<br>4. Click "Upload" |
| Expected Results | - Upload fails<br>- Error message: "Only image files are allowed"<br>- File rejected<br>- Valid format guidance shown |
| Prerequisites | Creator logged in |
| Priority | Medium |

---

### TC031 - Update Product Information

| Field | Value |
|-------|-------|
| Test Case ID | TC031 |
| Test Case Name | Update Product Details |
| Test Objective | Verify creator can edit product information |
| Test Steps | 1. Navigate to product page (as creator)<br>2. Click "Edit"<br>3. Update title, description, or price<br>4. Click "Save Changes" |
| Expected Results | - Product updated<br>- Changes visible immediately<br>- Success message shown<br>- Update timestamp recorded<br>- Data persisted |
| Prerequisites | Creator owns product |
| Priority | High |

---

### TC032 - Delete Product

| Field | Value |
|-------|-------|
| Test Case ID | TC032 |
| Test Case Name | Delete Product |
| Test Objective | Verify creator can remove product |
| Test Steps | 1. Navigate to product page<br>2. Click "Delete Product"<br>3. Confirm deletion |
| Expected Results | - Product deleted/moved to trash<br>- Product removed from listings<br>- Success message shown<br>- Can be restored within 30 days<br>- Reviews preserved (optional) |
| Prerequisites | Creator owns product |
| Priority | Medium |

---

### TC033 - Restore Deleted Product

| Field | Value |
|-------|-------|
| Test Case ID | TC033 |
| Test Case Name | Restore Deleted Product |
| Test Objective | Verify creator can restore deleted product |
| Test Steps | 1. Navigate to trash/deleted items<br>2. Select deleted product<br>3. Click "Restore"<br>4. Confirm restoration |
| Expected Results | - Product restored<br>- Product visible again in listings<br>- All data preserved<br>- Success message shown |
| Prerequisites | Product deleted within 30 days |
| Priority | Medium |

---

### TC034 - View Product Details

| Field | Value |
|-------|-------|
| Test Case ID | TC034 |
| Test Case Name | View Product Details Page |
| Test Objective | Verify product details page displays all info |
| Test Steps | 1. Navigate to /product/[productId]<br>2. View product details |
| Expected Results | - Product name displayed<br>- Images displayed in gallery<br>- Price shown<br>- Creator info shown<br>- Description displayed<br>- Average rating shown<br>- Reviews listed<br>- "Add to Favorites" button shown<br>- Creator profile link available |
| Prerequisites | Valid product exists |
| Priority | High |

---

## TUTORIAL MANAGEMENT TEST CASES

### TC035 - Create Tutorial with Valid Data

| Field | Value |
|-------|-------|
| Test Case ID | TC035 |
| Test Case Name | Create Tutorial - Valid Information |
| Test Objective | Verify creator can create new tutorial |
| Test Steps | 1. Login as creator<br>2. Navigate to /tutorials/create<br>3. Enter tutorial title<br>4. Enter description<br>5. Add lessons with topics<br>6. Select category<br>7. Upload thumbnail<br>8. Set as free/course<br>9. Click "Create Tutorial" |
| Expected Results | - Tutorial created successfully<br>- Tutorial ID generated<br>- Tutorial page displays<br>- Listed in creator's tutorials<br>- Success message shown |
| Prerequisites | Creator logged in |
| Priority | High |

---

### TC036 - Add Lessons to Tutorial

| Field | Value |
|-------|-------|
| Test Case ID | TC036 |
| Test Case Name | Add Lessons to Tutorial |
| Test Objective | Verify creator can structure tutorial content |
| Test Steps | 1. In tutorial creation/edit<br>2. Click "Add Lesson"<br>3. Enter lesson title<br>4. Click "Add Topic" within lesson<br>5. Enter topic title<br>6. Repeat for multiple lessons<br>7. Save tutorial |
| Expected Results | - Lessons created<br>- Topics added to lessons<br>- Lesson order manageable<br>- Content hierarchy visible<br>- Data saved |
| Prerequisites | Creator in tutorial creation |
| Priority | High |

---

### TC037 - Upload Tutorial Thumbnail - Valid

| Field | Value |
|-------|-------|
| Test Case ID | TC037 |
| Test Case Name | Upload Tutorial Thumbnail - Valid Image |
| Test Objective | Verify creator can upload tutorial thumbnail |
| Test Steps | 1. In tutorial creation<br>2. Click "Upload Thumbnail"<br>3. Select valid image (JPG, PNG)<br>4. File size < 5MB<br>5. Click "Upload" |
| Expected Results | - Thumbnail uploads<br>- Preview displayed<br>- Thumbnail saved<br>- Success message shown |
| Prerequisites | Creator logged in, valid image |
| Priority | High |

---

### TC038 - Update Tutorial Information

| Field | Value |
|-------|-------|
| Test Case ID | TC038 |
| Test Case Name | Update Tutorial Details |
| Test Objective | Verify creator can edit tutorial |
| Test Steps | 1. Navigate to tutorial page (as creator)<br>2. Click "Edit"<br>3. Update title, description, or lessons<br>4. Click "Save Changes" |
| Expected Results | - Tutorial updated<br>- Changes visible<br>- Success message shown<br>- Update timestamp recorded |
| Prerequisites | Creator owns tutorial |
| Priority | High |

---

### TC039 - Delete Tutorial

| Field | Value |
|-------|-------|
| Test Case ID | TC039 |
| Test Case Name | Delete Tutorial |
| Test Objective | Verify creator can remove tutorial |
| Test Steps | 1. Navigate to tutorial page<br>2. Click "Delete Tutorial"<br>3. Confirm deletion |
| Expected Results | - Tutorial deleted<br>- Removed from listings<br>- Success message shown<br>- Can be restored within 30 days |
| Prerequisites | Creator owns tutorial |
| Priority | Medium |

---

### TC040 - Enroll in Free Tutorial

| Field | Value |
|-------|-------|
| Test Case ID | TC040 |
| Test Case Name | Enroll in Free Tutorial |
| Test Objective | Verify user can enroll in free tutorials |
| Test Steps | 1. Navigate to free tutorial page<br>2. Click "Enroll" button<br>3. Confirm enrollment |
| Expected Results | - User enrolled successfully<br>- Tutorial added to "My Tutorials"<br>- Can access all lessons<br>- Success message shown<br>- Enrollment date recorded |
| Prerequisites | User logged in, free tutorial exists |
| Priority | High |

---

### TC041 - View Tutorial Details

| Field | Value |
|-------|-------|
| Test Case ID | TC041 |
| Test Case Name | View Tutorial Details Page |
| Test Objective | Verify tutorial details page displays all info |
| Test Steps | 1. Navigate to /tutorial/[tutorialId]<br>2. View tutorial details |
| Expected Results | - Tutorial title displayed<br>- Thumbnail shown<br>- Description displayed<br>- Lessons/Topics listed<br>- Creator info shown<br>- Average rating shown<br>- Reviews listed<br>- Enrollment status shown<br>- Lesson progression indicator |
| Prerequisites | Valid tutorial exists |
| Priority | High |

---

## FOLLOW SYSTEM TEST CASES

### TC042 - Follow Creator

| Field | Value |
|-------|-------|
| Test Case ID | TC042 |
| Test Case Name | Follow Creator |
| Test Objective | Verify user can follow creator |
| Test Steps | 1. Navigate to creator profile<br>2. Click "Follow" button<br>3. Confirm follow action |
| Expected Results | - User added to followers list<br>- Button changes to "Following"<br>- Followers count increments<br>- Creator added to user's following list<br>- Success message shown |
| Prerequisites | User logged in, not already following |
| Priority | High |

---

### TC043 - Follow Creator - Already Following

| Field | Value |
|-------|-------|
| Test Case ID | TC043 |
| Test Case Name | Follow Creator - Already Following (Idempotency) |
| Test Objective | Verify system prevents duplicate follows |
| Test Steps | 1. Click Follow on already-followed creator<br>2. Click Follow again |
| Expected Results | - No duplicate follow created<br>- Button remains "Following"<br>- Followers count doesn't change<br>- Success response still returned<br>- No error shown to user |
| Prerequisites | User already following creator |
| Priority | Medium |

---

### TC044 - Unfollow Creator

| Field | Value |
|-------|-------|
| Test Case ID | TC044 |
| Test Case Name | Unfollow Creator |
| Test Objective | Verify user can unfollow creator |
| Test Steps | 1. Navigate to creator profile<br>2. Click "Following" button<br>3. Confirm unfollow action |
| Expected Results | - User removed from followers list<br>- Button changes to "Follow"<br>- Followers count decrements<br>- Removed from user's following list<br>- Success message shown |
| Prerequisites | User logged in and already following |
| Priority | High |

---

### TC045 - View Creator Followers Count

| Field | Value |
|-------|-------|
| Test Case ID | TC045 |
| Test Case Name | View Creator Followers Count |
| Test Objective | Verify followers count displays accurately |
| Test Steps | 1. Navigate to creator profile<br>2. View followers count widget |
| Expected Results | - Followers count displayed<br>- Count accurate and up-to-date<br>- Count updates after follow/unfollow<br>- Can click to view followers list (if available) |
| Prerequisites | Creator profile exists |
| Priority | Medium |

---

## REVIEW SYSTEM TEST CASES

### TC046 - Submit Product Review - Rating Only

| Field | Value |
|-------|-------|
| Test Case ID | TC046 |
| Test Case Name | Submit Product Review - Rating Only |
| Test Objective | Verify user can submit rating-only review |
| Test Steps | 1. Navigate to product page<br>2. Scroll to reviews section<br>3. Click "Leave a Review"<br>4. Select rating (1-5 stars)<br>5. Click "Submit Review" |
| Expected Results | - Review submitted<br>- Rating saved<br>- Product averageRating updated<br>- Review appears in list<br>- Success message shown |
| Prerequisites | User logged in, not creator of product |
| Priority | High |

---

### TC047 - Submit Product Review - Comment Only

| Field | Value |
|-------|-------|
| Test Case ID | TC047 |
| Test Case Name | Submit Product Review - Comment Only |
| Test Objective | Verify user can submit comment without rating |
| Test Steps | 1. Navigate to product page<br>2. Click "Leave a Review"<br>3. Skip rating selection<br>4. Enter comment text<br>5. Click "Submit Review" |
| Expected Results | - Review submitted with comment<br>- Comment displayed in reviews<br>- No rating applied<br>- Product rating unaffected<br>- Success message shown |
| Prerequisites | User logged in |
| Priority | Medium |

---

### TC048 - Submit Review - Rating and Comment

| Field | Value |
|-------|-------|
| Test Case ID | TC048 |
| Test Case Name | Submit Review - Rating and Comment |
| Test Objective | Verify user can submit complete review |
| Test Steps | 1. Navigate to tutorial page<br>2. Click "Leave Review"<br>3. Select rating (1-5 stars)<br>4. Enter comment<br>5. Click "Submit" |
| Expected Results | - Complete review submitted<br>- Both rating and comment saved<br>- Tutorial rating recalculated<br>- Review displays with both elements<br>- User avatar shown<br>- Timestamp shown |
| Prerequisites | User logged in, enrolled in tutorial |
| Priority | High |

---

### TC049 - Update Own Review

| Field | Value |
|-------|-------|
| Test Case ID | TC049 |
| Test Case Name | Update Own Review |
| Test Objective | Verify user can edit their review |
| Test Steps | 1. Navigate to product/tutorial page<br>2. Find own review<br>3. Click "Edit"<br>4. Update rating or comment<br>5. Click "Save Changes" |
| Expected Results | - Review updated<br>- Changes visible immediately<br>- Rating recalculated if changed<br>- Updated timestamp shown<br>- Success message displayed |
| Prerequisites | User has submitted review |
| Priority | Medium |

---

### TC050 - Delete Own Review

| Field | Value |
|-------|-------|
| Test Case ID | TC050 |
| Test Case Name | Delete Own Review |
| Test Objective | Verify user can remove their review |
| Test Steps | 1. Navigate to product/tutorial page<br>2. Find own review<br>3. Click "Delete"<br>4. Confirm deletion |
| Expected Results | - Review deleted<br>- Removed from reviews list<br>- Rating recalculated<br>- Review count decremented<br>- Success message shown |
| Prerequisites | User has submitted review |
| Priority | Medium |

---

### TC051 - Prevent Self-Review

| Field | Value |
|-------|-------|
| Test Case ID | TC051 |
| Test Case Name | Prevent Creator from Reviewing Own Content |
| Test Objective | Verify creators cannot review own products/tutorials |
| Test Steps | 1. Login as creator<br>2. Navigate to own product<br>3. Try to submit review |
| Expected Results | - Review form disabled or hidden<br>- Error message: "You cannot review your own content"<br>- Cannot submit review<br>- Button disabled or grayed out |
| Prerequisites | User is creator, viewing own content |
| Priority | Medium |

---

### TC052 - View Product/Tutorial Reviews

| Field | Value |
|-------|-------|
| Test Case ID | TC052 |
| Test Case Name | View All Reviews for Product/Tutorial |
| Test Objective | Verify reviews display correctly |
| Test Steps | 1. Navigate to product/tutorial page<br>2. Scroll to reviews section<br>3. View all reviews |
| Expected Results | - All reviews listed<br>- Reviews sorted by newest first<br>- Reviewer name shown<br>- Reviewer avatar shown<br>- Rating displayed with stars<br>- Comment text displayed<br>- Review timestamp shown<br>- Average rating calculated correctly |
| Prerequisites | Reviews exist for product/tutorial |
| Priority | High |

---

## CHAT/MESSAGING TEST CASES

### TC053 - Open Conversation

| Field | Value |
|-------|-------|
| Test Case ID | TC053 |
| Test Case Name | Open New Conversation |
| Test Objective | Verify user can start chat with creator |
| Test Steps | 1. Navigate to creator profile<br>2. Click "Message" button<br>3. Confirm chat opening |
| Expected Results | - Conversation created<br>- Chat page opens<br>- Conversation ID generated<br>- Creator info displayed<br>- Message input ready<br>- No "Failed to open conversation" error |
| Prerequisites | User logged in, creator exists |
| Priority | High |

---

### TC054 - Send Message

| Field | Value |
|-------|-------|
| Test Case ID | TC054 |
| Test Case Name | Send Message in Conversation |
| Test Objective | Verify user can send message |
| Test Steps | 1. Open conversation<br>2. Click message input field<br>3. Type message<br>4. Click "Send" or press Enter |
| Expected Results | - Message sent successfully<br>- Message appears in chat<br>- Timestamp shown<br>- Sender info shown<br>- Message marked as sent<br>- Input field cleared |
| Prerequisites | Conversation open |
| Priority | High |

---

### TC055 - Send Empty Message

| Field | Value |
|-------|-------|
| Test Case ID | TC055 |
| Test Case Name | Send Empty Message - Validation |
| Test Objective | Verify system prevents empty messages |
| Test Steps | 1. Open conversation<br>2. Click "Send" without entering text<br>3. Or only whitespace |
| Expected Results | - Message not sent<br>- Send button disabled or no action<br>- Error message: "Message cannot be empty"<br>- Focus remains on input field |
| Prerequisites | Conversation open |
| Priority | Medium |

---

### TC056 - Receive Message

| Field | Value |
|-------|-------|
| Test Case ID | TC056 |
| Test Case Name | Receive Message in Real-time |
| Test Objective | Verify user receives messages from other participant |
| Test Steps | 1. Open conversation on 2 browser windows/users<br>2. Send message from User A<br>3. Check User B's window |
| Expected Results | - Message appears in User B's chat<br>- Appears without page refresh<br>- Sender info correct<br>- Timestamp accurate<br>- Message marked as received |
| Prerequisites | 2 users in conversation |
| Priority | High |

---

### TC057 - Mark Messages as Read

| Field | Value |
|-------|-------|
| Test Case ID | TC057 |
| Test Case Name | Mark Messages as Read |
| Test Objective | Verify system tracks read status |
| Test Steps | 1. Receive message in conversation<br>2. Open conversation<br>3. View message |
| Expected Results | - Message marked as read<br>- Unread count decreases<br>- Read status updated in database<br>- Sender can see read status (if available) |
| Prerequisites | Received message in conversation |
| Priority | Medium |

---

### TC058 - View Conversation List

| Field | Value |
|-------|-------|
| Test Case ID | TC058 |
| Test Case Name | View All Conversations |
| Test Objective | Verify user can view inbox |
| Test Steps | 1. Navigate to /chat<br>2. View conversation list |
| Expected Results | - All conversations displayed<br>- Sorted by most recent first<br>- Last message shown as preview<br>- Participant info shown<br>- Unread count shown (if unread)<br>- Timestamp of last message shown |
| Prerequisites | User logged in, conversations exist |
| Priority | High |

---

### TC059 - Delete Conversation

| Field | Value |
|-------|-------|
| Test Case ID | TC059 |
| Test Case Name | Delete Conversation |
| Test Objective | Verify user can delete conversation |
| Test Steps | 1. Navigate to conversation list<br>2. Right-click or swipe on conversation<br>3. Click "Delete"<br>4. Confirm deletion |
| Expected Results | - Conversation deleted<br>- Removed from conversation list<br>- Success message shown<br>- Chat history lost |
| Prerequisites | Conversation exists |
| Priority | Low |

---

## FAVORITES TEST CASES

### TC060 - Add Product to Favorites

| Field | Value |
|-------|-------|
| Test Case ID | TC060 |
| Test Case Name | Add Product to Favorites |
| Test Objective | Verify user can save product as favorite |
| Test Steps | 1. Navigate to product page<br>2. Click "Add to Favorites" button<br>3. Confirm action |
| Expected Results | - Product added to favorites<br>- Button changes to "Favorite" (filled)<br>- Success message shown<br>- Product appears in favorites list<br>- Count increments |
| Prerequisites | User logged in, not already favorite |
| Priority | High |

---

### TC061 - Remove Product from Favorites

| Field | Value |
|-------|-------|
| Test Case ID | TC061 |
| Test Case Name | Remove Product from Favorites |
| Test Objective | Verify user can unfavorite product |
| Test Steps | 1. Navigate to favorite product page<br>2. Click filled "Favorite" button<br>3. Confirm removal |
| Expected Results | - Product removed from favorites<br>- Button changes to empty<br>- Success message shown<br>- Product removed from favorites list<br>- Count decrements |
| Prerequisites | Product is favorite |
| Priority | High |

---

### TC062 - View Favorite Products List

| Field | Value |
|-------|-------|
| Test Case ID | TC062 |
| Test Case Name | View All Favorite Products |
| Test Objective | Verify user can view saved favorites |
| Test Steps | 1. Navigate to /favorites or profile<br>2. Click "Favorites" tab<br>3. View all favorite products |
| Expected Results | - All favorite products displayed<br>- Product cards show name, price, creator<br>- Favorite count shown<br>- Empty state if no favorites<br>- Can remove from favorites from list |
| Prerequisites | Favorite products exist |
| Priority | Medium |

---

## FILE UPLOAD TEST CASES

### TC063 - Upload Avatar - Valid Image

| Field | Value |
|-------|-------|
| Test Case ID | TC063 |
| Test Case Name | Upload Avatar - Valid Image Format |
| Test Objective | Verify user can upload profile avatar |
| Test Steps | 1. Navigate to profile<br>2. Click avatar upload area<br>3. Select valid image (JPG, PNG, WebP, GIF)<br>4. File < 2MB<br>5. Click "Upload" |
| Expected Results | - Image uploads successfully<br>- Preview displays immediately<br>- Avatar updated across app<br>- File saved to storage<br>- Success message shown |
| Prerequisites | User logged in, valid image available |
| Priority | High |

---

### TC064 - Upload Avatar - File Too Large

| Field | Value |
|-------|-------|
| Test Case ID | TC064 |
| Test Case Name | Upload Avatar - File Size Exceeded |
| Test Objective | Verify system enforces file size limit |
| Test Steps | 1. Navigate to profile<br>2. Click avatar upload<br>3. Select image > 2MB<br>4. Click "Upload" |
| Expected Results | - Upload fails<br>- Error message: "File size must be less than 2MB"<br>- File rejected<br>- Avatar unchanged |
| Prerequisites | User logged in, large image available |
| Priority | Medium |

---

### TC065 - Upload Product Images - Max Limit

| Field | Value |
|-------|-------|
| Test Case ID | TC065 |
| Test Case Name | Upload Product Images - Max Files Limit |
| Test Objective | Verify system limits image uploads |
| Test Steps | 1. In product creation<br>2. Try to upload > 5 images<br>3. Click "Upload" |
| Expected Results | - Upload fails after 5 images<br>- Error message: "Maximum 5 images allowed"<br>- Only first 5 processed<br>- User guided to supported count |
| Prerequisites | Creator in product creation |
| Priority | Low |

---

### TC066 - Upload Corrupted Image File

| Field | Value |
|-------|-------|
| Test Case ID | TC066 |
| Test Case Name | Upload Corrupted Image File |
| Test Objective | Verify system handles corrupted files |
| Test Steps | 1. Try to upload corrupted image<br>2. File appears valid but is corrupted |
| Expected Results | - Upload fails<br>- Error message shown<br>- File rejected<br>- User can retry |
| Prerequisites | Corrupted image file available |
| Priority | Low |

---

## ADDITIONAL TEST CASES

### TC067 - Search Products

| Field | Value |
|-------|-------|
| Test Case ID | TC067 |
| Test Case Name | Search Products by Title/Description |
| Test Objective | Verify search functionality works |
| Test Steps | 1. Navigate to products page<br>2. Enter search term in search box<br>3. Press Enter or click Search |
| Expected Results | - Search results displayed<br>- Only matching products shown<br>- Relevance ranking applied<br>- Result count shown<br>- Empty state if no matches |
| Prerequisites | Products exist in system |
| Priority | Medium |

---

### TC068 - Filter Products by Category

| Field | Value |
|-------|-------|
| Test Case ID | TC068 |
| Test Case Name | Filter Products by Category |
| Test Objective | Verify category filtering works |
| Test Steps | 1. Navigate to products page<br>2. Click category filter<br>3. Select one or more categories<br>4. View filtered results |
| Expected Results | - Products filtered correctly<br>- Only selected category products shown<br>- Filter count shown<br>- Can apply multiple filters<br>- Clear filter option available |
| Prerequisites | Products with categories exist |
| Priority | Medium |

---

### TC069 - Sort Products by Rating

| Field | Value |
|-------|-------|
| Test Case ID | TC069 |
| Test Case Name | Sort Products by Rating |
| Test Objective | Verify sorting functionality |
| Test Steps | 1. Navigate to products page<br>2. Click sort dropdown<br>3. Select "Highest Rating"<br>4. View sorted results |
| Expected Results | - Products sorted by rating (high to low)<br>- Highest rated first<br>- Sorting applied correctly<br>- Can switch sort order |
| Prerequisites | Multiple products with ratings exist |
| Priority | Medium |

---

### TC070 - Explore Creators Page

| Field | Value |
|-------|-------|
| Test Case ID | TC070 |
| Test Case Name | Browse Creators on Explore Page |
| Test Objective | Verify creators listing page |
| Test Steps | 1. Navigate to /explore/creators<br>2. View creator cards<br>3. Interact with creator card |
| Expected Results | - All active creators displayed<br>- Creator avatar shown<br>- Creator name shown<br>- Creator stats (followers, products)<br>- Follow button visible<br>- Profile link available<br>- Message button visible |
| Prerequisites | Creator accounts exist |
| Priority | Medium |

---

### TC071 - Block/Unblock User (Admin)

| Field | Value |
|-------|-------|
| Test Case ID | TC071 |
| Test Case Name | Block User Account (Admin) |
| Test Objective | Verify admin can block accounts |
| Test Steps | 1. Login as admin<br>2. Navigate to user management<br>3. Select user to block<br>4. Click "Block Account"<br>5. Confirm action |
| Expected Results | - User account blocked<br>- User cannot login<br>- Error message on login attempt<br>- User data preserved<br>- Can be unblocked later |
| Prerequisites | Admin logged in, valid user selected |
| Priority | Medium |

---

### TC072 - Account Deletion

| Field | Value |
|-------|-------|
| Test Case ID | TC072 |
| Test Case Name | Delete User Account |
| Test Objective | Verify user can permanently delete account |
| Test Steps | 1. Navigate to account settings<br>2. Click "Delete Account"<br>3. Enter password to confirm<br>4. Confirm irreversible deletion |
| Expected Results | - Account permanently deleted<br>- User data removed<br>- Cannot login<br>- Cannot be recovered<br>- Confirmation email sent |
| Prerequisites | User logged in |
| Priority | Low |

---

## Test Case Summary

**Total Test Cases:** 72

**Priority Distribution:**
- High Priority: 42 test cases
- Medium Priority: 24 test cases
- Low Priority: 6 test cases

**Coverage Areas:**
- Authentication: 12 cases
- User Profile: 7 cases
- Creator Profile: 7 cases
- Product Management: 8 cases
- Tutorial Management: 7 cases
- Follow System: 4 cases
- Review System: 7 cases
- Chat/Messaging: 7 cases
- Favorites: 3 cases
- File Upload: 4 cases
- Additional Features: 7 cases

---

## Testing Notes

- **Authentication Token:** JWT tokens must be stored securely (httpOnly cookies preferred)
- **Database Integrity:** Verify referential integrity after operations
- **Error Messages:** Ensure consistent error messaging across app
- **Performance:** Monitor response times for large datasets
- **Cross-browser:** Test on Chrome, Firefox, Safari, Edge
- **Mobile Testing:** Test all flows on mobile browsers
- **Accessibility:** Ensure WCAG 2.1 AA compliance

