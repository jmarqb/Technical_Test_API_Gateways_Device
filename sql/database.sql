-- Wed Jul 26 12:39:03 2023
-- Model: New Model    Version: 1.0
-- -----------------------------------------------------
-- Schema node_gateways
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `node_gateways` DEFAULT CHARACTER SET utf8 ;
USE `node_gateways` ;

-- -----------------------------------------------------
-- Table `node_gateways`.`devices`
-- -----------------------------------------------------
CREATE TABLE `devices` (
  `uid` int NOT NULL AUTO_INCREMENT,
  `vendor` varchar(45) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(25) NOT NULL,
  `date_on_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `associated` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `node_gateways`.`gateways`
-- -----------------------------------------------------
CREATE TABLE `gateways` (
  `id` int NOT NULL AUTO_INCREMENT,
  `serialnumber` varchar(150) NOT NULL,
  `name` varchar(45) NOT NULL,
  `ipv4address` varchar(15) NOT NULL,
  `total_devices_associated` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `serialnumber_UNIQUE` (`serialnumber`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `ipv4address_UNIQUE` (`ipv4address`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `gateway_devices` (
  `gd_id` int NOT NULL AUTO_INCREMENT,
  `gateway_id` int DEFAULT NULL,
  `device_id` int DEFAULT NULL,
  PRIMARY KEY (`gd_id`),
  KEY `gateway_id` (`gateway_id`),
  KEY `device_id` (`device_id`),
  CONSTRAINT `gateway_devices_ibfk_1` FOREIGN KEY (`gateway_id`) REFERENCES `gateways` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gateway_devices_ibfk_2` FOREIGN KEY (`device_id`) REFERENCES `devices` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

