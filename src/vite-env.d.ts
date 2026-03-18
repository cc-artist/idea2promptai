/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_KEY: string;
  readonly VITE_PAYMENT_GATEWAY_KEY: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_CACHE_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
