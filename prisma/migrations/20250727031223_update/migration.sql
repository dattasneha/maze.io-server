/*
  Warnings:

  - Added the required column `roomCode` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "roomCode" TEXT NOT NULL;
