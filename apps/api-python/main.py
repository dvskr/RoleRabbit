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
import json
from datetime import datetime, timedelta
import uvicorn
import logging
from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client (with fallback if API key not set)
openai_api_key = os.getenv("OPENAI_API_KEY")
openai_client = None
if openai_api_key:
    try:
        openai_client = OpenAI(api_key=openai_api_key)
        logger.info("OpenAI client initialized successfully")
    except Exception as e:
        logger.warning(f"Failed to initialize OpenAI client: {e}")
        openai_client = None
else:
    logger.warning("OPENAI_API_KEY not set - AI features will use fallback responses")

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

class ATSScoreRequest(BaseModel):
    resume_text: str
    job_description: str

class ATSScoreResponse(BaseModel):
    overall_score: float
    category_scores: Dict[str, float]
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggestions: List[str]

class ResumeAnalysisResponse(BaseModel):
    score: float
    suggestions: List[str]
    missing_keywords: List[str]
    strengths: List[str]
    ai_analysis: Optional[str] = None

# Mock user database (in production, use a real database)
fake_users_db = {
    "test@example.com": {
        "id": "1",
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
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
    
    user_id = str(len(fake_users_db) + 1)
    new_user = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": user_data.password,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    fake_users_db[user_data.email] = new_user
    
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
  """Generate AI content for resumes using OpenAI"""
  if not openai_client:
    raise HTTPException(
      status_code=503,
      detail="OpenAI client not configured. Please set OPENAI_API_KEY environment variable."
    )
  
  response = openai_client.chat.completions.create(
    model=request.model or "gpt-4o-mini",
    messages=[
      {"role": "system", "content": "You are a professional resume writer and career coach."},
      {"role": "user", "content": request.prompt}
    ],
    max_tokens=1000,
    temperature=0.7
  )
  
  content = response.choices[0].message.content
  
  return AIResponse(
    content=content,
    tokens_used=response.usage.total_tokens if response.usage else 150,
    model=response.model
  )

@app.post("/api/ai/ats-score", response_model=ATSScoreResponse)
async def calculate_ats_score(request: ATSScoreRequest, current_user_email: str = Depends(verify_token)):
  """Calculate ATS compatibility score between resume and job description"""
  if not openai_client:
    raise HTTPException(
      status_code=503,
      detail="OpenAI client not configured. Please set OPENAI_API_KEY environment variable."
    )
  
  prompt = f"""
  Calculate ATS compatibility score between resume and job description.
  Return a JSON object with: overall_score (0-100), category_scores (dict with keys: skills, experience, keywords, education),
  matched_keywords (list), missing_keywords (list), suggestions (list of improvement suggestions).
  
  Resume: {request.resume_text}
  Job Description: {request.job_description}
  """
  
  response = openai_client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
      {"role": "system", "content": "You are an ATS expert. Return only valid JSON with no markdown formatting."},
      {"role": "user", "content": prompt}
    ],
    temperature=0.2,
    max_tokens=1500,
    response_format={"type": "json_object"}
  )
  
  score_data = json.loads(response.choices[0].message.content)
  
  return ATSScoreResponse(
    overall_score=score_data.get("overall_score", 75),
    category_scores=score_data.get("category_scores", {}),
    matched_keywords=score_data.get("matched_keywords", []),
    missing_keywords=score_data.get("missing_keywords", []),
    suggestions=score_data.get("suggestions", [])
  )

@app.post("/api/ai/analyze-job", response_model=dict)
async def analyze_job(request: ResumeAnalysisRequest, current_user_email: str = Depends(verify_token)):
  """Analyze job description and provide insights"""
  if not openai_client:
    raise HTTPException(
      status_code=503,
      detail="OpenAI client not configured. Please set OPENAI_API_KEY environment variable."
    )
  
  job_desc = request.job_description or ""
  prompt = f"""
  Analyze this job description and provide:
  1. Key skills and technologies required
  2. Experience level needed
  3. Important keywords
  4. Potential salary range
  5. Company culture indicators
  
  Job Description:
  {job_desc}
  
  Return JSON format with keys: skills (list), experience_level (string), keywords (list), salary_range (dict with min/max), culture_indicators (list).
  """
  
  response = openai_client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
      {"role": "system", "content": "You are a job market expert. Return only valid JSON with no markdown formatting."},
      {"role": "user", "content": prompt}
    ],
    temperature=0.3,
    max_tokens=1000,
    response_format={"type": "json_object"}
  )
  
  analysis = json.loads(response.choices[0].message.content)
  return analysis

@app.post("/api/ai/analyze-resume", response_model=ResumeAnalysisResponse)
async def analyze_resume(request: ResumeAnalysisRequest, current_user_email: str = Depends(verify_token)):
  """Analyze resume and provide improvement suggestions"""
  if not openai_client:
    raise HTTPException(
      status_code=503,
      detail="OpenAI client not configured. Please set OPENAI_API_KEY environment variable."
    )
  
  resume_json = json.dumps(request.resume_data) if isinstance(request.resume_data, dict) else str(request.resume_data)
  job_desc = request.job_description or "General job application"
  
  prompt = f"""
  Analyze this resume and provide improvement suggestions.
  Return a JSON object with: score (0-100), suggestions (list), missing_keywords (list), strengths (list), ai_analysis (string).
  
  Resume: {resume_json}
  Job Description: {job_desc}
  """
  
  response = openai_client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
      {"role": "system", "content": "You are a professional resume writer. Return only valid JSON with no markdown formatting."},
      {"role": "user", "content": prompt}
    ],
    temperature=0.3,
    max_tokens=1500,
    response_format={"type": "json_object"}
  )
  
  analysis = json.loads(response.choices[0].message.content)
  
  return ResumeAnalysisResponse(
    score=analysis.get("score", 75),
    suggestions=analysis.get("suggestions", []),
    missing_keywords=analysis.get("missing_keywords", []),
    strengths=analysis.get("strengths", []),
    ai_analysis=analysis.get("ai_analysis", "Resume looks good overall")
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
