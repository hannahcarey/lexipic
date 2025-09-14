from anthropic import Anthropic
import os, sys,json

valid_levels = {"A1", "A2", "B1", "B2", "C1", "C2"}
valid_languages = ["Spanish", "Chinese", "Japanese"]

def validate_data(img_data, user_data):
    if (user_data['level'] not in valid_levels):
        raise ValueError("Invalid user level recieved.")
    if (user_data['language'] not in valid_languages):
        raise ValueError("Unsupported language recieved.")
    if (img_data['description'] == ""):
        raise ValueError("Bad data from vision model")
    return (True, True)

def get_key():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if (api_key == None):
        sys.exit("No value set for ANTHROPIC_API_KEY in os.environ.")
    return api_key

# Wrap these in a try-catch block and catch value errors for bad data
def get_whatisthis(img_data, user_data):

    out = validate_data(img_data, user_data)

    match user_data['language']:
        case "Spanish":
            return {"question":"¿Qué es esto?"}
        case "Chinese":
            return {"question":"这是什么？"}
        case "Japanese":
            return {"question":"これは何ですか？"}

# recieves scene data from the vision output, and returns 3 questions.
def get_questions(img_data, user_data):

    validate_data(img_data, user_data)
    client = Anthropic(api_key=get_key())

    scene_desc = img_data['description']
    language = user_data['language']
    level = user_data['level']

    prompt = f"""Generate 3 comprehension or discussion questions based on the following scene description:\n
        {scene_desc} \n
        The learner's {language} level is {level}. Adjust grammar and vocabulary accordingly. Do not use any language other than {language}. \n
        Requirements: \n
        Make the questions relevant to the scene.\n
        Keep grammar appropriate to the level.\n
        Output in this JSON format: \n
        {{ 'level': '{level}', 'questions':['First question here', 'Second question here','Third question here']}}"""

    message = client.messages.create(
        model = "claude-sonnet-4-20250514",
        max_tokens = 1024,
        system = "You are a language tutor helping learners practice {language}.",
        messages=[
            {"role" : "user", "content" : prompt }
        ],
        service_tier="standard_only"
    )

    return json.loads(message.content[0].text)

def get_feedback(img_data, user_data, question, answer):
    validate_data(img_data, user_data)
    client = Anthropic(api_key=get_key())
    
    scene_desc = img_data['description']
    language = user_data['language']
    level = user_data['level']

    prompt1 = f"""The description of the image is {scene_desc}"""
    prompt2 = f"""Considering the answer given to your question, give this {language} student concise feedback in English.\n
        The learner's {language} level is {level}. You need to take this into account while evaluating them, but do not mention their level in the feedback. \n
        Requirements: \n
        Give helpful feedback.\n
        Consider if it is a good response to your question.\n
        Grade the student out of 100 points.
        Output in this JSON format: \n
        {{ 'question' : {question}, 'answer': {answer}, 'points': <integer between 0 and 100>, 'feedback' : <feedback> }}
    """

    message = client.messages.create(
        model = "claude-sonnet-4-20250514",
        max_tokens = 1024,
        system = "You are a language tutor helping learners practice {language}",
        messages =[
            {"role" : "user", "content" : prompt1}, {"role" : "assistant", "content": question}, {"role" : "user", "content" : answer}, {"role" : "user", "content" : prompt2}
        ],
        service_tier="standard_only"
    )

    return json.loads(message.content[0].text)
