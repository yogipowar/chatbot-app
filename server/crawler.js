const puppeteer = require('puppeteer')
const cheerio = require('cheerio')

function normalizeUrl(url) {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`
  }
  return url
}

function cleanUrl(url) {
  return url.replace(/\/$/, '')
}

async function getPageData(browser, url) {
  const page = await browser.newPage()

  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  })

  const html = await page.content()

  const $ = cheerio.load(html)

  const title = $('title').text().trim()

  const content = []

  $('h1,h2,h3,h4,h5,h6,p,li').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim()

    if (!text) return

    const tag = el.tagName.toLowerCase()

    content.push({
      type: tag.startsWith('h') ? 'heading' : 'paragraph',
      text,
    })
  })

  const links = new Set()

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')

    if (!href) return

    try {
      const absoluteUrl = new URL(href, url).href

      if (new URL(absoluteUrl).hostname === new URL(url).hostname) {
        links.add(cleanUrl(absoluteUrl))
      }
    } catch {}
  })

  await page.close()

  return {
    url,
    title,
    content,
    links: [...links],
  }
}

async function crawlSite(startUrl, maxPages = 20) {
  startUrl = normalizeUrl(startUrl)

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

  const visited = new Set()
  const queue = [startUrl]

  const pages = []
  const errors = []

  while (queue.length > 0 && pages.length < maxPages) {
    const currentUrl = queue.shift()

    if (visited.has(currentUrl)) continue

    visited.add(currentUrl)

    try {
      console.log('Crawling:', currentUrl)

      const pageData = await getPageData(browser, currentUrl)

      pages.push(pageData)

      for (const link of pageData.links) {
        if (!visited.has(link) && !queue.includes(link)) {
          queue.push(link)
        }
      }
    } catch (err) {
      errors.push({
        url: currentUrl,
        message: err.message,
      })
    }
  }

  await browser.close()

  return {
    startUrl,
    totalPages: pages.length,
    pages,
    errors,
  }
}

module.exports = {
  crawlSite,
}