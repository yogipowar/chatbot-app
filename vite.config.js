import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/api/fetch': {
        target: 'https://example.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const url = new URL(req.url, 'http://localhost')
            const targetUrl = url.searchParams.get('url')

            if (targetUrl) {
              proxyReq.path = new URL(targetUrl).pathname
            }
          })
        },
      },
    },
  },
})