#!/usr/bin/env python3
"""
Test script to verify the Node.js to Python integration works correctly.
"""

import subprocess
import sys
import json
import base64
import httpx

def test_image_qa_script():
    """Test the process_image_qa.py script directly."""
    
    print("🧪 Testing process_image_qa.py script")
    print("=" * 50)
    
    # Download a test image and convert to base64
    test_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg/320px-Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg"
    
    try:
        print("📥 Downloading test image...")
        response = httpx.get(test_url)
        test_image_base64 = base64.standard_b64encode(response.content).decode("utf-8")
        print(f"✅ Downloaded image ({len(test_image_base64)} characters)")
        
        print("\n🐍 Testing Python script...")
        
        # Test the script
        result = subprocess.run([
            sys.executable, 'process_image_qa.py',
            '--base64', test_image_base64,
            '--language', 'Spanish',
            '--level', 'A2',
            '--user-id', 'test-user-123'
        ], capture_output=True, text=True, cwd='/Users/jaimeng/Desktop/lexipic/backend/api')
        
        print(f"Exit code: {result.returncode}")
        
        if result.stderr:
            print(f"STDERR: {result.stderr}")
        
        if result.returncode == 0:
            try:
                output_data = json.loads(result.stdout)
                print("✅ Script executed successfully!")
                print(f"📊 Response structure:")
                print(f"  - Success: {output_data.get('success')}")
                print(f"  - Language: {output_data.get('learning_context', {}).get('language')}")
                print(f"  - Level: {output_data.get('learning_context', {}).get('level')}")
                print(f"  - Questions: {output_data.get('total_questions')}")
                print(f"  - Description: {output_data.get('image_analysis', {}).get('description', '')[:100]}...")
                
                # Show first question
                questions = output_data.get('questions', [])
                if questions:
                    first_q = questions[0]
                    print(f"\n📝 First Question:")
                    print(f"  Q: {first_q.get('question')}")
                    print(f"  A: {first_q.get('expected_answer')}")
                    print(f"  Points: {first_q.get('points')}")
                    print(f"  Type: {first_q.get('question_type')}")
                
                return True
                
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse JSON output: {e}")
                print(f"Raw output: {result.stdout[:500]}...")
                return False
        else:
            print(f"❌ Script failed with exit code {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_evaluation_script():
    """Test the evaluate_answers.py script directly."""
    
    print(f"\n🧪 Testing evaluate_answers.py script")
    print("=" * 50)
    
    # Mock evaluation data
    eval_data = {
        "image_description": "A family camping scene with a tent and campfire",
        "questions": [
            {
                "id": 1,
                "question": "¿Dónde está la familia?",
                "expected_answer": "En un campamento",
                "question_type": "comprehension",
                "points": 100
            }
        ],
        "student_answers": ["Están acampando"],
        "language": "Spanish",
        "level": "A2",
        "user_id": "test-user-123"
    }
    
    try:
        print("🐍 Testing evaluation script...")
        
        result = subprocess.run([
            sys.executable, 'evaluate_answers.py',
            '--data', json.dumps(eval_data)
        ], capture_output=True, text=True, cwd='/Users/jaimeng/Desktop/lexipic/backend/api')
        
        print(f"Exit code: {result.returncode}")
        
        if result.stderr:
            print(f"STDERR: {result.stderr}")
        
        if result.returncode == 0:
            try:
                output_data = json.loads(result.stdout)
                print("✅ Evaluation script executed successfully!")
                print(f"📊 Response structure:")
                print(f"  - Success: {output_data.get('success')}")
                
                eval_summary = output_data.get('evaluation_summary', {})
                if eval_summary:
                    summary = eval_summary.get('summary', {})
                    print(f"  - Total points: {summary.get('total_points')}/{summary.get('max_points')}")
                    print(f"  - Percentage: {summary.get('percentage')}%")
                    print(f"  - Questions answered: {summary.get('questions_answered')}")
                
                evaluations = eval_summary.get('evaluations', [])
                if evaluations:
                    first_eval = evaluations[0]
                    print(f"\n📝 First evaluation:")
                    print(f"  Feedback: {first_eval.get('feedback', '')[:100]}...")
                    print(f"  Score: {first_eval.get('points_earned')}/{first_eval.get('max_points')}")
                
                return True
                
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse JSON output: {e}")
                print(f"Raw output: {result.stdout[:500]}...")
                return False
        else:
            print(f"❌ Evaluation script failed with exit code {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ Evaluation test failed: {e}")
        return False

def main():
    """Run all integration tests."""
    
    print("🚀 Node.js-Python Integration Test Suite")
    print("=" * 60)
    
    tests = [
        test_image_qa_script,
        test_evaluation_script
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
                print("✅ PASSED\n")
            else:
                failed += 1
                print("❌ FAILED\n")
        except Exception as e:
            print(f"❌ Test crashed: {e}\n")
            failed += 1
    
    print("📊 Integration Test Results:")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Success rate: {round(passed / (passed + failed) * 100, 1)}%")
    
    if failed == 0:
        print(f"\n🎉 All integration tests passed! The API is ready for frontend integration.")
        return 0
    else:
        print(f"\n⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
