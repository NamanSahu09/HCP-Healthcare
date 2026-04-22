from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .database import get_db, engine, Base
from .agent import app_agent
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow React (Frontend) to talk to FastAPI (Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"status": "AI CRM Backend is running!"}

@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    try:
        # 1. Prepare the input for LangGraph
        inputs = {"messages": [HumanMessage(content=request.message)]}
        
        # 2. Run the LangGraph Agent
        result = app_agent.invoke(inputs)
        
        # 3. Get the final AI response message
        final_msg = result["messages"][-1]
        final_content = final_msg.content if hasattr(final_msg, 'content') else str(final_msg)
        
        # 4. EXCLUSIVE AI CONTROL: Extract Tool Arguments
        # We look through the message history for the latest tool call
        extracted_data = {}
        for msg in reversed(result["messages"]):
            if isinstance(msg, AIMessage) and msg.tool_calls:
                # Get the arguments from the most recent tool call
                last_call = msg.tool_calls[-1]
                extracted_data = last_call['args']
                break

        return {
            "response": final_content, 
            "extracted_data": extracted_data,
            "status": "success"
        }
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    return {"status": "Database connected!"}
