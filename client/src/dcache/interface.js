import Axios from '@/lib/axios.js'

/**
 * 扩容
 * @param servers
 * @param appName
 * @param moduleName
 * @param type
 * @param status
 * @param cache_version
 */
export function expandModule ({servers, appName, moduleName, type = 'expand', status ='1', cache_version}) {
  return Axios({
    method: 'post',
    url: '/cache/expandModule',
    data: {appName, moduleName, servers, type, status, cache_version}
  })
}

/**
 * 获取发布进度
 * @param releaseId
 */
export function getReleaseProgress ({releaseId}) {
  return Axios({
    method: 'get',
    url: '/cache/getReleaseProgress',
    params: {releaseId}
  })
}
