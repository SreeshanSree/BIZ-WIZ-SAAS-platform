# BizWiz

**BizWiz** (formerly Nexus) is a Multi-Tenant SaaS Platform for Business Storefronts & Service Booking.

## Overview
BizWiz is a no-code, multi-tenant SaaS web application that allows small businesses (shops, clinics, salons, consultants) to create customizable online storefronts and booking portals instantly. Business owners sign in with Google, complete a guided onboarding wizard, choose a template (E-commerce, Booking, or Landing Page), customize branding, add products or services, and get a unique public URL. 

Customers can browse, add to cart, book appointments, apply coupons, and checkout — all without the business owner writing any code.

## Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, React Router DOM, Axios, Google OAuth, Lucide Icons
- **Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT, Google Auth Library, Google Gemini AI SDK
- **Database:** MongoDB Atlas

## Key Features
1. **Authentication:** Google OAuth login; JWT token generation and verification for protected routes.
2. **Onboarding & Theming:** Multi-step wizard to set up business name, slug, template type, colors, fonts, and AI-generated content (via Google Gemini).
3. **Catalog Management:** CRUD operations for products (with stock tracking, price units) and services (with schedules: working days, time slots, capacity).
4. **Order & Booking:** Cart functionality, checkout, coupon validation, real-time slot availability checking, and automatic stock decrement upon purchase.
5. **Admin Dashboard:** Analytics (page views, revenue, orders), order status management, coupon management, and a comprehensive settings panel.
6. **Storefront Engine:** Dynamically renders public pages at `/:businessSlug` using the tenant's chosen template and branding.

## Running Locally

### Prerequisites
- Node.js installed on your machine
- A MongoDB cluster/URI
- Google OAuth Client ID & Secret
- Google Gemini AI API Key

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd BizWiz
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `frontend` folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

## Folder Structure
- `/frontend` - Contains the React (Vite) user interface, including the Admin Dashboard and Storefront renderer.
- `/backend` - Contains the Express server, Mongoose models, and API routes.
