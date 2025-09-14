from generate_bounding_box import bounding_box
from generate_summary import get_image_summary
from generate_word_list import get_image_words

import random
import json
import base64
import httpx
import io
from PIL import Image
from io import BytesIO
import numpy as np

class pic_process():
    image_index=0
    bounding_box_maker=bounding_box()
    def image_to_json(self,image):
        #image preprocessing
        object_list=get_image_words(image)
        random_object = random.choice(object_list)
        summary=get_image_summary(image)
        box=self.bounding_box_maker.make_box(self.base64_to_PIL(image),random_object)
        self.image_index=self.image_index+1

        response = {
            "request_id": self.image_index,
            "description": summary,
            "boxes": {random_object: box}
        }
        

        print("object_list:", object_list)
        print("random_object:", random_object)
        print("summary:", summary)
        print("box:", box)
        print("image_index:", self.image_index)
        print("response:", response)

        # Convert to JSON string
        return json.dumps(response, indent=2)

    #input: base64 str: "iVBORw0KGgoAAAANSUhEUgAA..." 
    def base64_to_PIL(self,base64_str):
        # If the string contains the data URL prefix, remove it
        if base64_str.startswith("data:image"):
            base64_str = base64_str.split(",")[1]

        # Decode Base64 to bytes
        image_bytes = base64.b64decode(base64_str)

        # Load bytes into a PIL Image
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        return image

    def test(self):
        image1_url= "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg/640px-Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg"
        image1_media_type = "image/jpeg"
        image1_data = base64.standard_b64encode(httpx.get(image1_url).content).decode("utf-8")

        print(self.image_to_json(image1_data))
        return

def main():
    a = pic_process()
    print("starting first test")
    a.test()
    print("starting second test")
    a.test()
    print("third")
    a.test()
    print("forth")
    a.test()
    print('done')

if __name__ == "__main__":
    main()

