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
