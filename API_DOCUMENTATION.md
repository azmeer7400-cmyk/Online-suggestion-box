# API Documentation - Online Suggestion Box

## Base URL
```
http://localhost:3000/api
```

## Authentication
Admin endpoints require active session. Sessions are maintained via cookies.

---

## Suggestion Endpoints

### 1. Submit Suggestion
**Endpoint**: `POST /suggestions/submit`

**Description**: Submit a new suggestion with optional file attachment

**Request**:
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**:
  ```javascript
  {
    title: string (required, min 5 chars),
    message: string (required, min 10 chars),
    area: string (required, enum: Library|Cafeteria|Classroom|Hostel|Laboratory|Sports|Other),
    floor: number (optional, 0-10),
    wing: string (required, enum: A|B|C|D|E|N/A),
    image: file (optional, max 5MB, allowed: jpg|jpeg|png|gif|pdf|doc|docx)
  }
  ```

**Response Success** (201):
```javascript
{
  success: true,
  message: "Suggestion submitted successfully!",
  suggestionId: "507f1f77bcf86cd799439011"
}
```

**Response Error** (400/500):
```javascript
{
  success: false,
  message: "Error message describing the problem"
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/suggestions/submit \
  -F "title=Improve Library" \
  -F "message=The library needs better lighting facilities" \
  -F "area=Library" \
  -F "floor=2" \
  -F "wing=A" \
  -F "image=@path/to/image.jpg"
```

---

### 2. Get All Suggestions (Admin)
**Endpoint**: `GET /suggestions/all`

**Description**: Retrieve all suggestions, sorted by most recent first

**Request**:
- **Method**: GET
- **Authentication**: Required (admin session)

**Response Success** (200):
```javascript
[
  {
    _id: ObjectId,
    title: "Suggestion Title",
    message: "Full message content",
    area: "Library",
    floor: 2,
    wing: "A",
    imagePath: "/uploads/suggestion-123456.jpg" or null,
    submittedAt: ISODate("2024-01-15T10:30:00Z"),
    status: "Pending",
    adminResponse: null or "Response text",
    responseDate: ISODate or null
  },
  ...
]
```

**Example cURL**:
```bash
curl -X GET http://localhost:3000/api/suggestions/all \
  -H "Cookie: connect.sid=your_session_id"
```

---

### 3. Get Suggestions by Status
**Endpoint**: `GET /suggestions/status/:status`

**Description**: Retrieve suggestions filtered by status

**Request**:
- **Method**: GET
- **URL Parameters**:
  - `status`: string (Pending|Under Review|Resolved|Rejected)
- **Authentication**: Required

**Response**: Array of suggestions matching the status

**Example**:
```bash
curl -X GET http://localhost:3000/api/suggestions/status/Pending
```

---

### 4. Get Suggestions by Area
**Endpoint**: `GET /suggestions/area/:area`

**Description**: Retrieve suggestions filtered by area/location

**Request**:
- **Method**: GET
- **URL Parameters**:
  - `area`: string (Library|Cafeteria|Classroom|Hostel|Laboratory|Sports|Other)
- **Authentication**: Required

**Response**: Array of suggestions from the specified area

**Example**:
```bash
curl -X GET http://localhost:3000/api/suggestions/area/Library
```

---

### 5. Update Suggestion
**Endpoint**: `PUT /suggestions/update/:id`

**Description**: Update suggestion status and add admin response

**Request**:
- **Method**: PUT
- **Content-Type**: application/json
- **URL Parameters**:
  - `id`: string (MongoDB ObjectId)
- **Body**:
  ```javascript
  {
    status: string (Pending|Under Review|Resolved|Rejected),
    adminResponse: string (optional, max 1000 chars)
  }
  ```
- **Authentication**: Required

**Response Success** (200):
```javascript
{
  success: true,
  message: "Suggestion updated successfully",
  suggestion: {
    _id: "507f1f77bcf86cd799439011",
    title: "Suggestion Title",
    status: "Resolved",
    adminResponse: "This has been reviewed and resolved",
    responseDate: ISODate,
    ...
  }
}
```

**Example cURL**:
```bash
curl -X PUT http://localhost:3000/api/suggestions/update/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Resolved",
    "adminResponse": "Thank you for the suggestion. We are implementing this."
  }'
```

---

### 6. Delete Suggestion
**Endpoint**: `DELETE /suggestions/delete/:id`

**Description**: Delete a suggestion permanently

**Request**:
- **Method**: DELETE
- **URL Parameters**:
  - `id`: string (MongoDB ObjectId)
- **Authentication**: Required

**Response Success** (200):
```javascript
{
  success: true,
  message: "Suggestion deleted successfully"
}
```

**Response Error** (404):
```javascript
{
  message: "Suggestion not found"
}
```

**Example cURL**:
```bash
curl -X DELETE http://localhost:3000/api/suggestions/delete/507f1f77bcf86cd799439011
```

---

### 7. Get Statistics
**Endpoint**: `GET /suggestions/stats`

**Description**: Get count of suggestions by status

**Request**:
- **Method**: GET
- **Authentication**: Not required

**Response** (200):
```javascript
{
  total: 45,
  pending: 12,
  underReview: 8,
  resolved: 20,
  rejected: 5
}
```

**Example cURL**:
```bash
curl -X GET http://localhost:3000/api/suggestions/stats
```

---

## Admin Endpoints

### 1. Admin Login
**Endpoint**: `POST /admin/login`

**Description**: Authenticate admin user and create session

**Request**:
- **Method**: POST
- **Content-Type**: application/json
- **Body**:
  ```javascript
  {
    username: string (required),
    password: string (required)
  }
  ```

**Response Success** (200):
```javascript
{
  success: true,
  message: "Login successful",
  adminId: "507f1f77bcf86cd799439011"
}
```

**Response Error** (401):
```javascript
{
  success: false,
  message: "Invalid credentials"
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }' \
  -c cookies.txt
```

---

### 2. Admin Logout
**Endpoint**: `POST /admin/logout`

**Description**: Logout admin and destroy session

**Request**:
- **Method**: POST
- **Authentication**: Required

**Response** (200):
```javascript
{
  success: true,
  message: "Logged out successfully"
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/admin/logout \
  -b cookies.txt
```

---

### 3. Check Authentication
**Endpoint**: `GET /admin/check-auth`

**Description**: Verify if user has active admin session

**Request**:
- **Method**: GET

**Response - Authenticated** (200):
```javascript
{
  authenticated: true,
  adminId: "507f1f77bcf86cd799439011"
}
```

**Response - Not Authenticated** (200):
```javascript
{
  authenticated: false
}
```

**Example cURL**:
```bash
curl -X GET http://localhost:3000/api/admin/check-auth \
  -b cookies.txt
```

---

## Error Codes

| Code | Meaning | Details |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Authentication required or failed |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

## Common Use Cases

### 1. User Submitting a Suggestion with File

```javascript
const formData = new FormData();
formData.append('title', 'Improve Cafeteria Menu');
formData.append('message', 'The cafeteria menu needs more vegetarian options');
formData.append('area', 'Cafeteria');
formData.append('floor', '1');
formData.append('wing', 'B');
formData.append('image', fileInput.files[0]);

fetch('http://localhost:3000/api/suggestions/submit', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

### 2. Admin Filtering Suggestions

```javascript
// Get pending suggestions
fetch('http://localhost:3000/api/suggestions/status/Pending')
  .then(res => res.json())
  .then(suggestions => console.log(suggestions));

// Get suggestions from library
fetch('http://localhost:3000/api/suggestions/area/Library')
  .then(res => res.json())
  .then(suggestions => console.log(suggestions));
```

### 3. Admin Updating Suggestion Status

```javascript
fetch('http://localhost:3000/api/suggestions/update/507f1f77bcf86cd799439011', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'Resolved',
    adminResponse: 'Thank you for your feedback. We have taken action.'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding it for production:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

---

## File Upload Specifications

**Allowed Types**:
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Documents: `.pdf`, `.doc`, `.docx`

**Size Limit**: 5MB

**Storage**: `/public/uploads/`

**Naming**: `suggestion-[timestamp]-[random].ext`

---

## Session Configuration

- **Duration**: 24 hours
- **Secure**: httpOnly cookies
- **Storage**: Memory (consider using MongoDB store for production)

---

## Best Practices

1. **Always validate input** on both client and server
2. **Handle errors gracefully** with appropriate HTTP codes
3. **Use HTTPS** in production
4. **Sanitize file uploads** to prevent malicious files
5. **Implement rate limiting** to prevent abuse
6. **Log API activity** for monitoring
7. **Backup database** regularly
8. **Use environment variables** for sensitive data

---

## Testing with Postman

1. Import these collections into Postman
2. Set base URL: `{{BASE_URL}}/api`
3. Use the provided examples
4. Save responses in variables for chaining requests

---

## Support

For API issues, check:
- Server logs for detailed error messages
- Network tab in browser DevTools
- MongoDB connection status
- File permissions for uploads directory

