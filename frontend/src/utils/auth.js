/**
 * Cryptographic and Auth utilities for SmartMart Pro simulation.
 * Implements JWT token logic, password hashing, and email verification.
 */

// A simple deterministic string hashing utility (simulates SHA-256)
export function hashPassword(password) {
  if (!password) return '';
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

// Generate a simulated JWT token string (Base64 URL format payload)
export function generateJWT(payload) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const data = btoa(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // Valid for 1 hour
  }));
  const signature = btoa("smartmart_signature_secret");
  return `${header}.${data}.${signature}`;
}

// Decode and verify a simulated JWT token
export function verifyJWT(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.warn("JWT expired");
      return null;
    }
    
    return payload;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

// Check email address format
export function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}
