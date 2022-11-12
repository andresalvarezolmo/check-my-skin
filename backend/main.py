from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import get_file 
from tensorflow.keras.utils import load_img 
from tensorflow.keras.utils import img_to_array
from tensorflow import expand_dims
from tensorflow.nn import softmax
from numpy import argmax
from numpy import max
from numpy import array
from json import dumps
from uvicorn import run
import os

app = FastAPI()

origins = ["*"]
methods = ["*"]
headers = ["*"]

app.add_middleware(
    CORSMiddleware, 
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = methods,
    allow_headers = headers    
)

model_dir = "ml/model/EfficientNetB4.h5"
model = load_model(model_dir)

@app.get("/")
async def root():
    label_path = "ml/examples/1.jpg"
    img = load_img(
        label_path
    )
    img_array = img_to_array(img)
    img_array = expand_dims(img_array, 0)
    probabilities = model.predict(img_array)
    probabilities = probabilities[0].tolist()

    return{
        "MEL": probabilities[0],
        "NV": probabilities[1], 
        "BCC": probabilities[2], 
        "AK": probabilities[3], 
        "BKL": probabilities[4], 
        "DF": probabilities[5], 
        "VASC":probabilities[6], 
        "SCC":probabilities[7]  
    }


if __name__ == "__main__":
	port = int(os.environ.get('PORT', 5000))
	run(app, host='0.0.0.0', port=port)