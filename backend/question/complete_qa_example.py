#!/usr/bin/env python3
"""
Complete example demonstrating the pic_process → question generation workflow.
Shows how to generate complete Q&A sets with answers, points, and feedback.
"""

import sys
import json
import base64
import httpx

# Import pic_process
sys.path.append('../pic_process')
from interface import pic_process

# Import question generation
from utils import process_image_to_qa, evaluate_student_answers, generate_complete_qa_set

def demo_complete_workflow():
    """Demonstrate the complete workflow from image to Q&A generation."""
    
    print("🎓 Complete Q&A Generation Demo")
    print("=" * 50)
    
    # Step 1: Process image with pic_process
    print("📸 Step 1: Processing image with pic_process")
    print("-" * 30)
    
    processor = pic_process()
    
    # Download test image
    test_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg/640px-Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg"
    
    try:
        response = httpx.get(test_url)
        test_image_base64 = base64.standard_b64encode(response.content).decode("utf-8")
        
        # Process image
        pic_result = processor.process_base64_image(test_image_base64)
        
        if pic_result.get('error'):
            print(f"❌ Image processing failed: {pic_result['error']}")
            return
            
        print(f"✅ Image processed successfully!")
        print(f"📝 Description: {pic_result['description'][:100]}...")
        print(f"🎯 Primary object: {pic_result.get('primary_object', 'N/A')}")
        print(f"📋 Objects: {pic_result.get('objects', [])[:3]}...")  # Show first 3
        
    except Exception as e:
        print(f"❌ Image processing error: {e}")
        return
    
    # Step 2: Generate complete Q&A sets
    print(f"\n❓ Step 2: Generating complete Q&A sets")
    print("-" * 30)
    
    # Test different languages and levels
    test_configs = [
        {"language": "Spanish", "level": "A2"},
        {"language": "Japanese", "level": "B1"},
        {"language": "Chinese", "level": "A1"}
    ]
    
    for config in test_configs:
        language = config["language"]
        level = config["level"]
        
        print(f"\n🌍 Generating questions for {language} (Level {level})")
        
        # Use the new complete workflow function
        qa_result = process_image_to_qa(pic_result, language, level)
        
        if qa_result.get("error"):
            print(f"❌ Q&A generation failed: {qa_result['error']}")
            continue
        
        print(f"✅ Generated {qa_result['total_questions']} questions")
        print(f"📚 Instructions: {qa_result['instructions']}")
        
        # Display generated questions
        for i, question in enumerate(qa_result['questions'], 1):
            print(f"\n   Question {i}:")
            print(f"   ❓ {question['question']}")
            print(f"   ✅ Expected: {question['expected_answer']}")
            print(f"   📊 Points: {question.get('points', 100)}")
            print(f"   🏷️  Type: {question.get('question_type', 'comprehension')}")
        
        # Demo evaluation with sample student answers
        print(f"\n📊 Step 3: Evaluating sample student answers")
        print("-" * 30)
        
        # Mock student answers (in practice, these would come from user input)
        sample_answers = [
            "Una casa",  # For Spanish
            "建物です",  # For Japanese  
            "房子"       # For Chinese
        ]
        
        # Use first answer for demonstration
        if qa_result['questions']:
            demo_student_answer = sample_answers[0] if language == "Spanish" else sample_answers[1] if language == "Japanese" else sample_answers[2]
            
            # Evaluate single answer
            img_data = {
                "description": pic_result["description"]
            }
            user_data = {
                "language": language,
                "level": level
            }
            
            evaluation = evaluate_student_answers(
                img_data, 
                user_data, 
                qa_result['questions'][:1],  # Just first question
                [demo_student_answer]
            )
            
            if evaluation['evaluations']:
                eval_result = evaluation['evaluations'][0]
                if not eval_result.get('error'):
                    print(f"   📝 Student answered: '{demo_student_answer}'")
                    print(f"   📊 Score: {eval_result.get('points_earned', 0)}/{eval_result.get('max_points', 100)}")
                    print(f"   💭 Feedback: {eval_result.get('feedback', 'No feedback')[:100]}...")
        
        print(f"\n" + "="*50)
        break  # Just show one language for demo

def demo_data_structure():
    """Show the data structure that frontend/backend can expect."""
    
    print("🏗️  Data Structure Documentation")
    print("=" * 50)
    
    # Mock pic_process output
    mock_pic_output = {
        "description": "A modern university building with students walking outside",
        "primary_object": "building",
        "objects": ["building", "students", "sidewalk", "trees"],
        "confidence": 0.85
    }
    
    print("📥 INPUT: pic_process() output format")
    print(json.dumps(mock_pic_output, indent=2))
    
    print(f"\n📤 OUTPUT: Complete Q&A format")
    
    # This is what the complete workflow returns
    mock_qa_output = {
        "success": True,
        "image_context": {
            "description": "A modern university building...",
            "primary_object": "building",
            "detected_objects": ["building", "students", "sidewalk"]
        },
        "learning_context": {
            "language": "Spanish",
            "level": "A2"
        },
        "questions": [
            {
                "id": 1,
                "question": "¿Qué tipo de edificio ves en la imagen?",
                "expected_answer": "Un edificio universitario",
                "question_type": "comprehension",
                "difficulty": 2,
                "points": 100
            },
            {
                "id": 2,
                "question": "¿Dónde están caminando los estudiantes?",
                "expected_answer": "En la acera fuera del edificio",
                "question_type": "comprehension", 
                "difficulty": 3,
                "points": 100
            },
            {
                "id": 3,
                "question": "¿Qué puedes ver además del edificio?",
                "expected_answer": "Estudiantes y árboles",
                "question_type": "vocabulary",
                "difficulty": 2,
                "points": 100
            }
        ],
        "total_questions": 3,
        "instructions": "Answer these 3 questions in Spanish based on the image you saw."
    }
    
    print(json.dumps(mock_qa_output, indent=2, ensure_ascii=False))
    
    print(f"\n🔄 EVALUATION: Student answer evaluation format")
    
    mock_evaluation = {
        "evaluations": [
            {
                "question_id": 1,
                "question": "¿Qué tipo de edificio ves en la imagen?",
                "expected_answer": "Un edificio universitario",
                "student_answer": "Una casa grande",
                "points_earned": 60,
                "max_points": 100,
                "percentage": 60,
                "feedback": "Your answer shows you can identify it's a building, but 'casa' is not quite correct for this type of institutional building. The word 'edificio' would be more appropriate.",
                "areas_for_improvement": ["specific vocabulary", "building types"],
                "strengths": ["basic noun identification", "gender agreement"]
            }
        ],
        "summary": {
            "total_points": 60,
            "max_points": 100,
            "percentage": 60.0,
            "questions_answered": 1,
            "level": "A2",
            "language": "Spanish"
        }
    }
    
    print(json.dumps(mock_evaluation, indent=2, ensure_ascii=False))

def main():
    """Run the complete demo."""
    
    print("🧪 Complete Q&A System Demo")
    print("=" * 60)
    
    # Show data structures
    demo_data_structure()
    
    print(f"\n🚀 Running live demo...")
    print("-" * 30)
    
    # Run live demo
    try:
        demo_complete_workflow()
    except Exception as e:
        print(f"❌ Demo failed: {e}")
        print("Make sure you have ANTHROPIC_API_KEY set and dependencies installed")
        return 1
    
    print(f"\n🎉 Demo completed!")
    print(f"\n💡 Usage Summary:")
    print(f"1. pic_process().process_base64_image(base64) → image analysis")
    print(f"2. process_image_to_qa(analysis, language, level) → complete Q&A")
    print(f"3. evaluate_student_answers(data, qa_sets, answers) → scoring & feedback")
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
