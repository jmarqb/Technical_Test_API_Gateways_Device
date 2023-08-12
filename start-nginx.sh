#!/bin/sh

echo "Value of APP_PORT: $APP_PORT"

# Replace __APP_PORT__ in the template and create new copy in default.conf
sed "s/__APP_PORT__/$APP_PORT/g" /etc/nginx/nginx.template.conf > /etc/nginx/conf.d/default.conf

# Verify the replace
echo "Content default.conf after replace:"
cat /etc/nginx/conf.d/default.conf

# Start Nginx
nginx -g 'daemon off;'
