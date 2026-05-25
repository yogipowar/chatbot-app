export async function crawlSite(url, options = {}) {
  const response = await fetch('http://localhost:5000/crawl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      maxPages: options.maxPages || 20,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to crawl')
  }

  return data
}