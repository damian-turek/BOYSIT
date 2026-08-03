# Supabase Password Recovery OTP Setup

The Security tab resets an email/password user's password through an eight-character recovery OTP. The
flow stays inside the application:

```text
send recovery code -> verify recovery code -> choose new password -> revoke other sessions
```

No application database stores, receives, or validates passwords.

## Recovery Email Template

In **Authentication → Email Templates → Reset password**, replace the recovery link with an OTP:

```html
<h2>Reset your password</h2>
<p>Use this recovery code to choose a new password:</p>
<p style="font-size: 28px; font-weight: 700; letter-spacing: 0.2em">{{ .Token }}</p>
<p>If you did not request a password reset, you can ignore this email.</p>
```

Do not include `{{ .ConfirmationURL }}` in this template. The Security tab verifies
`{{ .Token }}` with `auth.verifyOtp({ type: 'recovery' })`, so this flow does not use an email
callback route.

Use a short OTP expiry appropriate for password recovery. Ten minutes is recommended for this
project.

## Password Settings

In the Supabase password security settings:

- Require a minimum password length of at least eight characters.
- Enable leaked-password protection when the project plan supports it.
- Enable the **Password changed** security notification.

The application validates basic length and confirmation locally. Supabase remains authoritative
for the configured password-strength policy.

After a successful password update, the application asks Supabase to revoke all other refresh
sessions while keeping the recovery session active.

## Email Delivery

Supabase's built-in sender is intended for development and may deliver only to authorized
project-team addresses. Configure a custom SMTP provider before beta or production, verify the
sending domain, and keep SMTP credentials outside Git.

## Manual Verification

1. Sign in with an email/password account.
2. Open **Profile → Security**.
3. Send a recovery code.
4. Verify invalid and expired code handling.
5. Resend the code and verify rate-limit handling.
6. Enter the valid code and choose a new password.
7. Verify short, weak, and mismatched password handling.
8. Verify that the new password works on the next sign-in.
9. Verify that previously active refresh sessions cannot refresh.
10. Verify that a Google-only account sees provider-managed messaging instead of recovery controls.
