# libraries

from io import StringIO
import psutil
from typing import Dict
import pandas as pd
import subprocess
import urllib.request
import urllib.parse
import time
import json
import pprint
import os

#slack
import requests
import datetime
import json

Bot_User_OAuth_Token="xoxb-1234"

#GPU id
GPU_uuid=pd.read_csv(
    StringIO(
        subprocess.check_output(
            'nvidia-smi --query-gpu=index,gpu_uuid --format=csv --format=csv',
            shell=True
        ).decode('utf-8').replace(' ', '')
    ),
    index_col='index'
)

#processes
processes=pd.read_csv(
    StringIO(
        subprocess.check_output(
            'nvidia-smi --query-compute-apps=pid,gpu_name,gpu_uuid,process_name,used_gpu_memory --format=csv',
            #all : timestamp,gpu_name,gpu_bus_id,gpu_serial,gpu_uuid,pid,process_name,used_gpu_memory --format=csv',
            shell=True
        ).decode('utf-8').replace(' ', '')
    ),
    index_col='pid'
)

processes['username']=[psutil.Process(p).username() for p in processes.index]
processes['p_name']=[psutil.Process(p).name() for p in processes.index]
processes['cmdline']=[psutil.Process(p).cmdline() for p in processes.index]
processes['GPU_num']=[GPU_uuid[GPU_uuid.uuid==uuid].index[0] for uuid in processes.gpu_uuid]
processes['time']=[str(datetime.timedelta(seconds=psutil.Process(p).cpu_times()[0])) for p in processes.index]

processes.rename(columns={'used_gpu_memory[MiB]':'GPU_memory'},inplace=True)

processes.sort_values('GPU_num')

# post
response=requests.post(
    "https://slack.com/api/chat.update",
    data={
        "token":Bot_User_OAuth_Token,
        "channel":"AAAAAAAAA",
        "ts":"00000000000",
        #"blocks":
        'blocks':json.dumps(
            [
                #ヘッダー
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": os.uname()[1],
                    }
                },
                #現在時刻
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "plain_text",
                            "text": datetime.datetime.now().strftime('%Y年%m月%d日 %H:%M:%S'),

                        }
                    ]
                },
                {"type": "divider"},
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": 
                        "GPU processes\n"+
                        "```"+
                        processes[['username','p_name','GPU_num','GPU_memory','time']].to_string()
                        +"```"
                    }
                },
                {"type": "divider"},
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "NVIDIA System Management Interface\n"+"```"+subprocess.check_output(['nvidia-smi'], shell=True).decode('utf-8')[:2271]+"```"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "```"+subprocess.check_output(['nvidia-smi'], shell=True).decode('utf-8')[2271:]+"```"
                    }
                },
            ],
        ),
    }
)

print(response)
print(response.url)
print(response.text)
print('-'*20)