# API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication

All protected endpoints require Bearer token:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Health Check
```http
GET /health
```

Response:
```json
{
  "success": true,
  "message": "CV Hive API is running"
}
```

### Authentication

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "CANDIDATE"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "CANDIDATE"
    }
  }
}
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Rate Limiting

- 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes
