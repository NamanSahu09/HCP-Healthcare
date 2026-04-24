import os
import time
from datetime import datetime
from typing import Annotated, TypedDict
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from .tools import log_interaction, edit_interaction, suggest_followup, generate_summary_report, analyze_sentiment
from dotenv import load_dotenv

current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(os.path.dirname(current_dir), '.env')
load_dotenv(dotenv_path=env_path)

# Load all available keys
GROQ_KEYS = [
    os.getenv("GROQ_API_KEY_1"),
    os.getenv("GROQ_API_KEY_2"),
    os.getenv("GROQ_API_KEY_3"),
]
GROQ_KEYS = [k for k in GROQ_KEYS if k]  # remove None values
current_key_index = 0

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_llm():
    global current_key_index
    return ChatGroq(
        temperature=0,
        model_name="llama-3.3-70b-versatile", # You can also use "gemma2-9b-it"
        groq_api_key=GROQ_KEYS[current_key_index % len(GROQ_KEYS)],
        max_tokens=500,
    )

tools = [log_interaction, edit_interaction, suggest_followup, generate_summary_report, analyze_sentiment]

class AgentState(TypedDict):
    messages: Annotated[list, "The messages in the conversation"]

def call_model(state: AgentState):
    global current_key_index
    messages = state['messages']
    today_date = datetime.now().strftime('%Y-%m-%d')
    current_time = datetime.now().strftime('%I:%M %p')
    system_message = {
        "role": "system",
        "content": (
            f"You are a Healthcare CRM Assistant. Today: {today_date}, Time: {current_time}. "
            "Extract: doctor name, date (YYYY-MM-DD), time (HH:MM AM/PM), "
            "type (Meeting/Call/Email), notes (short summary only), sentiment, "
            "attendees, materials, samples, outcomes, follow_ups. "
            "Call the matching tool. Use 'None' for missing fields. "
            "Reply briefly after tool runs."
        )
    }
    full_messages = [system_message] + messages

    # Attempt 1: Try with Groq Keys
    # We use max(1, len) so the loop runs at least once even if GROQ_KEYS is empty
    for attempt in range(max(1, len(GROQ_KEYS) * 2)):
        try:
            if not GROQ_KEYS:
                raise Exception("No Groq keys found.")
            llm = get_llm()
            llm_with_tools = llm.bind_tools(tools)
            response = llm_with_tools.invoke(full_messages)
            return {"messages": [response]}
        except Exception as e:
            if 'rate_limit_exceeded' in str(e).lower() or '429' in str(e):
                if GROQ_KEYS:
                    current_key_index += 1
                    print(f"Groq Rate limit hit. Switching to key {current_key_index % len(GROQ_KEYS) + 1}...")
                    time.sleep(2)
            else:
                print(f"Groq encountered an error: {str(e)}")
                break # If it's not a rate limit (e.g., auth error), break and go to Gemini

    # Attempt 2: Fallback to Gemini if Groq fails
    # Attempt 2: Fallback to Gemini if Groq fails
    # Attempt 2: Fallback to Gemini if Groq fails
    if GEMINI_API_KEY:
        print("All Groq keys exhausted or failed. Falling back to Gemini 1.5 Flash...")
        try:
            gemini_llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash", 
                temperature=0,
                google_api_key=GEMINI_API_KEY,
                max_retries=3
            )
            gemini_with_tools = gemini_llm.bind_tools(tools)
            response = gemini_with_tools.invoke(full_messages)
            return {"messages": [response]}
        except Exception as e:
            raise Exception(f"Groq failed AND Gemini Fallback also failed: {str(e)}")


workflow = StateGraph(AgentState)
workflow.add_node("agent", call_model)
workflow.add_node("tools", ToolNode(tools))
workflow.set_entry_point("agent")

def should_continue(state: AgentState):
    last_message = state['messages'][-1]
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    return END

workflow.add_conditional_edges("agent", should_continue)
workflow.add_edge("tools", "agent")

app_agent = workflow.compile()