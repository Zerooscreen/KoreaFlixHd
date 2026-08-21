const fetch = require('node-fetch');

const TMDB_API_KEY = process.env.TMDB_API_KEY || '1fb6c0852b7cb13ae8b98246e492f1b8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function tmdb(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  // Memastikan data yang ditarik dari TMDB menggunakan bahasa Korea (ko-KR)
  url.searchParams.append('language', 'ko-KR');

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB Error: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

function img(path, size = 'w500') {
  if (!path) return 'https://placehold.co/500x750/17171b/8d8a92?text=No+Image';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = { tmdb, img, slugify };
