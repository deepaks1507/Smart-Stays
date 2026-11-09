# Project Knowledge Graph — StayEase (All-in-One Accommodation Booking)

> Auto-generated reference for Claude. Updated: 2026-04-28
> Use this before searching the repo. Covers architecture, schema, APIs, component tree, and feature roadmap.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3, Spring Security (JWT), Spring Data JPA |
| Database | MySQL (`phegon_hotel_db`, port 3306) |
| File Storage | AWS S3 (via `AwsS3Service`) — room photos |
| Frontend | React 18, React Router v6, Axios, react-datepicker |
| Auth | JWT (stored in localStorage as `token` + `role`) |
| Ports | Backend: 4040, Frontend: 7070 |

---

## 2. Current Database Schema (11 tables)

```
users
  id PK | email UNIQUE | name | phone_number | password (bcrypt) | role (USER/ADMIN)

rooms
  id PK | room_type | room_price (DECIMAL) | room_photo_url | room_description
  total_inventory INT  ← how many physical units exist; availableCount computed at query time

bookings
  id PK | check_in_date | check_out_date | num_of_adults | num_of_children
  total_num_of_guest | booking_confirmation_code (10-char) | user_id FK | room_id FK

reviews
  id PK | rating (1-5) | comment TEXT | admin_reply TEXT | created_at
  user_id FK | room_id FK | booking_id FK UNIQUE

amenities
  id PK | name UNIQUE | icon_key | category (ROOM|PROPERTY|BATHROOM|TECH|FOOD)

room_amenities  [junction]
  room_id FK | amenity_id FK | PK(room_id, amenity_id)

meal_plans
  id PK | code (EP|CP|MAP|AP|AI) | name | description | price_per_person_per_day

cancellation_policies
  id PK | name | is_free_cancellation | free_cancellation_hours_before
  partial_refund_percentage | partial_refund_hours_threshold | policy_description

pricing_rules
  id PK | room_id FK | label (WEEKEND|PEAK|FESTIVE) | start_date | end_date
  day_of_week | price_override | price_multiplier

coupons
  id PK | code UNIQUE | discount_type (PERCENT|FLAT) | discount_value
  min_booking_amount | max_discount_cap | valid_from | valid_until
  usage_limit | times_used | is_active

payments
  id PK | booking_id FK | amount | currency | payment_gateway | gateway_txn_id
  status (PENDING|SUCCESS|FAILED|REFUNDED) | paid_at | refund_amount | refunded_at

wishlist
  id PK | user_id FK | room_id FK | saved_at  UNIQUE(user_id, room_id)

notifications
  id PK | user_id FK | type | channel | title | message | is_read | sent_at
```

**Seed data files:**
- `backend/src/main/resources/db-setup.sql` — full CREATE TABLE statements for all 13 tables
- `backend/src/main/resources/data.sql` — INSERT seed data: 3 users, 14 rooms (with inventory), 20 amenities, room_amenities mappings, 5 meal plans, 4 cancellation policies, 9 pricing rules, 5 coupons

---

## 3. Backend Package Structure

```
com.phegondev.PhegonHotel
├── controller/
│   ├── AuthController        POST /auth/register, POST /auth/login
│   ├── BookingController     POST /bookings/book-room/{roomId}/{userId}
│   │                         GET  /bookings/all (ADMIN)
│   │                         GET  /bookings/get-by-confirmation-code/{code}
│   │                         DELETE /bookings/cancel/{bookingId}
│   ├── RoomController        GET  /rooms/all, /rooms/types, /rooms/room-by-id/{id}
│   │                         GET  /rooms/all-available-rooms
│   │                         GET  /rooms/available-rooms-by-date-and-type
│   │                         GET  /rooms/availability-summary
│   │                         POST /rooms/add (ADMIN), PUT /rooms/update/{id} (ADMIN)
│   │                         DELETE /rooms/delete/{id} (ADMIN)
│   ├── ReviewController      POST /reviews/add/{bookingId}?userId=
│   │                         GET  /reviews/room/{roomId} (public)
│   │                         GET  /reviews/user/{userId}
│   │                         PUT  /reviews/admin-reply/{reviewId} (ADMIN)
│   └── UserController        GET  /users/all, /users/get-by-id/{id}
│                              GET  /users/get-logged-in-profile-info
│                              GET  /users/get-user-bookings/{userId}
│                              DELETE /users/delete/{userId}
├── entity/         Room, Booking, User, Review
├── dto/            RoomDTO, BookingDTO, UserDTO, ReviewDTO, ReviewRequest, Response
├── repo/           RoomRepository, BookingRepository, UserRepository, ReviewRepository
├── service/
│   ├── interfac/   IRoomService, IBookingService, IUserService, IReviewService
│   └── impl/       RoomService, BookingService, UserService, ReviewService
├── security/       SecurityConfig, JWTAuthFilter, CorsConfig
└── utils/          Utils (all static mappers), JWTUtils
```

**Response envelope** — ALL APIs return:
```java
Response { statusCode, message, token, role, expirationTime,
           bookingConfirmationCode, user, room, booking,
           userList, roomList, bookingList,
           review, reviewList,
           roomAvailabilitySummary: Map<String,Long> }
```

**Security permit-all paths:** `/auth/**`, `/rooms/**`, `/bookings/**`, `/images/**`, `/reviews/room/**`

---

## 4. Frontend Component Tree

```
App.js (BrowserRouter)
├── Navbar
├── Routes
│   ├── /home              → HomePage
│   ├── /login             → LoginPage
│   ├── /register          → RegisterPage
│   ├── /rooms             → AllRoomsPage
│   │     ├── RoomAvailabilitySummary  ← calls GET /rooms/availability-summary
│   │     ├── RoomSearch               ← date+type search
│   │     ├── RoomResult               ← room cards
│   │     └── Pagination
│   ├── /find-booking      → FindBookingPage
│   ├── /room-details-book/:roomId → RoomDetailsPage (protected)
│   │     └── ReviewList
│   ├── /payment           → PaymentPage (protected)
│   ├── /profile           → ProfilePage (protected)
│   │     └── AddReviewModal
│   ├── /edit-profile      → EditProfilePage (protected)
│   ├── /admin             → AdminPage (admin)
│   ├── /admin/manage-rooms       → ManageRoomPage (admin)
│   ├── /admin/edit-room/:roomId  → EditRoomPage (admin)
│   ├── /admin/add-room           → AddRoomPage (admin)
│   ├── /admin/manage-bookings    → ManageBookingsPage (admin)
│   └── /admin/edit-booking/:code → EditBookingPage (admin)
└── Footer
```

**ApiService.js** (static class, BASE_URL = `http://localhost:4040`):
- Auth: `registerUser`, `loginUser`, `logout`, `isAuthenticated`, `isAdmin`, `isUser`
- Users: `getAllUsers`, `getUserProfile`, `getUser`, `getUserBookings`, `deleteUser`
- Rooms: `addRoom`, `getAllAvailableRooms`, `getAvailableRoomsByDateAndType`, `getRoomTypes`, `getAllRooms`, `getRoomById`, `deleteRoom`, `updateRoom`, `getRoomAvailabilitySummary`
- Bookings: `bookRoom`, `getAllBookings`, `getBookingByConfirmationCode`, `cancelBooking`
- Reviews: `addReview`, `getReviewsByRoom`, `getReviewsByUser`, `addAdminReply`

---

## 5. Key Patterns to Follow

- **Entity→DTO mapping**: always via static methods in `Utils.java`. Never map inline in service.
- **Error handling**: every service method wraps in `try { } catch (OurException e) { 404 } catch (Exception e) { 500 }`.
- **Repository queries**: derived method names or `@Query` JPQL (not native SQL).
- **Security**: `@PreAuthorize("hasAuthority('ADMIN')")` or `"hasAuthority('USER') or hasAuthority('ADMIN')"` on controller methods.
- **Frontend state**: functional components + hooks only. No class components.
- **CSS**: all styles in `frontend/src/index.css`. Brand color: `#007F86`.

---

## 6. Feature Roadmap & DB Tables (Final Year Project — 12+ Tables)

### Current tables (4): `users`, `rooms`, `bookings`, `reviews`

### Phase A — Core Fixes & Inventory (2 new tables → 6 total)

**Problem:** Current `rooms` table = 1 row per physical room. No inventory count. Can't show "X rooms left."

| New Table | Purpose |
|---|---|
| `properties` | Top-level property entity (Hotel/PG/Hostel/Lodge/Banquet). Rooms belong to a property. |
| `amenities` + `room_amenities` (junction) | Master amenity list + per-room mapping |

**Add `total_inventory` INT to `rooms`** — how many physical units of this room type exist.
Available count = `total_inventory - COUNT(active bookings for date range)`.
Show urgency badge: `availableCount <= 3` → "Only X left!", `<= 5` → "Hurry!", `0` → "Sold Out".

---

### Phase B — Pricing & Policies (3 new tables → 9 total)

| New Table | Purpose |
|---|---|
| `meal_plans` | EP/CP/MAP/AP/All-inclusive options with per-person price |
| `cancellation_policies` | Free cancellation deadline, partial refund tiers, non-refundable |
| `pricing_rules` | Date-range or day-of-week price overrides (weekend surge, holiday pricing) |

---

### Phase C — Payments & Offers (2 new tables → 11 total)

| New Table | Purpose |
|---|---|
| `payments` | Gateway txn ID, status (PENDING/SUCCESS/FAILED/REFUNDED), refund tracking |
| `coupons` | Promo codes, discount type (PERCENT/FLAT), validity, usage limits |

**Extend `bookings`:** add `meal_plan_id FK`, `coupon_id FK`, `total_price`, `taxes_amount`, `final_price`, `payment_status`, `special_requests`.

---

### Phase D — User Features (2 new tables → 13 total)

| New Table | Purpose |
|---|---|
| `wishlist` | Users save/favourite properties for later |
| `notifications` | Booking confirmations, reminders, offers — tracked per user |

---

### Full 13-Table Schema (target)

```
users               → bookings (OneToMany)
                    → reviews (OneToMany)
                    → wishlist (OneToMany)
                    → notifications (OneToMany)

properties          → rooms (OneToMany)
                    → wishlist (OneToMany)
                    → property_amenities (OneToMany)

rooms               → bookings (OneToMany)
                    → reviews (OneToMany)
                    → room_amenities (OneToMany)
                    → pricing_rules (OneToMany)

bookings            → reviews (OneToOne)
                    → payments (OneToMany)
                    → meal_plans (ManyToOne)
                    → cancellation_policies (ManyToOne)
                    → coupons (ManyToOne)

amenities           ← room_amenities (junction)

meal_plans          ← bookings (OneToMany)
cancellation_policies ← rooms (ManyToOne), bookings (ManyToOne)
pricing_rules       → rooms (ManyToOne)
payments            → bookings (ManyToOne)
coupons             ← bookings (OneToMany)
wishlist            → users (ManyToOne), properties (ManyToOne)
notifications       → users (ManyToOne)
```

---

## 7. MakeMyTrip / OYO / Booking.com — Room Availability UX Pattern

**How "X rooms left" works:**
1. Each room type has `total_inventory` (e.g., 5 Double Rooms exist in hotel).
2. On search, query: `total_inventory - COUNT(bookings WHERE room_id=? AND dates overlap)`.
3. Frontend shows:
   - `count == 0` → grey card + "Sold Out" button disabled
   - `count <= 3` → red badge "Only X rooms left!"
   - `count <= 5` → orange badge "Hurry! X rooms left"
   - `count > 5` → no badge (comfortable inventory)
4. Badge is shown on **each room type card** on the hotel detail page, not on a separate page.

**Per-room-type card shows (MMT pattern):**
- Room photo thumbnail
- Room name + bed type (1 King Bed)
- Max occupancy (2 Adults, 1 Child)
- Top 4 amenity icons (WiFi, AC, TV, Mini-bar)
- Meal plan selector (Room Only / With Breakfast)
- Cancellation policy tag (Free cancellation / Non-refundable)
- Price per night + total for stay
- Availability badge
- "Book Now" CTA

---

## 8. Accommodation Types to Support

| Type | Key Differentiators |
|---|---|
| Hotel | Star rating, room service, multiple room types |
| PG (Paying Guest) | Sharing type (single/double/triple), gender preference, meals included, monthly pricing |
| Hostel | Dorm beds, locker, mixed/female/male dorms |
| Lodge | Budget, hourly or nightly rates |
| Banquet Hall | Capacity (pax), event type, catering options, half-day/full-day rates |
| Homestay | House rules, host profile, self check-in |
| Serviced Apartment | Kitchen, weekly/monthly rates, utilities included |

---

## 9. Files Modified in This Session

| File | What Changed |
|---|---|
| `entity/Review.java` | New entity |
| `entity/Booking.java` | Added @OneToOne cascade to Review |
| `dto/ReviewDTO.java` | New DTO |
| `dto/ReviewRequest.java` | New request body |
| `dto/Response.java` | Added review, reviewList, roomAvailabilitySummary fields |
| `repo/ReviewRepository.java` | New repo |
| `repo/RoomRepository.java` | Added countAvailableRoomsByType() query |
| `service/interfac/IReviewService.java` | New interface |
| `service/impl/ReviewService.java` | New implementation |
| `controller/ReviewController.java` | New controller |
| `service/interfac/IRoomService.java` | Added getAvailabilityCountByType() |
| `service/impl/RoomService.java` | Added getAvailabilityCountByType() |
| `controller/RoomController.java` | Added GET /rooms/availability-summary |
| `security/SecurityConfig.java` | Added /reviews/room/** to permitAll |
| `utils/Utils.java` | Added review mappers |
| `frontend/src/service/ApiService.js` | Added review + availability methods |
| `frontend/src/component/profile/ProfilePage.jsx` | Tabs + review modal |
| `frontend/src/component/booking_rooms/AllRoomsPage.jsx` | Availability summary + filter pills |
| `frontend/src/component/booking_rooms/RoomDetailsPage.jsx` | ReviewList at bottom |
| `frontend/src/component/review/AddReviewModal.jsx` | New component |
| `frontend/src/component/review/ReviewList.jsx` | New component |
| `frontend/src/component/common/RoomAvailabilitySummary.jsx` | New component |
| `frontend/src/index.css` | All new styles |
