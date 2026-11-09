-- ─────────────────────────────────────────────────────────────
-- 1. DATABASE
-- ─────────────────────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS phegon_hotel_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE phegon_hotel_db;

-- ─────────────────────────────────────────────────────────────
-- 2. TABLES  (drop in FK-safe order, then recreate)
-- ─────────────────────────────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS room_amenities;
DROP TABLE IF EXISTS pricing_rules;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS cancellation_policies;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- users
CREATE TABLE `users` (
  `id`           bigint       NOT NULL AUTO_INCREMENT,
  `email`        varchar(255) NOT NULL,
  `name`         varchar(255) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `password`     varchar(255) NOT NULL,
  `role`         varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- rooms
CREATE TABLE `rooms` (
  `id`               bigint         NOT NULL AUTO_INCREMENT,
  `room_type`        varchar(255)   DEFAULT NULL,
  `room_name`        varchar(255)   DEFAULT NULL,
  `room_price`       decimal(38,2)  DEFAULT NULL,
  `room_photo_url`   varchar(512)   DEFAULT NULL,
  `room_description` text,
  `total_inventory`  int            NOT NULL DEFAULT 0,
  `location`         varchar(255)   DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- bookings
CREATE TABLE `bookings` (
  `id`                        bigint NOT NULL AUTO_INCREMENT,
  `check_in_date`             date   NOT NULL,
  `check_out_date`            date   DEFAULT NULL,
  `num_of_adults`             int    NOT NULL DEFAULT 1,
  `num_of_children`           int    NOT NULL DEFAULT 0,
  `total_num_of_guest`        int    NOT NULL DEFAULT 0,
  `booking_confirmation_code` varchar(255) DEFAULT NULL,
  `user_id`                   bigint DEFAULT NULL,
  `room_id`                   bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_booking_user` (`user_id`),
  KEY `fk_booking_room` (`room_id`),
  CONSTRAINT `fk_booking_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_booking_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- payments
CREATE TABLE `payments` (
  `id`              bigint        NOT NULL AUTO_INCREMENT,
  `booking_id`      bigint        NOT NULL,
  `amount`          decimal(38,2) NOT NULL,
  `currency`        varchar(255)  NOT NULL,
  `payment_gateway` varchar(255)  DEFAULT NULL,
  `gateway_txn_id`  varchar(255)  DEFAULT NULL,
  `status`          enum('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `paid_at`         datetime      DEFAULT NULL,
  `refund_amount`   decimal(38,2) DEFAULT NULL,
  `refunded_at`     datetime      DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_pay_booking` (`booking_id`),
  CONSTRAINT `fk_pay_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- amenities
CREATE TABLE `amenities` (
  `id`       bigint       NOT NULL AUTO_INCREMENT,
  `name`     varchar(255) NOT NULL,
  `icon_key` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- room_amenities (junction)
CREATE TABLE `room_amenities` (
  `room_id`    bigint NOT NULL,
  `amenity_id` bigint NOT NULL,
  PRIMARY KEY (`room_id`, `amenity_id`),
  KEY `fk_ra_amenity` (`amenity_id`),
  CONSTRAINT `fk_ra_room`    FOREIGN KEY (`room_id`)    REFERENCES `rooms`     (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ra_amenity` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- reviews
CREATE TABLE `reviews` (
  `id`          bigint        NOT NULL AUTO_INCREMENT,
  `rating`      int           NOT NULL,
  `comment`     text,
  `admin_reply` text,
  `created_at`  datetime(6)   DEFAULT NULL,
  `booking_id`  bigint        DEFAULT NULL,
  `room_id`     bigint        DEFAULT NULL,
  `user_id`     bigint        DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_review_booking` (`booking_id`),
  KEY `fk_rev_room` (`room_id`),
  KEY `fk_rev_user` (`user_id`),
  CONSTRAINT `fk_rev_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `fk_rev_room`    FOREIGN KEY (`room_id`)    REFERENCES `rooms`    (`id`),
  CONSTRAINT `fk_rev_user`    FOREIGN KEY (`user_id`)    REFERENCES `users`    (`id`),
  CONSTRAINT `reviews_chk_1`  CHECK ((`rating` >= 1) AND (`rating` <= 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- meal_plans
CREATE TABLE `meal_plans` (
  `id`                       bigint        NOT NULL AUTO_INCREMENT,
  `code`                     varchar(10)   NOT NULL,
  `name`                     varchar(255)  NOT NULL,
  `description`              text,
  `price_per_person_per_day` decimal(38,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- coupons
CREATE TABLE `coupons` (
  `id`                 bigint        NOT NULL AUTO_INCREMENT,
  `code`               varchar(255)  NOT NULL,
  `discount_type`      enum('PERCENT','FLAT') NOT NULL,
  `discount_value`     decimal(38,2) NOT NULL,
  `min_booking_amount` decimal(38,2) NOT NULL DEFAULT 0.00,
  `max_discount_cap`   decimal(38,2) DEFAULT NULL,
  `valid_from`         date          NOT NULL,
  `valid_until`        date          NOT NULL,
  `usage_limit`        int           NOT NULL DEFAULT 1,
  `times_used`         int           NOT NULL DEFAULT 0,
  `is_active`          tinyint(1)    NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- wishlist
CREATE TABLE `wishlist` (
  `id`       bigint   NOT NULL AUTO_INCREMENT,
  `user_id`  bigint   NOT NULL,
  `room_id`  bigint   NOT NULL,
  `saved_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist` (`user_id`, `room_id`),
  KEY `fk_wl_room` (`room_id`),
  CONSTRAINT `fk_wl_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wl_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- notifications
CREATE TABLE `notifications` (
  `id`      bigint       NOT NULL AUTO_INCREMENT,
  `user_id` bigint       NOT NULL,
  `type`    varchar(255) DEFAULT NULL,
  `channel` varchar(255) DEFAULT NULL,
  `title`   varchar(255) DEFAULT NULL,
  `message` text,
  `is_read` tinyint(1)   NOT NULL DEFAULT 0,
  `sent_at` datetime     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notif_user` (`user_id`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- pricing_rules
CREATE TABLE `pricing_rules` (
  `id`               bigint        NOT NULL AUTO_INCREMENT,
  `room_id`          bigint        NOT NULL,
  `label`            varchar(255)  DEFAULT NULL,
  `start_date`       date          DEFAULT NULL,
  `end_date`         date          DEFAULT NULL,
  `day_of_week`      int           DEFAULT NULL,
  `price_override`   decimal(38,2) DEFAULT NULL,
  `price_multiplier` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_pr_room` (`room_id`),
  CONSTRAINT `fk_pr_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- cancellation_policies
CREATE TABLE `cancellation_policies` (
  `id`                             bigint       NOT NULL AUTO_INCREMENT,
  `name`                           varchar(255) NOT NULL,
  `is_free_cancellation`           tinyint(1)   NOT NULL DEFAULT 0,
  `is_free_cancel`                 bit(1)       NOT NULL DEFAULT 0,
  `free_cancellation_hours_before` int          DEFAULT NULL,
  `partial_refund_percentage`      int          DEFAULT NULL,
  `partial_refund_hours_threshold` int          DEFAULT NULL,
  `policy_description`             text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- locations
CREATE TABLE `locations` (
  `id`        bigint       NOT NULL AUTO_INCREMENT,
  `name`      varchar(255) NOT NULL,
  `is_active` tinyint(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- 3. SEED DATA
-- ─────────────────────────────────────────────────────────────

-- Users  (password for all = 1234567890, bcrypt-hashed)
INSERT INTO users (id, email, name, phone_number, password, role) VALUES
(1, 'deepak@gmail.com',   'Deepak',   '9876543210', '$2a$10$6tGRo1hL.GJ6HM1ZcBHKm..A/DXc5inqeejf6/BOSZg6wFaYykAoW', 'USER'),
(2, 'himanshu@gmail.com', 'Himanshu', '9876543211', '$2a$10$DNMMAmkP1oiD5XOk4n.gpu/oVbkAMYp5WHVQ7yYp0noNf6x87lGvG', 'ADMIN'),
(3, 'priya@gmail.com',    'Priya',    '9876543212', '$2a$10$DNMMAmkP1oiD5XOk4n.gpu/oVbkAMYp5WHVQ7yYp0noNf6x87lGvG', 'USER'),
(4, 'rahul@gmail.com',    'Rahul',    '9876543213', '$2a$10$DNMMAmkP1oiD5XOk4n.gpu/oVbkAMYp5WHVQ7yYp0noNf6x87lGvG', 'USER'),
(5, 'sneha@gmail.com',    'Sneha',    '9876543214', '$2a$10$DNMMAmkP1oiD5XOk4n.gpu/oVbkAMYp5WHVQ7yYp0noNf6x87lGvG', 'USER');

-- ══════════════════════════════════════════════════════════════
-- ROOMS — 105 total  (Pexels images, free license)
-- ══════════════════════════════════════════════════════════════
INSERT INTO rooms (id, room_type, room_price, room_photo_url, room_description, total_inventory) VALUES

-- ──────────────────────────────────────────────────────────────
-- PG (Paying Guest)  IDs 1–15
-- Prices are per-night equivalents (monthly rent ÷ 30)
-- Budget ₹3,500–6,000/mo | Standard ₹6,500–10,000/mo | Premium ₹10,500–18,000/mo
-- ──────────────────────────────────────────────────────────────
(1,  'PG', 116.67, 'https://images.pexels.com/photos/31944406/pexels-photo-31944406.jpeg?w=800',
 'Economy PG in a residential colony near bus stop. Single bed, ceiling fan, study table, and shared almirah. Common bathroom (1:3 ratio) with geyser. RO water, free Wi-Fi, and CCTV. No brokerage. Ideal for first-year college students.',
 15),
(2,  'PG', 140.00, 'https://images.pexels.com/photos/31944372/pexels-photo-31944372.jpeg?w=800',
 'Budget PG room with single bed, table fan, study desk, and shared wardrobe. Shared bathroom with hot water. Free Wi-Fi, 24h security guard, purified drinking water, and small common TV lounge. Walking distance to college and local market.',
 12),
(3,  'PG', 166.67, 'https://images.pexels.com/photos/7031867/pexels-photo-7031867.jpeg?w=800',
 'Decent PG with a semi-furnished room, single bed, study table, and ceiling fan. Shared bathroom (1:2 ratio). Free Wi-Fi, CCTV, biometric entry, RO water, and a small kitchen for self-cooking. Laundry area available. Near metro station.',
 10),
(4,  'PG', 200.00, 'https://images.pexels.com/photos/5991542/pexels-photo-5991542.jpeg?w=800',
 'Standard PG with furnished private room, single bed, AC, and ceiling fan. Shared western bathroom with geyser. Home-cooked breakfast and dinner included. CCTV, 24h security, biometric entry, laundry area, and RO water facility.',
 10),
(5,  'PG', 250.00, 'https://images.pexels.com/photos/31944373/pexels-photo-31944373.jpeg?w=800',
 'Comfortable PG room with AC, single bed, study desk, wardrobe, and attached bathroom. Vegetarian meals (breakfast + dinner) included. Free Wi-Fi, power backup, 24h security, and common TV lounge. Located near IT park and metro station.',
 8),
(6,  'PG', 283.33, 'https://images.pexels.com/photos/6636242/pexels-photo-6636242.jpeg?w=800',
 'Well-maintained PG with private room, AC, single bed, 24-inch TV, and attached bathroom with geyser. Two meals per day (veg + non-veg options). Daily housekeeping, power backup, laundry facility, and gated society with parking.',
 8),
(7,  'PG', 300.00, 'https://images.pexels.com/photos/11295825/pexels-photo-11295825.jpeg?w=800',
 'Furnished PG for working professionals. Private room with AC, queen-size bed, work desk, wardrobe, and attached western bathroom. Three meals per day included. Wi-Fi, power backup, housekeeping, gym access, and 24h security.',
 6),
(8,  'PG', 316.67, 'https://images.pexels.com/photos/31976026/pexels-photo-31976026.jpeg?w=800',
 'Premium PG room near tech park. AC, queen-size bed with orthopedic mattress, 32-inch TV, attached bathroom with hot shower. Three meals daily (chef-cooked). High-speed Wi-Fi, housekeeping, laundry, gym access, and dedicated parking.',
 6),
(9,  'PG', 350.00, 'https://images.pexels.com/photos/34887642/pexels-photo-34887642.jpeg?w=800',
 'Executive PG with fully furnished private room, AC, king-size bed, 40-inch smart TV, work desk, and attached bathroom with rain shower. All-inclusive: 3 meals, housekeeping, laundry, high-speed Wi-Fi, gym, co-working lounge, and power backup.',
 5),
(10, 'PG', 366.67, 'https://images.pexels.com/photos/5991542/pexels-photo-5991542.jpeg?w=800',
 'Corporate executive PG with spacious private room, king-size bed, AC, 43-inch smart TV, mini fridge, and attached bathroom with hot shower. Three meals, housekeeping, laundry, gym, pool access, and high-speed broadband included.',
 5),
(11, 'PG', 400.00, 'https://images.pexels.com/photos/7031867/pexels-photo-7031867.jpeg?w=800',
 'Upscale PG with studio-style room, AC, king-size bed, 43-inch 4K TV, attached bathroom with Jacuzzi shower, and private sit-out. All meals by resident chef, housekeeping, laundry, gym, rooftop terrace, and concierge service.',
 4),
(12, 'PG', 433.33, 'https://images.pexels.com/photos/31944406/pexels-photo-31944406.jpeg?w=800',
 'Premium PG in upscale locality for senior professionals. Private room with AC, king-size bed, 50-inch smart TV, attached bathroom with rain shower, and a small kitchenette. All-inclusive: 3 meals, gym, pool, daily housekeeping, and high-speed broadband.',
 4),
(13, 'PG', 466.67, 'https://images.pexels.com/photos/6636242/pexels-photo-6636242.jpeg?w=800',
 'Luxury PG for expats and top-tier executives. Fully furnished private suite with AC, king-size bed, 55-inch 4K TV, kitchenette, Jacuzzi bathroom, and balcony. Chef-prepared 3 meals, personal laundry service, gym, pool, and 24h concierge.',
 3),
(14, 'PG', 516.67, 'https://images.pexels.com/photos/34887642/pexels-photo-34887642.jpeg?w=800',
 'Ultra-premium studio PG with separate living and sleeping areas. King-size bed, 55-inch 4K smart TV, full kitchen, premium attached bathroom with rain shower and bathtub. All-inclusive: 3 meals, housekeeping, laundry, gym, spa, and airport transfer.',
 3),
(15, 'PG', 600.00, 'https://images.pexels.com/photos/11295825/pexels-photo-11295825.jpeg?w=800',
 'Top-tier penthouse PG with private terrace, king-size bed, 65-inch 4K smart TV, fully equipped kitchen, and a marble bathroom with rain shower and bathtub. All-inclusive: gourmet 3 meals, valet laundry, gym, rooftop pool, spa, and dedicated concierge.',
 2),

-- ──────────────────────────────────────────────────────────────
-- Hostel / Dormitory  IDs 16–30
-- Dorm ₹350–800/night | Semi-private ₹900–1,600/night
-- ──────────────────────────────────────────────────────────────
(16, 'Hostel', 350.00, 'https://images.pexels.com/photos/4907232/pexels-photo-4907232.jpeg?w=800',
 'Ultra-budget 10-bed mixed dorm for backpackers. Basic bunk beds with lockers and shared bathrooms. Free Wi-Fi, common kitchen, and luggage storage. Near railway station.',
 25),
(17, 'Hostel', 399.00, 'https://images.pexels.com/photos/5137980/pexels-photo-5137980.jpeg?w=800',
 'Budget 8-bed mixed dormitory with bunk beds, personal lockers, reading lights, and USB charging ports. Shared bathrooms with hot water, free Wi-Fi, and a rooftop chill area. Common kitchen and luggage storage available.',
 20),
(18, 'Hostel', 449.00, 'https://images.pexels.com/photos/4907190/pexels-photo-4907190.jpeg?w=800',
 'Affordable 8-bed dorm with sturdy bunk beds, privacy curtains, personal lockers, and power sockets. Shared bathrooms (hot water), common kitchen, free Wi-Fi, and a rooftop hangout area. Ideal for solo backpackers and budget travellers.',
 20),
(19, 'Hostel', 499.00, 'https://images.pexels.com/photos/5158948/pexels-photo-5158948.jpeg?w=800',
 'Budget 6-bed mixed dorm near tourist attractions. Bunk beds with individual curtains, lockers, and reading lights. Shared hot water bathrooms, free Wi-Fi, common lounge, bike rental, and city tour desk.',
 18),
(20, 'Hostel', 549.00, 'https://images.pexels.com/photos/4907225/pexels-photo-4907225.jpeg?w=800',
 '6-bed air-cooled dorm with bunk beds, privacy curtains, USB ports, and secure lockers. Clean shared bathrooms, free filtered water, tea/coffee station, and free Wi-Fi. Common room with board games and TV. Near market and bus stand.',
 16),
(21, 'Hostel', 599.00, 'https://images.pexels.com/photos/5158963/pexels-photo-5158963.jpeg?w=800',
 '6-bed female-only dormitory with bunk beds, memory foam mattresses, personal curtains, and secure lockers. AC, attached bathroom, free Wi-Fi, morning tea/coffee, and a cosy common room. Ideal for solo women travellers.',
 14),
(22, 'Hostel', 649.00, 'https://images.pexels.com/photos/35165103/pexels-photo-35165103.jpeg?w=800',
 'Rustic 4-bed dorm with wooden bunk beds, warm fairy lights, lockers, and reading lamps. Shared bathrooms, free Wi-Fi, a rooftop bonfire area, and complimentary chai and biscuits each evening. Great for heritage city explorers.',
 12),
(23, 'Hostel', 699.00, 'https://images.pexels.com/photos/4907232/pexels-photo-4907232.jpeg?w=800',
 '4-bed AC dormitory with bunk beds, personal curtains, lockers, and reading lights. Attached bathroom, free Wi-Fi, free filtered water, and a morning light snack (toast + chai). Ideal for small groups and solo travellers.',
 12),
(24, 'Hostel', 749.00, 'https://images.pexels.com/photos/5137980/pexels-photo-5137980.jpeg?w=800',
 '4-bed female-only AC dorm with bunk beds, privacy curtains, individual lockers, and en-suite bathroom. Free Wi-Fi, complimentary breakfast, laundry facility, and 24h security. Popular among female students and solo women travellers.',
 10),
(25, 'Hostel', 799.00, 'https://images.pexels.com/photos/4907190/pexels-photo-4907190.jpeg?w=800',
 'Comfortable 4-bed dorm with AC, memory foam bunk beds, privacy curtains, USB ports, and secure lockers. Attached bathroom, free high-speed Wi-Fi, complimentary breakfast, laundry service, and city tour assistance.',
 10),
(26, 'Hostel', 899.00, 'https://images.pexels.com/photos/5158948/pexels-photo-5158948.jpeg?w=800',
 'Semi-private 4-bed AC dorm with bunk beds, curtains, lockers, attached bathroom, and personal reading lights. Complimentary light breakfast, free Wi-Fi, luggage storage, and 24h front desk. Near railway station and metro.',
 8),
(27, 'Hostel', 999.00, 'https://images.pexels.com/photos/4907225/pexels-photo-4907225.jpeg?w=800',
 'Private 3-bed bunk room with AC, attached bathroom, personal lockers, and 24-inch TV. Complimentary breakfast, free Wi-Fi, power backup, laundry facility, and rooftop lounge. Ideal for family groups or friend trios.',
 8),
(28, 'Hostel', 1099.00, 'https://images.pexels.com/photos/5158963/pexels-photo-5158963.jpeg?w=800',
 'Private 2-bed bunk room with AC, attached bathroom, personal lockers, 32-inch TV, and USB charging ports. Complimentary breakfast, free Wi-Fi, 24h check-in, bike rental, and city tour assistance. Centrally located.',
 8),
(29, 'Hostel', 1299.00, 'https://images.pexels.com/photos/35165103/pexels-photo-35165103.jpeg?w=800',
 'Boutique 2-bed private room with wooden decor, AC, attached bathroom with hot water, 32-inch TV, and personal lockers. Complimentary breakfast, high-speed Wi-Fi, evening chai, laundry, and concierge. Heritage city location.',
 6),
(30, 'Hostel', 1499.00, 'https://images.pexels.com/photos/4907232/pexels-photo-4907232.jpeg?w=800',
 'Premium private 2-bed hostel room with AC, king bunk, attached bathroom with rain shower, 40-inch smart TV, and mini fridge. Complimentary breakfast, high-speed Wi-Fi, express laundry, rooftop access, and 24h front desk.',
 5),

-- ──────────────────────────────────────────────────────────────
-- Single Room  IDs 31–50
-- Budget ₹900–2,000/night | Standard ₹2,200–4,000/night | Premium ₹4,500–7,000/night
-- ──────────────────────────────────────────────────────────────
(31, 'Single Room',  899.00, 'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?w=800',
 'Economy single room with single bed, ceiling fan, and attached bathroom with geyser. Free Wi-Fi, cable TV, and daily housekeeping. 24h reception and room service (7 AM–10 PM). Near bus stand and local market. Best value for budget solo travellers.',
 18),
(32, 'Single Room', 1099.00, 'https://images.pexels.com/photos/172869/pexels-photo-172869.jpeg?w=800',
 'Budget single room with single bed, AC, 24-inch TV, and attached bathroom with hot water. Free Wi-Fi, daily housekeeping, 24h reception, and room service. Complimentary morning tea. Near railway station and local market.',
 15),
(33, 'Single Room', 1299.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Standard single room with double bed, AC, 32-inch TV, and attached bathroom with hot water. Free Wi-Fi, daily housekeeping, room service (6 AM–11 PM), and complimentary water bottles. Free parking and power backup.',
 14),
(34, 'Single Room', 1499.00, 'https://images.pexels.com/photos/28054887/pexels-photo-28054887.jpeg?w=800',
 'Comfortable single room with queen-size bed, AC, 32-inch TV, mini fridge, and attached bathroom with geyser. Free Wi-Fi, daily housekeeping, 24h room service, and complimentary breakfast. Free parking, power backup, and iron on request.',
 12),
(35, 'Single Room', 1699.00, 'https://images.pexels.com/photos/12805883/pexels-photo-12805883.jpeg?w=800',
 'Well-appointed single room with queen-size bed, AC, 40-inch smart TV, mini fridge, tea/coffee maker, and work desk. Attached bathroom with hot water, daily housekeeping, 24h room service, and complimentary newspaper. Quiet floor available.',
 12),
(36, 'Single Room', 1899.00, 'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?w=800',
 'Superior single room with queen-size bed, AC, 43-inch smart TV, mini fridge, work desk, and attached bathroom with shower. Free Wi-Fi, room service, complimentary breakfast, laundry, and free parking. Business centre access included.',
 10),
(37, 'Single Room', 2199.00, 'https://images.pexels.com/photos/172869/pexels-photo-172869.jpeg?w=800',
 'Classic single room with king-size bed, AC, 43-inch smart TV, mini fridge, tea/coffee maker, and work desk. Marble-finish attached bathroom, room service, complimentary breakfast, laundry, and free parking. Power backup and 24h security.',
 10),
(38, 'Single Room', 2499.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Deluxe single room with king-size bed, premium cotton bedding, AC, 50-inch smart TV, mini bar, and attached bathroom with rain shower. Complimentary breakfast, 24h room service, express laundry, iron, and free parking.',
 8),
(39, 'Single Room', 2799.00, 'https://images.pexels.com/photos/28054887/pexels-photo-28054887.jpeg?w=800',
 'Premium single room with king-size bed, AC, 50-inch 4K smart TV, Nespresso machine, mini bar, work desk, and attached bathroom with rain shower. Complimentary breakfast and evening snacks. Butler service, express laundry, and airport transfer on request.',
 8),
(40, 'Single Room', 2999.00, 'https://images.pexels.com/photos/12805883/pexels-photo-12805883.jpeg?w=800',
 'Executive single room for corporate travellers. King-size bed, AC, 55-inch smart TV, mini bar, tea/coffee maker, executive work desk, and attached bathroom with rain shower. Complimentary breakfast, business centre access, and express laundry.',
 6),
(41, 'Single Room', 3299.00, 'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?w=800',
 'Luxury single room with king-size bed, floor-to-ceiling windows with garden view, AC, 55-inch 4K TV, Nespresso machine, mini bar, and marble bathroom with rain shower. Complimentary breakfast, pool access, gym, butler service, and express laundry.',
 6),
(42, 'Single Room', 3699.00, 'https://images.pexels.com/photos/172869/pexels-photo-172869.jpeg?w=800',
 'Superior luxury single room with king-size bed, city view, 55-inch 4K TV, fully stocked mini bar, premium bath products, and Jacuzzi shower. Complimentary breakfast and dinner, butler service, pool access, gym, and spa discount.',
 5),
(43, 'Single Room', 3999.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Premium luxury single room with king-size bed, panoramic sea or garden view, 65-inch 4K TV, mini bar, rain shower, and Jacuzzi. Complimentary breakfast, pool, gym, spa, butler service, daily fruit basket, and airport pickup.',
 5),
(44, 'Single Room', 4499.00, 'https://images.pexels.com/photos/28054887/pexels-photo-28054887.jpeg?w=800',
 'Grand single room in a 5-star property. King-size bed, 65-inch 4K smart TV, walk-in wardrobe, Nespresso, and a marble bathroom with rain shower and Jacuzzi. Complimentary breakfast and evening cocktails, pool, gym, spa, and personalised butler.',
 4),
(45, 'Single Room', 5499.00, 'https://images.pexels.com/photos/12805883/pexels-photo-12805883.jpeg?w=800',
 'Ultra-luxury single suite with a private sit-out balcony, king-size bed, 70-inch 4K TV, personal bar, rain shower, steam room, and Jacuzzi. Complimentary all-inclusive meals, pool, gym, spa, butler, limousine airport transfer, and daily turndown service.',
 3),
(46, 'Single Room', 1350.00, 'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?w=800',
 'Clean single room with double bed, AC, ceiling fan, 28-inch TV, and attached bathroom with hot water. Free Wi-Fi, daily housekeeping, room service till midnight, and complimentary water bottles. Located near hospital and corporate offices.',
 10),
(47, 'Single Room', 1750.00, 'https://images.pexels.com/photos/172869/pexels-photo-172869.jpeg?w=800',
 'Modern single room with queen-size bed, AC, 40-inch LED TV, mini fridge, and attached bathroom with rain shower. Complimentary breakfast, free Wi-Fi, housekeeping, room service, and power backup. Near airport and expressway.',
 8),
(48, 'Single Room', 2100.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Business single room with queen-size bed, AC, 43-inch TV, work desk, mini fridge, and attached bathroom. Complimentary breakfast, high-speed Wi-Fi, 24h room service, laundry, and free airport shuttle. Conference hall access.',
 8),
(49, 'Single Room', 2500.00, 'https://images.pexels.com/photos/28054887/pexels-photo-28054887.jpeg?w=800',
 'Club-floor single room with king-size bed, AC, 50-inch smart TV, Nespresso, mini bar, work desk, and attached bathroom with rain shower. Club lounge access (breakfast + evening cocktails), express laundry, and butler service.',
 5),
(50, 'Single Room', 6500.00, 'https://images.pexels.com/photos/12805883/pexels-photo-12805883.jpeg?w=800',
 'Signature single room in a landmark 5-star hotel. King-size bed, private balcony with skyline view, 70-inch 4K TV, personal bar, steam shower, and Jacuzzi. Full butler service, all-inclusive meals, spa, pool, gym, and limousine transfer.',
 2),

-- ──────────────────────────────────────────────────────────────
-- Double Room  IDs 51–70
-- Standard ₹2,000–5,000/night | Superior ₹5,500–10,000/night
-- ──────────────────────────────────────────────────────────────
(51, 'Double Room', 2099.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Economy double room with queen-size bed, AC, 28-inch TV, and attached bathroom with geyser. Free Wi-Fi, daily housekeeping, room service till midnight, and complimentary water. Near railway station and local restaurants.',
 14),
(52, 'Double Room', 2499.00, 'https://images.pexels.com/photos/4427020/pexels-photo-4427020.jpeg?w=800',
 'Standard double room with queen-size bed, AC, 32-inch TV, mini fridge, and attached bathroom with hot water. Free Wi-Fi, daily housekeeping, 24h room service, and complimentary water bottles. Free parking and power backup.',
 12),
(53, 'Double Room', 2999.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Comfortable double room with king-size bed, AC, 40-inch smart TV, mini fridge, tea/coffee maker, and attached bathroom with rain shower. Complimentary breakfast, free Wi-Fi, 24h room service, laundry, and free parking.',
 12),
(54, 'Double Room', 3499.00, 'https://images.pexels.com/photos/4427020/pexels-photo-4427020.jpeg?w=800',
 'Well-appointed double room with king-size bed, AC, 43-inch smart TV, mini bar, work desk, and attached bathroom with rain shower. Complimentary breakfast and evening snacks, express laundry, 24h room service, and free parking.',
 10),
(55, 'Double Room', 3999.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Superior double room with king-size bed, premium bedding, AC, 50-inch smart TV, Nespresso machine, mini bar, and marble bathroom with rain shower. Complimentary breakfast, pool access, 24h butler, and express laundry.',
 10),
(56, 'Double Room', 4499.00, 'https://images.pexels.com/photos/4427020/pexels-photo-4427020.jpeg?w=800',
 'Premium double room with king-size bed, balcony with garden or pool view, AC, 50-inch 4K TV, mini bar, and marble bathroom with rain shower and bathtub. Complimentary breakfast, pool, gym, spa discount, and butler.',
 8),
(57, 'Double Room', 4999.00, 'https://images.pexels.com/photos/10973940/pexels-photo-10973940.jpeg?w=800',
 'Luxury double room with balcony, king-size bed, AC, 55-inch 4K TV, Nespresso, fully stocked mini bar, and marble bathroom with Jacuzzi. Complimentary breakfast and evening cocktails, pool, gym, spa access, and personalised butler.',
 8),
(58, 'Double Room', 5499.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Heritage double room with hand-carved wooden furniture, traditional Indian textiles, AC, 50-inch TV, and a rajwada-style attached bathroom. Complimentary breakfast, in-room folk music welcome, cultural tour desk, and rooftop lounge access.',
 6),
(59, 'Double Room', 5999.00, 'https://images.pexels.com/photos/4427020/pexels-photo-4427020.jpeg?w=800',
 'Grand double room with king-size bed, city skyline view, AC, 55-inch 4K TV, walk-in wardrobe, Nespresso, and marble bathroom with rain shower. Complimentary breakfast and dinner, pool, gym, spa, butler, and airport transfer.',
 6),
(60, 'Double Room', 6499.00, 'https://images.pexels.com/photos/10973940/pexels-photo-10973940.jpeg?w=800',
 'Hilltop double room with panoramic valley view, king-size bed, AC, 55-inch 4K TV, mini bar, and bathroom with outdoor shower. Complimentary breakfast and barbeque dinner, bonfire access, guided trek, and butler service.',
 5),
(61, 'Double Room', 7499.00, 'https://images.pexels.com/photos/26752642/pexels-photo-26752642.jpeg?w=800',
 'Royal heritage double room with antique wooden furniture, silk linen, AC, 50-inch TV, and an en-suite bathroom with brass fittings and deep-soaking tub. Complimentary breakfast, in-room Ayurvedic welcome ritual, and personalised butler.',
 5),
(62, 'Double Room', 7999.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Boutique double room in a restored Indian haveli. Exposed brick walls, hand-painted murals, king-size four-poster bed, AC, 55-inch TV, and attached bathroom with clawfoot tub. Complimentary breakfast and cultural evening programme.',
 4),
(63, 'Double Room', 8499.00, 'https://images.pexels.com/photos/4427020/pexels-photo-4427020.jpeg?w=800',
 'Beachfront double room with direct sand access, king-size bed, AC, 55-inch 4K TV, outdoor shower, and terrace hammock. Complimentary seafood breakfast, kayak rental, sunset cocktail, and beach bonfire. Perfect for a coastal getaway.',
 4),
(64, 'Double Room', 8999.00, 'https://images.pexels.com/photos/10973940/pexels-photo-10973940.jpeg?w=800',
 'Jungle-view double room in a wildlife resort. King-size bed, AC, 55-inch TV, outdoor rain shower, and a private sit-out deck facing the forest. Complimentary breakfast and dinner, guided jungle safari, naturalist sessions, and campfire.',
 3),
(65, 'Double Room', 9999.00, 'https://images.pexels.com/photos/26752642/pexels-photo-26752642.jpeg?w=800',
 'Houseboat-style double room on a backwater lake. King-size bed, AC, 55-inch TV, attached bathroom, and a private sun deck. Complimentary Kerala breakfast (appam + stew), canoe ride, sunset cruise, and in-room coconut oil massage.',
 3),
(66, 'Double Room', 2299.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Value double room with queen-size bed, AC, 32-inch TV, and attached bathroom. Free Wi-Fi, daily housekeeping, room service, and complimentary water. Near shopping mall and metro. Ideal for couples on a city break.',
 12),
(67, 'Double Room', 3199.00, 'https://images.pexels.com/photos/4427020/pexels-photo-4427020.jpeg?w=800',
 'Modern double room with king-size bed, AC, 43-inch TV, mini fridge, and attached bathroom with rain shower. Complimentary breakfast, free parking, laundry, and rooftop terrace access. Walking distance to tourist sites.',
 10),
(68, 'Double Room', 4199.00, 'https://images.pexels.com/photos/10973940/pexels-photo-10973940.jpeg?w=800',
 'Club double room with king-size bed, AC, 50-inch smart TV, Nespresso, work desk, and attached marble bathroom. Club lounge access (breakfast + evening cocktails), pool, gym, express laundry, and butler service.',
 8),
(69, 'Double Room', 5299.00, 'https://images.pexels.com/photos/26752642/pexels-photo-26752642.jpeg?w=800',
 'Mountain-view double room in a Himalayan resort. King-size bed, AC, 50-inch TV, fireplace, and attached bathroom with wooden soaking tub. Complimentary breakfast, bonfire, guided trek, and yoga session at sunrise.',
 4),
(70, 'Double Room', 11000.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Ultra-luxury double room in a 5-star property on Marine Drive. King-size bed, 70-inch 4K TV, walk-in wardrobe, private terrace with sea view, rain shower and Jacuzzi. Complimentary all-inclusive meals, pool, gym, spa, butler, and limousine transfer.',
 2),

-- ──────────────────────────────────────────────────────────────
-- Deluxe Room  IDs 71–85
-- 4-star ₹6,000–12,000/night | 5-star ₹13,000–25,000/night
-- ──────────────────────────────────────────────────────────────
(71, 'Deluxe Room',  6499.00, 'https://images.pexels.com/photos/34496702/pexels-photo-34496702.jpeg?w=800',
 'Elegant deluxe room in a Mumbai property. King-size bed, floor-to-ceiling windows, AC, 55-inch 4K TV, mini bar, Nespresso, and marble bathroom with rain shower. Complimentary breakfast, pool access, gym, and concierge.',
 8),
(72, 'Deluxe Room',  7499.00, 'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?w=800',
 'Spacious deluxe room with king-size bed, private balcony with garden view, AC, 55-inch 4K TV, fully stocked mini bar, and marble bathroom with rain shower and bathtub. Complimentary breakfast, pool, gym, spa discount, and butler.',
 7),
(73, 'Deluxe Room',  7999.00, 'https://images.pexels.com/photos/34496702/pexels-photo-34496702.jpeg?w=800',
 'Deluxe room with heritage Mughal-inspired decor, king-size bed, AC, 55-inch TV, Nespresso, and attached bathroom with Jacuzzi shower. Complimentary breakfast, cultural evening programme, pool, gym, and personalised butler service.',
 7),
(74, 'Deluxe Room',  8499.00, 'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?w=800',
 'Premium deluxe room with sea view, king-size bed, AC, 60-inch 4K TV, walk-in wardrobe, Nespresso, fully stocked mini bar, and marble bathroom with rain shower. Complimentary breakfast and sunset cocktails, pool, gym, and butler.',
 6),
(75, 'Deluxe Room',  9499.00, 'https://images.pexels.com/photos/34496702/pexels-photo-34496702.jpeg?w=800',
 'Lakeside deluxe room with private sit-out deck, king-size bed, AC, 60-inch TV, Nespresso, mini bar, and bathroom with Jacuzzi and rain shower. Complimentary breakfast and dinner, boat ride, bonfire, yoga, and spa.',
 6),
(76, 'Deluxe Room',  9999.00, 'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?w=800',
 'Hillside deluxe room with panoramic valley views, king-size bed, AC, 65-inch 4K TV, fireplace, Nespresso, mini bar, and rain shower bathroom. Complimentary breakfast and dinner, bonfire, guided nature walk, yoga at sunrise, and spa.',
 5),
(77, 'Deluxe Room', 10499.00, 'https://images.pexels.com/photos/34496702/pexels-photo-34496702.jpeg?w=800',
 'Luxury deluxe room with private plunge pool, king-size bed, AC, 65-inch 4K TV, walk-in wardrobe, Nespresso, fully stocked mini bar, and marble bathroom with Jacuzzi. Complimentary all meals, spa, butler, and airport transfer.',
 5),
(78, 'Deluxe Room', 10999.00, 'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?w=800',
 'Rajput-style palace deluxe room with hand-carved marble decor, silk linen, king-size bed, AC, 65-inch TV, antique wooden wardrobe, and attached bathroom with clawfoot tub. Complimentary breakfast, elephant ride, cultural dance performance, and butler.',
 4),
(79, 'Deluxe Room', 11999.00, 'https://images.pexels.com/photos/34496702/pexels-photo-34496702.jpeg?w=800',
 'Grand deluxe room in a landmark 5-star hotel. King-size bed, 70-inch 4K TV, walk-in wardrobe, personal bar, marble bathroom with steam room and rain shower. Complimentary all-inclusive meals, pool, gym, spa, and dedicated butler.',
 4),
(80, 'Deluxe Room', 12999.00, 'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?w=800',
 'Ultra-deluxe room in a 5-star city property. Private terrace, king-size bed, 70-inch 4K TV, personal bar, Jacuzzi, rain shower, and steam room. Complimentary all-inclusive meals, pool, gym, spa, limousine airport transfer, and 24h butler.',
 3),
(81, 'Deluxe Room', 13999.00, 'https://images.pexels.com/photos/34496702/pexels-photo-34496702.jpeg?w=800',
 'Signature deluxe room in an award-winning resort. Private infinity pool, king-size bed, 70-inch 4K TV, personal bar, outdoor rain shower, and open-air Jacuzzi. Complimentary all meals, spa, butler, daily laundry, and helicopter sightseeing.',
 3),
(82, 'Deluxe Room', 15999.00, 'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?w=800',
 'Penthouse deluxe room with 360° city skyline view, king-size bed, 75-inch 4K TV, personal bar, rain shower, steam room, and Jacuzzi. Complimentary all-inclusive dining, pool, gym, spa, personal stylist service, and limousine transfer.',
 2),
(83, 'Deluxe Room',  7200.00, 'https://images.pexels.com/photos/34496702/pexels-photo-34496702.jpeg?w=800',
 'Courtyard deluxe room in a restored colonial bungalow. King-size bed, AC, 55-inch TV, Nespresso, and a tiled bathroom with clawfoot tub. Complimentary breakfast, evening sundowner on the lawn, cycling, and cultural heritage tour.',
 5),
(84, 'Deluxe Room',  8999.00, 'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?w=800',
 'Treehouse-style deluxe room in a jungle resort with forest canopy views. King-size bed, AC, 55-inch TV, outdoor rain shower, and private wooden deck with hammock. Complimentary breakfast and dinner, guided wildlife safari, and forest yoga.',
 4),
(85, 'Deluxe Room', 18000.00, 'https://images.pexels.com/photos/34496702/pexels-photo-34496702.jpeg?w=800',
 'Presidential deluxe suite at a palace hotel. King-size bed with silk linen, 80-inch 4K TV, private terrace, personal plunge pool, and a marble bathroom with rain shower, steam room, and copper bathtub. All-inclusive: gourmet meals, spa, butler, elephant ride, and private chef dinner.',
 1),

-- ──────────────────────────────────────────────────────────────
-- Family Room  IDs 86–97
-- Standard ₹5,000–9,000/night | Premium ₹9,500–18,000/night
-- ──────────────────────────────────────────────────────────────
(86, 'Family Room',  4999.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Spacious family room with one king bed and two twin beds for up to 4 guests. Two attached bathrooms, 43-inch TV, mini fridge, and microwave. AC, free Wi-Fi, daily housekeeping, pool access, and kids welcome kit on arrival.',
 8),
(87, 'Family Room',  5999.00, 'https://images.pexels.com/photos/4907225/pexels-photo-4907225.jpeg?w=800',
 'Comfortable family room with king bed + two singles, two bathrooms, 50-inch TV, mini fridge, and microwave. AC, free Wi-Fi, complimentary breakfast for all, kids play corner, pool access, and laundry facility.',
 8),
(88, 'Family Room',  6999.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Superior family room with king bed + two single beds, two attached bathrooms with hot water, 55-inch smart TV, mini bar, and kitchenette. AC, free Wi-Fi, complimentary breakfast, pool, children''s splash area, and 24h room service.',
 6),
(89, 'Family Room',  7999.00, 'https://images.pexels.com/photos/4907225/pexels-photo-4907225.jpeg?w=800',
 'Premium family room with interconnected layout — separate parents'' zone (king bed) and kids'' zone (two singles). Two bathrooms, 55-inch 4K TV in each room, mini bar, kitchenette, and balcony. Complimentary breakfast for all, kids club, pool, and butler.',
 6),
(90, 'Family Room',  8999.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Luxurious family suite with king bed + bunk beds for kids, Jacuzzi bathroom, kitchenette, and private sit-out. 60-inch 4K TV, mini bar, AC, and free Wi-Fi. Complimentary breakfast and dinner for all guests, pool, kids club, and personalised butler.',
 5),
(91, 'Family Room',  9999.00, 'https://images.pexels.com/photos/5158963/pexels-photo-5158963.jpeg?w=800',
 'Grand family room in a heritage resort with two separate bedrooms, a shared living area, king bed + two singles, two bathrooms, 55-inch TV, and a fully equipped kitchen. Complimentary breakfast and dinner for all, pool, kids programme, and butler.',
 5),
(92, 'Family Room', 10999.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Family cottage with private garden, two bedrooms (king + two singles), two bathrooms with Jacuzzi, full kitchen, 60-inch TV, and outdoor BBQ. Complimentary all-inclusive meals, pool, kids club, nature walk, bonfire, and dedicated family butler.',
 4),
(93, 'Family Room', 11999.00, 'https://images.pexels.com/photos/4907225/pexels-photo-4907225.jpeg?w=800',
 'Hilltop family villa with panoramic views, two bedrooms, two bathrooms, living room, kitchen, 65-inch TV, and private terrace. Complimentary breakfast and dinner, bonfire, guided nature walks, kids activities, yoga, and butler service.',
 4),
(94, 'Family Room', 13999.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Beach-facing family villa with private plunge pool, two bedrooms (king + twin), two bathrooms, a living area, fully stocked kitchen, and open terrace. All-inclusive meals, water sports, kids camp, kayaking, sunset cruise, and beach bonfire.',
 3),
(95, 'Family Room', 15999.00, 'https://images.pexels.com/photos/5158963/pexels-photo-5158963.jpeg?w=800',
 'Jungle family resort villa with three bedrooms, three bathrooms, living room, kitchen, private pool, and observation deck. All-inclusive meals, jungle safari, wildlife tracker, kids ranger programme, bonfire, and dedicated butler.',
 2),
(96, 'Family Room',  7499.00, 'https://images.pexels.com/photos/4907225/pexels-photo-4907225.jpeg?w=800',
 'City-centre family room with king bed and two singles, two bathrooms with rain showers, 55-inch smart TV, mini bar, and balcony. AC, free Wi-Fi, complimentary breakfast, pool, gym, kids play zone, laundry, and free parking.',
 5),
(97, 'Family Room', 18000.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Presidential family villa at a palace hotel. Three bedrooms, four bathrooms, private infinity pool, home theatre, fully staffed kitchen, and a manicured private garden. All-inclusive gourmet dining, elephant ride, cultural performance, kids royal programme, spa, and round-the-clock butler.',
 1),

-- ──────────────────────────────────────────────────────────────
-- Banquet Hall  IDs 98–105
-- Standard ₹25,000–60,000/event | Premium ₹65,000–2,20,000/event
-- ──────────────────────────────────────────────────────────────
(98,  'Banquet Hall',  25000.00, 'https://images.pexels.com/photos/3376765/pexels-photo-3376765.jpeg?w=800',
 'Compact banquet hall seating 80 guests (banquet) or 120 (theatre style). AC, PA system, projector and screen, customisable lighting, and a basic decor package. Pre-function foyer, catering tie-up, and on-site coordinator. Suitable for small weddings, corporate training, and birthday parties.',
 3),
(99,  'Banquet Hall',  35000.00, 'https://images.pexels.com/photos/33485968/pexels-photo-33485968.jpeg?w=800',
 'Elegant outdoor courtyard venue with white draping, fairy lights, and seating for 150 guests. PA system, LED backdrop, basic floral decor, and catering service. Valet parking for 60 cars. Ideal for intimate weddings, engagement ceremonies, and mehendi events.',
 2),
(100, 'Banquet Hall',  40000.00, 'https://images.pexels.com/photos/3835638/pexels-photo-3835638.jpeg?w=800',
 'Rooftop banquet venue with panoramic city views and seating for 200 guests. Modular stage, LED backdrop, surround sound, customisable fairy light canopy, and basic decor package. Catering and bar setup available. Ideal for corporate parties, cocktail evenings, and sangeet nights.',
 2),
(101, 'Banquet Hall',  45000.00, 'https://images.pexels.com/photos/33914522/pexels-photo-33914522.jpeg?w=800',
 'Fully air-conditioned banquet hall seating 250 guests. Raised stage, 4K projection system, LED backdrop, surround sound, customisable lighting rig, and pre-function foyer. Valet parking for 80 cars, dedicated event coordinator, and in-house catering. Ideal for weddings, receptions, and corporate galas.',
 2),
(102, 'Banquet Hall',  60000.00, 'https://images.pexels.com/photos/33852450/pexels-photo-33852450.jpeg?w=800',
 'Premium banquet hall with crystal chandeliers seating 400 guests. Professional AV system, kinetic LED lighting, bridal changing room, pre-function lawn, valet parking for 150 cars, dedicated coordinator, and 5-course in-house catering. Perfect for grand Indian weddings and corporate award nights.',
 2),
(103, 'Banquet Hall',  85000.00, 'https://images.pexels.com/photos/33914530/pexels-photo-33914530.jpeg?w=800',
 'Grand ballroom with opulent chandeliers seating 600 guests. Royal stage with floral backdrop, state-of-the-art AV and lighting rig, bridal suite with vanity room, pre-function lounge, live kitchen with 6 food stations, valet parking for 200 cars, full floral décor package, and dedicated wedding planner.',
 2),
(104, 'Banquet Hall', 120000.00, 'https://images.pexels.com/photos/33852468/pexels-photo-33852468.jpeg?w=800',
 'Luxury Indian wedding ballroom with crystal chandeliers seating 800 guests. Imported marble flooring, royal stage with jhoola backdrop, state-of-the-art AV and kinetic lighting rig, live kitchen with 8 food stations, full floral décor package, 5-star catering, dedicated wedding planner, bridal suite, and valet parking for 250 vehicles.',
 1),
(105, 'Banquet Hall', 220000.00, 'https://images.pexels.com/photos/30311728/pexels-photo-30311728.jpeg?w=800',
 'Ultra-premium palace-style grand ballroom seating 1200 guests with a gold-leaf ceiling, crystal chandeliers, and Italian marble floors. Includes a royal stage with mehendi mandap setup, full kinetic AV and laser lighting rig, live kitchen with 12 themed food stations, 5-star catering, full floral and draping décor package, bridal palace suite, valet parking for 400 vehicles, and two dedicated wedding planners. The ultimate venue for a grand Indian shaadi.',
 1);

-- ══════════════════════════════════════════════════════════════
-- ADDITIONAL ROOMS — IDs 106–180  (75 new rooms)
-- 5 per room-type per location: 7 types × 5 locations = 35 slots
-- Each type already had 3–4; adding 1–2 per slot to reach exactly 5
-- ══════════════════════════════════════════════════════════════
INSERT INTO rooms (id, room_type, room_price, room_photo_url, room_description, total_inventory) VALUES

-- ── PG  IDs 106–115  (2 extra per location × 5 = 10)
(106, 'PG', 183.33, 'https://images.pexels.com/photos/5991542/pexels-photo-5991542.jpeg?w=800',
 'Cosy single-occupancy PG near Koregaon Park cafes. Furnished room with single bed, study table, ceiling fan, and shared kitchen. Free Wi-Fi, 24h security, and RO water. Laundry service available. Ideal for students and early-career professionals.',
 10),
(107, 'PG', 216.67, 'https://images.pexels.com/photos/7031867/pexels-photo-7031867.jpeg?w=800',
 'Value PG near Koregaon Park with semi-private room, single bed, AC, and shared bathroom. Breakfast included. Free Wi-Fi, biometric entry, power backup, CCTV, and proximity to vibrant social hubs. Great for working professionals new to Pune.',
 8),
(108, 'PG', 233.33, 'https://images.pexels.com/photos/31944406/pexels-photo-31944406.jpeg?w=800',
 'Budget-friendly PG in Baner with single bed, ceiling fan, study desk, and shared bathroom. Home-cooked meals (breakfast + dinner) included. Free Wi-Fi, 24h security, RO water, and laundry area. Near Baner IT park and restaurants.',
 10),
(109, 'PG', 266.67, 'https://images.pexels.com/photos/31944372/pexels-photo-31944372.jpeg?w=800',
 'Comfortable PG in Baner for IT professionals. AC room with single bed, wardrobe, and attached bathroom. Two meals daily (veg/non-veg options). High-speed Wi-Fi, power backup, housekeeping, gym tie-up, and 5-min walk to tech park.',
 8),
(110, 'PG', 283.33, 'https://images.pexels.com/photos/7031867/pexels-photo-7031867.jpeg?w=800',
 'Spacious PG near Viman Nagar metro. Single bed, AC, study desk, and shared bathroom with geyser. Meals included, free Wi-Fi, CCTV, power backup, and laundry. Close to Phoenix MarketCity and airport expressway.',
 8),
(111, 'PG', 316.67, 'https://images.pexels.com/photos/5991542/pexels-photo-5991542.jpeg?w=800',
 'Premium PG in Viman Nagar with furnished room, AC, queen-size bed, and attached bathroom. Chef-cooked 3 meals, high-speed Wi-Fi, housekeeping, laundry, gym access, and power backup. Minutes from IT companies and shopping.',
 6),
(112, 'PG', 250.00, 'https://images.pexels.com/photos/31944373/pexels-photo-31944373.jpeg?w=800',
 'Modern PG in Hinjewadi Phase 1 for techies. AC room with single bed, work desk, wardrobe, and shared bathroom. Two meals, free Wi-Fi, biometric entry, power backup, and daily housekeeping. Shuttle point to tech park nearby.',
 8),
(113, 'PG', 300.00, 'https://images.pexels.com/photos/6636242/pexels-photo-6636242.jpeg?w=800',
 'Well-maintained PG in Hinjewadi with AC, single bed, 24-inch TV, attached bathroom, and work desk. Three meals daily, high-speed Wi-Fi, laundry, housekeeping, and gym. Ideal for software engineers joining nearby MNCs.',
 6),
(114, 'PG', 233.33, 'https://images.pexels.com/photos/11295825/pexels-photo-11295825.jpeg?w=800',
 'Affordable PG in Kothrud near colleges and coaching centres. Single bed, ceiling fan, study table, and shared bathroom. Free Wi-Fi, CCTV, RO water, laundry area, and common recreation room with TV. No brokerage.',
 10),
(115, 'PG', 283.33, 'https://images.pexels.com/photos/31976026/pexels-photo-31976026.jpeg?w=800',
 'Comfortable PG in Kothrud for working professionals. AC room, single bed, wardrobe, attached bathroom, and small balcony. Breakfast + dinner included, free Wi-Fi, power backup, housekeeping, and laundry. Walking distance to Karve Rd.',
 8),

-- ── Hostel  IDs 116–125  (2 extra per location × 5 = 10)
(116, 'Hostel', 449.00, 'https://images.pexels.com/photos/5137980/pexels-photo-5137980.jpeg?w=800',
 'Artsy 6-bed mixed dorm in Koregaon Park. Wooden bunk beds, locker, reading lights, USB ports, and privacy curtains. Shared bathroom with hot water. Rooftop hangout, free Wi-Fi, complimentary chai, and a social games corner.',
 14),
(117, 'Hostel', 649.00, 'https://images.pexels.com/photos/4907190/pexels-photo-4907190.jpeg?w=800',
 'Boutique private-room hostel in Koregaon Park. 2-bed bunk room with AC, attached bathroom, 32-inch TV, and personal lockers. Complimentary breakfast, high-speed Wi-Fi, daily housekeeping, rooftop access, and café next door.',
 8),
(118, 'Hostel', 399.00, 'https://images.pexels.com/photos/4907232/pexels-photo-4907232.jpeg?w=800',
 'No-frills 8-bed budget dorm in Baner near IT hub. Bunk beds with lockers, reading lights, shared bathroom (hot water), free Wi-Fi, common kitchen, and bicycle rental. Ideal for budget travellers and IT interns.',
 18),
(119, 'Hostel', 599.00, 'https://images.pexels.com/photos/5158948/pexels-photo-5158948.jpeg?w=800',
 'AC 4-bed female-only dorm in Baner. Memory foam bunk beds, privacy curtains, secure lockers, and attached bathroom. Complimentary breakfast, free Wi-Fi, laundry, and 24h security. Safe and comfortable for solo women travellers.',
 10),
(120, 'Hostel', 449.00, 'https://images.pexels.com/photos/5158963/pexels-photo-5158963.jpeg?w=800',
 'Backpacker-friendly 6-bed dorm in Viman Nagar near airport metro. Bunk beds, lockers, hot-water shared bathroom, free Wi-Fi, coin-operated laundry, and a 24h front desk. Convenient for early morning flights and transit stays.',
 14),
(121, 'Hostel', 699.00, 'https://images.pexels.com/photos/35165103/pexels-photo-35165103.jpeg?w=800',
 'Modern private twin hostel room in Viman Nagar. AC, attached bathroom with hot water, personal lockers, 28-inch TV, and USB charging. Complimentary breakfast, free Wi-Fi, express laundry, and easy metro access.',
 8),
(122, 'Hostel', 499.00, 'https://images.pexels.com/photos/4907225/pexels-photo-4907225.jpeg?w=800',
 'Tech-worker dorm in Hinjewadi for weekend stays and short stays. 6-bed AC dorm, memory foam bunks, curtains, USB ports, locker, and shared bathroom. Tea/coffee station, free Wi-Fi, and shuttle info desk.',
 12),
(123, 'Hostel', 799.00, 'https://images.pexels.com/photos/4907232/pexels-photo-4907232.jpeg?w=800',
 'Private 2-bed bunk room in Hinjewadi hostel. AC, attached bathroom with rain shower, 32-inch TV, personal lockers, and work desk. Complimentary breakfast, high-speed Wi-Fi, laundry, and on-site café.',
 8),
(124, 'Hostel', 399.00, 'https://images.pexels.com/photos/5137980/pexels-photo-5137980.jpeg?w=800',
 'Student-friendly 8-bed dorm in Kothrud near Symbiosis and COEP. Bunk beds, lockers, shared bathroom with hot water, free Wi-Fi, common kitchen, and study area. Ideal for college students and exam-season visitors.',
 16),
(125, 'Hostel', 649.00, 'https://images.pexels.com/photos/4907190/pexels-photo-4907190.jpeg?w=800',
 'Comfortable 4-bed dorm in Kothrud. AC, memory foam bunks, curtains, lockers, and shared bathroom. Complimentary light breakfast, free Wi-Fi, 24h reception, and laundry. Close to D-Mart, PMC garden, and local eateries.',
 10),

-- ── Single Room  IDs 126–130  (1 extra per location × 5 = 5)
(126, 'Single Room', 1199.00, 'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?w=800',
 'Neat single room in Koregaon Park with double bed, AC, 32-inch TV, and attached bathroom with hot water. Free Wi-Fi, daily housekeeping, room service till midnight, complimentary water. Walking distance to cafes and nightlife.',
 10),
(127, 'Single Room', 1549.00, 'https://images.pexels.com/photos/172869/pexels-photo-172869.jpeg?w=800',
 'Modern single room in Baner with queen-size bed, AC, 40-inch smart TV, mini fridge, and attached bathroom with rain shower. Complimentary breakfast, free Wi-Fi, housekeeping, room service, and free parking. Near Baner junction.',
 10),
(128, 'Single Room', 1849.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Superior single room in Viman Nagar with king-size bed, AC, 43-inch TV, tea/coffee maker, work desk, and attached bathroom. Complimentary breakfast, free Wi-Fi, 24h room service, laundry, and easy airport access.',
 8),
(129, 'Single Room', 1449.00, 'https://images.pexels.com/photos/28054887/pexels-photo-28054887.jpeg?w=800',
 'Smart single room in Hinjewadi ideal for IT professionals. Queen-size bed, AC, 36-inch TV, work desk, and attached bathroom with geyser. Complimentary breakfast, free Wi-Fi, power backup, room service, and free parking.',
 10),
(130, 'Single Room', 1649.00, 'https://images.pexels.com/photos/12805883/pexels-photo-12805883.jpeg?w=800',
 'Comfortable single room in Kothrud near law college road. Queen-size bed, AC, 40-inch LED TV, mini fridge, and attached bathroom with hot water. Complimentary breakfast, free Wi-Fi, housekeeping, and 24h room service.',
 10),

-- ── Double Room  IDs 131–135  (1 extra per location × 5 = 5)
(131, 'Double Room', 2799.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Stylish double room in Koregaon Park with king-size bed, AC, 43-inch TV, mini bar, and attached marble bathroom with rain shower. Complimentary breakfast, rooftop access, pool, free Wi-Fi, 24h room service, and free parking.',
 10),
(132, 'Double Room', 3299.00, 'https://images.pexels.com/photos/4427020/pexels-photo-4427020.jpeg?w=800',
 'Premium double room in Baner with king-size bed, AC, 50-inch 4K TV, Nespresso machine, mini bar, and marble bathroom with rain shower. Complimentary breakfast and evening snacks, pool, gym, butler, and express laundry.',
 8),
(133, 'Double Room', 2599.00, 'https://images.pexels.com/photos/10973940/pexels-photo-10973940.jpeg?w=800',
 'Comfortable double room in Viman Nagar with queen-size bed, AC, 40-inch TV, mini fridge, and attached bathroom. Complimentary breakfast, free Wi-Fi, 24h room service, laundry, and 10-min drive to airport. City views.',
 10),
(134, 'Double Room', 3099.00, 'https://images.pexels.com/photos/172872/pexels-photo-172872.jpeg?w=800',
 'Well-appointed double room in Hinjewadi for corporate teams. King-size bed, AC, 50-inch smart TV, work desk, mini bar, and attached bathroom with rain shower. Complimentary breakfast, free Wi-Fi, room service, and free parking.',
 8),
(135, 'Double Room', 2899.00, 'https://images.pexels.com/photos/4427020/pexels-photo-4427020.jpeg?w=800',
 'Elegant double room in Kothrud with king-size bed, AC, 43-inch TV, tea/coffee maker, work desk, and attached bathroom. Complimentary breakfast, free Wi-Fi, pool, gym, 24h room service, laundry, and free parking.',
 10),

-- ── Deluxe Room  IDs 136–145  (2 extra per location × 5 = 10)
(136, 'Deluxe Room', 7999.00, 'https://images.pexels.com/photos/34496702/pexels-photo-34496702.jpeg?w=800',
 'Sophisticated deluxe room in Koregaon Park. King-size bed, floor-to-ceiling windows, AC, 55-inch 4K TV, Nespresso, mini bar, and marble bathroom with Jacuzzi shower. Complimentary breakfast, pool, gym, spa discount, and butler.',
 6),
(137, 'Deluxe Room', 9499.00, 'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?w=800',
 'Grand deluxe room in Koregaon Park with private sit-out balcony. King-size bed, AC, 60-inch 4K TV, Nespresso, personal bar, and marble bathroom with rain shower and bathtub. Complimentary all meals, pool, gym, spa, and 24h butler.',
 4),
(138, 'Deluxe Room', 8499.00, 'https://images.pexels.com/photos/34496702/pexels-photo-34496702.jpeg?w=800',
 'Spacious deluxe room in Baner near Westend Mall. King-size bed, AC, 60-inch 4K TV, walk-in wardrobe, Nespresso, mini bar, and marble bathroom with rain shower. Complimentary breakfast and dinner, pool, gym, and butler service.',
 5),
(139, 'Deluxe Room', 9999.00, 'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?w=800',
 'Ultra-luxury deluxe room in Baner with private plunge pool on the terrace. King-size bed, AC, 65-inch 4K TV, personal bar, outdoor rain shower, and Jacuzzi. Complimentary all-inclusive meals, spa, butler, and city-view terrace.',
 3),
(140, 'Deluxe Room', 7499.00, 'https://images.pexels.com/photos/34496702/pexels-photo-34496702.jpeg?w=800',
 'Elegant deluxe room in Viman Nagar with king-size bed, AC, 55-inch 4K TV, Nespresso, mini bar, and marble bathroom with rain shower. Complimentary breakfast, pool, gym, concierge, and express laundry. Near airport.',
 6),
(141, 'Deluxe Room', 8999.00, 'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?w=800',
 'Signature deluxe room in Viman Nagar. King-size bed, 65-inch 4K TV, walk-in wardrobe, personal bar, steam shower, and Jacuzzi. Complimentary all-inclusive meals, pool, gym, spa, and limousine airport transfer.',
 4),
(142, 'Deluxe Room', 7999.00, 'https://images.pexels.com/photos/34496702/pexels-photo-34496702.jpeg?w=800',
 'Premium deluxe room in Hinjewadi IT hub. King-size bed, AC, 60-inch 4K TV, walk-in wardrobe, Nespresso, fully stocked mini bar, and marble bathroom with rain shower. Complimentary breakfast and sunset cocktails, pool, gym, and butler.',
 5),
(143, 'Deluxe Room', 9499.00, 'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?w=800',
 'Corporate deluxe suite in Hinjewadi. Private terrace, king-size bed, 70-inch 4K TV, personal bar, Jacuzzi, rain shower, and steam room. Complimentary all-inclusive meals, pool, gym, spa, limousine transfer, and 24h butler.',
 3),
(144, 'Deluxe Room', 8499.00, 'https://images.pexels.com/photos/34496702/pexels-photo-34496702.jpeg?w=800',
 'Luxurious deluxe room in Kothrud near Chandani Chowk. King-size bed, AC, 60-inch 4K TV, Nespresso, fully stocked mini bar, and marble bathroom with rain shower and bathtub. Complimentary breakfast and dinner, pool, gym, and butler.',
 5),
(145, 'Deluxe Room', 9999.00, 'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?w=800',
 'Award-winning deluxe suite in Kothrud. Private infinity-edge plunge pool, king-size bed, 70-inch 4K TV, personal bar, open-air Jacuzzi, and outdoor rain shower. All meals, spa, butler, daily laundry, and sightseeing assistance.',
 3),

-- ── Family Room  IDs 146–160  (3 extra per location × 5 = 15)
(146, 'Family Room', 6499.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Warm family room in Koregaon Park with king bed + two twin beds. Two bathrooms with rain showers, 50-inch TV, mini fridge, microwave, and balcony. AC, free Wi-Fi, complimentary breakfast for all, pool access, and kids welcome kit.',
 6),
(147, 'Family Room', 8499.00, 'https://images.pexels.com/photos/4907225/pexels-photo-4907225.jpeg?w=800',
 'Premium interconnected family suite in Koregaon Park. Separate parents and kids rooms, two bathrooms, 55-inch 4K TV in each room, mini bar, and kitchenette. Complimentary breakfast, pool, kids club, spa discount, and butler.',
 4),
(148, 'Family Room', 11999.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Grand family cottage in Koregaon Park with private garden and outdoor BBQ. Two bedrooms (king + two twins), two Jacuzzi bathrooms, full kitchen, 60-inch TV, and sun deck. All-inclusive meals, pool, kids programme, and butler.',
 3),
(149, 'Family Room', 6999.00, 'https://images.pexels.com/photos/4907225/pexels-photo-4907225.jpeg?w=800',
 'Spacious family room in Baner for tech-visit families. King bed + two singles, two bathrooms with hot water, 55-inch smart TV, mini bar, kitchenette, and balcony. Complimentary breakfast for all, pool, kids play area, gym, and laundry.',
 6),
(150, 'Family Room', 9499.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Luxurious family suite in Baner with interconnected layout, Jacuzzi bathroom, kitchenette, and private sit-out. 60-inch 4K TV, mini bar, AC. Complimentary breakfast and dinner, kids club, pool, gym, and personalised butler.',
 4),
(151, 'Family Room', 12999.00, 'https://images.pexels.com/photos/5158963/pexels-photo-5158963.jpeg?w=800',
 'Two-bedroom family cottage in Baner with private pool, garden, and outdoor BBQ. Full kitchen, 65-inch TV, two bathrooms, and terrace. All-inclusive meals, kids ranger programme, safari, bonfire, and dedicated family butler.',
 2),
(152, 'Family Room', 6499.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Well-appointed family room in Viman Nagar. King bed + two singles, two bathrooms, 50-inch TV, mini fridge, and balcony. AC, free Wi-Fi, complimentary breakfast for all, kids splash area, pool, laundry, and airport shuttle.',
 5),
(153, 'Family Room', 8999.00, 'https://images.pexels.com/photos/4907225/pexels-photo-4907225.jpeg?w=800',
 'Premium family suite in Viman Nagar near Phoenix. Two rooms (king + bunk beds), two bathrooms, 55-inch 4K TV each, mini bar, and kitchenette. Complimentary breakfast and dinner for all, kids club, pool, gym, and butler.',
 4),
(154, 'Family Room', 6499.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Family-friendly room in Hinjewadi for corporate relocation stays. King + two singles, two bathrooms with rain showers, 55-inch smart TV, mini bar, kitchenette, and balcony. Complimentary breakfast, kids play zone, pool, and free parking.',
 5),
(155, 'Family Room', 9499.00, 'https://images.pexels.com/photos/4907225/pexels-photo-4907225.jpeg?w=800',
 'Deluxe family suite in Hinjewadi. Interconnected layout — parents'' suite and kids'' zone, two Jacuzzi bathrooms, 60-inch 4K TV each, fully stocked mini bar, and full kitchen. All-inclusive meals, kids club, pool, gym, and butler.',
 3),
(156, 'Family Room', 13999.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Exclusive hilltop family villa in Hinjewadi with panoramic valley view, two bedrooms, two bathrooms, living room, kitchen, 65-inch TV, and private terrace. All meals, bonfire, nature walks, kids activities, yoga, and butler service.',
 2),
(157, 'Family Room', 6999.00, 'https://images.pexels.com/photos/4907225/pexels-photo-4907225.jpeg?w=800',
 'Welcoming family room in Kothrud near Chandani Chowk. King bed + two singles, two bathrooms with hot water, 55-inch smart TV, mini bar, and balcony. Complimentary breakfast for all, pool, kids play corner, laundry, and free parking.',
 5),
(158, 'Family Room', 8999.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Luxury family suite in Kothrud with interconnected bedrooms, Jacuzzi bathroom, kitchenette, and private garden. 60-inch 4K TV, mini bar, AC, and sun deck. Complimentary breakfast and dinner, kids club, pool, gym, and personalised butler.',
 4),
(159, 'Family Room', 14999.00, 'https://images.pexels.com/photos/5158963/pexels-photo-5158963.jpeg?w=800',
 'Presidential family villa in Kothrud with private plunge pool, two bedrooms, two bathrooms, home theatre, fully equipped kitchen, and manicured garden. All-inclusive meals, elephant ride, cultural show, kids royal programme, spa, and butler.',
 2),
(160, 'Family Room', 10999.00, 'https://images.pexels.com/photos/31944424/pexels-photo-31944424.jpeg?w=800',
 'Resort-style family suite in Viman Nagar with private garden pool, two bedrooms, two bathrooms, living area, full kitchen, and outdoor BBQ. All-inclusive meals, water sports, kids camp, kayaking, sunset cruise, and beach bonfire.',
 3),

-- ── Banquet Hall  IDs 161–180  (4 extra per location × 5 = 20)
(161, 'Banquet Hall',  30000.00, 'https://images.pexels.com/photos/3376765/pexels-photo-3376765.jpeg?w=800',
 'AC banquet hall in Koregaon Park seating 100 guests. PA system, projector, customisable lighting, pre-function foyer, and basic decor package. Catering tie-up, valet for 40 cars, on-site coordinator. Ideal for small weddings and corporate events.',
 2),
(162, 'Banquet Hall',  50000.00, 'https://images.pexels.com/photos/33485968/pexels-photo-33485968.jpeg?w=800',
 'Elegant rooftop banquet in Koregaon Park seating 200 guests. Fairy lights, LED backdrop, PA system, basic floral decor, catering service, and valet for 60 cars. Perfect for cocktail evenings, mehendi nights, and sangeet functions.',
 2),
(163, 'Banquet Hall',  75000.00, 'https://images.pexels.com/photos/3835638/pexels-photo-3835638.jpeg?w=800',
 'Premium crystal-chandelier hall in Koregaon Park seating 350 guests. Professional AV, kinetic LED lighting, bridal suite, pre-function lawn, valet for 120 cars, and 5-course in-house catering. Ideal for grand weddings and award nights.',
 1),
(164, 'Banquet Hall', 100000.00, 'https://images.pexels.com/photos/33914522/pexels-photo-33914522.jpeg?w=800',
 'Grand Koregaon Park ballroom seating 500 guests. Imported marble flooring, royal stage with floral backdrop, state-of-the-art AV and lighting, live kitchen with 6 stations, full floral décor, valet for 180 cars, and dedicated wedding planner.',
 1),
(165, 'Banquet Hall',  28000.00, 'https://images.pexels.com/photos/3376765/pexels-photo-3376765.jpeg?w=800',
 'Compact AC banquet hall in Baner seating 90 guests. PA system, projector and screen, LED backdrop, customisable lighting, and basic decor. Pre-function foyer, catering tie-up, and event coordinator. Ideal for corporate meets and birthday bashes.',
 2),
(166, 'Banquet Hall',  48000.00, 'https://images.pexels.com/photos/33485968/pexels-photo-33485968.jpeg?w=800',
 'Outdoor courtyard venue in Baner seating 180 guests. White draping, fairy lights, PA system, LED backdrop, basic floral decor, and catering. Valet parking for 55 cars. Best for engagement parties, sangeet, and corporate sundowners.',
 2),
(167, 'Banquet Hall',  70000.00, 'https://images.pexels.com/photos/33852450/pexels-photo-33852450.jpeg?w=800',
 'Premium AC banquet in Baner seating 300 guests. Crystal chandeliers, professional AV, kinetic lighting, bridal room, pre-function lawn, valet for 100 cars, dedicated coordinator, and in-house 5-star catering. Perfect for grand weddings.',
 1),
(168, 'Banquet Hall',  95000.00, 'https://images.pexels.com/photos/33914530/pexels-photo-33914530.jpeg?w=800',
 'Opulent grand ballroom in Baner seating 600 guests. Royal stage, floral backdrop, state-of-the-art AV and lighting, bridal suite, live kitchen with 7 food stations, valet for 200 cars, full floral décor, and dedicated wedding planner.',
 1),
(169, 'Banquet Hall',  32000.00, 'https://images.pexels.com/photos/3376765/pexels-photo-3376765.jpeg?w=800',
 'Modern banquet hall in Viman Nagar seating 120 guests. AC, PA system, 4K projection, LED backdrop, customisable lighting, basic decor, and catering tie-up. Pre-function foyer, valet for 50 cars, and on-site coordinator. Near airport.',
 2),
(170, 'Banquet Hall',  55000.00, 'https://images.pexels.com/photos/33485968/pexels-photo-33485968.jpeg?w=800',
 'Rooftop banquet venue in Viman Nagar with panoramic city view. Seating 220 guests, LED fairy lights, PA, LED backdrop, catering, and valet for 70 cars. Ideal for corporate parties, cocktail evenings, and sangeet functions.',
 2),
(171, 'Banquet Hall',  72000.00, 'https://images.pexels.com/photos/3835638/pexels-photo-3835638.jpeg?w=800',
 'Premium banquet hall in Viman Nagar seating 320 guests. Crystal chandeliers, kinetic LED lighting, professional AV, bridal room, pre-function lawn, valet for 110 cars, dedicated coordinator, and in-house catering. Ideal for grand weddings.',
 1),
(172, 'Banquet Hall', 110000.00, 'https://images.pexels.com/photos/33914522/pexels-photo-33914522.jpeg?w=800',
 'Grand airport-area ballroom in Viman Nagar seating 700 guests. Imported marble flooring, royal stage, state-of-the-art AV and lighting, live kitchen with 8 stations, full floral décor, valet for 250 cars, and two dedicated wedding planners.',
 1),
(173, 'Banquet Hall',  29000.00, 'https://images.pexels.com/photos/3376765/pexels-photo-3376765.jpeg?w=800',
 'Corporate banquet hall in Hinjewadi seating 100 guests. PA system, projector, modular stage, LED backdrop, customisable lighting, catering tie-up, and valet for 40 cars. Ideal for product launches, team offsites, and year-end parties.',
 2),
(174, 'Banquet Hall',  52000.00, 'https://images.pexels.com/photos/33485968/pexels-photo-33485968.jpeg?w=800',
 'Open-air terrace banquet in Hinjewadi seating 200 guests. Fairy lights, LED backdrop, surround sound, floral decor, catering, and valet for 65 cars. Great for corporate farewells, sangeet nights, and engagement ceremonies.',
 2),
(175, 'Banquet Hall',  68000.00, 'https://images.pexels.com/photos/33852450/pexels-photo-33852450.jpeg?w=800',
 'Crystal-chandelier banquet in Hinjewadi seating 280 guests. Professional AV, kinetic LED lighting, bridal room, pre-function lawn, valet for 95 cars, dedicated coordinator, and in-house catering. Ideal for large IT company parties and weddings.',
 1),
(176, 'Banquet Hall',  90000.00, 'https://images.pexels.com/photos/33914530/pexels-photo-33914530.jpeg?w=800',
 'Grand palace-style ballroom in Hinjewadi seating 550 guests. Royal stage, floral backdrop, state-of-the-art AV and lighting, bridal suite, live kitchen with 7 food stations, valet for 180 cars, full décor package, and wedding planner.',
 1),
(177, 'Banquet Hall',  27000.00, 'https://images.pexels.com/photos/3376765/pexels-photo-3376765.jpeg?w=800',
 'Elegant banquet hall in Kothrud seating 90 guests. AC, PA system, projector, LED backdrop, customisable lighting, basic decor package, catering tie-up, valet for 35 cars, and on-site coordinator. Perfect for small weddings and birthday parties.',
 2),
(178, 'Banquet Hall',  47000.00, 'https://images.pexels.com/photos/33485968/pexels-photo-33485968.jpeg?w=800',
 'Outdoor banquet garden in Kothrud seating 170 guests. White draping, fairy lights, LED backdrop, surround sound, floral decor, catering, and valet for 55 cars. Ideal for mehendi ceremonies, sangeet nights, and corporate sundowners.',
 2),
(179, 'Banquet Hall',  65000.00, 'https://images.pexels.com/photos/3835638/pexels-photo-3835638.jpeg?w=800',
 'Premium banquet hall in Kothrud seating 300 guests. Crystal chandeliers, professional AV and lighting, bridal room, pre-function lawn, valet for 100 cars, dedicated coordinator, and in-house 5-star catering. Ideal for grand Indian weddings.',
 1),
(180, 'Banquet Hall',  88000.00, 'https://images.pexels.com/photos/33914530/pexels-photo-33914530.jpeg?w=800',
 'Opulent grand ballroom in Kothrud seating 520 guests. Royal stage with jhoola backdrop, state-of-the-art AV and kinetic lighting, bridal palace suite, live kitchen with 8 themed food stations, full floral décor package, valet for 170 cars, and two wedding planners.',
 1);

-- Amenities (master list)
INSERT INTO amenities (id, name, icon_key, category) VALUES
(1,  'Free Wi-Fi',          'wifi',          'TECH'),
(2,  'Air Conditioning',    'ac',            'ROOM'),
(3,  'Flat-screen TV',      'tv',            'ROOM'),
(4,  'Mini Fridge',         'fridge',        'ROOM'),
(5,  'Room Service',        'room_service',  'ROOM'),
(6,  'En-suite Bathroom',   'bathroom',      'BATHROOM'),
(7,  'Rain Shower',         'shower',        'BATHROOM'),
(8,  'Jacuzzi',             'jacuzzi',       'BATHROOM'),
(9,  'Swimming Pool',       'pool',          'PROPERTY'),
(10, 'Gym',                 'gym',           'PROPERTY'),
(11, 'Free Parking',        'parking',       'PROPERTY'),
(12, 'Restaurant',          'restaurant',    'FOOD'),
(13, 'Breakfast Included',  'breakfast',     'FOOD'),
(14, 'Work Desk',           'desk',          'ROOM'),
(15, 'Locker',              'locker',        'ROOM'),
(16, 'Laundry',             'laundry',       'PROPERTY'),
(17, 'CCTV / 24h Security', 'security',      'PROPERTY'),
(18, 'Balcony',             'balcony',       'ROOM'),
(19, 'Kitchen Access',      'kitchen',       'FOOD'),
(20, 'Iron & Ironing Board','iron',          'ROOM');

-- Room Amenities junction (IDs 1–105)
INSERT INTO room_amenities (room_id, amenity_id) VALUES
-- PG 1–5 (budget)
(1,1),(1,16),(1,17),
(2,1),(2,17),(2,16),
(3,1),(3,16),(3,17),(3,19),
(4,1),(4,2),(4,13),(4,16),(4,17),
(5,1),(5,2),(5,13),(5,16),(5,17),
-- PG 6–10 (standard)
(6,1),(6,2),(6,3),(6,13),(6,16),(6,17),
(7,1),(7,2),(7,3),(7,6),(7,13),(7,16),(7,17),
(8,1),(8,2),(8,3),(8,6),(8,10),(8,13),(8,16),(8,17),
(9,1),(9,2),(9,3),(9,6),(9,7),(9,10),(9,13),(9,16),(9,17),
(10,1),(10,2),(10,3),(10,4),(10,6),(10,7),(10,9),(10,10),(10,13),(10,16),(10,17),
-- PG 11–15 (premium)
(11,1),(11,2),(11,3),(11,4),(11,6),(11,7),(11,9),(11,10),(11,13),(11,16),(11,17),(11,19),
(12,1),(12,2),(12,3),(12,4),(12,6),(12,7),(12,9),(12,10),(12,13),(12,16),(12,17),(12,19),
(13,1),(13,2),(13,3),(13,4),(13,6),(13,7),(13,8),(13,9),(13,10),(13,13),(13,16),(13,17),(13,18),(13,19),
(14,1),(14,2),(14,3),(14,4),(14,6),(14,7),(14,8),(14,9),(14,10),(14,13),(14,16),(14,17),(14,18),(14,19),
(15,1),(15,2),(15,3),(15,4),(15,6),(15,7),(15,8),(15,9),(15,10),(15,13),(15,16),(15,17),(15,18),(15,19),
-- Hostel 16–20 (budget dorm)
(16,1),(16,15),(16,17),(16,19),
(17,1),(17,15),(17,17),(17,19),
(18,1),(18,15),(18,17),(18,19),
(19,1),(19,15),(19,17),(19,19),
(20,1),(20,2),(20,15),(20,17),(20,19),
-- Hostel 21–25 (standard dorm)
(21,1),(21,2),(21,6),(21,13),(21,15),(21,17),
(22,1),(22,2),(22,6),(22,13),(22,15),(22,17),
(23,1),(23,2),(23,6),(23,13),(23,15),(23,17),
(24,1),(24,2),(24,6),(24,13),(24,15),(24,16),(24,17),
(25,1),(25,2),(25,6),(25,13),(25,15),(25,16),(25,17),
-- Hostel 26–30 (semi-private / private)
(26,1),(26,2),(26,6),(26,13),(26,15),(26,16),(26,17),
(27,1),(27,2),(27,3),(27,6),(27,13),(27,15),(27,16),
(28,1),(28,2),(28,3),(28,6),(28,13),(28,15),(28,16),
(29,1),(29,2),(29,3),(29,6),(29,13),(29,15),(29,16),
(30,1),(30,2),(30,3),(30,4),(30,6),(30,7),(30,13),(30,15),(30,16),
-- Single Room 31–35 (budget)
(31,1),(31,2),(31,3),(31,5),(31,6),
(32,1),(32,2),(32,3),(32,5),(32,6),
(33,1),(33,2),(33,3),(33,5),(33,6),(33,14),
(34,1),(34,2),(34,3),(34,4),(34,5),(34,6),(34,13),(34,14),
(35,1),(35,2),(35,3),(35,4),(35,5),(35,6),(35,13),(35,14),
-- Single Room 36–40 (standard)
(36,1),(36,2),(36,3),(36,4),(36,5),(36,6),(36,13),(36,14),(36,16),
(37,1),(37,2),(37,3),(37,4),(37,5),(37,6),(37,13),(37,14),(37,16),(37,20),
(38,1),(38,2),(38,3),(38,4),(38,5),(38,6),(38,7),(38,13),(38,16),(38,20),
(39,1),(39,2),(39,3),(39,4),(39,5),(39,6),(39,7),(39,13),(39,16),(39,20),
(40,1),(40,2),(40,3),(40,4),(40,5),(40,6),(40,7),(40,13),(40,14),(40,16),
-- Single Room 41–45 (premium/luxury)
(41,1),(41,2),(41,3),(41,4),(41,5),(41,6),(41,7),(41,9),(41,10),(41,13),(41,18),
(42,1),(42,2),(42,3),(42,4),(42,5),(42,6),(42,7),(42,8),(42,9),(42,10),(42,13),(42,18),
(43,1),(43,2),(43,3),(43,4),(43,5),(43,6),(43,7),(43,8),(43,9),(43,10),(43,11),(43,13),(43,18),
(44,1),(44,2),(44,3),(44,4),(44,5),(44,6),(44,7),(44,8),(44,9),(44,10),(44,11),(44,13),(44,18),(44,20),
(45,1),(45,2),(45,3),(45,4),(45,5),(45,6),(45,7),(45,8),(45,9),(45,10),(45,11),(45,13),(45,16),(45,18),(45,20),
-- Single Room 46–50 (mixed extra)
(46,1),(46,2),(46,3),(46,5),(46,6),(46,14),
(47,1),(47,2),(47,3),(47,4),(47,5),(47,6),(47,7),(47,13),
(48,1),(48,2),(48,3),(48,4),(48,5),(48,6),(48,13),(48,14),(48,16),
(49,1),(49,2),(49,3),(49,4),(49,5),(49,6),(49,7),(49,13),(49,14),(49,16),
(50,1),(50,2),(50,3),(50,4),(50,5),(50,6),(50,7),(50,8),(50,9),(50,10),(50,11),(50,13),(50,16),(50,18),(50,20),
-- Double Room 51–55 (standard)
(51,1),(51,2),(51,3),(51,5),(51,6),(51,11),(51,14),
(52,1),(52,2),(52,3),(52,4),(52,5),(52,6),(52,11),(52,14),
(53,1),(53,2),(53,3),(53,4),(53,5),(53,6),(53,7),(53,11),(53,13),(53,16),
(54,1),(54,2),(54,3),(54,4),(54,5),(54,6),(54,7),(54,11),(54,13),(54,16),(54,20),
(55,1),(55,2),(55,3),(55,4),(55,5),(55,6),(55,7),(55,9),(55,11),(55,13),(55,16),
-- Double Room 56–60 (superior)
(56,1),(56,2),(56,3),(56,4),(56,5),(56,6),(56,7),(56,9),(56,10),(56,11),(56,13),(56,18),
(57,1),(57,2),(57,3),(57,4),(57,5),(57,6),(57,7),(57,8),(57,9),(57,10),(57,11),(57,13),(57,18),
(58,1),(58,2),(58,3),(58,4),(58,5),(58,6),(58,8),(58,13),(58,18),
(59,1),(59,2),(59,3),(59,4),(59,5),(59,6),(59,7),(59,8),(59,9),(59,10),(59,11),(59,13),(59,18),(59,20),
(60,1),(60,2),(60,3),(60,4),(60,5),(60,6),(60,7),(60,9),(60,13),(60,18),
-- Double Room 61–65 (premium/luxury)
(61,1),(61,2),(61,3),(61,4),(61,5),(61,6),(61,8),(61,11),(61,13),(61,18),(61,20),
(62,1),(62,2),(62,3),(62,4),(62,5),(62,6),(62,8),(62,13),(62,18),
(63,1),(63,2),(63,3),(63,4),(63,5),(63,6),(63,7),(63,9),(63,13),(63,18),
(64,1),(64,2),(64,3),(64,4),(64,5),(64,6),(64,7),(64,13),(64,18),
(65,1),(65,2),(65,3),(65,4),(65,5),(65,6),(65,7),(65,9),(65,13),(65,18),(65,19),
-- Double Room 66–70 (extra)
(66,1),(66,2),(66,3),(66,4),(66,5),(66,6),(66,11),(66,16),
(67,1),(67,2),(67,3),(67,4),(67,5),(67,6),(67,7),(67,11),(67,13),(67,16),(67,18),
(68,1),(68,2),(68,3),(68,4),(68,5),(68,6),(68,7),(68,9),(68,10),(68,11),(68,13),(68,14),(68,16),
(69,1),(69,2),(69,3),(69,4),(69,5),(69,6),(69,7),(69,13),(69,18),
(70,1),(70,2),(70,3),(70,4),(70,5),(70,6),(70,7),(70,8),(70,9),(70,10),(70,11),(70,13),(70,16),(70,18),(70,20),
-- Deluxe Room 71–75
(71,1),(71,2),(71,3),(71,4),(71,5),(71,6),(71,7),(71,9),(71,10),(71,11),(71,13),(71,18),
(72,1),(72,2),(72,3),(72,4),(72,5),(72,6),(72,7),(72,9),(72,10),(72,11),(72,13),(72,18),(72,20),
(73,1),(73,2),(73,3),(73,4),(73,5),(73,6),(73,7),(73,8),(73,9),(73,10),(73,13),(73,18),
(74,1),(74,2),(74,3),(74,4),(74,5),(74,6),(74,7),(74,9),(74,10),(74,11),(74,13),(74,18),(74,20),
(75,1),(75,2),(75,3),(75,4),(75,5),(75,6),(75,7),(75,8),(75,9),(75,10),(75,13),(75,18),(75,19),
-- Deluxe Room 76–80
(76,1),(76,2),(76,3),(76,4),(76,5),(76,6),(76,7),(76,9),(76,10),(76,13),(76,18),(76,19),
(77,1),(77,2),(77,3),(77,4),(77,5),(77,6),(77,7),(77,8),(77,9),(77,10),(77,11),(77,13),(77,16),(77,18),(77,19),
(78,1),(78,2),(78,3),(78,4),(78,5),(78,6),(78,8),(78,9),(78,10),(78,11),(78,13),(78,18),(78,20),
(79,1),(79,2),(79,3),(79,4),(79,5),(79,6),(79,7),(79,8),(79,9),(79,10),(79,11),(79,13),(79,16),(79,18),(79,20),
(80,1),(80,2),(80,3),(80,4),(80,5),(80,6),(80,7),(80,8),(80,9),(80,10),(80,11),(80,13),(80,16),(80,18),(80,19),(80,20),
-- Deluxe Room 81–85
(81,1),(81,2),(81,3),(81,4),(81,5),(81,6),(81,7),(81,8),(81,9),(81,10),(81,11),(81,13),(81,16),(81,18),(81,19),(81,20),
(82,1),(82,2),(82,3),(82,4),(82,5),(82,6),(82,7),(82,8),(82,9),(82,10),(82,11),(82,13),(82,16),(82,18),(82,19),(82,20),
(83,1),(83,2),(83,3),(83,4),(83,5),(83,6),(83,8),(83,9),(83,13),(83,18),
(84,1),(84,2),(84,3),(84,4),(84,5),(84,6),(84,7),(84,13),(84,18),(84,19),
(85,1),(85,2),(85,3),(85,4),(85,5),(85,6),(85,7),(85,8),(85,9),(85,10),(85,11),(85,13),(85,16),(85,18),(85,19),(85,20),
-- Family Room 86–92
(86,1),(86,2),(86,3),(86,4),(86,5),(86,6),(86,9),(86,11),(86,13),
(87,1),(87,2),(87,3),(87,4),(87,5),(87,6),(87,9),(87,11),(87,13),(87,16),
(88,1),(88,2),(88,3),(88,4),(88,5),(88,6),(88,9),(88,11),(88,13),(88,16),(88,19),
(89,1),(89,2),(89,3),(89,4),(89,5),(89,6),(89,7),(89,9),(89,10),(89,11),(89,13),(89,18),(89,19),
(90,1),(90,2),(90,3),(90,4),(90,5),(90,6),(90,7),(90,8),(90,9),(90,10),(90,11),(90,13),(90,18),(90,19),
(91,1),(91,2),(91,3),(91,4),(91,5),(91,6),(91,7),(91,9),(91,10),(91,11),(91,13),(91,18),(91,19),
(92,1),(92,2),(92,3),(92,4),(92,5),(92,6),(92,7),(92,8),(92,9),(92,10),(92,11),(92,13),(92,18),(92,19),
-- Family Room 93–97
(93,1),(93,2),(93,3),(93,4),(93,5),(93,6),(93,7),(93,9),(93,10),(93,11),(93,13),(93,18),(93,19),
(94,1),(94,2),(94,3),(94,4),(94,5),(94,6),(94,7),(94,8),(94,9),(94,10),(94,11),(94,13),(94,18),(94,19),
(95,1),(95,2),(95,3),(95,4),(95,5),(95,6),(95,7),(95,8),(95,9),(95,10),(95,11),(95,13),(95,18),(95,19),
(96,1),(96,2),(96,3),(96,4),(96,5),(96,6),(96,7),(96,9),(96,10),(96,11),(96,13),(96,16),(96,18),
(97,1),(97,2),(97,3),(97,4),(97,5),(97,6),(97,7),(97,8),(97,9),(97,10),(97,11),(97,12),(97,13),(97,16),(97,18),(97,19),(97,20),
-- Banquet Hall 98–105
(98,1),(98,2),(98,11),(98,12),
(99,1),(99,11),(99,12),
(100,1),(100,2),(100,11),(100,12),
(101,1),(101,2),(101,5),(101,11),(101,12),
(102,1),(102,2),(102,5),(102,11),(102,12),
(103,1),(103,2),(103,5),(103,11),(103,12),
(104,1),(104,2),(104,5),(104,11),(104,12),
(105,1),(105,2),(105,5),(105,11),(105,12);

-- Room Amenities for new rooms (IDs 106–180)
INSERT IGNORE INTO room_amenities (room_id, amenity_id) VALUES
-- PG 106–107 (Koregaon Park)
(106,1),(106,16),(106,17),(106,19),
(107,1),(107,2),(107,13),(107,16),(107,17),
-- PG 108–109 (Baner)
(108,1),(108,13),(108,16),(108,17),
(109,1),(109,2),(109,6),(109,13),(109,16),(109,17),
-- PG 110–111 (Viman Nagar)
(110,1),(110,2),(110,16),(110,17),
(111,1),(111,2),(111,6),(111,7),(111,10),(111,13),(111,16),(111,17),
-- PG 112–113 (Hinjewadi)
(112,1),(112,2),(112,13),(112,14),(112,16),(112,17),
(113,1),(113,2),(113,3),(113,6),(113,10),(113,13),(113,16),(113,17),
-- PG 114–115 (Kothrud)
(114,1),(114,16),(114,17),
(115,1),(115,2),(115,6),(115,13),(115,16),(115,17),
-- Hostel 116–117 (Koregaon Park)
(116,1),(116,15),(116,17),(116,19),
(117,1),(117,2),(117,3),(117,6),(117,13),(117,15),(117,16),
-- Hostel 118–119 (Baner)
(118,1),(118,15),(118,17),(118,19),
(119,1),(119,2),(119,6),(119,13),(119,15),(119,16),(119,17),
-- Hostel 120–121 (Viman Nagar)
(120,1),(120,15),(120,16),(120,17),
(121,1),(121,2),(121,3),(121,6),(121,13),(121,15),(121,16),
-- Hostel 122–123 (Hinjewadi)
(122,1),(122,2),(122,15),(122,17),(122,19),
(123,1),(123,2),(123,3),(123,6),(123,7),(123,13),(123,15),(123,16),
-- Hostel 124–125 (Kothrud)
(124,1),(124,15),(124,17),(124,19),
(125,1),(125,2),(125,6),(125,13),(125,15),(125,16),
-- Single Room 126–130
(126,1),(126,2),(126,3),(126,5),(126,6),(126,11),
(127,1),(127,2),(127,3),(127,4),(127,5),(127,6),(127,7),(127,13),(127,11),
(128,1),(128,2),(128,3),(128,5),(128,6),(128,13),(128,14),(128,16),
(129,1),(129,2),(129,3),(129,5),(129,6),(129,13),(129,14),(129,11),
(130,1),(130,2),(130,3),(130,4),(130,5),(130,6),(130,13),(130,14),
-- Double Room 131–135
(131,1),(131,2),(131,3),(131,4),(131,5),(131,6),(131,7),(131,9),(131,11),(131,13),(131,18),
(132,1),(132,2),(132,3),(132,4),(132,5),(132,6),(132,7),(132,9),(132,10),(132,11),(132,13),(132,18),
(133,1),(133,2),(133,3),(133,4),(133,5),(133,6),(133,11),(133,13),(133,16),
(134,1),(134,2),(134,3),(134,4),(134,5),(134,6),(134,7),(134,11),(134,13),(134,14),(134,16),
(135,1),(135,2),(135,3),(135,4),(135,5),(135,6),(135,9),(135,10),(135,11),(135,13),(135,16),
-- Deluxe Room 136–145
(136,1),(136,2),(136,3),(136,4),(136,5),(136,6),(136,7),(136,8),(136,9),(136,10),(136,13),(136,18),
(137,1),(137,2),(137,3),(137,4),(137,5),(137,6),(137,7),(137,8),(137,9),(137,10),(137,11),(137,13),(137,16),(137,18),
(138,1),(138,2),(138,3),(138,4),(138,5),(138,6),(138,7),(138,9),(138,10),(138,11),(138,13),(138,16),(138,18),
(139,1),(139,2),(139,3),(139,4),(139,5),(139,6),(139,7),(139,8),(139,9),(139,10),(139,11),(139,13),(139,16),(139,18),(139,19),
(140,1),(140,2),(140,3),(140,4),(140,5),(140,6),(140,7),(140,9),(140,10),(140,11),(140,13),(140,18),
(141,1),(141,2),(141,3),(141,4),(141,5),(141,6),(141,7),(141,8),(141,9),(141,10),(141,11),(141,13),(141,16),(141,18),(141,19),
(142,1),(142,2),(142,3),(142,4),(142,5),(142,6),(142,7),(142,9),(142,10),(142,11),(142,13),(142,18),
(143,1),(143,2),(143,3),(143,4),(143,5),(143,6),(143,7),(143,8),(143,9),(143,10),(143,11),(143,13),(143,16),(143,18),(143,19),(143,20),
(144,1),(144,2),(144,3),(144,4),(144,5),(144,6),(144,7),(144,9),(144,10),(144,11),(144,13),(144,16),(144,18),
(145,1),(145,2),(145,3),(145,4),(145,5),(145,6),(145,7),(145,8),(145,9),(145,10),(145,11),(145,13),(145,16),(145,18),(145,19),(145,20),
-- Family Room 146–160
(146,1),(146,2),(146,3),(146,4),(146,5),(146,6),(146,9),(146,11),(146,13),(146,18),
(147,1),(147,2),(147,3),(147,4),(147,5),(147,6),(147,7),(147,9),(147,10),(147,11),(147,13),(147,18),(147,19),
(148,1),(148,2),(148,3),(148,4),(148,5),(148,6),(148,7),(148,8),(148,9),(148,10),(148,11),(148,13),(148,18),(148,19),
(149,1),(149,2),(149,3),(149,4),(149,5),(149,6),(149,7),(149,9),(149,10),(149,11),(149,13),(149,16),(149,18),(149,19),
(150,1),(150,2),(150,3),(150,4),(150,5),(150,6),(150,7),(150,8),(150,9),(150,10),(150,11),(150,13),(150,18),(150,19),
(151,1),(151,2),(151,3),(151,4),(151,5),(151,6),(151,7),(151,8),(151,9),(151,10),(151,11),(151,13),(151,18),(151,19),
(152,1),(152,2),(152,3),(152,4),(152,5),(152,6),(152,9),(152,11),(152,13),(152,16),(152,18),
(153,1),(153,2),(153,3),(153,4),(153,5),(153,6),(153,7),(153,9),(153,10),(153,11),(153,13),(153,18),(153,19),
(154,1),(154,2),(154,3),(154,4),(154,5),(154,6),(154,7),(154,9),(154,10),(154,11),(154,13),(154,16),(154,18),(154,19),
(155,1),(155,2),(155,3),(155,4),(155,5),(155,6),(155,7),(155,8),(155,9),(155,10),(155,11),(155,13),(155,18),(155,19),
(156,1),(156,2),(156,3),(156,4),(156,5),(156,6),(156,7),(156,9),(156,10),(156,11),(156,13),(156,18),(156,19),
(157,1),(157,2),(157,3),(157,4),(157,5),(157,6),(157,9),(157,10),(157,11),(157,13),(157,16),(157,18),
(158,1),(158,2),(158,3),(158,4),(158,5),(158,6),(158,7),(158,8),(158,9),(158,10),(158,11),(158,13),(158,18),(158,19),
(159,1),(159,2),(159,3),(159,4),(159,5),(159,6),(159,7),(159,8),(159,9),(159,10),(159,11),(159,12),(159,13),(159,16),(159,18),(159,19),(159,20),
(160,1),(160,2),(160,3),(160,4),(160,5),(160,6),(160,7),(160,8),(160,9),(160,10),(160,11),(160,13),(160,18),(160,19),
-- Banquet Hall 161–180
(161,1),(161,2),(161,11),(161,12),
(162,1),(162,11),(162,12),
(163,1),(163,2),(163,5),(163,11),(163,12),
(164,1),(164,2),(164,5),(164,11),(164,12),
(165,1),(165,2),(165,11),(165,12),
(166,1),(166,11),(166,12),
(167,1),(167,2),(167,5),(167,11),(167,12),
(168,1),(168,2),(168,5),(168,11),(168,12),
(169,1),(169,2),(169,11),(169,12),
(170,1),(170,11),(170,12),
(171,1),(171,2),(171,5),(171,11),(171,12),
(172,1),(172,2),(172,5),(172,11),(172,12),
(173,1),(173,2),(173,11),(173,12),
(174,1),(174,11),(174,12),
(175,1),(175,2),(175,5),(175,11),(175,12),
(176,1),(176,2),(176,5),(176,11),(176,12),
(177,1),(177,2),(177,11),(177,12),
(178,1),(178,11),(178,12),
(179,1),(179,2),(179,5),(179,11),(179,12),
(180,1),(180,2),(180,5),(180,11),(180,12);

-- Meal Plans
INSERT INTO meal_plans (id, code, name, description, price_per_person_per_day) VALUES
(1, 'EP',  'Room Only',        'No meals included. Room and all standard amenities only.',                                    0.00),
(2, 'CP',  'Bed & Breakfast',  'Complimentary full Indian breakfast (poha/idli/paratha + chai) served every morning.',       250.00),
(3, 'MAP', 'Half Board',       'Breakfast and dinner included. Lunch on your own to explore local food.',                    600.00),
(4, 'AP',  'Full Board',       'All three meals — breakfast, lunch, and dinner — included daily.',                           900.00),
(5, 'AI',  'All Inclusive',    'All meals, soft beverages, select juices, lassi, and evening snacks included.',             1500.00),
(6, 'BB',  'Breakfast Buffet', 'Lavish buffet with 40+ items — live dosa counter, fresh fruits, cereals, and chai station.', 350.00),
(7, 'HB',  'Honeymoon Board',  'Candlelit dinner for two + breakfast in bed. Complimentary welcome cake and sparkling juice.', 999.00);

-- Coupons (14 codes)
INSERT INTO coupons (id, code, discount_type, discount_value, min_booking_amount, max_discount_cap, valid_from, valid_until, usage_limit, times_used, is_active) VALUES
(1,  'WELCOME10',  'PERCENT', 10.00,  2000.00,   800.00, '2025-01-01', '2027-12-31', 1000, 0, 1),
(2,  'FLAT500',    'FLAT',   500.00,  4000.00,     NULL,  '2025-01-01', '2027-12-31',  500, 0, 1),
(3,  'DELUXE20',   'PERCENT', 20.00, 12000.00,  4000.00, '2025-01-01', '2027-12-31',  200, 0, 1),
(4,  'HOSTELOFF',  'FLAT',   150.00,   800.00,     NULL,  '2025-01-01', '2027-12-31',  500, 0, 1),
(5,  'FESTIVE15',  'PERCENT', 15.00,  6000.00,  2500.00, '2025-10-01', '2027-01-31',  100, 0, 1),
(6,  'NEWUSER25',  'PERCENT', 25.00,  2000.00,  1500.00, '2025-01-01', '2027-12-31',  500, 0, 1),
(7,  'SUMMER12',   'PERCENT', 12.00,  4000.00,  1200.00, '2026-04-01', '2026-06-30',  250, 0, 1),
(8,  'FLAT1000',   'FLAT',  1000.00, 10000.00,     NULL,  '2025-01-01', '2027-12-31',  150, 0, 1),
(9,  'PG10',       'PERCENT', 10.00,  4000.00,   600.00, '2025-01-01', '2027-12-31',  400, 0, 1),
(10, 'LONGSTAY',   'PERCENT', 18.00, 18000.00,  4500.00, '2025-01-01', '2027-12-31',  100, 0, 1),
(11, 'BLACKFRI30', 'PERCENT', 30.00,  6000.00,  3500.00, '2026-11-28', '2026-11-30',   50, 0, 0),
(12, 'FLASH200',   'FLAT',   200.00,  1500.00,     NULL,  '2025-01-01', '2027-12-31', 1000, 0, 1),
(13, 'FAMILY15',   'PERCENT', 15.00,  8000.00,  2000.00, '2025-01-01', '2027-12-31',  300, 0, 1),
(14, 'MONSOON10',  'PERCENT', 10.00,  3000.00,  1000.00, '2026-06-01', '2026-09-30',  200, 0, 1);

-- =============================================================
-- Room Locations — 5 Pune areas (matches data.sql)
-- =============================================================

-- PG (IDs 1–15): 3 per location
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id IN (1, 2, 3);
UPDATE rooms SET location = 'Baner, Pune'         WHERE id IN (4, 5, 6);
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id IN (7, 8, 9);
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id IN (10, 11, 12);
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id IN (13, 14, 15);

-- Hostel (IDs 16–30): 3 per location
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id IN (16, 17, 18);
UPDATE rooms SET location = 'Baner, Pune'         WHERE id IN (19, 20, 21);
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id IN (22, 23, 24);
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id IN (25, 26, 27);
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id IN (28, 29, 30);

-- Single Room (IDs 31–50): 4 per location
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id IN (31, 32, 33, 34);
UPDATE rooms SET location = 'Baner, Pune'         WHERE id IN (35, 36, 37, 38);
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id IN (39, 40, 41, 42);
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id IN (43, 44, 45, 46);
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id IN (47, 48, 49, 50);

-- Double Room (IDs 51–70): 4 per location
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id IN (51, 52, 53, 54);
UPDATE rooms SET location = 'Baner, Pune'         WHERE id IN (55, 56, 57, 58);
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id IN (59, 60, 61, 62);
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id IN (63, 64, 65, 66);
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id IN (67, 68, 69, 70);

-- Deluxe Room (IDs 71–85): 3 per location
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id IN (71, 72, 73);
UPDATE rooms SET location = 'Baner, Pune'         WHERE id IN (74, 75, 76);
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id IN (77, 78, 79);
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id IN (80, 81, 82);
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id IN (83, 84, 85);

-- Family Room (IDs 86–97): 2–3 per location
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id IN (86, 87, 88);
UPDATE rooms SET location = 'Baner, Pune'         WHERE id IN (89, 90, 91);
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id IN (92, 93);
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id IN (94, 95);
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id IN (96, 97);

-- Banquet Hall (IDs 98–105): 1–2 per location
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id IN (98, 99);
UPDATE rooms SET location = 'Baner, Pune'         WHERE id IN (100, 101);
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id = 102;
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id = 103;
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id IN (104, 105);

-- =============================================================
-- Room Names (PG and Hostel only)
-- =============================================================

-- PG property names (IDs 1–15)
UPDATE rooms SET room_name = 'Urban Nest PG'          WHERE id = 1;
UPDATE rooms SET room_name = 'HomeLy PG'              WHERE id = 2;
UPDATE rooms SET room_name = 'Scholar''s Den PG'      WHERE id = 3;
UPDATE rooms SET room_name = 'Comfort Stay PG'        WHERE id = 4;
UPDATE rooms SET room_name = 'Green Valley PG'        WHERE id = 5;
UPDATE rooms SET room_name = 'Elite Living PG'        WHERE id = 6;
UPDATE rooms SET room_name = 'TechPark Residency PG'  WHERE id = 7;
UPDATE rooms SET room_name = 'Pinnacle PG'            WHERE id = 8;
UPDATE rooms SET room_name = 'The Executive PG'       WHERE id = 9;
UPDATE rooms SET room_name = 'Corporate Suites PG'    WHERE id = 10;
UPDATE rooms SET room_name = 'Upscale Residency PG'   WHERE id = 11;
UPDATE rooms SET room_name = 'Koregaon Premium PG'    WHERE id = 12;
UPDATE rooms SET room_name = 'The Boulevard PG'       WHERE id = 13;
UPDATE rooms SET room_name = 'Studio One PG'          WHERE id = 14;
UPDATE rooms SET room_name = 'Penthouse Living PG'    WHERE id = 15;

-- Hostel property names (IDs 16–30)
UPDATE rooms SET room_name = 'Wanderers Hostel'        WHERE id = 16;
UPDATE rooms SET room_name = 'Backpack Inn'            WHERE id = 17;
UPDATE rooms SET room_name = 'Budget Bunks Hostel'     WHERE id = 18;
UPDATE rooms SET room_name = 'City Explorers Hostel'   WHERE id = 19;
UPDATE rooms SET room_name = 'Chill & Stay Hostel'     WHERE id = 20;
UPDATE rooms SET room_name = 'She Stays Hostel'        WHERE id = 21;
UPDATE rooms SET room_name = 'The Rustic Bunk'         WHERE id = 22;
UPDATE rooms SET room_name = 'Aaramghar Hostel'        WHERE id = 23;
UPDATE rooms SET room_name = 'SafeStay for Women'      WHERE id = 24;
UPDATE rooms SET room_name = 'Comfy Dorm Hostel'       WHERE id = 25;
UPDATE rooms SET room_name = 'Station Hub Hostel'      WHERE id = 26;
UPDATE rooms SET room_name = 'TrioBunk Hostel'         WHERE id = 27;
UPDATE rooms SET room_name = 'DuoPod Hostel'           WHERE id = 28;
UPDATE rooms SET room_name = 'Heritage Retreat Hostel' WHERE id = 29;
UPDATE rooms SET room_name = 'Cloud Nine Hostel'       WHERE id = 30;

-- =============================================================
-- Locations for new rooms (IDs 106–180)
-- =============================================================

-- PG 106–115
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id IN (106, 107);
UPDATE rooms SET location = 'Baner, Pune'         WHERE id IN (108, 109);
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id IN (110, 111);
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id IN (112, 113);
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id IN (114, 115);
-- Hostel 116–125
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id IN (116, 117);
UPDATE rooms SET location = 'Baner, Pune'         WHERE id IN (118, 119);
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id IN (120, 121);
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id IN (122, 123);
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id IN (124, 125);
-- Single Room 126–130
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id = 126;
UPDATE rooms SET location = 'Baner, Pune'         WHERE id = 127;
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id = 128;
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id = 129;
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id = 130;
-- Double Room 131–135
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id = 131;
UPDATE rooms SET location = 'Baner, Pune'         WHERE id = 132;
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id = 133;
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id = 134;
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id = 135;
-- Deluxe Room 136–145
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id IN (136, 137);
UPDATE rooms SET location = 'Baner, Pune'         WHERE id IN (138, 139);
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id IN (140, 141);
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id IN (142, 143);
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id IN (144, 145);
-- Family Room 146–160
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id IN (146, 147, 148);
UPDATE rooms SET location = 'Baner, Pune'         WHERE id IN (149, 150, 151);
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id IN (152, 153, 160);
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id IN (154, 155, 156);
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id IN (157, 158, 159);
-- Banquet Hall 161–180
UPDATE rooms SET location = 'Koregaon Park, Pune' WHERE id IN (161, 162, 163, 164);
UPDATE rooms SET location = 'Baner, Pune'         WHERE id IN (165, 166, 167, 168);
UPDATE rooms SET location = 'Viman Nagar, Pune'   WHERE id IN (169, 170, 171, 172);
UPDATE rooms SET location = 'Hinjewadi, Pune'     WHERE id IN (173, 174, 175, 176);
UPDATE rooms SET location = 'Kothrud, Pune'       WHERE id IN (177, 178, 179, 180);

-- Room names for new PG (IDs 106–115)
UPDATE rooms SET room_name = 'Park View PG'        WHERE id = 106;
UPDATE rooms SET room_name = 'Serene Stay PG'      WHERE id = 107;
UPDATE rooms SET room_name = 'Baner Heights PG'    WHERE id = 108;
UPDATE rooms SET room_name = 'TechNest PG'         WHERE id = 109;
UPDATE rooms SET room_name = 'Airport Link PG'     WHERE id = 110;
UPDATE rooms SET room_name = 'Phoenix Stay PG'     WHERE id = 111;
UPDATE rooms SET room_name = 'Phase One PG'        WHERE id = 112;
UPDATE rooms SET room_name = 'Hinjewadi Hub PG'    WHERE id = 113;
UPDATE rooms SET room_name = 'Scholar''s Grove PG' WHERE id = 114;
UPDATE rooms SET room_name = 'Karve Road PG'       WHERE id = 115;
-- Room names for new Hostel (IDs 116–125)
UPDATE rooms SET room_name = 'The Social Hostel'   WHERE id = 116;
UPDATE rooms SET room_name = 'KP Nest Hostel'      WHERE id = 117;
UPDATE rooms SET room_name = 'Baner Base Camp'     WHERE id = 118;
UPDATE rooms SET room_name = 'SheHub Baner'        WHERE id = 119;
UPDATE rooms SET room_name = 'Runway Hostel'       WHERE id = 120;
UPDATE rooms SET room_name = 'Viman Pods Hostel'   WHERE id = 121;
UPDATE rooms SET room_name = 'TechStay Hostel'     WHERE id = 122;
UPDATE rooms SET room_name = 'Hinjewadi Bunks'     WHERE id = 123;
UPDATE rooms SET room_name = 'Campus Gate Hostel'  WHERE id = 124;
UPDATE rooms SET room_name = 'Kothrud Kozi Hostel' WHERE id = 125;

-- =============================================================
-- Historical Bookings (past dates)
-- Users: 1=Deepak, 3=Priya, 4=Rahul, 5=Sneha
-- =============================================================
DELETE FROM payments WHERE booking_id IN (SELECT id FROM bookings WHERE booking_confirmation_code LIKE 'HIST-%');
DELETE FROM bookings WHERE booking_confirmation_code LIKE 'HIST-%';

INSERT IGNORE INTO bookings (id, check_in_date, check_out_date, num_of_adults, num_of_children, total_num_of_guest, booking_confirmation_code, user_id, room_id) VALUES
( 101, '2024-11-05', '2024-11-08', 2, 0, 2, 'HIST-DK001', 1,  31),
( 102, '2024-12-20', '2024-12-23', 1, 0, 1, 'HIST-DK002', 1,   4),
( 103, '2025-01-14', '2025-01-17', 2, 1, 3, 'HIST-DK003', 1,  61),
( 104, '2025-02-10', '2025-02-13', 2, 0, 2, 'HIST-DK004', 1,  76),
( 105, '2025-03-01', '2025-03-05', 2, 2, 4, 'HIST-DK005', 1,  91),
( 106, '2025-03-18', '2025-03-20', 1, 0, 1, 'HIST-DK006', 1,  16),
( 107, '2025-04-05', '2025-04-08', 2, 0, 2, 'HIST-DK007', 1, 136),
( 108, '2025-04-22', '2025-04-25', 1, 0, 1, 'HIST-DK008', 1, 112),
( 109, '2025-05-10', '2025-05-14', 2, 1, 3, 'HIST-DK009', 1, 131),
( 110, '2025-06-01', '2025-06-04', 2, 0, 2, 'HIST-DK010', 1, 126),
( 111, '2024-10-12', '2024-10-15', 1, 0, 1, 'HIST-PR001', 3,   5),
( 112, '2024-11-20', '2024-11-23', 2, 0, 2, 'HIST-PR002', 3,  32),
( 113, '2024-12-25', '2024-12-29', 1, 0, 1, 'HIST-PR003', 3,  17),
( 114, '2025-01-07', '2025-01-10', 2, 0, 2, 'HIST-PR004', 3,  77),
( 115, '2025-02-14', '2025-02-17', 2, 0, 2, 'HIST-PR005', 3, 127),
( 116, '2025-03-08', '2025-03-12', 2, 1, 3, 'HIST-PR006', 3,  93),
( 117, '2025-04-01', '2025-04-03', 1, 0, 1, 'HIST-PR007', 3, 119),
( 118, '2025-04-18', '2025-04-22', 2, 0, 2, 'HIST-PR008', 3, 138),
( 119, '2025-05-05', '2025-05-08', 1, 0, 1, 'HIST-PR009', 3,  46),
( 121, '2024-10-05', '2024-10-08', 2, 0, 2, 'HIST-RA001', 4,  33),
( 122, '2024-11-15', '2024-11-18', 1, 0, 1, 'HIST-RA002', 4,   7),
( 123, '2024-12-10', '2024-12-14', 2, 2, 4, 'HIST-RA003', 4,  94),
( 124, '2025-01-20', '2025-01-23', 2, 0, 2, 'HIST-RA004', 4,  78),
( 125, '2025-02-08', '2025-02-12', 2, 1, 3, 'HIST-RA005', 4,  64),
( 126, '2025-03-14', '2025-03-17', 1, 0, 1, 'HIST-RA006', 4, 120),
( 127, '2025-04-10', '2025-04-14', 2, 0, 2, 'HIST-RA007', 4, 140),
( 128, '2025-04-25', '2025-04-28', 2, 0, 2, 'HIST-RA008', 4, 133),
( 129, '2025-05-01', '2025-05-04', 1, 0, 1, 'HIST-RA009', 4,  49),
( 131, '2024-09-20', '2024-09-23', 1, 0, 1, 'HIST-SN001', 5,   9),
( 132, '2024-10-28', '2024-11-01', 2, 0, 2, 'HIST-SN002', 5,  34),
( 133, '2024-12-03', '2024-12-07', 2, 1, 3, 'HIST-SN003', 5,  95),
( 134, '2025-01-10', '2025-01-13', 2, 0, 2, 'HIST-SN004', 5,  79),
( 135, '2025-02-20', '2025-02-24', 1, 0, 1, 'HIST-SN005', 5,  18),
( 136, '2025-03-06', '2025-03-09', 2, 0, 2, 'HIST-SN006', 5,  65),
( 137, '2025-04-03', '2025-04-07', 2, 1, 3, 'HIST-SN007', 5, 157),
( 138, '2025-04-15', '2025-04-18', 1, 0, 1, 'HIST-SN008', 5, 114),
( 139, '2025-04-28', '2025-05-02', 2, 0, 2, 'HIST-SN009', 5, 144);

-- =============================================================
-- Historical Payments (amount = room_price × nights)
-- =============================================================
INSERT IGNORE INTO payments (booking_id, amount, currency, payment_gateway, gateway_txn_id, status, paid_at) VALUES
(101,  3597.00, 'INR', 'MOCK', 'TXN-HIST-101', 'SUCCESS', '2024-11-05 10:15:00'),
(102,   600.00, 'INR', 'MOCK', 'TXN-HIST-102', 'SUCCESS', '2024-12-20 09:30:00'),
(103,  5997.00, 'INR', 'MOCK', 'TXN-HIST-103', 'SUCCESS', '2025-01-14 11:00:00'),
(104,  8997.00, 'INR', 'MOCK', 'TXN-HIST-104', 'SUCCESS', '2025-02-10 08:45:00'),
(105, 19996.00, 'INR', 'MOCK', 'TXN-HIST-105', 'SUCCESS', '2025-03-01 12:00:00'),
(106,   898.00, 'INR', 'MOCK', 'TXN-HIST-106', 'SUCCESS', '2025-03-18 14:20:00'),
(107, 11997.00, 'INR', 'MOCK', 'TXN-HIST-107', 'SUCCESS', '2025-04-05 10:00:00'),
(108,   900.00, 'INR', 'MOCK', 'TXN-HIST-108', 'SUCCESS', '2025-04-22 09:00:00'),
(109, 11996.00, 'INR', 'MOCK', 'TXN-HIST-109', 'SUCCESS', '2025-05-10 10:30:00'),
(110,  3597.00, 'INR', 'MOCK', 'TXN-HIST-110', 'SUCCESS', '2025-06-01 09:00:00'),
(111,   750.00, 'INR', 'MOCK', 'TXN-HIST-111', 'SUCCESS', '2024-10-12 11:00:00'),
(112,  3597.00, 'INR', 'MOCK', 'TXN-HIST-112', 'SUCCESS', '2024-11-20 10:00:00'),
(113,  2596.00, 'INR', 'MOCK', 'TXN-HIST-113', 'SUCCESS', '2024-12-25 12:00:00'),
(114,  8997.00, 'INR', 'MOCK', 'TXN-HIST-114', 'SUCCESS', '2025-01-07 09:30:00'),
(115,  3597.00, 'INR', 'MOCK', 'TXN-HIST-115', 'SUCCESS', '2025-02-14 10:00:00'),
(116, 19996.00, 'INR', 'MOCK', 'TXN-HIST-116', 'SUCCESS', '2025-03-08 08:00:00'),
(117,   798.00, 'INR', 'MOCK', 'TXN-HIST-117', 'SUCCESS', '2025-04-01 11:30:00'),
(118, 11996.00, 'INR', 'MOCK', 'TXN-HIST-118', 'SUCCESS', '2025-04-18 10:00:00'),
(119,  3597.00, 'INR', 'MOCK', 'TXN-HIST-119', 'SUCCESS', '2025-05-05 09:00:00'),
(121,  3597.00, 'INR', 'MOCK', 'TXN-HIST-121', 'SUCCESS', '2024-10-05 10:30:00'),
(122,   900.00, 'INR', 'MOCK', 'TXN-HIST-122', 'SUCCESS', '2024-11-15 09:00:00'),
(123, 19996.00, 'INR', 'MOCK', 'TXN-HIST-123', 'SUCCESS', '2024-12-10 11:00:00'),
(124,  8997.00, 'INR', 'MOCK', 'TXN-HIST-124', 'SUCCESS', '2025-01-20 08:30:00'),
(125,  7996.00, 'INR', 'MOCK', 'TXN-HIST-125', 'SUCCESS', '2025-02-08 10:00:00'),
(126,   898.00, 'INR', 'MOCK', 'TXN-HIST-126', 'SUCCESS', '2025-03-14 13:00:00'),
(127, 15996.00, 'INR', 'MOCK', 'TXN-HIST-127', 'SUCCESS', '2025-04-10 09:30:00'),
(128,  5997.00, 'INR', 'MOCK', 'TXN-HIST-128', 'SUCCESS', '2025-04-25 10:00:00'),
(129,  3597.00, 'INR', 'MOCK', 'TXN-HIST-129', 'SUCCESS', '2025-05-01 08:45:00'),
(131,  1050.00, 'INR', 'MOCK', 'TXN-HIST-131', 'SUCCESS', '2024-09-20 10:00:00'),
(132,  4796.00, 'INR', 'MOCK', 'TXN-HIST-132', 'SUCCESS', '2024-10-28 09:00:00'),
(133, 19996.00, 'INR', 'MOCK', 'TXN-HIST-133', 'SUCCESS', '2024-12-03 11:00:00'),
(134,  8997.00, 'INR', 'MOCK', 'TXN-HIST-134', 'SUCCESS', '2025-01-10 09:30:00'),
(135,  1596.00, 'INR', 'MOCK', 'TXN-HIST-135', 'SUCCESS', '2025-02-20 10:30:00'),
(136,  5997.00, 'INR', 'MOCK', 'TXN-HIST-136', 'SUCCESS', '2025-03-06 09:00:00'),
(137, 27996.00, 'INR', 'MOCK', 'TXN-HIST-137', 'SUCCESS', '2025-04-03 10:00:00'),
(138,   699.99, 'INR', 'MOCK', 'TXN-HIST-138', 'SUCCESS', '2025-04-15 09:30:00'),
(139, 11996.00, 'INR', 'MOCK', 'TXN-HIST-139', 'SUCCESS', '2025-04-28 10:00:00');

-- =============================================================
-- Locations table seed data (5 Pune areas)
-- =============================================================
INSERT INTO locations (id, name, is_active) VALUES
(1, 'Koregaon Park, Pune', TRUE),
(2, 'Baner, Pune',         TRUE),
(3, 'Viman Nagar, Pune',   TRUE),
(4, 'Hinjewadi, Pune',     TRUE),
(5, 'Kothrud, Pune',       TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), is_active = VALUES(is_active);

-- =============================================================
-- Done! 14 tables created, 180 rooms across 5 Pune locations,
-- 5 users, 7 meal plans, 14 coupons, 20 amenities,
-- 37 historical bookings with payments.
-- =============================================================

