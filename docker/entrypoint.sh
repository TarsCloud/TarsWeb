#!/usr/bin/env bash
cd /tars-web || exit
exec pm2 start bin/www --name=tars-node-web --no-daemon
