"""
Configuration management for pic_process module.
Handles loading environment variables from .env file and system environment.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

class Config:
    """Configuration manager that loads from .env file and environment variables."""
    
    def __init__(self):
        self._load_environment()
        self._validate_config()
    
    def _load_environment(self):
        """Load environment variables from .env file if it exists."""
        # Look for .env file in current directory, parent directory, or pic_process directory
        possible_env_paths = [
            Path.cwd() / '.env',
            Path(__file__).parent / '.env',
            Path(__file__).parent.parent / '.env',  # Check parent directory
        ]
        
        env_loaded = False
        for env_path in possible_env_paths:
            if env_path.exists():
                print(f"Loading environment from: {env_path}", file=sys.stderr)
                load_dotenv(env_path)
                env_loaded = True
                break
        
        if not env_loaded:
            print("No .env file found, using system environment variables", file=sys.stderr)
    
    def _validate_config(self):
        """Validate that required configuration is present."""
        if not self.anthropic_api_key:
            raise EnvironmentError(
                "ANTHROPIC_API_KEY is required but not found in environment variables or .env file. "
                "Please set ANTHROPIC_API_KEY in your .env file or system environment."
            )
    
    @property
    def anthropic_api_key(self) -> str:
        """Get Anthropic API key from environment."""
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        return api_key.strip()  # Strip whitespace and newlines
    
    @property
    def upload_path(self) -> str:
        """Get upload path for processed images."""
        path = os.environ.get("UPLOAD_PATH", "./uploads")
        return path.strip()
    
    @property
    def environment(self) -> str:
        """Get environment type (development/production)."""
        env = os.environ.get("ENVIRONMENT", "development")
        return env.strip()
    
    def get_anthropic_client(self):
        """Get configured Anthropic client."""
        from anthropic import Anthropic
        return Anthropic(api_key=self.anthropic_api_key)

# Global configuration instance
config = Config()

def get_anthropic_key():
    """
    Get Anthropic API key with proper error handling.
    
    Returns:
        str: The API key
        
    Raises:
        SystemExit: If API key is not available
    """
    try:
        return config.anthropic_api_key
    except EnvironmentError as e:
        print(f"Configuration Error: {e}", file=sys.stderr)
        sys.exit(1)

def get_anthropic_client():
    """
    Get configured Anthropic client instance.
    
    Returns:
        Anthropic: Configured client
    """
    return config.get_anthropic_client()
