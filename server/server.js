const express = require('express')
const cors = require('cors')
const { crawlSite } = require('./crawler')

const app = express()

app.use(cors())
app.use(express.json())

app.post('/crawl', async (req, res) => {
  try {
    const { url, maxPages = 20 } = req.body

    if (!url) {
      return res.status(400).json({
        error: 'URL is required',
      })
    }

    const result = await crawlSite(url, maxPages)

    res.json(result)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      error: err.message || 'Failed to crawl website',
    })
  }
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})