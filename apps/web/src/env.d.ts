/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: "development" | "production" | "test";
  // добавь сюда свои переменные VITE_*
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
