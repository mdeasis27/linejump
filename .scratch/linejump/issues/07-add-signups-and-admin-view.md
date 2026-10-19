# 07: Add signups and the admin view with flags explained

**What to build:** The visitor can add signups (email, optional referral code prefilled from `?ref=`, IP prefilled with a fresh fake address but editable; `ts` = previous signup + 1 minute) and a "Simulate a burst" button adds six referrals to one code within 10 minutes. Added signups persist in `localStorage` and a reset clears them (ADR-0003). An admin tab shows the full queue: position, email, code, valid referrals, rank, and each flag with a plain-words reason built from the engine's evidence; duplicates show which earlier signup they matched.

**Blocked by:** 06

**Status:** resolved

- [x] Adding a signup with a referrer's IP within 24h shows `same_ip` in the admin view with the hours since the referrer joined
- [x] "Simulate a burst" produces exactly one `burst` flag on the sixth referral (assuming no other recent referrals to that code)
- [x] Opening `/en/app?ref=abcd1234` prefills the referral field (query survives the locale redirect)
- [x] Flag reasons are dictionary functions in both locales
- [x] Form controls are labelled; validation errors are announced
- [x] Refresh keeps added signups; reset removes them
