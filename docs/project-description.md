# SmartStays — Project Description for Report Generation

Use this document as a detailed prompt to generate a professional/academic project report for the SmartStays Hotel Booking and Management System.

---

## PROMPT FOR REPORT GENERATION

Generate a detailed and well-structured project report for the following full-stack web application. Use all the information provided below to cover every section thoroughly.

---

## PROJECT OVERVIEW

**Project Title:** SmartStays — Hotel Booking and Management System
**Type:** Full-Stack Web Application
**Architecture:** Client-Server (Monolithic Backend + Single Page Application Frontend)
**Backend:** Java 21, Spring Boot 3.3.0
**Frontend:** React 18.3.0 (Create React App)
**Database:** MySQL 8
**Authentication:** Stateless JWT (JSON Web Token) with HMAC-SHA256 signing
**Image Storage:** Local filesystem (`uploads/room-images/`), served via Spring Boot resource handler
**Development Ports:** Backend — 4040, Frontend — 3000

**Purpose:** SmartStays is a full-featured online hotel booking platform that allows guests to browse, search, and book hotel rooms. It includes a complete admin panel for managing rooms, bookings, coupons, and meal plans. The system supports user authentication, dynamic pricing, coupon discounts, wishlists, reviews, and real-time notifications.

---

## TECHNOLOGY STACK

### Backend Dependencies (pom.xml)

| Dependency | Version | Purpose |
|---|---|---|
| spring-boot-starter-data-jpa | 3.3.0 | ORM and database access via Hibernate |
| spring-boot-starter-security | 3.3.0 | Authentication and authorization |
| spring-boot-starter-validation | 3.3.0 | Bean validation on entity fields |
| spring-boot-starter-web | 3.3.0 | REST API framework (embedded Tomcat) |
| spring-boot-devtools | 3.3.0 | Hot-reload during development |
| mysql-connector-j | runtime | MySQL JDBC driver |
| lombok | compile | Boilerplate code reduction (getters, setters, builders) |
| jjwt-api / jjwt-impl / jjwt-jackson | 0.12.5 | JWT token generation and validation |
| spring-boot-starter-test | 3.3.0 | Unit and integration testing |
| spring-security-test | 3.3.0 | Security layer testing |

### Frontend Dependencies (package.json)

| Package | Version | Purpose |
|---|---|---|
| react | 18.3.0 | UI component library |
| react-dom | 18.3.0 | DOM rendering |
| react-router-dom | 6.23.0 | Client-side routing with nested routes |
| axios | 1.6.8 | HTTP client for API calls |
| react-datepicker | 6.9.0 | Date picker component for booking dates |
| react-scripts | 5.0.1 | Build tooling (CRA) |

---

## BACKEND ARCHITECTURE

### Layer Structure
The backend follows a standard 4-layer Spring Boot architecture:
1. **Controller Layer** — Handles HTTP requests, maps routes, validates input, delegates to services
2. **Service Layer** — Encapsulates all business logic, transaction management
3. **Repository Layer** — Data access via Spring Data JPA (extending JpaRepository)
4. **Entity Layer** — JPA-mapped domain objects representing database tables

### Application Configuration (application.properties)
- Server port: 4040
- Database URL: `jdbc:mysql://localhost:3306/phegon_hotel_db`
- DDL auto: `update` (Hibernate auto-generates/updates schema)
- SQL init mode: `always` (runs data.sql on startup for seed data)
- Upload directory: `uploads/room-images`
- Base URL: `http://localhost:4040`

---

## DOMAIN MODEL (ENTITIES)

### 1. User
Implements Spring Security's `UserDetails` interface. The `email` field serves as the username. Passwords are stored as BCrypt hashes. The `role` field stores either `USER` or `ADMIN` and is returned as a `SimpleGrantedAuthority` for Spring Security.

**Fields:** id, name, email (unique), phoneNumber, password, role
**Relationships:** One-to-Many with Booking, Wishlist, Notification

### 2. Room
Represents a room type (not individual physical rooms). `totalInventory` tracks how many physical rooms of this type exist.

**Fields:** id, roomType, roomPrice (BigDecimal), roomPhotoUrl, roomDescription, totalInventory (int)
**Relationships:** One-to-Many with Booking and PricingRule; Many-to-Many with Amenity (join table: room_amenities)

### 3. Booking
Represents a reservation. `totalNumOfGuest` is auto-calculated from numOfAdults + numOfChildren. `bookingConfirmationCode` is a 10-character alphanumeric code generated using `SecureRandom`.

**Fields:** id, checkInDate (LocalDate), checkOutDate (LocalDate, must be present or future), numOfAdults (min 1), numOfChildren (min 0), totalNumOfGuest, bookingConfirmationCode
**Relationships:** Many-to-One with User (EAGER) and Room (LAZY); One-to-One with Review; One-to-Many with Payment

### 4. Payment
Tracks payment for each booking. Uses an enum for status and gateway.

**Fields:** id, amount (BigDecimal), currency (default INR), paymentGateway (RAZORPAY/STRIPE/MOCK), gatewayTxnId, status (PENDING/SUCCESS/FAILED/REFUNDED), paidAt, refundAmount, refundedAt
**Relationships:** Many-to-One with Booking

### 5. Review
One review per booking (enforced by unique constraint on booking_id). Admin can reply to reviews.

**Fields:** id, rating (int, 1-5), comment (TEXT), adminReply (TEXT), createdAt (auto-set)
**Relationships:** Many-to-One with User and Room; One-to-One with Booking

### 6. Amenity
Represents room features/facilities. Assigned to multiple rooms via many-to-many.

**Fields:** id, name (unique), iconKey, category (ROOM/PROPERTY/BATHROOM/TECH/FOOD)
**Relationships:** Many-to-Many with Room

### 7. MealPlan
Represents meal packages offered with rooms.

**Fields:** id, code (unique, max 10 chars — EP/CP/MAP/AP/AI), name, description (TEXT), pricePerPersonPerDay (BigDecimal)

### 8. Coupon
Discount coupons for bookings. Supports percentage and flat discount types with caps, date validity, and usage limits.

**Fields:** id, code (unique), discountType (PERCENT/FLAT), discountValue, minBookingAmount, maxDiscountCap (nullable), validFrom, validUntil, usageLimit, timesUsed, isActive (boolean)

### 9. Wishlist
Saves a user's favourite rooms. Composite unique constraint on (user_id, room_id) prevents duplicates.

**Fields:** id, savedAt (auto-set)
**Relationships:** Many-to-One with User and Room

### 10. Notification
In-app notification system for booking confirmations, reminders, offers, and cancellations.

**Fields:** id, type (BOOKING_CONFIRM/REMINDER/OFFER/CANCELLATION), channel (EMAIL/SMS/IN_APP), title, message (TEXT), isRead (default false), sentAt (auto-set)
**Relationships:** Many-to-One with User

### 11. PricingRule
Dynamic pricing rules applied to rooms. Supports date-range rules and day-of-week rules. `priceOverride` takes precedence over `priceMultiplier`.

**Fields:** id, label (WEEKEND/PEAK/FESTIVE/HOLIDAY), startDate, endDate, dayOfWeek (1=Mon to 7=Sun, null=all), priceOverride (BigDecimal), priceMultiplier (BigDecimal, e.g. 1.25 = 25% surge)
**Relationships:** Many-to-One with Room

### 12. CancellationPolicy
Defines refund rules for cancellations based on time before check-in.

**Fields:** id, name, isFreeCancel, freeCancellationHoursBefore, partialRefundPercentage, partialRefundHoursThreshold, policyDescription (TEXT)

---

## REPOSITORY LAYER

Custom JPQL query methods used across repositories:

- **RoomRepository:** `findAvailableRoomsByDatesAndTypes` — uses JPQL NOT IN subquery to find rooms with no overlapping bookings; `countAvailableRoomsByType` — counts remaining inventory; `findDistinctRoomTypes` — used for filter dropdowns; `findAllWithAmenities` — LEFT JOIN FETCH to avoid N+1 queries
- **BookingRepository:** `findByBookingConfirmationCode`; `countOverlappingBookings` — JPQL date overlap logic: `checkIn < existingCheckOut AND checkOut > existingCheckIn`
- **ReviewRepository:** `existsByBookingId` — enforces one-review-per-booking; `findByRoomId`, `findByUserId`
- **WishlistRepository:** `existsByUserIdAndRoomId` — used for toggle logic; `findByUserId`
- **CouponRepository:** `findByCodeAndIsActiveTrue` — active-only lookup
- **NotificationRepository:** `countByUserIdAndIsReadFalse` — unread badge count; `findByUserIdOrderBySentAtDesc`

---

## SERVICE LAYER — KEY BUSINESS LOGIC

### BookingService
- Validates check-out is strictly after check-in
- Checks room availability: `totalInventory - countOverlappingBookings(roomId, checkIn, checkOut)` must be > 0
- Standard interval overlap check: `newCheckIn.isBefore(existingCheckOut) && newCheckOut.isAfter(existingCheckIn)`
- Generates 10-character alphanumeric confirmation code using `SecureRandom` (cryptographically secure)
- Ownership check on cancellation: non-admin users can only cancel their own bookings (uses `SecurityContextHolder`)
- Creates a Notification record on successful booking

### RoomService
- CRUD for rooms with image upload (delegates to AwsS3Service for local file saving)
- Returns availability summary grouped by room type (available count per type)
- Eager-fetches amenities to prevent N+1 database query problem

### ReviewService
- Validates the reviewing user owns the booking
- Ensures check-out date is in the past (stay must be completed before reviewing)
- Enforces exactly one review per booking

### CouponService
1. Find coupon by code (must be active = true)
2. Validate date range: `validFrom <= today <= validUntil`
3. Validate usage: `timesUsed < usageLimit`
4. Validate minimum booking amount
5. Calculate discount:
   - PERCENT: `(discountValue / 100) * amount`, capped at `maxDiscountCap`
   - FLAT: `discountValue` directly subtracted

### PricingRuleService (Dynamic Pricing Algorithm)
- Calculates effective price for a multi-night booking day by day
- For each night in range:
  1. Check date-range rules first (startDate ≤ night ≤ endDate)
  2. Check day-of-week rules (dayOfWeek matches)
  3. Apply `priceOverride` if set (absolute price)
  4. Apply `priceMultiplier` if set (multiplied against base room price)
  5. Fall back to base room price if no rules match
- Final price = sum of all nightly prices

### WishlistService
- Toggle pattern: if entry exists → delete; if not → create
- Composite unique constraint prevents duplicate wishlist entries at DB level

### NotificationService
- Creates notifications for booking events
- Bulk mark-all-as-read for a user
- Unread count query for notification badge in navbar

---

## REST API ENDPOINTS

### AuthController (`/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login, returns JWT token + role |

### RoomController (`/rooms`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/rooms/add` | ADMIN | Add room (multipart: photo + fields) |
| GET | `/rooms/all` | Public | List all rooms |
| GET | `/rooms/types` | Public | Distinct room types (for filter dropdown) |
| GET | `/rooms/room-by-id/{roomId}` | Public | Room details with amenities |
| GET | `/rooms/all-available-rooms` | Public | All rooms with live availability |
| GET | `/rooms/availability-summary` | Public | Available count grouped by type |
| GET | `/rooms/available-rooms-by-date-and-type` | Public | Filter by checkInDate, checkOutDate, roomType |
| PUT | `/rooms/update/{roomId}` | ADMIN | Update room details |
| DELETE | `/rooms/delete/{roomId}` | ADMIN | Delete room |

### BookingController (`/bookings`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/bookings/book-room/{roomId}/{userId}` | USER/ADMIN | Create booking |
| GET | `/bookings/all` | ADMIN | All bookings |
| GET | `/bookings/get-by-confirmation-code/{code}` | Public | Find booking by code |
| DELETE | `/bookings/cancel/{bookingId}` | USER/ADMIN | Cancel booking (ownership enforced) |

### UserController (`/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/all` | ADMIN | All users |
| GET | `/users/get-by-id/{userId}` | Authenticated | User by ID |
| DELETE | `/users/delete/{userId}` | ADMIN/USER | Delete account (ownership enforced for USER) |
| GET | `/users/get-logged-in-profile-info` | Authenticated | Current user profile |
| GET | `/users/get-user-bookings/{userId}` | Authenticated | User's bookings |

### ReviewController (`/reviews`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reviews/add/{bookingId}?userId=` | USER/ADMIN | Submit review |
| GET | `/reviews/room/{roomId}` | Public | Reviews for a room |
| GET | `/reviews/user/{userId}` | USER/ADMIN | User's reviews |
| PUT | `/reviews/admin-reply/{reviewId}?reply=` | ADMIN | Admin reply to review |

### CouponController (`/coupons`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/coupons/validate?code=&amount=` | Public | Validate coupon and calculate discount |
| GET | `/coupons/all` | ADMIN | All coupons |
| POST | `/coupons/create` | ADMIN | Create coupon |
| DELETE | `/coupons/delete/{couponId}` | ADMIN | Delete coupon |
| PUT | `/coupons/toggle/{couponId}` | ADMIN | Toggle active/inactive |

### WishlistController (`/wishlist`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/wishlist/toggle?userId=&roomId=` | USER/ADMIN | Add or remove from wishlist |
| GET | `/wishlist/user/{userId}` | USER/ADMIN | Get user's wishlist |

### NotificationController (`/notifications`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications/user/{userId}` | ADMIN/USER | Get notifications |
| PUT | `/notifications/mark-read/{userId}` | ADMIN/USER | Mark all as read |
| GET | `/notifications/unread-count/{userId}` | ADMIN/USER | Unread count for badge |

### MealPlanController (`/meal-plans`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/meal-plans/all` | Public | All meal plans |
| GET | `/meal-plans/{id}` | Public | Get by ID |
| POST | `/meal-plans/create` | ADMIN | Create meal plan |
| DELETE | `/meal-plans/delete/{id}` | ADMIN | Delete meal plan |

### AmenityController (`/amenities`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/amenities/all` | Public | All amenities |
| GET | `/amenities/by-category?category=` | Public | Filter by category |
| POST | `/amenities/create` | ADMIN | Create amenity |
| DELETE | `/amenities/delete/{id}` | ADMIN | Delete amenity |
| POST | `/amenities/assign?roomId=&amenityId=` | ADMIN | Assign amenity to room |
| DELETE | `/amenities/remove?roomId=&amenityId=` | ADMIN | Remove amenity from room |

### PricingRuleController (`/pricing-rules`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/pricing-rules/room/{roomId}` | Public | Rules for a room |
| POST | `/pricing-rules/create/{roomId}` | ADMIN | Create rule |
| DELETE | `/pricing-rules/delete/{ruleId}` | ADMIN | Delete rule |
| GET | `/pricing-rules/effective-price/{roomId}?checkIn=&checkOut=` | Public | Calculate dynamic price |

### CancellationPolicyController (`/cancellation-policies`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cancellation-policies/all` | Public | All policies |
| GET | `/cancellation-policies/{id}` | Public | Policy by ID |
| POST | `/cancellation-policies/create` | ADMIN | Create policy |
| PUT | `/cancellation-policies/update/{id}` | ADMIN | Update policy |

---

## SECURITY ARCHITECTURE

### Components
1. **SecurityConfig** — Configures Spring Security filter chain. Stateless session (no server-side sessions). CSRF disabled. Role-based endpoint access with `@PreAuthorize`. BCryptPasswordEncoder for password hashing.

2. **JWTUtils** — JWT operations using jjwt library. Algorithm: HMAC-SHA256. Token expiry: 7 days (604,800,000 ms). Methods: `generateToken(UserDetails)`, `extractUsername(String)`, `isValidToken(String, UserDetails)`.

3. **JWTAuthFilter** — Extends `OncePerRequestFilter`. Intercepts every request, extracts Bearer token from `Authorization` header, validates it via JWTUtils, and sets `UsernamePasswordAuthenticationToken` in `SecurityContextHolder`.

4. **CustomUserDetailsService** — Implements `UserDetailsService`. Loads user by email from `UserRepository`. Used by Spring Security's `DaoAuthenticationProvider`.

5. **CorsConfig** — Allows requests from `http://localhost:3000`, `http://localhost:*`, `https://*.smartstays.com`. Credentials allowed. Also registers `/images/**` resource handler serving local uploaded images.

### Public vs Protected Endpoints
- **Public (permitAll):** `/auth/**`, `/rooms/**`, `/bookings/get-by-confirmation-code/**`, `/images/**`, `/reviews/room/**`, `/meal-plans/**`, `/cancellation-policies/**`, `/pricing-rules/**`, `/amenities/**`, `/coupons/validate`
- **Protected:** All other endpoints require a valid JWT
- **Admin-only:** Room add/update/delete, all bookings list, all users, coupon management, amenity management, meal plan creation, admin reply

### Ownership Enforcement (at Service Level)
- **Cancel Booking:** Non-admin users can only cancel bookings they own (checks `SecurityContextHolder` for caller email vs booking owner email)
- **Delete Account:** Non-admin users can only delete their own account (checks caller's user ID vs target ID)

---

## FRONTEND ARCHITECTURE

### Routing Structure (App.js — React Router v6)

**PublicShell** (wraps with Navbar + Footer):
- `/home` — HomePage
- `/login` — LoginPage
- `/register` — RegisterPage
- `/rooms` — AllRoomsPage
- `/find-booking` — FindBookingPage

**ProtectedRoute** (requires JWT in localStorage):
- `/room-details-book/:roomId` — RoomDetailsPage
- `/payment` — PaymentPage
- `/profile` — ProfilePage
- `/edit-profile` — EditProfilePage

**AdminRoute** (requires ADMIN role — nested under AdminLayout):
- `/admin` — AdminPage (dashboard)
- `/admin/manage-rooms` — ManageRoomPage
- `/admin/add-room` — AddRoomPage
- `/admin/edit-room/:roomId` — EditRoomPage
- `/admin/manage-bookings` — ManageBookingsPage
- `/admin/edit-booking/:bookingCode` — EditBookingPage
- `/admin/manage-coupons` — ManageCouponsPage
- `/admin/manage-meal-plans` — ManageMealPlansPage

**Catch-all:** Redirects to `/login`

### Route Guards (guard.js)
- `ProtectedRoute` — checks `ApiService.isAuthenticated()` (token exists in localStorage). Redirects to `/login` with location state for redirect-back on success.
- `AdminRoute` — checks `ApiService.isAdmin()` (role === "ADMIN"). Same redirect behavior.

### ApiService.js
- Static class — all methods are static, no instantiation
- Base URL: `http://localhost:4040`
- `getHeader()` — auto-attaches `Authorization: Bearer {token}` header from localStorage
- Token management: stored/retrieved from `localStorage` keys `token` and `role`
- `logout()` — clears both localStorage keys
- `isAuthenticated()` / `isAdmin()` / `isUser()` — boolean checks for route guards and conditional UI rendering

---

## FRONTEND COMPONENTS

### Public-Facing Pages

**HomePage:** Hero section with background image, embedded RoomSearch for quick search, stats strip (500+ rooms, 4.8 rating, 20+ types, 24/7 support), services section (AC Rooms, Mini Bar, Parking, WiFi), CTA banner.

**AllRoomsPage:** Fetches all rooms and types on mount. Room type filter pills. Date-based search. Pagination (8 rooms per page). Uses RoomResult component.

**RoomDetailsPage:** Full-width hero image with gradient overlay. Room description. Amenity chips. Reviews section. Booking sidebar card with date pickers, guest counts, number of rooms, optional meal plan selector, "Check Price" button (calls effective-price API), price breakdown, and "Proceed to Payment" button.

**FindBookingPage:** Confirmation code input. Displays complete booking, booker, and room details. Null-guard protection for missing nested objects.

**LoginPage / RegisterPage:** Standard auth forms. On successful login, stores JWT and role, redirects to previous page or `/home`. On successful registration, redirects to `/home` after 3 seconds.

### User Pages

**ProfilePage:** Hero card with user initials avatar and booking stats. Tabbed interface: Upcoming Bookings, Past Bookings, Wishlist. Cancel button (with confirm dialog) on upcoming bookings. "Leave Review" button (opens AddReviewModal) on past bookings. Wishlist grid with heart/remove buttons.

**EditProfilePage:** Displays current user info (read-only). Delete account button with confirmation. On deletion, logs out and redirects to `/home`.

**PaymentPage:** Receives booking data via React Router location.state. Left column: order summary with room charges, coupon discount, 12% taxes, grand total. Coupon apply/remove section. Right column: payment method tabs:
- **Card tab:** Animated 3D flip card preview (flips to show CVV on focus), fields for card number (auto-formatted with spaces every 4 digits), cardholder name, expiry (MM/YY format), CVV (password field). Detects card network (VISA/MASTERCARD/RUPAY) from first digit.
- **UPI tab:** UPI ID input with GPay/PhonePe/Paytm/BHIM logos.
- **Net Banking tab:** Bank selection grid (SBI, HDFC, ICICI, Axis, Kotak, Yes, PNB, Bank of Baroda).
Simulated 2-second payment processing. On success: calls `bookRoom` API, shows confirmation code screen with receipt details.

### Admin Pages

**AdminLayout:** Dedicated shell replacing Navbar/Footer for all `/admin/*` routes. Persistent dark sidebar (250px) with brand logo, nav links with icons, user info and logout at bottom. Top bar with hamburger toggle and page title. Responsive: sidebar overlays content on mobile screens (<768px). Separate `AdminLayout.css`.

**AdminPage (Dashboard):** Stat cards (Total Rooms, Total Bookings, Active Coupons — fetched in parallel via Promise.all). Quick action tiles for navigation to each management page.

**ManageRoomPage:** Room grid with type filter pills and pagination. Uses RoomResult in admin mode (shows Edit button instead of Book Now). Add Room button.

**AddRoomPage:** Photo upload with preview, room type (select from existing or enter new), price, description, total inventory. Submits as multipart FormData.

**EditRoomPage:** Pre-fills from API (fetched by roomId). Photo shows existing image or new preview. Update and Delete buttons.

**ManageBookingsPage:** All bookings table with real-time filter by confirmation code. Pagination (6 per page). Links to EditBookingPage.

**EditBookingPage:** Full booking detail view (booking info, user info, room info). Archive Booking button.

**ManageCouponsPage:** Create coupon form with all fields (code, discount type, value, min amount, max cap, valid dates, usage limit). Table showing all coupons with Toggle Active / Delete actions.

**ManageMealPlansPage:** Create form (code, name, price per person per day, description). Cards for each meal plan with Delete button.

### Shared/Common Components

**Navbar:** Brand logo. Conditional links based on auth state (Guest/User/Admin). Notification bell with unread count badge (polls every 60 seconds). Notification dropdown with type-based icons, marks all read on open. Responsive hamburger menu.

**RoomResult:** Displays rooms as cards in list or grid. Availability badge (green Available / yellow Hurry / orange Only X left / red Sold Out). Wishlist heart toggle. Amenity chips (max 4 + overflow count). Book Now (user) or Edit (admin) button.

**RoomSearch:** Date pickers (check-in, check-out), room type dropdown, Search button. Returns results to parent via callback.

**AddReviewModal:** Modal overlay. Star rating (1-5) with hover preview. Comment textarea. Calls `addReview` API.

**ReviewList:** Renders reviews with rating stars, author, date, comment. Admin reply displayed in distinct style.

**Pagination:** Numbered page buttons. Props: roomsPerPage, totalRooms, currentPage, paginate callback.

---

## DESIGN SYSTEM (index.css)

**CSS Custom Properties (Design Tokens):**
- `--primary`: #007F86 (teal — primary brand colour)
- `--accent`: #FF7F50 (coral — call-to-action colour)
- `--danger`: #e53935 (red — destructive actions)
- `--success`: #2e7d32 (green — confirmations)
- `--font`: Inter, system-ui, sans-serif

**UI Highlights:**
- Sticky navbar (64px, white, subtle shadow)
- Hero sections with dark overlay on background images
- Floating search card with box-shadow
- Stats strip with teal gradient background
- 3D CSS card flip animation (PaymentPage card preview)
- Color-coded availability badges
- Notification dropdown below bell icon
- Responsive at 900px (2-column → 1-column) and 768px (hamburger menu, sidebar overlay)
- Admin sidebar with dark background (#1a1a2e), sticky and full-height

---

## KEY BUSINESS FLOWS

### 1. Complete Booking Flow (User)
1. User visits `/rooms` → browses room cards with live availability badges
2. User applies filters (date range, room type) via RoomSearch → filtered results
3. User clicks a room → RoomDetailsPage with details, amenities, and reviews
4. User fills booking card: dates, number of rooms, guests, optional meal plan
5. User clicks "Check Price" → frontend calls `/pricing-rules/effective-price` → displays nightly breakdown with dynamic pricing applied
6. User clicks "Proceed to Payment" → navigates to `/payment` with booking state
7. (Optional) User applies coupon → frontend calls `/coupons/validate` → discount applied
8. User selects payment method (Card / UPI / Net Banking) and fills details
9. Client-side validation runs
10. Simulated 2-second payment processing
11. API call: `POST /bookings/book-room/{roomId}/{userId}` with JWT
12. Backend: validates JWT → checks room availability → creates Booking → creates Payment record → creates Notification → returns confirmation code
13. Frontend shows success screen with confirmation code and receipt

### 2. Room Availability Algorithm
- Each room has `totalInventory` (e.g., 5 Deluxe rooms)
- For a date range, count bookings where: `newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn`
- Available = `totalInventory - overlappingBookingCount`
- If 0: "Sold Out" (red); ≤2: "Only X left!" (orange); ≤5: "Hurry! Limited rooms" (yellow); else: "Available" (green)

### 3. Dynamic Pricing
- Iterates night by night through booking date range
- For each night checks PricingRules assigned to that room
- Priority: `priceOverride` (absolute) > `priceMultiplier` (relative) > base room price
- Supports seasonal pricing (date ranges) and day-specific pricing (weekends, etc.)

### 4. Coupon Application
- Validates: active, within date range, not exceeded usage limit, meets minimum booking amount
- PERCENT type: applies percentage discount capped at maxDiscountCap
- FLAT type: subtracts fixed amount directly

### 5. JWT Authentication Flow
- Login → Spring validates email/password with BCrypt → generates 7-day JWT signed with HMAC-SHA256 → returns token + role
- Frontend stores in localStorage → attaches as `Authorization: Bearer {token}` on every request
- JWTAuthFilter intercepts each request → validates token → sets SecurityContext
- Protected routes check token existence (ProtectedRoute) or ADMIN role (AdminRoute)

---

## PROJECT STRUCTURE

```
phegon-hotel-booking-and-management/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/phegondev/PhegonHotel/
│       │   ├── PhegonHotelApplication.java
│       │   ├── controller/        (12 controllers)
│       │   ├── entity/            (12 entities)
│       │   ├── dto/               (Response.java — unified DTO)
│       │   ├── repo/              (12 repositories)
│       │   ├── service/
│       │   │   ├── interfac/      (service interfaces)
│       │   │   ├── impl/          (service implementations)
│       │   │   └── AwsS3Service.java (local file storage)
│       │   ├── security/
│       │   │   ├── SecurityConfig.java
│       │   │   ├── JWTAuthFilter.java
│       │   │   ├── CorsConfig.java
│       │   │   └── CustomUserDetailsService.java
│       │   ├── utils/
│       │   │   ├── JWTUtils.java
│       │   │   └── Utils.java (entity-to-DTO mapper)
│       │   └── exception/
│       │       └── OurException.java
│       └── resources/
│           ├── application.properties
│           ├── data.sql           (seed data)
│           └── db-setup.sql       (schema DDL)
│
└── frontend/
    ├── package.json
    └── src/
        ├── App.js                 (router configuration)
        ├── index.js
        ├── index.css              (global styles + design tokens)
        ├── service/
        │   ├── ApiService.js      (all API calls, static class)
        │   └── guard.js           (ProtectedRoute, AdminRoute)
        └── component/
            ├── common/            (Navbar, Footer, RoomResult, RoomSearch,
            │                       Pagination, AddReviewModal, ReviewList,
            │                       AllRoomsPage, RoomAvailabilitySummary)
            ├── home/              (HomePage)
            ├── auth/              (LoginPage, RegisterPage)
            ├── booking_rooms/     (RoomDetailsPage, FindBookingPage, PaymentPage)
            ├── profile/           (ProfilePage, EditProfilePage)
            └── admin/             (AdminLayout + AdminLayout.css, AdminPage,
                                    ManageRoomPage, AddRoomPage, EditRoomPage,
                                    ManageBookingsPage, EditBookingPage,
                                    ManageCouponsPage, ManageMealPlansPage)
```

---

## DESIGN PATTERNS USED

| Pattern | Where Applied |
|---|---|
| Repository Pattern | All JpaRepository interfaces abstract DB access |
| Service Layer Pattern | Business logic fully separated from controllers |
| DTO Pattern | Unified `Response` object returned by all controllers |
| Builder Pattern | Response DTO uses Lombok @Builder |
| Filter Chain Pattern | JWT authentication via OncePerRequestFilter |
| Static Utility Pattern | Utils class for entity-to-DTO mapping; ApiService as static class |
| Component-Based Architecture | React functional components with hooks |
| Protected Route Pattern | Higher-order route components (ProtectedRoute, AdminRoute) |
| Toggle Pattern | Wishlist add/remove via single endpoint |
| Observer Pattern | Notification polling in Navbar every 60 seconds |

---

## NOTABLE TECHNICAL DECISIONS

1. **Inventory-based availability model:** Rather than tracking individual room instances, `totalInventory` on the Room entity plus a count of overlapping bookings gives real-time availability — simpler and scalable.

2. **Stateless JWT authentication:** No server-side sessions. Each request is self-contained. Enables horizontal scaling.

3. **Unified Response DTO:** All 12 controllers return the same `Response` object with a `statusCode` and optional data fields. This keeps the frontend ApiService consistent and predictable.

4. **Local file storage (misnamed AwsS3Service):** The image upload service saves files to local disk and returns a URL served by Spring's resource handler at `/images/**`. The class name `AwsS3Service` is a legacy name from an earlier design decision.

5. **React Router v6 nested routes:** Admin routes are nested under `/admin` with `AdminLayout` as the parent element, providing the sidebar without touching the PublicShell. This cleanly separates the two UX paradigms.

6. **Client-side payment simulation:** The payment processing is simulated (2-second delay, then API call). The `PaymentPage` collects card/UPI/banking details for UI demonstration but does not connect to a real payment gateway. A disclaimer is shown to users.

7. **SecureRandom for confirmation codes:** Uses Java's cryptographically secure random number generator for booking confirmation codes — not `Math.random()`.

8. **Dynamic pricing day-by-day calculation:** The pricing engine iterates each night individually rather than applying a single rate, enabling complex overlapping rules (e.g., a weekend multiplier during a festive date range).

---

## KNOWN LIMITATIONS (for report completeness)

- JWT secret is hardcoded in source code (should be an environment variable in production)
- Database credentials are in application.properties (should use env vars or Spring Vault)
- No real email notification system (Notification entity exists but no email delivery)
- No real payment gateway integration (simulated only)
- No rate limiting on authentication endpoints
- No email verification on registration
- Images stored on local disk (not portable across server instances; would need shared storage or CDN in production)
- No unit or integration tests implemented
