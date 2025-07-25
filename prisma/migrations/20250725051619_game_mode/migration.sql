-- CreateEnum
CREATE TYPE "GameOptionType" AS ENUM ('dropdown', 'number');

-- CreateTable
CREATE TABLE "GameMode" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "GameMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameModeOption" (
    "id" TEXT NOT NULL,
    "gameModeId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "GameOptionType" NOT NULL,
    "values" JSONB,
    "min" INTEGER,
    "max" INTEGER,
    "defaultValue" JSONB NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "GameModeOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameModeOption" ADD CONSTRAINT "GameModeOption_gameModeId_fkey" FOREIGN KEY ("gameModeId") REFERENCES "GameMode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
