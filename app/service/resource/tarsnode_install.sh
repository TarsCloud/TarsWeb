if [ ! -d "/usr/local/app/tars" ]; then
    mkdir -p /usr/local/app/tars
    cd /usr/local/app/tars/
    wget http://${ip}:${port}/tarsnode.tgz
    tar -zxvf tarsnode.tgz
    cd ./tarsnode/config
    sed -i "s/192.168.2.131/${machine_ip}/g" `grep 192.168.2.131 -rl ./*`
    cd ../bin
    chmod u+x tarsnode
    ./tarsnode --config=../tarsnode.conf
else
    echo "Tars node has installed"
fi