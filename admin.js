/**
 * SHOWTIME - Admin Dashboard & Analytics Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    Auth.requireAuth();
    Auth.requireAdmin();
    renderNavbar('admin');

    loadAnalytics();
    setupQRVerifier();
    setupAddShowForm();
});

async function loadAnalytics() {
    try {
        const data = await Api.getAdminAnalytics();

        // Top Stat Counters
        document.getElementById('stat-total-revenue').textContent = `₹${data.totalRevenue.toFixed(2)}`;
        document.getElementById('stat-total-bookings').textContent = data.totalBookings;
        document.getElementById('stat-tickets-sold').textContent = data.totalTicketsSold;
        document.getElementById('stat-popular-seat').textContent = data.mostPopularSeatClass;
        document.getElementById('stat-top-movie').textContent = data.topGrossingMovie;

        // Render Breakdown Tables
        renderSeatCategoryTable(data.seatCategoryBreakdown);
        renderMovieRevenueTable(data.movieWiseRevenue);
        renderDailyTrends(data.dailyTrends);
    } catch (err) {
        Toast.show('Failed to load admin analytics: ' + err.message, 'warning');
    }
}

function renderSeatCategoryTable(categories) {
    const tbody = document.getElementById('table-seat-categories');
    if (!tbody) return;

    if (!categories || categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:1rem; color:var(--text-muted)">No bookings recorded yet.</td></tr>';
        return;
    }

    tbody.innerHTML = categories.map(c => `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 0.8rem 1rem; color: white; font-weight:600;">${c.category}</td>
            <td style="padding: 0.8rem 1rem; text-align: right; color: var(--accent-gold); font-weight: 700;">${c.tickets} tickets</td>
        </tr>
    `).join('');
}

function renderMovieRevenueTable(movies) {
    const tbody = document.getElementById('table-movie-revenue');
    if (!tbody) return;

    if (!movies || movies.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:1rem; color:var(--text-muted)">No movie revenue data yet.</td></tr>';
        return;
    }

    tbody.innerHTML = movies.map(m => `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 0.8rem 1rem; color: white;">${m.movie}</td>
            <td style="padding: 0.8rem 1rem; text-align: right; color: #4cd137; font-weight: 700;">₹${m.revenue.toFixed(2)}</td>
        </tr>
    `).join('');
}

function renderDailyTrends(trends) {
    const container = document.getElementById('daily-trends-container');
    if (!container) return;

    if (!trends || trends.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted); padding:1rem;">No daily trend data available yet.</div>';
        return;
    }

    container.innerHTML = trends.map(t => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0; border-bottom:1px solid rgba(255,255,255,0.05);">
            <span style="color:var(--text-secondary);">${t.date}</span>
            <span style="font-weight:700; color:var(--accent-gold);">₹${t.revenue.toFixed(2)}</span>
        </div>
    `).join('');
}

// Innovation Feature #4: Live QR Verification Tool
function setupQRVerifier() {
    const form = document.getElementById('qr-verify-form');
    const input = document.getElementById('qr-verify-input');
    const resultBox = document.getElementById('qr-verify-result');

    if (!form || !input) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const codeData = input.value.trim();
        if (!codeData) {
            Toast.show('Please enter QR code payload or scan string', 'warning');
            return;
        }

        resultBox.style.display = 'block';
        resultBox.innerHTML = '<div style="padding:1rem; text-align:center;">Verifying cryptographic ticket with database...</div>';

        try {
            const res = await Api.verifyQR(codeData);
            if (res.valid) {
                resultBox.innerHTML = `
                    <div style="background:rgba(76, 209, 55, 0.15); border:2px solid #4cd137; border-radius:var(--radius-md); padding:1.2rem; color:white;">
                        <div style="display:flex; align-items:center; gap:0.5rem; font-size:1.1rem; font-weight:800; color:#4cd137; margin-bottom:0.5rem;">
                            <span>✅</span> <span>${res.message}</span>
                        </div>
                        <div style="font-size:0.9rem; margin-bottom:0.3rem;"><strong>Ticket Code:</strong> ${res.bookingCode} | <strong>Gate:</strong> <span style="color:var(--accent-gold); font-weight:700;">${res.gate}</span></div>
                        <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.3rem;"><strong>Customer:</strong> ${res.customerName}</div>
                        <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.3rem;"><strong>Movie & Show:</strong> ${res.movieTitle} at ${res.showTime}</div>
                        <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.3rem;"><strong>Seats:</strong> ${res.seats}</div>
                        <div style="font-size:0.95rem; font-weight:700; color:var(--accent-gold); margin-top:0.5rem;">Verified Amount: ₹${res.finalAmount.toFixed(2)}</div>
                    </div>
                `;
                Toast.show('Ticket Verified Successfully!', 'success');
            } else {
                resultBox.innerHTML = `
                    <div style="background:rgba(229, 9, 20, 0.15); border:2px solid var(--accent-red); border-radius:var(--radius-md); padding:1.2rem; color:#ff6b6b;">
                        <div style="font-size:1.1rem; font-weight:800; margin-bottom:0.4rem;">❌ REJECTED / INVALID TICKET</div>
                        <div>${res.message}</div>
                    </div>
                `;
                Toast.show('Invalid or fraudulent ticket payload!', 'warning');
            }
        } catch (err) {
            resultBox.innerHTML = `<div style="color:var(--accent-red); padding:1rem;">Error: ${err.message}</div>`;
        }
    });

    // Helper button to simulate QR test payload for evaluation
    window.testSampleQR = function(sampleCode = 'BKG1') {
        input.value = `SHOWTIME|${sampleCode}|TOKEN:1|GATE:Gate 1|SEATS:A1,A2|AMT:873.20`;
        form.dispatchEvent(new Event('submit'));
    };
}

function setupAddShowForm() {
    const form = document.getElementById('add-show-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const movieId = document.getElementById('new-show-movie').value;
        const cinemaId = document.getElementById('new-show-cinema').value;
        const screenNumber = document.getElementById('new-show-screen').value;
        const showDate = document.getElementById('new-show-date').value;
        const showTime = document.getElementById('new-show-time').value;

        if (!showDate || !showTime) {
            Toast.show('Please select show date and time.', 'warning');
            return;
        }

        try {
            await Api.createShow({
                movieId, cinemaId, screenNumber, showDate, showTime
            });
            Toast.show('New Show Created with Live Seat Layout!', 'success');
            form.reset();
            loadAnalytics();
        } catch (err) {
            Toast.show('Failed to add show: ' + err.message, 'warning');
        }
    });
}
