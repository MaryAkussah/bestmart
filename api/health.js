// Minimal diagnostic endpoint — no Express, no Supabase, just checks that
// a plain Vercel function invokes at all and can see its env vars. If this
// works but /api/products doesn't, the problem is in server/app.js's
// dependency chain, not Vercel's function setup itself.
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    nodeVersion: process.version,
  })
}
