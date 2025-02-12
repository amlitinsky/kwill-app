import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_URL_UNPOOLED: z.string().url(),
    PGHOST: z.string(),
    PGHOST_UNPOOLED: z.string(),
    PGUSER: z.string(),
    PGDATABASE: z.string(),
    PGPASSWORD: z.string(),
    
    // Vercel Postgres
    POSTGRES_URL: z.string().url(),
    POSTGRES_URL_NON_POOLING: z.string().url(),
    POSTGRES_USER: z.string(),
    POSTGRES_HOST: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DATABASE: z.string(),
    POSTGRES_URL_NO_SSL: z.string().url(),
    POSTGRES_PRISMA_URL: z.string().url(),
    
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    
    // Calendly
    CALENDLY_WEBHOOK_SECRET: z.string().min(1),
    CALENDLY_API_CLIENT_SECRET: z.string().min(1),
    
    // Qstash
    QSTASH_TOKEN: z.string().min(1),
    QSTASH_URL: z.string().url(),
    QSTASH_CURRENT_SIGNING_KEY: z.string().min(1),
    QSTASH_NEXT_SIGNING_KEY: z.string().min(1),
    
    // Recall + Zoom
    RECALL_API_KEY: z.string().min(1),
    RECALL_ZOOM_OAUTH_APP_ID: z.string().min(1),
    RECALL_WEBHOOK_SECRET: z.string().min(1),
    ZOOM_API_CLIENT_SECRET: z.string().min(1),
    
    // KV
    KV_REST_API_URL: z.string().url(),
    KV_REST_API_TOKEN: z.string().min(1),
    KV_REST_API_READ_ONLY_TOKEN: z.string().min(1),
    KV_URL: z.string().min(1),
    
    // Google
    GOOGLE_API_KEY: z.string().min(1),
    GOOGLE_API_CLIENT_SECRET: z.string().min(1),
    
    // Stripe
    STRIPE_API_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    
    // LLMs
    DEEPSEEK_API_KEY: z.string().min(1),
    ANTHROPIC_API_KEY: z.string().min(1),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
    // Clerk
    CLERK_SECRET_KEY: z.string().min(1),

    // Pusher
    // PUSHER_API_KEY: z.string().min(1),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // Calendly
    NEXT_PUBLIC_CALENDLY_API_CLIENT_ID: z.string().min(1),
    
    // Ngrok
    NEXT_PUBLIC_NGROK_URL: z.string().url(),
    
    // Zoom
    NEXT_PUBLIC_ZOOM_API_CLIENT_ID: z.string().min(1),
    
    // Google
    NEXT_PUBLIC_GOOGLE_API_CLIENT_ID: z.string().min(1),
    
    // Stripe
    NEXT_PUBLIC_STRIPE_API_PUBLISHABLE_KEY: z.string().min(1),

    // Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    PGHOST: process.env.PGHOST,
    PGHOST_UNPOOLED: process.env.PGHOST_UNPOOLED,
    PGUSER: process.env.PGUSER,
    PGDATABASE: process.env.PGDATABASE,
    PGPASSWORD: process.env.PGPASSWORD,
    
    // Vercel Postgres
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
    POSTGRES_URL_NO_SSL: process.env.POSTGRES_URL_NO_SSL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    
    NODE_ENV: process.env.NODE_ENV,
    
    // Calendly
    CALENDLY_WEBHOOK_SECRET: process.env.CALENDLY_WEBHOOK_SECRET,
    CALENDLY_API_CLIENT_SECRET: process.env.CALENDLY_API_CLIENT_SECRET,
    NEXT_PUBLIC_CALENDLY_API_CLIENT_ID: process.env.NEXT_PUBLIC_CALENDLY_API_CLIENT_ID,
    
    // Ngrok
    NEXT_PUBLIC_NGROK_URL: process.env.NEXT_PUBLIC_NGROK_URL,
    
    // Qstash
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    QSTASH_URL: process.env.QSTASH_URL,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
    
    // Recall + Zoom
    RECALL_API_KEY: process.env.RECALL_API_KEY,
    RECALL_ZOOM_OAUTH_APP_ID: process.env.RECALL_ZOOM_OAUTH_APP_ID,
    RECALL_WEBHOOK_SECRET: process.env.RECALL_WEBHOOK_SECRET,
    NEXT_PUBLIC_ZOOM_API_CLIENT_ID: process.env.NEXT_PUBLIC_ZOOM_API_CLIENT_ID,
    ZOOM_API_CLIENT_SECRET: process.env.ZOOM_API_CLIENT_SECRET,
    
    // KV
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
    KV_URL: process.env.KV_URL,
    
    // Google
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    GOOGLE_API_CLIENT_SECRET: process.env.GOOGLE_API_CLIENT_SECRET,
    NEXT_PUBLIC_GOOGLE_API_CLIENT_ID: process.env.GOOGLE_API_CLIENT_ID,
    
    // Stripe
    STRIPE_API_SECRET_KEY: process.env.STRIPE_API_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_API_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_API_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    
    // LLMs
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    // Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,

    // Pusher
    // PUSHER_API_KEY: process.env.PUSHER_API_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
