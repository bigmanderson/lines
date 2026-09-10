const allowed = new Set([
  "https://lines-web.inspatial.app",
  "http://localhost:5176",
  "http://127.0.0.1:5176",
]);

/** Cloud 0.9.12 stores allowedOrigins as an array, so core CORS `.has()` never matches. */
export const vueCors = {
  name: "linesVueCors",
  description: "Echo Origin so the Vue app on a second domain can call this Cloud",
  handler(_app: unknown, inRequest: { origin: string }, inResponse: { setAllowOrigin(origin: string): void }) {
    const origin = inRequest.origin;
    if (!origin || !allowed.has(origin)) return;
    inResponse.setAllowOrigin(origin);
  },
};
