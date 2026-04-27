# 🧪 API Testing Guide

## Test the LMS API with curl commands

### Prerequisites
- Backend server running on http://localhost:8000
- jq installed for JSON formatting (optional)

## 1. User Registration & Authentication

### Register Admin
```bash
curl -X POST "http://localhost:8000/user/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@lms.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Register Instructor
```bash
curl -X POST "http://localhost:8000/user/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "instructor1",
    "email": "instructor@lms.com",
    "password": "pass123",
    "role": "instructor"
  }'
```

### Register Student
```bash
curl -X POST "http://localhost:8000/user/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "email": "student@lms.com",
    "password": "pass123",
    "role": "student"
  }'
```

### Login (Get JWT Token)
```bash
curl -X POST "http://localhost:8000/user/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Save the token from response:**
```bash
export TOKEN="paste_your_token_here"
```

### Get Current User Info
```bash
curl -X GET "http://localhost:8000/user/me" \
  -H "Authorization: Bearer $TOKEN"
```

## 2. Admin Operations

### Get Dashboard Stats
```bash
curl -X GET "http://localhost:8000/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN"
```

### List Pending Users
```bash
curl -X GET "http://localhost:8000/admin/users/pending" \
  -H "Authorization: Bearer $TOKEN"
```

### Approve User (replace USER_ID)
```bash
curl -X PUT "http://localhost:8000/admin/users/2/approve" \
  -H "Authorization: Bearer $TOKEN"
```

### List All Users
```bash
curl -X GET "http://localhost:8000/admin/users" \
  -H "Authorization: Bearer $TOKEN"
```

### Create User as Admin
```bash
curl -X POST "http://localhost:8000/admin/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@lms.com",
    "password": "pass123",
    "role": "student"
  }'
```

## 3. Course Management

### Create Course
```bash
curl -X POST "http://localhost:8000/course/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Python",
    "description": "Learn Python programming from scratch"
  }'
```

### List All Courses
```bash
curl -X GET "http://localhost:8000/course/" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Course Details (replace COURSE_ID)
```bash
curl -X GET "http://localhost:8000/course/1" \
  -H "Authorization: Bearer $TOKEN"
```

### Enroll in Course
```bash
curl -X POST "http://localhost:8000/course/1/enroll" \
  -H "Authorization: Bearer $TOKEN"
```

### Mark Course Complete
```bash
curl -X PATCH "http://localhost:8000/course/1/complete" \
  -H "Authorization: Bearer $TOKEN"
```

## 4. Content Management

### Add YouTube Video
```bash
curl -X POST "http://localhost:8000/course/1/content/youtube" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Introduction Video" \
  -F "youtube_url=https://www.youtube.com/watch?v=_uQrJ0TkZlc" \
  -F "order=0"
```

### Upload File Content
```bash
curl -X POST "http://localhost:8000/course/1/content/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Course Slides" \
  -F "file=@/path/to/your/file.pdf" \
  -F "order=1"
```

### List Course Content
```bash
curl -X GET "http://localhost:8000/course/1/content" \
  -H "Authorization: Bearer $TOKEN"
```

### Delete Content (replace CONTENT_ID)
```bash
curl -X DELETE "http://localhost:8000/course/1/content/5" \
  -H "Authorization: Bearer $TOKEN"
```

## 5. Activity Tracking

### Log Activity
```bash
curl -X POST "http://localhost:8000/activity/log" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": 1,
    "event": "viewed"
  }'
```

### Get My Activities
```bash
curl -X GET "http://localhost:8000/activity/me" \
  -H "Authorization: Bearer $TOKEN"
```

## 6. Complete Test Workflow

### Full Test Script
```bash
#!/bin/bash

echo "=== LMS API Test Workflow ==="

# 1. Register Admin
echo "1. Registering admin..."
curl -s -X POST "http://localhost:8000/user/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@test.com","password":"admin123","role":"admin"}' | jq

# 2. Login as Admin
echo "2. Logging in as admin..."
TOKEN=$(curl -s -X POST "http://localhost:8000/user/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.access_token')

echo "Token: $TOKEN"

# 3. Get Dashboard Stats
echo "3. Getting dashboard stats..."
curl -s -X GET "http://localhost:8000/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Create Course
echo "4. Creating course..."
COURSE_ID=$(curl -s -X POST "http://localhost:8000/course/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Python 101","description":"Learn Python"}' | jq -r '.id')

echo "Created course ID: $COURSE_ID"

# 5. Add YouTube Video
echo "5. Adding YouTube video..."
curl -s -X POST "http://localhost:8000/course/$COURSE_ID/content/youtube" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Intro Video" \
  -F "youtube_url=https://www.youtube.com/watch?v=_uQrJ0TkZlc" \
  -F "order=0" | jq

# 6. List Course Content
echo "6. Listing course content..."
curl -s -X GET "http://localhost:8000/course/$COURSE_ID/content" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "=== Test Complete ==="
```

## 7. Useful Testing Tips

### Format JSON Output
Add `| jq` to any curl command:
```bash
curl -X GET "http://localhost:8000/course/" -H "Authorization: Bearer $TOKEN" | jq
```

### Save Response to File
```bash
curl -X GET "http://localhost:8000/course/" \
  -H "Authorization: Bearer $TOKEN" \
  -o courses.json
```

### Check HTTP Status
```bash
curl -w "\nHTTP Status: %{http_code}\n" \
  -X GET "http://localhost:8000/user/me" \
  -H "Authorization: Bearer $TOKEN"
```

### Test with Invalid Token
```bash
curl -X GET "http://localhost:8000/user/me" \
  -H "Authorization: Bearer invalid_token"
# Should return 401 Unauthorized
```

## 8. Common Response Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Not allowed (e.g., pending approval)
- `404 Not Found` - Resource doesn't exist
- `422 Unprocessable Entity` - Validation error

## 9. Interactive API Documentation

Visit http://localhost:8000/docs for interactive Swagger UI where you can:
- See all endpoints
- Try requests directly in browser
- View request/response schemas
- Test authentication

---

**Pro Tip**: Use Postman or Insomnia for a GUI-based testing experience!
