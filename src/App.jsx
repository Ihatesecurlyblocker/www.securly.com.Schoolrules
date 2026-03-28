/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Search, Gamepad2, X, Maximize2, ExternalLink, TrendingUp, Grid2X2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gamesData from './games.json';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGame, setSelectedGame] = useState(null);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(gamesData.map(g => g.category))];
    return cats;
  }, []);

  const filteredGames = useMemo(() => {
    return gamesData.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleGameClick = (game) => {
    setSelectedGame(game);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFullscreen = () => {
    const iframe = document.getElementById('game-iframe');
    if (iframe) {
      if (!document.fullscreenElement) {
        iframe.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedGame(null)}>
            <div className="bg-blue-600 p-2 rounded-lg neon-glow">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-display font-extrabold tracking-tighter">
              FREEDOM <span className="text-blue-500">V2</span>
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <button className="hover:text-white transition-colors">Home</button>
            <button className="hover:text-white transition-colors">Popular</button>
            <button className="hover:text-white transition-colors">New</button>
            <button className="hover:text-white transition-colors">About</button>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 w-48 md:w-64 transition-all"
            />
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <AnimatePresence mode="wait">
          {selectedGame ? (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-display font-bold">{selectedGame.title}</h2>
                    <p className="text-white/40 text-sm">{selectedGame.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFullscreen}
                    className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    <Maximize2 className="w-4 h-4" />
                    Fullscreen
                  </button>
                  <a
                    href={selectedGame.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors text-sm font-bold"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                  </a>
                </div>
              </div>

              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                <iframe
                  id="game-iframe"
                  src={selectedGame.url}
                  className="w-full h-full border-none"
                  allowFullScreen
                  title={selectedGame.title}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 glass rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-blue-500">
                    <Info className="w-5 h-5" />
                    <h3 className="font-bold">Game Description</h3>
                  </div>
                  <p className="text-white/60 leading-relaxed">
                    Experience {selectedGame.title}, a top-rated {selectedGame.category.toLowerCase()} game available on Freedom V2. 
                    Enjoy smooth gameplay, high performance, and unblocked access from anywhere.
                  </p>
                </div>
                <div className="glass rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-blue-500">
                    <TrendingUp className="w-5 h-5" />
                    <h3 className="font-bold">Stats</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/40">Rating</span>
                      <span className="text-green-500">4.8/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Plays</span>
                      <span>12.4k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Category</span>
                      <span>{selectedGame.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/5 p-12 text-center space-y-6">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/gaming/1920/1080')] opacity-10 mix-blend-overlay" />
                <motion.h2 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl md:text-7xl font-display font-black tracking-tighter"
                >
                  Games by <span className="text-blue-500">Sylis</span>
                </motion.h2>
                <p className="text-white/60 max-w-2xl mx-auto text-lg">
                  Freedom V2 is your ultimate destination for high-quality, unblocked web games. 
                  No downloads, no restrictions, just pure gaming.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button className="px-8 py-3 bg-blue-600 rounded-full font-bold hover:bg-blue-500 transition-all hover:scale-105 neon-glow">
                    Play Now
                  </button>
                  <button className="px-8 py-3 glass rounded-full font-bold hover:bg-white/10 transition-all">
                    Browse Categories
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 mr-4 text-white/40">
                  <Grid2X2 className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">Categories</span>
                </div>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Games Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleGameClick(game)}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 mb-3">
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                          Play Now
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold group-hover:text-blue-500 transition-colors">{game.title}</h3>
                    <p className="text-xs text-white/40 uppercase tracking-wider font-medium">{game.category}</p>
                  </motion.div>
                ))}
              </div>

              {filteredGames.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-white/40 text-lg italic">No games found matching your search.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-auto border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-md">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-display font-extrabold tracking-tighter">
                FREEDOM <span className="text-blue-500">V2</span>
              </h1>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              The next generation of unblocked gaming. Experience freedom without limits.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><button className="hover:text-blue-500 transition-colors">Home</button></li>
              <li><button className="hover:text-blue-500 transition-colors">Games</button></li>
              <li><button className="hover:text-blue-500 transition-colors">Popular</button></li>
              <li><button className="hover:text-blue-500 transition-colors">New</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><button className="hover:text-blue-500 transition-colors">Contact Us</button></li>
              <li><button className="hover:text-blue-500 transition-colors">FAQ</button></li>
              <li><button className="hover:text-blue-500 transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-blue-500 transition-colors">Terms of Service</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Newsletter</h4>
            <p className="text-sm text-white/40 mb-4">Get updates on new games.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-full"
              />
              <button className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-xs text-white/20">
          &copy; 2026 Freedom V2. All rights reserved. Not affiliated with any game developers.
        </div>
      </footer>
    </div>
  );
}
