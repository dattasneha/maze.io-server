-- DropForeignKey
ALTER TABLE "GameModeOption" DROP CONSTRAINT "GameModeOption_gameModeId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_selectedMode_fkey";

-- DropForeignKey
ALTER TABLE "RoomOption" DROP CONSTRAINT "RoomOption_gameModeId_name_fkey";

-- DropForeignKey
ALTER TABLE "RoomOption" DROP CONSTRAINT "RoomOption_roomId_fkey";

-- CreateTable
CREATE TABLE "PlayerMove" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "selectedMode" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "col" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "PlayerMove_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameModeOption" ADD CONSTRAINT "GameModeOption_gameModeId_fkey" FOREIGN KEY ("gameModeId") REFERENCES "GameMode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_selectedMode_fkey" FOREIGN KEY ("selectedMode") REFERENCES "GameMode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomOption" ADD CONSTRAINT "RoomOption_gameModeId_name_fkey" FOREIGN KEY ("gameModeId", "name") REFERENCES "GameModeOption"("gameModeId", "key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomOption" ADD CONSTRAINT "RoomOption_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMove" ADD CONSTRAINT "PlayerMove_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMove" ADD CONSTRAINT "PlayerMove_selectedMode_fkey" FOREIGN KEY ("selectedMode") REFERENCES "GameMode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
