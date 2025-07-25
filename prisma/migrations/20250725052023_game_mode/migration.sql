/*
  Warnings:

  - The `values` column on the `GameModeOption` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "GameModeOption" DROP COLUMN "values",
ADD COLUMN     "values" TEXT[],
ALTER COLUMN "defaultValue" SET DATA TYPE TEXT;
