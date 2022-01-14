# 如何在K8S环境下调试TarsWeb

基本思路, 使TarsWeb在K8S环境下运行, 基本步骤如下:
- 在K8S中部署一个Tars环境, 名字空间是`tars-dev`
- 选择一个K8S节点, 添加以下标签:
>- `tars.io/node.tars-dev=`, 可以被tars-dev使用
>- `tars.io/SupportLocalVolume`签, 能提供LocalPV存储
>- `tars.io/ability.tars-dev.debug-compiler=`,  设置TarsWeb调试镜像亲和性
- 创建TarsWeb的调试镜像: `kubectl -f k8s-debug.yaml`
- 进入该pod: `kubectl exec -it debug-compiler-0 -n tars-dev -- bash`
>- `cd /data`, 该目录其实节点的宿主机的 `/usr/local/app/tars/host-mount/tars-dev/debug.compiler/data` 目录, git clone TarsWeb的代码
>- 启动TarsWeb调试: `cd TarsWeb; npm run k8s`
>- 设置ingress, 请求转到该镜像的4001端口, 即可用web浏览器打开页面
>- 如果调试前端UI, 进入client目录, `npm run dev', 打开8088端口