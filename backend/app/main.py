import asyncio
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from .database import get_db, engine, Base
from .agent import app_agent
from .models import HCPInteraction
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from datetime import datetime

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class SaveInteractionRequest(BaseModel):
    hcpName: Optional[str] = ""
    interactionType: Optional[str] = "Meeting"
    date: Optional[str] = ""
    time: Optional[str] = ""
    attendees: Optional[str] = ""
    topics: Optional[str] = ""
    materialsShared: Optional[str] = ""
    samplesDistributed: Optional[str] = ""
    sentiment: Optional[str] = "Neutral"
    outcomes: Optional[str] = ""
    followUpActions: Optional[str] = ""

@app.get("/")
def read_root():
    return {"status": "AI CRM Backend is running!"}

@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    try:
        inputs = {"messages": [HumanMessage(content=request.message)]}

        result = await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(
                None, lambda: app_agent.invoke(inputs)
            ),
            timeout=60.0
        )

        final_content = ""
        for msg in reversed(result["messages"]):
            if isinstance(msg, AIMessage) and msg.content and msg.content.strip():
                final_content = msg.content
                break

        if not final_content:
            for msg in reversed(result["messages"]):
                if isinstance(msg, ToolMessage) and msg.content:
                    final_content = msg.content
                    break

        extracted_data = {}
        for msg in reversed(result["messages"]):
            if isinstance(msg, AIMessage) and msg.tool_calls:
                last_call = msg.tool_calls[-1]
                extracted_data = last_call['args']
                break

        return {
            "response": final_content or "Done.",
            "extracted_data": extracted_data,
            "status": "success"
        }

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="AI took too long. Please try again.")
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-interaction")
def save_interaction(data: SaveInteractionRequest, db: Session = Depends(get_db)):
    try:
        parsed_date = None
        if data.date:
            for fmt in ['%m/%d/%Y', '%Y-%m-%d']:
                try:
                    parsed_date = datetime.strptime(data.date, fmt).date()
                    break
                except ValueError:
                    continue

        entry = HCPInteraction(
            hcp_name=data.hcpName or "",
            interaction_date=parsed_date,
            interaction_time=data.time or None,
            interaction_type=data.interactionType or "Meeting",
            attendees=data.attendees or None,
            topics_discussed=data.topics or "",
            materials_shared=data.materialsShared or None,
            samples_distributed=data.samplesDistributed or None,
            sentiment=data.sentiment or "Neutral",
            outcomes=data.outcomes or None,
            follow_up_actions=data.followUpActions or None,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return {"status": "saved", "id": entry.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    return {"status": "Database connected!"}