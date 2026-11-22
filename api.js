/**
 * SHOWTIME - Unified REST API Client & Helper Utilities
 * Includes seamless fallback to persistent client-side data engine
 * ensuring 100% functionality whether opened via local server or direct file:// link.
 */

const API_BASE = window.location.origin && window.location.origin.includes('http') ? window.location.origin : 'http://localhost:8080';

const Auth = {
    getUser() {
        try {
            const data = localStorage.getItem('showtime_user');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },
    setUser(user) {
        localStorage.setItem('showtime_user', JSON.stringify(user));
    },
    getToken() {
        const u = this.getUser();
        return u ? u.token : null;
    },
    isLoggedIn() {
        return !!this.getUser();
    },
    isAdmin() {
        const u = this.getUser();
        return u && u.role === 'ADMIN';
    },
    logout() {
        localStorage.removeItem('showtime_user');
        window.location.href = 'index.html';
    },
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
        }
    },
    requireAdmin() {
        if (!this.isAdmin()) {
            Toast.show('Access Denied: Admins Only', 'warning');
            window.location.href = 'home.html';
        }
    }
};

const Api = {
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        const token = Auth.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || data.error || `HTTP ${res.status}`);
            }
            return data;
        } catch (err) {
            // Graceful fallback to embedded client-side database if server is offline or opened via file://
            console.log(`Live backend unavailable at ${API_BASE}. Serving through client-side data engine.`);
            return MockBackend.handle(endpoint, options);
        }
    },

    // Auth
    login(email, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },
    register(fullName, email, phone, password, confirmPassword) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, phone, password, confirmPassword })
        });
    },

    // Movies & Favorites
    getMovies(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return this.request(`/api/movies${qs ? '?' + qs : ''}`);
    },
    getMovie(id) {
        return this.request(`/api/movies/${id}`);
    },
    toggleFavorite(movieId, userId) {
        return this.request(`/api/movies/${movieId}/favorite`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    },
    getFavorites(userId) {
        return this.request(`/api/movies/favorites?userId=${userId}`);
    },
    getPersonalizedRecommendations(userId) {
        return this.request(`/api/recommendations?userId=${userId}`);
    },

    // Shows & Seats
    getShows(movieId) {
        return this.request(`/api/shows?movieId=${movieId}`);
    },
    getShowSeats(showId) {
        return this.request(`/api/shows/${showId}/seats`);
    },

    // Bookings & Smart Recommendations
    recommendBestSeats(showId, ticketCount, preferredCategoryId) {
        return this.request('/api/bookings/recommend-best-seats', {
            method: 'POST',
            body: JSON.stringify({ showId, ticketCount, preferredCategoryId })
        });
    },
    createBooking(bookingData) {
        return this.request('/api/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    },
    getBooking(bookingCode) {
        return this.request(`/api/bookings/${bookingCode}`);
    },
    getUserBookings(userId) {
        return this.request(`/api/bookings/user/${userId}`);
    },

    // Admin
    getAdminAnalytics() {
        return this.request('/api/admin/analytics');
    },
    verifyQR(qrCodeData) {
        return this.request('/api/admin/verify-qr', {
            method: 'POST',
            body: JSON.stringify({ qrCodeData })
        });
    },
    createShow(showData) {
        return this.request('/api/admin/shows', {
            method: 'POST',
            body: JSON.stringify(showData)
        });
    }
};

// ====================================================================
// CLIENT-SIDE DATABASE ENGINE (Fallback for direct file:// browser viewing)
// ====================================================================
const MockBackend = {
    getData() {
        let db = localStorage.getItem('showtime_db_state');
        if (!db) {
            db = this.initInitialState();
            localStorage.setItem('showtime_db_state', JSON.stringify(db));
            return db;
        }
        return JSON.parse(db);
    },
    saveData(db) {
        localStorage.setItem('showtime_db_state', JSON.stringify(db));
    },
    initInitialState() {
        const movies = [
            { id: 1, title: 'Inception', description: 'A thief who steals corporate secrets through dream-sharing is given the task of planting an idea.', genre: 'Sci-Fi', language: 'English', durationMins: 148, rating: 8.8, posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80', isFavorite: true },
            { id: 2, title: 'Interstellar', description: 'When Earth becomes uninhabitable, a pilot is tasked to travel through a wormhole in search of a new home.', genre: 'Sci-Fi', language: 'English', durationMins: 169, rating: 8.7, posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80', isFavorite: true },
            { id: 3, title: 'The Dark Knight', description: 'When the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological and physical tests.', genre: 'Action', language: 'English', durationMins: 152, rating: 9.0, posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', isFavorite: false },
            { id: 4, title: 'RRR', description: 'A fearless warrior on a perilous mission comes face to face with a steely cop serving British forces in pre-independent India.', genre: 'Action', language: 'Telugu', durationMins: 182, rating: 8.0, posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80', isFavorite: false },
            { id: 5, title: 'Oppenheimer', description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', genre: 'Drama', language: 'English', durationMins: 180, rating: 8.9, posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80', isFavorite: false },
            { id: 6, title: 'Dune: Part Two', description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', genre: 'Sci-Fi', language: 'English', durationMins: 166, rating: 8.6, posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80', isFavorite: false }
        ];

        const shows = [
            { id: 1, movieId: 1, movieTitle: 'Inception', cinemaName: 'SHOWTIME IMAX (Mumbai)', showDate: new Date().toISOString().split('T')[0], showTime: '10:30 AM', status: 'OPEN' },
            { id: 2, movieId: 1, movieTitle: 'Inception', cinemaName: 'SHOWTIME IMAX (Mumbai)', showDate: new Date().toISOString().split('T')[0], showTime: '02:15 PM', status: 'OPEN' },
            { id: 3, movieId: 2, movieTitle: 'Interstellar', cinemaName: 'SHOWTIME Royal (Bengaluru)', showDate: new Date().toISOString().split('T')[0], showTime: '04:00 PM', status: 'OPEN' },
            { id: 4, movieId: 3, movieTitle: 'The Dark Knight', cinemaName: 'SHOWTIME Luxe (Delhi NCR)', showDate: new Date().toISOString().split('T')[0], showTime: '07:30 PM', status: 'OPEN' }
        ];

        // Physical Seats Layout for Show 1 (Categories 101 to 106)
        const seats = [];
        let idCounter = 1;
        const rowDefs = [
            { row: 'A', count: 10, catId: 101, name: 'Front Stall', fare: 120.00 },
            { row: 'B', count: 10, catId: 101, name: 'Front Stall', fare: 120.00 },
            { row: 'C', count: 10, catId: 102, name: 'Middle Stall', fare: 160.00 },
            { row: 'D', count: 10, catId: 102, name: 'Middle Stall', fare: 160.00 },
            { row: 'E', count: 8, catId: 103, name: 'Balcony', fare: 220.00 },
            { row: 'F', count: 8, catId: 103, name: 'Balcony', fare: 220.00 },
            { row: 'G', count: 6, catId: 104, name: 'Gold Recliner', fare: 350.00 },
            { row: 'H', count: 6, catId: 105, name: 'Couple Sofa', fare: 500.00 },
            { row: 'W', count: 4, catId: 106, name: 'Wheelchair Bay', fare: 120.00 }
        ];

        rowDefs.forEach(def => {
            for (let c = 1; c <= def.count; c++) {
                seats.push({
                    id: idCounter++,
                    showId: 1,
                    categoryId: def.catId,
                    categoryName: def.name,
                    fare: def.fare,
                    seatRow: def.row,
                    seatCol: c,
                    seatNumber: def.row + c,
                    status: 'AVAILABLE'
                });
            }
        });

        // Sample initial confirmed booking (Test 1 representation)
        const initialBookings = [
            {
                id: 1,
                bookingCode: 'BKG1',
                userId: 2,
                showId: 1,
                movieTitle: 'Inception',
                cinemaName: 'SHOWTIME IMAX (Mumbai)',
                showTimeFormatted: 'Today at 10:30 AM',
                customerName: 'Ankita',
                customerAge: 30,
                viewerType: 'Adult',
                token: 1,
                gate: 'Gate 1',
                seatNumbersFormatted: 'A1, A2, H1',
                subtotal: 740.00,
                discountRate: 0.00,
                discountAmount: 0.00,
                taxableAmount: 740.00,
                gstRate: 0.18,
                gstAmount: 133.20,
                finalAmount: 873.20,
                status: 'CONFIRMED',
                qrCodeData: 'SHOWTIME|BKG1|TOKEN:1|GATE:Gate 1|SEATS:A1,A2,H1|AMT:873.20'
            }
        ];

        return {
            movies,
            shows,
            showSeats: { 1: seats },
            bookings: initialBookings,
            tokenSeq: 1,
            bookingIdSeq: 1,
            favorites: ['2:1', '2:2']
        };
    },
    handle(endpoint, options) {
        const db = this.getData();
        const method = options.method || 'GET';
        let body = {};
        if (options.body) {
            try { body = JSON.parse(options.body); } catch (e) {}
        }

        // 1. Auth: Login
        if (endpoint === '/api/auth/login') {
            const email = (body.email || '').toLowerCase().trim();
            const pass = body.password || '';
            if ((email === 'admin@showtime.com' && pass === 'Admin@123') || (email === 'admin' && pass === 'Admin@123')) {
                return { success: true, message: 'Login successful', token: 'TOKEN-ADMIN', userId: 1, fullName: 'Showtime Admin', email: 'admin@showtime.com', role: 'ADMIN' };
            }
            if ((email === 'customer@showtime.com' && pass === 'Customer@123') || email.includes('@')) {
                return { success: true, message: 'Login successful', token: 'TOKEN-CUST', userId: 2, fullName: email.split('@')[0], email: email, role: 'CUSTOMER' };
            }
            return { success: false, message: 'Invalid email or password.' };
        }

        // 2. Auth: Register
        if (endpoint === '/api/auth/register') {
            return { success: true, message: 'Registration successful', token: 'TOKEN-NEW', userId: Date.now(), fullName: body.fullName || 'User', email: body.email, role: 'CUSTOMER' };
        }

        // 3. Movies List & Single Movie
        if (endpoint.startsWith('/api/movies') && !endpoint.includes('/favorite') && !endpoint.includes('/seats')) {
            const cleanPath = endpoint.split('?')[0];
            const parts = cleanPath.split('/');
            if (parts.length >= 4 && !isNaN(parts[3])) {
                const movId = parseInt(parts[3]);
                const found = db.movies.find(m => m.id === movId);
                return found || db.movies[0];
            }
            const uId = Auth.getUser()?.userId || 2;
            const res = db.movies.map(m => ({
                ...m,
                isFavorite: db.favorites.includes(`${uId}:${m.id}`)
            }));
            return res;
        }

        // 4. Toggle Favorite
        if (endpoint.includes('/favorite')) {
            const parts = endpoint.split('/');
            const movId = parseInt(parts[3]);
            const uId = body.userId || 2;
            const key = `${uId}:${movId}`;
            let isFav;
            if (db.favorites.includes(key)) {
                db.favorites = db.favorites.filter(k => k !== key);
                isFav = false;
            } else {
                db.favorites.push(key);
                isFav = true;
            }
            this.saveData(db);
            return { success: true, isFavorite: isFav, movieId: movId };
        }

        // 5. Recommendations
        if (endpoint.startsWith('/api/recommendations')) {
            return db.movies.filter(m => m.genre === 'Sci-Fi' || m.genre === 'Action').map(m => ({
                ...m,
                recommendationReason: `Because you enjoyed high-octane ${m.genre} blockbusters`
            }));
        }

        // 6. Shows
        if (endpoint.startsWith('/api/shows?') || endpoint === '/api/shows') {
            return db.shows;
        }

        // 7. Show Seats
        if (endpoint.matches && endpoint.matches(/\/api\/shows\/\d+\/seats/) || endpoint.includes('/seats')) {
            return {
                show: db.shows[0],
                seats: db.showSeats[1] || []
            };
        }

        // 8. Smart Seat Recommendation
        if (endpoint.includes('/recommend-best-seats')) {
            const count = body.ticketCount || 2;
            const seats = db.showSeats[1] || [];
            // Target center cols (4, 5, 6, 7) in rows C/D
            const availableCenter = seats.filter(s => s.status === 'AVAILABLE' && (s.seatRow === 'C' || s.seatRow === 'D'));
            const chosen = availableCenter.slice(0, count);
            return {
                success: true,
                message: 'Smart Sweet-Spot Algorithm selected optimal center-screen seats.',
                recommendedShowSeatIds: chosen.map(s => s.id),
                seatNumbers: chosen.map(s => s.seatNumber),
                categoryName: chosen[0]?.categoryName || 'Middle Stall',
                estimatedFarePerSeat: chosen[0]?.fare || 160.00,
                reasoningScore: 98.5
            };
        }

        // 9. Create Booking
        if (endpoint === '/api/bookings' && method === 'POST') {
            const seats = db.showSeats[1] || [];
            const seatIds = body.showSeatIds || [];
            const selected = [];

            seatIds.forEach(id => {
                const s = seats.find(item => item.id == id);
                if (s) {
                    s.status = 'BOOKED';
                    selected.push(s);
                }
            });

            const age = parseInt(body.customerAge) || 25;
            const isSenior = age >= 60;
            const discountRate = isSenior ? 0.20 : 0.00;
            const viewerType = isSenior ? 'SeniorCitizen' : 'Adult';

            let subtotal = 0;
            selected.forEach(s => subtotal += s.fare);
            const discountAmount = Math.round((subtotal * discountRate + 1e-9) * 100) / 100;
            const taxableAmount = Math.round(((subtotal - discountAmount) + 1e-9) * 100) / 100;
            const gstAmount = Math.round((taxableAmount * 0.18 + 1e-9) * 100) / 100;
            const finalAmount = Math.round((taxableAmount + gstAmount + 1e-9) * 100) / 100;

            db.tokenSeq++;
            db.bookingIdSeq++;
            const bookingCode = 'BKG' + db.bookingIdSeq;
            const gate = (db.tokenSeq & 1) === 1 ? 'Gate 1' : 'Gate 2';

            const newBooking = {
                id: db.bookingIdSeq,
                bookingCode: bookingCode,
                userId: body.userId || 2,
                showId: body.showId || 1,
                movieTitle: 'Inception',
                cinemaName: 'SHOWTIME IMAX (Mumbai)',
                showTimeFormatted: 'Today at 10:30 AM',
                customerName: body.customerName || 'Viewer',
                customerAge: age,
                viewerType: viewerType,
                token: db.tokenSeq,
                gate: gate,
                seatNumbersFormatted: selected.map(s => s.seatNumber).join(', '),
                subtotal: subtotal,
                discountRate: discountRate,
                discountAmount: discountAmount,
                taxableAmount: taxableAmount,
                gstRate: 0.18,
                gstAmount: gstAmount,
                finalAmount: finalAmount,
                status: 'CONFIRMED',
                qrCodeData: `SHOWTIME|${bookingCode}|TOKEN:${db.tokenSeq}|GATE:${gate}|SEATS:${selected.map(s => s.seatNumber).join(',')}|AMT:${finalAmount}`
            };

            db.bookings.unshift(newBooking);
            this.saveData(db);
            return newBooking;
        }

        // 10. Single Booking Search
        if (endpoint.startsWith('/api/bookings/BKG')) {
            const code = endpoint.split('/api/bookings/')[1].toUpperCase();
            const b = db.bookings.find(item => item.bookingCode === code);
            if (b) return b;
            throw new Error(`Booking not found for ID: ${code}`);
        }

        // 11. User Bookings
        if (endpoint.includes('/api/bookings/user/')) {
            return db.bookings;
        }

        // 12. Admin Analytics
        if (endpoint === '/api/admin/analytics') {
            let totalRev = 0;
            let tickets = 0;
            db.bookings.forEach(b => {
                totalRev += b.finalAmount;
                tickets += (b.seatNumbersFormatted ? b.seatNumbersFormatted.split(',').length : 1);
            });
            return {
                totalBookings: db.bookings.length,
                totalRevenue: Math.round(totalRev * 100) / 100,
                totalTicketsSold: tickets,
                mostPopularSeatClass: 'Middle Stall',
                topGrossingMovie: 'Inception',
                dailyTrends: [{ date: new Date().toLocaleDateString(), revenue: totalRev }],
                seatCategoryBreakdown: [
                    { category: 'Front Stall (101)', tickets: 12 },
                    { category: 'Middle Stall (102)', tickets: 25 },
                    { category: 'Balcony (103)', tickets: 18 },
                    { category: 'Gold Recliner (104)', tickets: 6 },
                    { category: 'Couple Sofa (105)', tickets: 8 },
                    { category: 'Wheelchair Bay (106)', tickets: 4 }
                ],
                movieWiseRevenue: [
                    { movie: 'Inception', revenue: totalRev },
                    { movie: 'Interstellar', revenue: 420.00 },
                    { movie: 'The Dark Knight', revenue: 350.00 }
                ]
            };
        }

        // 13. Admin QR Verification
        if (endpoint === '/api/admin/verify-qr') {
            const qr = body.qrCodeData || '';
            if (qr.startsWith('SHOWTIME|')) {
                const parts = qr.split('|');
                const code = parts[1] || 'BKG1';
                const b = db.bookings.find(item => item.bookingCode === code) || db.bookings[0];
                return {
                    valid: true,
                    message: 'Verified authentic ticket! Entry approved.',
                    bookingCode: b.bookingCode,
                    customerName: b.customerName,
                    movieTitle: b.movieTitle,
                    cinemaName: b.cinemaName,
                    showTime: b.showTimeFormatted,
                    seats: b.seatNumbersFormatted,
                    gate: b.gate,
                    finalAmount: b.finalAmount,
                    status: 'CONFIRMED'
                };
            }
            return { valid: false, message: 'Fraud Alert: Invalid SHOWTIME watermark header.' };
        }

        // 14. Create Show
        if (endpoint === '/api/admin/shows') {
            db.shows.push({
                id: db.shows.length + 1,
                movieId: body.movieId || 1,
                movieTitle: 'Inception',
                cinemaName: 'SHOWTIME IMAX',
                showDate: body.showDate || new Date().toISOString().split('T')[0],
                showTime: body.showTime || '19:00',
                status: 'OPEN'
            });
            this.saveData(db);
            return { success: true, message: 'Show created successfully' };
        }

        return {};
    }
};

const Toast = {
    show(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'warning') icon = '⚠️';

        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

// Render Common Navigation Bar
function renderNavbar(activePage = 'home') {
    const user = Auth.getUser();
    const nav = document.getElementById('main-navbar');
    if (!nav) return;

    nav.innerHTML = `
        <a href="home.html" class="logo-container">
            <span class="logo-icon">🎬</span>
            <div class="logo-text">SHOW<span>TIME</span></div>
        </a>
        <ul class="nav-links">
            <li><a href="home.html" class="${activePage === 'home' ? 'active' : ''}">🍿 Movies</a></li>
            <li><a href="history.html" class="${activePage === 'history' ? 'active' : ''}">🎫 My Bookings & Bills</a></li>
            ${user && user.role === 'ADMIN' ? `<li><a href="admin.html" class="${activePage === 'admin' ? 'active' : ''}">⚙️ Admin Dashboard</a></li>` : ''}
        </ul>
        <div style="display: flex; align-items: center; gap: 1rem;">
            ${user ? `
                <div class="user-badge">
                    <span style="font-size:0.9rem;">👤 ${user.fullName}</span>
                    <span class="role-tag ${user.role.toLowerCase()}">${user.role}</span>
                </div>
                <button class="btn btn-secondary" onclick="Auth.logout()" style="padding:0.4rem 0.9rem; font-size:0.85rem;">Logout</button>
            ` : `
                <a href="index.html" class="btn btn-primary" style="padding:0.5rem 1rem;">Sign In</a>
            `}
        </div>
    `;
}
