CREATE TABLE `audit_logs` (
	`id` varchar(36) NOT NULL,
	`actor_id` varchar(36),
	`event` varchar(128) NOT NULL,
	`resource_type` varchar(64) NOT NULL,
	`resource_id` varchar(36),
	`meta` varchar(4000),
	`ip` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(64) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` varchar(512),
	`password` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`ip_address` varchar(64),
	`user_agent` varchar(512),
	`user_id` varchar(36) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` varchar(512),
	`role` enum('buyer','seller','admin') NOT NULL DEFAULT 'buyer',
	`disabled` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bank_slips` (
	`id` varchar(36) NOT NULL,
	`payment_id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`file_id` varchar(64) NOT NULL,
	`uploaded_by` varchar(36) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL,
	`reviewed_by` varchar(36),
	`review_note` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_slips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` varchar(36) NOT NULL,
	`cart_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` decimal(12,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `cart_items_cart_product_unique` UNIQUE(`cart_id`,`product_id`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`seller_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carts_id` PRIMARY KEY(`id`),
	CONSTRAINT `carts_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`parent_id` varchar(36),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `coupon_redemptions` (
	`id` varchar(36) NOT NULL,
	`coupon_id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`buyer_id` varchar(36) NOT NULL,
	`discount_amount` decimal(12,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coupon_redemptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupon_redemptions_order_id_unique` UNIQUE(`order_id`),
	CONSTRAINT `coupon_redemptions_coupon_buyer_unique` UNIQUE(`coupon_id`,`buyer_id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` varchar(36) NOT NULL,
	`code` varchar(32) NOT NULL,
	`type` enum('percent','fixed') NOT NULL,
	`value` decimal(12,2) NOT NULL,
	`active` boolean NOT NULL,
	`max_redemptions` int NOT NULL,
	`redemption_count` int NOT NULL,
	`min_order_amount` decimal(12,2) NOT NULL,
	`expires_at` varchar(64),
	`created_by` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` varchar(36) NOT NULL,
	`thread_id` varchar(36) NOT NULL,
	`sender_id` varchar(36) NOT NULL,
	`body` varchar(2000) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` varchar(64) NOT NULL,
	`title` varchar(200) NOT NULL,
	`body` varchar(2000) NOT NULL,
	`read` boolean NOT NULL,
	`link` varchar(500),
	`meta` varchar(4000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`title` varchar(200) NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` decimal(12,2) NOT NULL,
	`line_total` decimal(12,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL,
	`buyer_id` varchar(36) NOT NULL,
	`seller_id` varchar(36) NOT NULL,
	`status` enum('pending_payment','payment_review','paid','processing','shipped','ready_pickup','completed','cancelled','refunded') NOT NULL,
	`total_amount` decimal(12,2) NOT NULL,
	`currency` varchar(8) NOT NULL,
	`shipping_address` varchar(2000) NOT NULL,
	`payment_method` enum('payhere','bank_transfer','free','cod') NOT NULL,
	`coupon_code` varchar(32),
	`discount_amount` decimal(12,2) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payhere_notify_logs` (
	`id` varchar(36) NOT NULL,
	`outcome` varchar(32) NOT NULL,
	`order_id` varchar(36),
	`payhere_payment_id` varchar(64),
	`status_code` varchar(8),
	`reason` varchar(64),
	`http_status` int NOT NULL,
	`sanitized_payload` varchar(2000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payhere_notify_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`method` enum('payhere','bank_transfer','free','cod') NOT NULL,
	`status` enum('pending','awaiting_verification','paid','failed','refunded') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(8) NOT NULL,
	`payhere_payment_id` varchar(128),
	`idempotency_key` varchar(128),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_idempotency_key_unique` UNIQUE(`idempotency_key`)
);
--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`id` varchar(36) NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` varchar(4000) NOT NULL,
	`description` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`file_id` varchar(64) NOT NULL,
	`sort_order` int NOT NULL,
	`alt` varchar(200),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`seller_id` varchar(36) NOT NULL,
	`category_id` varchar(36) NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`is_free` boolean NOT NULL,
	`status` enum('draft','pending_review','active','rejected','archived') NOT NULL,
	`stock` int NOT NULL,
	`available` boolean NOT NULL,
	`currency` varchar(8) NOT NULL,
	`featured` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`display_name` varchar(128) NOT NULL,
	`avatar_file_id` varchar(64),
	`phone` varchar(32),
	`bio` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` varchar(36) NOT NULL,
	`bucket` varchar(64) NOT NULL,
	`limit_key` varchar(256) NOT NULL,
	`window_start` int NOT NULL,
	`count` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rate_limits_id` PRIMARY KEY(`id`),
	CONSTRAINT `rate_limits_bucket_key_unique` UNIQUE(`bucket`,`limit_key`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` varchar(36) NOT NULL,
	`reporter_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`reason` varchar(200) NOT NULL,
	`details` varchar(2000),
	`status` enum('open','reviewing','resolved','dismissed') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`buyer_id` varchar(36) NOT NULL,
	`seller_id` varchar(36) NOT NULL,
	`product_rating` int NOT NULL,
	`seller_rating` int,
	`comment` varchar(2000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `reviews_order_buyer_product_unique` UNIQUE(`order_id`,`buyer_id`,`product_id`)
);
--> statement-breakpoint
CREATE TABLE `seller_profiles` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`shop_name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`bio` varchar(2000),
	`banner_file_id` varchar(64),
	`status` enum('pending','rejected','approved') NOT NULL,
	`bank_account_name` varchar(128),
	`bank_account_number` varchar(64),
	`bank_name` varchar(128),
	`bank_transfer_notes` varchar(2000),
	`rejection_reason` varchar(500),
	`return_policy` varchar(2000),
	`shipping_policy` varchar(2000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seller_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `seller_profiles_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `seller_profiles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `stored_files` (
	`id` varchar(36) NOT NULL,
	`bucket_id` varchar(64) NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`mime_type` varchar(128) NOT NULL,
	`size_bytes` int NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stored_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `threads` (
	`id` varchar(36) NOT NULL,
	`buyer_id` varchar(36) NOT NULL,
	`seller_id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`last_message_at` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `threads_id` PRIMARY KEY(`id`),
	CONSTRAINT `threads_order_id_unique` UNIQUE(`order_id`)
);
--> statement-breakpoint
CREATE TABLE `view_stats` (
	`id` varchar(36) NOT NULL,
	`seller_id` varchar(36) NOT NULL,
	`kind` enum('product','shop') NOT NULL,
	`target_id` varchar(36) NOT NULL,
	`day` varchar(10) NOT NULL,
	`count` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `view_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `view_stats_seller_kind_target_day_unique` UNIQUE(`seller_id`,`kind`,`target_id`,`day`)
);
--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wishlist_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `wishlist_items_user_product_unique` UNIQUE(`user_id`,`product_id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_logs_actor_id_idx` ON `audit_logs` (`actor_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_resource_idx` ON `audit_logs` (`resource_type`,`resource_id`);--> statement-breakpoint
CREATE INDEX `account_user_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_user_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `bank_slips_payment_id_idx` ON `bank_slips` (`payment_id`);--> statement-breakpoint
CREATE INDEX `bank_slips_order_id_idx` ON `bank_slips` (`order_id`);--> statement-breakpoint
CREATE INDEX `bank_slips_file_id_idx` ON `bank_slips` (`file_id`);--> statement-breakpoint
CREATE INDEX `cart_items_cart_id_idx` ON `cart_items` (`cart_id`);--> statement-breakpoint
CREATE INDEX `categories_parent_id_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `coupon_redemptions_coupon_id_idx` ON `coupon_redemptions` (`coupon_id`);--> statement-breakpoint
CREATE INDEX `messages_thread_id_idx` ON `messages` (`thread_id`);--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_user_read_idx` ON `notifications` (`user_id`,`read`);--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `orders_buyer_id_idx` ON `orders` (`buyer_id`);--> statement-breakpoint
CREATE INDEX `orders_seller_id_idx` ON `orders` (`seller_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `payhere_notify_logs_outcome_idx` ON `payhere_notify_logs` (`outcome`);--> statement-breakpoint
CREATE INDEX `payhere_notify_logs_order_id_idx` ON `payhere_notify_logs` (`order_id`);--> statement-breakpoint
CREATE INDEX `payments_order_id_idx` ON `payments` (`order_id`);--> statement-breakpoint
CREATE INDEX `product_images_product_id_idx` ON `product_images` (`product_id`);--> statement-breakpoint
CREATE INDEX `products_seller_id_idx` ON `products` (`seller_id`);--> statement-breakpoint
CREATE INDEX `products_category_id_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `products_status_category_idx` ON `products` (`status`,`category_id`);--> statement-breakpoint
CREATE INDEX `products_price_idx` ON `products` (`price`);--> statement-breakpoint
CREATE INDEX `products_featured_idx` ON `products` (`featured`,`status`);--> statement-breakpoint
CREATE INDEX `reports_status_idx` ON `reports` (`status`);--> statement-breakpoint
CREATE INDEX `reports_product_id_idx` ON `reports` (`product_id`);--> statement-breakpoint
CREATE INDEX `reviews_product_id_idx` ON `reviews` (`product_id`);--> statement-breakpoint
CREATE INDEX `seller_profiles_status_idx` ON `seller_profiles` (`status`);--> statement-breakpoint
CREATE INDEX `stored_files_bucket_idx` ON `stored_files` (`bucket_id`);--> statement-breakpoint
CREATE INDEX `stored_files_owner_idx` ON `stored_files` (`owner_id`);--> statement-breakpoint
CREATE INDEX `threads_buyer_id_idx` ON `threads` (`buyer_id`);--> statement-breakpoint
CREATE INDEX `threads_seller_id_idx` ON `threads` (`seller_id`);--> statement-breakpoint
CREATE INDEX `view_stats_seller_id_idx` ON `view_stats` (`seller_id`);--> statement-breakpoint
CREATE INDEX `wishlist_items_user_id_idx` ON `wishlist_items` (`user_id`);--> statement-breakpoint
CREATE INDEX `wishlist_items_product_id_idx` ON `wishlist_items` (`product_id`);