import os
import sys
import datetime
import schedule
import time
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

# schedule.every(1).minutes.do(backup)
# schedule.every().hour.do(job)
schedule.every().day.at("10:30").do(backup)
# schedule.every(5).to(10).minutes.do(job)
# schedule.every().monday.do(job)
# schedule.every().wednesday.at("13:15").do(job)
# schedule.every().minute.at(":17").do(job)

while True:
    schedule.run_pending()
    time.sleep(1)