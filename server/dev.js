// Local-only entry point — NOT used in production (Vercel calls
// api/[...path].js directly as a serverless function). Lets `server/app.js`
// run as a plain long-lived Node server during `npm run dev`, with Vite's
// dev server proxying /api/* to it (see vite.config.js).
import app from './app.js'

const port = process.env.API_PORT || 3001
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
