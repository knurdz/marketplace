ALTER TABLE `purchase_requests`
	ADD COLUMN `open_key` varchar(80) NULL;--> statement-breakpoint
UPDATE `purchase_requests` AS `pr`
JOIN (
	SELECT `id`,
		ROW_NUMBER() OVER (
			PARTITION BY `buyer_id`, `product_id`
			ORDER BY `created_at` ASC, `id` ASC
		) AS `row_number`
	FROM `purchase_requests`
	WHERE `status` = 'requested'
) AS `ranked` ON `ranked`.`id` = `pr`.`id`
SET `pr`.`status` = 'cancelled'
WHERE `ranked`.`row_number` > 1;--> statement-breakpoint
UPDATE `purchase_requests`
SET `open_key` = CONCAT(`buyer_id`, ':', `product_id`)
WHERE `status` = 'requested';--> statement-breakpoint
CREATE UNIQUE INDEX `purchase_requests_open_key_unique`
	ON `purchase_requests` (`open_key`);
