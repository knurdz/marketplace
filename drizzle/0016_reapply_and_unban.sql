CREATE TABLE `seller_application_attempts` (
	`id` varchar(36) NOT NULL,
	`seller_profile_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`shop_name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`bio` varchar(2000),
	`rejection_reason` varchar(500),
	`submitted_at` timestamp NOT NULL,
	`rejected_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seller_application_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `seller_app_attempts_profile_idx` ON `seller_application_attempts` (`seller_profile_id`);--> statement-breakpoint
CREATE INDEX `seller_app_attempts_user_idx` ON `seller_application_attempts` (`user_id`);--> statement-breakpoint
ALTER TABLE `products` ADD `hidden_by_shop_ban` boolean NOT NULL DEFAULT false;
