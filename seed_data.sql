-- ====================================================================
-- SHOWTIME CINEMA TICKET BOOKING SYSTEM - SEED DATA
-- ====================================================================

USE showtime_db;

-- 1. USERS (Passwords hashed using SHA-256)
-- Admin: admin@showtime.com / Admin@123
-- Customer: customer@showtime.com / Customer@123
INSERT INTO users (id, full_name, email, phone, password_hash, role) VALUES
(1, 'Showtime Admin', 'admin@showtime.com', '9876543210', 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7', 'ADMIN'),
(2, 'Rahul Sharma', 'customer@showtime.com', '9812345678', '98ec654a8df28f8f0f8f02220483d46916b85017de0b74d8ec755c28cb8539a8', 'CUSTOMER'),
(3, 'Priya Patel', 'priya@example.com', '9823456789', '98ec654a8df28f8f0f8f02220483d46916b85017de0b74d8ec755c28cb8539a8', 'CUSTOMER');

-- 2. SEAT CATEGORIES (Preserving all 6 original classes from Hackathon Unit I)
INSERT INTO seat_categories (id, name, category, base_fare, default_capacity, description) VALUES
(101, 'Front Stall', 'Stall', 120.00, 40, 'Budget-friendly front rows with immersive screen proximity'),
(102, 'Middle Stall', 'Stall', 160.00, 40, 'Balanced center view with acoustic sweet-spot'),
(103, 'Balcony', 'Balcony', 220.00, 30, 'Elevated panoramic perspective with wider row spacing'),
(104, 'Gold Recliner', 'Premium', 350.00, 10, 'Plush motorized push-back recliners with in-seat service'),
(105, 'Couple Sofa', 'Premium', 500.00, 6, 'Comfortable double sofa loungers designed for pairs'),
(106, 'Wheelchair Bay', 'Special', 120.00, 4, 'Accessible spacious bay with ramp ingress and companion seat');

-- 3. CINEMAS
INSERT INTO cinemas (id, name, city, location, screens) VALUES
(1, 'SHOWTIME IMAX & PXL', 'Mumbai', 'Phoenix Palladium, Lower Parel', 6),
(2, 'SHOWTIME Royal Cineplex', 'Bengaluru', 'Forum South City Mall, Kanakapura', 5),
(3, 'SHOWTIME Luxe Cinemas', 'Delhi NCR', 'Ambience Mall, Vasant Kunj', 8);

-- 4. MOVIES
INSERT INTO movies (id, title, description, genre, language, duration_mins, rating, poster_url, backdrop_url, release_date) VALUES
(1, 'Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 'Sci-Fi', 'English', 148, 8.8, 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80', '2010-07-16'),
(2, 'Interstellar', 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers.', 'Sci-Fi', 'English', 169, 8.7, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80', '2014-11-07'),
(3, 'The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.', 'Action', 'English', 152, 9.0, 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&auto=format&fit=crop&q=80', '2008-07-18'),
(4, 'RRR', 'A fearless warrior on a perilous mission comes face to face with a steely cop serving British forces in pre-independent India.', 'Action', 'Telugu', 182, 8.0, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80', '2022-03-25'),
(5, 'Oppenheimer', 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.', 'Drama', 'English', 180, 8.9, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80', '2023-07-21'),
(6, 'Dune: Part Two', 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', 'Sci-Fi', 'English', 166, 8.6, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&auto=format&fit=crop&q=80', '2024-03-01');

-- 5. SHOWS
INSERT INTO shows (id, movie_id, cinema_id, screen_number, show_date, show_time, status) VALUES
(1, 1, 1, 1, CURRENT_DATE(), '10:30:00', 'OPEN'),
(2, 1, 1, 1, CURRENT_DATE(), '14:15:00', 'OPEN'),
(3, 1, 1, 1, CURRENT_DATE(), '18:00:00', 'OPEN'),
(4, 1, 1, 1, CURRENT_DATE(), '21:45:00', 'OPEN'),
(5, 2, 1, 2, CURRENT_DATE(), '11:00:00', 'OPEN'),
(6, 2, 1, 2, CURRENT_DATE(), '16:00:00', 'OPEN'),
(7, 3, 2, 1, CURRENT_DATE(), '13:00:00', 'OPEN'),
(8, 3, 2, 1, CURRENT_DATE(), '19:30:00', 'OPEN'),
(9, 4, 2, 2, CURRENT_DATE(), '15:00:00', 'OPEN'),
(10, 5, 3, 1, CURRENT_DATE(), '17:30:00', 'OPEN'),
(11, 6, 3, 2, CURRENT_DATE(), '20:15:00', 'OPEN');

-- 6. PHYSICAL SEATS IN CINEMA 1 SCREEN 1
-- Front Stall: Rows A, B (10 seats each) -> 20 seats
-- Middle Stall: Rows C, D (10 seats each) -> 20 seats
-- Balcony: Rows E, F (8 seats each) -> 16 seats
-- Gold Recliner: Row G (6 seats) -> 6 seats
-- Couple Sofa: Row H (3 sofas = 6 seats, H1-H2, H3-H4, H5-H6) -> 6 seats
-- Wheelchair Bay: Row W (4 seats, W1-W4) -> 4 seats
INSERT INTO seats (cinema_id, screen_number, category_id, seat_row, seat_col, seat_number) VALUES
-- Front Stall (101)
(1, 1, 101, 'A', 1, 'A1'), (1, 1, 101, 'A', 2, 'A2'), (1, 1, 101, 'A', 3, 'A3'), (1, 1, 101, 'A', 4, 'A4'), (1, 1, 101, 'A', 5, 'A5'),
(1, 1, 101, 'A', 6, 'A6'), (1, 1, 101, 'A', 7, 'A7'), (1, 1, 101, 'A', 8, 'A8'), (1, 1, 101, 'A', 9, 'A9'), (1, 1, 101, 'A', 10, 'A10'),
(1, 1, 101, 'B', 1, 'B1'), (1, 1, 101, 'B', 2, 'B2'), (1, 1, 101, 'B', 3, 'B3'), (1, 1, 101, 'B', 4, 'B4'), (1, 1, 101, 'B', 5, 'B5'),
(1, 1, 101, 'B', 6, 'B6'), (1, 1, 101, 'B', 7, 'B7'), (1, 1, 101, 'B', 8, 'B8'), (1, 1, 101, 'B', 9, 'B9'), (1, 1, 101, 'B', 10, 'B10'),
-- Middle Stall (102)
(1, 1, 102, 'C', 1, 'C1'), (1, 1, 102, 'C', 2, 'C2'), (1, 1, 102, 'C', 3, 'C3'), (1, 1, 102, 'C', 4, 'C4'), (1, 1, 102, 'C', 5, 'C5'),
(1, 1, 102, 'C', 6, 'C6'), (1, 1, 102, 'C', 7, 'C7'), (1, 1, 102, 'C', 8, 'C8'), (1, 1, 102, 'C', 9, 'C9'), (1, 1, 102, 'C', 10, 'C10'),
(1, 1, 102, 'D', 1, 'D1'), (1, 1, 102, 'D', 2, 'D2'), (1, 1, 102, 'D', 3, 'D3'), (1, 1, 102, 'D', 4, 'D4'), (1, 1, 102, 'D', 5, 'D5'),
(1, 1, 102, 'D', 6, 'D6'), (1, 1, 102, 'D', 7, 'D7'), (1, 1, 102, 'D', 8, 'D8'), (1, 1, 102, 'D', 9, 'D9'), (1, 1, 102, 'D', 10, 'D10'),
-- Balcony (103)
(1, 1, 103, 'E', 1, 'E1'), (1, 1, 103, 'E', 2, 'E2'), (1, 1, 103, 'E', 3, 'E3'), (1, 1, 103, 'E', 4, 'E4'), (1, 1, 103, 'E', 5, 'E5'),
(1, 1, 103, 'E', 6, 'E6'), (1, 1, 103, 'E', 7, 'E7'), (1, 1, 103, 'E', 8, 'E8'),
(1, 1, 103, 'F', 1, 'F1'), (1, 1, 103, 'F', 2, 'F2'), (1, 1, 103, 'F', 3, 'F3'), (1, 1, 103, 'F', 4, 'F4'), (1, 1, 103, 'F', 5, 'F5'),
(1, 1, 103, 'F', 6, 'F6'), (1, 1, 103, 'F', 7, 'F7'), (1, 1, 103, 'F', 8, 'F8'),
-- Gold Recliner (104)
(1, 1, 104, 'G', 1, 'G1'), (1, 1, 104, 'G', 2, 'G2'), (1, 1, 104, 'G', 3, 'G3'), (1, 1, 104, 'G', 4, 'G4'), (1, 1, 104, 'G', 5, 'G5'), (1, 1, 104, 'G', 6, 'G6'),
-- Couple Sofa (105)
(1, 1, 105, 'H', 1, 'H1'), (1, 1, 105, 'H', 2, 'H2'), (1, 1, 105, 'H', 3, 'H3'), (1, 1, 105, 'H', 4, 'H4'), (1, 1, 105, 'H', 5, 'H5'), (1, 1, 105, 'H', 6, 'H6'),
-- Wheelchair Bay (106)
(1, 1, 106, 'W', 1, 'W1'), (1, 1, 106, 'W', 2, 'W2'), (1, 1, 106, 'W', 3, 'W3'), (1, 1, 106, 'W', 4, 'W4');

-- 7. INITIAL SHOW SEATS POPULATION FOR SHOW 1 (Inception 10:30 AM)
INSERT INTO show_seats (show_id, seat_id, category_id, seat_number, status)
SELECT 1, s.id, s.category_id, s.seat_number, 'AVAILABLE' FROM seats s WHERE s.cinema_id = 1 AND s.screen_number = 1;

-- Also populate for Show 2 (Inception 14:15)
INSERT INTO show_seats (show_id, seat_id, category_id, seat_number, status)
SELECT 2, s.id, s.category_id, s.seat_number, 'AVAILABLE' FROM seats s WHERE s.cinema_id = 1 AND s.screen_number = 1;

-- 8. SEED FAVORITES
INSERT INTO user_favorites (user_id, movie_id) VALUES
(2, 1), -- Rahul likes Inception
(2, 2); -- Rahul likes Interstellar
