#!/usr/bin/env python3
"""
Startup script for RoleReady Python Backend
"""

import subprocess
import sys
import os
from pathlib import Path

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("[OK] Python requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to install Python requirements: {e}")
        sys.exit(1)

def start_server():
    """Start the Python FastAPI server"""
    print("Starting RoleReady Python Backend...")
    try:
        # Set environment variables
        env = os.environ.copy()
        env["PORT"] = "8000"
        env["HOST"] = "0.0.0.0"
        
        subprocess.run([sys.executable, "main.py"], env=env, check=True)
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to start Python server: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n[STOPPED] Python backend stopped")

if __name__ == "__main__":
    print("RoleReady Python Backend Startup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("requirements.txt").exists():
        print("[ERROR] requirements.txt not found. Please run this script from the api-python directory.")
        sys.exit(1)
    
    install_requirements()
    start_server()
