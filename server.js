const express = require('express');
const path = require('path');
const { tmdb, img, slugify } = require('./lib/tmdb');
const { renderLayout, renderHome, renderDetail, renderActor, renderSearch } = require('./render');

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

    res.send(renderLayout('KoreaFlixHd - Home', content));
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
    res.send(renderLayout(`Pencarian: ${query}`, content));
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

    res.send(renderLayout(movie.title || 'Detail Film', content));
  } catch (err) {
    console.error('Movie Detail Error:', err);
    res.status(404).send('Film tidak ditemukan atau terjadi kesalahan server.');
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

    const content = renderActor({
      person,
      movies: movieCredits.cast || []
    });

    res.send(renderLayout(person.name || 'Profil Aktor', content));
  } catch (err) {
    console.error('Actor Detail Error:', err);
    res.status(404).send('Aktor tidak ditemukan.');
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
