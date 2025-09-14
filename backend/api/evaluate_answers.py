#!/usr/bin/env python3
"""
Node.js-callable script for evaluating student answers.
Takes questions and student answers, returns detailed evaluation and feedback.
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
    from utils import evaluate_student_answers
except ImportError as e:
    print(json.dumps({
        "success": False,
        "error": f"Failed to import required modules: {str(e)}"
    }))
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Evaluate student answers and provide feedback')
    parser.add_argument('--data', type=str, required=True, help='JSON data containing evaluation request')
    
    try:
        args = parser.parse_args()
        
        # Parse the evaluation data
        try:
            eval_data = json.loads(args.data)
        except json.JSONDecodeError as e:
            print(json.dumps({
                "success": False,
                "error": f"Invalid JSON data: {str(e)}"
            }))
            sys.exit(1)
        
        # Extract required fields
        required_fields = ['image_description', 'questions', 'student_answers', 'language', 'level']
        for field in required_fields:
            if field not in eval_data:
                print(json.dumps({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }))
                sys.exit(1)
        
        # Prepare data for evaluation function
        img_data = {
            "description": eval_data["image_description"]
        }
        
        user_data = {
            "language": eval_data["language"],
            "level": eval_data["level"]
        }
        
        questions = eval_data["questions"]
        student_answers = eval_data["student_answers"]
        
        # Perform evaluation
        evaluation_result = evaluate_student_answers(
            img_data, 
            user_data, 
            questions, 
            student_answers
        )
        
        # Format response for Node.js
        response = {
            "success": True,
            "evaluation_summary": evaluation_result,
            "metadata": {
                "evaluated_at": None,  # Will be set by Node.js
                "user_id": eval_data.get("user_id"),
                "request_type": "answer_evaluation",
                "questions_count": len(questions),
                "language": eval_data["language"],
                "level": eval_data["level"]
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
        sys.stderr.write(f"Error in evaluate_answers.py: {str(e)}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
