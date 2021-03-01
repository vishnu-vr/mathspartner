## installing SSL certificate from letsEncrypt
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update -y
sudo apt-get install python-certbot-nginx -y
sudo certbot --nginx -d mathspartner.com -d www.mathspartner.com