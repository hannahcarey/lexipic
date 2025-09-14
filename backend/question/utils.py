from anthropic import Anthropic
import os, sys,json

# Import configuration management from pic_process
sys.path.append('../pic_process')
from config import get_anthropic_key, get_anthropic_client

valid_levels = {"A1", "A2", "B1", "B2", "C1", "C2"}

def validate_data(img_data, user_data):
    if (user_data['level'] not in valid_levels):
        return (None, "Invalid user level")
    if (img_data['description'] == ""):
        return (None, "Bad data from vision model")
    return (True, True)

def get_key():
    """Get Anthropic API key using shared configuration."""
    return get_anthropic_key()


def get_whatisthis(img_data, user_data):
    out = validate_data(img_data, user_data)
    if (out[0]==None):
        sys.exit(out[1])
    match user_data['language']:
        case "Spanish":
            return {"question":"¿Qué es esto?"}
        case "Chinese":
            return {"question":"这是什么？"}
        case "Japanese":
            return {"question":"これは何ですか？"}
    raise ValueError("Unsupported language selected.")

# recieves scene data from the vision output, and returns 3 questions.
def get_questions(img_data, user_data):
    out = validate_data(img_data, user_data)
    if (out[0]==None):
        print("exiting")
        sys.exit(out[1])

    # user_data should be like {"language": "English", "level": "A2"}
    # img_data should have description, some kind of id, and maybe info on bounding boxes
    
    client = get_anthropic_client()

    scene_desc = img_data['description']
    language = user_data['language']
    lvl = user_data['level']

    prompt = f"""Generate 3 comprehension or discussion questions based on the following scene description:\n
        {scene_desc} \n
        The learner's {language} level is {lvl}. Adjust grammar and vocabulary accordingly. Do not use any language other than {language}. \n
        Requirements: \n
        Make the questions relevant to the scene.\n
        Keep grammar appropriate to the level.\n
        Output in this JSON format: \n
        {{ 'level': '{lvl}', 'questions':['First question here', 'Second question here','Third question here']}}"""

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
    client = get_anthropic_client()
    prompt1 = f"""The description of the image is {img_data['description']}"""
    prompt2 = f"""Considering the answer given to your question, give this {user_data['language']} student concise feedback in English.\n
        The learner's {user_data['language']} level is {user_data['level']}. You need to take this into account while evaluating them, but do not mention their level in the feedback. \n
        Requirements: \n
        Give helpful feedback.\n
        Consider if it is a good response to your question.\n
        Grade the student out of 100 points.
        Output in this JSON format: \n
        {{ 'question' : {question}, 'answer': {answer}, 'points': <integer between 0 and 100>, 'feedback' : <descriptive feedback> }}
    """

    message = client.messages.create(
        model = "claude-sonnet-4-20250514",
        max_tokens = 1024,
        system = "You are a language tutor helping learners practice {user_data['language']}",
        messages =[
            {"role" : "user", "content" : prompt1}, {"role" : "assistant", "content": question}, {"role" : "user", "content" : answer}, {"role" : "user", "content" : prompt2}
        ],
        service_tier="standard_only"
    )

    return json.loads(message.content[0].text)

def generate_complete_qa_set(img_data, user_data):
    """
    Generate complete Q&A sets with questions, expected answers, and feedback.
    
    Args:
        img_data (dict): Output from pic_process with 'description' and other scene data
        user_data (dict): User preferences with 'language' and 'level'
        
    Returns:
        dict: Complete Q&A sets with questions, answers, points, and feedback
    """
    out = validate_data(img_data, user_data)
    if (out[0] == None):
        return {"error": True, "message": out[1]}

    client = get_anthropic_client()
    
    scene_desc = img_data['description']
    language = user_data['language']
    level = user_data['level']
    
    # Enhanced prompt to generate complete Q&A sets
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

    try:
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
        
        # Clean the response - remove markdown code blocks if present
        cleaned_response = raw_response.strip()
        if cleaned_response.startswith('```json'):
            # Remove ```json at the start and ``` at the end
            first_brace = cleaned_response.find('{')
            last_brace = cleaned_response.rfind('}')
            if first_brace != -1 and last_brace != -1:
                cleaned_response = cleaned_response[first_brace:last_brace + 1]
        elif cleaned_response.startswith('```'):
            # Remove ``` at the start and ``` at the end
            first_brace = cleaned_response.find('{')
            last_brace = cleaned_response.rfind('}')
            if first_brace != -1 and last_brace != -1:
                cleaned_response = cleaned_response[first_brace:last_brace + 1]
        
        qa_response = json.loads(cleaned_response)
        
        # Add feedback generation for each Q&A pair
        for i, qa_set in enumerate(qa_response['qa_sets']):
            qa_set['id'] = i + 1
            qa_set['feedback_template'] = f"Evaluate the student's answer to: '{qa_set['question']}'"
        
        return qa_response
        
    except Exception as e:
        return {
            "error": True,
            "message": f"Failed to generate Q&A sets: {str(e)}"
        }

def evaluate_student_answers(img_data, user_data, qa_sets, student_answers):
    """
    Evaluate student answers against expected answers and provide detailed feedback.
    
    Args:
        img_data (dict): Original image data
        user_data (dict): User preferences 
        qa_sets (list): Q&A sets from generate_complete_qa_set
        student_answers (list): Student's answers to the questions
        
    Returns:
        dict: Evaluation results with scores and feedback
    """
    client = get_anthropic_client()
    
    scene_desc = img_data['description']
    language = user_data['language']
    level = user_data['level']
    
    evaluations = []
    
    for i, (qa_set, student_answer) in enumerate(zip(qa_sets, student_answers)):
        evaluation_prompt = f"""You are evaluating a {language} language student at {level} level.

Image context: {scene_desc}

Question: {qa_set['question']}
Expected Answer: {qa_set['expected_answer']}
Student Answer: {student_answer}
Question Type: {qa_set.get('question_type', 'comprehension')}
Max Points: {qa_set.get('points', 100)}

Evaluate the student's answer considering:
1. Accuracy compared to expected answer
2. Appropriate language level for {level}
3. Understanding of the image context
4. Grammar and vocabulary usage

Provide constructive feedback in English and assign points.

Output in this exact JSON format:
{{
  "question_id": {i + 1},
  "question": "{qa_set['question']}",
  "expected_answer": "{qa_set['expected_answer']}",
  "student_answer": "{student_answer}",
  "points_earned": 0-{qa_set.get('points', 100)},
  "max_points": {qa_set.get('points', 100)},
  "percentage": 0-100,
  "feedback": "Detailed constructive feedback in English",
  "areas_for_improvement": ["area1", "area2"],
  "strengths": ["strength1", "strength2"]
}}"""

        try:
            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=f"You are an expert {language} language tutor providing detailed feedback to help students improve.",
                messages=[
                    {"role": "user", "content": evaluation_prompt}
                ],
                service_tier="standard_only"
            )
            
            raw_eval_response = message.content[0].text
            
            # Clean the evaluation response - remove markdown code blocks if present
            cleaned_eval_response = raw_eval_response.strip()
            if cleaned_eval_response.startswith('```json'):
                first_brace = cleaned_eval_response.find('{')
                last_brace = cleaned_eval_response.rfind('}')
                if first_brace != -1 and last_brace != -1:
                    cleaned_eval_response = cleaned_eval_response[first_brace:last_brace + 1]
            elif cleaned_eval_response.startswith('```'):
                first_brace = cleaned_eval_response.find('{')
                last_brace = cleaned_eval_response.rfind('}')
                if first_brace != -1 and last_brace != -1:
                    cleaned_eval_response = cleaned_eval_response[first_brace:last_brace + 1]
            
            evaluation = json.loads(cleaned_eval_response)
            evaluations.append(evaluation)
            
        except Exception as e:
            evaluations.append({
                "question_id": i + 1,
                "error": True,
                "message": f"Failed to evaluate answer: {str(e)}"
            })
    
    # Calculate overall results
    total_points = sum([eval.get('points_earned', 0) for eval in evaluations if not eval.get('error')])
    max_total_points = sum([eval.get('max_points', 100) for eval in evaluations if not eval.get('error')])
    overall_percentage = round((total_points / max_total_points * 100) if max_total_points > 0 else 0, 1)
    
    return {
        "evaluations": evaluations,
        "summary": {
            "total_points": total_points,
            "max_points": max_total_points,
            "percentage": overall_percentage,
            "questions_answered": len(evaluations),
            "level": level,
            "language": language
        }
    }

def process_image_to_qa(pic_process_output, language, level):
    """
    Complete workflow: pic_process output → Q&A generation
    
    Args:
        pic_process_output (dict): Direct output from pic_process().process_base64_image()
        language (str): Target language (e.g., "Spanish", "Chinese", "Japanese")
        level (str): Proficiency level (A1, A2, B1, B2, C1, C2)
        
    Returns:
        dict: Ready-to-use Q&A sets for the frontend
    """
    # Prepare data in the format expected by question generation
    img_data = {
        "description": pic_process_output.get("description", ""),
        "primary_object": pic_process_output.get("primary_object", ""),
        "objects": pic_process_output.get("objects", [])
    }
    
    user_data = {
        "language": language,
        "level": level
    }
    
    # Generate complete Q&A sets
    qa_result = generate_complete_qa_set(img_data, user_data)
    
    if qa_result.get("error"):
        return qa_result
    
    # Format for frontend consumption
    return {
        "success": True,
        "image_context": {
            "description": img_data["description"],
            "primary_object": img_data.get("primary_object"),
            "detected_objects": img_data.get("objects", [])
        },
        "learning_context": {
            "language": language,
            "level": level
        },
        "questions": qa_result["qa_sets"],
        "total_questions": len(qa_result["qa_sets"]),
        "instructions": f"Answer these {len(qa_result['qa_sets'])} questions in {language} based on the image you saw."
    }
