#!/usr/bin/env python3
"""
Node.js-callable wrapper for complete image processing and Q&A generation.
Takes base64 image and user preferences, returns complete Q&A sets.
"""

import sys
import json
import argparse
import os
import traceback

# Add the pic_process and question directories to the Python path
script_dir = os.path.dirname(os.path.abspath(__file__))
pic_process_dir = os.path.join(script_dir, '..', 'pic_process')
question_dir = os.path.join(script_dir, '..', 'question')

sys.path.append(pic_process_dir)
sys.path.append(question_dir)

try:
    from interface import pic_process
    from utils import process_image_to_qa
except ImportError as e:
    print(json.dumps({
        "success": False,
        "error": f"Failed to import required modules: {str(e)}"
    }))
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Process image and generate Q&A sets')
    parser.add_argument('--base64', type=str, required=True, help='Base64 encoded image data')
    parser.add_argument('--language', type=str, default='Spanish', help='Target language (e.g., Spanish, Japanese, Chinese)')
    parser.add_argument('--level', type=str, default='A2', help='Language proficiency level (A1, A2, B1, B2, C1, C2)')
    parser.add_argument('--user-id', type=str, help='User ID (optional)')
    
    try:
        args = parser.parse_args()
        
        # Step 1: Process image with pic_process
        processor = pic_process()
        
        # Process the base64 image
        pic_result = processor.process_base64_image(args.base64)
        
        if pic_result.get('error'):
            print(json.dumps({
                "success": False,
                "error": f"Image processing failed: {pic_result['error']}"
            }))
            sys.exit(1)
        
        # Step 2: Generate complete Q&A sets
        qa_result = process_image_to_qa(pic_result, args.language, args.level)
        
        if qa_result.get('error'):
            print(json.dumps({
                "success": False,
                "error": f"Q&A generation failed: {qa_result['error']}"
            }))
            sys.exit(1)
        
        # Step 3: Format response for Node.js/frontend consumption
        response = {
            "success": True,
            "image_analysis": {
                "description": pic_result.get("description", ""),
                "primary_object": pic_result.get("primary_object", ""),
                "detected_objects": pic_result.get("objects", []),
                "confidence": pic_result.get("confidence", 0.85)
            },
            "learning_context": qa_result["learning_context"],
            "questions": qa_result["questions"],
            "total_questions": qa_result["total_questions"],
            "instructions": qa_result["instructions"],
            "metadata": {
                "processed_at": None,  # Will be set by Node.js
                "user_id": args.user_id,
                "request_type": "image_qa_generation"
            }
        }
        
        # Output JSON response for Node.js to consume
        print(json.dumps(response, ensure_ascii=False, indent=2))
        sys.stdout.flush()
        
    except Exception as e:
        error_response = {
            "success": False,
            "error": f"Unexpected error: {str(e)}",
            "error_type": type(e).__name__,
            "traceback": traceback.format_exc() if os.environ.get('DEBUG') else None
        }
        print(json.dumps(error_response))
        sys.stderr.write(f"Error in process_image_qa.py: {str(e)}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
