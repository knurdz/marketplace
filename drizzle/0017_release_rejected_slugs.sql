UPDATE `seller_profiles`
SET `slug` = CONCAT('rejected-', `id`)
WHERE `status` = 'rejected'
  AND `slug` NOT LIKE 'rejected-%';
