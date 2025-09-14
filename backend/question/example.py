from utils import get_questions, get_feedback

def main():
    # Example output from the vision model.
    img_data = { "description" : "A family is sitting around a campfire at a campsite in the mountains. They are roasting marshmallows and wearing jackets. A tent is set up nearby, and the stars are visible in the night sky." }

    # Example user data/configuration.
    user_data = { "language": "Japanese", "level" : "A1" }

    questions_dict = get_questions(img_data, user_data)

    print("Description of the image: " + img_data['description'])
    for question in questions_dict['questions']:
        print(question)
        response = input()
        feedback = get_feedback(img_data, user_data, question, response)
        print(f"Here is Claude's feedback: {feedback['feedback']}")
        print(f"Claude scored your answer {feedback['points']}/100.")


main()
