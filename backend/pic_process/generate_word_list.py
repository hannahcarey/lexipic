import os, sys
import anthropic
from anthropic import Anthropic

import base64
import httpx
from IPython.display import HTML, display
import random


def test():
    #in command line: set ANTHROPIC_API_KEY 
    api_key=os.environ.get("ANTHROPIC_API_KEY")
    client = Anthropic(api_key = api_key)

    if (api_key == None):
        sys.exit("No value set for ANTHROPIC_API_KEY in os.environ.")

    image1_url = "https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg"
    image1_url= "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg/640px-Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg"
    image1_media_type = "image/jpeg"
    image1_data = base64.standard_b64encode(httpx.get(image1_url).content).decode("utf-8")

    # Display inline using HTML --> this is not working properly :(
    #display(HTML(f'<img src="data:{image1_media_type};base64,{image1_data}" width="400">'))

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": image1_media_type,
                            "data": image1_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": "List up to 30 discrete, tangible objects in this image. Only include things that are actual objects; do not include abstract concepts, textures, lighting, shadows, blur, background, or vague body parts. Keep each object name generic and concise (1-3 words). Format your answer as a Python-style list, like: [\"object1\", \"object2\", ...]."
                    }
                ],
            }
        ],
    )
    list_of_words=message.content[0].text
    print(list_of_words) #.content
    print(random.choice(list_of_words))


#input: picture. NEED TO MAKE SURE 
def get_image_words(image_data):
    image_media_type = "image/jpeg"
    api_key=os.environ.get("ANTHROPIC_API_KEY")
    client = Anthropic(api_key = api_key)
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": image_media_type,
                            "data": image_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": "List up to 30 discrete, tangible objects in this image. Only include things that are actual objects; do not include abstract concepts, textures, lighting, shadows, blur, background, or vague body parts. Keep each object name generic and concise (1-3 words). Format your answer as a Python-style list, like: [\"object1\", \"object2\", ...]."
                    }
                ],
            }
        ],
    )
    return message.content[0].text #.content

def main():
    test()

if __name__ == "__main__":
    main()