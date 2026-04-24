# AI-First CRM HCP Module (Agentic Workflow)

An intelligent, AI-driven Customer Relationship Management (CRM) module designed specifically for Life Sciences and Pharmaceutical Sales Representatives to manage interactions with Healthcare Professionals (HCPs). 

Instead of manual data entry, this application uses a conversational AI Agent (powered by LangGraph and Groq/Gemini) to seamlessly extract, format, and log interaction data into a strict PostgreSQL database while maintaining a read-only, visually synchronized React frontend.

## Key Features

- **Agentic Workflow:** Utilizes LangGraph to intelligently route user prompts to appropriate Python tools instead of relying on linear scripts.
- **Split-Screen UI:** A modern, read-only interaction form on the left that auto-updates in real-time based on the AI Sales Copilot chat on the right.
- **Multi-LLM Resilience:** Primary generation handled by `gemma2-9b-it` (via Groq) for lightning-fast entity extraction, with an automatic fallback mechanism to `gemini-1.5-flash` to prevent rate-limit failures.
- **Redux State Management:** Strict unidirectional data flow ensuring the UI perfectly mirrors the AI's extracted data payload.

## 🛠️ Technology Stack

**Frontend:**
- React.js
- Redux Toolkit (State Management)
- Tailwind CSS & inline styling for modern UI
- Axios & Lucide-React Icons

**Backend:**
- Python 3.10+
- FastAPI (REST API)
- SQLAlchemy (ORM for PostgreSQL)
- LangGraph & LangChain (Agentic Framework)
- LLMs: ChatGroq (`gemma2-9b-it`), Google GenAI (`gemini-1.5-flash`)

## 🧠 Role of the LangGraph Agent

The LangGraph agent acts as the central orchestrator for the CRM. Instead of basic text generation, it operates as a state-machine that processes the Medical Representative's natural language input, understands the intent, maintains conversational memory, and decides *which* specific database tool to trigger. It bridges the gap between unstructured conversational data and a highly structured SQL relational database.

### The 5 LangGraph Tools Implemented:

1. **`log_interaction` (Mandatory):** Parses raw conversational inputs to extract core entities (HCP Name, Date, Time, Topics, Sentiment, Materials). It validates this data and executes the SQL `INSERT` to create a new CRM record, returning a structured JSON to instantly update the React Redux state.
2. **`edit_interaction` (Mandatory):** Accepts contextual updates (e.g., *"Actually, change the sentiment to neutral"*). It targets specific columns in the SQL database for an `UPDATE` without overwriting existing accurate data in other fields.
3. **`suggest_followup`:** Analyzes the interaction notes to intelligently calculate and suggest an optimal follow-up date and strategy for the next HCP visit.
4. **`analyze_sentiment`:** Acts as an evaluator that reads direct quotes from the doctor to classify their reaction as Positive, Negative, or Neutral, aiding in compliance and sales strategy.
5. **`generate_summary_report`:** Connects to the PostgreSQL database to retrieve, compile, and summarize all past logged interactions into a concise weekly report for the regional manager.

## ⚙️ Setup & Installation

### The 1-Click Setup (Recommended)
To easily install all dependencies for both the frontend and backend, run the setup script from the root directory:

**For Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- PostgreSQL Database running locally or via cloud.

### 1. Backend Setup
Navigate to the backend directory:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
Create a .env file in the backend root directory:

Code snippet
DATABASE_URL=postgresql://user:password@localhost:5432/hcp_db
GROQ_API_KEY_1=your_groq_api_key_1
GROQ_API_KEY_2=your_groq_api_key_2
GEMINI_API_KEY=your_gemini_api_key
Run the FastAPI server:

Bash
uvicorn app.main:app --reload --port 8000
2. Frontend Setup
Navigate to the frontend directory:

Bash
cd frontend
npm install
npm start
The application will be available at http://localhost:3000.

📂 Project Structure
Plaintext
ai-crm-hcp/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI endpoints
│   │   ├── agent.py         # LangGraph workflow & Fallback logic
│   │   ├── tools.py         # The 5 custom DB tools
│   │   ├── database.py      # PostgreSQL connection
│   │   ├── models.py        # SQLAlchemy Schema
│   │   └── schemas.py       # Pydantic validation
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Chat.js              # AI Copilot UI & Mock API logic
    │   │   └── InteractionForm.js   # Read-only Redux form
    │   ├── store/
    │   │   ├── store.js
    │   │   ├── chatSlice.js
    │   │   └── interactionSlice.js
    │   ├── App.js
    │   └── index.js
    └── package.json
