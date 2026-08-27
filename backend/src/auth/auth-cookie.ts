import type { CookieOptions } from 'express';
import { REFRESH_COOKIE_PATH, REFRESH_TOKEN_DAYS } from '../common/constants';

export function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    path: REFRESH_COOKIE_PATH,
  };
}
