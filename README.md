# Smart Stays

A full-stack hotel booking and accommodation management platform supporting Hotels, PGs, Hostels, Lodges, Banquet Halls, Homestays, and Serviced Apartments.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3, Spring Security (JWT), Spring Data JPA |
| Database | MySQL (`phegon_hotel_db`) |
| File Storage | AWS S3 (room photos) |
| Frontend | React 18, React Router v6, Axios |
| Auth | JWT (localStorage) |

**Ports:** Backend `4040` · Frontend `7070`

## Features

- Room search by date, type, and location with real-time availability counts ("Only 2 left!")
- Booking management with confirmation codes
- Coupon/promo codes (PERCENT and FLAT discounts)
- Meal plan selection (EP/CP/MAP/AP/All-inclusive)
- Cancellation policies (free / partial refund / non-refundable)
- Weekend and seasonal pricing rules
- Guest reviews with admin reply
- Wishlist / saved rooms
- In-app notifications
- Admin dashboard: manage rooms, bookings, users

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8+
- AWS S3 bucket (for room photos)

### Backend

```bash
# Configure database and AWS credentials
# backend/src/main/resources/application.properties

cd backend
mvn spring-boot:run
# Runs on http://localhost:4040
```

Seed the database:
```bash
mysql -u root -p phegon_hotel_db < backend/src/main/resources/db-setup.sql
mysql -u root -p phegon_hotel_db < backend/src/main/resources/data.sql
```

Seed data includes: 3 users · 14 rooms across 5 Pune locations · 20 amenities · 5 meal plans · 4 cancellation policies · 9 pricing rules · 5 coupons

### Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:7070
```

## Database Schema (13 tables)

`users` · `rooms` · `bookings` · `payments` · `reviews` · `amenities` · `room_amenities` · `meal_plans` · `cancellation_policies` · `pricing_rules` · `coupons` · `wishlist` · `notifications`

See [`database-schema.md`](database-schema.md) for full table definitions.

## API Overview

| Prefix | Access |
|---|---|
| `POST /auth/register`, `POST /auth/login` | Public |
| `GET /rooms/**`, `GET /reviews/room/**` | Public |
| `POST /bookings/book-room/{roomId}/{userId}` | User |
| `GET /users/get-logged-in-profile-info` | User |
| `POST /admin/rooms/add`, `DELETE /admin/**` | Admin |

All responses use a unified envelope: `{ statusCode, message, data... }`.

## Project Structure

```
Smart-Stays/
├── backend/        Spring Boot application
│   └── src/main/
│       ├── java/com/phegondev/PhegonHotel/
│       └── resources/  (db-setup.sql, data.sql)
└── frontend/       React application
    └── src/
        ├── component/
        └── service/ApiService.js
```

## Default Credentials (seed data)

| Role | Email | Password |
|---|---|---|
| Admin | admin@hotel.com | admin123 |
| User | user@hotel.com | user123 |

---

## Roadmap

### Phase 1 — Core UX

- **Search & Filter** — filter rooms by price range, amenities, location, and rating
- **Room Detail Page** — full photo gallery, amenity icons, meal plan selector, cancellation policy tag
- **Availability Badge** — "Only 2 left!" / "Sold Out" computed from `total_inventory` minus active bookings
- **Booking Summary** — price breakdown (base + taxes + meal plan + coupon discount) before confirmation

### Phase 2 — Payments & Offers

- **Payment Gateway** — Razorpay / Stripe integration (Payment entity already in DB)
- **Coupon Apply** — input field on booking page, validated via existing `CouponService`
- **Refund Flow** — automatic refund on cancellation based on `CancellationPolicy` rules
- **Invoice / Receipt** — PDF download after booking confirmation

### Phase 3 — User Features

- **Wishlist** — save/unsave rooms (entity and service already exist)
- **Notifications** — in-app booking confirmations and reminders (entity and service already exist)
- **Review System** — star rating display, average rating on room card, filter reviews by rating
- **Booking History** — timeline view with status badges (Upcoming / Completed / Cancelled)

### Phase 4 — Admin Features

- **Analytics Dashboard** — revenue chart, occupancy rate, top rooms, bookings per month
- **Pricing Rules UI** — admin-managed weekend / peak / festive price overrides (entity exists)
- **Coupon Management** — create and disable coupons from the admin panel (entity exists)
- **Notification Broadcast** — send offers and announcements to all users

### Phase 5 — Advanced

- **Multi-property Support** — group rooms under a Property (Hotel / PG / Hostel / Banquet Hall etc.)
- **Map Integration** — Google Maps on room and property detail pages
- **Email Notifications** — booking confirmation and reminder emails via JavaMailSender
- **Mobile Responsive** — optimised layouts for all screen sizes
- **OAuth Login** — Google / GitHub login via Spring Security OAuth2
