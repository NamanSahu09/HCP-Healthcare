@echo off
echo 🚀 Starting Setup for AI-First CRM HCP Module...

:: ==========================================
:: 1. Backend Setup (Python)
:: ==========================================
echo 🐍 Setting up the Python Backend...
cd backend

:: Create virtual environment if it doesn't exist
IF NOT EXIST "venv\" (
    python -m venv venv
    echo Virtual environment created.
)

:: Activate venv and install requirements
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt

:: Create .env from template if it doesn't exist
IF NOT EXIST ".env" (
    copy .env.example .env
    echo Created .env file for backend. Please add your API keys.
)

cd ..
echo Backend Setup Complete!

:: ==========================================
:: 2. Frontend Setup (React/Node)
:: ==========================================
echo ⚛️ Setting up the React Frontend...
cd frontend
call npm install
cd ..
echo Frontend Setup Complete!

echo All dependencies installed successfully!
echo Check the README on how to start the servers.
pause