import os
from datetime import datetime
from typing import Annotated, TypedDict
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from .tools import log_interaction, edit_interaction, suggest_followup, generate_summary_report, analyze_sentiment
from .database import SessionLocal
from dotenv import load_dotenv

# --- FAIL-PROOF DOTENV LOADING ---
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(os.path.dirname(current_dir), '.env')
load_dotenv(dotenv_path=env_path)

# 1. Setup LLM (Using the latest stable model)
llm = ChatGroq(
    temperature=0, 
    model_name="llama-3.1-8b-instant", 
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# 2. Define the tools
tools = [log_interaction, edit_interaction, suggest_followup, generate_summary_report, analyze_sentiment]
llm_with_tools = llm.bind_tools(tools)

# 3. Define Graph State
class AgentState(TypedDict):
    messages: Annotated[list, "The messages in the conversation"]

# 4. Logic Nodes
def call_model(state: AgentState):
    messages = state['messages']
    today_date = datetime.now().strftime('%Y-%m-%d')
    
    system_message = {
        "role": "system", 
        "content": (
            f"You are a Healthcare CRM Assistant. Today's date is {today_date}. "
            "CRITICAL RULE: When logging an interaction, use ONLY the 'log_interaction' tool. "
            "Do NOT call other tools like 'analyze_sentiment' at the same time. "
            "Extract the doctor's name, date, type, notes, and sentiment, then call 'log_interaction' once. "
            "Always use YYYY-MM-DD format for dates."
        )
    }
    
    full_messages = [system_message] + messages
    response = llm_with_tools.invoke(full_messages)
    return {"messages": [response]}


# 5. Build the Graph
workflow = StateGraph(AgentState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", ToolNode(tools))

workflow.set_entry_point("agent")

def should_continue(state: AgentState):
    messages = state['messages']
    last_message = messages[-1]
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    return END

workflow.add_conditional_edges("agent", should_continue)
workflow.add_edge("tools", "agent")

# Compile the graph
app_agent = workflow.compile()
