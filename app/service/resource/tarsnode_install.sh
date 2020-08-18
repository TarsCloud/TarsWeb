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

echo "runuser: ${runuser}, webHost:${webHost}, machine_ip:${machine_ip}, registryAddress:${registryAddress}"

OSNAME=`uname`
OS=1

if [[ "$OSNAME" == "Darwin" ]]; then
    OS=2
elif [[ "$OSNAME" == "Windows_NT" ]]; then
    OS=3
else
    OS=1
fi

if [ $OS != 3 ]; then
    TARS_PATH=/usr/local/app/tars
else
    TARS_PATH=c:/tars-install/tars
fi

if [ $OS != 3 ]; then
    if [ ! -d "/usr/local/app" ]; then
        echo "create tars base path: "
        mkdir -p /data/app
        ln -s /data/app /usr/local/app
    fi
fi

mkdir -p ${TARS_PATH}

rm -rf tarsnode.tgz

curl -O ${webHost}/files/tarsnode.tgz

#休息1s, 避免下载的文件没有写成功
sleep 1

if [ ! -f "tarsnode.tgz" ]; then
    echo "Tars node download error: ${webHost}/files/tarsnode.tgz"
    exit
fi

if [ '${registryAddress}' == '' ]; then
    echo "registryAddress is empty."
    exit
fi

if [ '${machine_ip}' == '' ]; then
    echo "machine_ip is empty."
    exit
fi

tar zxf tarsnode.tgz

if [ $OS != 3 ]; then
    if [ -f ${TARS_PATH}/tarsnode/util/stop.sh ]; then
        ${TARS_PATH}/tarsnode/util/stop.sh
    fi
else
    if [ -f ${TARS_PATH}/tarsnode/util/stop.bat ]; then
        ${TARS_PATH}/tarsnode/util/stop.bat
    fi
fi

cp -rf tarsnode ${TARS_PATH}/

cd ${TARS_PATH}

echo "local machine ip:[${machine_ip}] succ"

echo "tars registry:" ${registryAddress}

sed -i "s/localip.tars.com/${machine_ip}/g" ${TARS_PATH}/tarsnode/conf/tars.tarsnode.config.conf 

sed -i "s/registryAddress/${registryAddress}/g" ${TARS_PATH}/tarsnode/conf/tars.tarsnode.config.conf

if [ $OS != 3 ]; then
    sed -i "s/registryAddress/${registryAddress}/g" ${TARS_PATH}/tarsnode/util/execute.sh
    sed -i "s/localip.tars.com/${machine_ip}/g" ${TARS_PATH}/tarsnode/util/execute.sh
else
    sed -i "s/registryAddress/${registryAddress}/g" ${TARS_PATH}/tarsnode/util/execute.bat
    sed -i "s/localip.tars.com/${machine_ip}/g" ${TARS_PATH}/tarsnode/util/execute.bat
fi
echo "install tarsnode succ, start tarsnode"

if [ $OS != 3 ]; then
    id -u ${runuser} &>/dev/null
    if [ $? != 0 ]; then
        useradd ${runuser}
    fi
    chown -R ${runuser}:${runuser} /usr/local/app/*;

    ${TARS_PATH}/tarsnode/util/stop.sh

    uid=`whoami`
    if [ "$uid" != "${runuser}" ] && [ "${runuser}" != "" ]; then
        echo "su $runuser: now uid:$uid, runuser:$runuser"
        su - $runuser -c "sh ${TARS_PATH}/tarsnode/util/start.sh"
    else
        sh ${TARS_PATH}/tarsnode/util/start.sh
    fi
else
    ${TARS_PATH}/tarsnode/util/start.bat
fi

INFO=`ps -e | grep tarsnode`

if [[ "${INFO}" != "" ]]; then
    echo 'Tars node installed success'
else
    echo 'Tars node installed failed'
fi
