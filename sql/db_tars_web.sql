-- MySQL dump 10.13  Distrib 5.6.22, for Win64 (x86_64)
--
-- Host: localhost    Database: db_tars_web
-- ------------------------------------------------------
-- Server version	5.6.22

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
-- Table structure for table `t_server_user`
--

DROP TABLE IF EXISTS `t_server_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_server_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `application` varchar(128) NOT NULL,
  `server_name` varchar(128) NOT NULL,
  `read_role` text,
  `write_role` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `application` (`application`,`server_name`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_server_user`
--

LOCK TABLES `t_server_user` WRITE;
/*!40000 ALTER TABLE `t_server_user` DISABLE KEYS */;
INSERT INTO `t_server_user` VALUES (5,'Prajna','JesseGoServer','denisfan','denisfan'),(6,'Robin','TestServer','denisfan','denisfan'),(7,'Robin','TestServer1','denisfan','denisfan'),(8,'Robin','TestServer2','denisfan','denisfan'),(9,'Robin','TestServer3','denisfan','denisfan'),(10,'Robin','TestServer4','denisfan','denisfan'),(11,'tars','tarsconfig','denisfan','denisfan'),(12,'tars','tarslog','denisfan','denisfan'),(13,'tars','tarsnotify','denisfan','denisfan'),(14,'tars','tarspatch','denisfan','denisfan'),(15,'tars','tarsproperty','denisfan','denisfan'),(16,'tars','tarsqueryproperty','denisfan','denisfan'),(17,'tars','tarsquerystat','denisfan','denisfan'),(18,'tars','tarsstat','denisfan','denisfan'),(19,'Test','AServer','denisfan','denisfan'),(20,'Test','BServer','denisfan','denisfan'),(21,'Test','CServer','denisfan','denisfan'),(22,'Test','HelloServerI','denisfan','denisfan'),(23,'Test','HelloServerII','denisfan','denisfan'),(24,'Test','OkoNodejs','denisfan','denisfan'),(25,'Test','StressServer','denisfan','denisfan'),(26,'Test','TestPushServer','denisfan','denisfan'),(27,'Test','TestServer2','denisfan','denisfan'),(28,'Test','TestServer3','denisfan','denisfan'),(29,'TestApp','HelloJavaServer','denisfan','denisfan'),(30,'TestApp','HelloServer','denisfan','denisfan'),(31,'TestApp','ProductServer','denisfan','denisfan'),(32,'TestApp','TestJavaClient','denisfan','denisfan'),(33,'TestApp','TracingJavaOneServer','denisfan','denisfan'),(34,'TestApp','TracingJavaThreeServer','denisfan','denisfan'),(35,'TestApp','TracingJavaTwoServer','denisfan','denisfan'),(36,'TestJava','HelloServer','denisfan','denisfan'),(37,'TestJava','HelloServer2','denisfan','denisfan'),(38,'TestJava','JavaTestServer','denisfan','denisfan'),(39,'windweitest','windweiservera','denisfan','denisfan');
/*!40000 ALTER TABLE `t_server_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `t_user_info`
--

DROP TABLE IF EXISTS `t_user_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_user_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(256) NOT NULL,
  `password` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`user_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_user_info`
--

LOCK TABLES `t_user_info` WRITE;
/*!40000 ALTER TABLE `t_user_info` DISABLE KEYS */;
/*!40000 ALTER TABLE `t_user_info` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-07-19 11:02:19
