import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET || 'dev-only-change-this-beacon-secret';
export const signToken = (user) => jwt.sign({ sub: user.id, username: user.username }, secret, { expiresIn: '7d' });
export function authenticate(req, res, next) {
  try { req.user = jwt.verify((req.headers.authorization || '').replace(/^Bearer /, ''), secret); next(); }
  catch { res.status(401).json({ message: 'Your session is invalid or expired.' }); }
}
export function verifyToken(token) { return jwt.verify(token, secret); }
