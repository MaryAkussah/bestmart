export const PASSWORD_REQUIREMENTS_TEXT =
  'At least 8 characters, with an uppercase letter, a lowercase letter, a number, and a symbol.'

/**
 * Shared across Signup, SellerSignup, and ResetPassword so "strong
 * password" means the same thing everywhere — returns an error message, or
 * null if the password passes.
 */
export function getPasswordError(password) {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter'
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must include a number'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include a symbol (e.g. !@#$%)'
  return null
}

// Character sets skip visually-confusable characters (l/I/1, O/0) so a
// generated password is easy to retype if someone copies it by hand.
const LOWER = 'abcdefghijkmnpqrstuvwxyz'
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const DIGITS = '23456789'
const SYMBOLS = '!@#$%^&*-_=+?'

function randomChar(chars) {
  const index = crypto.getRandomValues(new Uint32Array(1))[0] % chars.length
  return chars[index]
}

/** A random password that always satisfies getPasswordError — one of each
 * required character class, then shuffled so they aren't in fixed positions. */
export function generatePassword(length = 14) {
  const all = LOWER + UPPER + DIGITS + SYMBOLS
  const chars = [randomChar(LOWER), randomChar(UPPER), randomChar(DIGITS), randomChar(SYMBOLS)]
  while (chars.length < length) chars.push(randomChar(all))

  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}
