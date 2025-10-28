"""
Tests for chat bot module.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from modules.chat_bot import ChatBot, ChatSession, MessageHistory
from modules.shared.types import LLMRequest, LLMResponse, LLMProvider


class TestMessageHistory:
    """Test MessageHistory class."""
    
    def test_add_message(self):
        """Test adding messages to history."""
        history = MessageHistory(max_history=3)
        
        history.add_message("user", "Hello")
        history.add_message("assistant", "Hi there!")
        
        messages = history.get_messages()
        assert len(messages) == 2
        assert messages[0].role == "user"
        assert messages[0].content == "Hello"
        assert messages[1].role == "assistant"
        assert messages[1].content == "Hi there!"
    
    def test_max_history_limit(self):
        """Test that history is limited to max_history."""
        history = MessageHistory(max_history=2)
        
        history.add_message("user", "Message 1")
        history.add_message("assistant", "Response 1")
        history.add_message("user", "Message 2")
        history.add_message("assistant", "Response 2")
        
        messages = history.get_messages()
        assert len(messages) == 2
        assert messages[0].content == "Message 2"
        assert messages[1].content == "Response 2"
    
    def test_clear_history(self):
        """Test clearing message history."""
        history = MessageHistory()
        history.add_message("user", "Hello")
        history.clear()
        
        assert len(history.get_messages()) == 0


class TestChatSession:
    """Test ChatSession class."""
    
    @pytest.fixture
    def mock_client(self):
        """Create mock LLM client."""
        client = AsyncMock()
        response = LLMResponse(
            content="Test response",
            model="gpt-4",
            provider=LLMProvider.OPENAI
        )
        client.generate.return_value = response
        return client
    
    @pytest.fixture
    def chat_bot(self, mock_client):
        """Create ChatBot instance."""
        return ChatBot(
            client=mock_client,
            model="gpt-4",
            system_prompt="You are a helpful assistant",
            temperature=0.7,
            max_tokens=1000,
            stream=False
        )
    
    @pytest.fixture
    def chat_session(self, chat_bot):
        """Create ChatSession instance."""
        return ChatSession(chat_bot)
    
    @pytest.mark.asyncio
    async def test_send_message(self, chat_session):
        """Test sending a message."""
        response_generator = chat_session.send_message("Hello")
        response = await response_generator.__anext__()
        
        assert response == "Test response"
        assert len(chat_session.get_history()) == 2  # User + Assistant messages
    
    @pytest.mark.asyncio
    async def test_stream_response(self, chat_session):
        """Test streaming response."""
        # Mock streaming response
        async def mock_stream():
            yield "Test "
            yield "response"
        
        chat_session.chat_bot.client.stream_generate = AsyncMock(return_value=mock_stream())
        
        response_parts = []
        async for chunk in chat_session.send_message("Hello"):
            response_parts.append(chunk)
        
        assert "".join(response_parts) == "Test response"


class TestChatBot:
    """Test ChatBot class."""
    
    @pytest.fixture
    def mock_client(self):
        """Create mock LLM client."""
        client = AsyncMock()
        response = LLMResponse(
            content="Test response",
            model="gpt-4",
            provider=LLMProvider.OPENAI
        )
        client.generate.return_value = response
        return client
    
    @pytest.fixture
    def chat_bot(self, mock_client):
        """Create ChatBot instance."""
        return ChatBot(
            client=mock_client,
            model="gpt-4",
            system_prompt="You are a helpful assistant",
            temperature=0.7,
            max_tokens=1000,
            stream=False
        )
    
    @pytest.mark.asyncio
    async def test_generate_response(self, chat_bot):
        """Test generating a single response."""
        response = await chat_bot.generate_response("Hello")
        assert response == "Test response"
    
    @pytest.mark.asyncio
    async def test_stream_response(self, chat_bot):
        """Test streaming response."""
        # Mock streaming response
        async def mock_stream():
            yield "Test "
            yield "response"
        
        chat_bot.client.stream_generate = AsyncMock(return_value=mock_stream())
        
        response_parts = []
        async for chunk in chat_bot.stream_response("Hello"):
            response_parts.append(chunk)
        
        assert "".join(response_parts) == "Test response"
    
    def test_initialization(self, mock_client):
        """Test ChatBot initialization."""
        chat_bot = ChatBot(
            client=mock_client,
            model="gpt-4",
            system_prompt="Custom prompt",
            temperature=0.5,
            max_tokens=2000,
            stream=True,
            provider="anthropic"
        )
        
        assert chat_bot.model == "gpt-4"
        assert chat_bot.system_prompt == "Custom prompt"
        assert chat_bot.temperature == 0.5
        assert chat_bot.max_tokens == 2000
        assert chat_bot.stream is True
        assert chat_bot.provider == "anthropic"