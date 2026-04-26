// Vercel Serverless Function entrypoint.
// This bridges TanStack Start's built server bundle to Vercel's Node runtime.
//
// Note: TanStack Start's generated server entry is `dist/server/index.js`.
// We forward requests to that handler.

import handler from '../dist/server/index.js'

export default async function (req, res) {
  return handler(req, res)
}
