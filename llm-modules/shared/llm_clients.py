"""
LLM client abstractions for different providers.
"""

import asyncio
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
import httpx
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

from .types import LLMRequest, LLMResponse, LLMProvider
from .config import get_settings


class LLMClient(ABC):
    """Abstract base class for LLM clients."""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        self.api_key = api_key
        self.base_url = base_url
    
    @abstractmethod
    async def generate(self, request: LLMRequest) -> LLMResponse:
        """Generate a response from the LLM."""
        pass
    
    @abstractmethod
    async def stream_generate(self, request: LLMRequest):
        """Stream a response from the LLM."""
        pass


class OpenAIClient(LLMClient):
    """OpenAI API client."""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        super().__init__(api_key, base_url)
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url or "https://api.openai.com/v1"
        )
    
    async def generate(self, request: LLMRequest) -> LLMResponse:
        """Generate a response using OpenAI API."""
        try:
            messages = []
            if request.system_prompt:
                messages.append({"role": "system", "content": request.system_prompt})
            messages.append({"role": "user", "content": request.prompt})
            
            response = await self.client.chat.completions.create(
                model=request.model or "gpt-4",
                messages=messages,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
            )
            
            return LLMResponse(
                content=response.choices[0].message.content,
                model=response.model,
                provider=LLMProvider.OPENAI,
                usage={
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                },
                metadata={"finish_reason": response.choices[0].finish_reason}
            )
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    async def stream_generate(self, request: LLMRequest):
        """Stream a response using OpenAI API."""
        try:
            messages = []
            if request.system_prompt:
                messages.append({"role": "system", "content": request.system_prompt})
            messages.append({"role": "user", "content": request.prompt})
            
            stream = await self.client.chat.completions.create(
                model=request.model or "gpt-4",
                messages=messages,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                stream=True
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            raise Exception(f"OpenAI streaming error: {str(e)}")


class AnthropicClient(LLMClient):
    """Anthropic API client."""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        super().__init__(api_key, base_url)
        self.client = AsyncAnthropic(
            api_key=api_key,
            base_url=base_url or "https://api.anthropic.com"
        )
    
    async def generate(self, request: LLMRequest) -> LLMResponse:
        """Generate a response using Anthropic API."""
        try:
            response = await self.client.messages.create(
                model=request.model or "claude-3-sonnet-20240229",
                max_tokens=request.max_tokens or 4000,
                temperature=request.temperature,
                system=request.system_prompt,
                messages=[{"role": "user", "content": request.prompt}]
            )
            
            return LLMResponse(
                content=response.content[0].text,
                model=response.model,
                provider=LLMProvider.ANTHROPIC,
                usage={
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                },
                metadata={"stop_reason": response.stop_reason}
            )
        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")
    
    async def stream_generate(self, request: LLMRequest):
        """Stream a response using Anthropic API."""
        try:
            stream = await self.client.messages.create(
                model=request.model or "claude-3-sonnet-20240229",
                max_tokens=request.max_tokens or 4000,
                temperature=request.temperature,
                system=request.system_prompt,
                messages=[{"role": "user", "content": request.prompt}],
                stream=True
            )
            
            async for chunk in stream:
                if hasattr(chunk, 'delta') and chunk.delta.text:
                    yield chunk.delta.text
        except Exception as e:
            raise Exception(f"Anthropic streaming error: {str(e)}")


class LLMClientFactory:
    """Factory for creating LLM clients."""
    
    @staticmethod
    def create_client(provider: LLMProvider, api_key: str, base_url: Optional[str] = None) -> LLMClient:
        """Create an LLM client for the specified provider."""
        if provider == LLMProvider.OPENAI:
            return OpenAIClient(api_key, base_url)
        elif provider == LLMProvider.ANTHROPIC:
            return AnthropicClient(api_key, base_url)
        else:
            raise ValueError(f"Unsupported provider: {provider}")
    
    @staticmethod
    def create_from_settings() -> LLMClient:
        """Create a client using settings configuration."""
        settings = get_settings()
        
        if settings.openai_api_key:
            return OpenAIClient(settings.openai_api_key, settings.openai_base_url)
        elif settings.anthropic_api_key:
            return AnthropicClient(settings.anthropic_api_key, settings.anthropic_base_url)
        else:
            raise ValueError("No API keys configured in settings")