const DEFAULT_KV_API_BASE_URL = "https://i3qgw56auc.execute-api.ap-south-1.amazonaws.com/api/kv";

export const env = {
    kvApiBaseUrl: process.env.KV_API_BASE_URL || DEFAULT_KV_API_BASE_URL,
    localKvFilePath: process.env.LOCAL_KV_FILE_PATH || ".ticksy-kv-fallback.json",
    port: Number(process.env.PORT || 4000),
};
