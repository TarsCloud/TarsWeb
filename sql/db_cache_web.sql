-- MySQL dump 10.13  Distrib 5.7.22, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: db_cache_web
-- ------------------------------------------------------
-- Server version	5.7.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `t_apply_app_base`
--

DROP TABLE IF EXISTS `t_apply_app_base`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_apply_app_base` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` int(4) NOT NULL DEFAULT '1',
  `idc_area` varchar(50) NOT NULL DEFAULT '',
  `set_area` varchar(50) NOT NULL DEFAULT '',
  `admin` varchar(255) NOT NULL DEFAULT '',
  `name` varchar(100) NOT NULL DEFAULT '',
  `create_person` varchar(50) NOT NULL DEFAULT '',
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_apply_app_proxy_conf`
--

DROP TABLE IF EXISTS `t_apply_app_proxy_conf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_apply_app_proxy_conf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `apply_id` int(11) NOT NULL,
  `server_name` varchar(100) NOT NULL DEFAULT '',
  `server_ip` varchar(100) NOT NULL DEFAULT '',
  `idc_area` varchar(50) NOT NULL DEFAULT '',
  `template_file` varchar(50) NOT NULL DEFAULT '',
  `create_person` varchar(50) NOT NULL DEFAULT '',
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `t_apply_app_proxy_conf_apply_id_foreign_idx` (`apply_id`),
  CONSTRAINT `t_apply_app_proxy_conf_apply_id_foreign_idx` FOREIGN KEY (`apply_id`) REFERENCES `t_apply_app_base` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_apply_app_router_conf`
--

DROP TABLE IF EXISTS `t_apply_app_router_conf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_apply_app_router_conf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `apply_id` int(11) NOT NULL,
  `server_name` varchar(100) NOT NULL DEFAULT '',
  `server_ip` varchar(100) NOT NULL DEFAULT '',
  `template_file` varchar(50) NOT NULL DEFAULT '',
  `router_db_name` varchar(100) NOT NULL DEFAULT '',
  `router_db_ip` varchar(100) NOT NULL DEFAULT '',
  `router_db_port` varchar(50) NOT NULL DEFAULT '',
  `router_db_user` varchar(50) NOT NULL DEFAULT '',
  `router_db_pass` varchar(50) NOT NULL DEFAULT '',
  `create_person` varchar(50) NOT NULL DEFAULT '',
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `t_apply_app_router_conf_apply_id_foreign_idx` (`apply_id`),
  CONSTRAINT `t_apply_app_router_conf_apply_id_foreign_idx` FOREIGN KEY (`apply_id`) REFERENCES `t_apply_app_base` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_apply_cache_module_base`
--

DROP TABLE IF EXISTS `t_apply_cache_module_base`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_apply_cache_module_base` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` int(4) NOT NULL DEFAULT '0',
  `area` varchar(50) DEFAULT '',
  `apply_id` int(11) NOT NULL,
  `cache_version` int(4) DEFAULT '1',
  `mkcache_struct` int(4) DEFAULT '0',
  `follower` varchar(255) NOT NULL DEFAULT '',
  `create_person` varchar(50) NOT NULL DEFAULT '',
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_apply_cache_module_conf`
--

DROP TABLE IF EXISTS `t_apply_cache_module_conf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_apply_cache_module_conf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `apply_id` int(11) NOT NULL,
  `module_name` varchar(100) NOT NULL DEFAULT '',
  `status` int(4) NOT NULL DEFAULT '0',
  `area` varchar(50) NOT NULL DEFAULT '',
  `idc_area` varchar(50) NOT NULL DEFAULT '',
  `set_area` varchar(100) NOT NULL DEFAULT '',
  `admin` varchar(255) NOT NULL DEFAULT '',
  `cache_module_type` int(4) DEFAULT '0',
  `per_record_avg` int(11) NOT NULL DEFAULT '0',
  `total_record` int(11) NOT NULL DEFAULT '0',
  `max_read_flow` int(11) NOT NULL DEFAULT '0',
  `max_write_flow` int(11) NOT NULL DEFAULT '0',
  `key_type` int(4) DEFAULT '0',
  `module_remark` text,
  `create_person` varchar(50) NOT NULL DEFAULT '',
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `applyModule` (`apply_id`,`module_name`),
  KEY `t_apply_cache_module_conf_module_id_foreign_idx` (`module_id`),
  CONSTRAINT `t_apply_cache_module_conf_module_id_foreign_idx` FOREIGN KEY (`module_id`) REFERENCES `t_apply_cache_module_base` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_apply_cache_server_conf`
--

DROP TABLE IF EXISTS `t_apply_cache_server_conf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_apply_cache_server_conf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `area` varchar(50) NOT NULL DEFAULT '',
  `apply_id` int(11) NOT NULL,
  `module_name` varchar(100) NOT NULL DEFAULT '',
  `group_name` varchar(100) NOT NULL DEFAULT '',
  `server_name` varchar(100) NOT NULL DEFAULT '',
  `server_ip` varchar(100) NOT NULL DEFAULT '',
  `server_type` int(4) NOT NULL DEFAULT '0',
  `memory` int(4) NOT NULL DEFAULT '0',
  `shmKey` varchar(100) NOT NULL DEFAULT '',
  `idc_area` varchar(50) NOT NULL DEFAULT '',
  `status` int(4) NOT NULL DEFAULT '0',
  `modify_person` varchar(50) NOT NULL DEFAULT '',
  `modify_time` datetime DEFAULT NULL,
  `is_docker` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `applyModule` (`apply_id`,`module_name`,`group_name`,`server_name`)
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_region`
--

DROP TABLE IF EXISTS `t_region`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_region` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `region` varchar(50) NOT NULL,
  `label` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `region` (`region`),
  UNIQUE KEY `label` (`label`),
  UNIQUE KEY `region_2` (`region`),
  UNIQUE KEY `label_2` (`label`),
  UNIQUE KEY `region_3` (`region`),
  UNIQUE KEY `label_3` (`label`),
  UNIQUE KEY `region_4` (`region`),
  UNIQUE KEY `label_4` (`label`),
  UNIQUE KEY `region_5` (`region`),
  UNIQUE KEY `label_5` (`label`),
  UNIQUE KEY `region_6` (`region`),
  UNIQUE KEY `label_6` (`label`),
  UNIQUE KEY `region_7` (`region`),
  UNIQUE KEY `label_7` (`label`),
  UNIQUE KEY `region_8` (`region`),
  UNIQUE KEY `label_8` (`label`),
  UNIQUE KEY `region_9` (`region`),
  UNIQUE KEY `label_9` (`label`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_server_patchs`
--

DROP TABLE IF EXISTS `t_server_patchs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_server_patchs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_name` varchar(50) DEFAULT NULL,
  `version` varchar(1000) DEFAULT '',
  `tgz` text,
  `update_text` varchar(255) DEFAULT NULL,
  `reason_select` varchar(255) DEFAULT NULL,
  `document_complate` varchar(30) DEFAULT NULL,
  `is_server_group` int(2) NOT NULL DEFAULT '0',
  `publish` int(3) DEFAULT NULL,
  `publish_time` datetime DEFAULT NULL,
  `publish_user` varchar(30) DEFAULT NULL,
  `upload_time` datetime DEFAULT NULL,
  `upload_user` varchar(30) DEFAULT NULL,
  `posttime` datetime DEFAULT NULL,
  `lastuser` varchar(30) DEFAULT NULL,
  `is_release_version` enum('true','false') DEFAULT 'true',
  `package_type` int(4) DEFAULT '0',
  `group_id` varchar(64) NOT NULL DEFAULT '',
  `default_version` int(4) DEFAULT '0',
  `md5` varchar(40) DEFAULT NULL,
  `svn_version` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-02-26 19:58:09
