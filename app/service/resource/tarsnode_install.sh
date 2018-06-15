if [ ! -d "/usr/local/app/tars" ]; then
    mkdir -p /usr/local/app/tars
    cd /usr/local/app/tars/
    wget http://${ip}:${port}/tarsnode.tar.gz
    tar -zxvf tarsnode.tar.gz
    cd ./tarsnode/conf
    sed -i "s/192.168.2.131/${machine_ip}/g" `grep 192.168.2.131 -rl ./*`
    cd ../bin
    chmod u+x tarsnode
    nohup ./tarsnode --config=../conf/tarsnode.conf &
    if [[ `ps -ef | grep tarsnode` =~ "./tarsnode --config=../conf/tarsnode.conf" ]]; then
        echo 'Tars node installed success'
    else
        echo 'Tars node installed failed'
    fi
else
    echo "Tars node has installed"
fi