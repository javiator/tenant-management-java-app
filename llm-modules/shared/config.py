"""
Configuration management for LLM modules.
"""

import os
from typing import Optional
from pydantic import BaseSettings, Field
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # API Keys
    openai_api_key: Optional[str] = Field(None, env="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(None, env="ANTHROPIC_API_KEY")
    google_api_key: Optional[str] = Field(None, env="GOOGLE_API_KEY")
    
    # API Endpoints
    openai_base_url: str = Field("https://api.openai.com/v1", env="OPENAI_BASE_URL")
    anthropic_base_url: str = Field("https://api.anthropic.com", env="ANTHROPIC_BASE_URL")
    
    # Application Settings
    log_level: str = Field("INFO", env="LOG_LEVEL")
    debug: bool = Field(False, env="DEBUG")
    max_tokens: int = Field(4000, env="MAX_TOKENS")
    temperature: float = Field(0.7, env="TEMPERATURE")
    
    # Database
    database_url: str = Field("sqlite:///./llm_modules.db", env="DATABASE_URL")
    
    # Redis
    redis_url: Optional[str] = Field(None, env="REDIS_URL")
    
    # Module-specific settings
    chat_bot_model: str = Field("gpt-4", env="CHAT_BOT_MODEL")
    text_analyzer_model: str = Field("claude-3-sonnet", env="TEXT_ANALYZER_MODEL")
    code_generator_model: str = Field("gpt-4-turbo", env="CODE_GENERATOR_MODEL")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


def get_module_config(module_name: str) -> dict:
    """Get module-specific configuration."""
    settings = get_settings()
    
    config_map = {
        "chat_bot": {
            "model": settings.chat_bot_model,
            "max_tokens": settings.max_tokens,
            "temperature": settings.temperature,
        },
        "text_analyzer": {
            "model": settings.text_analyzer_model,
            "max_tokens": settings.max_tokens,
            "temperature": 0.3,  # Lower temperature for analysis
        },
        "code_generator": {
            "model": settings.code_generator_model,
            "max_tokens": settings.max_tokens,
            "temperature": 0.1,  # Very low temperature for code
        },
    }
    
    return config_map.get(module_name, {
        "model": "gpt-4",
        "max_tokens": settings.max_tokens,
        "temperature": settings.temperature,
    })