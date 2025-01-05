"""Utils module"""
import base64
import io
from PIL import Image


def process_image_for_llm(data):
    image_data = base64.b64decode(data.split(',')[1])
    image = Image.open(io.BytesIO(image_data)).resize((240, 200))
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=70)
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")
