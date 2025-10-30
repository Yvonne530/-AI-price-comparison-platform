import { SignJWT, jwtVerify } from 'jose';
import { config } from '@/config/config';

const SECRET = new TextEncoder().encode(config.jwt.secret);

export interface JWTPayload {
  sub: string; // 用户ID
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 7天过期

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as JWTPayload;
  } catch (error) {
    throw new Error('无效的token');
  }
}