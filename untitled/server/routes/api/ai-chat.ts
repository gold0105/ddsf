import { defineHandler } from "nitro";
import { readBody, getMethod } from "nitro/h3";

export default defineHandler(async (event) => {
  if (getMethod(event) !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await readBody<{ messages?: unknown[]; temperature?: number; max_tokens?: number }>(event);

  if (!body?.messages || !Array.isArray(body.messages)) {
    return new Response(JSON.stringify({ error: "messages array is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const baseUrl = "http://114.110.181.212/gateway/mlflow/v1";
  const apiKey = "ai-challenge";
  const model = "ai-challenge";

  console.log("[ai-chat] Calling:", `${baseUrl}/chat/completions`, "model:", model);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 600,
      }),
    });

    console.log("[ai-chat] Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai-chat] Error:", errorText);
      return new Response(
        JSON.stringify({ error: `AI API error: ${response.status}`, detail: errorText.slice(0, 200) }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const rawText = await response.text();
    console.log("[ai-chat] Raw response (first 600 chars):", rawText.slice(0, 600));

    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("[ai-chat] Failed to parse JSON response");
      return new Response(
        JSON.stringify({ error: "Invalid JSON from AI API", detail: rawText.slice(0, 200) }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Normalize OpenAI-compatible response
    const choices = (data as Record<string, unknown>)?.choices;
    console.log("[ai-chat] choices type:", typeof choices, "isArray:", Array.isArray(choices));

    // Pass through raw JSON so client can parse it
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ai-chat] Fetch error:", message);
    return new Response(
      JSON.stringify({ error: "Fetch failed", detail: message }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
});