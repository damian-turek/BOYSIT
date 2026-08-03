# TODO: Configure Supabase Email Delivery

## Current Status

The application functionality is already implemented and working:

- Password recovery sends and verifies an eight-character recovery code.

The remaining work is external infrastructure configuration in Supabase. It does not require
implementing the application flow again.

## TODO

- [ ] Choose a transactional email provider that supports SMTP.
- [ ] Configure a dedicated sender address and verify its sending domain.
- [ ] Configure SPF, DKIM, and DMARC records recommended by the provider.
- [ ] Enable custom SMTP in **Supabase Dashboard → Authentication → SMTP Settings**.
- [ ] Enter the SMTP host, port, username, password, sender email, and sender name.
- [ ] Keep SMTP credentials in Supabase and deployment secrets; never commit them to Git.
- [ ] Keep the **Reset password** template configured with `{{ .Token }}` rather than
      `{{ .ConfirmationURL }}` so the application receives an eight-character recovery code.
- [ ] Test password recovery using an address outside the Supabase project team.
- [ ] Check provider delivery, bounce, suppression, and spam logs during verification.

## Definition of Done

- Password recovery codes are delivered reliably to normal user email addresses.
- The flow works end to end without relying on Supabase's development email sender.
- No SMTP credential is stored in the repository.

For the password recovery template and manual verification steps, see
`docs/SUPABASE_PASSWORD_RECOVERY_OTP_SETUP.md`.
