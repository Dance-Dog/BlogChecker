# BlogChecker
###### (A quick little side-project of mine)
A bot that automatically stores and posts new Hytale Blogs to Discord.
To see it in action, you can join the "official" server **[here](https://discord.gg/MZVT7ke)**.

![roll-eyes]

## Steal It!
I left an example config in `src/config.js.example` and the table create statement below if you'd like to take it and make this bot your own!

#### In Your Database
In order to use this bot, you will need a MySQL database with the following table ~

```
CREATE TABLE `blogs` (
  `slug` varchar(200) DEFAULT NULL,
  `id` varchar(45) DEFAULT NULL,
  `featured` tinyint(4) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `published_at` varchar(45) DEFAULT NULL,
  `created_at` varchar(45) DEFAULT NULL,
  `excerpt` longtext,
  `tags` json DEFAULT NULL,
  
  `image_variants` json DEFAULT NULL,
  `image_id` varchar(45) DEFAULT NULL,
  `image_s3key` varchar(255) DEFAULT NULL,
  `image_mime_type` varchar(45) DEFAULT NULL,
  `image_attached` tinyint(4) DEFAULT NULL,
  `image_content_type` varchar(45) DEFAULT NULL,
  `image_content_id` varchar(45) DEFAULT NULL,
  `image_created_at` varchar(45) DEFAULT NULL,
  `image_v` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
```

[roll-eyes]: https://i.imgur.com/N75hEwB.png "Roll Eyes"