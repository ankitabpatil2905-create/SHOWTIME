/**
 * SHOWTIME - Interactive Cinema Booking Controller
 */

let currentMovie = null;
let currentShow = null;
let allShows = [];
let allSeats = [];
let selectedSeats = []; // array of ShowSeat objects

document.addEventListener('DOMContentLoaded', () => {
    Auth.requireAuth();
    renderNavbar('booking');

    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('movieId') || '1';

    initBookingPage(movieId);
    setupCustomerInputListeners();
    setupSmartRecommendation();
    setupConfirmBookingButton();
});

async function initBookingPage(movieId) {
    try {
        currentMovie = await Api.getMovie(movieId);
        renderMovieDetails(currentMovie);

        allShows = await Api.getShows(movieId);
        renderShowSelectors(allShows);

        if (allShows.length > 0) {
            selectShow(allShows[0].id);
        } else {
            document.getElementById('seat-grid-container').innerHTML = `
                <div style="padding: 3rem; text-align: center;">No scheduled shows available for this movie right now.</div>
            `;
        }
    } catch (err) {
        Toast.show('Error loading movie data: ' + err.message, 'warning');
    }
}

function renderMovieDetails(movie) {
    document.getElementById('booking-movie-title').textContent = movie.title;
    document.getElementById('booking-movie-meta').textContent = `${movie.genre} • ${movie.language} • ${movie.durationMins}m • ⭐ ${movie.rating}`;
    const poster = document.getElementById('booking-movie-poster');
    if (poster) poster.src = movie.posterUrl;
}

function renderShowSelectors(shows) {
    const container = document.getElementById('show-timings-container');
    if (!container) return;

    if (shows.length === 0) {
        container.innerHTML = '<span style="color:var(--text-muted)">No shows available</span>';
        return;
    }

    container.innerHTML = shows.map((s, idx) => `
        <button class="pill-btn ${idx === 0 ? 'active' : ''}" data-show-id="${s.id}" onclick="selectShow(${s.id})">
            🕒 ${s.showTime} (${s.cinemaName})
        </button>
    `).join('');
}

window.selectShow = async function(showId) {
    document.querySelectorAll('#show-timings-container .pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-show-id') == showId);
    });

    const grid = document.getElementById('seat-grid-container');
    grid.innerHTML = '<div style="padding:3rem; text-align:center;">Loading live seat chart...</div>';

    try {
        const data = await Api.getShowSeats(showId);
        currentShow = data.show;
        allSeats = data.seats;
        selectedSeats = [];
        renderSeatGrid(allSeats);
        updatePricingBreakdown();
    } catch (err) {
        grid.innerHTML = `<div style="color:var(--accent-red); padding:2rem;">Failed to load seat chart: ${err.message}</div>`;
    }
};

function renderSeatGrid(seats) {
    const grid = document.getElementById('seat-grid-container');
    if (!grid) return;

    // Group seats by row
    const rowMap = {};
    seats.forEach(s => {
        if (!rowMap[s.seatRow]) rowMap[s.seatRow] = [];
        rowMap[s.seatRow].push(s);
    });

    let html = '';
    const rows = Object.keys(rowMap).sort();

    rows.forEach(r => {
        const rowSeats = rowMap[r].sort((a, b) => a.seatCol - b.seatCol);
        const catName = rowSeats[0].categoryName;
        const fare = rowSeats[0].fare;

        html += `
            <div class="seat-row" data-row="${r}">
                <div class="row-label">${r}</div>
                ${rowSeats.map(s => {
                    const isBooked = s.status === 'BOOKED';
                    const isSelected = selectedSeats.some(sel => sel.id === s.id);
                    return `
                        <div class="seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}"
                             data-seat-id="${s.id}"
                             data-fare="${s.fare}"
                             data-num="${s.seatNumber}"
                             data-cat="${s.categoryName}"
                             title="${s.seatNumber} - ${s.categoryName} (₹${s.fare}) [${s.status}]"
                             onclick="toggleSeatSelection(${s.id})">
                            ${s.seatCol}
                        </div>
                    `;
                }).join('')}
                <div style="font-size:0.75rem; color:var(--text-muted); margin-left:0.5rem; min-width:80px;">
                    ${catName} ₹${fare}
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
}

window.toggleSeatSelection = function(showSeatId) {
    const seat = allSeats.find(s => s.id === showSeatId);
    if (!seat || seat.status === 'BOOKED') return;

    const existingIdx = selectedSeats.findIndex(s => s.id === showSeatId);
    if (existingIdx >= 0) {
        selectedSeats.splice(existingIdx, 1);
    } else {
        selectedSeats.push(seat);
    }

    // Update seat styling
    const seatEl = document.querySelector(`.seat[data-seat-id="${showSeatId}"]`);
    if (seatEl) {
        seatEl.classList.toggle('selected', existingIdx < 0);
        seatEl.classList.remove('recommended');
    }

    updatePricingBreakdown();
};

function setupCustomerInputListeners() {
    const ageInput = document.getElementById('cust-age');
    const nameInput = document.getElementById('cust-name');
    const user = Auth.getUser();

    if (user && nameInput && !nameInput.value) {
        nameInput.value = user.fullName;
    }

    if (ageInput) {
        ageInput.addEventListener('input', () => {
            updatePricingBreakdown();
        });
    }
}

function updatePricingBreakdown() {
    const ageInput = document.getElementById('cust-age');
    const age = parseInt(ageInput ? ageInput.value : '25') || 25;
    const isSenior = age >= 60;

    // Display viewer type badge
    const viewerTypeEl = document.getElementById('viewer-type-display');
    if (viewerTypeEl) {
        if (isSenior) {
            viewerTypeEl.innerHTML = `<span style="color:#4cd137; font-weight:700;">👴 Senior Citizen (20% Discount Applied)</span>`;
        } else {
            viewerTypeEl.innerHTML = `<span style="color:var(--text-secondary);">🧑 Adult (Standard Fare)</span>`;
        }
    }

    // Calculate Financials according to Hackathon Business Logic
    let subtotal = 0;
    selectedSeats.forEach(s => {
        subtotal += s.fare;
    });

    const discountRate = isSenior ? 0.20 : 0.00;
    const discountAmount = Math.round((subtotal * discountRate + 1e-9) * 100) / 100;
    const taxableAmount = Math.round(((subtotal - discountAmount) + 1e-9) * 100) / 100;
    const gstAmount = Math.round((taxableAmount * 0.18 + 1e-9) * 100) / 100;
    const finalTotal = Math.round((taxableAmount + gstAmount + 1e-9) * 100) / 100;

    // Update Summary Labels
    document.getElementById('lbl-selected-count').textContent = `${selectedSeats.length} Seat(s)`;
    document.getElementById('lbl-selected-seats').textContent = selectedSeats.length > 0 
        ? selectedSeats.map(s => s.seatNumber).join(', ') 
        : 'None';
    document.getElementById('lbl-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('lbl-discount').textContent = `- ₹${discountAmount.toFixed(2)} (${(discountRate * 100).toFixed(0)}%)`;
    document.getElementById('lbl-taxable').textContent = `₹${taxableAmount.toFixed(2)}`;
    document.getElementById('lbl-gst').textContent = `₹${gstAmount.toFixed(2)}`;
    document.getElementById('lbl-final-total').textContent = `₹${finalTotal.toFixed(2)}`;

    // Enable/disable confirm button
    const confirmBtn = document.getElementById('btn-confirm-booking');
    if (confirmBtn) {
        confirmBtn.disabled = selectedSeats.length === 0;
    }
}

// Innovation Feature #1: Smart Seat Recommendation
function setupSmartRecommendation() {
    const btn = document.getElementById('btn-recommend-seats');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        if (!currentShow) return;

        const ticketCountInput = document.getElementById('rec-ticket-count');
        const count = parseInt(ticketCountInput ? ticketCountInput.value : '2') || 2;

        btn.disabled = true;
        btn.innerHTML = '⚙️ Analyzing Center Sweet-Spot...';

        try {
            const res = await Api.recommendBestSeats(currentShow.id, count);
            if (res.success && res.recommendedShowSeatIds) {
                // Clear existing selections
                selectedSeats = [];
                document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
                document.querySelectorAll('.seat.recommended').forEach(s => s.classList.remove('recommended'));

                // Highlight and select recommended seats
                res.recommendedShowSeatIds.forEach(id => {
                    const seatObj = allSeats.find(s => s.id === id);
                    if (seatObj) {
                        selectedSeats.push(seatObj);
                        const seatEl = document.querySelector(`.seat[data-seat-id="${id}"]`);
                        if (seatEl) {
                            seatEl.classList.add('selected');
                            seatEl.classList.add('recommended');
                        }
                    }
                });

                updatePricingBreakdown();
                Toast.show(`Smart Pick: Recommended ${res.seatNumbers.join(', ')} with ${res.reasoningScore}% optimal viewing score!`, 'success');
            } else {
                Toast.show(res.message || 'No suitable contiguous seats found.', 'warning');
            }
        } catch (err) {
            Toast.show('Recommendation error: ' + err.message, 'warning');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '✨ Recommend Best Seats';
        }
    });
}

function setupConfirmBookingButton() {
    const btn = document.getElementById('btn-confirm-booking');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        if (selectedSeats.length === 0) {
            Toast.show('Please select at least one seat to book.', 'warning');
            return;
        }

        const nameInput = document.getElementById('cust-name');
        const ageInput = document.getElementById('cust-age');
        const customerName = (nameInput ? nameInput.value : '').trim();
        const customerAge = parseInt(ageInput ? ageInput.value : '25') || 25;

        if (!customerName) {
            Toast.show('Please enter customer name.', 'warning');
            if (nameInput) nameInput.focus();
            return;
        }

        const user = Auth.getUser();
        btn.disabled = true;
        btn.innerHTML = '⏳ Committing Booking (ACID Lock)...';

        const bookingPayload = {
            showId: currentShow.id,
            userId: user ? user.userId : 2,
            customerName: customerName,
            customerAge: customerAge,
            showSeatIds: selectedSeats.map(s => s.id),
            paymentMethod: 'UPI/CARD'
        };

        try {
            const confirmedBooking = await Api.createBooking(bookingPayload);
            Toast.show('Booking Confirmed! Generating QR Digital Ticket...', 'success');
            setTimeout(() => {
                window.location.href = `confirmation.html?code=${confirmedBooking.bookingCode}`;
            }, 1000);
        } catch (err) {
            Toast.show('Booking Failed: ' + err.message, 'warning');
            // Refresh seat map in case seats were booked concurrently
            if (currentShow) selectShow(currentShow.id);
            btn.disabled = false;
            btn.innerHTML = 'Confirm & Pay Now 🎟️';
        }
    });
}
