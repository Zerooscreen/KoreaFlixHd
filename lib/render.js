const { img, slugify } = require('./lib/tmdb');

function renderLayout(title, content) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - KoreaFlixHd</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen">
    <nav class="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <a href="/" class="text-xl font-bold text-red-600 tracking-wider">KoreaFlixHd</a>
        <form action="/search" method="GET" class="flex gap-2">
            <input type="text" name="q" placeholder="Cari film Korea..." class="bg-zinc-800 px-4 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 text-white">
            <button type="submit" class="bg-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition">Cari</button>
        </form>
    </nav>
    <main class="max-w-7xl mx-auto px-4 py-8">
        ${content}
    </main>
    <footer class="text-center py-6 text-zinc-500 text-sm border-t border-zinc-900 mt-12">
        &copy; 2026 KoreaFlixHd. All rights reserved.
    </footer>
</body>
</html>`;
}

function renderHome({ trending, popular, topRated }) {
  const renderList = (movies) => movies.map(m => `
    <a href="/movie/${m.id}" class="bg-zinc-900 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition duration-300 block border border-zinc-800">
        <img src="${img(m.poster_path)}" alt="${m.title}" class="w-full h-72 object-cover">
        <div class="p-3">
            <h3 class="font-semibold text-sm truncate">${m.title}</h3>
            <p class="text-xs text-zinc-400 mt-1">⭐ ${m.vote_average ? m.vote_average.toFixed(1) : 'N/A'}</p>
        </div>
    </a>
  `).join('');

  return `
    <div class="space-y-10">
        <section>
            <h2 class="text-xl font-bold mb-4 border-l-4 border-red-600 pl-3">Sedang Tren</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">${renderList(trending)}</div>
        </section>
        <section>
            <h2 class="text-xl font-bold mb-4 border-l-4 border-red-600 pl-3">Film Populer</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">${renderList(popular)}</div>
        </section>
        <section>
            <h2 class="text-xl font-bold mb-4 border-l-4 border-red-600 pl-3">Rating Tertinggi</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">${renderList(topRated)}</div>
        </section>
    </div>
  `;
}

function renderDetail({ movie, cast, videos, similar }) {
  // Cari trailer YouTube
  const trailer = videos.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
  const trailerEmbed = trailer ? `<iframe class="w-full h-80 md:h-[450px] rounded-xl border border-zinc-800" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : `<p class="text-zinc-500 italic">Trailer tidak tersedia.</p>`;

  // List Aktor (Bisa diklik menuju halaman aktor)
  const castList = cast.slice(0, 10).map(actor => `
    <a href="/actor/${actor.id}" class="flex-shrink-0 w-28 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 text-center hover:border-red-600 transition">
        <img src="${img(actor.profile_path, 'w185')}" alt="${actor.name}" class="w-full h-36 object-cover">
        <div class="p-2">
            <p class="text-xs font-bold truncate">${actor.name}</p>
            <p class="text-[10px] text-zinc-400 truncate">${actor.character || ''}</p>
        </div>
    </a>
  `).join('');

  // List Similar Movies
  const similarList = similar.slice(0, 5).map(m => `
    <a href="/movie/${m.id}" class="bg-zinc-900 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition duration-300 block border border-zinc-800">
        <img src="${img(m.poster_path)}" alt="${m.title}" class="w-full h-60 object-cover">
        <div class="p-3">
            <h3 class="font-semibold text-sm truncate">${m.title}</h3>
        </div>
    </a>
  `).join('');

  return `
    <div class="space-y-10">
        <!-- Bagian Utama Info Film -->
        <div class="grid md:grid-cols-3 gap-8 items-start">
            <img src="${img(movie.poster_path, 'w500')}" alt="${movie.title}" class="rounded-2xl shadow-2xl w-full border border-zinc-800">
            <div class="md:col-span-2 space-y-4">
                <h1 class="text-3xl font-extrabold">${movie.title}</h1>
                <p class="text-zinc-400 italic">${movie.tagline || ''}</p>
                <div class="flex flex-wrap gap-2 text-xs">
                    <span class="bg-zinc-800 px-3 py-1 rounded-full">📅 ${movie.release_date}</span>
                    <span class="bg-zinc-800 px-3 py-1 rounded-full">⏱️ ${movie.runtime} menit</span>
                    <span class="bg-zinc-800 px-3 py-1 rounded-full">⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                </div>
                <p class="text-zinc-300 text-sm leading-relaxed">${movie.overview}</p>
                
                <!-- Tombol Watch Menuju Countdown -->
                <div class="pt-4">
                    <a href="https://moviegate.bolt.host/ko?" class="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition duration-300 text-center">
                        ▶ Watch Now
                    </a>
                </div>
            </div>
        </div>

        <!-- Bagian Trailer Video -->
        <section class="space-y-4">
            <h2 class="text-xl font-bold border-l-4 border-red-600 pl-3">Official Trailer</h2>
            ${trailerEmbed}
        </section>

        <!-- Bagian Pemeran (Aktor Klikable) -->
        <section class="space-y-4">
            <h2 class="text-xl font-bold border-l-4 border-red-600 pl-3">Pemeran Utama</h2>
            <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">${castList}</div>
        </section>

        <!-- Bagian Similar Movies -->
        <section class="space-y-4">
            <h2 class="text-xl font-bold border-l-4 border-red-600 pl-3">Film Serupa (Similar)</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">${similarList}</div>
        </section>
    </div>
  `;
}

function renderActor({ person, movies }) {
  const movieList = movies.map(m => `
    <a href="/movie/${m.id}" class="bg-zinc-900 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition duration-300 block border border-zinc-800">
        <img src="${img(m.poster_path)}" alt="${m.title}" class="w-full h-60 object-cover">
        <div class="p-3">
            <h3 class="font-semibold text-sm truncate">${m.title}</h3>
        </div>
    </a>
  `).join('');

  return `
    <div class="space-y-8">
        <div class="flex flex-col md:flex-row gap-6 items-center md:items-start bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
            <img src="${img(person.profile_path, 'w500')}" alt="${person.name}" class="w-48 h-48 rounded-full object-cover shadow-xl border-2 border-red-600">
            <div class="space-y-3 text-center md:text-left">
                <h1 class="text-3xl font-extrabold">${person.name}</h1>
                <p class="text-xs text-zinc-400">🎂 Lahir: ${person.birthday || 'Tidak diketahui'} (${person.place_of_birth || ''})</p>
                <p class="text-zinc-300 text-sm leading-relaxed">${person.biography ? person.biography.slice(0, 500) + '...' : 'Biografi belum tersedia.'}</p>
            </div>
        </div>

        <section class="space-y-4">
            <h2 class="text-xl font-bold border-l-4 border-red-600 pl-3">Film yang Dibintangi</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">${movieList}</div>
        </section>
    </div>
  `;
}

function renderSearch(query, results) {
  const resultsHtml = results.length > 0 ? results.map(m => `
    <a href="/movie/${m.id}" class="bg-zinc-900 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition duration-300 block border border-zinc-800">
        <img src="${img(m.poster_path)}" alt="${m.title}" class="w-full h-72 object-cover">
        <div class="p-3">
            <h3 class="font-semibold text-sm truncate">${m.title}</h3>
            <p class="text-xs text-zinc-400 mt-1">⭐ ${m.vote_average ? m.vote_average.toFixed(1) : 'N/A'}</p>
        </div>
    </a>
  `).join('') : `<p class="text-zinc-500 col-span-full">Tidak ada hasil ditemukan untuk "${query}".</p>`;

  return `
    <div class="space-y-6">
        <h1 class="text-2xl font-bold">Hasil Pencarian: "${query}"</h1>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">${resultsHtml}</div>
    </div>
  `;
}

module.exports = {
  renderLayout,
  renderHome,
  renderDetail,
  renderActor,
  renderSearch
};
