import app from '../server/app.js'

// Vercel catch-all serverless function: every /api/* request lands here,
// and Express's own router (mounted paths in server/app.js) does the real
// routing from there. An Express app is itself a valid (req, res) handler.
export default app
