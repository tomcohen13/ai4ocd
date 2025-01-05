"""Module for interfacing with LLM APIs"""
import os
from openai import OpenAI

from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key = os.environ["OPENAI_API_KEY"],
    base_url = "https://api.llama-api.com"
)

SYMPTOM_CODE_TO_DESC = {
    "hair-touching": "touching their hair",
    "face-touching": "touching their face",
    "nail-biting": "biting their nails",
    "phone-checking": "looking at their phone",
}

PROMPT = """
You are a helpful assistant, specializing in detecting behavior from images.
The following image is taken from a user webcam. The user is trying to eliminate symptomatic behavior
of {symptom_code}, and you need to help them. Your task is to decide if they are {desc} in the image.
Answer with one word: 'yes' or 'no'
"""


def query_llm(base64_image, symptom_code: str):

    if symptom_code not in SYMPTOM_CODE_TO_DESC:
        raise ValueError(f"Invalid symptom code: {symptom_code}")
    
    prompt_for_symptom = PROMPT.format(symptom_code=symptom_code, desc=SYMPTOM_CODE_TO_DESC[symptom_code])
    response = client.chat.completions.create(
        # model="gpt-4o-mini", # we'll see about that one..
        model="llama3.2-90b-vision",
        messages=[
            # {"role": "system", "content": "You are a helpful assistant, specializing in detecting behaviors in images."},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt_for_symptom},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    },
                ],
            }
        ],
        max_tokens=10,
    )

    return response.choices[0]
