import os
import sys
import datetime
import json

with open('/home/ubuntu/cred.json') as f:
  data = json.load(f)

password = data["password"]

def backup():
	global password
	# print("backing up ...")
	today = datetime.datetime.now()
	today = str(today.day) +"/"+ str(today.month) +"/"+ str(today.year) +" -- "+ str(today.hour) +" -- "+ str(today.minute)

	# password = sys.argv[1]

	os.system("cd /home/ubuntu/db")
	os.system("mysqldump -u vishnu -p"+password+" mathspartner > mathspartner.sql")
	os.system("git add .")
	os.system("git commit -m '"+ today +"'")
	os.system("git push origin master")

backup()