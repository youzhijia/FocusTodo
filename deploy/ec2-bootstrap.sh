#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/focustodo"
NGINX_CONF=""
NGINX_ENABLE_SITES=0

if command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y nginx
  NGINX_CONF="/etc/nginx/sites-available/focustodo"
  NGINX_ENABLE_SITES=1
elif command -v dnf >/dev/null 2>&1; then
  sudo dnf install -y nginx
  NGINX_CONF="/etc/nginx/conf.d/focustodo.conf"
elif command -v yum >/dev/null 2>&1; then
  sudo yum install -y nginx
  NGINX_CONF="/etc/nginx/conf.d/focustodo.conf"
else
  echo "No supported package manager found (apt-get/dnf/yum)." >&2
  exit 1
fi

sudo mkdir -p "${APP_DIR}"

cat <<'EOF' | sudo tee "${NGINX_CONF}" >/dev/null
server {
    listen 80;
    listen [::]:80;
    server_name _;

    root /var/www/focustodo;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
EOF

if [ "${NGINX_ENABLE_SITES}" -eq 1 ]; then
  if [ ! -L /etc/nginx/sites-enabled/focustodo ]; then
    sudo ln -s /etc/nginx/sites-available/focustodo /etc/nginx/sites-enabled/focustodo
  fi
  sudo rm -f /etc/nginx/sites-enabled/default
fi

sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "Bootstrap complete. Nginx is serving ${APP_DIR}."
