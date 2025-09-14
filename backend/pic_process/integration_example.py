#!/usr/bin/env python3
"""
Example showing how pic_process integrates with question.py

This demonstrates the complete workflow:
1. Process base64 image with pic_process
2. Use the output to generate questions with question.py
3. Handle user interaction and feedback
"""

import sys
import os
import base64
import httpx
from interface import pic_process
from config import config  # Import config to ensure .env is loaded

# Add question module to path
sys.path.append('../question')
from utils import get_questions, get_feedback

def main():
    print("🖼️  Image Processing + Question Generation Integration Test")
    print("=" * 60)
    
    # Verify configuration
    print(f"🔑 API Key loaded: {'✅' if config.anthropic_api_key else '❌'}")
    print(f"📁 Upload path: {config.upload_path}")
    
    # Initialize image processor
    processor = pic_process()
    
    # Test with a sample image (download from web)
    print("📥 Downloading test image...")
    test_image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg/640px-Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg"
    
    try:
        response = httpx.get(test_image_url)
        test_image_base64 = base64.standard_b64encode(response.content).decode("utf-8")
        print("✅ Image downloaded successfully")
    except Exception as e:
        print(f"❌ Failed to download test image: {e}")
        return
    
    # Process image with pic_process
    print("\n🔍 Processing image with pic_process...")
    try:
        img_data = processor.process_base64_image(test_image_base64)
        
        if img_data.get('error'):
            print(f"❌ Image processing failed: {img_data['error']}")
            return
        
        print("✅ Image processed successfully!")
        print(f"📝 Description: {img_data['description'][:100]}...")
        print(f"🎯 Primary object: {img_data.get('primary_object', 'N/A')}")
        print(f"📋 Objects found: {img_data.get('objects', [])[:5]}")  # Show first 5
        
    except Exception as e:
        print(f"❌ Image processing error: {e}")
        return
    
    # Generate questions using the processed image data
    print("\n❓ Generating questions...")
    user_data = {
        "language": "Spanish",
        "level": "A2"
    }
    
    try:
        questions_result = get_questions(img_data, user_data)
        print("✅ Questions generated successfully!")
        print(f"🎓 Level: {questions_result['level']}")
        print("❓ Generated questions:")
        
        for i, question in enumerate(questions_result['questions'], 1):
            print(f"   {i}. {question}")
        
        # Interactive demo (optional)
        print(f"\n🗣️  Interactive Demo (Language: {user_data['language']})")
        print("You can answer one of these questions to test the feedback system.")
        print("Press Enter to skip the interactive demo.\n")
        
        user_input = input("Your answer (or press Enter to skip): ").strip()
        
        if user_input:
            # Get feedback for the first question
            feedback = get_feedback(img_data, user_data, questions_result['questions'][0], user_input)
            print(f"\n📊 Feedback: {feedback['feedback']}")
            print(f"🏆 Score: {feedback['points']}/100")
        else:
            print("⏭️  Skipping interactive demo")
        
    except Exception as e:
        print(f"❌ Question generation error: {e}")
        return
    
    print("\n🎉 Integration test completed successfully!")
    print("\n💡 Usage Summary:")
    print("1. pic_process.process_base64_image(base64_data) → img_data")
    print("2. get_questions(img_data, user_data) → questions")
    print("3. get_feedback(img_data, user_data, question, answer) → feedback")

if __name__ == "__main__":
    main()
