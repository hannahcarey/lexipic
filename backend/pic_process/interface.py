from generate_bounding_box import make_box
from generate_summary import get_image_summary
from generate_word_list import get_image_words

import random
import json
import base64
import httpx

image_index=0

def image_to_json(image):
    #image preprocessing
    object_list=get_image_words(image)
    random_object = random.choice(object_list)
    summary=get_image_summary(image)
    box=make_box(image,random_object)
    image_index=image_index+1

    response = {
        "request_id": image_index,
        "description": summary,
        "boxes": {random_object: box}
    }
    

    print("object_list:", object_list)
    print("random_object:", random_object)
    print("summary:", summary)
    print("box:", box)
    print("image_index:", image_index)
    print("response:", response)

    # Convert to JSON string
    return json.dumps(response, indent=2)

def test():
    image1_url= "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg/640px-Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg"
    image1_media_type = "image/jpeg"
    image1_data = base64.standard_b64encode(httpx.get(image1_url).content).decode("utf-8")

    print(image_to_json(image1_data))
    return

def main():
    test()

if __name__ == "__main__":
    main()

