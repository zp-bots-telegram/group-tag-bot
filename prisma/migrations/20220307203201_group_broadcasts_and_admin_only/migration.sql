-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "adminOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "broadcasts" BOOLEAN NOT NULL DEFAULT true;
