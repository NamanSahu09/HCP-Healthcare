import os
import time
from datetime import datetime
from typing import Annotated, TypedDict
from langchain_groq import ChatGroq
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

def get_llm():
    global current_key_index
    return ChatGroq(
        temperature=0,
        model_name="llama-3.3-70b-versatile", # YAHAN CHANGE KAREIN! Ya fir "gemma2-9b-it"
        groq_api_key=GROQ_KEYS[current_key_index % len(GROQ_KEYS)],
        max_tokens=500, # Tokens thode badha do taaki output na kate
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

    for attempt in range(len(GROQ_KEYS) * 2):
        try:
            llm = get_llm()
            llm_with_tools = llm.bind_tools(tools)
            response = llm_with_tools.invoke(full_messages)
            return {"messages": [response]}
        except Exception as e:
            if 'rate_limit_exceeded' in str(e) or '429' in str(e):
                current_key_index += 1
                print(f"Rate limit hit. Switching to key {current_key_index % len(GROQ_KEYS) + 1}...")
                time.sleep(3)
            else:
                raise e

    raise Exception("All API keys exhausted. Please wait a minute and try again.")

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