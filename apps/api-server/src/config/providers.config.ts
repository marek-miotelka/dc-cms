import { registerAs } from '@nestjs/config';
import { z } from 'zod';

/**
 * Zod schema for validating Google OAuth2 configuration
 * Ensures all required fields are present and properly formatted
 */
const googleConfigSchema = z.object({
  enabled: z.boolean(),
  config: z.object({
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CALLBACK_URL: z.string().url(),
  }),
});

export type GoogleConfig = z.infer<typeof googleConfigSchema>;

/**
 * Provider configuration registration
 * Loads and validates authentication provider settings from environment variables
 */
export default registerAs('providers', () => {
  const config = {
    google: {
      enabled: process.env.GOOGLE_AUTH_ENABLED === 'true',
      config: {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '',
      },
    },
  };

  // Validate Google configuration if enabled
  // Throws error if required fields are missing or invalid
  if (config.google.enabled) {
    googleConfigSchema.parse(config.google);
  }

  return config;
});
