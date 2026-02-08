-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('ios', 'android');

-- CreateEnum
CREATE TYPE "PushTokenType" AS ENUM ('expo', 'fcm', 'apns');

-- CreateTable
CREATE TABLE "UserDevice" (
    "id" TEXT NOT NULL,
    "pushToken" TEXT,
    "pushTokenType" "PushTokenType",
    "deviceName" TEXT,
    "deviceModel" TEXT,
    "deviceBrand" TEXT,
    "platform" "Platform" NOT NULL,
    "osVersion" TEXT,
    "appVersion" TEXT,
    "appBuildNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_pushToken_key" ON "UserDevice"("pushToken");

-- CreateIndex
CREATE INDEX "UserDevice_userId_idx" ON "UserDevice"("userId");

-- CreateIndex
CREATE INDEX "UserDevice_pushToken_idx" ON "UserDevice"("pushToken");

-- CreateIndex
CREATE INDEX "UserDevice_isActive_idx" ON "UserDevice"("isActive");

-- AddForeignKey
ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
