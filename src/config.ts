import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './types';

export function loadEnvironment() {
  dotenv.config();

  const orgUrl = process.env.ADO_ORG_URL;
  const pat = process.env.ADO_PAT;

  if (!orgUrl || !pat) {
    throw new Error('ADO_ORG_URL and ADO_PAT environment variables are required.');
  }

  return { orgUrl, pat };
}

export function loadConfig(configPath: string = 'config.json'): Config {
  const fullPath = path.resolve(process.cwd(), configPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Configuration file not found at ${fullPath}`);
  }

  const rawConfig = fs.readFileSync(fullPath, 'utf8');
  try {
    const config: Config = JSON.parse(rawConfig);
    // Basic validation
    if (!config.projects || !Array.isArray(config.projects)) {
      throw new Error('Config must contain a "projects" array.');
    }
    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse configuration file ${fullPath}: Invalid JSON`);
    }
    throw error;
  }
}
