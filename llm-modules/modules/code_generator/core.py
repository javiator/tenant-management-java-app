"""
Code generator core functionality.
"""

import asyncio
import re
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..shared import LLMRequest, LLMResponse, CodeGenerationRequest, setup_logging


class TemplateEngine:
    """Template engine for code generation."""
    
    def __init__(self):
        self.templates = {
            "python": {
                "class": """
class {class_name}:
    \"\"\"{docstring}\"\"\"
    
    def __init__(self{init_params}):
        {init_body}
    
    {methods}
""",
                "function": """
def {function_name}({params}):
    \"\"\"{docstring}\"\"\"
    {body}
""",
                "test": """
import pytest
from {module_name} import {class_name}

def test_{test_name}():
    \"\"\"Test {description}\"\"\"
    {test_body}
"""
            }
        }
    
    def render_template(self, template_type: str, language: str, **kwargs) -> str:
        """Render a code template."""
        if language in self.templates and template_type in self.templates[language]:
            template = self.templates[language][template_type]
            return template.format(**kwargs)
        return ""


class CodeGenEngine:
    """Core code generation engine."""
    
    def __init__(self, client, model: str = "gpt-4"):
        self.client = client
        self.model = model
        self.template_engine = TemplateEngine()
        self.logger = setup_logging(module_name="code_gen_engine")
    
    async def generate_from_description(self, request: CodeGenerationRequest) -> str:
        """Generate code from description."""
        prompt = self._build_generation_prompt(request)
        
        llm_request = LLMRequest(
            prompt=prompt,
            model=self.model,
            temperature=0.1,  # Very low temperature for code
            max_tokens=4000
        )
        
        response = await self.client.generate(llm_request)
        return self._extract_code_from_response(response.content, request.language)
    
    async def refactor_code(self, code: str, instructions: str) -> str:
        """Refactor existing code."""
        prompt = f"""
Refactor the following {self._detect_language(code)} code according to these instructions:
{instructions}

Original code:
```{self._detect_language(code)}
{code}
```

Provide the refactored code with explanations of changes made.
"""
        
        llm_request = LLMRequest(
            prompt=prompt,
            model=self.model,
            temperature=0.1,
            max_tokens=4000
        )
        
        response = await self.client.generate(llm_request)
        return self._extract_code_from_response(response.content, self._detect_language(code))
    
    async def explain_code(self, code: str, detail_level: str = "medium") -> str:
        """Explain existing code."""
        detail_instructions = {
            "low": "Provide a brief overview of what this code does.",
            "medium": "Explain the code structure, main functions, and key logic.",
            "high": "Provide a detailed explanation including algorithms, data structures, and design patterns used."
        }
        
        prompt = f"""
{detail_instructions.get(detail_level, detail_instructions["medium"])}

Code to explain:
```{self._detect_language(code)}
{code}
```

Provide a clear, structured explanation.
"""
        
        llm_request = LLMRequest(
            prompt=prompt,
            model=self.model,
            temperature=0.3,
            max_tokens=2000
        )
        
        response = await self.client.generate(llm_request)
        return response.content
    
    def _build_generation_prompt(self, request: CodeGenerationRequest) -> str:
        """Build prompt for code generation."""
        prompt_parts = [
            f"Generate {request.language} code for the following description:",
            f"Description: {request.description}",
        ]
        
        if request.framework:
            prompt_parts.append(f"Framework: {request.framework}")
        
        if request.style:
            prompt_parts.append(f"Code style: {request.style}")
        
        if request.include_tests:
            prompt_parts.append("Include comprehensive unit tests.")
        
        if request.include_docs:
            prompt_parts.append("Include detailed documentation and docstrings.")
        
        prompt_parts.extend([
            "",
            "Requirements:",
            "- Write clean, well-documented code",
            "- Follow best practices for the language",
            "- Include error handling where appropriate",
            "- Use meaningful variable and function names",
        ])
        
        if request.language.lower() == "python":
            prompt_parts.extend([
                "- Follow PEP 8 style guidelines",
                "- Use type hints where appropriate",
            ])
        
        return "\n".join(prompt_parts)
    
    def _extract_code_from_response(self, response: str, language: str) -> str:
        """Extract code blocks from LLM response."""
        # Look for code blocks in markdown format
        pattern = rf'```{language}?\n(.*?)```'
        matches = re.findall(pattern, response, re.DOTALL)
        
        if matches:
            return matches[0].strip()
        
        # Look for any code blocks
        pattern = r'```\n(.*?)```'
        matches = re.findall(pattern, response, re.DOTALL)
        
        if matches:
            return matches[0].strip()
        
        # If no code blocks found, return the response as-is
        return response.strip()
    
    def _detect_language(self, code: str) -> str:
        """Detect programming language from code."""
        # Simple heuristics
        if 'def ' in code and 'import ' in code:
            return 'python'
        elif 'function ' in code and '{' in code:
            return 'javascript'
        elif 'class ' in code and 'public ' in code:
            return 'java'
        elif '#include' in code:
            return 'cpp'
        else:
            return 'python'  # Default


class CodeGenerator:
    """Main code generator class."""
    
    def __init__(self, client, model: str = "gpt-4", temperature: float = 0.1):
        self.client = client
        self.model = model
        self.temperature = temperature
        self.logger = setup_logging(module_name="code_generator")
        
        # Initialize engine
        self.engine = CodeGenEngine(client, model)
    
    async def generate_code(self, request: CodeGenerationRequest) -> str:
        """Generate code from request."""
        try:
            return await self.engine.generate_from_description(request)
        except Exception as e:
            self.logger.error(f"Code generation error: {e}")
            raise
    
    async def refactor_code(self, code: str, instructions: str) -> str:
        """Refactor existing code."""
        try:
            return await self.engine.refactor_code(code, instructions)
        except Exception as e:
            self.logger.error(f"Code refactoring error: {e}")
            raise
    
    async def explain_code(self, code: str, detail_level: str = "medium") -> str:
        """Explain existing code."""
        try:
            return await self.engine.explain_code(code, detail_level)
        except Exception as e:
            self.logger.error(f"Code explanation error: {e}")
            raise
    
    async def generate_tests(self, code: str, language: str = "python") -> str:
        """Generate unit tests for code."""
        prompt = f"""
Generate comprehensive unit tests for the following {language} code:

```{language}
{code}
```

Include:
- Test cases for all functions/methods
- Edge cases and error conditions
- Mock objects where appropriate
- Clear test descriptions
"""
        
        request = LLMRequest(
            prompt=prompt,
            model=self.model,
            temperature=0.1,
            max_tokens=3000
        )
        
        try:
            response = await self.client.generate(request)
            return self.engine._extract_code_from_response(response.content, language)
        except Exception as e:
            self.logger.error(f"Test generation error: {e}")
            raise
    
    async def generate_documentation(self, code: str, language: str = "python") -> str:
        """Generate documentation for code."""
        prompt = f"""
Generate comprehensive documentation for the following {language} code:

```{language}
{code}
```

Include:
- Overview of functionality
- API documentation for all functions/classes
- Usage examples
- Parameter descriptions
- Return value descriptions
"""
        
        request = LLMRequest(
            prompt=prompt,
            model=self.model,
            temperature=0.3,
            max_tokens=2000
        )
        
        try:
            response = await self.client.generate(request)
            return response.content
        except Exception as e:
            self.logger.error(f"Documentation generation error: {e}")
            raise