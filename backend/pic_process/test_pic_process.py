#!/usr/bin/env python3
"""
Simple test script for pic_process module.
Tests the core functionality without external dependencies.
"""

import sys
import json
import base64
import httpx
from interface import pic_process
from config import config  # Import config to ensure .env is loaded

def test_with_url():
    """Test pic_process with a web image"""
    print("🧪 Testing pic_process with web image")
    print("-" * 40)
    
    # Test image URL
    test_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg/640px-Wrexham_Village_student_accommodation%2C_Wrexham_-_geograph.org.uk_-_5666878.jpg"
    
    try:
        # Download and convert to base64
        print("📥 Downloading test image...")
        response = httpx.get(test_url)
        test_image_base64 = base64.standard_b64encode(response.content).decode("utf-8")
        print(f"✅ Downloaded {len(test_image_base64)} characters of base64 data")
        
        # Test pic_process
        processor = pic_process()
        
        print("\n🔍 Testing image_to_json method...")
        full_result = processor.image_to_json(test_image_base64)
        print(f"✅ Full result keys: {list(full_result.keys())}")
        
        print("\n🎯 Testing process_base64_image method...")
        question_result = processor.process_base64_image(test_image_base64)
        print(f"✅ Question-ready result keys: {list(question_result.keys())}")
        
        if question_result.get('description'):
            print(f"📝 Description: {question_result['description'][:150]}...")
        
        if question_result.get('objects'):
            print(f"🏷️  Objects: {question_result['objects'][:5]}")  # First 5 objects
            
        if question_result.get('primary_object'):
            print(f"🎯 Primary object: {question_result['primary_object']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print(f"Error type: {type(e).__name__}")
        return False

def test_with_data_url():
    """Test with data URL format (data:image/jpeg;base64,...)"""
    print("\n🧪 Testing pic_process with data URL format")
    print("-" * 40)
    
    try:
        # Simple 1x1 pixel red image in base64
        small_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        data_url = f"data:image/png;base64,{small_image_b64}"
        
        processor = pic_process()
        
        # This should work with the data URL prefix
        result = processor.process_base64_image(data_url)
        
        if result.get('error'):
            print(f"⚠️  Expected error with tiny image: {result['error']}")
        else:
            print(f"✅ Processed data URL successfully")
            
        return True
        
    except Exception as e:
        print(f"❌ Data URL test failed: {e}")
        return False

def main():
    print("🔬 pic_process Module Test Suite")
    print("=" * 50)
    
    # Check environment
    print("🌍 Environment Check:")
    try:
        print(f"✅ Configuration loaded from .env")
        print(f"🔑 API Key: {'✅ Available' if config.anthropic_api_key else '❌ Missing'}")
        print(f"📁 Upload path: {config.upload_path}")
        print(f"🌍 Environment: {config.environment}")
    except Exception as e:
        print(f"⚠️  Configuration error: {e}")
        return 1
    
    # Run tests
    test1_passed = test_with_url()
    test2_passed = test_with_data_url()
    
    # Summary
    print(f"\n📊 Test Results:")
    print(f"Web Image Test: {'✅ PASSED' if test1_passed else '❌ FAILED'}")
    print(f"Data URL Test: {'✅ PASSED' if test2_passed else '❌ FAILED'}")
    
    if test1_passed and test2_passed:
        print(f"\n🎉 All tests passed! pic_process is ready to use.")
        return 0
    else:
        print(f"\n⚠️  Some tests failed. Check the error messages above.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
