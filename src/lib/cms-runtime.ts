export function cmsEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.CMS_ENABLED === 'true' && !!env.DATABASE_URL && (env.PAYLOAD_SECRET?.length ?? 0) >= 32;
}
