// Wraps an async route/middleware so a rejected promise reaches Express's
// error handling instead of crashing the function unhandled.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
