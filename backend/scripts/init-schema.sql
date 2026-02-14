-- Chạy file này một lần trên PostgreSQL (production) để tạo bảng khi synchronize bị tắt.
-- Ví dụ: psql $DATABASE_URL -f scripts/init-schema.sql
-- Hoặc dùng pgAdmin / Vercel Postgres dashboard chạy nội dung bên dưới.

-- Bảng users (auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  "isPremium" BOOLEAN NOT NULL DEFAULT false,
  "isAdmin" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bảng watch_progress (tiếp tục xem khi đăng nhập)
CREATE TABLE IF NOT EXISTS watch_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "movieId" VARCHAR(512) NOT NULL,
  episode INTEGER NOT NULL DEFAULT 1,
  "currentTimeSeconds" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" BIGINT NOT NULL,
  title VARCHAR(512),
  thumbnail VARCHAR(1024),
  "durationSeconds" INTEGER,
  UNIQUE ("userId", "movieId")
);

CREATE INDEX IF NOT EXISTS idx_watch_progress_user_updated
  ON watch_progress ("userId", "updatedAt" DESC);
