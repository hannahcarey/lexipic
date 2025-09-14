import requests

import torch
from PIL import Image
from transformers import AutoProcessor, AutoModelForZeroShotObjectDetection, infer_device

#these imports take a bajillion seconds to load
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def test():
<<<<<<< HEAD
    image_url = "http://images.cocodataset.org/val2017/000000039769.jpg"
    image = Image.open(requests.get(image_url, stream=True).raw)
    # Check for cats and remote controls
    object = "cat"
    box= make_box(image,object)# [x0, y0, x1, y1]
=======
    model_id = "IDEA-Research/grounding-dino-tiny"
    device = infer_device() #why is this taking so long??
    processor = AutoProcessor.from_pretrained(model_id)
    model = AutoModelForZeroShotObjectDetection.from_pretrained(model_id).to(device) 
    image_url = "http://images.cocodataset.org/val2017/000000039769.jpg"
    image = Image.open(requests.get(image_url, stream=True).raw)
    # Check for cats and remote controls
    text_labels = [["a cat", "a remote control"]]

    inputs = processor(images=image, text=text_labels, return_tensors="pt").to(model.device)
    with torch.no_grad():
        outputs = model(**inputs)

    results = processor.post_process_grounded_object_detection(
        outputs,
        inputs.input_ids,
        threshold=0.4,
        text_threshold=0.3,
        target_sizes=[image.size[::-1]]
    )

    result = results[0]
    for box, score, labels in zip(result["boxes"], result["scores"], result["labels"]):
        box = [round(x, 2) for x in box.tolist()]
        print(f"Detected {labels} with confidence {round(score.item(), 3)} at location {box}")
>>>>>>> 81358c22c863230733c0f52b5f0c0e927b6e4441

    #plot the image here


    # Plot image with bounding boxes
    fig, ax = plt.subplots(1, figsize=(12, 8))
    ax.imshow(image)

<<<<<<< HEAD
    label_name = object

    # Box coordinates
    x0, y0, x1, y1 = box
    width, height = x1 - x0, y1 - y0
    # Draw rectangle
    rect = patches.Rectangle((x0, y0), width, height, linewidth=2, edgecolor='red', facecolor='none')
    ax.add_patch(rect)
    # Add label text
    ax.text(x0, y0 - 5, f"{label_name}", color='red', fontsize=12, weight='bold')
=======
    result = results[0]
    for box_tensor, score_tensor, label in zip(result["boxes"], result["scores"], result["labels"]):
        # Convert label ID to string
        label_name = label

        box = box_tensor.tolist()  # [x0, y0, x1, y1]
        score = score_tensor.item()  # confidence score as float
        # Box coordinates
        x0, y0, x1, y1 = box
        width, height = x1 - x0, y1 - y0
        # Draw rectangle
        rect = patches.Rectangle((x0, y0), width, height, linewidth=2, edgecolor='red', facecolor='none')
        ax.add_patch(rect)
        # Add label text
        ax.text(x0, y0 - 5, f"{label_name} {score:.2f}", color='red', fontsize=12, weight='bold')
>>>>>>> 81358c22c863230733c0f52b5f0c0e927b6e4441

    plt.axis('off')
    plt.show()

#input is a 3d array image, string object 
<<<<<<< HEAD
# output: [x0,y0,x1,y1] top left, bottom right points of the bounding box for the object
=======
>>>>>>> 81358c22c863230733c0f52b5f0c0e927b6e4441
def make_box(image,object):
    model_id = "IDEA-Research/grounding-dino-tiny"
    device = infer_device() 
    processor = AutoProcessor.from_pretrained(model_id)
    model = AutoModelForZeroShotObjectDetection.from_pretrained(model_id).to(device)
    # Check for cats and remote controls
    text_labels = [[object]]

    inputs = processor(images=image, text=text_labels, return_tensors="pt").to(model.device)
    with torch.no_grad():
        outputs = model(**inputs)

    results = processor.post_process_grounded_object_detection(
        outputs,
        inputs.input_ids,
        threshold=0.4,
        text_threshold=0.3,
        target_sizes=[image.size[::-1]]
    )

    result = results[0]
<<<<<<< HEAD
    best_box=None
    best_score=-1
    for box, score, labels in zip(result["boxes"], result["scores"], result["labels"]):
        box = [round(x, 2) for x in box.tolist()]
        print(f"Detected {labels} with confidence {round(score.item(), 3)} at location {box}")
        if score>best_score:
            best_box=box
    print(f"best box is {best_box}")
    return box
=======
    best_box
    for box, score, labels in zip(result["boxes"], result["scores"], result["labels"]):
        box = [round(x, 2) for x in box.tolist()]
        print(f"Detected {labels} with confidence {round(score.item(), 3)} at location {box}")

    #plot the image here
>>>>>>> 81358c22c863230733c0f52b5f0c0e927b6e4441

def main():
    test()

if __name__ == "__main__":
    main()