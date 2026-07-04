/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export interface GameDetails {
  cover: string | null;
  description: string | null;
  screenshots: string[];
  rating: number | null;
  genres: string[];
  developers: string[];
  publishers: string[];
}

// Global cache to persist across component mounts/unmounts
const cache = new Map<string, GameDetails | null>();

// Serialized queue of requests to enforce a 100ms rate limit interval between consecutive requests
let requestQueue: Promise<any> = Promise.resolve();

const queuedFetch = async (url: string): Promise<any> => {
  return new Promise<any>((resolve) => {
    requestQueue = requestQueue
      .then(async () => {
        // Enforce safe spacing between API requests to satisfy the rate-limiting requirement
        await new Promise((r) => setTimeout(r, 100));
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(resolve)
      .catch(() => {
        resolve(null);
      });
  });
};

const genreTranslations: Record<string, string> = {
  'Action': 'Ação',
  'Shooter': 'Tiro',
  'Fighting': 'Luta',
  'Racing': 'Corrida',
  'Platformer': 'Plataforma',
  'Sports': 'Esportes',
  'Adventure': 'Aventura',
  'Strategy': 'Estratégia',
  'Puzzle': 'Quebra-cabeça',
  'Simulation': 'Simulação',
  'Indie': 'Independente',
  'Arcade': 'Fliperama',
  'Family': 'Família',
  'Educational': 'Educativo',
  'RPG': 'RPG',
  'Role-playing (RPG)': 'RPG',
  'Board Games': 'Jogos de Tabuleiro',
  'Card': 'Cartas',
  'Casual': 'Casual',
  'Massively Multiplayer': 'MMO',
  'Tactical': 'Tático',
  'Beat \'em Up': 'Beat \'em Up',
};

const translateText = async (text: string): Promise<string> => {
  if (!text) return '';
  const shortened = text.slice(0, 1000); // Aumentou de 500 para 1000 graças ao poder do Gemini
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: shortened }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data.translatedText || text;
  } catch (error) {
    console.error('Translation server error, falling back to original text:', error);
    return text;
  }
};

export function useGameData(title: string) {
  const [prevTitle, setPrevTitle] = useState<string>('');

  const cachedData = cache.get(title);
  const isCached = cache.has(title);

  const [data, setData] = useState<GameDetails | null>(isCached ? (cachedData || null) : null);
  const [loading, setLoading] = useState<boolean>(!isCached);

  if (title !== prevTitle) {
    setPrevTitle(title);
    setData(isCached ? (cachedData || null) : null);
    setLoading(!isCached);
  }

  useEffect(() => {
    if (!title) {
      setData(null);
      setLoading(false);
      return;
    }

    // 1. Check in-memory cache first to prevent redundant requests
    if (cache.has(title)) {
      setData(cache.get(title) || null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchGameData = async () => {
      try {
        // First request: Search and find the game match
        const searchUrl = `/api/rawg-proxy/games?search=${encodeURIComponent(title)}&page_size=1`;
        const searchRes = await queuedFetch(searchUrl);

        if (!searchRes || !searchRes.results || searchRes.results.length === 0) {
          if (isMounted) {
            cache.set(title, null);
            setData(null);
            setLoading(false);
          }
          return;
        }

        const gameResult = searchRes.results[0];
        const slug = gameResult.slug;

        // Second request: Fetch details
        const detailsUrl = `/api/rawg-proxy/games/${slug}`;
        const detailRes = await queuedFetch(detailsUrl);

        // Third request: Fetch screenshots
        const screenshotsUrl = `/api/rawg-proxy/games/${slug}/screenshots`;
        const screenshotRes = await queuedFetch(screenshotsUrl);

        const screenshotsList: string[] = screenshotRes && screenshotRes.results
          ? screenshotRes.results.map((s: any) => s.image)
          : [];

        const devList: string[] = detailRes && detailRes.developers
          ? detailRes.developers.map((d: any) => d.name)
          : [];

        const pubList: string[] = detailRes && detailRes.publishers
          ? detailRes.publishers.map((p: any) => p.name)
          : [];

        // Choose the best English description to translate
        let descToTranslate = detailRes 
          ? (detailRes.description_raw || detailRes.description || '') 
          : '';

        // Clean out any HTML tags if description_raw is empty and we fall back to description
        if (descToTranslate && !detailRes.description_raw && detailRes.description) {
          descToTranslate = descToTranslate.replace(/<[^>]*>/g, '');
        }

        let translatedDesc = descToTranslate || null;
        if (translatedDesc && typeof translatedDesc === 'string' && translatedDesc.trim()) {
          try {
            translatedDesc = await translateText(translatedDesc);
          } catch (e) {
            console.warn('Failed to translate game description, using original English:', e);
          }
        }

        const rawGenres: string[] = gameResult.genres ? gameResult.genres.map((g: any) => g.name) : [];
        const translatedGenres: string[] = rawGenres.map((g: string) => genreTranslations[g] || g);

        const resultDetails: GameDetails = {
          cover: gameResult.background_image || null,
          description: translatedDesc,
          screenshots: screenshotsList,
          rating: gameResult.rating || null,
          genres: translatedGenres,
          developers: devList,
          publishers: pubList,
        };

        cache.set(title, resultDetails);

        if (isMounted) {
          setData(resultDetails);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in useGameData hook:', error);
        if (isMounted) {
          cache.set(title, null);
          setData(null);
          setLoading(false);
        }
      }
    };

    fetchGameData();

    return () => {
      isMounted = false;
    };
  }, [title]);

  return { data, loading };
}

export default useGameData;
