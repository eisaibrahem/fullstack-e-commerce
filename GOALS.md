# E-Commerce Project Goals

## Current Phase: Prisma + PostgreSQL Setup

### Step 1 — Install Prisma
- [x] Install `prisma` (dev dependency) — CLI tool for migrations & schema
- [x] Install `@prisma/client` (dependency) — runtime library for DB queries

### Step 2 — Initialize Prisma
- [x] Run `npx prisma init`
- [x] Creates `prisma/schema.prisma` and `.env`

### Step 3 — Configure Neon Connection
- [x] Set `DATABASE_URL` in `.env` with Neon connection string
- [x] Verify SSL and pooler settings

### Step 4 — Define Schema
- [x] User model: id, email (unique), password, role (default "USER")
- [x] Product model: id, name, price (Decimal 10,2), stock (default 0)

### Step 5 — Migration
- [x] Run `npx prisma migrate dev --name init`
- [x] Verify migration applied to Neon
- [x] Prisma Client auto-generated

### Step 6 — PrismaService
- [x] Create `src/prisma/prisma.service.ts`
- [x] Extends PrismaClient, implements OnModuleInit
- [x] Connects to DB on app startup

### Step 7 — Global PrismaModule
- [x] Create `src/prisma/prisma.module.ts`
- [x] Marked with `@Global()` — available everywhere
- [x] Exports PrismaService

### Step 8 — Wire into AppModule
- [x] Import PrismaModule in AppModule
- [x] PrismaService injectable in any service

### Step 9 — Verify
- [x] App starts without errors
- [x] PrismaService can be injected anywhere

---

## Products Module (Complete)
- [x] CreateProductDto with validation (name required, price positive, stock non-negative)
- [x] UpdateProductDto (PartialType — all fields optional)
- [x] ProductsService using PrismaService (CRUD)
- [x] ProductsController (public endpoints, no auth)
- [x] ProductsModule wired into AppModule
- [x] Build passes

---

## Authentication Module (Complete)
- [x] Register endpoint (POST /auth/register) — hashes password with bcrypt
- [x] Login endpoint (POST /auth/login) — returns JWT access token
- [x] JwtAuthGuard — protects /users routes
- [x] UsersService updated to use PrismaService (real DB)
- [x] UsersController — protected routes with JwtAuthGuard
- [x] JWT_SECRET in .env
- [x] Build passes

---

## Order Module (Complete)
- [x] Order and OrderItem models added to Prisma schema
- [x] Migration applied to Neon
- [x] CreateOrderDto with validation (items array, productId, quantity)
- [x] OrdersService — stock check (all-or-nothing), server-side total, transaction
- [x] User ID from JWT token only (never from body)
- [x] OrdersController — JWT protected, users see only their own orders
- [x] OrdersModule wired into AppModule
- [x] Build passes

---

## Future Phases (Not Started)
- Frontend (Next.js)
