# Game acceptance service — contract

The app cannot run a real browser on its hosting, so generated games stay
`awaiting_acceptance` until an external service plays them and reports back.
This file is the contract that service must implement. Nothing here claims
the service exists yet.

## 1. App → service (request)

`POST {ACCEPTANCE_URL}/accept`
Headers: `Authorization: Bearer {ACCEPTANCE_TOKEN}` (shared secret, stored as a
backend secret on both sides), `Content-Type: application/json`.

```json
{
  "jobId": "uuid",
  "contentId": "uuid",
  "html": "<!doctype html>… the complete sandboxed game page …",
  "mechanic": "movement | snake | maze | fetch | …",
  "words": [{ "w": "苹果", "p": "ping2 guo3", "meaning": "apple" }],
  "checks": ["loads", "keyboard", "touch", "chinese-visible", "win", "lose", "restart", "focus-held-keys"],
  "callbackUrl": "https://<app>/api/public/game-acceptance"
}
```

The page runs in a sandboxed iframe (`sandbox="allow-scripts"`, no same-origin,
no network). The app injects `window.LAOSHU` before the game script:

```js
window.LAOSHU = {
  words: [...],                  // as above
  ruby(tokens, opts) -> html,    // the app's shared ruby renderer (src/lib/chinese/ruby.ts rubyHtml)
  report(event, data),           // postMessage to parent: "ready" | "round" | "win" | "lose" | "restart" | "error"
};
```

Games must not ship their own pinyin implementation.

## 2. What the service must do

1. Load `html` in headless Chromium at 390x844 (touch) and 1280x800 (keyboard).
2. Wait for `report("ready")` within 10 s.
3. Keyboard: hold arrow keys / WASD; confirm the player sprite position changes
   (compare canvas/DOM snapshots). Blur and refocus the window; confirm held keys
   are released (no runaway movement).
4. Touch: tap / swipe the on-screen controls; confirm movement.
5. Chinese visible: at least one `.laoshu-ruby` element (or ruby html from
   `LAOSHU.ruby`) is rendered and on screen.
6. Play to a `win` and to a `lose` (scripted or random walk, max 90 s each).
7. Trigger restart; confirm a new `ready`/`round` event.
8. Capture 3 screenshots and the console log.

## 3. Service → app (callback)

`POST {callbackUrl}` with header `X-Laoshu-Signature: hex(hmac_sha256(ACCEPTANCE_TOKEN, body))`.

```json
{
  "jobId": "uuid",
  "contentId": "uuid",
  "passed": true,
  "checks": { "loads": true, "keyboard": true, "touch": true, "chinese-visible": true, "win": true, "lose": true, "restart": true, "focus-held-keys": true },
  "failures": [{ "check": "touch", "detail": "no movement after swipe" }],
  "screenshots": ["https://… or data:image/png;base64,…"],
  "console": ["…"],
  "elapsedMs": 41234
}
```

The app verifies the signature, stores the result on the job, marks the game
`ready` only when `passed` is true, and otherwise runs one repair and resubmits.
