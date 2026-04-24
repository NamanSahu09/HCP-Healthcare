#!/bin/bash

echo "Starting Setup for AI-First CRM HCP Module..."

# ==========================================
# 1. Backend Setup (Python)
# ==========================================
echo "🐍 Setting up the Python Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created."
fi

# Activate venv and install requirements
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create .env from template if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env file for backend. Please add your API keys."
fi

# Go back to root
cd ..
echo "Backend Setup Complete!"

# ==========================================
# 2. Frontend Setup (React/Node)
# ==========================================
echo "⚛️ Setting up the React Frontend..."
cd frontend

# Install npm packages
npm install

# Go back to root
cd ..
echo "✅ Frontend Setup Complete!"

echo "All dependencies installed successfully!"
echo "To run the backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "To run the frontend: cd frontend && npm start"