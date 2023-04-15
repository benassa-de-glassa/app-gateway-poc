import * as express from 'express';

export function endRequest(response: express.Response, code: number, message: string): void {
  response.status(code).json({ code, message });
}
