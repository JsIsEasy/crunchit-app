-- -----------------------------------------------------
-- Table `jobs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jobs` (
  `job_id` VARCHAR(36) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `s3_key` VARCHAR(255) NOT NULL,
  `compressed_s3_key` VARCHAR(255) NULL,
  `current_status` VARCHAR(50) NOT NULL,

  `started_at` DATETIME NULL,
  `finished_at` DATETIME NULL,

  `operation_type` VARCHAR(50) NOT NULL,
  `target_format` ENUM('MP4','ZIP','JPG','PNG','WEBM','GIF') NULL,
  `compression_level` TINYINT NULL, 
  
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  
  PRIMARY KEY (`job_id`),
  INDEX `idx_current_status` (`current_status` ASC)
);