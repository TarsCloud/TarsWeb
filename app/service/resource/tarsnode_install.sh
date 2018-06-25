/**
 * Tencent is pleased to support the open source community by making Tars available.
 *
 * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except 
 * in compliance with the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed 
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the 
 * specific language governing permissions and limitations under the License.
 */
 
#!/bin/bash
if [ ! -d "/usr/local/app/tars/tarsnode" ]; then
    mkdir -p /usr/local/app/tars
    cd /usr/local/app/tars/
    wget http://${ip}:${port}/tarsnode.tar.gz
    tar -zxvf tarsnode.tar.gz
    rm tarsnode.tar.gz
    cd ./tarsnode/conf
    sed -i "s/192.168.2.131/${machine_ip}/g" `grep 192.168.2.131 -rl ./*`
    cd ../bin
    chmod u+x tarsnode
    ./tarsnode --config=../conf/tarsnode.conf
    if [[ `ps -e | grep tarsnode` =~ "tarsnode" ]]; then
        echo 'Tars node installed success'
    else
        echo 'Tars node installed failed'
    fi
else
    echo "Tars node has installed"
fi