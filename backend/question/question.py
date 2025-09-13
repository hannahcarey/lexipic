# { "description" : "This is a photo of a college event. In the center is a booth to welcome students.",
#   "box": "apple",
#   "confidence: 0.28
#   }

example_data = {}

from anthropic import Anthropic
import os

client = Anthropic(
    api_key = os.environ.get("ANTHROPIC_API_KEY")
)

message = client.messages.create(
    model = "claude-sonnet-4-20250514",
    max_tokens = 1024,
    messages=[
      {"role" : "user", "content" : "hi" }
    ],
    service_tier="standard_only"
)

print(message.content)


