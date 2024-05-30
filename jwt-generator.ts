import { createSecretKey } from 'crypto';
import * as jose from 'jose';

const payload = {
  sessionClaims: {
    sessionId: '2f33a590-1d2b-4bee-8142-361378c743dd',
    activityExtensionInMs: 10 * 60 * 1000
  }
};

export const generateJwt = async (payload: any) => {
  const JWT_SECRET = 'not-very-secret-key';
  const secretKey = createSecretKey(JWT_SECRET, 'utf-8');

  const jwt = await new jose.SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuer('me').sign(secretKey);

  return jwt;
};

generateJwt(payload).then(console.log);
