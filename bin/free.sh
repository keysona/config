#!/bin/bash
nohup java -jar ~/Documents/finalspeed/client.jar &
sudo sslocal -d start -c ~/.shadowsock-dg-ocean-SFC.json
