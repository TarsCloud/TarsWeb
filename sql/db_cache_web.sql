# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.7.28)
# Database: db_cache_web
# Generation Time: 2020-08-18 08:30:34 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table t_apply_app_base
# ------------------------------------------------------------

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table t_apply_app_dbaccess_conf
# ------------------------------------------------------------

CREATE TABLE `t_apply_app_dbaccess_conf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `isSerializated` int(11) NOT NULL,
  `servant` varchar(128) NOT NULL DEFAULT '',
  `dbaccess_ip` text NOT NULL,
  `db_num` int(11) NOT NULL DEFAULT '1',
  `db_prefix` varchar(128) NOT NULL DEFAULT '',
  `table_num` int(11) NOT NULL DEFAULT '1',
  `table_prefix` varchar(128) NOT NULL DEFAULT '',
  `db_host` varchar(128) NOT NULL DEFAULT '',
  `db_port` varchar(128) NOT NULL DEFAULT '',
  `db_pwd` varchar(128) NOT NULL DEFAULT '',
  `db_user` varchar(128) NOT NULL DEFAULT '',
  `db_charset` varchar(128) NOT NULL DEFAULT '',
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table t_apply_app_proxy_conf
# ------------------------------------------------------------

CREATE TABLE `t_apply_app_proxy_conf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `apply_id` int(11) NOT NULL,
  `server_name` varchar(100) NOT NULL DEFAULT '',
  `server_ip` varchar(100) NOT NULL DEFAULT '',
  `idc_area` varchar(50) NOT NULL DEFAULT '',
  `template_file` varchar(50) NOT NULL DEFAULT '',
  `create_person` varchar(50) NOT NULL DEFAULT '',
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table t_apply_app_router_conf
# ------------------------------------------------------------

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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table t_apply_cache_module_base
# ------------------------------------------------------------

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table t_apply_cache_module_conf
# ------------------------------------------------------------

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
  `dbAccessServant` varchar(150) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `applyModule` (`apply_id`,`module_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table t_apply_cache_server_conf
# ------------------------------------------------------------

CREATE TABLE `t_apply_cache_server_conf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `area` varchar(50) DEFAULT '',
  `apply_id` int(11) NOT NULL,
  `module_name` varchar(100) NOT NULL DEFAULT '',
  `group_name` varchar(100) NOT NULL DEFAULT '',
  `server_name` varchar(100) NOT NULL DEFAULT '',
  `server_ip` varchar(100) NOT NULL DEFAULT '',
  `server_type` int(4) NOT NULL DEFAULT '0',
  `memory` int(4) NOT NULL DEFAULT '0',
  `shmKey` varchar(100) NOT NULL DEFAULT '',
  `idc_area` varchar(50) DEFAULT '',
  `status` int(4) NOT NULL DEFAULT '0',
  `modify_person` varchar(50) NOT NULL DEFAULT '',
  `modify_time` datetime DEFAULT NULL,
  `is_docker` tinyint(1) NOT NULL DEFAULT '0',
  `template_name` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `applyModule` (`apply_id`,`module_name`,`group_name`,`server_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table t_expand_server
# ------------------------------------------------------------

CREATE TABLE `t_expand_server` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `area` varchar(50) NOT NULL DEFAULT '',
  `patch_version` varchar(50) NOT NULL DEFAULT '',
  `operation_id` int(11) NOT NULL,
  `app_name` varchar(100) NOT NULL DEFAULT '',
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
  KEY `t_expand_server_operation_id_foreign_idx` (`operation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table t_module_operation
# ------------------------------------------------------------

CREATE TABLE `t_module_operation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `appName` varchar(256) NOT NULL,
  `moduleName` varchar(256) NOT NULL,
  `cache_version` int(4) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

# Dump of table t_region
# ------------------------------------------------------------

CREATE TABLE `t_region` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `region` varchar(50) NOT NULL,
  `label` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `region` (`region`),
  UNIQUE KEY `label` (`label`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

# Dump of table t_server_patchs
# ------------------------------------------------------------

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
