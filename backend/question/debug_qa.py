#!/usr/bin/env python3
"""
Debug script to see what's happening with the Q&A generation.
"""

import sys
import json
import traceback

from utils import generate_complete_qa_set, process_image_to_qa

def debug_qa_generation():
    """Debug the Q&A generation function."""
    
    print("🔍 Debugging Q&A Generation")
    print("=" * 40)
    
    # Simple test data
    img_data = {
        "description": "A family is sitting around a campfire. They are roasting marshmallows."
    }
    
    user_data = {
        "language": "Spanish",
        "level": "A2"
    }
    
    print(f"Input data:")
    print(f"  Image: {img_data}")
    print(f"  User: {user_data}")
    
    try:
        print(f"\n🧪 Calling generate_complete_qa_set()...")
        result = generate_complete_qa_set(img_data, user_data)
        
        print(f"✅ Function completed")
        print(f"📄 Result type: {type(result)}")
        print(f"📄 Result keys: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")
        
        if isinstance(result, dict):
            if result.get("error"):
                print(f"❌ Error in result: {result.get('message', 'No message')}")
            else:
                print(f"✅ Success!")
                print(f"   Language: {result.get('language')}")
                print(f"   Level: {result.get('level')}")
                print(f"   Q&A sets: {len(result.get('qa_sets', []))}")
                
                # Show first question if available
                qa_sets = result.get('qa_sets', [])
                if qa_sets:
                    first_qa = qa_sets[0]
                    print(f"   First question: {first_qa.get('question', 'N/A')}")
                    print(f"   First answer: {first_qa.get('expected_answer', 'N/A')}")
        else:
            print(f"❌ Result is not a dictionary: {result}")
        
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        print(f"📄 Exception type: {type(e)}")
        traceback.print_exc()

def debug_simple_anthropic_call():
    """Test if Anthropic API is working at all."""
    
    print(f"\n🤖 Testing basic Anthropic API call")
    print("-" * 40)
    
    try:
        # Import config
        sys.path.append('../pic_process')
        from config import get_anthropic_client
        
        client = get_anthropic_client()
        print(f"✅ Got Anthropic client")
        
        # Simple test message
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=100,
            messages=[
                {"role": "user", "content": "Say hello in Spanish"}
            ],
            service_tier="standard_only"
        )
        
        response_text = message.content[0].text
        print(f"✅ API call successful")
        print(f"📝 Response: {response_text}")
        
    except Exception as e:
        print(f"❌ API call failed: {e}")
        traceback.print_exc()

def main():
    """Run debug tests."""
    
    print("🔧 Q&A Generation Debug Session")
    print("=" * 50)
    
    # Test 1: Basic API functionality
    debug_simple_anthropic_call()
    
    # Test 2: Q&A generation
    debug_qa_generation()

if __name__ == "__main__":
    main()
