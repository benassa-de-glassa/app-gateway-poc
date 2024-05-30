import { createSecretKey } from 'crypto';
import * as jose from 'jose';

const payload = {
  sessionClaims: {
    sessionId: 'cc82da41-8f66-4ea3-b12a-41a372aeba64',
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
