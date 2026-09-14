import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load env vars from .env.local so they're available at build time.
// Turbopack does not always propagate .env.local values into page-data
// collection workers, causing NEXT_PUBLIC_* vars to be undefined during
// prerender. Reading them here and injecting via `env` guarantees they are
// inlined at build time.
function loadEnvLocal(): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    const content = readFileSync(resolve(__dirname, ".env.local"), "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      // Only inject if the key is not already in process.env (shell env
      // takes precedence over .env files).
      if (!process.env[key]) {
        env[key] = value;
      }
    }
  } catch {
    // .env.local missing – rely on shell environment.
  }
  return env;
}

const nextConfig: NextConfig = {
  env: loadEnvLocal(),
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
