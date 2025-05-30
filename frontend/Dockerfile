# Latest bun image (hope it doesn't break)
FROM oven/bun:latest AS base
WORKDIR /usr/src/app

COPY package.json bun.lock ./

# Install bun dependencies
RUN bun install --frozen-lockfile

# Copy rest of application code
COPY . .

# Give ownership to bun
RUN chown -R bun:bun /usr/src/app

# Set user to bun
USER bun

# Expose port 3001
EXPOSE 3000

# Run the application
CMD ["bun", "run", "dev"]
