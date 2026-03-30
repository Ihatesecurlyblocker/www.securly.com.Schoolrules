import { auth, signIn, logout, db, onAuthStateChanged, doc, setDoc, getDoc, serverTimestamp } from './firebase.js';
import { GameEngine } from './games.js';

let allGames = [];
let currentCategory = 'All';
let currentUser = null;

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
    if (!container) return;
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
    if (!grid) return;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    const filtered = allGames.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm);
        const matchesCat = currentCategory === 'All' || game.category === currentCategory;
        return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <p class="text-white/40 text-lg italic">No games found.</p>
            </div>
        `;
        return;
    }

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

async function openGame(id) {
    const game = allGames.find(g => g.id === id);
    if (!game) return;

    // Stop any running local game
    GameEngine.stop();

    document.getElementById('home-content').classList.add('hidden');
    document.getElementById('game-player').classList.remove('hidden');
    
    document.getElementById('current-game-title').innerText = game.title;
    document.getElementById('current-game-category').innerText = game.category;
    
    const iframe = document.getElementById('game-iframe');
    const localHolder = document.getElementById('local-game-holder');
    if (!iframe || !localHolder) return;

    // Show save button if logged in
    const saveBtn = document.getElementById('save-game-btn');
    if (saveBtn) {
        saveBtn.classList.toggle('hidden', !currentUser);
    }

    if (game.type === 'local') {
        iframe.classList.add('hidden');
        iframe.src = ''; // Clear iframe to stop any background processes
        localHolder.classList.remove('hidden');
        
        // Try to load saved data if logged in
        if (currentUser) {
            try {
                const saveDoc = await getDoc(doc(db, 'gameSaves', `${currentUser.uid}_${game.id}`));
                if (saveDoc.exists()) {
                    GameEngine.loadData(game.id, saveDoc.data());
                }
            } catch (err) {
                console.error('Error loading game save:', err);
            }
        }
        
        GameEngine.init('local-game-holder', game.id);
    } else {
        iframe.classList.remove('hidden');
        localHolder.classList.add('hidden');
        // Clear any canvas left by local games
        const canvas = document.getElementById('gameCanvas');
        if (canvas) canvas.remove();
        iframe.src = game.url;
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeGame() {
    const homeContent = document.getElementById('home-content');
    const gamePlayer = document.getElementById('game-player');
    const iframe = document.getElementById('game-iframe');
    const localHolder = document.getElementById('local-game-holder');

    if (homeContent) homeContent.classList.remove('hidden');
    if (gamePlayer) gamePlayer.classList.add('hidden');
    if (iframe) iframe.src = '';
    if (localHolder) localHolder.classList.add('hidden');
    GameEngine.stop();
}

function toggleFullscreen() {
    const iframe = document.getElementById('game-iframe');
    if (iframe.requestFullscreen) iframe.requestFullscreen();
    else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
    else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
}

// Firebase Handlers
async function handleSignIn() {
    try {
        await signIn();
    } catch (error) {
        console.error('Sign in error:', error);
    }
}

async function handleLogout() {
    try {
        await logout();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

async function saveCurrentGame() {
    if (!currentUser) return;
    
    const data = GameEngine.getCurrentData();
    if (!data.gameId) return;

    const saveBtn = document.getElementById('save-game-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = 'Saving...';
    saveBtn.disabled = true;

    try {
        await setDoc(doc(db, 'gameSaves', `${currentUser.uid}_${data.gameId}`), {
            userId: currentUser.uid,
            gameId: data.gameId,
            score: data.score,
            state: data.state,
            updatedAt: serverTimestamp()
        });
        
        saveBtn.innerHTML = 'Saved!';
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }, 2000);
    } catch (error) {
        console.error('Error saving game:', error);
        saveBtn.innerHTML = 'Error!';
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }, 2000);
    }
}

// Auth state listener
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const saveBtn = document.getElementById('save-game-btn');

    if (user) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');
        if (userAvatar) userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`;
        
        // Update user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp()
        }, { merge: true });

    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (userProfile) userProfile.classList.add('hidden');
    }
    
    if (saveBtn) {
        saveBtn.classList.toggle('hidden', !user);
    }
});

// Attach to window for HTML onclick handlers
window.filterByCategory = filterByCategory;
window.openGame = openGame;
window.closeGame = closeGame;
window.toggleFullscreen = toggleFullscreen;
window.handleSignIn = handleSignIn;
window.handleLogout = handleLogout;
window.saveCurrentGame = saveCurrentGame;

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedRenderGames = debounce(renderGames, 300);

// Search listener
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', debouncedRenderGames);
}

// Init
loadGames();
