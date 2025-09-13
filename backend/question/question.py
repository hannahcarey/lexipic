from anthropic import Anthropic
import os, sys,json

# this module recieves scene data from the vision output, and returns 3 questions.

def get_questions(img_data, user_data):
    # user_data should be like {"language": "English", "level": "A2"}
    # img_data should have description, some kind of id, and maybe info on bounding boxes

    api_key = os.environ.get("ANTHROPIC_API_KEY")

    if (api_key == None):
        sys.exit("No value set for ANTHROPIC_API_KEY in os.environ.")

    client = Anthropic(api_key = api_key)

    scene_desc = img_data.description
    language = user_data.language
    lvl = user_data.level

    prompt = f"""You are a language tutor helping learners practice {language}. Generate 3 comprehension or discussion questions based on the following scene description:\n
        {scene_desc} \n
        The learner's {language} level is {lvl}. Adjust grammar and vocabulary accordingly. \n
        Requirements: \n
        Make the questions relevant to the scene.\n
        Keep grammar appropriate to the level.\n
        Output in this JSON format: \n
        {{ 'level': '{lvl}', 'questions':['First question here', 'Second question here','Third question here']}}"""

    message = client.messages.create(
        model = "claude-sonnet-4-20250514",
        max_tokens = 256,
        messages=[
            {"role" : "user", "content" : prompt }
        ],
        service_tier="standard_only"
    )

    return json.loads(message.content[0].text)


