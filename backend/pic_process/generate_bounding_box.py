import requests

import torch
from PIL import Image
from transformers import AutoProcessor, AutoModelForZeroShotObjectDetection, infer_device

#these imports take a bajillion seconds to load
import matplotlib.pyplot as plt
import matplotlib.patches as patches
class bounding_box():
    model_id = "IDEA-Research/grounding-dino-tiny"
    device = infer_device() 
    processor = AutoProcessor.from_pretrained(model_id)
    model = AutoModelForZeroShotObjectDetection.from_pretrained(model_id).to(device)

    def test(self):
        print("test start")
        print("processing im 1")
        image_url = "http://images.cocodataset.org/val2017/000000039769.jpg"
        image = Image.open(requests.get(image_url, stream=True).raw)
        print(image)
        # Check for cats and remote controls
        object = "cat"
        
        box= self.make_box(image,object)# [x0, y0, x1, y1]

        print("processing im 2")
        image_url = "http://images.cocodataset.org/val2017/000000039769.jpg"
        image = Image.open(requests.get(image_url, stream=True).raw)
        print(image)
        # Check for cats and remote controls
        object = "remote"
        box= self.make_box(image,object)# [x0, y0, x1, y1]
        print("image 2 done")

        #plot the image here


        # Plot image with bounding boxes
        fig, ax = plt.subplots(1, figsize=(12, 8))
        ax.imshow(image)

        label_name = object

        # Box coordinates
        x0, y0, x1, y1 = box
        width, height = x1 - x0, y1 - y0
        # Draw rectangle
        rect = patches.Rectangle((x0, y0), width, height, linewidth=2, edgecolor='red', facecolor='none')
        ax.add_patch(rect)
        # Add label text
        ax.text(x0, y0 - 5, f"{label_name}", color='red', fontsize=12, weight='bold')

        plt.axis('off')
        plt.show()
        return

    #input is a 3d array image, string object 
    # output: [x0,y0,x1,y1] top left, bottom right points of the bounding box for the object
    def make_box(self,image,object):
        # Check for cats and remote controls
        text_labels = [[object]]

        inputs = self.processor(images=image, text=text_labels, return_tensors="pt").to(self.model.device)
        with torch.no_grad():
            outputs = self.model(**inputs)

        results = self.processor.post_process_grounded_object_detection(
            outputs,
            inputs.input_ids,
            threshold=0.4,
            text_threshold=0.3,
            target_sizes=[image.size[::-1]]
        )

        result = results[0]
        best_box=None
        best_score=-1
        for box, score, labels in zip(result["boxes"], result["scores"], result["labels"]):
            box = [round(x, 2) for x in box.tolist()]
            print(f"Detected {labels} with confidence {round(score.item(), 3)} at location {box}")
            if score>best_score:
                best_box=box
        print(f"best box is {best_box}")
        return best_box

def main():
    a =bounding_box()
    a.test()

if __name__ == "__main__":
    main()