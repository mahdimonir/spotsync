# 🚗 SpotSync - Smart Parking & EV Charging Reservation System

SpotSync is a centralized platform designed for busy airports and malls to manage parking zones, specifically handling the high-demand reservation of limited EV charging spots. 

This repository contains a Go backend built with clean architecture, high-performance APIs using Echo, concurrent-safe booking using GORM transactions, and row-level locking.

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Clean Architecture & Layers](#clean-architecture--layers)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Database Seeding (Seed Data)](#database-seeding-seed-data)
- [Building & Running](#building--running)
- [API Endpoints Specification](#api-endpoints-specification)
- [Database Schema](#database-schema)
- [Race Condition Protection](#race-condition-protection)
- [Project Structure](#project-structure)

---

## ✨ Features

### Authentication & Authorization
- **Register & Login**: JWT-based authentication for drivers and admins.
- **Role-Based Access Control**: Strict route protection separating driver actions and administrative operations.
- **Security**: Password hashing using `bcrypt` (cost 10-12) and zero credential exposure.

### Parking Zone Management
- **Zone Catalog**: Create, read, update, delete zones (Admin only).
- **Zone Types**: Supports `general`, `ev_charging`, and `covered` parking spaces.
- **Dynamic Availability**: Dynamic calculation of available spots (`total_capacity` minus `active` reservations).

### Reservation System (Core Feature)
- **Concurrent-Safe Booking**: Atomic check-and-reserve implementation using a GORM database transaction and database row-level locking (`FOR UPDATE`) on the parking zone record to resolve the "EV Spot Bottleneck" race condition.
- **Cancellation**: Drivers can cancel their own active reservations (freeing up spots). Admin controls for system history.
- **Admin Overview**: View all reservations in the system.

---

## 🛠️ Technology Stack

| Technology | Note / Version | Purpose |
| --- | --- | --- |
| **Go (Golang)** | Version 1.22 or higher | High performance compiled runtime |
| **Echo** | `github.com/labstack/echo/v4` | Minimalist web framework |
| **GORM** | `gorm.io/gorm` | ORM using PostgreSQL driver |
| **PostgreSQL** | Relational Database | NeonDB, Supabase, or local instance |
| **Validator** | `github.com/go-playground/validator/v10` | Struct field validation |
| **JWT** | `github.com/golang-jwt/jwt/v5` | Token signature and verification |
| **bcrypt** | `golang.org/x/crypto/bcrypt` | Password hashing |

---

## 🏛️ Clean Architecture & Layers

SpotSync enforces strict separation of concerns into distinct layers:

```
┌─────────────────────────────────────────┐
│         HTTP Layer (Handlers)           │
│    • Request binding & validation       │
│    • DTO conversion & status mapping    │
└────────────────┬────────────────────────┘
                 │
┌─────────────────▼────────────────────────┐
│      Business Logic (Services)           │
│    • JWT signing & Password matching     │
│    • Transaction delegation              │
│    • Business validation                 │
└────────────────┬────────────────────────┘
                 │
┌─────────────────▼────────────────────────┐
│   Data Access Layer (Repositories)       │
│    • GORM database queries               │
│    • Database Transactions               │
│    • Row-level locking (`FOR UPDATE`)    │
└────────────────┬────────────────────────┘
                 │
┌─────────────────▼────────────────────────┐
│             Database Schema              │
│    • GORM schemas & migrations           │
└─────────────────────────────────────────┘
```

- **DTO (`dto/`)**: Define API request payloads and response structures. Models are never exposed directly.
- **Handler (`handler/`)**: Handles Echo routing context, validates input DTOs, calls Services, maps outputs to uniform responses.
- **Service (`service/`)**: Contains logic, validates boundaries, and calls Repositories.
- **Repository (`repository/`)**: Enforces database CRUD actions and GORM locking transactions.
- **Models (`models/`)**: Database table schema mappings.

---

## 📦 Prerequisites

Ensure you have installed:
1. **Go 1.22+**: [Download Go](https://go.dev/dl/)
2. **PostgreSQL** or a cloud database instance (e.g. [NeonDB](https://neon.tech), [Supabase](https://supabase.com)).

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/spotsync-api.git
cd spotsync-api
```

### 2. Configure Environment Variables
Create a `.env` file in the `/backend` folder:
```env
PORT=8080
ENV=development

# Database connection:
# Either use a single DATABASE_URL connection string:
DATABASE_URL=postgres://neondb_owner:npg_Pl9Hq1gVTYni@ep-lingering-salad-ao045m8m-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Or define individual variables:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=spotsync
DB_SSLMODE=disable

# JWT Config:
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=24h
```

---

## 💾 Database Seeding (Seed Data)

To support testing, SpotSync features a database seeding script. 

### 1. Command-Line Seeding (Exit after run)
You can run the application with the `-seed` CLI flag to run auto-migrations, seed initial data, and exit:
```bash
cd backend
go run cmd/main.go -seed
```

### 2. Environment Variable Seeding (On boot)
Set the `SEED_DB=true` environment variable inside your `.env` configuration. Seeding will run safely on application boot without exiting.

### Seeded Accounts & Mock Data
- **Admin Account**: `admin@spotsync.com` / `adminPassword123` (role: `admin`)
- **Driver Account**: `driver@spotsync.com` / `driverPassword123` (role: `driver`)
- **Parking Zones Created**:
  1. **Terminal 1 EV Charging** (EV Charging, Capacity: 5, $5.50/hr)
  2. **Main Parking Structure** (Covered, Capacity: 50, $3.00/hr)
  3. **Open Lot A** (General, Capacity: 100, $1.50/hr)
- **Reservations**: A default active reservation for the driver user on the *Terminal 1 EV Charging* zone.

---

## 🏗️ Building & Running

### Run Locally (Dev Mode)
```bash
cd backend
go run cmd/main.go
```

### Run with Hot Reload (Air)
```bash
cd backend
air
```

### Build & Execute Binary
```bash
cd backend
go build -o spotsync-api cmd/main.go
./spotsync-api
```

---

## 🔌 API Endpoints Specification

### 1. Authentication
* **POST** `/api/v1/auth/register` (Public) - Registers a new user.
* **POST** `/api/v1/auth/login` (Public) - Authenticates credentials and returns a signed JWT token containing user `id` and `role`.

### 2. Parking Zones
* **GET** `/api/v1/zones` (Public) - Fetch all zones with dynamically calculated `available_spots`.
* **GET** `/api/v1/zones/:id` (Public) - Fetch details of a single zone.
* **POST** `/api/v1/zones` (Admin Only) - Create a new parking zone.
* **PUT** `/api/v1/zones/:id` (Admin Only) - Update capacity, type, pricing, or name of a zone.
* **DELETE** `/api/v1/zones/:id` (Admin Only) - Delete a zone.

### 3. Reservations
* **POST** `/api/v1/reservations` (Authenticated) - Create a new spot reservation (Protected with row-level locks).
* **GET** `/api/v1/reservations/my-reservations` (Authenticated) - Fetch the active/cancelled reservations of the logged-in driver.
* **DELETE** `/api/v1/reservations/:id` (Authenticated) - Cancel a reservation owned by the caller (403 Forbidden if deleting someone else's).
* **GET** `/api/v1/reservations` (Admin Only) - List all reservations.

### 4. Health Check
* **GET** `/api/v1/health` (Public) - Returns application status `{"status": "ok"}`.

---

## 🛡️ Race Condition Protection

To safely check capacity and insert a reservation atomically under high concurrent load:
1. GORM starts a transaction block (`db.Transaction`).
2. Locks the parking zone row under investigation using `FOR UPDATE` (`clause.Locking{Strength: "UPDATE"}`).
3. Counts the existing `active` reservations for that zone.
4. Compares with the locked zone `total_capacity`. If full, it aborts the transaction returning a `409 Conflict` (`apperrors.ErrZoneFull`) message.
5. Otherwise, creates the reservation and commits the transaction block.

---

## 📁 Project Structure

```
SpotSync/
├── backend/
│   ├── cmd/
│   │   └── main.go                 # App entry point & dependency wiring
│   ├── config/
│   │   └── env.go                  # Configuration and Env variables
│   ├── constants/
│   │   └── constants.go            # Constants (Roles, Statuses, Types)
│   ├── database/
│   │   ├── database.go             # GORM PostgreSQL connection
│   │   └── seed.go                 # Database seed data helper
│   ├── dto/
│   │   ├── auth.go                 # Authentication request/response structs
│   │   ├── parking_zone.go         # Zone requests/responses DTOs
│   │   └── reservation.go          # Reservation DTOs
│   ├── errors/
│   │   └── errors.go               # Unified app error definitions
│   ├── handler/
│   │   ├── auth_handler.go
│   │   ├── parking_zone_handler.go
│   │   └── reservation_handler.go
│   ├── middleware/
│   │   ├── jwt_middleware.go       # Auth token validation
│   │   └── role_middleware.go      # Route role checkers
│   ├── models/
│   │   ├── user.go
│   │   ├── parking_zone.go
│   │   └── reservation.go
│   ├── pkg/
│   │   ├── context.go              # Echo context claim extractors
│   │   ├── jwt.go                  # JWT claim generation and validation
│   │   ├── password.go             # bcrypt hashing (cost 10-12)
│   │   └── request.go              # Bind and validator interface
│   ├── repository/
│   │   ├── interfaces/             # Mock-friendly interface definitions
│   │   ├── auth_repository.go
│   │   ├── parking_zone_repository.go
│   │   └── reservation_repository.go
│   ├── response/
│   │   └── response.go             # Uniform REST responses (success/errors)
│   ├── routes/
│   │   └── routes.go               # Handler routes registrar
│   └── validator/
│       └── validator.go            # Struct validator configuration
└── frontend/
    └── .gitkeep                    # Reserved for frontend
```
