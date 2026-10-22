/*
  Warnings:

  - Changed the type of `type` on the `Node` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('TRIGGER', 'HTTP_REQUEST', 'TRANSFORM', 'CONDITION', 'DELAY');

-- CreateEnum
CREATE TYPE "NodeSubType" AS ENUM ('MANUAL_TRIGGER', 'WEBHOOK_TRIGGER', 'CRON_TRIGGER');

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "subType" "NodeSubType",
DROP COLUMN "type",
ADD COLUMN     "type" "NodeType" NOT NULL;
