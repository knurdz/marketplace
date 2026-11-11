CREATE TABLE `auth_rate_limit` (
	`id` varchar(36) NOT NULL,
	`rate_limit_key` varchar(255) NOT NULL,
	`count` int NOT NULL,
	`last_request` bigint NOT NULL,
	CONSTRAINT `auth_rate_limit_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_rate_limit_rate_limit_key_unique` UNIQUE(`rate_limit_key`)
);
