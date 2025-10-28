"""
Shared type definitions for LLM modules.
"""

from typing import Dict, Any, Optional, List, Union
from pydantic import BaseModel, Field
from enum import Enum


class LLMProvider(str, Enum):
    """Supported LLM providers."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"


class LLMRequest(BaseModel):
    """Standard LLM request structure."""
    prompt: str = Field(..., description="The input prompt")
    model: Optional[str] = Field(None, description="Model to use")
    max_tokens: Optional[int] = Field(None, description="Maximum tokens to generate")
    temperature: Optional[float] = Field(None, description="Sampling temperature")
    provider: LLMProvider = Field(LLMProvider.OPENAI, description="LLM provider")
    system_prompt: Optional[str] = Field(None, description="System prompt")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")


class LLMResponse(BaseModel):
    """Standard LLM response structure."""
    content: str = Field(..., description="Generated content")
    model: str = Field(..., description="Model used")
    provider: LLMProvider = Field(..., description="Provider used")
    usage: Optional[Dict[str, int]] = Field(None, description="Token usage")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class ModuleConfig(BaseModel):
    """Module configuration structure."""
    name: str = Field(..., description="Module name")
    version: str = Field("1.0.0", description="Module version")
    description: str = Field(..., description="Module description")
    dependencies: List[str] = Field(default_factory=list, description="Module dependencies")
    config: Dict[str, Any] = Field(default_factory=dict, description="Module configuration")


class ChatMessage(BaseModel):
    """Chat message structure."""
    role: str = Field(..., description="Message role (user, assistant, system)")
    content: str = Field(..., description="Message content")
    timestamp: Optional[str] = Field(None, description="Message timestamp")


class AnalysisResult(BaseModel):
    """Text analysis result structure."""
    sentiment: Optional[str] = Field(None, description="Sentiment analysis")
    entities: List[str] = Field(default_factory=list, description="Named entities")
    topics: List[str] = Field(default_factory=list, description="Topic extraction")
    summary: Optional[str] = Field(None, description="Text summary")
    language: Optional[str] = Field(None, description="Detected language")
    confidence: Optional[float] = Field(None, description="Analysis confidence")


class CodeGenerationRequest(BaseModel):
    """Code generation request structure."""
    description: str = Field(..., description="Code description")
    language: str = Field("python", description="Programming language")
    framework: Optional[str] = Field(None, description="Framework or library")
    style: Optional[str] = Field(None, description="Code style preferences")
    include_tests: bool = Field(False, description="Include unit tests")
    include_docs: bool = Field(True, description="Include documentation")


class DocumentMetadata(BaseModel):
    """Document processing metadata."""
    title: Optional[str] = Field(None, description="Document title")
    author: Optional[str] = Field(None, description="Document author")
    pages: Optional[int] = Field(None, description="Number of pages")
    word_count: Optional[int] = Field(None, description="Word count")
    language: Optional[str] = Field(None, description="Document language")
    created_date: Optional[str] = Field(None, description="Creation date")
    modified_date: Optional[str] = Field(None, description="Last modified date")