#!/bin/bash
if [ ! -d "/usr/local/app/tars/tarsnode" ]; then
    mkdir -p /usr/local/app/tars
    cd /usr/local/app/tars/
    wget http://${ip}:${port}/tarsnode.tar.gz
    tar -zxvf tarsnode.tar.gz
    rm tarsnode.tar.gz
    cd ./tarsnode/conf
    sed -i "s/{{machine_ip}}/${machine_ip}/g" `grep 192.168.2.131 -rl ./*`
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