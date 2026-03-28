let allGames = [];
let currentCategory = 'All';

// Load games from JSON
async function loadGames() {
    try {
        const response = await fetch('src/games.json');
        allGames = await response.json();
        renderCategories();
        renderGames();
    } catch (error) {
        console.error('Error loading games:', error);
    }
}

function renderCategories() {
    const container = document.getElementById('category-filters');
    const categories = ['All', ...new Set(allGames.map(g => g.category))];
    
    container.innerHTML = categories.map(cat => `
        <button onclick="filterByCategory('${cat}')" 
                class="cat-btn px-4 py-2 rounded-full text-sm font-medium transition-all ${cat === currentCategory ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}">
            ${cat}
        </button>
    `).join('');
}

function renderGames() {
    const grid = document.getElementById('games-grid');
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    const filtered = allGames.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm);
        const matchesCat = currentCategory === 'All' || game.category === currentCategory;
        return matchesSearch && matchesCat;
    });

    grid.innerHTML = filtered.map(game => `
        <div onclick="openGame('${game.id}')" class="group cursor-pointer game-card">
            <div class="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 mb-3">
                <img src="${game.thumbnail}" alt="${game.title}" class="w-full h-full object-cover transition-transform duration-500" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span class="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Play Now</span>
                </div>
            </div>
            <h3 class="font-bold group-hover:text-blue-500 transition-colors">${game.title}</h3>
            <p class="text-xs text-white/40 uppercase tracking-wider font-medium">${game.category}</p>
        </div>
    `).join('');
}

function filterByCategory(cat) {
    currentCategory = cat;
    renderCategories();
    renderGames();
}

function openGame(id) {
    const game = allGames.find(g => g.id === id);
    if (!game) return;

    document.getElementById('home-content').classList.add('hidden');
    document.getElementById('game-player').classList.remove('hidden');
    
    document.getElementById('current-game-title').innerText = game.title;
    document.getElementById('current-game-category').innerText = game.category;
    document.getElementById('game-iframe').src = game.url;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeGame() {
    document.getElementById('home-content').classList.remove('hidden');
    document.getElementById('game-player').classList.add('hidden');
    document.getElementById('game-iframe').src = '';
}

function toggleFullscreen() {
    const iframe = document.getElementById('game-iframe');
    if (iframe.requestFullscreen) iframe.requestFullscreen();
    else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
    else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
}

// Search listener
document.getElementById('search-input').addEventListener('input', renderGames);

// Init
loadGames();
