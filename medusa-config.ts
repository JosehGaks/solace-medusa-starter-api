import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

const dynamicModules = {};

// const stripeApiKey = process.env.STRIPE_API_KEY;
// const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY

const isPaystackConfigured = Boolean(PAYSTACK_SECRET_KEY) && Boolean(PAYSTACK_PUBLIC_KEY);

if (isPaystackConfigured) {
  console.log('Paystack configured, Enabling payment module');
  dynamicModules[Modules.PAYMENT] = {
    resolve: '@medusajs/medusa/payment',
    options: {
      providers: [
        // {
        //   resolve: '@medusajs/medusa/payment-stripe',
        //   id: 'stripe',
        //   options: {
        //     apiKey: stripeApiKey,
        //     webhookSecret: stripeWebhookSecret
        //   }
        // },
        {
          resolve: "medusa-payment-paystack",
          id: "paystack",
          options: {
            secret_key: PAYSTACK_SECRET_KEY,
            public_key: PAYSTACK_PUBLIC_KEY,
          } satisfies import("medusa-payment-paystack").PluginOptions,
        },
      ]
    }
  };
}

const modules = {
  [Modules.FILE]: {
    resolve: '@medusajs/medusa/file',
    options: {
      providers: [
        {
          resolve: '@medusajs/medusa/file-s3',
          id: 's3',
          options: {
            file_url: process.env.S3_FILE_URL,
            access_key_id: process.env.S3_ACCESS_KEY_ID,
            secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
            region: process.env.S3_REGION,
            bucket: process.env.S3_BUCKET,
            endpoint: process.env.S3_ENDPOINT
          }
        }
      ]
    }
  },
  [Modules.NOTIFICATION]: {
    resolve: '@medusajs/medusa/notification',
    options: {
      providers: [
        {
          resolve: './src/modules/resend-notification',
          id: 'resend-notification',
          options: {
            channels: ['email'],
            apiKey: process.env.RESEND_API_KEY,
            fromEmail: process.env.RESEND_FROM_EMAIL,
            replyToEmail: process.env.RESEND_REPLY_TO_EMAIL,
            toEmail: process.env.TO_EMAIL,
            enableEmails: process.env.ENABLE_EMAIL_NOTIFICATIONS
          }
        }
      ]
    }
  }
};

module.exports = defineConfig({
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
    disable: process.env.DISABLE_MEDUSA_ADMIN === 'true'
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret'
    }
  },
  modules: {
    ...dynamicModules,
    ...modules
  }
});
