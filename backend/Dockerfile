# Latest bun image (hope it doesn't break)
FROM oven/bun:latest AS base
WORKDIR /usr/src/app

COPY package.json bun.lock ./

# Requirements for certain libs
RUN apt-get update && \
  apt-get install -y openssl && \
  rm -rf /var/lib/apt/lists/*

# Install bun dependencies
RUN bun install --frozen-lockfile

# Copy rest of application code
COPY . .

# Generate prisma client
RUN bunx prisma generate

# Give ownership to bun
RUN chown -R bun:bun /usr/src/app

# Set user to bun
USER bun

# Expose port 3001
EXPOSE 3001

# Run the application
CMD ["bun", "run", "start:container"]
