if [ ! -d "/usr/local/app/tars" ]; then
    mkdir -p /usr/local/app/tars
    cd /usr/local/app/tars/
    wget http://${ip}:${port}/tarsnode_install.sh
    tar -zxvf tarsnode.tgz
    cd ./tarsnode/scripts
    sed -i "s/192.168.2.131/${machine_ip}/g" `grep 192.168.2.131 -rl ./*`
    sed -i "s/db.tars.com/${machine_ip}/g" `grep db.tars.com -rl ./*`
    sed -i "s/registry.tars.com/${machine_ip}/g" `grep registry.tars.com -rl ./*`
    sed -i "s/web.tars.com/${machine_ip}/g" `grep web.tars.com -rl ./*`
    chmod u+x tarsnode_install.sh
    ./tarsnode_install.sh
else
    echo "Tars node has installed"
fi


