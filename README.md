# Probase Solutions Admin Dashboard

Premium full-stack admin dashboard for an IT services company, built with Next.js App Router, Tailwind CSS, JWT auth, and MongoDB via Mongoose.

## Features

- JWT login/logout with admin and manager roles
- Separate business-team role with business operations modules
- Protected dashboard layout
- Employees, salaries, projects, leads, clients, proposals, invoices, targets, business, and reports modules
- REST APIs with validation and role-aware access
- Premium black-and-white responsive UI
- Charts, stat cards, loading skeletons, tables, and modal forms
- MongoDB-backed models with an in-memory fallback for local demo mode

## Seeded Credentials

- Admin: `admin@probase.io` / `Admin@123`
- Manager: `manager@probase.io` / `Manager@123`
- Business: `business@probase.io` / `Business@123`

## Setup

1. Copy `.env.example` to `.env.local`
2. Add your `MONGODB_URI` and `JWT_SECRET`
3. Install dependencies with `npm install`
4. Seed sample data with `npm run seed`
5. Start the app with `npm run dev`

If `MONGODB_URI` is omitted, the app falls back to an in-memory seeded dataset so the UI still works for demo usage.

## Quick UI Preview

If you only want to inspect the UI and skip login temporarily, set this in `.env.local`:

`NEXT_PUBLIC_DEMO_MODE=true`

That bypasses login and protected route checks locally while keeping the auth API in the codebase.

## API Routes

- `GET /api/auth`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET, POST /api/employees`
- `GET, PATCH, DELETE /api/employees/:id`
- `GET, POST /api/salaries`
- `GET, PATCH, DELETE /api/salaries/:id`
- `GET, POST /api/projects`
- `GET, PATCH, DELETE /api/projects/:id`
- `GET, POST /api/leads`
- `GET, PATCH, DELETE /api/leads/:id`
- `GET, POST /api/proposals`
- `GET, PATCH, DELETE /api/proposals/:id`
- `GET, POST /api/clients`
- `GET, PATCH, DELETE /api/clients/:id`
- `GET, POST /api/invoices`
- `GET, PATCH, DELETE /api/invoices/:id`
- `GET, POST /api/targets`
- `GET, PATCH, DELETE /api/targets/:id`
- `GET /api/analytics/overview`
- `GET /api/analytics/business`
- `POST /api/seed`
