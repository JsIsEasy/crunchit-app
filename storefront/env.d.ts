declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SERVER_URL: string;
    NEXT_PUBLIC_FILE_UPLOAD_URL: string;
    NEXT_PUBLIC_LOGIN_URL: string;
    NEXT_PUBLIC_STATUS_URL: string;
    NEXT_PUBLIC_HTTP_PROTOCOL: string;
    NEXT_PUBLIC_WS_PROTOCOL: string;
  }
}
