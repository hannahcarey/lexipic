# { "description" : "This is a photo of a college event. In the center is a booth to welcome students.",
#   "box": "apple",
#   "confidence: 0.28
#   }

example_data = {}
from anthropic import Anthropic
import os, sys

api_key = os.environ.get("ANTHROPIC_API_KEY")
client = Anthropic(api_key = api_key)

if (api_key == None):
    sys.exit("No value set for ANTHROPIC_API_KEY in os.environ.")

scene_desc = "A colorful sunset behind an old church. A golden retriever sits on the steps."
language = "Japanese"
lvl = "A2"

prompt = f"""You are a language tutor helping learners practice {language}. Generate 3 comprehension or discussion questions based on the following scene description:\n
    {scene_desc} \n
    The learner's {language} level is {lvl}. Adjust grammar and vocabulary accordingly. \n
    Requirements: \n
    Make the questions relevant to the scene.\n
    Keep grammar appropriate to the level.\n
    Output in this JSON format: \n
    {{ 'level': '{lvl}', 'questions':[{{'question':'First question here'}}, {{'question':'Second question here'}},{{'question':'Third question here'}}]}}"""

message = client.messages.create(
    model = "claude-sonnet-4-20250514",
    max_tokens = 128,
    messages=[
        {"role" : "user", "content" : prompt }
    ],
    service_tier="standard_only"
)

print(message.content[0].text)


