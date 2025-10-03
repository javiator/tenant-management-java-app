"""
Shared utility functions for LLM modules.
"""

import logging
import os
import re
from typing import Any, Dict, List, Optional, Union
from pathlib import Path
import json
from datetime import datetime


def setup_logging(level: str = "INFO", module_name: Optional[str] = None) -> logging.Logger:
    """Setup logging configuration."""
    log_level = getattr(logging, level.upper(), logging.INFO)
    
    # Create logger
    logger_name = f"llm_modules.{module_name}" if module_name else "llm_modules"
    logger = logging.getLogger(logger_name)
    logger.setLevel(log_level)
    
    # Create console handler if not exists
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setLevel(log_level)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        
        logger.addHandler(handler)
    
    return logger


def validate_api_key(api_key: str, provider: str) -> bool:
    """Validate API key format for different providers."""
    if not api_key or not isinstance(api_key, str):
        return False
    
    api_key = api_key.strip()
    
    if provider.lower() == "openai":
        # OpenAI keys start with 'sk-' and are 51 characters long
        return api_key.startswith('sk-') and len(api_key) == 51
    elif provider.lower() == "anthropic":
        # Anthropic keys start with 'sk-ant-' and are longer
        return api_key.startswith('sk-ant-') and len(api_key) > 20
    elif provider.lower() == "google":
        # Google API keys are typically 39 characters
        return len(api_key) == 39 and api_key.isalnum()
    
    return len(api_key) > 10  # Basic validation for unknown providers


def format_response(response: Any, format_type: str = "text") -> str:
    """Format LLM response for different output types."""
    if format_type == "json":
        if isinstance(response, dict):
            return json.dumps(response, indent=2)
        return json.dumps({"response": str(response)}, indent=2)
    
    elif format_type == "markdown":
        if isinstance(response, dict):
            return f"# Response\n\n{json.dumps(response, indent=2)}"
        return f"# Response\n\n{response}"
    
    elif format_type == "html":
        if isinstance(response, dict):
            content = json.dumps(response, indent=2)
        else:
            content = str(response)
        return f"<div class='llm-response'>{content}</div>"
    
    else:  # text format
        return str(response)


def extract_code_blocks(text: str, language: Optional[str] = None) -> List[Dict[str, str]]:
    """Extract code blocks from text."""
    pattern = r'```(\w+)?\n(.*?)```'
    matches = re.findall(pattern, text, re.DOTALL)
    
    code_blocks = []
    for match in matches:
        block_language, code = match
        if language is None or block_language == language:
            code_blocks.append({
                "language": block_language or "text",
                "code": code.strip()
            })
    
    return code_blocks


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe file operations."""
    # Remove or replace invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Remove leading/trailing whitespace and dots
    filename = filename.strip('. ')
    # Limit length
    if len(filename) > 255:
        filename = filename[:255]
    return filename


def create_output_dir(base_dir: str, module_name: str) -> Path:
    """Create output directory for module."""
    output_dir = Path(base_dir) / "outputs" / module_name
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def save_response(response: Any, output_path: Path, format_type: str = "json") -> None:
    """Save response to file."""
    if format_type == "json":
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(response, f, indent=2, ensure_ascii=False)
    else:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(str(response))


def load_config(config_path: Union[str, Path]) -> Dict[str, Any]:
    """Load configuration from JSON file."""
    config_path = Path(config_path)
    if not config_path.exists():
        return {}
    
    with open(config_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_config(config: Dict[str, Any], config_path: Union[str, Path]) -> None:
    """Save configuration to JSON file."""
    config_path = Path(config_path)
    config_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)


def get_timestamp() -> str:
    """Get current timestamp string."""
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    """Split text into overlapping chunks."""
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        
        # Try to break at word boundary
        if end < len(text):
            last_space = chunk.rfind(' ')
            if last_space > chunk_size * 0.8:  # Only break if we're close to chunk_size
                chunk = chunk[:last_space]
                end = start + last_space
        
        chunks.append(chunk)
        start = end - overlap
    
    return chunks


def merge_responses(responses: List[str], separator: str = "\n\n") -> str:
    """Merge multiple responses into a single text."""
    return separator.join(filter(None, responses))


def clean_text(text: str) -> str:
    """Clean and normalize text."""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove control characters
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
    return text.strip()