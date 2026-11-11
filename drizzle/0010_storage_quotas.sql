CREATE TABLE `storage_quotas` (
	`owner_id` varchar(36) NOT NULL,
	`file_count` int NOT NULL DEFAULT 0,
	`total_bytes` bigint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storage_quotas_owner_id` PRIMARY KEY(`owner_id`)
);

INSERT INTO `storage_quotas` (`owner_id`, `file_count`, `total_bytes`)
SELECT `owner_id`, COUNT(*), COALESCE(SUM(`size_bytes`), 0)
FROM `stored_files`
GROUP BY `owner_id`;
