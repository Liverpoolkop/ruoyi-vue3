#!/bin/sh
APP_HOME=$(cd "$(dirname "$0")"; pwd)
PID_FILE=$APP_HOME/.vite.pid

start(){
    cd "$APP_HOME" && nohup npm run dev > /dev/null 2>&1 &
    echo $! > "$PID_FILE"
    echo "Vite started"
}

stop(){
    if [ -f "$PID_FILE" ]; then
        PID=`cat "$PID_FILE"`
        kill -TERM $PID 2>/dev/null || true
        rm -f "$PID_FILE"
        echo "Vite stopped"
    else
        echo "Vite not running"
    fi
}

status(){
    if [ -f "$PID_FILE" ] && ps -p `cat "$PID_FILE"` > /dev/null 2>&1; then
        echo "Vite running"
    else
        echo "Vite not running"
    fi
}

case $1 in
    start)
    start;;
    stop)
    stop;;
    status)
    status;;
    *)
    echo "Usage: $0 {start|stop|status}";;
esac
