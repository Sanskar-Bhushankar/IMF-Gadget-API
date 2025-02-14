/*
  Warnings:

  - The values [InUse,Maintenance] on the enum `GadgetStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "GadgetStatus_new" AS ENUM ('Available', 'Deployed', 'Destroyed', 'Decommissioned');
ALTER TABLE "Gadget" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Gadget" ALTER COLUMN "status" TYPE "GadgetStatus_new" USING ("status"::text::"GadgetStatus_new");
ALTER TYPE "GadgetStatus" RENAME TO "GadgetStatus_old";
ALTER TYPE "GadgetStatus_new" RENAME TO "GadgetStatus";
DROP TYPE "GadgetStatus_old";
ALTER TABLE "Gadget" ALTER COLUMN "status" SET DEFAULT 'Available';
COMMIT;

-- AlterTable
ALTER TABLE "Gadget" ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
