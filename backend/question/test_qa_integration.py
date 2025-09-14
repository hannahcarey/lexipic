#!/usr/bin/env python3
"""
Test script for the pic_process → question generation integration.
Validates that the complete workflow functions correctly.
"""

import sys
import json

# Import the functions we want to test
from utils import generate_complete_qa_set, evaluate_student_answers, process_image_to_qa

def test_generate_complete_qa_set():
    """Test the complete Q&A generation function."""
    
    print("🧪 Testing generate_complete_qa_set()")
    print("-" * 40)
    
    # Mock image data (what pic_process would return)
    mock_img_data = {
        "description": "A family is sitting around a campfire at a campsite in the mountains. They are roasting marshmallows and wearing jackets. A tent is set up nearby, and the stars are visible in the night sky.",
        "primary_object": "campfire",
        "objects": ["campfire", "family", "tent", "marshmallows", "mountains", "stars"]
    }
    
    # Mock user data
    mock_user_data = {
        "language": "Spanish",
        "level": "A2"
    }
    
    try:
        result = generate_complete_qa_set(mock_img_data, mock_user_data)
        
        if result.get("error"):
            print(f"❌ Function returned error: {result['error']}")
            return False
        
        # Validate structure
        required_keys = ["level", "language", "qa_sets"]
        for key in required_keys:
            if key not in result:
                print(f"❌ Missing required key: {key}")
                return False
        
        # Validate Q&A sets
        qa_sets = result["qa_sets"]
        if len(qa_sets) != 3:
            print(f"❌ Expected 3 Q&A sets, got {len(qa_sets)}")
            return False
        
        for i, qa_set in enumerate(qa_sets, 1):
            required_qa_keys = ["question", "expected_answer", "id"]
            for key in required_qa_keys:
                if key not in qa_set:
                    print(f"❌ Q&A set {i} missing key: {key}")
                    return False
            
            print(f"✅ Q&A Set {i}:")
            print(f"   Question: {qa_set['question'][:50]}...")
            print(f"   Answer: {qa_set['expected_answer'][:50]}...")
            print(f"   Points: {qa_set.get('points', 'N/A')}")
        
        print(f"✅ generate_complete_qa_set() works correctly")
        return True
        
    except Exception as e:
        print(f"❌ Error testing generate_complete_qa_set(): {e}")
        return False

def test_evaluate_student_answers():
    """Test the student answer evaluation function."""
    
    print(f"\n🧪 Testing evaluate_student_answers()")
    print("-" * 40)
    
    # Mock data
    mock_img_data = {
        "description": "A family camping scene with a campfire and tent."
    }
    
    mock_user_data = {
        "language": "Spanish", 
        "level": "A2"
    }
    
    mock_qa_sets = [
        {
            "id": 1,
            "question": "¿Qué está haciendo la familia?",
            "expected_answer": "Está acampando",
            "points": 100,
            "question_type": "comprehension"
        }
    ]
    
    mock_student_answers = ["Están de camping"]
    
    try:
        result = evaluate_student_answers(
            mock_img_data, 
            mock_user_data, 
            mock_qa_sets, 
            mock_student_answers
        )
        
        # Validate structure
        if "evaluations" not in result or "summary" not in result:
            print(f"❌ Missing required keys in evaluation result")
            return False
        
        evaluations = result["evaluations"]
        if len(evaluations) != 1:
            print(f"❌ Expected 1 evaluation, got {len(evaluations)}")
            return False
        
        evaluation = evaluations[0]
        if evaluation.get("error"):
            print(f"❌ Evaluation returned error: {evaluation['error']}")
            return False
        
        required_eval_keys = ["question_id", "points_earned", "max_points", "feedback"]
        for key in required_eval_keys:
            if key not in evaluation:
                print(f"❌ Missing evaluation key: {key}")
                return False
        
        print(f"✅ Evaluation result:")
        print(f"   Question ID: {evaluation['question_id']}")
        print(f"   Score: {evaluation['points_earned']}/{evaluation['max_points']}")
        print(f"   Feedback: {evaluation['feedback'][:80]}...")
        
        print(f"✅ evaluate_student_answers() works correctly")
        return True
        
    except Exception as e:
        print(f"❌ Error testing evaluate_student_answers(): {e}")
        return False

def test_process_image_to_qa():
    """Test the complete workflow function."""
    
    print(f"\n🧪 Testing process_image_to_qa()")
    print("-" * 40)
    
    # Mock pic_process output
    mock_pic_output = {
        "description": "A modern classroom with students sitting at desks while a teacher writes on a whiteboard.",
        "primary_object": "classroom",
        "objects": ["classroom", "students", "desks", "teacher", "whiteboard"],
        "confidence": 0.9
    }
    
    try:
        result = process_image_to_qa(mock_pic_output, "Japanese", "B1")
        
        if result.get("error"):
            print(f"❌ Function returned error: {result['error']}")
            return False
        
        # Validate structure
        required_keys = ["success", "image_context", "learning_context", "questions", "total_questions"]
        for key in required_keys:
            if key not in result:
                print(f"❌ Missing required key: {key}")
                return False
        
        # Check that it's properly formatted for frontend
        if not result["success"]:
            print(f"❌ Success flag is False")
            return False
        
        if result["total_questions"] != len(result["questions"]):
            print(f"❌ Question count mismatch")
            return False
        
        print(f"✅ Workflow result:")
        print(f"   Language: {result['learning_context']['language']}")
        print(f"   Level: {result['learning_context']['level']}")
        print(f"   Questions: {result['total_questions']}")
        print(f"   Description: {result['image_context']['description'][:60]}...")
        
        print(f"✅ process_image_to_qa() works correctly")
        return True
        
    except Exception as e:
        print(f"❌ Error testing process_image_to_qa(): {e}")
        return False

def test_data_validation():
    """Test input validation."""
    
    print(f"\n🧪 Testing data validation")
    print("-" * 40)
    
    # Test invalid level
    invalid_img_data = {"description": "Test scene"}
    invalid_user_data = {"language": "Spanish", "level": "INVALID"}
    
    result = generate_complete_qa_set(invalid_img_data, invalid_user_data)
    if not result.get("error"):
        print(f"❌ Should have failed with invalid level")
        return False
    else:
        print(f"✅ Correctly rejected invalid level")
    
    # Test empty description
    empty_img_data = {"description": ""}
    valid_user_data = {"language": "Spanish", "level": "A1"}
    
    result = generate_complete_qa_set(empty_img_data, valid_user_data)
    if not result.get("error"):
        print(f"❌ Should have failed with empty description")
        return False
    else:
        print(f"✅ Correctly rejected empty description")
    
    print(f"✅ Data validation works correctly")
    return True

def main():
    """Run all tests."""
    
    print("🧪 Q&A Integration Test Suite")
    print("=" * 50)
    
    tests = [
        test_data_validation,
        test_generate_complete_qa_set,
        test_evaluate_student_answers,
        test_process_image_to_qa
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
            failed += 1
    
    print(f"\n📊 Test Results:")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Success rate: {round(passed / (passed + failed) * 100, 1)}%")
    
    if failed == 0:
        print(f"\n🎉 All tests passed! The Q&A system is ready to use.")
        return 0
    else:
        print(f"\n⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
