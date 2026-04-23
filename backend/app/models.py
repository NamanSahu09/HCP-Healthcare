from sqlalchemy import Column, Integer, String, Date, Time, Text
from .database import Base

class HCPInteraction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_name = Column(String, nullable=False)
    interaction_date = Column(Date)
    interaction_time = Column(String, nullable=True)
    interaction_type = Column(String)
    attendees = Column(String)
    topics_discussed = Column(Text)
    materials_shared = Column(Text)
    samples_distributed = Column(Text)
    sentiment = Column(String)
    outcomes = Column(Text)
    follow_up_actions = Column(Text)
    follow_up_date = Column(Date, nullable=True)