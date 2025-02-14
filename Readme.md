# Gadget API

# Api Routes table



| **Method** | **Endpoint**                  | **Description**                                                 | **Request Body (JSON)**                          | **Response (Example)**                                                                           |
| ---------- | ----------------------------- | --------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **GET**    | `/gadgets`                    | Retrieve all gadgets with a random mission success probability. | _None_                                           | `[{"id": "123", "name": "The Nightingale", "status": "Available", "successProbability": "87%"}]` |
| **GET**    | `/gadgets?status={status}`    | Retrieve gadgets filtered by status.                            | your Deployed                                          | `[{"id": "456", "name": "The Kraken", "status": "Deployed"}]`                                    |
| **POST**   | `/gadgets`                    | Add a new gadget with a unique codename.                        | `{"name": "The Phantom"}`                          | `{"id": "789", "name": "The Phantom", "status": "Available"}`                                    |
| **PATCH**  | `/gadgets/{id}`               | Update an existing gadget's details.                            | `{"name": "Updated Name", "status": "Deployed"}` | `{"id": "123", "name": "Updated Name", "status": "Deployed"}`                                    |
| **DELETE** | `/gadgets/{id}`               | Mark a gadget as "Decommissioned" with a timestamp.             | id                                           | `{"id": "123", "status": "Decommissioned", "decommissionedAt": "2025-02-13T10:00:00Z"}`          |
| **POST**   | `/gadgets/{id}/self-destruct` | Trigger self-destruct with a random confirmation code.          |    id                                           | `{"message": "Self-destruct initiated", "confirmationCode": "XJ72K9"}`                           |

---

## Project Structure
```tree
phonix/
├── config/
│   └── database.js         # Database configuration
├── lib/
│   └── prisma.js          # Prisma client instance
├── middleware/
│   └── auth.js            # Authentication middleware
├── prisma/
│   ├── migrations/        # Database migrations
│   └── schema.prisma      # Prisma schema
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   └── gadgetRoutes.js    # Gadget CRUD routes
├── utils/
│   └── codenameGenerator.js # Unique codename generator
├── .env                   # Environment variables
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore file
├── index.js              # Application entry point
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

Key directories and files:
- `config/`: Configuration files
- `lib/`: Shared libraries and instances
- `middleware/`: Express middleware functions
- `prisma/`: Database schema and migrations
- `routes/`: API route handlers
- `utils/`: Utility functions
- Root files: Configuration and entry points

## Database Schema

### Gadget Model
```prisma
model Gadget {
  id                String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  codename         String        @unique @db.VarChar(100)
  name             String        @db.VarChar(255)
  description      String?       @db.Text
  status           GadgetStatus  @default(Available)
  created_at       DateTime      @default(dbgenerated("CURRENT_TIMESTAMP")) @db.Timestamptz
  updated_at       DateTime      @default(dbgenerated("CURRENT_TIMESTAMP")) @db.Timestamptz
  decommissioned_at DateTime?    @db.Timestamptz
  last_mission_date DateTime?    @db.Timestamptz
}

enum GadgetStatus {
  Available
  Deployed
  Destroyed
  Decommissioned
}
```

#### Fields Explanation:
- `id`: UUID primary key, auto-generated
- `codename`: Unique identifier (e.g., "StealthyPenguin")
- `name`: Display name of the gadget
- `description`: Optional detailed description
- `status`: Current state (Available/Deployed/Destroyed/Decommissioned)
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update
- `decommissioned_at`: Timestamp when gadget was decommissioned (if applicable)
- `last_mission_date`: Timestamp of last mission (if applicable)

### User Model
```prisma
model User {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  username  String    @unique
  password  String
  role      UserRole  @default(USER)
  created_at DateTime @default(dbgenerated("CURRENT_TIMESTAMP")) @db.Timestamptz
  updated_at DateTime @default(dbgenerated("CURRENT_TIMESTAMP")) @db.Timestamptz
}

enum UserRole {
  USER
  ADMIN
}
```

#### Fields Explanation:
- `id`: UUID primary key, auto-generated
- `username`: Unique username for authentication
- `password`: Hashed password (using bcrypt)
- `role`: User's role (USER/ADMIN)
- `created_at`: Timestamp of account creation
- `updated_at`: Timestamp of last account update

### Notes:
- All timestamps use PostgreSQL's timestamptz type for timezone awareness
- Passwords are never stored in plain text
- UUIDs are generated using PostgreSQL's gen_random_uuid() function
- Both models use automatic timestamp management for created_at/updated_at

## Authentication

The API uses role-based authentication with two types of users:
- **Admin**: Can perform all operations (GET, POST, PATCH, DELETE)
- **User**: Can only view gadgets (GET operations)

### Sample Credentials

**Admin Account:**
```json
{
  "username": "sanskar",
  "password": "sanskar123"
}
```

### Authentication Endpoints

| **Method** | **Endpoint**      | **Description**          | **Request Body**                                  |
|------------|------------------|------------------------|--------------------------------------------------|
| **POST**   | `/auth/signup`   | Create a new user      | `{"username": "user1", "password": "password123"}` |
| **POST**   | `/auth/login`    | Login to get session   | `{"username": "user1", "password": "password123"}` |
| **POST**   | `/auth/logout`   | Logout current session | None                                               |

### Protected Routes
- All `/gadgets` endpoints require authentication
- POST, PATCH, DELETE operations require admin role
- GET operations are available to both admin and regular users

### Session Management
- Authentication is handled via session cookies
- Sessions expire after 1 hour of inactivity
- No need to manually add authorization headers

## API Endpoints Examples

### Authentication

#### 1. Signup
```http
POST /auth/signup
```
Request:
```json
{
  "username": "newuser",
  "password": "password123"
}
```
Response:
```json
{
  "message": "✅ User created successfully!",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "newuser",
    "role": "USER"
  }
}
```

#### 2. Login
```http
POST /auth/login
```
Request:
```json
{
  "username": "sanskar",
  "password": "sanskar123"
}
```
Response:
```json
{
  "message": "✅ Login successful!",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "sanskar",
    "role": "ADMIN"
  }
}
```

### Gadgets

#### 1. Get All Gadgets
```http
GET /gadgets
```
Response:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Night Vision Goggles",
    "codename": "StealthyPenguin",
    "status": "Available",
    "description": "Advanced night vision capability",
    "created_at": "2024-03-21T10:00:00Z",
    "last_mission_date": null,
    "successProbability": "87%"
  }
]
```

#### 2. Get Gadgets by Status
```http
GET /gadgets?status=Deployed
```
Response:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Laser Cutter",
    "codename": "SilentEagle",
    "status": "Deployed",
    "description": "Precision cutting tool",
    "created_at": "2024-03-21T10:00:00Z",
    "last_mission_date": "2024-03-22T15:30:00Z",
    "successProbability": "92%"
  }
]
```

#### 3. Create New Gadget (Admin Only)
```http
POST /gadgets
```
Request:
```json
{
  "name": "Quantum Decoder",
  "description": "Advanced encryption breaking tool"
}
```
Response:
```json
{
  "message": "✅ Gadget added successfully!",
  "gadget": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Quantum Decoder",
    "codename": "SwiftFalcon",
    "status": "Available",
    "description": "Advanced encryption breaking tool",
    "created_at": "2024-03-21T10:00:00Z",
    "updated_at": "2024-03-21T10:00:00Z"
  }
}
```

#### 4. Update Gadget (Admin Only)
```http
PATCH /gadgets/123e4567-e89b-12d3-a456-426614174000
```
Request:
```json
{
  "name": "Enhanced Quantum Decoder",
  "status": "Deployed",
  "description": "Updated with quantum capabilities"
}
```
Response:
```json
{
  "message": "✅ Gadget updated successfully!",
  "gadget": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Enhanced Quantum Decoder",
    "status": "Deployed",
    "description": "Updated with quantum capabilities",
    "updated_at": "2024-03-21T11:00:00Z"
  }
}
```

#### 5. Decommission Gadget (Admin Only)
```http
DELETE /gadgets/123e4567-e89b-12d3-a456-426614174000
```
Response:
```json
{
  "message": "✅ Gadget decommissioned successfully!",
  "gadget": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "Decommissioned",
    "decommissioned_at": "2024-03-21T12:00:00Z",
    "updated_at": "2024-03-21T12:00:00Z"
  }
}
```

#### 6. Self-Destruct Gadget (Admin Only)
```http
POST /gadgets/123e4567-e89b-12d3-a456-426614174000/self-destruct
```
Response:
```json
{
  "message": "💥 Gadget has been destroyed!",
  "verificationId": "123456A",
  "gadget": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "Decommissioned",
    "decommissioned_at": "2024-03-21T13:00:00Z",
    "updated_at": "2024-03-21T13:00:00Z"
  }
}
```

---


