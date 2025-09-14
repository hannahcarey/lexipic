import os, sys
import anthropic
from anthropic import Anthropic

import base64
import httpx
from IPython.display import HTML, display


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

    return get_image_summary(image1_data)

#input: picture. NEED TO MAKE SURE 
def get_image_summary(image_data):
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
                        "text": "Generate a 50 word summary of this image. Extract key actions, objects, and relationships."
                    }
                ],
            }
        ],
    )
    print(message.content[0].text) #.content
    return message.content[0].text

def main():
    test()

if __name__ == "__main__":
    main()