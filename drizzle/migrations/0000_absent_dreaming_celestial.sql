CREATE TABLE `playlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`username` text NOT NULL,
	`imageUrl` text NOT NULL,
	`created` integer NOT NULL
);
