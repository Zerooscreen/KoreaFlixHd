const { img, slugify } = require('./tmdb');

function renderLayout(title, content, description = '대한민국 최고 영화·시리즈 전문매체 KoreaFlixHd는 최신영화 정보, 전문가 평점, 박스오피스 영화, 시사회 이벤트 정보 등 최다 영화 관련 기사와 정보를 제공합니다.') {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | 대한민국 최고 영화·시리즈 전문매체</title>
    <meta name="description" content="${description}">
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Masukkan script iklan/analytics tambahan di sini jika ada -->
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen">
    <nav class="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <a href="/" class="text-xl font-bold text-red-600 tracking-wider">KoreaFlixHd</a>
        <form action="/search" method="GET" class="flex gap-2">
            <input type="text" name="q" placeholder="한국 영화 검색..." class="bg-zinc-800 px-4 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 text-white">
            <button type="submit" class="bg-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition">검색</button>
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
            <h2 class="text-xl font-bold mb-4 border-l-4 border-red-600 pl-3">인기 트렌드</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">${renderList(trending)}</div>
        </section>
        <section>
            <h2 class="text-xl font-bold mb-4 border-l-4 border-red-600 pl-3">인기 영화</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">${renderList(popular)}</div>
        </section>
        <section>
            <h2 class="text-xl font-bold mb-4 border-l-4 border-red-600 pl-3">최고 평점</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">${renderList(topRated)}</div>
        </section>
    </div>
  `;
}

function renderDetail({ movie, cast, videos, similar }) {
  const trailer = videos.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
  const trailerEmbed = trailer ? `<iframe class="w-full h-80 md:h-[450px] rounded-xl border border-zinc-800" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : `<p class="text-zinc-500 italic">예고편이 없습니다.</p>`;

  const castList = cast.slice(0, 10).map(actor => `
    <a href="/actor/${actor.id}" class="flex-shrink-0 w-28 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 text-center hover:border-red-600 transition">
        <img src="${img(actor.profile_path, 'w185')}" alt="${actor.name}" class="w-full h-36 object-cover">
        <div class="p-2">
            <p class="text-xs font-bold truncate">${actor.name}</p>
            <p class="text-[10px] text-zinc-400 truncate">${actor.character || ''}</p>
        </div>
    </a>
  `).join('');

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
        <div class="grid md:grid-cols-3 gap-8 items-start">
            <img src="${img(movie.poster_path, 'w500')}" alt="${movie.title}" class="rounded-2xl shadow-2xl w-full border border-zinc-800">
            <div class="md:col-span-2 space-y-4">
                <h1 class="text-3xl font-extrabold">${movie.title}</h1>
                <p class="text-zinc-400 italic">${movie.tagline || ''}</p>
                <div class="flex flex-wrap gap-2 text-xs">
                    <span class="bg-zinc-800 px-3 py-1 rounded-full">📅 ${movie.release_date}</span>
                    <span class="bg-zinc-800 px-3 py-1 rounded-full">⏱️ ${movie.runtime} 분</span>
                    <span class="bg-zinc-800 px-3 py-1 rounded-full">⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                </div>
                <p class="text-zinc-300 text-sm leading-relaxed">${movie.overview}</p>
                
                <div class="pt-4">
                    <a href="/watch/${movie.id}" class="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition duration-300 text-center">
                        ▶ 지금 시청하기
                    </a>
                </div>
            </div>
        </div>

        <section class="space-y-4">
            <h2 class="text-xl font-bold border-l-4 border-red-600 pl-3">공식 예고편</h2>
            ${trailerEmbed}
        </section>

        <section class="space-y-4">
            <h2 class="text-xl font-bold border-l-4 border-red-600 pl-3">주요 출연진</h2>
            <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">${castList}</div>
        </section>

        <section class="space-y-4">
            <h2 class="text-xl font-bold border-l-4 border-red-600 pl-3">비슷한 영화</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">${similarList}</div>
        </section>
    </div>
  `;
}

function renderCountdown(movieTitle) {
  return `
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div class="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full">
            <h1 class="text-2xl font-bold mb-2">${movieTitle}</h1>
            <p class="text-zinc-400 text-sm mb-6">영상을 준비하는 중입니다...</p>
            <div id="counter" class="text-6xl font-extrabold text-red-600 mb-6">5</div>
            <p class="text-xs text-zinc-500">잠시만 기다려 주시면 자동으로 재생 페이지로 이동합니다.</p>
        </div>
    </div>
    <script>
        let count = 5;
        const counterEl = document.getElementById('counter');
        const timer = setInterval(() => {
            count--;
            counterEl.textContent = count;
            if (count <= 0) {
                clearInterval(timer);
                window.location.href = "https://moviegate.bolt.host/ko?";
            }
        }, 1000);
    </script>
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
                <p class="text-xs text-zinc-400">🎂 출생: ${person.birthday || '정보 없음'} (${person.place_of_birth || ''})</p>
                <p class="text-zinc-300 text-sm leading-relaxed">${person.biography ? person.biography.slice(0, 500) + '...' : '등록된 전기 정보가 없습니다.'}</p>
            </div>
        </div>

        <section class="space-y-4">
            <h2 class="text-xl font-bold border-l-4 border-red-600 pl-3">출연작</h2>
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
  `).join('') : `<p class="text-zinc-500 col-span-full">"${query}"에 대한 검색 결과가 없습니다.</p>`;

  return `
    <div class="space-y-6">
        <h1 class="text-2xl font-bold">검색 결과: "${query}"</h1>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">${resultsHtml}</div>
    </div>
  `;
}

module.exports = {
  renderLayout,
  renderHome,
  renderDetail,
  renderActor,
  renderSearch,
  renderCountdown
};
