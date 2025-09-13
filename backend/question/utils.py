from anthropic import Anthropic
import os, sys,json

valid_levels = {"A1", "A2", "B1", "B2", "C1", "C2"}

def validate_data(img_data, user_data):
    if (user_data.level not in valid_levels):
        return (None, "Invalid user level")
    if (img_data.description == ""):
        return (None, "Bad data from vision model")
    return true

def get_key():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if (api_key == None):
        sys.exit("No value set for ANTHROPIC_API_KEY in os.environ.")
    return api_key

# recieves scene data from the vision output, and returns 3 questions.
def get_questions(img_data, user_data):
    out = validate_data(img_data, user_data)
    if (out[0]==None):
        sys.exit(out[1])

    # user_data should be like {"language": "English", "level": "A2"}
    # img_data should have description, some kind of id, and maybe info on bounding boxes

    client = Anthropic(api_key=get_key())

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

#def get_feedback(question, answer):
    
