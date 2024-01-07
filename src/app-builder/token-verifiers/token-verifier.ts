export type AuthenticationToken = Record<string, unknown>;

export interface TokenVerifier {
  verify(token: string): Promise<AuthenticationToken>;
}
