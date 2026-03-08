-- CreateTable
CREATE TABLE "Flan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "mapsUrl" TEXT NOT NULL,
    "photoUrl" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tried" BOOLEAN NOT NULL DEFAULT false,
    "triedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flan_pkey" PRIMARY KEY ("id")
);
