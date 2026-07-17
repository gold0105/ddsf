import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";
import { readBody, getMethod } from "nitro/h3";

const jsonError = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// 기본값은 AI 챌린지 게이트웨이. 배포 환경에서는 NITRO_AI_* 환경변수로 덮어씁니다.
const DEFAULT_BASE_URL = "http://114.110.181.212/gateway/mlflow/v1";
const DEFAULT_API_KEY = "ai-challenge";
const DEFAULT_MODEL = "ai-challenge";

export default defineHandler(async (event) => {
  if (getMethod(event) !== "POST") {
    return jsonError(405, { error: "Method not allowed" });
  }

  const body = await readBody<{ messages?: unknown[]; temperature?: number; max_tokens?: number }>(event);

  if (!body?.messages || !Array.isArray(body.messages)) {
    return jsonError(400, { error: "messages array is required" });
  }

  const config = useRuntimeConfig(event);
  const baseUrl = config.aiBaseUrl || DEFAULT_BASE_URL;
  const apiKey = config.aiApiKey || DEFAULT_API_KEY;
  const model = config.aiModel || DEFAULT_MODEL;

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

    if (!response.ok) {
      const errorText = await response.text();
      return jsonError(response.status, {
        error: `AI API error: ${response.status}`,
        detail: errorText.slice(0, 200),
      });
    }

    const rawText = await response.text();

    try {
      // OpenAI 호환 응답을 그대로 통과시켜 클라이언트가 파싱하도록 함
      return JSON.parse(rawText);
    } catch {
      return jsonError(502, {
        error: "Invalid JSON from AI API",
        detail: rawText.slice(0, 200),
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(502, { error: "Fetch failed", detail: message });
  }
});