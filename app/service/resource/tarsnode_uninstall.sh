#!/bin/bash
PID=$(ps -e|grep tarsnode|awk '{printf $1}')
if [ $? -eq 0 -a "$PID" != "" ]; then
    kill -9 $PID
    rm -rf /usr/local/app/tars/tarsnode
    echo "Tars node uninstall success"
else
    echo "Tars node not exit"
    exit
fi