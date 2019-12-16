#!/bin/bash

#/**
# * Tencent is pleased to support the open source community by making Tars available.
# *
# * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
# *
# * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except 
# * in compliance with the License. You may obtain a copy of the License at
# *
# * https://opensource.org/licenses/BSD-3-Clause
# *
# * Unless required by applicable law or agreed to in writing, software distributed 
# * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
# * CONDITIONS OF ANY KIND, either express or implied. See the License for the 
# * specific language governing permissions and limitations under the License.
# */

echo "runuser: ${runuser}, ip:${ip}, port:${port}, machine_ip:${machine_ip}, registryAddress:${registryAddress}"

if [ ! -d "/usr/local/app" ]
then
    echo "create tars base path: "
    mkdir -p /data/app
    ln -s /data/app /usr/local/app
fi

mkdir -p /usr/local/app/tars

cd /tmp; rm -rf tarsnode.tgz

wget http://${ip}:${port}/static/tarsnode.tgz

if [ ! -f "tarsnode.tgz" ]
then
    echo "Tars node download error: http://${ip}:${port}/static/tarsnode.tgz"
    exit
fi

if [ '${registryAddress}' == ''] then
    echo "registryAddress is empty."
fi

if [ '${machine_ip}' == ''] then
    echo "machine_ip is empty."
fi

tar zxf tarsnode.tgz

cp -rf tarsnode /usr/local/app/tars/

cd /usr/local/app/tars

echo "local machine ip:[${machine_ip}] succ"

echo "all tars registry:" $registryAddress

echo "update tarsnode conf"

sed -i "s/localip.tars.com/${machine_ip}/g" /usr/local/app/tars/tarsnode/conf/tars.tarsnode.config.conf 

sed -i "s/registryAddress/${registryAddress}/g" /usr/local/app/tars/tarsnode/conf/tars.tarsnode.config.conf

sed -i "s/registryAddress/${registryAddress}/g" /usr/local/app/tars/tarsnode/util/execute.sh

echo "install tarsnode succ, start tarsnode"

useradd ${runuser}

chown -R ${runuser}:${runuser} /usr/local/app/*;

sh /usr/local/app/tars/tarsnode/util/stop.sh

su - ${runuser} -c "sh /usr/local/app/tars/tarsnode/util/start.sh"

ps -e | grep tarsnode

if [[ `ps -e | grep tarsnode` =~ "tarsnode" ]]; then
    echo 'Tars node installed success'
else
    echo 'Tars node installed failed'
fi
