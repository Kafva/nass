#!/sbin/openrc-run
# vi: ft=sh
# See: man openrc-run

directory=/srv/nass
output_log=/srv/nass/stdout.log
error_log=/srv/nass/nass.log

description="Password-store web API"
procname="nass"
pidfile=/run/nass.pid

command_background=true
command_user=$(id -u nass)
command=/srv/nass/nass
command_args="-c conf/nass.yml -u conf/users.yml"

depend() {
    need localmount
    need net
    need wireguard
}
