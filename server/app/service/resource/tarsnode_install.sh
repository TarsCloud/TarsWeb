if [ ! -d "/usr/local/app/tars" ]; then
    mkdir -p /usr/local/app/tars
    cd /usr/local/app/tars/
    wget http://{{ip}}:{{port}}/tarsnode_install.sh
    tar -zxvf tarsnode.tgz
    cd ./tarsnode/scripts/
else
    echo "Tars node has installed"
fi