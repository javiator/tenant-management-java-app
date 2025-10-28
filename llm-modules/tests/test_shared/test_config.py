"""
Tests for shared configuration.
"""

import pytest
from unittest.mock import patch
from modules.shared.config import Settings, get_settings, get_module_config


class TestSettings:
    """Test Settings class."""
    
    def test_default_values(self):
        """Test default configuration values."""
        with patch.dict('os.environ', {}, clear=True):
            settings = Settings()
            assert settings.log_level == "INFO"
            assert settings.debug is False
            assert settings.max_tokens == 4000
            assert settings.temperature == 0.7
            assert settings.database_url == "sqlite:///./llm_modules.db"
    
    def test_environment_override(self):
        """Test environment variable override."""
        with patch.dict('os.environ', {
            'LOG_LEVEL': 'DEBUG',
            'DEBUG': 'true',
            'MAX_TOKENS': '2000',
            'TEMPERATURE': '0.5'
        }):
            settings = Settings()
            assert settings.log_level == "DEBUG"
            assert settings.debug is True
            assert settings.max_tokens == 2000
            assert settings.temperature == 0.5
    
    def test_api_keys(self):
        """Test API key configuration."""
        with patch.dict('os.environ', {
            'OPENAI_API_KEY': 'sk-test123',
            'ANTHROPIC_API_KEY': 'sk-ant-test456'
        }):
            settings = Settings()
            assert settings.openai_api_key == 'sk-test123'
            assert settings.anthropic_api_key == 'sk-ant-test456'


class TestGetSettings:
    """Test get_settings function."""
    
    def test_cached_settings(self):
        """Test that settings are cached."""
        # Clear cache
        get_settings.cache_clear()
        
        settings1 = get_settings()
        settings2 = get_settings()
        
        assert settings1 is settings2  # Same instance due to caching


class TestGetModuleConfig:
    """Test get_module_config function."""
    
    def test_chat_bot_config(self):
        """Test chat bot module configuration."""
        with patch.dict('os.environ', {
            'CHAT_BOT_MODEL': 'gpt-4-turbo',
            'MAX_TOKENS': '2000',
            'TEMPERATURE': '0.8'
        }):
            config = get_module_config('chat_bot')
            assert config['model'] == 'gpt-4-turbo'
            assert config['max_tokens'] == 2000
            assert config['temperature'] == 0.8
    
    def test_text_analyzer_config(self):
        """Test text analyzer module configuration."""
        with patch.dict('os.environ', {
            'TEXT_ANALYZER_MODEL': 'claude-3-sonnet',
            'MAX_TOKENS': '1000'
        }):
            config = get_module_config('text_analyzer')
            assert config['model'] == 'claude-3-sonnet'
            assert config['max_tokens'] == 1000
            assert config['temperature'] == 0.3  # Lower temperature for analysis
    
    def test_code_generator_config(self):
        """Test code generator module configuration."""
        with patch.dict('os.environ', {
            'CODE_GENERATOR_MODEL': 'gpt-4-turbo',
            'MAX_TOKENS': '3000'
        }):
            config = get_module_config('code_generator')
            assert config['model'] == 'gpt-4-turbo'
            assert config['max_tokens'] == 3000
            assert config['temperature'] == 0.1  # Very low temperature for code
    
    def test_unknown_module_config(self):
        """Test configuration for unknown module."""
        config = get_module_config('unknown_module')
        assert config['model'] == 'gpt-4'  # Default model
        assert 'max_tokens' in config
        assert 'temperature' in config