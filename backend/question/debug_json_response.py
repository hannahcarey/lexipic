#!/usr/bin/env python3
"""
Debug script to see what the actual Anthropic response looks like.
"""

import sys
import json
import traceback

# Import config
sys.path.append('../pic_process')
from config import get_anthropic_client

def debug_anthropic_json_response():
    """Debug the exact response from Anthropic to see why JSON parsing fails."""
    
    print("🔍 Debugging Anthropic JSON Response")
    print("=" * 50)
    
    try:
        client = get_anthropic_client()
        
        # Use the exact same prompt as in generate_complete_qa_set
        scene_desc = "A family is sitting around a campfire. They are roasting marshmallows."
        language = "Spanish"
        level = "A2"
        
        prompt = f"""Based on the following image description, create 3 complete question-answer sets for a {language} learner at {level} level:

Scene: {scene_desc}

Generate exactly 3 questions with their expected answers. Each question should:
1. Be relevant to the scene described
2. Use appropriate grammar and vocabulary for {level} level
3. Have a clear, specific expected answer
4. Be answerable based on the scene description

Output in this exact JSON format:
{{
  "level": "{level}",
  "language": "{language}",
  "qa_sets": [
    {{
      "question": "First question in {language}",
      "expected_answer": "Expected answer in {language}",
      "question_type": "comprehension|vocabulary|grammar|cultural",
      "difficulty": 1-5,
      "points": 0-100
    }},
    {{
      "question": "Second question in {language}",
      "expected_answer": "Expected answer in {language}",
      "question_type": "comprehension|vocabulary|grammar|cultural",
      "difficulty": 1-5,
      "points": 0-100
    }},
    {{
      "question": "Third question in {language}",
      "expected_answer": "Expected answer in {language}",
      "question_type": "comprehension|vocabulary|grammar|cultural",
      "difficulty": 1-5,
      "points": 0-100
    }}
  ]
}}"""

        print(f"📤 Sending prompt to Anthropic...")
        
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            system=f"You are an expert {language} language tutor creating educational content for {level} level students.",
            messages=[
                {"role": "user", "content": prompt}
            ],
            service_tier="standard_only"
        )
        
        raw_response = message.content[0].text
        
        print(f"✅ Got response from Anthropic")
        print(f"📏 Response length: {len(raw_response)} characters")
        print(f"\n📄 Raw response:")
        print("-" * 40)
        print(raw_response)
        print("-" * 40)
        
        # Try to parse as JSON
        print(f"\n🧪 Attempting to parse as JSON...")
        try:
            parsed_json = json.loads(raw_response)
            print(f"✅ JSON parsing successful!")
            print(f"📊 Parsed structure:")
            print(json.dumps(parsed_json, indent=2, ensure_ascii=False))
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing failed: {e}")
            print(f"📍 Error at position {e.pos}")
            if e.pos < len(raw_response):
                start = max(0, e.pos - 20)
                end = min(len(raw_response), e.pos + 20)
                context = raw_response[start:end]
                print(f"📄 Context around error: '{context}'")
            
            # Try to find and fix common issues
            print(f"\n🔧 Attempting to fix common JSON issues...")
            
            # Remove any text before the first {
            first_brace = raw_response.find('{')
            if first_brace > 0:
                print(f"⚠️  Found text before JSON, removing {first_brace} characters")
                cleaned = raw_response[first_brace:]
            else:
                cleaned = raw_response
            
            # Remove any text after the last }
            last_brace = cleaned.rfind('}')
            if last_brace != len(cleaned) - 1 and last_brace > 0:
                print(f"⚠️  Found text after JSON, removing {len(cleaned) - last_brace - 1} characters")
                cleaned = cleaned[:last_brace + 1]
            
            # Try parsing the cleaned version
            if cleaned != raw_response:
                try:
                    print(f"🧪 Trying to parse cleaned version...")
                    print(f"📄 Cleaned response:")
                    print("-" * 20)
                    print(cleaned)
                    print("-" * 20)
                    
                    parsed_json = json.loads(cleaned)
                    print(f"✅ Cleaned JSON parsing successful!")
                    print(f"📊 Parsed structure:")
                    print(json.dumps(parsed_json, indent=2, ensure_ascii=False))
                    
                except json.JSONDecodeError as e2:
                    print(f"❌ Even cleaned version failed: {e2}")
    
    except Exception as e:
        print(f"❌ Error in debug function: {e}")
        traceback.print_exc()

def main():
    """Run the debug."""
    debug_anthropic_json_response()

if __name__ == "__main__":
    main()
