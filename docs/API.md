# API Reference

Base URL: `http://localhost:5000/api`

All authenticated endpoints require: `Authorization: Bearer <token>`

## Authentication

### POST /auth/register
Register a new citizen account.

```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "firstName": "Amit",
  "lastName": "Sharma",
  "phone": "9876543210",
  "aadhaarNumber": "123456789012"
}
```

### POST /auth/login
```json
{
  "email": "citizen@example.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "CITIZEN" },
    "accessToken": "eyJ...",
    "expiresIn": "7d"
  }
}
```

### GET /auth/profile
Get current user profile. Requires auth.

### PUT /auth/profile
Update profile fields (firstName, lastName, phone, address, city, state, pincode).

---

## Government Services

### GET /services
List all active services. Supports `?search=`, `?category=`, `?page=`, `?limit=`.

### GET /services/categories
List service categories.

### GET /services/:slug
Get service details by slug (e.g., `birth-certificate`).

---

## Applications

### GET /applications/verify/:certificateNo
Public endpoint to verify a certificate.

### GET /applications
List applications (filtered by role). Supports `?status=`, `?search=`, `?page=`.

### POST /applications
Create a draft application (Citizen only).

```json
{
  "serviceId": "uuid",
  "formData": { "fullName": "Amit Sharma", "address": "..." }
}
```

### GET /applications/:id
Get application details with status history and documents.

### POST /applications/:id/submit
Submit a draft application (Citizen only).

### PATCH /applications/:id/status
Update application status (Officer/Admin only).

```json
{
  "status": "APPROVED",
  "remarks": "All documents verified"
}
```

**Status values:** `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `COMPLETED`

---

## Documents

### POST /documents/upload
Upload a file (multipart/form-data). Fields: `file`, optional `applicationId`.

Allowed types: PDF, JPEG, PNG, WebP. Max size: 5MB.

---

## Notifications

### GET /notifications
List user notifications. Supports `?unreadOnly=true`.

### GET /notifications/unread-count
Get unread notification count.

### PATCH /notifications/:id/read
Mark a notification as read.

### PATCH /notifications/read-all
Mark all notifications as read.

---

## Dashboard & Reports

### GET /dashboard/stats
Role-aware dashboard statistics.

### GET /reports/by-service (Officer/Admin)
Applications grouped by service.

### GET /reports/by-status (Officer/Admin)
Applications grouped by status.

### GET /reports/monthly-trend?months=6 (Officer/Admin)
Monthly application trend.

---

## Admin

### GET /admin/users (Admin only)
List users. Supports `?role=`, `?search=`, `?page=`.

### PATCH /admin/users/:id/toggle-status (Admin only)
Activate/deactivate a user account.

---

## Health

### GET /health
```json
{ "success": true, "message": "Government Citizen Services Portal API is running" }
```

## Error Responses

```json
{
  "success": false,
  "message": "Error description"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
