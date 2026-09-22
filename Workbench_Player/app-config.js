/* ============================================================
   PUBLIC config — safe to commit. Contains NO secrets/keys.
   Both URLs point at your PRIVATE backend (Netlify), where the
   real Ably key lives as a server-side environment variable.
   Leave both BLANK to run in local/dev mode against sample data.
   ============================================================ */
window.APP_CONFIG = {
  // Mints short-lived Ably tokens (the real Ably API key stays server-side, never here):
  tokenUrl: "https://modelware-quiz-api.netlify.app/.netlify/functions/ably-token",

  // Serves private quiz/flashcard JSON, CORS-locked to your app's origin:
  assetApi: "https://modelware-quiz-api.netlify.app/.netlify/functions/asset",

  // Which private assets this deployment loads (relative to the backend's data/ dir):
  quizPath:  "ai-activate-2026-addressing-bias-in-intelligent-systems/AI Quiz.json",
  cardsPath: "ai-activate-2026-addressing-bias-in-intelligent-systems/Bias Flashcards.json",

  // Session behaviour (not secret):
  questionSeconds: 20,
  brand: "datasherpa",
  joinBaseUrl: ""   // "" = auto-derive from where the page is hosted
};
