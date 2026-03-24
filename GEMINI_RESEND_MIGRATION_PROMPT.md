# Prompt for Gemini Flash: Replace Nodemailer with Resend

## Complete Task Description

Replace Nodemailer email sending with Resend email service in the CreateSphere backend. Maintain 100% of the existing functionality, email templates, and workflows.

---

## Current Implementation Context

### Current Setup (Nodemailer)
- **File**: `backend/utils/mailer.js`
- **Service**: Nodemailer with Gmail SMTP
- **Config**: `EMAIL_USER` and `EMAIL_PASS` from `backend/config/env.js`
- **Main Function**: `sendMail({ to, subject, html })`

### Current Usage
The `sendMail` function is called in `backend/modules/auth/auth.service.js` for:
1. Email verification on signup (with verification link and token)
2. Password reset email with reset link
3. Account confirmation emails
4. Welcome emails

### Current Email Templates
All emails use HTML templates with:
- CTA buttons with links
- User-friendly messages
- Time expiry information
- CreateSphere branding

---

## Requirements

### 1. Setup & Configuration
- [ ] Install Resend SDK: `npm install resend` (already in package.json if not, add it)
- [ ] Create new mailer file: `backend/utils/mailer-resend.js`
- [ ] Update env config to use `RESEND_API_KEY` instead of `EMAIL_USER` and `EMAIL_PASS`
- [ ] Ensure backward compatibility - keep same `sendMail()` function signature

### 2. Core Functionality
- [ ] Create Resend client initialization
- [ ] Implement `sendMail({ to, subject, html })` that uses Resend API
- [ ] Handle Resend response and errors
- [ ] Implement retry logic for failed emails
- [ ] Add proper error logging

### 3. Email Sending Features
- [ ] Support `to` parameter (email recipient)
- [ ] Support `subject` parameter
- [ ] Support `html` parameter (HTML email templates)
- [ ] Set `from` email address (use branded sender like "noreply@createsphere.com" or similar)
- [ ] Preserve all existing HTML email templates without modification

### 4. Error Handling
- [ ] Catch and log Resend API errors
- [ ] Return meaningful error messages
- [ ] Don't crash the application if email fails
- [ ] Allow optional `.catch()` in calling code

### 5. Integration Points
- [ ] Update `backend/modules/auth/auth.service.js` imports (if filename changes)
- [ ] Ensure all 4 email types still work:
  1. Email verification (signup)
  2. Resend verification link (existing user not verified)
  3. Password reset
  4. Account confirmation
- [ ] No changes to calling code logic needed (same function signature)

### 6. Environment Configuration
- [ ] Document new env variable: `RESEND_API_KEY`
- [ ] Create example in `.env.development.local` with comments
- [ ] Ensure it works with existing `backend/config/env.js`

### 7. Testing Support
- [ ] Update/create `backend/test_mail.js` to use Resend instead of Nodemailer
- [ ] Ensure test file can validate email sending works
- [ ] Include sample test email sending code

### 8. Database & Logic
- [ ] NO database schema changes
- [ ] NO authentication flow changes
- [ ] NO email template changes
- [ ] NO business logic changes
- [ ] Same token generation and verification flow

---

## Deliverables

### Files to Create/Modify:

1. **`backend/utils/mailer-resend.js`** (NEW)
   - Import Resend SDK
   - Initialize Resend client with API key
   - Export `sendMail({ to, subject, html })`
   - Handle response and errors

2. **`backend/config/env.js`** (MODIFY)
   - Add `RESEND_API_KEY` export
   - Import from environment variables

3. **`backend/utils/mailer.js`** (REPLACE)
   - Option A: Keep this file, re-export from mailer-resend.js
   - Option B: Update directly to use Resend
   - Either way, maintain same export: `sendMail`

4. **`backend/test_mail.js`** (UPDATE)
   - Replace Nodemailer with Resend
   - Keep same test functionality

5. **`backend/package.json`** (VERIFY/UPDATE)
   - Remove `"nodemailer": "^7.0.12"` 
   - Add `"resend": "^latest"` (or appropriate version)

6. **`backend/.env.development.local`** (UPDATE)
   - Remove `EMAIL_USER` and `EMAIL_PASS`
   - Add `RESEND_API_KEY=your_resend_api_key_here`
   - Add comments explaining setup

---

## Code Requirements

### Mailer Function Signature (MUST MAINTAIN)
```javascript
// This signature must stay exactly the same
export const sendMail = async ({ to, subject, html }) => {
  // Implementation changes, but signature stays the same
  return Promise; // Returns promise that resolves with send result
};
```

### Error Handling Pattern
```javascript
// Should support this calling pattern in auth.service.js
sendMail({
  to: email,
  subject: "...",
  html: "..."
}).catch(err => console.error("Email failed:", err));
```

### Resend API Usage Pattern
```javascript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const response = await resend.emails.send({
  from: "noreply@yourdomain.com", // Use professional sender
  to: recipient_email,
  subject: subject_line,
  html: html_content
});
```

---

## Important Notes

### DO:
- ✅ Keep exact same `sendMail` function signature
- ✅ Preserve all email HTML templates as-is
- ✅ Handle errors gracefully
- ✅ Maintain async/await pattern
- ✅ Add proper logging and error messages
- ✅ Update package.json properly
- ✅ Provide .env setup instructions

### DON'T:
- ❌ Change how emails are called from `auth.service.js`
- ❌ Modify email template HTML
- ❌ Change token generation or verification logic
- ❌ Alter email verification workflow
- ❌ Break existing email types
- ❌ Add breaking changes to function signatures

### Special Considerations:
- Resend requires verification of sender domain for production
- For development, use a test email or Resend's test domain
- Ensure `from` address is valid and verified in Resend
- Handle rate limiting if needed

---

## Testing Instructions

### After Implementation, Test:
1. **Signup Flow**: Create account → verification email sends → verify works
2. **Resend Verification**: Try signup twice → resend verification email works
3. **Password Reset**: Trigger password reset → email received → link works
4. **Account Confirmation**: Check account confirmation emails still send

### Manual Test:
```bash
# Using test_mail.js
node backend/test_mail.js
# Should send test email successfully
```

---

## Success Criteria

- ✅ All email types send successfully
- ✅ No code changes needed in `auth.service.js` beyond imports
- ✅ Same function signature for `sendMail`
- ✅ All HTML templates render correctly
- ✅ Verification links work
- ✅ Error handling is robust
- ✅ Environment setup is clear
- ✅ Package.json is updated correctly
- ✅ No breaking changes to existing code

---

## Example Usage (Should Work Unchanged)

```javascript
// This should work EXACTLY the same after changes
await sendMail({
  to: user.email,
  subject: "Verify your CreateSphere account",
  html: `
    <h2>Welcome to CreateSphere 🎨</h2>
    <a href="${verifyLink}">Verify Email</a>
  `
});
```

---

## Resend Documentation Reference
- API: https://resend.com/docs
- Email sending: https://resend.com/docs/send-email
- Rate limits: Standard (check documentation)
- Sandbox testing: Resend provides test mode

---

## Budget
- Estimated implementation time: 30-45 minutes
- Complexity: Low-Medium (straightforward swap)
- Risk: Very Low (isolated email module)

---

End of Prompt
