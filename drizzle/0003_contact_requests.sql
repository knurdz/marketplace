DROP TABLE IF EXISTS `messages`;--> statement-breakpoint
DROP TABLE IF EXISTS `threads`;--> statement-breakpoint
DROP TABLE IF EXISTS `coupon_redemptions`;--> statement-breakpoint
DROP TABLE IF EXISTS `coupons`;--> statement-breakpoint
DROP TABLE IF EXISTS `payhere_notify_logs`;--> statement-breakpoint
DROP TABLE IF EXISTS `bank_slips`;--> statement-breakpoint
DROP TABLE IF EXISTS `payments`;--> statement-breakpoint
DROP TABLE IF EXISTS `order_items`;--> statement-breakpoint
DROP TABLE IF EXISTS `orders`;--> statement-breakpoint
DROP TABLE IF EXISTS `cart_items`;--> statement-breakpoint
DROP TABLE IF EXISTS `carts`;--> statement-breakpoint
DROP TABLE IF EXISTS `reviews`;--> statement-breakpoint
ALTER TABLE `seller_profiles` DROP COLUMN `bank_account_name`;--> statement-breakpoint
ALTER TABLE `seller_profiles` DROP COLUMN `bank_account_number`;--> statement-breakpoint
ALTER TABLE `seller_profiles` DROP COLUMN `bank_name`;--> statement-breakpoint
ALTER TABLE `seller_profiles` DROP COLUMN `bank_transfer_notes`;--> statement-breakpoint
CREATE TABLE `purchase_requests` (
	`id` varchar(36) NOT NULL,
	`buyer_id` varchar(36) NOT NULL,
	`seller_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`title` varchar(200) NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` decimal(12,2) NOT NULL,
	`currency` varchar(8) NOT NULL,
	`status` enum('requested','sold','cancelled') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_requests_id` PRIMARY KEY(`id`)
);--> statement-breakpoint
CREATE INDEX `purchase_requests_buyer_id_idx` ON `purchase_requests` (`buyer_id`);--> statement-breakpoint
CREATE INDEX `purchase_requests_seller_id_idx` ON `purchase_requests` (`seller_id`);--> statement-breakpoint
CREATE INDEX `purchase_requests_product_id_idx` ON `purchase_requests` (`product_id`);--> statement-breakpoint
CREATE INDEX `purchase_requests_status_idx` ON `purchase_requests` (`status`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(36) NOT NULL,
	`request_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`buyer_id` varchar(36) NOT NULL,
	`seller_id` varchar(36) NOT NULL,
	`product_rating` int NOT NULL,
	`seller_rating` int,
	`comment` varchar(2000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);--> statement-breakpoint
CREATE INDEX `reviews_product_id_idx` ON `reviews` (`product_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_request_buyer_product_unique` ON `reviews` (`request_id`,`buyer_id`,`product_id`);
