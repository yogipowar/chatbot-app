export async function crawlSite(url, options = {}) {

  const { onProgress, maxPages = 20 } = options;

  let current = 0;

  // Fake progress animation
  const interval = setInterval(() => {

    current++;

    if (onProgress) {
      onProgress(current, maxPages);
    }

    if (current >= maxPages) {
      clearInterval(interval);
    }

  }, 1000);

  const response = await fetch('http://localhost:5000/crawl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      maxPages,
    }),
  });

  clearInterval(interval);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to crawl');
  }

  // Final progress
  if (onProgress) {
    onProgress(maxPages, maxPages);
  }

  return data;
}