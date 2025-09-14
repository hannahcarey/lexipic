# pic_process - Image Analysis Module

This module processes images to extract objects, descriptions, and bounding boxes for language learning applications.

## 🚀 Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**
   
   **Option A: Using .env file (Recommended)**
   
   Create a `.env` file in the `pic_process` directory:
   ```bash
   # .env file
   ANTHROPIC_API_KEY=your_api_key_here
   UPLOAD_PATH=./uploads
   ENVIRONMENT=development
   ```
   
   **Option B: Using system environment variables**
   ```bash
   export ANTHROPIC_API_KEY="your_api_key_here"
   ```

3. **Test Configuration**
   ```bash
   python3 test_env_config.py
   ```

## 📋 Features

- **Object Detection**: Identifies objects in images using AI vision models
- **Scene Description**: Generates detailed descriptions of image content
- **Bounding Boxes**: Locates objects with precise coordinates
- **Base64 Support**: Handles base64 encoded images directly
- **Question.py Integration**: Output format compatible with question generation

## 🔧 Usage

### Python API

```python
from interface import pic_process

# Initialize processor
processor = pic_process()

# Process base64 image for question generation
img_data = processor.process_base64_image(base64_image)

# img_data contains:
# {
#   "description": "A detailed scene description...",
#   "primary_object": "table",
#   "objects": ["table", "chair", "book", ...],
#   "confidence": 0.85
# }
```

### Command Line

```bash
# Process base64 data
python3 process_image.py --base64 "iVBORw0KGgoAAAAN..."

# Process image file
python3 process_image.py --file "path/to/image.jpg"

# Get question.py compatible format (default)
python3 process_image.py --file "image.jpg" --format question

# Get full analysis data
python3 process_image.py --file "image.jpg" --format json
```

## 🔗 Integration with question.py

The module is designed to work seamlessly with the question generation system:

```python
# 1. Process image
from interface import pic_process
processor = pic_process()
img_data = processor.process_base64_image(base64_image)

# 2. Generate questions
import sys
sys.path.append('../question')
from utils import get_questions

user_data = {"language": "Spanish", "level": "A2"}
questions = get_questions(img_data, user_data)

# 3. Get feedback
from utils import get_feedback
feedback = get_feedback(img_data, user_data, question, answer)
```

## 🧪 Testing

```bash
# Test pic_process functionality
python3 test_pic_process.py

# Test full integration with question.py
python3 integration_example.py
```

## 📁 File Structure

```
pic_process/
├── interface.py              # Main processing class
├── generate_word_list.py     # Object detection using Anthropic
├── generate_summary.py       # Scene description generation  
├── generate_bounding_box.py  # Object localization
├── process_image.py          # Command-line wrapper
├── test_pic_process.py       # Unit tests
├── integration_example.py    # Integration demo
├── requirements.txt          # Dependencies
└── README.md                # This file
```

## 🔄 API Reference

### pic_process Class

#### `image_to_json(image: str) -> dict`
Process base64 image and return full analysis data.

**Parameters:**
- `image`: Base64 encoded image string

**Returns:**
- Dictionary with analysis results including description, objects, boxes

#### `process_base64_image(base64_image: str) -> dict`
Simplified interface returning data compatible with question.py.

**Parameters:**
- `base64_image`: Base64 encoded image (with or without data URL prefix)

**Returns:**
- Dictionary with `description`, `primary_object`, `objects`, `confidence`

#### `base64_to_PIL(base64_str: str) -> PIL.Image`
Convert base64 string to PIL Image object.

## ⚙️ Configuration

### Environment Variables

The module uses a flexible configuration system that loads from:
1. `.env` file in the pic_process directory (recommended)
2. `.env` file in parent directories  
3. System environment variables

**Required:**
- `ANTHROPIC_API_KEY`: Get from https://console.anthropic.com/

**Optional:**
- `UPLOAD_PATH`: Directory for saving processed images (default: `./uploads`)
- `ENVIRONMENT`: Set to `development` or `production` (default: `development`)

### Configuration Files

- `config.py`: Environment loader with validation and client management
- `test_env_config.py`: Test script to verify configuration is working

### Dependencies

See `requirements.txt` for complete list. Key packages:
- `anthropic`: AI API client
- `Pillow`: Image processing
- `torch`: PyTorch for object detection
- `transformers`: Hugging Face models
- `httpx`: HTTP client

## 🐛 Troubleshooting

1. **"No objects detected"**: Image may be too simple or unclear
2. **API key errors**: Ensure ANTHROPIC_API_KEY is set correctly
3. **Memory issues**: Large images may need resizing
4. **Import errors**: Check all dependencies are installed

## 📝 Output Format

### For question.py integration:
```json
{
  "description": "A family sitting around a campfire...",
  "primary_object": "campfire",
  "objects": ["campfire", "family", "tent", "mountains"],
  "confidence": 0.85
}
```

### Full analysis format:
```json
{
  "request_id": 1,
  "description": "A family sitting around a campfire...",
  "primary_object": "campfire",
  "objects": ["campfire", "family", "tent", "mountains"],
  "boxes": {"campfire": [145, 200, 300, 350]},
  "success": true
}
```
