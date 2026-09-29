# AnimeBox — Supabase version

This project is the upgraded version of the original AnimeBox front end.

## Stack

- HTML
- CSS
- Vanilla JavaScript
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Realtime

## 1. Create the Supabase project

Create a project at https://supabase.com/

Then open:

**Dashboard → SQL Editor**

Paste and run:

`supabase/schema.sql`

This creates the database tables, Row Level Security policies, profile-picture storage bucket, signup trigger, and realtime messages.

## 2. Configure email authentication

In Supabase:

**Authentication → Providers → Email**

Enable email/password authentication.

For the Gmail-only requirement, the front end checks that the address ends in `@gmail.com`.

For production, also configure your SMTP provider in:

**Authentication → SMTP Settings**

Supabase's built-in email service is intended for development/testing and has sending limitations.

Set your Site URL / Redirect URLs under:

**Authentication → URL Configuration**

For local development, add your local URL, for example:

`http://localhost:5500`

## 3. Configure the website

Copy:

`config.example.js`

to:

`config.js`

Then put your Supabase project's URL and public anon/publishable key in it.

You can find these under:

**Supabase → Project Settings → API**

Never put a `service_role` or secret key into `config.js`.

## 4. Run in VS Code

Recommended:

1. Install the VS Code **Live Server** extension.
2. Open the `animebox-supabase` folder.
3. Right-click `index.html`.
4. Choose **Open with Live Server**.
5. Create an account.
6. Supabase sends the email confirmation.
7. Confirm the email.
8. Log in.

## What is now real

The project now uses Supabase for:

- Account creation
- Password authentication
- Email confirmation
- User profiles
- Unique usernames at the database level
- Profile pictures
- Reviews
- Episode/season/full-anime review types
- Review deletion
- Review likes
- Friend requests
- Accepting friend requests
- Friends list
- Friend-only DM data access
- Realtime DM updates
- Instagram/TikTok profile handles

## Important production notes

### Username changes

The starter UI includes the username-change flow, but a production-grade username change that requires an email code should be implemented as a server-side Edge Function or equivalent trusted backend flow. Do not trust a browser-only verification flag for security-sensitive changes.

### Password changes

Supabase Auth handles passwords. The site uses Supabase's password-reset email flow instead of storing passwords itself.

### Instagram

The current Instagram feature creates a shareable text preview and copies only the beginning of a review. Actual automatic publishing to Instagram requires Meta's APIs and appropriate permissions/app review.

### Anime data

The anime list in `app.js` is currently a static starter list. For a real Letterboxd-style product, put anime in a database and/or connect a licensed anime metadata API. Do not scrape sites in violation of their terms.

### Deployment

When you're ready:

- Push the project to GitHub.
- Deploy it on Vercel or another static host.
- Add the production URL to Supabase Authentication → URL Configuration.
- Keep `config.js` out of public Git repositories if you want to avoid exposing your project configuration. The public anon/publishable key is designed for browser use, but your database must be protected by correct RLS policies.


## Multi-page navigation
The site is now split into separate pages: `index.html`, `browse.html`, `activity.html`, `friends.html`, `messages.html`, `profile.html`, and `settings.html`. The top navigation links directly to each page, and the current page is highlighted. All pages share the same Supabase client and styling.
