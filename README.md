<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PramaanBharat - India Verified News & Public Safety Intelligence

This contains everything you need to run your app locally.
https://ai.studio/apps/59f8fdfd-c71d-453a-a4ef-525edab828d4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Shared API storage

For consistent cache and AI quota state across serverless instances, configure an Upstash Redis database and set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in the deployment environment. Without them, local in-memory storage is used; it is suitable for development but does not persist or coordinate across production instances. The `/api/health` response reports the active storage mode.
