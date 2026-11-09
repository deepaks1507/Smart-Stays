-- =================================================
-- Phegon Hotel - Full Database Setup Script
-- Run this ONCE on a fresh system before starting
-- the application for the first time.
-- Spring Boot (data.sql) handles seed data.
-- =================================================
-- Total rooms : 180 across 7 types × 5 Pune locations
-- Users       : 1 ADMIN + 4 USER (password: 1234567890)
-- =================================================

CREATE DATABASE IF NOT EXISTS phegon_hotel_db;
USE phegon_hotel_db;

-- ===================================================
-- TABLE: users
-- ===================================================
CREATE TABLE IF NOT EXISTS users (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    email        VARCHAR(255) NOT NULL UNIQUE,
    name         VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    password     VARCHAR(255) NOT NULL,
    role         VARCHAR(50)  NOT NULL DEFAULT 'USER'
);

-- ===================================================
-- TABLE: rooms
-- ===================================================
CREATE TABLE IF NOT EXISTS rooms (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_type        VARCHAR(255),
    room_name        VARCHAR(255),
    room_price       DECIMAL(19, 2),
    room_photo_url   VARCHAR(512),
    room_description TEXT,
    total_inventory  INT          NOT NULL DEFAULT 0,
    location         VARCHAR(255)
);

-- ===================================================
-- TABLE: bookings
-- ===================================================
CREATE TABLE IF NOT EXISTS bookings (
    id                        BIGINT AUTO_INCREMENT PRIMARY KEY,
    check_in_date             DATE         NOT NULL,
    check_out_date            DATE,
    num_of_adults             INT          NOT NULL DEFAULT 1,
    num_of_children           INT          NOT NULL DEFAULT 0,
    total_num_of_guest        INT          NOT NULL DEFAULT 0,
    booking_confirmation_code VARCHAR(255),
    user_id                   BIGINT,
    room_id                   BIGINT,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE SET NULL,
    CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES rooms(id)  ON DELETE SET NULL
);

-- ===================================================
-- TABLE: payments
-- ===================================================
CREATE TABLE IF NOT EXISTS payments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id      BIGINT        NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    currency        VARCHAR(10)   NOT NULL DEFAULT 'INR',
    payment_gateway VARCHAR(50),             -- RAZORPAY | STRIPE | MOCK
    gateway_txn_id  VARCHAR(255),
    status          ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    paid_at         DATETIME,
    refund_amount   DECIMAL(12,2),
    refunded_at     DATETIME,
    CONSTRAINT fk_pay_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ===================================================
-- TABLE: reviews
-- ===================================================
CREATE TABLE IF NOT EXISTS reviews (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    rating      INT  NOT NULL,
    comment     TEXT NOT NULL,
    admin_reply TEXT,
    created_at  DATETIME(6),
    user_id     BIGINT NOT NULL,
    room_id     BIGINT NOT NULL,
    booking_id  BIGINT NOT NULL UNIQUE,
    CONSTRAINT fk_review_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_review_room    FOREIGN KEY (room_id)    REFERENCES rooms(id)    ON DELETE CASCADE,
    CONSTRAINT fk_review_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ===================================================
-- TABLE: amenities  (master list)
-- ===================================================
CREATE TABLE IF NOT EXISTS amenities (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100) NOT NULL UNIQUE,
    icon_key VARCHAR(100),
    category VARCHAR(50)  -- ROOM | PROPERTY | BATHROOM | TECH | FOOD
);

-- ===================================================
-- TABLE: room_amenities  (junction)
-- ===================================================
CREATE TABLE IF NOT EXISTS room_amenities (
    room_id    BIGINT NOT NULL,
    amenity_id BIGINT NOT NULL,
    PRIMARY KEY (room_id, amenity_id),
    CONSTRAINT fk_ra_room    FOREIGN KEY (room_id)    REFERENCES rooms(id)     ON DELETE CASCADE,
    CONSTRAINT fk_ra_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- ===================================================
-- TABLE: meal_plans
-- ===================================================
CREATE TABLE IF NOT EXISTS meal_plans (
    id                       BIGINT AUTO_INCREMENT PRIMARY KEY,
    code                     VARCHAR(10)   NOT NULL UNIQUE, -- EP | CP | MAP | AP | AI | BB | HB
    name                     VARCHAR(100)  NOT NULL,
    description              TEXT,
    price_per_person_per_day DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

-- ===================================================
-- TABLE: coupons
-- ===================================================
CREATE TABLE IF NOT EXISTS coupons (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    code               VARCHAR(50)   NOT NULL UNIQUE,
    discount_type      ENUM('PERCENT','FLAT') NOT NULL,
    discount_value     DECIMAL(10,2) NOT NULL,
    min_booking_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    max_discount_cap   DECIMAL(10,2),            -- NULL = no cap
    valid_from         DATE          NOT NULL,
    valid_until        DATE          NOT NULL,
    usage_limit        INT           NOT NULL DEFAULT 1,
    times_used         INT           NOT NULL DEFAULT 0,
    is_active          BOOLEAN       NOT NULL DEFAULT TRUE
);

-- ===================================================
-- TABLE: cancellation_policies
-- ===================================================
CREATE TABLE IF NOT EXISTS cancellation_policies (
    id                             BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                           VARCHAR(100) NOT NULL,
    is_free_cancel                 BOOLEAN      NOT NULL DEFAULT FALSE,
    free_cancellation_hours_before INT,         -- e.g. 24 = free if cancelled 24h before check-in
    partial_refund_percentage      INT,         -- e.g. 50 = 50% refund
    partial_refund_hours_threshold INT,         -- hours before check-in for partial refund
    policy_description             TEXT
);

-- ===================================================
-- TABLE: pricing_rules  (dynamic / seasonal pricing)
-- ===================================================
CREATE TABLE IF NOT EXISTS pricing_rules (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id          BIGINT        NOT NULL,
    label            VARCHAR(100),               -- WEEKEND | PEAK | HOLIDAY | FESTIVE
    start_date       DATE,
    end_date         DATE,
    day_of_week      INT,                        -- 1=Mon .. 7=Sun, NULL = all days
    price_override   DECIMAL(10,2),              -- fixed price for this window
    price_multiplier DECIMAL(5,2),               -- e.g. 1.25 = 25% surge
    CONSTRAINT fk_pr_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- ===================================================
-- TABLE: wishlist
-- ===================================================
CREATE TABLE IF NOT EXISTS wishlist (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id  BIGINT   NOT NULL,
    room_id  BIGINT   NOT NULL,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_wishlist (user_id, room_id),
    CONSTRAINT fk_wl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_wl_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- ===================================================
-- TABLE: locations
-- ===================================================
CREATE TABLE IF NOT EXISTS locations (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN      NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS notifications (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT       NOT NULL,
    type    VARCHAR(50),    -- BOOKING_CONFIRM | REMINDER | OFFER | CANCELLATION
    channel VARCHAR(20),    -- EMAIL | SMS | IN_APP
    title   VARCHAR(255),
    message TEXT,
    is_read BOOLEAN      NOT NULL DEFAULT FALSE,
    sent_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
