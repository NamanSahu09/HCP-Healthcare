from pydantic import BaseModel
from datetime import date
from typing import Optional

class InteractionBase(BaseModel):
    hcp_name: str
    interaction_date: date
    interaction_type: str
    attendees: Optional[str] = None
    topics_discussed: str
    sentiment: Optional[str] = None
    follow_up_date: Optional[date] = None

class InteractionCreate(InteractionBase):
    pass

class InteractionResponse(InteractionBase):
    id: int
    class Config:
        from_attributes = True
