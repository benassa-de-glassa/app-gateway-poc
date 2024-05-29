import { z } from 'zod';
import { AuthenticationToken } from '../authentication/token-verifiers/token-verifier';

export function validateSessionToken(
  token: AuthenticationToken
): asserts token is { sessionClaims: { sessionId: string; activityExtensionInMs: number } } {
  z.object({ sessionClaims: z.object({ sessionId: z.string() }) }).parse(token);
}
