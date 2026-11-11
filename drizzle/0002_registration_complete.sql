ALTER TABLE `profiles` ADD `registration_complete` boolean NOT NULL DEFAULT false;--> statement-breakpoint
UPDATE `profiles` SET `registration_complete` = true;
