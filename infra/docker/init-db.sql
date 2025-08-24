-- ==============================================================================
-- LEKKER PURMEREND - DATABASE INITIALIZATION
-- ==============================================================================
-- 
-- Creates multiple databases for Medusa and Strapi on the same PostgreSQL instance
-- This script runs automatically when the PostgreSQL container starts for the first time
-- 
-- ==============================================================================

-- Create Strapi database if it doesn't exist
CREATE DATABASE strapi;

-- Grant permissions to the medusa user for both databases
GRANT ALL PRIVILEGES ON DATABASE medusa TO medusa;
GRANT ALL PRIVILEGES ON DATABASE strapi TO medusa;

-- Connect to strapi database and set up permissions
\c strapi;
GRANT ALL ON SCHEMA public TO medusa;

-- Connect back to medusa database
\c medusa;
GRANT ALL ON SCHEMA public TO medusa;