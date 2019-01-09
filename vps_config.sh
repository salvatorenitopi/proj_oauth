#!/bin/sh

SSH_PORT=44000
USER="vpssoasec19"

########################################################################################################################

timedatectl set-timezone Europe/Rome

echo
echo "[*] CHANGE ROOT PASSWORD"
passwd

echo
echo
echo "[*] Creating new user: $USER"
#useradd -m $USER && passwd $USER && usermod -a -G sudo $USER && chsh -s /bin/bash $USER;
useradd -m $USER && passwd $USER && chsh -s /bin/bash $USER;

echo
echo "[*] Updating system"
apt-get update -y; apt-get upgrade -y; apt-get dist-upgrade -y; autoremove -y;

echo
echo "[*] Setting up unattended-upgrades"
apt-get install unattended-upgrades apt-listchanges -y

echo 'Unattended-Upgrade::Mail "root";' >> /etc/apt/apt.conf.d/50unattended-upgrades

dpkg-reconfigure -plow unattended-upgrades

echo
echo
echo "[*] Check unattended-upgrades"
cat /etc/apt/apt.conf.d/20auto-upgrades
echo
echo

echo 'APT::Periodic::Verbose "2";' >> /etc/apt/apt.conf.d/20auto-upgrades

# https://www.tecmint.com/auto-install-security-updates-on-debian-and-ubuntu/
# Log: cat /var/log/unattended-upgrades/unattended-upgrades.log

########################################################################################################################


echo
echo "[*] Installing software"
apt-get install build-essential iptables-persistent net-tools htop git nano wget curl fail2ban secure-delete python-crypto python-dev python-pip -y;

########################################################################################################################

echo
echo "[*] Installing Node"
curl -sL https://deb.nodesource.com/setup_8.x | bash -
apt-get install -y nodejs


########################################################################################################################

echo
echo "[*] Setting SSH"

# https://www.heliumlabs.org/docs/how-to-harden-a-new-linux-vps
# echo "Port $SSH_PORT" > /etc/ssh/sshd_config

(echo 'ChallengeResponseAuthentication no

Port '$SSH_PORT'

PermitRootLogin no

AddressFamily inet

UsePAM yes

X11Forwarding yes

PrintMotd no

AcceptEnv LANG LC_*

Subsystem	sftp	/usr/lib/openssh/sftp-server') > /etc/ssh/sshd_config


(echo '[DEFAULT]
bantime = 3600

#
# SSH servers
#

[sshd]
enabled = true
port    = '$SSH_PORT'
logpath = %(sshd_log)s
backend = %(sshd_backend)s


[sshd-ddos]
# This jail corresponds to the standard configuration in Fail2ban.
# The mail-whois action send a notification e-mail with a whois request
# in the body.
port    = '$SSH_PORT'
logpath = %(sshd_log)s
backend = %(sshd_backend)s


[dropbear]

port     = '$SSH_PORT'
logpath  = %(dropbear_log)s
backend  = %(dropbear_backend)s


[selinux-ssh]

port     = '$SSH_PORT'
logpath  = %(auditd_log)s') > /etc/fail2ban/jail.local

update-rc.d apache2 disable
systemctl disable apache2
/etc/init.d/apache2 stop

systemctl enable fail2ban
systemctl restart sshd


########################################################################################################################

echo
echo "[*] Writing post"

(echo '
sleep 5
systemctl restart fail2ban') > post.sh

chmod +x post.sh
echo "[*] Executing post.sh"

nohup bash post.sh > /dev/null 2>&1 &
echo "[*] Post DONE"
echo "[*] Please login as $USER and start the bot"

exit
exit

########################################################################################################################