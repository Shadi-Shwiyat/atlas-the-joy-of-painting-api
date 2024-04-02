-- MySQL script that creates a new database
-- and structures it to hold information
-- reguarding 'The Joy of Painting' TV show

CREATE DATABASE IF NOT EXISTS the_joy_of_painting;
USE the_joy_of_painting;

CREATE TABLE `episodes` (
  `painting_index` integer,
  `title` text,
  `date` date,
  `season` integer,
  `episode` integer,
  `num_colors` integer,
  `notes` text,
  `img_src` text,
  `youtube_src` text,
  PRIMARY KEY (`painting_index`)
);

CREATE TABLE `episodes_colors` (
  `painting_index` integer,
  `colors_id` integer,
  PRIMARY KEY (`painting_index`, `colors_id`)
);

CREATE TABLE `episode_subjects` (
  `painting_index` integer,
  `subject_id` integer,
  PRIMARY KEY (`painting_index`, `subject_id`)
);

CREATE TABLE `colors` (
  `colors_id` integer AUTO_INCREMENT,
  `color_name` text,
  `hex_value` text,
  PRIMARY KEY (`colors_id`)
);

CREATE TABLE `subjects` (
  `subject_id` integer AUTO_INCREMENT,
  `subject_name` text,
  PRIMARY KEY (`subject_id`)
);
