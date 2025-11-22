-- CreateTable
CREATE TABLE "packaging_containers" (
    "id" TEXT NOT NULL,
    "semiFinishedId" TEXT NOT NULL,
    "containerType" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "capacityMl" DOUBLE PRECISION NOT NULL,
    "capacityWeightG" DOUBLE PRECISION NOT NULL,
    "currentQuantity" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "batchCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packaging_containers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "packaging_containers" ADD CONSTRAINT "packaging_containers_semiFinishedId_fkey" FOREIGN KEY ("semiFinishedId") REFERENCES "semi_finished_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
