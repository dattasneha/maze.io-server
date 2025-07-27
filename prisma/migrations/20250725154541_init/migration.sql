/*
  Warnings:

  - The primary key for the `GameModeOption` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `GameModeOption` table. All the data in the column will be lost.
  - Added the required column `gameModeId` to the `RoomOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameModeOption" DROP CONSTRAINT "GameModeOption_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "GameModeOption_pkey" PRIMARY KEY ("gameModeId", "key");

-- AlterTable
ALTER TABLE "RoomOption" ADD COLUMN     "gameModeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RoomOption" ADD CONSTRAINT "RoomOption_gameModeId_name_fkey" FOREIGN KEY ("gameModeId", "name") REFERENCES "GameModeOption"("gameModeId", "key") ON DELETE RESTRICT ON UPDATE CASCADE;
