/*
  Warnings:

  - You are about to drop the `bookmarked_restaurants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `bookmarked_restaurants` DROP FOREIGN KEY `bookmarked_restaurants_restaurantId_fkey`;

-- DropForeignKey
ALTER TABLE `bookmarked_restaurants` DROP FOREIGN KEY `bookmarked_restaurants_userId_fkey`;

-- DropTable
DROP TABLE `bookmarked_restaurants`;

-- CreateTable
CREATE TABLE `archived_restaurants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `restaurantId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `archived_restaurants_userId_idx`(`userId`),
    INDEX `archived_restaurants_restaurantId_idx`(`restaurantId`),
    UNIQUE INDEX `archived_restaurants_userId_restaurantId_key`(`userId`, `restaurantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `archived_restaurants` ADD CONSTRAINT `archived_restaurants_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `archived_restaurants` ADD CONSTRAINT `archived_restaurants_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
