# 🏥 AI-Powered HCP Interaction Logging System

An intelligent CRM solution for Healthcare Professionals (HCP) interaction logging, designed for Pharmaceutical Representatives. This system replaces tedious manual form-filling with an AI-driven chat interface that extracts and logs data automatically using an agentic workflow.

## 🌟 Key Features
- **Exclusive AI Control**: The interaction form is locked (Read-Only). Data can only be populated via the AI Assistant, ensuring data consistency and reducing manual effort.
- **Agentic Workflow**: Built using **LangGraph**, the system doesn't just chat; it decides which tool to call based on user intent.
- **Natural Language Processing**: Extracts HCP names, dates, sentiment, and discussion points from raw chat text.
- **Real-time Sync**: Integration between FastAPI and React via Redux for seamless state updates.

## 🛠️ Tech Stack
- **Frontend**: React.js, Redux Toolkit (State Management), Axios
- **Backend**: FastAPI (Python), Uvicorn
- **AI Orchestration**: LangGraph, LangChain
- **LLM**: Groq (Llama-3.1-8b-instant)
- **Database**: PostgreSQL (SQLAlchemy ORM)

## ⚙️ System Architecture
`User Input` $\rightarrow$ `React Frontend` $\rightarrow$ `FastAPI Backend` $\rightarrow$ `LangGraph Agent` $\rightarrow$ `LLM (Groq)` $\rightarrow$ `Custom Tools` $\rightarrow$ `PostgreSQL`

## 🧰 Implemented AI Tools (LangGraph)
The system utilizes 5 specialized tools to handle CRM operations:
1. **Log Interaction**: Extracts and saves HCP details, date, and notes into the database.
2. **Edit Interaction**: Modifies existing interaction records based on specific field requests.
3. **Suggest Follow-up**: Analyzes interaction notes and suggests the next best meeting date.
4. **Generate Summary Report**: Aggregates weekly interaction data into a concise report.
5. **Sentiment Analysis**: Detects the tone of the HCP (Positive/Negative/Neutral) from the discussion.

## 🚀 Installation & Setup

### 1. Backend Setup
```bash```
cd backend
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables in .env
# DATABASE_URL=postgresql://postgres:password@localhost:5432/hcp_db
# GROQ_API_KEY=your_api_key_here

# Start server
python3 -m uvicorn app.main:app --reload



2. Frontend Setup
cd frontend
npm install
npm start
🧪 How to Test
Open the app at http://localhost:3000.
Notice that the form is locked (Read-only).
In the chat, type: "I met Dr. Smith today, the meeting was great and we discussed product efficiency. Please log this."
Observe the form fields automatically populating via the AI Agent.
📊 Task 2: Quality Management System (QMS)
As part of the Life Science Supply Chain domain, this project considers the QMS flow:

Deviation Management: Detecting quality failures in drug ingredients.
Investigation: QA Officers analyzing the root cause.
CAPA: Implementing Corrective and Preventive Actions to ensure compliance.



