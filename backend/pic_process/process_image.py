#!/usr/bin/env python3
"""
Command-line wrapper for pic_process module.
Accepts base64 image data and returns JSON output compatible with question.py.

Usage:
    python3 process_image.py --base64 <base64_image_data>
    python3 process_image.py --file <path_to_image_file>

Output:
    JSON object with image analysis data compatible with question.py
"""

import sys
import json
import argparse
import base64
from interface import pic_process

def main():
    parser = argparse.ArgumentParser(description='Process image and return analysis data')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--base64', type=str, help='Base64 encoded image data')
    group.add_argument('--file', type=str, help='Path to image file')
    parser.add_argument('--format', choices=['json', 'question'], default='question', 
                       help='Output format: json (full data) or question (question.py compatible)')
    
    try:
        args = parser.parse_args()
        
        # Initialize pic_process
        processor = pic_process()
        
        if args.base64:
            # Process base64 data
            base64_data = args.base64
        else:
            # Read file and convert to base64
            with open(args.file, 'rb') as f:
                image_bytes = f.read()
                base64_data = base64.standard_b64encode(image_bytes).decode('utf-8')
        
        if args.format == 'question':
            # Return format compatible with question.py
            result = processor.process_base64_image(base64_data)
        else:
            # Return full analysis data
            result = processor.image_to_json(base64_data)
        
        # Output the result (for consumption by other systems)
        print(json.dumps(result, indent=2))
        sys.stdout.flush()
        
        # Exit with appropriate code
        if result.get('error'):
            sys.exit(1)
        else:
            sys.exit(0)
        
    except Exception as e:
        # Return error as JSON
        error_response = {
            "error": True,
            "message": str(e),
            "type": type(e).__name__
        }
        print(json.dumps(error_response, indent=2))
        sys.stderr.write(f"Error processing image: {str(e)}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
