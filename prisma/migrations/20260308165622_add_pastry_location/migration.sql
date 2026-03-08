/*
  Warnings:

  - You are about to drop the column `location` on the `Flan` table. All the data in the column will be lost.
  - You are about to drop the column `mapsUrl` on the `Flan` table. All the data in the column will be lost.
  - Added the required column `locationId` to the `Flan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Flan" DROP COLUMN "location",
DROP COLUMN "mapsUrl",
ADD COLUMN     "locationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PastryLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mapsUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PastryLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Flan" ADD CONSTRAINT "Flan_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "PastryLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
