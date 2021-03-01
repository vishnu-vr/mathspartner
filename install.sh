## downloading node js and my repo
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt install nodejs -y

## installing nginx
sudo apt install nginx -y

## enabling firewall
sudo ufw enable
sudo ufw status
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

## installing node dependencies
mkdir public/pdf_uploads
npm i
sudo npm i pm2 -g

## copy nginx configuration to sites-available
sudo cp nginx_conf.txt /etc/nginx/sites-available
# renameing the nginx config file
sudo mv /etc/nginx/sites-available/nginx_conf.txt /etc/nginx/sites-available/mathspartner
# creating a shortcut
sudo ln -s /etc/nginx/sites-available/mathspartner /etc/nginx/sites-enabled/mathspartner
# Check NGINX config
sudo nginx -t
# Restart NGINX
sudo service nginx restart