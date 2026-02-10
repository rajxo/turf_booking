# Turf Booking API Documentation

**Base URL:** `http://localhost:5000`

---

## Authentication

### Register User
```
POST /api/auth/register
```
**Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"  // "user" | "owner"
}
```

### Login
```
POST /api/auth/login
```
**Body:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```
**Response:** Returns JWT token

### Get Profile
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

---

## Turfs

### Get All Active Turfs (Public)
```
GET /api/turfs
GET /api/turfs?city=mumbai
GET /api/turfs?sports=football,cricket
GET /api/turfs?minPrice=500&maxPrice=2000
GET /api/turfs?minRating=4
GET /api/turfs?page=1&limit=10
```

### Get Turf by ID (Public)
```
GET /api/turfs/:id
```

### Get Cities (Public)
```
GET /api/turfs/cities
```

### Get Sports Types (Public)
```
GET /api/turfs/sports-types
```

### Create Turf (Owner Only)
```
POST /api/turfs
Headers: Authorization: Bearer <owner-token>
```
**Body:**
```json
{
    "name": "Green Field Turf",
    "location": "123 Sports Avenue, MG Road",
    "city": "mumbai",
    "pricePerHour": 1500,
    "openingTime": "06:00",
    "closingTime": "22:00",
    "description": "Premium football turf",
    "amenities": ["parking", "changing room", "water"],
    "sportsTypes": ["football", "cricket"]
}
```

### Update Turf (Owner Only)
```
PUT /api/turfs/:id
Headers: Authorization: Bearer <owner-token>
```

### Delete Turf (Owner Only)
```
DELETE /api/turfs/:id
Headers: Authorization: Bearer <owner-token>
```

### Get My Turfs (Owner Only)
```
GET /api/turfs/my-turfs
Headers: Authorization: Bearer <owner-token>
```

### Upload Cover Image (Owner Only)
```
POST /api/turfs/:id/cover-image
Headers: Authorization: Bearer <owner-token>
Content-Type: multipart/form-data
Body: coverImage (file)
```

### Upload Gallery Images (Owner Only)
```
POST /api/turfs/:id/images
Headers: Authorization: Bearer <owner-token>
Content-Type: multipart/form-data
Body: images (files, max 5)
```

### Delete Gallery Image (Owner Only)
```
DELETE /api/turfs/:id/images/:imageIndex
Headers: Authorization: Bearer <owner-token>
```

---

## Bookings

### Get Turf Availability (Public)
```
GET /api/bookings/availability/:turfId?date=2026-02-10
```
**Response:**
```json
{
    "success": true,
    "data": {
        "turf": { "id": "...", "name": "...", "pricePerHour": 1500 },
        "date": "2026-02-10",
        "slots": [
            { "startTime": "06:00", "endTime": "07:00", "status": "available" },
            { "startTime": "07:00", "endTime": "08:00", "status": "booked" }
        ]
    }
}
```

### Book a Slot (User Only)
```
POST /api/bookings
Headers: Authorization: Bearer <user-token>
```
**Body:**
```json
{
    "turfId": "turf_id_here",
    "date": "2026-02-10",
    "startTime": "10:00",
    "endTime": "12:00"
}
```

### Get My Bookings (User Only)
```
GET /api/bookings/my-bookings
Headers: Authorization: Bearer <user-token>
```

### Get Booking by ID
```
GET /api/bookings/:id
Headers: Authorization: Bearer <token>
```

### Cancel Booking (User Only)
```
PUT /api/bookings/:id/cancel
Headers: Authorization: Bearer <user-token>
```

### Get Turf Bookings (Owner Only)
```
GET /api/bookings/turf/:turfId
Headers: Authorization: Bearer <owner-token>
```

---

## Reviews

### Create Review (User Only)
```
POST /api/reviews
Headers: Authorization: Bearer <user-token>
```
**Body:**
```json
{
    "turfId": "turf_id_here",
    "rating": 5,
    "title": "Great turf!",
    "comment": "Well maintained and clean."
}
```

### Get Turf Reviews (Public)
```
GET /api/reviews/turf/:turfId
GET /api/reviews/turf/:turfId?page=1&limit=10&sortBy=rating
```

### Get My Reviews (User Only)
```
GET /api/reviews/my-reviews
Headers: Authorization: Bearer <user-token>
```

### Update Review (User Only)
```
PUT /api/reviews/:id
Headers: Authorization: Bearer <user-token>
```

### Delete Review (User Only)
```
DELETE /api/reviews/:id
Headers: Authorization: Bearer <user-token>
```

---

## Admin

### Get Dashboard Stats
```
GET /api/admin/dashboard
Headers: Authorization: Bearer <admin-token>
```

### Get All Users
```
GET /api/admin/users
GET /api/admin/users?role=owner&search=john
Headers: Authorization: Bearer <admin-token>
```

### Get All Turfs
```
GET /api/admin/turfs
GET /api/admin/turfs?status=pending
Headers: Authorization: Bearer <admin-token>
```

### Approve Turf
```
PUT /api/admin/turfs/:id/approve
Headers: Authorization: Bearer <admin-token>
```

### Reject Turf
```
PUT /api/admin/turfs/:id/reject
Headers: Authorization: Bearer <admin-token>
```
**Body:**
```json
{
    "reason": "Incomplete information"
}
```

### Get Booking Report
```
GET /api/admin/reports/bookings
GET /api/admin/reports/bookings?startDate=2026-01-01&endDate=2026-02-01
Headers: Authorization: Bearer <admin-token>
```

---

## Roles

| Role | Can Do |
|------|--------|
| **user** | Register, login, book turfs, write reviews, cancel own bookings |
| **owner** | Create/manage turfs, upload images, view turf bookings |
| **admin** | Approve/reject turfs, view all users, view reports |

---

## Response Format

**Success:**
```json
{
    "success": true,
    "message": "Operation successful",
    "data": { ... }
}
```

**Error:**
```json
{
    "success": false,
    "message": "Error description"
}
```
