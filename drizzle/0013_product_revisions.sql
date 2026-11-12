CREATE TABLE `product_revisions` (
	`id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`patch` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_revisions_id` PRIMARY KEY(`id`)
);--> statement-breakpoint
CREATE UNIQUE INDEX `product_revisions_product_id_unique` ON `product_revisions` (`product_id`);--> statement-breakpoint
CREATE INDEX `product_revisions_updated_at_idx` ON `product_revisions` (`updated_at`);
