-- AlterTable: Remove categoryId from Recipe (category replaced by tags)
ALTER TABLE "Recipe" DROP COLUMN IF EXISTS "categoryId";
