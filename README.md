# SHOWTIME – CINEMA TICKET BOOKING SYSTEM
## Full-Stack Web Platform

---

## 1. System Overview
SHOWTIME is an enterprise-grade cinema ticket booking platform built as an evolution of the Java Hackathon console application. It retains all core business logic (seat classes 101–106, Adult/Senior discounts, 18% GST, odd/even gate allocation) while introducing modern web capabilities:
- **Authentication:** First landing page with Login / Registration, show/hide password, and role-based routing (`CUSTOMER` vs `ADMIN`).
- **Interactive Seat Picker:** Visual auditorium matrix supporting categories 101 to 106.
- **ACID Concurrency Protection:** Zero double-bookings through atomic transactional locks.
- **10-Mark Innovation Features:** Smart Seat Recommendations, ❤️ Movie Likes/Favorites, Personalized Recommendations, QR Digital Tickets with Live Admin Verification, and Real-Time Admin Analytics.

---

## 2. Directory Structure

```
SHOWTIME/
│
├── Original_Java_Project/          <-- Original Hackathon Console Source (100% UNMODIFIED)
│   ├── src/showtime/
│   ├── README.txt
│   ├── AI_LOG.txt
│   ├── TEST_RESULTS.txt
│   └── run.bat / run.sh
│
├── Showtime_Website/               <-- Modern Full-Stack Production System
│   ├── backend/
│   │   ├── src/main/java/com/showtime/
│   │   │   ├── config/             <-- Security & Application configs
│   │   │   ├── controller/         <-- REST API Controllers
│   │   │   ├── dto/                <-- Request/Response Data Transfer Objects
│   │   │   ├── entity/             <-- Entities mapping to MySQL tables
│   │   │   ├── repository/         <-- Spring Data Repositories
│   │   │   ├── service/            <-- Pricing, business logic, concurrency
│   │   │   └── server/             <-- ShowtimeServer & BackendIntegrationTest
│   │   ├── pom.xml                 <-- Maven Spring Boot 3 configuration
│   │   └── run_backend.bat         <-- 1-Click Server Starter
│   │
│   ├── frontend/
│   │   ├── css/style.css           <-- Cinema dark theme & ticket print styles
│   │   ├── js/                     <-- REST client, auth, booking, QR, admin
│   │   ├── index.html              <-- First Page: Login & Sign Up
│   │   ├── home.html               <-- Movie catalog, search, favorites
│   │   ├── booking.html            <-- Interactive seat chart & smart recommendation
│   │   ├── confirmation.html       <-- Digital QR ticket, invoice & download
│   │   ├── history.html            <-- Booking history & bill search
│   │   └── admin.html              <-- Analytics dashboard & QR verifier
│   │
│   ├── database/
│   │   ├── schema.sql              <-- MySQL 8.0+ schema (11 tables, constraints)
│   │   └── seed_data.sql           <-- Pre-loaded movies, shows, cinemas, seats
│   │
│   ├── run_backend.bat             <-- Root convenience starter
│   └── README.md
│
├── AI_LOG.txt                      <-- Complete AI interaction and debugging history
│
└── Innovation_Documentation/
    ├── INNOVATION_GUIDE.md         <-- Detailed guide for 10 Innovation Marks
    ├── JUDGES_PITCH.md             <-- 2-Minute hackathon presentation pitch
    ├── VIVA_PREPARATION.md         <-- Oral examination guide for all 4 team members
    └── FEATURE_CHECKLIST.md        <-- Functionality checklist with test results
```

---

## 3. How to Run the Website

### Option A: One-Click Execution (Instant Start - Recommended)
The backend comes with an embedded, zero-dependency Java 21 REST server that compiles and starts without requiring Maven:

1. Double-click or run:
   ```cmd
   cd SHOWTIME\Showtime_Website\backend
   run_backend.bat
   ```
2. The server starts on **`http://localhost:8080/`**.
3. Open **`http://localhost:8080/`** (or open `frontend/index.html`) in any browser.

### Option B: Spring Boot Maven Build
If you have Apache Maven installed:
```cmd
cd SHOWTIME\Showtime_Website\backend
mvn clean spring-boot:run
```

---

## 4. MySQL Database Setup

1. Open your MySQL client (MySQL Workbench, phpMyAdmin, or MySQL CLI).
2. Execute the schema script:
   ```sql
   source SHOWTIME/Showtime_Website/database/schema.sql;
   ```
3. Execute the seed data script:
   ```sql
   source SHOWTIME/Showtime_Website/database/seed_data.sql;
   ```

---

## 5. Quick Test Credentials

| Role | Email | Password | Target Page Upon Login |
|---|---|---|---|
| **Customer** | `customer@showtime.com` | `Customer@123` | Movie Homepage (`home.html`) |
| **Admin** | `admin@showtime.com` | `Admin@123` | Admin Dashboard (`admin.html`) |

*(On `index.html`, you can also click the sample credential tags to auto-fill these fields instantly.)*

---

## 6. Running Automated Tests

### 1. Website Backend Test Suite (32 Checks):
```cmd
cd SHOWTIME\Showtime_Website\backend
javac --release 21 -d bin src/main/java/com/showtime/entity/*.java src/main/java/com/showtime/dto/*.java src/main/java/com/showtime/server/*.java
java -cp bin com.showtime.server.BackendIntegrationTest
```

### 2. Original Java Console Hackathon Tests (13 Checks):
```cmd
cd SHOWTIME\Original_Java_Project
run.bat
```
*(Or run `java -cp out showtime.IntegrationTests`)*
