# Asha⁺ Backend

NestJS-powered REST API for the Asha⁺ rural healthcare triage platform.

---

## Tech Stack

- **Node.js / NestJS** – Backend framework
- **TypeScript** – Type-safe server code
- **Prisma** – ORM with SQLite (dev) / PostgreSQL (production-ready)
- **JWT + bcrypt** – Authentication and password hashing
- **class-validator / class-transformer** – DTO input validation
- **Helmet + ThrottlerModule** – Security and rate limiting

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and set values:

```bash
copy .env.example .env
```

Default `.env` for local SQLite development:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="change_this_secret"
JWT_EXPIRES_IN="1d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

For PostgreSQL production, see `.env.example.postgres`.

### 3. Push database schema

```bash
npx prisma db push
```

### 4. Seed demo data

```bash
npx prisma db seed
```

### 5. Start development server

```bash
npm run start:dev
```

Server will be available at: `http://localhost:3000`

---

## Demo Credentials

| Role   | Email                   | Password    |
|--------|-------------------------|-------------|
| Admin  | admin@asha.demo         | password123 |
| Doctor | doctor@asha.demo        | password123 |
| ASHA   | asha@asha.demo          | password123 |
| ASHA 2 | asha2@asha.demo         | password123 |
| ASHA 3 | asha3@asha.demo         | password123 |

---

## API Base URL

```
http://localhost:3000
```

---

## Endpoint List

### Auth
| Method | Endpoint     | Access  | Description             |
|--------|--------------|---------|-------------------------|
| POST   | /auth/login  | Public  | Login and receive JWT   |
| GET    | /auth/me     | Any     | Get current user info   |
| POST   | /auth/logout | Any     | Logout (invalidate UI)  |

### Users
| Method | Endpoint            | Access | Description             |
|--------|---------------------|--------|-------------------------|
| GET    | /users              | ADMIN  | List users with filters |
| POST   | /users              | ADMIN  | Create new user         |
| GET    | /users/:id          | ADMIN  | Get user by ID          |
| PATCH  | /users/:id          | ADMIN  | Update user details     |
| PATCH  | /users/:id/active   | ADMIN  | Toggle active status    |

### PHCs
| Method | Endpoint    | Access | Description          |
|--------|-------------|--------|----------------------|
| GET    | /phcs       | ADMIN  | List all PHCs        |
| POST   | /phcs       | ADMIN  | Create new PHC       |
| GET    | /phcs/:id   | ADMIN  | Get PHC by ID        |
| PATCH  | /phcs/:id   | ADMIN  | Update PHC           |

### Patients
| Method | Endpoint        | Access         | Description              |
|--------|-----------------|----------------|--------------------------|
| GET    | /patients       | ADMIN, DOCTOR  | List patients            |
| POST   | /patients       | ADMIN, DOCTOR  | Register patient         |
| GET    | /patients/:id   | ADMIN, DOCTOR  | Get patient by ID        |
| PATCH  | /patients/:id   | ADMIN, DOCTOR  | Update patient           |

### Screenings
| Method | Endpoint                    | Access              | Description              |
|--------|-----------------------------|---------------------|--------------------------|
| GET    | /screenings                 | ADMIN, DOCTOR       | List screenings          |
| POST   | /screenings                 | ADMIN, DOCTOR, ASHA | Create screening         |
| GET    | /screenings/:id             | ADMIN, DOCTOR, ASHA | Get screening by ID      |
| PATCH  | /screenings/:id/status      | DOCTOR              | Update screening status  |

### Follow-Ups
| Method | Endpoint                         | Access         | Description              |
|--------|----------------------------------|----------------|--------------------------|
| GET    | /followups                       | All roles      | List follow-ups          |
| POST   | /screenings/:id/followup         | DOCTOR         | Create follow-up         |
| PATCH  | /followups/:id/status            | ADMIN, ASHA    | Update follow-up status  |

### Stats
| Method | Endpoint        | Access | Description              |
|--------|-----------------|--------|--------------------------|
| GET    | /stats/doctor   | DOCTOR | Doctor PHC stats         |
| GET    | /stats/admin    | ADMIN  | Admin overview stats     |
| GET    | /stats/system   | ADMIN  | System status            |

---

## Frontend Integration Notes

The frontend (`../Frontend`) connects to this backend via:

- **Base URL**: `http://localhost:3000` (from `VITE_API_BASE_URL` env var)
- **Token storage**: `asha_plus_token` and `asha_plus_user` in `localStorage`
- **Auth header**: `Authorization: Bearer <token>` on all protected requests
- **Screenings API** maps to patient triage view in the Doctor Dashboard
- **Status mapping**: Backend `NEW` → Frontend displays as `pending`; `FOLLOW_UP` and `RESOLVED` pass through

Start the frontend dev server separately:

```bash
cd ../Frontend
npm install
npm run dev
```

---

## Build

```bash
npm run build
```

---

## Known Limitations

- SQLite is used for development. Enums are stored as `String` fields due to SQLite connector limitations with Prisma native enum types.
- `riskReasons` is stored as a JSON-stringified string in SQLite (automatically parsed to array in API responses).
- For production use, switch to PostgreSQL and the `.env.example.postgres` template — migration to proper Prisma enums and Json type will be seamless.
- Token refresh is not implemented (tokens expire after `JWT_EXPIRES_IN`, default `1d`).
- Image/file upload endpoints are scaffolded but not functionally implemented in this version.
