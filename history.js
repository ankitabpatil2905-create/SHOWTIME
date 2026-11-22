/**
 * SHOWTIME - Booking History & Bill Search Controller
 */

let userBookings = [];

document.addEventListener('DOMContentLoaded', () => {
    Auth.requireAuth();
    renderNavbar('history');
    setupBillSearch();
    loadUserBookings();
});

async function loadUserBookings() {
    const list = document.getElementById('bookings-list');
    if (!list) return;

    const user = Auth.getUser();
    list.innerHTML = '<div style="text-align:center; padding:3rem;">Loading booking history...</div>';

    try {
        userBookings = await Api.getUserBookings(user.userId);
        renderBookingsList(userBookings);
    } catch (err) {
        list.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--accent-red);">Failed to load bookings: ${err.message}</div>`;
    }
}

function renderBookingsList(bookings) {
    const list = document.getElementById('bookings-list');
    if (!list) return;

    if (!bookings || bookings.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding:4rem 1rem; background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-color);">
                <div style="font-size:3rem; margin-bottom:1rem;">🎟️</div>
                <h3>No Bookings Yet</h3>
                <p style="color:var(--text-muted); margin-top:0.5rem; margin-bottom:1.5rem;">You haven't booked any cinema tickets yet.</p>
                <a href="home.html" class="btn btn-primary">Browse Current Movies</a>
            </div>
        `;
        return;
    }

    list.innerHTML = bookings.map(b => `
        <div class="stat-card" style="margin-bottom:1.2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div style="display:flex; align-items:center; gap:1.2rem;">
                <div class="stat-icon" style="background:rgba(255,215,0,0.15); color:var(--accent-gold);">
                    🎟️
                </div>
                <div>
                    <div style="font-size:0.85rem; color:var(--accent-gold); font-weight:700;">${b.bookingCode} • ${b.gate}</div>
                    <div style="font-size:1.2rem; font-weight:700; color:white;">${b.movieTitle}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">
                        🕒 ${b.showTimeFormatted} | 💺 Seats: <strong style="color:white;">${b.seatNumbersFormatted}</strong>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.2rem;">
                        👤 ${b.customerName} (${b.viewerType}) • Paid: <strong>₹${b.finalAmount.toFixed(2)}</strong> (incl. 18% GST)
                    </div>
                </div>
            </div>
            <div>
                <a href="confirmation.html?code=${b.bookingCode}" class="btn btn-secondary" style="font-size:0.85rem;">
                    📄 View & Print Ticket
                </a>
            </div>
        </div>
    `).join('');
}

function setupBillSearch() {
    const searchForm = document.getElementById('bill-search-form');
    const searchInput = document.getElementById('bill-search-input');
    const resultBox = document.getElementById('bill-search-result');

    if (!searchForm || !searchInput) return;

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = searchInput.value.trim().toUpperCase();
        if (!code) {
            Toast.show('Please enter a booking code (e.g. BKG1)', 'warning');
            return;
        }

        resultBox.innerHTML = '<div style="padding:1rem; text-align:center;">Searching database...</div>';
        resultBox.style.display = 'block';

        try {
            const b = await Api.getBooking(code);
            resultBox.innerHTML = `
                <div style="background:var(--bg-card); border:1px solid var(--border-gold); border-radius:var(--radius-md); padding:1.2rem; margin-top:1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
                        <span style="font-weight:800; color:var(--accent-gold); font-size:1.1rem;">Found: ${b.bookingCode}</span>
                        <span class="role-tag customer">${b.status}</span>
                    </div>
                    <div style="font-size:0.9rem; margin-bottom:0.4rem;"><strong>Movie:</strong> ${b.movieTitle} (${b.cinemaName})</div>
                    <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.4rem;"><strong>Customer:</strong> ${b.customerName} (${b.viewerType}, ${b.customerAge} yrs)</div>
                    <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.4rem;"><strong>Seats:</strong> ${b.seatNumbersFormatted} | <strong>Gate:</strong> ${b.gate}</div>
                    <div style="font-size:0.95rem; font-weight:700; color:var(--accent-gold); margin-bottom:1rem;"><strong>Final Total:</strong> ₹${b.finalAmount.toFixed(2)}</div>
                    <a href="confirmation.html?code=${b.bookingCode}" class="btn btn-primary" style="font-size:0.85rem;">
                        🖨️ Open Official E-Ticket
                    </a>
                </div>
            `;
            Toast.show(`Found record for ${code}`, 'success');
        } catch (err) {
            resultBox.innerHTML = `
                <div style="background:rgba(229,9,20,0.1); border:1px solid var(--accent-red); border-radius:var(--radius-md); padding:1rem; margin-top:1rem; color:#ff6b6b;">
                    ❌ No booking found with ID: <strong>${code}</strong>. Verify the ID and try again.
                </div>
            `;
        }
    });
}
