import { createProxyMiddleware } from 'http-proxy-middleware';

export const appProxy = (delayUrl: string) => {
  return createProxyMiddleware({
    target: delayUrl,
    changeOrigin: true,
    pathRewrite: { '^/app-gateway-service/delay-service': '' }
  });
};
