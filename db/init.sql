-- -----------------------------------------------------
-- Table `jobs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `jobs` (
  `job_id` VARCHAR(36) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `s3_key` VARCHAR(255) NOT NULL,
  `compressed_s3_key` VARCHAR(255) NULL,
  `current_status` ENUM("QUEUED","PROCESSING","COMPLETED","FAILED") NOT NULL DEFAULT "QUEUED",

  `started_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `finished_at` DATETIME NULL,

  `operation_type` VARCHAR(50) NOT NULL,
  `operation_metadata` TEXT NOT NULL,
  
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  
  PRIMARY KEY (`job_id`),
  INDEX `idx_current_status` (`current_status` ASC)
);