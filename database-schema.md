# Database Schema — Phegon Hotel

**Database:** `phegon_hotel_db` (MySQL)  
**Total tables:** 13  
**Total rooms:** 180 across 7 types × 5 Pune locations  

---

## Table Overview

| Table | Description |
|---|---|
| `users` | Registered users (ADMIN and USER roles) |
| `rooms` | All bookable rooms with type, price, location |
| `bookings` | Room bookings made by users |
| `payments` | Payment records linked to bookings |
| `reviews` | Guest reviews per booking |
| `amenities` | Master list of room amenities |
| `room_amenities` | Junction table: rooms ↔ amenities |
| `meal_plans` | Available meal plan options |
| `coupons` | Discount coupon codes |
| `cancellation_policies` | Refund/cancellation rules |
| `pricing_rules` | Dynamic/seasonal pricing overrides |
| `wishlist` | User-saved favourite rooms |
| `notifications` | In-app notifications per user |
| `locations` | Admin-managed location list for room assignment |

---

## Tables

### `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `name` | VARCHAR(255) | NOT NULL |
| `phone_number` | VARCHAR(255) | NOT NULL |
| `password` | VARCHAR(255) | NOT NULL (BCrypt) |
| `role` | VARCHAR(50) | NOT NULL, DEFAULT `'USER'` (`USER` \| `ADMIN`) |

---

### `rooms`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `room_type` | VARCHAR(255) | `PG` \| `Hostel` \| `Single Room` \| `Double Room` \| `Deluxe Room` \| `Family Room` \| `Banquet Hall` |
| `room_name` | VARCHAR(255) | Display name for PGs and Hostels (e.g. "Urban Nest PG") |
| `room_price` | DECIMAL(19,2) | Per-night rate in INR |
| `room_photo_url` | VARCHAR(512) | Pexels image URL |
| `room_description` | TEXT | Full description |
| `total_inventory` | INT | NOT NULL, DEFAULT `0` — number of units available |
| `location` | VARCHAR(255) | References a name from the `locations` table |

> Location values are managed via the admin **Manage Locations** page and stored as plain strings in the `rooms` table (no hard FK, allowing graceful removal without cascading deletes).

**Default locations (seed data):**
- `Koregaon Park, Pune`
- `Baner, Pune`
- `Viman Nagar, Pune`
- `Hinjewadi, Pune`
- `Kothrud, Pune`

---

### `bookings`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `check_in_date` | DATE | NOT NULL |
| `check_out_date` | DATE | |
| `num_of_adults` | INT | NOT NULL, DEFAULT `1` |
| `num_of_children` | INT | NOT NULL, DEFAULT `0` |
| `total_num_of_guest` | INT | NOT NULL, DEFAULT `0` (computed) |
| `booking_confirmation_code` | VARCHAR(255) | Unique alphanumeric code |
| `user_id` | BIGINT | FK → `users(id)` ON DELETE SET NULL |
| `room_id` | BIGINT | FK → `rooms(id)` ON DELETE SET NULL |

---

### `payments`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `booking_id` | BIGINT | NOT NULL, FK → `bookings(id)` ON DELETE CASCADE |
| `amount` | DECIMAL(12,2) | NOT NULL — room price × nights |
| `currency` | VARCHAR(10) | NOT NULL, DEFAULT `'INR'` |
| `payment_gateway` | VARCHAR(50) | `RAZORPAY` \| `STRIPE` \| `MOCK` |
| `gateway_txn_id` | VARCHAR(255) | External transaction ID |
| `status` | ENUM | NOT NULL, DEFAULT `PENDING` (`PENDING` \| `SUCCESS` \| `FAILED` \| `REFUNDED`) |
| `paid_at` | DATETIME | Timestamp of successful payment |
| `refund_amount` | DECIMAL(12,2) | Populated on refund |
| `refunded_at` | DATETIME | Timestamp of refund |

---

### `reviews`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `rating` | INT | NOT NULL (1–5) |
| `comment` | TEXT | NOT NULL |
| `admin_reply` | TEXT | Admin response text |
| `created_at` | DATETIME(6) | Auto-set on creation |
| `user_id` | BIGINT | NOT NULL, FK → `users(id)` ON DELETE CASCADE |
| `room_id` | BIGINT | NOT NULL, FK → `rooms(id)` ON DELETE CASCADE |
| `booking_id` | BIGINT | NOT NULL, UNIQUE, FK → `bookings(id)` ON DELETE CASCADE |

> One review per booking (enforced by UNIQUE on `booking_id`).

---

### `amenities`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE |
| `icon_key` | VARCHAR(100) | Frontend icon identifier |
| `category` | VARCHAR(50) | `ROOM` \| `PROPERTY` \| `BATHROOM` \| `TECH` \| `FOOD` |

**Seed data (20 amenities):**

| ID | Name | Category |
|---|---|---|
| 1 | Free Wi-Fi | TECH |
| 2 | Air Conditioning | ROOM |
| 3 | Flat-screen TV | ROOM |
| 4 | Mini Fridge | ROOM |
| 5 | Room Service | ROOM |
| 6 | En-suite Bathroom | BATHROOM |
| 7 | Rain Shower | BATHROOM |
| 8 | Jacuzzi | BATHROOM |
| 9 | Swimming Pool | PROPERTY |
| 10 | Gym | PROPERTY |
| 11 | Free Parking | PROPERTY |
| 12 | Restaurant | FOOD |
| 13 | Breakfast Included | FOOD |
| 14 | Work Desk | ROOM |
| 15 | Locker | ROOM |
| 16 | Laundry | PROPERTY |
| 17 | CCTV / 24h Security | PROPERTY |
| 18 | Balcony | ROOM |
| 19 | Kitchen Access | FOOD |
| 20 | Iron & Ironing Board | ROOM |

---

### `room_amenities`

Junction table linking rooms to their amenities.

| Column | Type | Constraints |
|---|---|---|
| `room_id` | BIGINT | PK (composite), FK → `rooms(id)` ON DELETE CASCADE |
| `amenity_id` | BIGINT | PK (composite), FK → `amenities(id)` ON DELETE CASCADE |

---

### `meal_plans`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `code` | VARCHAR(10) | NOT NULL, UNIQUE |
| `name` | VARCHAR(100) | NOT NULL |
| `description` | TEXT | |
| `price_per_person_per_day` | DECIMAL(10,2) | NOT NULL, DEFAULT `0.00` |

**Seed data (7 plans):**

| Code | Name | Price/Person/Day |
|---|---|---|
| EP | Room Only | ₹0 |
| CP | Bed & Breakfast | ₹250 |
| MAP | Half Board | ₹600 |
| AP | Full Board | ₹900 |
| AI | All Inclusive | ₹1,500 |
| BB | Breakfast Buffet | ₹350 |
| HB | Honeymoon Board | ₹999 |

---

### `coupons`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `code` | VARCHAR(50) | NOT NULL, UNIQUE |
| `discount_type` | ENUM | NOT NULL (`PERCENT` \| `FLAT`) |
| `discount_value` | DECIMAL(10,2) | NOT NULL |
| `min_booking_amount` | DECIMAL(10,2) | NOT NULL, DEFAULT `0.00` |
| `max_discount_cap` | DECIMAL(10,2) | NULL = no cap |
| `valid_from` | DATE | NOT NULL |
| `valid_until` | DATE | NOT NULL |
| `usage_limit` | INT | NOT NULL, DEFAULT `1` |
| `times_used` | INT | NOT NULL, DEFAULT `0` |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT `TRUE` |

---

### `cancellation_policies`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `name` | VARCHAR(100) | NOT NULL |
| `is_free_cancel` | BOOLEAN | NOT NULL, DEFAULT `FALSE` |
| `free_cancellation_hours_before` | INT | Hours before check-in for free cancel |
| `partial_refund_percentage` | INT | e.g. `50` = 50% refund |
| `partial_refund_hours_threshold` | INT | Hours before check-in for partial refund |
| `policy_description` | TEXT | Human-readable policy text |

---

### `pricing_rules`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `room_id` | BIGINT | NOT NULL, FK → `rooms(id)` ON DELETE CASCADE |
| `label` | VARCHAR(100) | `WEEKEND` \| `PEAK` \| `HOLIDAY` \| `FESTIVE` |
| `start_date` | DATE | Window start (NULL = recurring by day_of_week only) |
| `end_date` | DATE | Window end |
| `day_of_week` | INT | `1`=Mon … `7`=Sun, NULL = all days |
| `price_override` | DECIMAL(10,2) | Fixed price — takes precedence over multiplier |
| `price_multiplier` | DECIMAL(5,2) | e.g. `1.25` = 25% surge |

---

### `wishlist`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `user_id` | BIGINT | NOT NULL, FK → `users(id)` ON DELETE CASCADE |
| `room_id` | BIGINT | NOT NULL, FK → `rooms(id)` ON DELETE CASCADE |
| `saved_at` | DATETIME | DEFAULT `CURRENT_TIMESTAMP` |

> Unique constraint on `(user_id, room_id)` — one entry per user per room.

---

### `notifications`

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `user_id` | BIGINT | NOT NULL, FK → `users(id)` ON DELETE CASCADE |
| `type` | VARCHAR(50) | `BOOKING_CONFIRM` \| `REMINDER` \| `OFFER` \| `CANCELLATION` |
| `channel` | VARCHAR(20) | `EMAIL` \| `SMS` \| `IN_APP` |
| `title` | VARCHAR(255) | Notification heading |
| `message` | TEXT | Full notification body |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT `FALSE` |
| `sent_at` | DATETIME | DEFAULT `CURRENT_TIMESTAMP` |

---

### `locations`

Admin-managed list of locations available for room assignment. The admin panel exposes full CRUD; only active locations appear in public dropdowns.

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT `TRUE` |

> Deactivating a location hides it from room booking dropdowns and the add/edit room forms without deleting existing room data.

---

## Entity Relationships

```
users ──< bookings >── rooms
            │
            └──< payments
            └──< reviews
            └──< notifications (via users)

rooms ──< pricing_rules
rooms >──< amenities  (via room_amenities)

users ──< wishlist >── rooms
users ──< notifications
```

---

## Setup Instructions

1. Run `db-setup.sql` on a fresh MySQL instance to create the database and all tables.
2. Start the Spring Boot backend — `data.sql` runs automatically and seeds all rooms, users, amenities, meal plans, and coupons.
3. `spring.jpa.hibernate.ddl-auto=update` keeps schema in sync with entity changes on restart.
