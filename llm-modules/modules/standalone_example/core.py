"""
Standalone module core - minimal external dependencies.
"""

import asyncio
import json
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

# Only import what we absolutely need from shared
from shared.utils import setup_logging


class StandaloneProcessor:
    """Standalone processor with minimal dependencies."""
    
    def __init__(self, log_level: str = "INFO", debug: bool = False):
        self.logger = setup_logging(level=log_level, module_name="standalone_processor")
        self.debug = debug
    
    async def process_file(self, file_path: str) -> str:
        """Process a single file."""
        try:
            file_path = Path(file_path)
            
            if not file_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Read file content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            self.logger.info(f"Processing file: {file_path.name}")
            
            # Process content (example processing)
            result = await self._process_content(content, file_path.name)
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error processing {file_path}: {e}")
            raise
    
    async def _process_content(self, content: str, filename: str) -> str:
        """Process file content."""
        # Example processing logic
        result = {
            "filename": filename,
            "processed_at": datetime.now().isoformat(),
            "content_length": len(content),
            "word_count": len(content.split()),
            "line_count": len(content.splitlines()),
            "preview": content[:200] + "..." if len(content) > 200 else content
        }
        
        if self.debug:
            self.logger.debug(f"Processed content: {result}")
        
        return json.dumps(result, indent=2)
    
    def get_module_info(self) -> Dict[str, Any]:
        """Get module information."""
        return {
            "name": "standalone_example",
            "version": "1.0.0",
            "description": "Standalone processing module",
            "dependencies": ["shared.utils", "shared.config"],
            "standalone": True
        }