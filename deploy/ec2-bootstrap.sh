#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/focustodo"
NGINX_SITE="/etc/nginx/sites-available/focustodo"

sudo apt update
sudo apt install -y nginx

sudo mkdir -p "${APP_DIR}"

cat <<'EOF' | sudo tee "${NGINX_SITE}" >/dev/null
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

if [ ! -L /etc/nginx/sites-enabled/focustodo ]; then
  sudo ln -s /etc/nginx/sites-available/focustodo /etc/nginx/sites-enabled/focustodo
fi

sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "Bootstrap complete. Nginx is serving ${APP_DIR}."
