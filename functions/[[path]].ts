type PagesContext = {
  request: Request;
  env: {
    ASSETS: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
    };
  };
  next: () => Promise<Response>;
};

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const url = new URL(context.request.url);

  // If it's a file request (has an extension), let Pages handle it normally.
  // Examples: /assets/app.css, /favicon.ico, /robots.txt
  const lastSegment = url.pathname.split('/').pop() ?? '';
  const looksLikeAsset = lastSegment.includes('.') && !lastSegment.endsWith('.html');
  if (looksLikeAsset) {
    return context.next();
  }

  // Otherwise serve the SPA entry so client-side routing can handle /app, /app/... etc.
  return context.env.ASSETS.fetch(new URL('/index.html', url), context.request);
};
