CREATE TABLE `message` (
	`userFrom` VARCHAR(100) NOT	NULL,
	`userTo` VARCHAR(100) NOT NULL,
	`message` VARCHAR(10000),
	`time` DATETIME NOT NULL,
	`isGroup` TINYINT(1)
)