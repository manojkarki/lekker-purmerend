module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', env('STRAPI_ADMIN_JWT_SECRET')),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', env('STRAPI_API_TOKEN_SALT')),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', env('API_TOKEN_SALT')),
    },
  },
});