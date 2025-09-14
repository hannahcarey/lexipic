from generate_bounding_box import bounding_box
from generate_summary import get_image_summary
from generate_word_list import get_image_words

import random
import json
import base64
import httpx
import io
import sys
from PIL import Image
from io import BytesIO
import numpy as np

class pic_process():
    image_index=0
    def image_to_json(self, image):
        """
        Process base64 image and return data compatible with question.py
        
        Args:
            image (str): Base64 encoded image string
            
        Returns:
            dict: Image analysis data compatible with question system
        """
        try:
            # Image preprocessing
            object_list = get_image_words(image)
            if not object_list:
                raise ValueError("No objects detected in image")
            
            random_object = random.choice(object_list)
            summary = get_image_summary(image)
            
            # Convert base64 to PIL for bounding box detection
            pil_image = self.base64_to_PIL(image)
            box = make_box(pil_image, random_object)
            
            self.image_index = self.image_index + 1

            # Format compatible with question.py expectations
            response = {
                "request_id": self.image_index,
                "description": summary,  # This is what question.py needs
                "primary_object": random_object,
                "objects": object_list,
                "boxes": {random_object: box},
                "success": True
            }
            
            # Debug prints (optional, can be removed in production)
            print(f"Processed image #{self.image_index}", file=sys.stderr)
            print(f"Objects found: {object_list}", file=sys.stderr)
            print(f"Primary object: {random_object}", file=sys.stderr)
            print(f"Description: {summary[:100]}...", file=sys.stderr)

            return response
            
        except Exception as e:
            print(f"Error processing image: {str(e)}", file=sys.stderr)
            return {
                "error": True,
                "message": str(e),
                "request_id": self.image_index,
                "success": False
            }
    
    def process_base64_image(self, base64_image):
        """
        Simplified interface that returns data ready for question.py
        
        Args:
            base64_image (str): Base64 encoded image
            
        Returns:
            dict: Image data compatible with question system
        """
        result = self.image_to_json(base64_image)
        
        if result.get("success"):
            # Return format expected by question.py
            return {
                "description": result["description"],
                "primary_object": result.get("primary_object"),
                "objects": result.get("objects", []),
                "confidence": 0.85  # Default confidence score
            }
        else:
            return {
                "description": "",
                "error": result.get("message", "Failed to process image")
            }

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

