import base64
import io
import json
import os
import gdown
#import fastbook
#fastbook.setup_book()
import fastai
import pandas as pd
import requests
import snscrape.modules.twitter as sntwitter
from copy import deepcopy

from torchvision import models
from torchvision import transforms
from PIL import Image
from django.shortcuts import render
from django.conf import settings
#from fastbook import *

from run_prediction_models import RunPredictionModels

import pathlib
posixpath_temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

import sys

path_cwd = os.getcwd()
path_df = 'pytorch_assets\\dataframes'
path_dls = 'pytorch_assets\\dataloaders'
path_models = 'pytorch_assets\\models'



# sys.argv[2] is the genre string fed from index.js to python_pytorch.py
# print('hello')
r = RunPredictionModels(sys.argv[2])
r.initialize_assets()