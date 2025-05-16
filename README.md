This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🚀 Features

### 🧑‍💼 Manager Dashboard
- **Product Management**
    - Add, edit, and delete products
    - Fields: name, description, image, price, quantity, category
- **Order Management**
    - View all customer orders
    - Update order statuses (Processing → Shipped → Delivered)
    - View customer details for each order

### 🛒 Customer Experience
- **Product Browsing & Search**
    - View products as cards (image, name, short description, price, availability)
    - Filter/search by name, category, and price range
- **Order Placement**
    - Detailed product pages
    - Add to cart and place orders
    - View past orders and current order status
- **Feedback & Ratings**
    - Rate products (1–5 stars)
    - Submit brief reviews
    - See average ratings and user reviews

---

## 🔐 Authentication & Authorization
- **Role-based access control** with distinct dashboards
- **User registration & login**
- **Google OAuth** login (optional)
- **Admin override access** (optional)
- **Secure password storage**
- Session management and logout
- Displays logged-in user's name

---
