# **CSEA - EMS**

> The Event Management System - Streamline your event planning and management

## Overview

CSEA-EMS is a comprehensive event management system designed to simplify the process of planning, organizing, and managing events. This system provides the tools you need to handle registrations, scheduling, attendee management, and more.

---

## Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)
- Git

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Pravith-Krishna/CSEA-EMS.git
cd CSEA-EMS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Start the development server

```bash
npm run dev
```

---

# Installing using Docker

```bash
docker-compose build
```

```bash
docker-compose up -d
```

---

# DaddyEMS Logging Setup with Grafana + Loki

This project demonstrates logging in a Node.js application using **Winston**, with logs sent to **Grafana Loki** for monitoring and analysis.

- `loki` → Log aggregation system
- `grafana` → Visualization and dashboard UI

To get started with just the logging dashboard, run only Loki and Grafana.

---

## Start Loki and Grafana

```bash
docker-compose up -d loki grafana
```

This will start:

- Loki → http://localhost:3100
- Grafana → http://localhost:3000

### Default Grafana Credentials

- Username: `admin`
- Password: `admin`

---

## Connect Loki to Grafana

1. Open: http://localhost:3000
2. Login using the default credentials
3. Click **Settings** → **Data Sources**
4. Click **Add data source**
5. Select **Loki**
6. Set the URL:

```txt
http://loki:3100
```

7. Click **Save & Test**

You should see:

```txt
Data source is working
```

---

# Viewing Logs

After the backend starts generating logs, you can view them inside Grafana.

## Available Job Labels

| Job Name                    | Description                                            |
| --------------------------- | ------------------------------------------------------ |
| daddy-ems-backend           | Custom application logs using `logger.ts`              |
| daddy-ems-backend-routes    | HTTP request logs using `loggerMiddleware.ts`          |

---

## Sample Queries in Grafana Explore

### General Application Logs

```logql
{job="daddy-ems-backend", app="daddy-ems"}
```

### HTTP Request Logs

```logql
{job="daddy-ems-backend-routes", app="daddy-ems-requests"}
```

---

# TypeScript Setup

This project uses TypeScript for type safety and better developer experience.

---

## TypeScript Configuration

The project includes a pre-configured `tsconfig.json`.

Reference:
https://www.typescriptlang.org/docs/handbook/tsconfig-json.html

---

## Important Note

Install packages in the following format:

```bash
npm install <package_name>
npm install --save-dev @types/<package_name>
```

One package is for runtime execution and the other provides TypeScript type definitions.

---

## Compiling TypeScript

```bash
npm run build
npm run start
```

This compiles TypeScript files into JavaScript inside the `dist/` directory and runs the compiled application.

---

# API Endpoints

After defining routes, add a tick mark in the corresponding row.

---

# Auth Routes

| Endpoint                  | Method | Purpose | Progress |
| ------------------------- | ------ | ------- | -------- |
| /auth/user/login          | POST   | -       | ✅ |
| /auth/user/signup         | POST   | -       | ✅ |
| /auth/user/logout         | POST   | -       | ✅ |
| /auth/user/reset-password | POST   | -       | ✅ |
| /auth/club/login          | POST   | -       | ✅ |
| /auth/club/logout         | POST   | -       | ✅ |
| /auth/global/login        | POST   | -       | ✅ |
| /auth/global/logout       | POST   | -       | ✅ |
| /auth/global/signup       | POST   | -       | ✅ |

---

# Admin Routes

| Endpoint                        | Method | Purpose                               | Progress |
| ------------------------------- | ------ | ------------------------------------- | -------- |
| /admin/create-event             | POST   | Admin creating an event               | ✅ |
| /admin/events-history?club_id=1 | GET    | Fetching past event history           | ✅ |
| /admin/add-members              | POST   | Adding club members                   | ✅ |

---

# Event Routes

| Endpoint                           | Method | Purpose                                                        | Progress |
| ---------------------------------- | ------ | -------------------------------------------------------------- | -------- |
| /event/modify                      | POST   | Admin modifying event details                                  |          |
| /event/stats/:eventId              | GET    | Fetching event statistics                                      |          |
| /event/addPlaceHolders/:eventId    | POST   | Adding winners and runners                                     | ✅ |
| /event/removePlaceHolders/:eventId | POST   | Removing winners and runners                                   | ✅ |
| /event/attendance                  | POST   | Marking attendance                                             | ✅ |
| /event/register                    | POST   | User registration for event                                    | ✅ |
| /event/teamInvite/:eventId         | POST   | Sending team invitations                                       | ✅ |
| /event/acceptTeamInvite/:eventId   | POST   | Accepting team invitations                                     | ✅ |

---

# User Routes

| Endpoint               | Method | Purpose                     | Progress |
| ---------------------- | ------ | --------------------------- | -------- |
| /user/profile          | GET    | Fetching user details       | ✅ |
| /user/registeredEvents | GET    | Fetching registered events  | ✅ |
| /user/membership       | GET    | Fetching membership details | ✅ |
| /user/invitations      | GET    | Fetching invitations        | ✅ |
| /user/feedback         | POST   | Feedback submission         | ✅ |

---

# Global Admin Routes

| Endpoint           | Method | Purpose | Progress |
| ------------------ | ------ | ------- | -------- |
| /global/createclub | POST   | -       | ✅ |
| /global/addadmin   | POST   | -       | ✅ |
