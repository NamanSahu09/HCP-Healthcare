from sqlalchemy.orm import Session
from .models import HCPInteraction
from .database import SessionLocal
from datetime import datetime, timedelta

# --- TOOL 1: Log Interaction (Now handles sentiment too!) ---
def log_interaction(doctor_name: str, date: str, interaction_type: str, notes: str, sentiment: str):
    """Logs a new HCP interaction including sentiment. 
    Args:
        doctor_name: Name of the doctor
        date: Date of meeting (YYYY-MM-DD)
        interaction_type: Type of meeting (e.g. 'Meeting', 'Call')
        notes: What was discussed
        sentiment: The mood of the interaction (Positive, Negative, or Neutral)
    """
    db = SessionLocal()
    try:
        try:
            parsed_date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            return f"ERROR: Date '{date}' is invalid. Please use YYYY-MM-DD."

        new_entry = HCPInteraction(
            hcp_name=doctor_name,
            interaction_date=parsed_date,
            interaction_type=interaction_type,
            topics_discussed=notes,
            sentiment=sentiment # Now saving sentiment directly
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        return f"Successfully logged interaction with {doctor_name} (Sentiment: {sentiment})."
    except Exception as e:
        return f"Error logging interaction: {str(e)}"
    finally:
        db.close()

# --- TOOL 2: Edit Interaction ---
def edit_interaction(interaction_id: int, field_name: str, new_value: str):
    """Updates an existing interaction record."""
    db = SessionLocal()
    try:
        interaction = db.query(HCPInteraction).filter(HCPInteraction.id == interaction_id).first()
        if not interaction: return "Interaction not found."
        setattr(interaction, field_name, new_value)
        db.commit()
        return f"Interaction ID {interaction_id} updated successfully."
    except Exception as e:
        return f"Error updating record: {str(e)}"
    finally:
        db.close()

# --- TOOL 3: Suggest Follow-up ---
def suggest_followup(notes: str):
    """Suggests a follow-up date based on notes."""
    suggested_date = datetime.now() + timedelta(days=7)
    return f"I suggest a follow-up meeting on {suggested_date.date()}."

# --- TOOL 4: Generate Summary Report ---
def generate_summary_report():
    """Returns a summary of all logged interactions."""
    db = SessionLocal()
    try:
        interactions = db.query(HCPInteraction).all()
        if not interactions: return "No interactions found."
        report = "Summary of Interactions:\n"
        for i in interactions:
            report += f"- {i.hcp_name}: {i.topics_discussed[:50]}... ({i.sentiment})\n"
        return report
    finally:
        db.close()

# --- TOOL 5: Sentiment Analysis Tool (Keep as backup) ---
def analyze_sentiment(text: str):
    """Analyzes the tone of a text string."""
    text_low = text.lower()
    if any(word in text_low for word in ['great', 'positive', 'happy', 'agree']):
        return "Positive"
    elif any(word in text_low for word in ['bad', 'negative', 'concerned', 'disappointed']):
        return "Negative"
    return "Neutral"
