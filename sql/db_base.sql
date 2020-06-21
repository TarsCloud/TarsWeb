-- MySQL dump 10.13  Distrib 5.7.29, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: db_base
-- ------------------------------------------------------
-- Server version	5.6.47

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
-- Table structure for table `t_blacklist`
--

DROP TABLE IF EXISTS `t_blacklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_blacklist` (
  `f_id` int(11) NOT NULL AUTO_INCREMENT,
  `f_station_id` varchar(64) NOT NULL DEFAULT '' COMMENT '站点英文名，为空时表示所有站点',
  `f_ip` varchar(20) NOT NULL COMMENT 'ip, 可以用通配符',
  `f_valid` int(2) NOT NULL DEFAULT '1' COMMENT '1:valid, 0:invalid',
  `f_update_person` varchar(64) NOT NULL DEFAULT '' COMMENT '更新人',
  `f_update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`f_id`),
  UNIQUE KEY `station_ip` (`f_station_id`,`f_ip`)
) ENGINE=InnoDB CHARSET=utf8 COMMENT='ip 黑名单';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_flow_control`
--

DROP TABLE IF EXISTS `t_flow_control`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_flow_control` (
  `f_id` int(11) NOT NULL AUTO_INCREMENT,
  `f_station_id` varchar(64) NOT NULL COMMENT '站点英文名, 对于wup接口调用的taf，就是服务的obj',
  `f_duration` int(10) NOT NULL DEFAULT '60' COMMENT '时间窗口，单位秒， 默认为60秒',
  `f_max_flow` int(10) NOT NULL COMMENT '最大流量，即在f_duration时间内最多请求f_max_flow次',
  `f_valid` int(2) NOT NULL DEFAULT '1' COMMENT '1:valid, 0:invalid',
  `f_update_person` varchar(64) NOT NULL DEFAULT '' COMMENT '更新人',
  `f_update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`f_id`),
  UNIQUE KEY `station_id` (`f_station_id`)
) ENGINE=InnoDB CHARSET=utf8 COMMENT='流量控制';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_http_router`
--

DROP TABLE IF EXISTS `t_http_router`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_http_router` (
  `f_id` int(11) NOT NULL AUTO_INCREMENT,
  `f_station_id` varchar(64) NOT NULL COMMENT '站点英文名',
  `f_server_name` varchar(64) NOT NULL DEFAULT '' COMMENT 'server_name',
  `f_path_rule` varchar(255) NOT NULL DEFAULT '' COMMENT 'url规则',
  `f_proxy_pass` varchar(255) NOT NULL DEFAULT '' COMMENT 'proxy_pass',
  `f_valid` int(2) NOT NULL DEFAULT '1' COMMENT '1:valid, 0:invalid',
  `f_update_person` varchar(64) NOT NULL DEFAULT '' COMMENT '更新人',
  `f_update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`f_id`),
  UNIQUE KEY `station_rule` (`f_server_name`,`f_path_rule`)
) ENGINE=InnoDB CHARSET=utf8 COMMENT='路由规则';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_station`
--

DROP TABLE IF EXISTS `t_station`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_station` (
  `f_id` int(11) NOT NULL AUTO_INCREMENT,
  `f_station_id` varchar(64) NOT NULL COMMENT '站点英文名，唯一',
  `f_name_cn` varchar(64) NOT NULL DEFAULT '' COMMENT '站点中文名称',
  `f_monitor_url` varchar(255) NOT NULL DEFAULT '' COMMENT '监控url',
  `f_valid` int(2) NOT NULL DEFAULT '1' COMMENT '1:valid, 0:invalid',
  `f_update_person` varchar(64) NOT NULL DEFAULT '' COMMENT '更新人',
  `f_update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`f_id`),
  UNIQUE KEY `f_station_id` (`f_station_id`)
) ENGINE=InnoDB CHARSET=utf8 COMMENT='站点';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_upstream`
--

DROP TABLE IF EXISTS `t_upstream`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_upstream` (
  `f_id` int(11) NOT NULL AUTO_INCREMENT,
  `f_upstream` varchar(64) NOT NULL COMMENT '站点英文名',
  `f_addr` varchar(255) NOT NULL DEFAULT '' COMMENT 'ip:port',
  `f_weight` int(10) NOT NULL DEFAULT '1' COMMENT '权重， 默认为1',
  `f_fusing_onoff` int(2) NOT NULL DEFAULT '1' COMMENT '是否熔断处理，1是，0否',
  `f_valid` int(2) NOT NULL DEFAULT '1' COMMENT '1:valid, 0:invalid',
  `f_update_person` varchar(64) NOT NULL DEFAULT '' COMMENT '更新人',
  `f_update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`f_id`),
  UNIQUE KEY `station_addr` (`f_upstream`,`f_addr`)
) ENGINE=InnoDB CHARSET=utf8 COMMENT='后端服务地址';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_whitelist`
--

DROP TABLE IF EXISTS `t_whitelist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_whitelist` (
  `f_id` int(11) NOT NULL AUTO_INCREMENT,
  `f_station_id` varchar(64) NOT NULL COMMENT '站点英文名,taf服务则为Obj',
  `f_ip` varchar(20) NOT NULL COMMENT 'ip, 可以用通配符',
  `f_valid` int(2) NOT NULL DEFAULT '1' COMMENT '1:valid, 0:invalid',
  `f_update_person` varchar(64) NOT NULL DEFAULT '' COMMENT '更新人',
  `f_update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`f_id`),
  UNIQUE KEY `station_ip` (`f_station_id`,`f_ip`)
) ENGINE=InnoDB CHARSET=utf8 COMMENT='ip 黑名单';
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-06-20 16:59:59
