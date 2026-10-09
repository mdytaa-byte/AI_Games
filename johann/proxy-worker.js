/*
  Johann school proxy: a Cloudflare Worker that lets students use Johann
  without their own Anthropic API key. Setup steps are in johann/README.md.

  Worker settings (Settings → Variables and Secrets):
    ANTHROPIC_API_KEY  (secret)    your school's Anthropic API key
    CLASS_CODE         (secret)    optional; students type it into Johann
    ALLOWED_ORIGIN     (variable)  optional; e.g. https://yourname.github.io
*/

const MODELS = ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"];
const MAX_TOKENS = 16000;

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, anthropic-version, anthropic-beta, x-johann-code",
      "Access-Control-Max-Age": "86400"
    };
    const fail = (status, message) =>
      new Response(JSON.stringify({ error: { message } }), {
        status,
        headers: { ...cors, "content-type": "application/json" }
      });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return fail(405, "Method not allowed");
    if (env.CLASS_CODE && request.headers.get("x-johann-code") !== env.CLASS_CODE) {
      return fail(401, "Wrong class code");
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return fail(400, "Invalid JSON");
    }

    // Keep the key from being used for anything bigger than a tutoring chat.
    if (!MODELS.includes(body.model)) body.model = MODELS[0];
    body.max_tokens = Math.min(Number(body.max_tokens) || 4000, MAX_TOKENS);
    delete body.tools;
    delete body.mcp_servers;
    delete body.container;

    const headers = {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    };
    const beta = request.headers.get("anthropic-beta");
    if (beta === "server-side-fallback-2026-07-01") headers["anthropic-beta"] = beta;

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...cors,
        "content-type": upstream.headers.get("content-type") || "application/json",
        "cache-control": "no-store"
      }
    });
  }
};
