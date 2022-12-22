from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from tensorflow import expand_dims
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import get_file, load_img, img_to_array
from uvicorn import run
from io import BytesIO
from PIL import Image
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]    
)

model_dir = "ml/model/EfficientNetB4.h5"
model = load_model(model_dir)

def read_image_file(file) -> Image.Image:
    image = Image.open(BytesIO(file))
    return image

@app.post("/")
async def root(image: UploadFile):
    if image.filename == "":
        return {"message": "No image provided"}
    
    loaded_image = read_image_file(await image.read())
    img_array = img_to_array(loaded_image)
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
	run(app, host='127.0.0.1', port=port)