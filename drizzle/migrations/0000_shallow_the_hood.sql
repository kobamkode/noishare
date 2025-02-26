CREATE TABLE `playlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`owner` text NOT NULL,
	`imageUrl` text NOT NULL,
	`playlistId` text NOT NULL,
	`playlistExtUrl` text NOT NULL,
	`collaborative` integer NOT NULL,
	`created` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
