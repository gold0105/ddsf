import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./server",
  // 서버 전용 설정. 배포 시 NITRO_AI_BASE_URL / NITRO_AI_API_KEY / NITRO_AI_MODEL
  // 환경변수로 덮어씁니다. 값은 서버에서만 읽히며 클라이언트 번들에 포함되지 않습니다.
  runtimeConfig: {
    aiBaseUrl: "",
    aiApiKey: "",
    aiModel: "",
  },
});
