const express = require('express');
const path = require('path');
const { tmdb, img, slugify } = require('./lib/tmdb');
const { renderLayout, renderHome, renderDetail, renderActor, renderSearch, renderCountdown } = require('./lib/render');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Halaman Utama (Home)
app.get('/', async (req, res) => {
  try {
    const [trending, popular, topRated] = await Promise.all([
      tmdb('/trending/movie/week'),
      tmdb('/movie/popular'),
      tmdb('/movie/top_rated')
    ]);

    const content = renderHome({
      trending: trending.results || [],
      popular: popular.results || [],
      topRated: topRated.results || []
    });

    res.send(renderLayout('KoreaFlixHd', content));
  } catch (err) {
    console.error('Home Error:', err);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});

// Halaman Pencarian
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    let results = [];
    if (query) {
      const searchRes = await tmdb('/search/movie', { query });
      results = searchRes.results || [];
    }
    const content = renderSearch(query, results);
    res.send(renderLayout(`검색: ${query}`, content));
  } catch (err) {
    console.error('Search Error:', err);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});

// Halaman Detail Film
app.get('/movie/:id', async (req, res) => {
  try {
    const movieId = req.params.id;
    const [movie, credits, videos, similar] = await Promise.all([
      tmdb(`/movie/${movieId}`),
      tmdb(`/movie/${movieId}/credits`),
      tmdb(`/movie/${movieId}/videos`),
      tmdb(`/movie/${movieId}/similar`)
    ]);

    const content = renderDetail({
      movie,
      cast: credits.cast || [],
      videos: videos.results || [],
      similar: similar.results || []
    });

    res.send(renderLayout(movie.title || '영화 상세', content));
  } catch (err) {
    console.error('Movie Detail Error:', err);
    res.status(404).send('영화를 찾을 수 없습니다.');
  }
});

// Halaman Hitung Mundur (Watch Countdown)
app.get('/watch/:id', async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await tmdb(`/movie/${movieId}`);
    const content = renderCountdown(movie.title || '재생 준비 중');
    res.send(renderLayout('시청 준비 중', content));
  } catch (err) {
    console.error('Watch Countdown Error:', err);
    res.redirect('https://moviegate.bolt.host/ko?');
  }
});

// Halaman Detail Aktor
app.get('/actor/:id', async (req, res) => {
  try {
    const actorId = req.params.id;
    const [person, movieCredits] = await Promise.all([
      tmdb(`/person/${actorId}`),
      tmdb(`/person/${actorId}/movie_credits`)
    ]);

    const uniqueMovies = Array.from(
      new Map((movieCredits.cast || []).map(m => [m.id, m])).values()
    );

    const content = renderActor({
      person,
      movies: uniqueMovies
    });

    res.send(renderLayout(person.name || '배우 프로필', content));
  } catch (err) {
    console.error('Actor Detail Error:', err);
    res.status(404).send('배우 정보를 찾을 수 없습니다.');
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
