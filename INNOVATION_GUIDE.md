# SHOWTIME – INNOVATION FEATURES GUIDE (10 MARKS)

This document provides complete technical documentation and architectural explanations for the **6 Innovation Features** implemented in the SHOWTIME Cinema Ticket Booking Platform.

---

## 1. Smart Seat Recommendation ("Recommend Best Seats")

### Purpose & Problem Solved
Cinema viewers often struggle to identify which available seats provide the clearest viewing angle and highest acoustic fidelity, especially when booking for groups (pairs or families) who need contiguous seats.

### Algorithmic Implementation
The recommendation engine analyzes available seats in the active show schedule using a **Euclidean Sweet-Spot Proximity Algorithm**:
1. **Screen Center Axis Alignment:** On a standard 10-column screen, the horizontal center lies at $Col = 5.5$. Seats closer to this axis minimize neck strain and visual distortion:
   $$\text{Deviation}_{\text{horizontal}} = |Col - 5.5|$$
2. **Optimal Row Depth:** Rows are classified by eye-level elevation. Middle rows (C, D, E) provide ideal distance from the screen:
   $$\text{Penalty}_{\text{row}} = |\text{Row} - \text{'D'}| \times 2.0$$
3. **Contiguity Guarantee:** For party size $K$, the engine scans each row for $K$ consecutive unoccupied seats $(Col_{j} = Col_{j-1} + 1)$ and computes the composite sweet-spot score:
   $$\text{Score} = \sum_{j=1}^{K} |Col_j - 5.5| + \text{Penalty}_{\text{row}}$$
4. **Interactive UI Action:** Clicking **"✨ Recommend Best Seats"** calculates the minimal score, applies a glowing cyan pulse animation (`pulseCyan`) to the chosen seats on the seat map, auto-selects them, and updates the live billing invoice in real-time.

---

## 2. Real-Time Movie Like & Favourites (❤️)

### Purpose & Problem Solved
Customers frequently want to bookmark upcoming releases or re-watch favorite blockbusters without having to re-search the catalog every session.

### Technical Architecture
- **Persistent Storage:** Stored in the MySQL `user_favorites` table with composite unique constraint `(user_id, movie_id)`.
- **Atomic REST Endpoint:** `POST /api/movies/{id}/favorite` toggles the bookmark status dynamically and returns `{ success: true, isFavorite: boolean }`.
- **Visual State Management:** The heart icon updates instantaneously between `🤍` and `❤️`, applying responsive CSS scaling and color transitions.
- **Dedicated Shelf:** Users can click **"❤️ View My Favourites"** on the movie homepage to instantly filter down to their saved movies.

---

## 3. Personalized Movie Recommendations ("Recommended For You")

### Purpose & Problem Solved
Standard cinema websites present static alphabetical or release-date movie lists. SHOWTIME delivers a personalized discovery experience.

### Technical Architecture
- **Content-Based Filtering:** The recommendation engine inspects the genres and directors of movies the logged-in customer has favorited or booked.
- **Dynamic Carousel:** Generates a dedicated **"Recommended For You"** shelf above the main catalog, complete with reasoning tags (e.g., *"💡 Because you liked Sci-Fi blockbusters"*).
- **Adaptive Updates:** Favoriting or unfavoriting a movie immediately triggers a re-ranking of recommendations without requiring a page refresh.

---

## 4. Cryptographic QR Digital Ticket & Live Admin Verifier

### Purpose & Problem Solved
Paper tickets are easily misplaced, and digital screenshot counterfeiting allows fraudulent entry into cinema screens.

### Technical Architecture
- **Cryptographic Watermark & Fingerprint:** Each confirmed booking generates a unique ticket payload containing:
  ```
  SHOWTIME|{bookingCode}|TOKEN:{token}|GATE:{gate}|SEATS:{seats}|AMT:{finalAmount}
  ```
- **SHA-256 Signature:** The payload is hashed using SHA-256 to create an immutable digital signature.
- **Client-Side SVG QR Generation:** The ticket renders a crisp, vector-based SVG QR code that scales cleanly to any screen or printed paper without third-party external dependencies.
- **Gatekeeper Verification Tool:** The Admin Dashboard includes a live **QR Verifier** form where gate attendants scan or enter the QR code payload. The backend validates the watermark, verifies the booking in the database, displays passenger details, and approves or denies entry.

---

## 5. Smart Booking with ACID Concurrency Lock

### Purpose & Problem Solved
A critical failure in cinema systems occurs when two simultaneous customers select and pay for the same seat, resulting in duplicate allocations and customer disputes.

### Technical Architecture
- **Atomic Two-Phase Locking:** All booking operations are guarded by a backend concurrency lock (`ReentrantLock` in standalone server / pessimistic row locks in MySQL `SELECT ... FOR UPDATE`).
- **Pre-Commit Verification:** Before mutating seat states, the system validates that every seat in the requested order remains in the `AVAILABLE` status.
- **Conflict Handling:** If another user reserves a seat first, the transaction rolls back cleanly, returns an HTTP `409 Conflict` error, and prompts the client to select another seat without debiting payments or corrupting inventory.
- **Real-Time Price Engine:** Enforces Hackathon Units I-IV business logic:
  - Subtotal = $\sum (\text{Fare} \times \text{Quantity})$
  - Discount = 20% for Senior Citizens (Age $\ge$ 60), 0% for Adults
  - Taxable Amount = Subtotal $-$ Discount
  - GST = Taxable Amount $\times$ 18%
  - Final Total = Taxable Amount $+$ GST

---

## 6. Real-Time Admin Analytics & Reporting

### Purpose & Problem Solved
Cinema managers lack live visibility into theater occupancy, daily revenue velocities, and popular seat preferences.

### Technical Architecture
- **Live Metrics Dashboard:** Aggregates real database records to compute:
  1. **Total Box Office Revenue**
  2. **Total Confirmed Bookings & Tickets Sold**
  3. **Most Popular Seat Class** (identifies highest grossing class among 101 to 106)
  4. **Top Grossing Movie**
  5. **Daily Revenue Trends**
  6. **Movie-Wise Collections**
- **Schedule Expansion:** Admins can schedule new shows on any screen; the engine automatically generates physical seat layouts and maps them to the 6 hackathon seat categories.
