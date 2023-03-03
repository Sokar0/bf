declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'local' | 'dev' | 'prd';
      HTTP_PORT?: number | 3123;
      HTTPS_PORT?: number | 10555;
      ALLOWED_ORIGINS?: [];
      POSTGRES_DB_LOGGING?: boolean | false;
      POSTGRES_DB_SYNCHRONIZE?: boolean | false;
    }
  }
}

export { };
