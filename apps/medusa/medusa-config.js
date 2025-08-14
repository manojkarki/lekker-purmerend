const dotenv = require("dotenv")

let ENV_FILE_NAME = ""
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production"
    break
  case "staging":
    ENV_FILE_NAME = ".env.staging"
    break
  case "test":
    ENV_FILE_NAME = ".env.test"
    break
  case "development":
  default:
    ENV_FILE_NAME = ".env"
    break
}

try {
  // Try root level .env first (monorepo setup)
  dotenv.config({ path: "../../" + ENV_FILE_NAME })
} catch (e) {
  // Fallback to local .env
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME })
}

// CORS when consuming Medusa from admin
const ADMIN_CORS =
  process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001"

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:3000"

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://medusa:medusa@localhost:5432/medusa"

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,
  {
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: "uploads",
    },
  },
  {
    resolve: "@medusajs/admin",
    options: {
      autoRebuild: true,
      develop: {
        open: false,
      },
    },
  },
]

const modules = {
  eventBus: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },
}

// Add Stripe payment processor - temporarily disabled for debugging
// if (process.env.STRIPE_SECRET_KEY) {
//   plugins.push({
//     resolve: `medusa-payment-stripe`,
//     options: {
//       api_key: process.env.STRIPE_SECRET_KEY,
//       webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
//     },
//   })
// }

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig: {
    jwtSecret: process.env.JWT_SECRET,
    cookieSecret: process.env.COOKIE_SECRET,
    store_cors: STORE_CORS,
    database_url: DATABASE_URL,
    admin_cors: ADMIN_CORS,
    redis_url: REDIS_URL
  },
  plugins,
  modules,
}