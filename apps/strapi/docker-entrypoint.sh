#!/bin/sh

echo "Setting up Strapi development environment..."

# Copy built node_modules to volume if it's empty
if [ ! -f "/usr/src/app/node_modules/@strapi/strapi/package.json" ] && [ -d "/tmp/node_modules" ]; then
    echo "Copying pre-built node_modules to volume..."
    cp -r /tmp/node_modules/* /usr/src/app/node_modules/
    echo "node_modules copied successfully"
    
    # Rebuild sharp for the current architecture
    echo "Rebuilding sharp for current architecture..."
    cd /usr/src/app && pnpm rebuild sharp
elif [ ! -f "/usr/src/app/node_modules/@strapi/strapi/package.json" ]; then
    echo "node_modules not found, installing dependencies..."
    pnpm install --no-frozen-lockfile
    echo "Rebuilding sharp for current architecture..."
    pnpm rebuild sharp
else
    echo "Dependencies already available, starting Strapi..."
fi

echo "Starting Strapi in development mode..."

# Execute the command passed to the container
exec "$@"