#!/usr/bin/env python3
"""
Test script to verify .env file configuration is working correctly.
"""

import sys
import os
from pathlib import Path

def test_env_loading():
    """Test that .env file is loaded correctly."""
    print("🔧 Environment Configuration Test")
    print("=" * 40)
    
    # Test config loading
    try:
        from config import config
        print("✅ Configuration module loaded successfully")
        
        # Test API key
        if config.anthropic_api_key:
            print("✅ ANTHROPIC_API_KEY loaded from .env")
            print(f"   Key length: {len(config.anthropic_api_key)} characters")
            print(f"   Key prefix: {config.anthropic_api_key[:10]}...")
        else:
            print("❌ ANTHROPIC_API_KEY not found")
            return False
        
        # Test other config values
        print(f"📁 Upload path: {config.upload_path}")
        print(f"🌍 Environment: {config.environment}")
        
        # Test client creation
        print("\n🤖 Testing Anthropic client creation...")
        client = config.get_anthropic_client()
        print("✅ Anthropic client created successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

def test_env_file_locations():
    """Test which .env file is being used."""
    print("\n🔍 Environment File Locations")
    print("-" * 40)
    
    # Check possible .env locations
    possible_paths = [
        Path.cwd() / '.env',
        Path(__file__).parent / '.env',
        Path(__file__).parent.parent / '.env',
    ]
    
    for env_path in possible_paths:
        if env_path.exists():
            print(f"✅ Found .env at: {env_path}")
            
            # Show first few lines (without revealing secrets)
            try:
                with open(env_path, 'r') as f:
                    lines = f.readlines()[:5]  # First 5 lines
                print(f"   Content preview (first {len(lines)} lines):")
                for i, line in enumerate(lines, 1):
                    # Hide actual API key values
                    if '=' in line and 'API_KEY' in line:
                        key, value = line.split('=', 1)
                        print(f"   {i}: {key}=***hidden***")
                    else:
                        print(f"   {i}: {line.strip()}")
            except Exception as e:
                print(f"   Could not read file: {e}")
        else:
            print(f"❌ Not found: {env_path}")

def main():
    """Run all configuration tests."""
    print("🧪 pic_process Environment Configuration Test")
    print("=" * 50)
    
    # Test 1: Environment file locations
    test_env_file_locations()
    
    # Test 2: Configuration loading
    config_test_passed = test_env_loading()
    
    # Test 3: Import tests
    print(f"\n📦 Testing module imports...")
    try:
        from config import get_anthropic_key, get_anthropic_client
        print("✅ Config helper functions imported")
        
        # Test the functions
        api_key = get_anthropic_key()
        client = get_anthropic_client()
        print("✅ Helper functions work correctly")
        
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        config_test_passed = False
    
    # Summary
    print(f"\n📊 Test Results:")
    print(f"Configuration Loading: {'✅ PASSED' if config_test_passed else '❌ FAILED'}")
    
    if config_test_passed:
        print(f"\n🎉 Environment configuration is working correctly!")
        print(f"Your pic_process module can now use the .env file for API keys.")
        return 0
    else:
        print(f"\n⚠️  Configuration issues detected. Please check your .env file.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
