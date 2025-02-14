-- CreateEnum
CREATE TYPE "GadgetStatus" AS ENUM ('Available', 'InUse', 'Maintenance', 'Decommissioned');

-- CreateTable
CREATE TABLE "Gadget" (
    "id" UUID NOT NULL,
    "codename" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "GadgetStatus" NOT NULL DEFAULT 'Available',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decommissioned_at" TIMESTAMPTZ,
    "last_mission_date" TIMESTAMPTZ,

    CONSTRAINT "Gadget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gadget_codename_key" ON "Gadget"("codename");
