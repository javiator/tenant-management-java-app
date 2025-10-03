#!/usr/bin/env python3
"""
Setup script for LLM modules environment.
"""

import os
import sys
import subprocess
from pathlib import Path


def run_command(cmd: str, description: str) -> bool:
    """Run a command and return success status."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False


def check_uv_installed() -> bool:
    """Check if UV is installed."""
    try:
        subprocess.run(["uv", "--version"], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def install_uv() -> bool:
    """Install UV package manager."""
    print("📦 Installing UV package manager...")
    
    # Try different installation methods
    install_commands = [
        "curl -LsSf https://astral.sh/uv/install.sh | sh",
        "pip install uv",
        "cargo install uv"
    ]
    
    for cmd in install_commands:
        if run_command(cmd, "Installing UV"):
            return True
    
    print("❌ Failed to install UV. Please install manually:")
    print("   curl -LsSf https://astral.sh/uv/install.sh | sh")
    return False


def setup_environment() -> bool:
    """Setup the UV environment."""
    print("🔧 Setting up UV environment...")
    
    # Check if UV is installed
    if not check_uv_installed():
        if not install_uv():
            return False
    
    # Sync dependencies
    if not run_command("uv sync", "Installing dependencies"):
        return False
    
    # Install pre-commit hooks if available
    run_command("uv run pre-commit install", "Setting up pre-commit hooks")
    
    return True


def create_env_file() -> bool:
    """Create .env file from template."""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if env_file.exists():
        print("✅ .env file already exists")
        return True
    
    if not env_example.exists():
        print("❌ .env.example file not found")
        return False
    
    # Copy template to .env
    try:
        with open(env_example, 'r') as src, open(env_file, 'w') as dst:
            dst.write(src.read())
        print("✅ Created .env file from template")
        print("⚠️  Please edit .env file with your API keys")
        return True
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False


def create_directories() -> bool:
    """Create necessary directories."""
    directories = [
        "outputs",
        "logs",
        "data",
        "tests/test_shared",
        "tests/test_modules"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    print("✅ Created project directories")
    return True


def main():
    """Main setup function."""
    print("🚀 Setting up LLM Modules environment...")
    print("=" * 50)
    
    # Change to project directory
    project_dir = Path(__file__).parent.parent
    os.chdir(project_dir)
    
    success = True
    
    # Create directories
    if not create_directories():
        success = False
    
    # Create .env file
    if not create_env_file():
        success = False
    
    # Setup environment
    if not setup_environment():
        success = False
    
    print("=" * 50)
    if success:
        print("🎉 Setup completed successfully!")
        print("\nNext steps:")
        print("1. Edit .env file with your API keys")
        print("2. Run: uv shell")
        print("3. Test a module: python -m modules.chat_bot.main chat")
    else:
        print("❌ Setup completed with errors")
        print("Please check the error messages above")
        sys.exit(1)


if __name__ == "__main__":
    main()