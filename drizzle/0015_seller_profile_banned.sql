ALTER TABLE `seller_profiles` MODIFY `status` enum('pending','rejected','approved','banned') NOT NULL;--> statement-breakpoint
UPDATE `seller_profiles` AS `sp`
INNER JOIN `user` AS `u` ON `u`.`id` = `sp`.`user_id`
SET `sp`.`status` = 'banned'
WHERE `sp`.`status` = 'rejected' AND `u`.`disabled` = true;
