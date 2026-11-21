ALTER TABLE `products` ADD `condition` enum('brand_new','used') DEFAULT 'used' NOT NULL;
CREATE INDEX `products_condition_idx` ON `products` (`condition`);
UPDATE `products` SET `condition` = 'brand_new' WHERE LOWER(`title`) LIKE '%brand new%';
ALTER TABLE `products` ALTER COLUMN `condition` SET DEFAULT 'brand_new';
