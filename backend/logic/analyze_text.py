"""
It checks a string for specific keywords to determine a risk level.
"""
def analyze_text(text: str):
    text_lower = text.lower()
    THREAT_WORDS = {
        "kill you": 4.0,"kill me": 4.0, "i'll kill you": 4.0, "going to die": 3.5, "hurt you": 3.0,"hurt me": 3.0,
        "hit you": 3.0, "beat you": 3.0,"hit me": 3.0, "beat me": 3.0, "assault": 3.0, "rape": 4.0, "punch": 2.5, "donner you": 3.0
    }

    INSULT_WORDS = {
        "stupid": 1.5, "useless": 2.0, "worthless": 2.5, "idiot": 1.5, "bitch": 2.0,
        "slut": 2.5, "whore": 2.5, "ugly": 1.5, "fat": 1.5, "disgusting": 2.0,
        "pathetic": 2.0, "dumb": 1.5, "crazy": 1.5, "psycho": 2.0, "domkop": 2.0, "poes": 3.5
    }

    FEAR_WORDS = {
        "scared": 2.0, "afraid": 2.0, "terrified": 3.0, "nervous": 1.0, "help me": 3.5,
        "trapped": 3.0, "danger": 2.5, "he follows me": 3.0, "follows me": 3.0,"i'm hiding": 2.5,
        "don't leave me": 2.0
    }

    CONTROL_WORDS = {
        "where are you": 1.5, "who are you with": 1.5, "send pic": 1.0, "you can't go": 2.5,
        "don't wear that": 2.0, "you're not allowed": 2.5, "answer me": 1.5,
        "i own you": 3.0, "you belong to me": 3.0, "stay home": 1.5
    }

    GASLIGHTING_WORDS = {
        "you're overreacting": 1.5, "it's your fault": 2.0, "you made me do it": 2.5,
        "that never happened": 1.5, "you're imagining things": 1.5,
        "stop being so sensitive": 1.5, "it was just a joke": 1.0
    }

    risk_score = 0
    words_found = []
    
    all_categories = [
        THREAT_WORDS, INSULT_WORDS, FEAR_WORDS, CONTROL_WORDS, GASLIGHTING_WORDS
    ]

    for category in all_categories:
        for word, score in category.items():
            if word in text_lower:
                risk_score += score
                words_found.append(f"{word} (score: {score})")
    

    if risk_score >= 6.0:
        label = "High Risk"
    elif risk_score >= 4.0:
        label = "Warning"
    else:
        label = "Safe"
        
    return {
        "label": label,
        "score": round(risk_score, 1),
        "keywords_detected": words_found if words_found else "None"
    }