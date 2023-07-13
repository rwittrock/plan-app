CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `nodelogin`;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `admin` bool NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `accounts` (`id`, `username`, `password`, `admin`) VALUES (1, 'test', 'test', true);

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';

CREATE TABLE IF NOT EXISTS `tasks` (
	`id` int(11) NOT NULL AUTO_INCREMENT,	
    `picture_path` varchar(255), 
	`question` varchar(1000) NOT NULL,
    `answer_1` varchar(255) NOT NULL,
	`answer_2` varchar(255) NOT NULL,
    `answer_3` varchar(255) NOT NULL,
    `answer_4` varchar(255) NOT NULL,
    `answer_5` varchar(255) NOT NULL,
	`correct_answer` int NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

SELECT * FROM accounts