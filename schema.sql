-- ====================================================================
-- SHOWTIME CINEMA TICKET BOOKING SYSTEM - DATABASE SCHEMA
-- Target Database: MySQL 8.0+
-- Concurrency: ACID Transactions with Row Locking & Optimistic Concurrency
-- ====================================================================

DROP DATABASE IF EXISTS showtime_db;
CREATE DATABASE showtime_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE showtime_db;

-- --------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION
-- --------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 2. MOVIES
-- --------------------------------------------------------------------
CREATE TABLE movies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    genre VARCHAR(50) NOT NULL,
    language VARCHAR(50) NOT NULL,
    duration_mins INT NOT NULL,
    rating DECIMAL(3,1) DEFAULT 8.0,
    poster_url VARCHAR(255) NOT NULL,
    backdrop_url VARCHAR(255),
    release_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_movie_genre (genre),
    INDEX idx_movie_active (is_active)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 3. CINEMAS
-- --------------------------------------------------------------------
CREATE TABLE cinemas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    screens INT DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 4. SEAT CATEGORIES (Preserving Original Java Seat Classes: 101 to 106)
-- --------------------------------------------------------------------
CREATE TABLE seat_categories (
    id INT PRIMARY KEY, -- 101, 102, 103, 104, 105, 106
    name VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    base_fare DECIMAL(8,2) NOT NULL,
    default_capacity INT NOT NULL,
    description VARCHAR(200)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 5. SHOWS / SCHEDULES
-- --------------------------------------------------------------------
CREATE TABLE shows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    cinema_id BIGINT NOT NULL,
    screen_number INT NOT NULL DEFAULT 1,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    status ENUM('UPCOMING', 'OPEN', 'HOUSEFULL', 'CANCELLED', 'COMPLETED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE,
    INDEX idx_show_datetime (show_date, show_time),
    INDEX idx_show_movie (movie_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 6. PHYSICAL SEATS IN SCREEN
-- --------------------------------------------------------------------
CREATE TABLE seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cinema_id BIGINT NOT NULL,
    screen_number INT NOT NULL,
    category_id INT NOT NULL,
    seat_row VARCHAR(5) NOT NULL,
    seat_col INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES seat_categories(id),
    UNIQUE KEY uk_screen_seat (cinema_id, screen_number, seat_number),
    INDEX idx_seat_category (category_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 7. SHOW-SPECIFIC SEAT AVAILABILITY (Concurrency & Lock Boundary)
-- --------------------------------------------------------------------
CREATE TABLE show_seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    show_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    category_id INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    status ENUM('AVAILABLE', 'LOCKED', 'BOOKED') NOT NULL DEFAULT 'AVAILABLE',
    version INT NOT NULL DEFAULT 0, -- For optimistic concurrency check
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES seat_categories(id),
    UNIQUE KEY uk_show_seat (show_id, seat_id),
    INDEX idx_show_status (show_id, status)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 8. BOOKINGS (Master Ticket Record)
-- --------------------------------------------------------------------
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(30) NOT NULL UNIQUE, -- e.g. BKG1, BKG2...
    user_id BIGINT NOT NULL,
    show_id BIGINT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_age INT NOT NULL,
    viewer_type ENUM('Adult', 'SeniorCitizen') NOT NULL,
    token INT NOT NULL,
    gate VARCHAR(20) NOT NULL, -- Gate 1 (odd token), Gate 2 (even token)
    seat_count INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    taxable_amount DECIMAL(10,2) NOT NULL,
    gst_rate DECIMAL(5,2) NOT NULL DEFAULT 0.18,
    gst_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    qr_code_hash VARCHAR(255) NOT NULL,
    status ENUM('CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (show_id) REFERENCES shows(id),
    INDEX idx_booking_user (user_id),
    INDEX idx_booking_date (created_at),
    INDEX idx_booking_code (booking_code)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 9. BOOKING ITEMS (Individual Seats Reserved per Booking)
-- --------------------------------------------------------------------
CREATE TABLE booking_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    category_id INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    fare DECIMAL(8,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id),
    FOREIGN KEY (category_id) REFERENCES seat_categories(id),
    INDEX idx_item_booking (booking_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 10. PAYMENTS
-- --------------------------------------------------------------------
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'CARD/UPI',
    transaction_ref VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'SUCCESS',
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 11. USER FAVORITES (Innovation Feature #2 ❤️)
-- --------------------------------------------------------------------
CREATE TABLE user_favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_movie_fav (user_id, movie_id)
) ENGINE=InnoDB;
