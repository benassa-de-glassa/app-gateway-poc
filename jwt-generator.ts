import { createSecretKey } from 'crypto';
import * as jose from 'jose';

const payload = {
  sessionClaims: {
    sessionId: '1374b882-8adb-415b-bb57-e0fe3b248810',
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
