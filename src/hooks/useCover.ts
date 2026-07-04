/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

// Global cache to persist across component mounts/unmounts
const coverCache: Record<string, string | null> = {};

// Serialized queue of requests to enforce a 100ms rate limit interval between consecutive requests
let requestQueue: Promise<any> = Promise.resolve();

const queuedFetch = async (url: string): Promise<any> => {
  const result = new Promise<any>((resolve) => {
    requestQueue = requestQueue
      .then(async () => {
        // Rate limiting constraint: wait 100ms between any requests
        await new Promise((r) => setTimeout(r, 100));
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(resolve)
      .catch(() => {
        // Resolve with null to ensure a failing request does not block subsequent requests in the chain
        resolve(null);
      });
  });
  return result;
};

export function useCover(title: string, platform: string) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!title) {
      setCoverUrl(null);
      setLoading(false);
      return;
    }

    const cacheKey = `${title.toLowerCase()}|${(platform || '').toLowerCase()}`;

    // 1. Check in-memory cache first to avoid repeated requests
    if (cacheKey in coverCache) {
      setCoverUrl(coverCache[cacheKey]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchImage = async () => {
      const url = `/api/rawg-proxy/games?search=${encodeURIComponent(title)}&page_size=1`;
      
      const data = await queuedFetch(url);
      
      let imageUrl: string | null = null;
      if (data && data.results && data.results.length > 0) {
        imageUrl = data.results[0].background_image || null;
      }

      // Store in global cache
      coverCache[cacheKey] = imageUrl;

      if (isMounted) {
        setCoverUrl(imageUrl);
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [title, platform]);

  return { coverUrl, loading };
}
export default useCover;
