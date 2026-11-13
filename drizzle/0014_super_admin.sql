ALTER TABLE `user` ADD `is_super_admin` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `user` ADD `super_admin_slot` tinyint AS (IF(`is_super_admin`, 1, NULL)) STORED;--> statement-breakpoint
CREATE UNIQUE INDEX `user_super_admin_slot_unique` ON `user` (`super_admin_slot`);
