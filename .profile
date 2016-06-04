#~/.profile: executed by the command interpreter for login shells.
# This file is not read by bash(1), if ~/.bash_profile or ~/.bash_login
# exists.
# see /usr/share/doc/bash/examples/startup-files for examples.
# the files are located in the bash-doc package.

# the default umask is set in /etc/profile; for setting the umask
# for ssh logins, install and configure the libpam-umask package.
#umask 022

# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
	. "$HOME/.bashrc"
    fi
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi

alias asd='nohup /home/key/DevelopTool/android-studio/bin/studio.sh > /var/log/android-studio.log 2>&1 &'
#alias vmware='sudo nohup vmware 1> /var/log/vmware.log 2>&1 &'
alias chrome='nohup google-chrome --proxy-server="socks5://localhost:1080"> /var/log/chrome.log 2>&1 &'
alias free='free -m'
alias eclipse='nohup /home/key/DevelopTool/eclipse/eclipse >/var/log/eclipse.log 2>&1 &'

# Add an "alert" alias for long running commands.  Use like so:
#   sleep 10; alert
alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# Alias definitions.
# You may want to put all your additions into a separate file like
# ~/.bash_aliases, instead of adding them here directly.
# See /usr/share/doc/bash-doc/examples in the bash-doc package.

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

#java config
export JAVA_HOME=/home/key/Environment/jdk1.7.0_79
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=.:/home/key/Environment/apache-tomcat-8.0.28/lib/servlet-api.jar:${JAVA_HOME}/lib:${JRE_HOME}/lib:/home/key/Environment/JAVA-LIB
export PATH=${JAVA_HOME}/bin:$PATH

#idea
export IDEA_HOME=/home/key/DevelopTool/idea-IU-143.2287.1
export PATH=${IDEA_HOME}/bin:$PATH
alias idea='nohup idea.sh >/var/log/idea.log 2>&1 &'

#Genymotion config
export GENYMOTION=/home/key/Environment/genymotion
export PATH=${GENYMOTION}:$PATH
alias geny='nohup genymotion >/var/log/genymotion.log 2>&1 &'

#Android sdk config
export ANDROID_SDK_HOME=/home/key/Environment/AndroidSDK
alias android="nohup ${ANDROID_SDK_HOME}/tools/android &"

#Android Studio
export ANDROID_STUDIO_HOME=/home/key/DevelopTool/android-studio
export PATH=${ANDROID_STUDIO_HOME}/bin:$PATH

#virualenv & virtualenvwrapper
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3
export WORKON_HOME=$HOME/.virtualenvs
source /usr/local/bin/virtualenvwrapper.sh


#start ssh
#sudo /etc/init.d/ssh start

#Tomcat
alias starttom='sudo ~/Environment/apache-tomcat-8.0.28/bin/startup.sh'
alias stoptom='sudo ~/Environment/apache-tomcat-8.0.28/bin/shutdown.sh'
alias rstom='stoptom;starttom'

alias firefox='nohup firefox >/var/log/firefox.log 2>&1 &'
#tengxunyun
alias tx='ssh ubuntu@119.29.26.164'
#sublime text
alias sublime='LD_PRELOAD=~/libsublime-imfix.so subl '
alias screenarea='gnome-screenshot -a'
#Editor
#export EDITOR=/usr/bin/subl

alias gc='nohup google-chrome -no_proxy >/var/log/chrome.log 2>&1 &'

alias down='cd ~/Downloads;touch ~/Downloads/aria2.session;nohup aria2c --enable-rpc --rpc-listen-all --rpc-allow-origin-all --file-allocation=none -x3 -s3 -j3 -c --save-session=aria2.session -i ~/Downloads/aria2.session &'


#http_proxy
#sudo service privoxy start

#export HTTP_PROXY=http://127.0.0.1:8118


# Add environment variable COCOS_CONSOLE_ROOT for cocos2d-x
export COCOS_CONSOLE_ROOT=/home/key/DevelopTool/cocos2d-x-3.9/tools/cocos2d-console/bin
export PATH=$COCOS_CONSOLE_ROOT:$PATH

# Add environment variable COCOS_TEMPLATES_ROOT for cocos2d-x
export COCOS_TEMPLATES_ROOT=/home/key/DevelopTool/cocos2d-x-3.9/templates
export PATH=$COCOS_TEMPLATES_ROOT:$PATH
export ANDROID_SDK_ROOT=/home/key/Environment/AndroidSDK
alias adb=${ANDROID_SDK_ROOT}/platform-tools/adb

# MongoDB
export MONGO_DB_HOME=/home/key/Environment/mongodb-linux-x86_64-ubuntu1404-3.2.5
export PATH=$MONGO_DB_HOME/bin:$PATH

export NDK_ROOT=/home/key/Environment/android-ndk-r10e
export ANT_ROOT=/home/key/Environment/android-ndk-r10e

alias network="python3 /home/key/project/python/network-connect.py"
alias gfw="sudo sslocal -d start -c ~/.shadow-digital-ocean-debain7-.json"
alias pycharm="nohup /home/key/DevelopTool/pycharm-2016.1/bin/pycharm.sh >/var/log/pycharm.log 2>&1 &"

alias ss-nofs="sudo killall sslocal && sudo sslocal -d start -c ~/.shadow-digital-ocean-debain7-.json"
alias ss-fs="sudo killall sslocal && sudo sslocal -d start -c ~/.shadowsock-dg-ocean-SFC-final-speed.json"
alias fs="sudo `which java` -jar /home/key/Documents/finalspeed_client/finalspeed.jar -b"

#Maven
export M2_HOME=/home/key/Environment/apache-maven-3.3.9
export M2=$M2_HOME/bin
export MAVEN_OPTS=-Xmx512m
export PATH=$M2:$PATH
export PATH=/home/key/bin:$PATH

#Ruby
export RUBY_HOME=/home/key/Environment/ruby-2.2.3
export PATH=$RUBY_HOME/bin:$PATH

alias img="eog"
alias markdown="nohup /home/key/DevelopTool/cmd_markdown_linux64/Cmd\ Markdown  >/var/log/cmd-markdown.log 2>&1 &"

# mongod
alias mongodb="mongod -f ~/.mongod.conf "

# Minecraft
alias minecraft="nohup java -jar /home/key/DevelopTool/Minecraft.jar > /var/log/minecraft.log 2>&1 &"

# Gradle
export GRADLE_HOME=/home/key/DevelopTool/gradle-2.13
export PATH=$GRADLE_HOME/bin:$PATH


# scala
export SCALA_HOME=/home/key/Environment/scala-2.11.8
export PATH=$SCALA_HOME/bin:$PATH

# ll alias
alias ll="ls -alh"

# http_proxy
#export http_proxy="http://127.0.0.1:9527"
