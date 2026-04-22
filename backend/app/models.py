from sqlalchemy import Column, Integer, String, Date, Text
from .database import Base

class HCPInteraction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_name = Column(String, nullable=False)
    interaction_date = Column(Date)
    interaction_type = Column(String)  
    attendees = Column(String)
    topics_discussed = Column(Text)
    sentiment = Column(String) 
    follow_up_date = Column(Date, nullable=True)
