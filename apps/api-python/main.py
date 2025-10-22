"""
RoleReady Python Backend
Handles AI operations, complex data processing, and heavy computations
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
import jwt
import os
from datetime import datetime, timedelta
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="RoleReady Python API",
    description="AI-powered resume building and job tracking backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET", "dev-jwt-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

security = HTTPBearer()

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class AIRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None
    model: Optional[str] = "gpt-3.5-turbo"

class AIResponse(BaseModel):
    content: str
    tokens_used: Optional[int] = None
    model: str

class ResumeAnalysisRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_description: Optional[str] = None

class ResumeAnalysisResponse(BaseModel):
    score: float
    suggestions: List[str]
    missing_keywords: List[str]
    strengths: List[str]

# Mock user database (in production, use a real database)
fake_users_db = {
    "test@example.com": {
        "id": "1",
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",  # In production, use hashed passwords
        "created_at": "2024-01-01T00:00:00Z"
    }
}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Authentication endpoints
@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    if user_data.email in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(len(fake_users_db) + 1)
    new_user = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": user_data.password,  # In production, hash this
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    fake_users_db[user_data.email] = new_user
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=new_user["id"],
            name=new_user["name"],
            email=new_user["email"],
            created_at=new_user["created_at"]
        )
    }

@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Login user"""
    user = fake_users_db.get(user_credentials.email)
    if not user or user["password"] != user_credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_credentials.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            created_at=user["created_at"]
        )
    }

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user(current_user_email: str = Depends(verify_token)):
    """Get current user information"""
    user = fake_users_db.get(current_user_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"]
    )

# AI endpoints
@app.post("/api/ai/generate", response_model=AIResponse)
async def generate_ai_content(request: AIRequest, current_user_email: str = Depends(verify_token)):
    """Generate AI content for resumes"""
    # In production, integrate with OpenAI, Anthropic, or other AI services
    # For now, return mock responses based on the prompt
    
    prompt_lower = request.prompt.lower()
    
    if "summary" in prompt_lower or "objective" in prompt_lower:
        content = "Experienced professional with a proven track record of delivering results in fast-paced environments. Skilled in strategic thinking, team leadership, and cross-functional collaboration. Passionate about driving innovation and continuous improvement."
    elif "bullet point" in prompt_lower or "achievement" in prompt_lower:
        content = "• Increased team productivity by 25% through implementation of new workflow processes\n• Led cross-functional team of 8 members to deliver project 2 weeks ahead of schedule\n• Reduced operational costs by $50K annually through process optimization"
    elif "skill" in prompt_lower:
        content = "Technical Skills: Python, JavaScript, React, Node.js, SQL, AWS\nSoft Skills: Leadership, Communication, Problem Solving, Team Collaboration"
    else:
        content = "Generated professional content based on your input. This would be powered by advanced AI in production."
    
    return AIResponse(
        content=content,
        tokens_used=150,  # Mock token usage
        model=request.model
    )

@app.post("/api/ai/analyze-resume", response_model=ResumeAnalysisResponse)
async def analyze_resume(request: ResumeAnalysisRequest, current_user_email: str = Depends(verify_token)):
    """Analyze resume against job description"""
    # Mock analysis - in production, use AI to analyze resume
    score = 85.5  # Mock score
    
    suggestions = [
        "Add more quantifiable achievements to your experience section",
        "Include relevant keywords from the job description",
        "Expand on your technical skills with specific examples"
    ]
    
    missing_keywords = [
        "Python",
        "Machine Learning",
        "Agile Methodologies"
    ]
    
    strengths = [
        "Strong technical background",
        "Excellent communication skills",
        "Proven leadership experience"
    ]
    
    return ResumeAnalysisResponse(
        score=score,
        suggestions=suggestions,
        missing_keywords=missing_keywords,
        strengths=strengths
    )

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "python-api",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# API status
@app.get("/api/status")
async def api_status():
    """API status endpoint"""
    return {
        "message": "RoleReady Python API is running",
        "endpoints": {
            "auth": "/api/auth/*",
            "ai": "/api/ai/*",
            "health": "/health"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
