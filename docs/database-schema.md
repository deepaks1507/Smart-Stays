# SmartStays — Database Schema

---

## 1. `users`

| Field | Data Type | Constraints | References |
|-------|-----------|-------------|------------|
| id | BIGINT | PK, AUTO_INCREMENT | — |
| name | VARCHAR | NOT NULL | — |
| email | VARCHAR | NOT NULL, UNIQUE | — |
| phone_number | VARCHAR | NOT NULL | — |
| password | VARCHAR | NOT NULL | — |
| role | VARCHAR | — | Default: `USER` |

---

## 2. `rooms`

| Field | Data Type | Constraints | References |
|-------|-----------|-------------|------------|
| id | BIGINT | PK, AUTO_INCREMENT | — |
| room_type | VARCHAR | — | — |
| room_price | DECIMAL | — | — |
| room_photo_url | VARCHAR | — | — |
| room_description | TEXT | — | — |
| total_inventory | INT | — | — |

---

## 3. `bookings`

| Field | Data Type | Constraints | References |
|-------|-----------|-------------|------------|
| id | BIGINT | PK, AUTO_INCREMENT | — |
| check_in_date | DATE | NOT NULL | — |
| check_out_date | DATE | Must be present or future | — |
| num_of_adults | INT | Min: 1 | — |
| num_of_children | INT | Min: 0 | — |
| total_num_of_guest | INT | — | — |
| booking_confirmation_code | VARCHAR | — | — |
| user_id | BIGINT | NOT NULL, FK | → `users(id)` |
| room_id | BIGINT | NOT NULL, FK | → `rooms(id)` |

---

## 4. `payments`

| Field | Data Type | Constraints | References |
|-------|-----------|-------------|------------|
| id | BIGINT | PK, AUTO_INCREMENT | — |
| amount | DECIMAL | NOT NULL | — |
| currency | VARCHAR | NOT NULL | Default: `INR` |
| payment_gateway | VARCHAR | — | `RAZORPAY \| STRIPE \| MOCK` |
| gateway_txn_id | VARCHAR | — | — |
| status | ENUM | NOT NULL | `PENDING \| SUCCESS \| FAILED \| REFUNDED` |
| paid_at | DATETIME | — | — |
| refund_amount | DECIMAL | — | — |
| refunded_at | DATETIME | — | — |
| booking_id | BIGINT | NOT NULL, FK | → `bookings(id)` |

---

## 5. `reviews`

| Field | Data Type | Constraints | References |
|-------|-----------|-------------|------------|
| id | BIGINT | PK, AUTO_INCREMENT | — |
| rating | INT | Min: 1, Max: 5 | — |
| comment | TEXT | — | — |
| admin_reply | TEXT | — | — |
| created_at | DATETIME | Auto-set on insert | — |
| user_id | BIGINT | FK | → `users(id)` |
| room_id | BIGINT | FK | → `rooms(id)` |
| booking_id | BIGINT | UNIQUE, FK | → `bookings(id)` |

---

## 6. `amenities`

| Field | Data Type | Constraints | References |
|-------|-----------|-------------|------------|
| id | BIGINT | PK, AUTO_INCREMENT | — |
| name | VARCHAR | NOT NULL, UNIQUE | — |
| icon_key | VARCHAR | — | — |
| category | VARCHAR | — | `ROOM \| PROPERTY \| BATHROOM \| TECH \| FOOD` |

---

## 7. `room_amenities` *(junction table)*

| Field | Data Type | Constraints | References |
|-------|-----------|-------------|------------|
| room_id | BIGINT | PK (composite), NOT NULL | → `rooms(id)` |
| amenity_id | BIGINT | PK (composite), NOT NULL | → `amenities(id)` |

---

## 8. `meal_plans`

| Field | Data Type | Constraints | References |
|-------|-----------|-------------|------------|
| id | BIGINT | PK, AUTO_INCREMENT | — |
| code | VARCHAR(10) | NOT NULL, UNIQUE | `EP \| CP \| MAP \| AP \| AI` |
| name | VARCHAR | NOT NULL | — |
| description | TEXT | — | — |
| price_per_person_per_day | DECIMAL | NOT NULL | Default: `0.00` |

---

## 9. `coupons`

| Field | Data Type | Constraints | References |
|-------|-----------|-------------|------------|
| id | BIGINT | PK, AUTO_INCREMENT | — |
| code | VARCHAR | NOT NULL, UNIQUE | — |
| discount_type | ENUM | NOT NULL | `PERCENT \| FLAT` |
| discount_value | DECIMAL | NOT NULL | — |
| min_booking_amount | DECIMAL | NOT NULL | Default: `0.00` |
| max_discount_cap | DECIMAL | — | NULL = no cap |
| valid_from | DATE | NOT NULL | — |
| valid_until | DATE | NOT NULL | — |
| usage_limit | INT | NOT NULL | Default: `1` |
| times_used | INT | NOT NULL | Default: `0` |
| is_active | BOOLEAN | NOT NULL | Default: `true` |

---

## 10. `wishlist`

| Field | Data Type | Constraints | References |
|-------|-----------|-------------|------------|
| id | BIGINT | PK, AUTO_INCREMENT | — |
| saved_at | DATETIME | Auto-set on insert | — |
| user_id | BIGINT | NOT NULL, FK | → `users(id)` |
| room_id | BIGINT | NOT NULL, FK | → `rooms(id)` |

> Composite UNIQUE constraint on `(user_id, room_id)` — a user can wishlist a room only once.

---

## 11. `notifications`

| Field | Data Type | Constraints | References |
|-------|-----------|-------------|------------|
| id | BIGINT | PK, AUTO_INCREMENT | — |
| type | VARCHAR | — | `BOOKING_CONFIRM \| REMINDER \| OFFER \| CANCELLATION` |
| channel | VARCHAR | — | `EMAIL \| SMS \| IN_APP` |
| title | VARCHAR | — | — |
| message | TEXT | — | — |
| is_read | BOOLEAN | NOT NULL | Default: `false` |
| sent_at | DATETIME | Auto-set on insert | — |
| user_id | BIGINT | NOT NULL, FK | → `users(id)` |

---

## 12. `pricing_rules`

| Field | Data Type | Constraints | References |
|-------|-----------|-------------|------------|
| id | BIGINT | PK, AUTO_INCREMENT | — |
| label | VARCHAR | — | `WEEKEND \| PEAK \| FESTIVE \| HOLIDAY` |
| start_date | DATE | — | — |
| end_date | DATE | — | — |
| day_of_week | INT | — | 1=Mon … 7=Sun, NULL = all days |
| price_override | DECIMAL | — | Fixed price (takes precedence over multiplier) |
| price_multiplier | DECIMAL | — | e.g. `1.25` = 25% surge |
| room_id | BIGINT | NOT NULL, FK | → `rooms(id)` |

---

## 13. `cancellation_policies`

| Field | Data Type | Constraints | References |
|-------|-----------|-------------|------------|
| id | BIGINT | PK, AUTO_INCREMENT | — |
| name | VARCHAR | NOT NULL | — |
| is_free_cancellation | BOOLEAN | — | Default: `false` |
| free_cancellation_hours_before | INT | — | Hours before check-in |
| partial_refund_percentage | INT | — | e.g. `50` = 50% refund |
| partial_refund_hours_threshold | INT | — | Hours threshold for partial refund |
| policy_description | TEXT | — | — |

---

## Foreign Key Summary

| Table | Foreign Key Column | References |
|-------|--------------------|------------|
| bookings | user_id | users(id) |
| bookings | room_id | rooms(id) |
| payments | booking_id | bookings(id) |
| reviews | user_id | users(id) |
| reviews | room_id | rooms(id) |
| reviews | booking_id | bookings(id) |
| room_amenities | room_id | rooms(id) |
| room_amenities | amenity_id | amenities(id) |
| wishlist | user_id | users(id) |
| wishlist | room_id | rooms(id) |
| notifications | user_id | users(id) |
| pricing_rules | room_id | rooms(id) |
