from langchain_core.tools import tool
from sqlalchemy.orm import Session
from .models import HCPInteraction
from .database import SessionLocal
from datetime import datetime, timedelta

@tool
def log_interaction(
    doctor_name: str,
    date: str,
    interaction_type: str,
    notes: str,
    sentiment: str,
    time: str = "None",
    attendees: str = "None",
    materials: str = "None",
    samples: str = "None",
    outcomes: str = "None",
    follow_ups: str = "None"
):
    """
    Logs a new Healthcare Professional (HCP) interaction into the database.
    Use this tool when the user wants to save, record, or log a meeting or call.

    Args:
        doctor_name: The full name of the doctor.
        date: Date of interaction in YYYY-MM-DD format.
        time: Time of interaction in HH:MM AM/PM format. Extract from user message if mentioned.
        interaction_type: Type of contact (e.g., 'Meeting', 'Call', 'Email').
        notes: SHORT summary of discussion points only (not the full message).
        sentiment: The overall mood (Positive, Negative, or Neutral).
        attendees: Names of other people present.
        materials: Brochures or slides shared.
        samples: Pharmaceutical samples distributed.
        outcomes: Key results or agreements from the meeting.
        follow_ups: Planned next steps or actions.
    """
    db = SessionLocal()
    try:
        try:
            parsed_date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            parsed_date = datetime.now().date()

        new_entry = HCPInteraction(
            hcp_name=doctor_name,
            interaction_date=parsed_date,
            interaction_time=time if time != "None" else None,
            interaction_type=interaction_type,
            topics_discussed=notes,
            sentiment=sentiment,
            attendees=attendees if attendees != "None" else None,
            materials_shared=materials if materials != "None" else None,
            samples_distributed=samples if samples != "None" else None,
            outcomes=outcomes if outcomes != "None" else None,
            follow_up_actions=follow_ups if follow_ups != "None" else None,
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        return f"Successfully logged interaction with {doctor_name}."
    except Exception as e:
        return f"Error logging interaction: {str(e)}"
    finally:
        db.close()


@tool
def edit_interaction(interaction_id: int, field_name: str, new_value: str):
    """
    Updates a specific field of an existing interaction record in the database.
    Use this tool when the user wants to correct a mistake or update information.

    Args:
        interaction_id: The unique ID of the record to be updated.
        field_name: The specific column to change (e.g., 'hcp_name', 'sentiment').
        new_value: The new content to be saved in that field.
    """
    db = SessionLocal()
    try:
        interaction = db.query(HCPInteraction).filter(HCPInteraction.id == interaction_id).first()
        if not interaction:
            return "Interaction record not found. Please provide a valid ID."
        setattr(interaction, field_name, new_value)
        db.commit()
        return f"Field {field_name} updated successfully for interaction ID {interaction_id}."
    except Exception as e:
        return f"Error updating record: {str(e)}"
    finally:
        db.close()


@tool
def suggest_followup(notes: str):
    """
    Suggests an ideal follow-up date based on interaction notes.
    Use when user asks 'when should I follow up', 'suggest a follow-up', or 'when should I meet again'.

    Args:
        notes: The discussion points from the interaction.
    """
    suggested_date = datetime.now() + timedelta(days=7)
    return f"Based on the discussion, I suggest a follow-up meeting on {suggested_date.date()}."


@tool
def generate_summary_report():
    """
    Fetches and summarizes all HCP interactions from the database.
    Use when user asks for a 'summary', 'report', or 'list of interactions'.
    """
    db = SessionLocal()
    try:
        interactions = db.query(HCPInteraction).all()
        if not interactions:
            return "No interactions found in the database to summarize."
        report = "Weekly Interaction Summary:\n"
        for i in interactions:
            notes_preview = (i.topics_discussed or '')[:50]
            report += f"- {i.hcp_name}: {notes_preview}... (Sentiment: {i.sentiment})\n"
        return report
    except Exception as e:
        return f"Error generating report: {str(e)}"
    finally:
        db.close()


@tool
def analyze_sentiment(text: str):
    """
    Analyzes the tone of a given text: Positive, Negative, or Neutral.
    Use when user provides a quote and asks for sentiment or tone analysis.

    Args:
        text: The text string to be analyzed.
    """
    text_low = text.lower()
    if any(w in text_low for w in ['great', 'positive', 'happy', 'agree', 'excellent', 'enthusiastic', 'interested', 'good']):
        return "Positive"
    elif any(w in text_low for w in ['bad', 'negative', 'concerned', 'disappointed', 'poor', 'unhappy', 'worried', 'dissatisfied']):
        return "Negative"
    return "Neutral"