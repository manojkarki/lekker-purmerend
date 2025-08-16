const { parse } = require("pg-connection-string");

module.exports = ({ env }) => {
  // Use postgres hostname when running in Docker, localhost when running on host
  const defaultUrl = process.env.NODE_ENV === 'development' && process.env.DATABASE_HOST 
    ? `postgresql://medusa:medusa@${process.env.DATABASE_HOST}:5432/strapi`
    : "postgresql://medusa:medusa@localhost:5432/strapi";
    
  const { host, port, database, user, password } = parse(
    env("STRAPI_DATABASE_URL", defaultUrl)
  );

  return {
    connection: {
      client: "postgres",
      connection: {
        host,
        port,
        database,
        user,
        password,
        ssl: env.bool("DATABASE_SSL", false) && {
          key: env("DATABASE_SSL_KEY", undefined),
          cert: env("DATABASE_SSL_CERT", undefined),
          ca: env("DATABASE_SSL_CA", undefined),
          caname: env("DATABASE_SSL_CANAME", undefined),
          rejectUnauthorized: env.bool("DATABASE_SSL_REJECT_UNAUTHORIZED", true),
        },
      },
      debug: false,
    },
  };
};