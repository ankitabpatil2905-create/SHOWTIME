/**
 * SHOWTIME - Home & Movie Catalog Controller
 */

let allMovies = [];
let activeGenre = 'ALL';
let activeFilter = 'ALL'; // ALL or FAVORITES

document.addEventListener('DOMContentLoaded', () => {
    Auth.requireAuth();
    renderNavbar('home');
    setupSearchAndFilters();
    loadMovies();
    loadPersonalizedRecommendations();
});

function setupSearchAndFilters() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndRenderMovies();
        });
    }

    // Genre Filter Pills
    document.querySelectorAll('.pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeGenre = btn.getAttribute('data-genre') || 'ALL';
            filterAndRenderMovies();
        });
    });

    // View My Favorites Toggle
    const favToggleBtn = document.getElementById('view-favorites-btn');
    if (favToggleBtn) {
        favToggleBtn.addEventListener('click', () => {
            if (activeFilter === 'FAVORITES') {
                activeFilter = 'ALL';
                favToggleBtn.classList.remove('btn-gold');
                favToggleBtn.classList.add('btn-secondary');
                favToggleBtn.innerHTML = '❤️ View My Favourites';
            } else {
                activeFilter = 'FAVORITES';
                favToggleBtn.classList.remove('btn-secondary');
                favToggleBtn.classList.add('btn-gold');
                favToggleBtn.innerHTML = '🎬 View All Movies';
            }
            filterAndRenderMovies();
        });
    }
}

async function loadMovies() {
    const grid = document.getElementById('movies-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;">Loading movies...</div>';
    const user = Auth.getUser();

    try {
        allMovies = await Api.getMovies({ userId: user ? user.userId : '' });
        filterAndRenderMovies();
    } catch (err) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--accent-red); padding: 3rem;">
            Failed to load movies: ${err.message}
        </div>`;
    }
}

async function loadPersonalizedRecommendations() {
    const recSection = document.getElementById('recommendations-container');
    const recGrid = document.getElementById('recommendations-grid');
    if (!recSection || !recGrid) return;

    const user = Auth.getUser();
    if (!user) return;

    try {
        const recs = await Api.getPersonalizedRecommendations(user.userId);
        if (recs && recs.length > 0) {
            recSection.style.display = 'block';
            recGrid.innerHTML = recs.map(m => renderMovieCard(m, true)).join('');
            attachMovieCardListeners(recGrid);
        } else {
            recSection.style.display = 'none';
        }
    } catch (e) {
        recSection.style.display = 'none';
    }
}

function filterAndRenderMovies() {
    const grid = document.getElementById('movies-grid');
    if (!grid) return;

    const search = (document.getElementById('search-input')?.value || '').toLowerCase().trim();

    const filtered = allMovies.filter(m => {
        const matchTitle = m.title.toLowerCase().includes(search) || m.description.toLowerCase().includes(search);
        const matchGenre = (activeGenre === 'ALL') || (m.genre.toUpperCase() === activeGenre.toUpperCase());
        const matchFav = (activeFilter !== 'FAVORITES') || m.isFavorite;
        return matchTitle && matchGenre && matchFav;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                <h3>No movies match your criteria</h3>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Try adjusting your search terms or filters.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(m => renderMovieCard(m)).join('');
    attachMovieCardListeners(grid);
}

function renderMovieCard(movie, isRecommendation = false) {
    return `
        <div class="movie-card" data-id="${movie.id}">
            <div class="poster-wrapper">
                <img src="${movie.posterUrl}" alt="${movie.title}" class="poster-img" loading="lazy" 
                     onerror="this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'">
                <button class="favorite-btn ${movie.isFavorite ? 'active' : ''}" 
                        data-movie-id="${movie.id}" 
                        title="${movie.isFavorite ? 'Remove from Favourites' : 'Add to Favourites'}">
                    ${movie.isFavorite ? '❤️' : '🤍'}
                </button>
                <div class="rating-badge">
                    ⭐ ${movie.rating.toFixed(1)}
                </div>
            </div>
            <div class="movie-info">
                <div class="movie-title" title="${movie.title}">${movie.title}</div>
                <div class="movie-meta">
                    <span>${movie.genre}</span> • 
                    <span>${movie.language}</span> • 
                    <span>${movie.durationMins}m</span>
                </div>
                ${isRecommendation && movie.recommendationReason ? `
                    <div style="font-size:0.75rem; color:var(--accent-cyan); margin-bottom:0.5rem; font-weight:600;">
                        💡 ${movie.recommendationReason}
                    </div>
                ` : ''}
                <div class="movie-desc">${movie.description}</div>
                <div class="movie-actions">
                    <a href="booking.html?movieId=${movie.id}" class="btn btn-primary" style="width: 100%;">
                        🎟️ Book Tickets
                    </a>
                </div>
            </div>
        </div>
    `;
}

function attachMovieCardListeners(container) {
    container.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const movId = btn.getAttribute('data-movie-id');
            const user = Auth.getUser();
            if (!user) {
                Toast.show('Please sign in to save favourites.', 'warning');
                return;
            }

            try {
                const res = await Api.toggleFavorite(movId, user.userId);
                btn.classList.toggle('active', res.isFavorite);
                btn.innerHTML = res.isFavorite ? '❤️' : '🤍';
                btn.title = res.isFavorite ? 'Remove from Favourites' : 'Add to Favourites';

                // Update local model
                const mov = allMovies.find(m => m.id == movId);
                if (mov) mov.isFavorite = res.isFavorite;

                Toast.show(res.isFavorite ? 'Saved to My Favourites ❤️' : 'Removed from Favourites', 'info');

                // Refresh recommendations since favorites changed!
                loadPersonalizedRecommendations();
                
                // If on favorites tab, re-filter
                if (activeFilter === 'FAVORITES') {
                    filterAndRenderMovies();
                }
            } catch (err) {
                Toast.show('Could not update favourite: ' + err.message, 'warning');
            }
        });
    });
}
