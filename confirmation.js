/**
 * SHOWTIME - Ticket Confirmation & QR Generator Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    Auth.requireAuth();
    renderNavbar('booking');

    const params = new URLSearchParams(window.location.search);
    const bookingCode = params.get('code') || 'BKG1';

    loadBookingTicket(bookingCode);
    setupTicketActions();
});

async function loadBookingTicket(code) {
    const container = document.getElementById('ticket-render-container');
    if (!container) return;

    try {
        const b = await Api.getBooking(code);
        renderTicket(b);
    } catch (err) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem; color: var(--accent-red);">
                <h2>Booking Not Found</h2>
                <p style="margin-top: 1rem; color: var(--text-muted);">Could not locate booking details for ID: <strong>${code}</strong></p>
                <a href="home.html" class="btn btn-secondary" style="margin-top: 1.5rem;">Return to Movies</a>
            </div>
        `;
    }
}

function renderTicket(b) {
    const container = document.getElementById('ticket-render-container');
    if (!container) return;

    // Generate lightweight QR code pattern using SVG matrix
    const qrSvg = generateQrSvg(b.qrCodeData || `SHOWTIME|${b.bookingCode}|${b.gate}|${b.finalAmount}`);

    container.innerHTML = `
        <div class="digital-ticket">
            <div class="ticket-header">
                <div>
                    <div style="font-size:0.75rem; letter-spacing:2px; text-transform:uppercase; opacity:0.85;">E-TICKET BOARDING PASS</div>
                    <div style="font-size:1.6rem; font-weight:800; letter-spacing:1px;">SHOW<span>TIME</span> CINEMAS</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.1rem; font-weight:800; color:var(--accent-gold);">${b.bookingCode}</div>
                    <div style="font-size:0.8rem; opacity:0.85;">${b.status}</div>
                </div>
            </div>

            <div class="ticket-body">
                <div>
                    <h2 style="font-size:1.5rem; margin-bottom:0.4rem; color:var(--text-primary);">${b.movieTitle}</h2>
                    <div style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.2rem;">
                        📍 ${b.cinemaName}
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem; font-size:0.85rem;">
                        <div>
                            <div style="color:var(--text-muted);">SHOW TIMING</div>
                            <div style="font-weight:700; color:white; font-size:1rem;">🕒 ${b.showTimeFormatted}</div>
                        </div>
                        <div>
                            <div style="color:var(--text-muted);">SEATS ALLOCATED</div>
                            <div style="font-weight:700; color:var(--accent-gold); font-size:1.1rem;">💺 ${b.seatNumbersFormatted}</div>
                        </div>
                        <div>
                            <div style="color:var(--text-muted);">PASSENGER</div>
                            <div style="font-weight:600; color:white;">👤 ${b.customerName} (${b.customerAge} yrs - ${b.viewerType})</div>
                        </div>
                        <div>
                            <div style="color:var(--text-muted);">GATE ALLOCATION</div>
                            <div style="font-weight:700; color:#4cd137; font-size:1rem;">🚪 ${b.gate} (Token #${b.token})</div>
                        </div>
                    </div>

                    <div style="background:rgba(0,0,0,0.3); padding:1rem; border-radius:var(--radius-md); font-size:0.82rem; border-left:3px solid var(--accent-gold);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;">
                            <span>Subtotal:</span> <span>₹${b.subtotal.toFixed(2)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem; color:#4cd137;">
                            <span>Discount (${(b.discountRate * 100).toFixed(0)}%):</span> <span>- ₹${b.discountAmount.toFixed(2)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;">
                            <span>Taxable Amount:</span> <span>₹${b.taxableAmount.toFixed(2)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
                            <span>GST (18%):</span> <span>₹${b.gstAmount.toFixed(2)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-weight:800; font-size:0.95rem; border-top:1px dashed rgba(255,255,255,0.2); padding-top:0.4rem; color:var(--accent-gold);">
                            <span>FINAL TOTAL PAID:</span> <span>₹${b.finalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div class="ticket-qr-section">
                    <div class="qr-code-box">
                        ${qrSvg}
                    </div>
                    <div class="gate-badge">${b.gate}</div>
                    <div style="font-size:0.68rem; color:var(--text-muted); margin-top:0.6rem; text-align:center;">
                        Token #${b.token}<br>
                        Odd: Gate 1 | Even: Gate 2
                    </div>
                </div>
            </div>
        </div>

        <div style="display:flex; gap:1rem; justify-content:center; margin-top:2rem;">
            <button class="btn btn-primary" onclick="window.print()">🖨️ Print Ticket</button>
            <button class="btn btn-gold" onclick="downloadTicket('${b.bookingCode}')">📥 Download Ticket</button>
            <a href="home.html" class="btn btn-secondary">🍿 Book Another Movie</a>
        </div>
    `;
}

// Generate simple SVG QR code visual for ticket
function generateQrSvg(data) {
    // Generate deterministic 21x21 QR pattern based on data string hash
    const size = 21;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data.charCodeAt(i);
        hash |= 0;
    }

    let rects = '';
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            // Corner position detection patterns
            const isCornerTopLeft = (r < 7 && c < 7);
            const isCornerTopRight = (r < 7 && c >= size - 7);
            const isCornerBottomLeft = (r >= size - 7 && c < 7);

            let isDark = false;
            if (isCornerTopLeft || isCornerTopRight || isCornerBottomLeft) {
                const lr = isCornerBottomLeft ? r - (size - 7) : r;
                const lc = isCornerTopRight ? c - (size - 7) : c;
                if (lr === 0 || lr === 6 || lc === 0 || lc === 6) isDark = true;
                else if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) isDark = true;
            } else {
                // Procedural pseudo-random data bits from hash
                const bitVal = Math.sin((r * size + c + Math.abs(hash)) * 1.5);
                isDark = bitVal > 0.15;
            }

            if (isDark) {
                rects += `<rect x="${c * 6}" y="${r * 6}" width="6" height="6" fill="#000000" />`;
            }
        }
    }

    return `
        <svg viewBox="0 0 ${size * 6} ${size * 6}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#ffffff" />
            ${rects}
        </svg>
    `;
}

function setupTicketActions() {
    window.downloadTicket = function(bookingCode) {
        window.print();
        Toast.show(`Ticket ${bookingCode} saved. Check your print dialog to save as PDF.`, 'success');
    };
}
