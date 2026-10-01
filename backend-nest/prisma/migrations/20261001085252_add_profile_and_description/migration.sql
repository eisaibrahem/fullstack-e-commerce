-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "imagePublicId" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT;
