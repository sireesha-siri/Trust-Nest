import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Discovers the absolute path to server/.env regardless of the current working directory
 * (whether executed from workspace root, server directory, or a subfolder).
 */
export function findServerEnvPath(): string | null {
  const candidatePaths = [
    path.resolve(process.cwd(), 'server/.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../.env'),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Loads environment configuration with clear, deterministic precedence:
 * 
 * PRECEDENCE RULES:
 * 1. Local Development (NODE_ENV !== 'production'):
 *    - `server/.env` is the AUTHORITATIVE configuration.
 *    - Values in `server/.env` explicitly override any inherited process/shell variables (`override: true`).
 *    - Editing `server/.env` and restarting the server is guaranteed to take effect immediately.
 * 
 * 2. Production (NODE_ENV === 'production'):
 *    - Container / Cloud platform environment variables (Render, Railway, Fly.io, AWS) take precedence.
 *    - `.env` files provide fallback values only if not already supplied by the host (`override: false`).
 */
export function loadServerEnv(): void {
  const isDev = (process.env.NODE_ENV || 'development') !== 'production';
  const serverEnvPath = findServerEnvPath();

  if (serverEnvPath) {
    // In local development, server/.env is authoritative (override: true)
    dotenv.config({ path: serverEnvPath, override: isDev });
  } else {
    dotenv.config({ override: isDev });
  }

  // Windows Node.js c-ares DNS fallback for MongoDB Atlas SRV resolution
  try {
    const currentServers = dns.getServers();
    if (!currentServers || currentServers.length === 0 || currentServers.includes('127.0.0.1')) {
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    }
  } catch {
    // Non-fatal if DNS override not permitted by environment
  }
}

// Automatically load on import
loadServerEnv();
