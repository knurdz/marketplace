ALTER TABLE `products` ADD `condition` enum('brand_new','used') DEFAULT 'brand_new' NOT NULL;
CREATE INDEX `products_condition_idx` ON `products` (`condition`);
