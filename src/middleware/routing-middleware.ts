import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';

export const appProxy = (delayUrl: string) => {
  return createProxyMiddleware({
    target: delayUrl,
    changeOrigin: true,
    pathRewrite: { '^/delay-service': '' },
    selfHandleResponse: true,
    on: {
      proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        // log original request and proxied request info
        const exchange = `[DEBUG] ${req.method} ${req.path} -> ${proxyRes.req.protocol}//${proxyRes.req.host}${proxyRes.req.path} [${proxyRes.statusCode}]`;
        console.log(exchange); // [DEBUG] GET / -> http://www.example.com [200]

        // log complete response
        const response = responseBuffer.toString('utf8');
        console.log(response); // log response body

        return responseBuffer;
      })
    }
  });
};
