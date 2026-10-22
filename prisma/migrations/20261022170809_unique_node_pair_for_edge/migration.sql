/*
  Warnings:

  - A unique constraint covering the columns `[source,target]` on the table `Edge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Edge_source_target_key" ON "Edge"("source", "target");
