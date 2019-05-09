import Axios from '@/lib/axios.js'

/**
 * 扩容
 * @param servers
 * @param appName
 * @param moduleName
 * @param status
 * @param cache_version
 */
export function expandModule({ servers, appName, moduleName, status = '1', cache_version, srcGroupName = [], dstGroupName = [] }) {
  return Axios({
    method: 'post',
    url: '/cache/expandModule',
    data: { appName, moduleName, servers, status, cache_version, srcGroupName, dstGroupName }
  })
}

/**
 * 部署迁移
 * @param servers
 * @param appName
 * @param moduleName
 * @param status
 * @param cache_version
 * @param srcGroupName
 * @param dstGroupName
 */
export function transferDCache({ servers, appName, moduleName,  status = '1', cache_version, srcGroupName, dstGroupName }) {
  return Axios({
    method: 'post',
    url: '/cache/transferDCache',
    data: { servers, appName, moduleName, cache_version, srcGroupName, dstGroupName, status }
  })
}

/**
 * 非部署迁移
 * @param appName
 * @param moduleName
 * @param srcGroupName
 * @param dstGroupName
 * @param transferData
 */
export function transferDCacheGroup({ appName, moduleName, srcGroupName, dstGroupName, transferData }) {
  return Axios({
    method: 'post',
    url: '/cache/transferDCacheGroup',
    data: { appName, moduleName, srcGroupName, dstGroupName, transferData }
  })
}

/**
 * 获取发布进度
 * @param releaseId
 */
export function getReleaseProgress({ releaseId }) {
  return Axios({
    method: 'get',
    url: '/cache/getReleaseProgress',
    params: { releaseId }
  })
}

export function configTransfer({ appName, moduleName, type = '1', srcGroupName = [], dstGroupName = [] }) {
  return Axios({
    method: 'post',
    url: '/cache/configTransfer',
    data: {
      appName,
      moduleName,
      type,
      srcGroupName,
      dstGroupName,
    }
  })
}

/**
 * 获取操作记录
 * @type String 0、1、2 迁移、扩容、缩容
 */
export function getRouterChange({ type = '1' }) {
  return Axios({
    method: 'get',
    url: '/cache/getRouterChange',
    params: {
      type
    }
  })
}

export function hasOperation({ appName, moduleName, type }) {
  return Axios({
    method: 'get',
    url: '/cache/hasOperation',
    params: {
      appName,
      moduleName,
      type,
    }
  })
}

/**
 * 停止迁移、扩容、缩容操作
 * @appName     应用名
 * @moduleName  模块名
 * @type        '0' 是迁移， '1' 是扩容， '2' 是缩容
 * @srcGroupName 原组
 * @dstGroupName 目标组
 *
 */
export function stopTransfer({ appName = '', moduleName = '', type = '1', srcGroupName = [], dstGroupName = [] }) {
  return Axios({
    method: 'post',
    url: '/cache/stopTransfer',
    data: {
      appName,
      moduleName,
      type,
      srcGroupName,
      dstGroupName
    }
  })
}

/**
 * 删除迁移、扩容、缩容操作记录
 * @appName     应用名
 * @moduleName  模块名
 * @type        '0' 是迁移， '1' 是扩容， '2' 是缩容
 * @srcGroupName 原组
 * @dstGroupName 目标组
 *
 */
export function deleteTransfer({ appName = '', moduleName = '', type = '1', srcGroupName = [], dstGroupName = [] }) {
  return Axios({
    method: 'post',
    url: '/cache/deleteTransfer',
    data: {
      appName,
      moduleName,
      type,
      srcGroupName,
      dstGroupName
    }
  })
}

/**
 * 缩容
 * @param appName
 * @param moduleName
 * @param srcGroupName
 */
export function reduceDcache({ appName = '', moduleName = '', srcGroupName = [] }) {
  return Axios({
    method: 'post',
    url: '/cache/reduceDcache',
    data: {
      appName,
      moduleName,
      srcGroupName,
    }
  })
}

/**
 * 主备切换
 * @param appName
 * @param moduleName
 * @param groupName
 */
export function switchServer({ appName = '', moduleName = '', groupName = '' }) {
  return Axios({
    method: 'post',
    url: '/cache/switchServer',
    data: {
      appName,
      moduleName,
      groupName,
    }
  })
}

/**
 * 查询主备切换
 * @param appName
 * @param moduleName
 * @param groupName
 */
export function getSwitchInfo({ appName = '', moduleName = '', groupName = '' }) {
  return Axios({
    method: 'get',
    url: '/cache/getSwitchInfo',
    params: {
      appName,
      moduleName,
      groupName,
    }
  })
}

/**
 * 恢复镜像
 * @param appName
 * @param moduleName
 * @param groupName
 * @param mirrorIdc
 * @param dbFlag
 * @param enableErase
 */
export function recoverMirrorStatus({ appName, moduleName, groupName, mirrorIdc, dbFlag, enableErase }) {
  return Axios({
    method: 'post',
    url: '/cache/recoverMirrorStatus',
    data: { appName, moduleName, groupName, mirrorIdc, dbFlag, enableErase }
  })
}

/**
 * 下线 cache 服务
 * @param appName
 * @param moduleName
 * @param serversNames
 */
export function uninstall4DCache({ unType, appName, moduleName, serverNames }) {
  return Axios({
    method: 'post',
    url: '/cache/uninstall4DCache',
    data: { unType, appName, moduleName, serverNames }
  })
}

/**
 * 获取 cache 服务
 * @param appName
 * @param moduleName
 */
export function getCacheServerList({ appName, moduleName }) {
  return Axios({
    method: 'get',
    url: '/cache/getCacheServerList',
    params: { appName, moduleName }
  })
}

export function getModuleConfig({ appName, moduleName }) {
  return Axios({
    method: 'get',
    url: '/cache/getModuleConfig',
    params: { appName, moduleName }
  })
}

