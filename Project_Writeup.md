# PROJECT WRITE-UP: NEXUS

## 1. Title
**Nexus** — A Multi-Tenant SaaS Platform for Business Storefronts & Service Booking

## 2. Category
**→ Web Application** — Built with React.js (frontend), Node.js/Express (backend), and MongoDB Atlas (database). Accessed via any modern web browser.

## 3. Description / Introduction (SRS)
Nexus is a no-code, multi-tenant SaaS web application that allows small businesses (shops, clinics, salons, consultants) to create customizable online storefronts and booking portals instantly. Business owners sign in with Google, complete a guided onboarding wizard, choose a template (E-commerce / Booking / Landing Page), customize branding, add products or services, and get a unique public URL. Customers can browse, add to cart, book appointments, apply coupons, and checkout — all without the business owner writing any code.

## 4. Development Tools
**→ Front-end:** React.js v19, Vite, Tailwind CSS, React Router DOM, Axios, Google OAuth, Lucide Icons
**→ Back-end:** Node.js, Express.js, MongoDB + Mongoose, JWT (jsonwebtoken), Google Auth Library, Google Gemini AI SDK, CORS, dotenv

## 5. Modules
1. **Authentication** — Google OAuth login; JWT token generation and verification for protected routes.
2. **Onboarding & Theming** — Multi-step wizard to set up business name, slug, template type, colors, fonts, and AI-generated content (via Gemini).
3. **Catalog Management** — CRUD for products (with stock tracking, price units) and services (with schedule: working days, time slots, capacity).
4. **Order & Booking** — Cart, checkout, coupon validation, real-time slot availability checking, automatic stock decrement on purchase.
5. **Admin Dashboard** — Analytics (page views, revenue, orders), order status management, coupon management, and full settings panel.
6. **Storefront Engine** — Dynamically renders public pages at `/:businessSlug` using the tenant's chosen template and branding.

*(See Nexus_Diagrams.md for the process/architecture diagram)*

## 6. Database Model
Two MongoDB collections: **Users** (name, email, googleId, profilePicture) and **Tenants** (businessName, slug, themeType, colors, items[], orders[], coupons[]). Items, Orders, and Coupons are embedded sub-documents inside each Tenant. User → Tenant is a 1:M relationship.

*(See Nexus_Diagrams.md for the ER diagram)*

## 7. Interface Design
- **Landing Page (`/`)** — Platform marketing homepage with "Get Started" CTA.
- **Login Page (`/login`)** — Google OAuth sign-in portal.
- **Onboarding Wizard (`/onboarding`)** — Step-by-step business setup with AI content generation.
- **Admin Dashboard (`/admin/dashboard`)** — Analytics, product/order/coupon management, and settings.
- **Public Storefront (`/:slug`)** — Customer-facing store (e-commerce), booking portal, or landing page depending on template.

## 8. Area of Use / Enhancements
**Use:** Retail shops, bakeries, dental clinics, salons, fitness studios, freelance consultants.
**Enhancements:** Payment gateway integration (Stripe/Razorpay), custom domain mapping, email/SMS notifications, mobile app, review/rating system.

## 9. Introduction to Development Tools
- **React.js** — Component-based JavaScript UI library by Meta; uses Virtual DOM for efficient rendering.
- **Node.js & Express** — Server-side JS runtime + minimal web framework for building REST APIs with routing and middleware.
- **MongoDB** — Document-oriented NoSQL database storing flexible JSON-like documents; ideal for multi-tenant data.
- **Tailwind CSS** — Utility-first CSS framework for rapid, responsive styling directly in markup.
- **JWT** — Stateless authentication standard (RFC 7519) encoding user claims in a signed token.
- **Gemini AI** — Google's LLM used to auto-generate business headlines and descriptions during onboarding.

## 10. Conclusion
Nexus successfully demonstrates a modern, full-stack multi-tenant SaaS application that bridges the technology gap for small businesses. It combines e-commerce, appointment booking, and AI-powered content generation into a single, scalable platform — enabling entrepreneurs to establish a professional online presence in minutes.
