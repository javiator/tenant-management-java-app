"""
Chat bot core functionality.
"""

import asyncio
from typing import List, Optional, AsyncGenerator
from datetime import datetime

from ..shared import LLMRequest, LLMResponse, ChatMessage, setup_logging


class MessageHistory:
    """Manages chat message history."""
    
    def __init__(self, max_history: int = 50):
        self.messages: List[ChatMessage] = []
        self.max_history = max_history
    
    def add_message(self, role: str, content: str) -> None:
        """Add a message to history."""
        message = ChatMessage(
            role=role,
            content=content,
            timestamp=datetime.now().isoformat()
        )
        self.messages.append(message)
        
        # Trim history if needed
        if len(self.messages) > self.max_history:
            self.messages = self.messages[-self.max_history:]
    
    def get_messages(self) -> List[ChatMessage]:
        """Get all messages."""
        return self.messages.copy()
    
    def clear(self) -> None:
        """Clear message history."""
        self.messages.clear()


class ChatSession:
    """Interactive chat session."""
    
    def __init__(self, chat_bot: 'ChatBot'):
        self.chat_bot = chat_bot
        self.history = MessageHistory()
        self.logger = setup_logging(module_name="chat_session")
    
    async def send_message(self, user_input: str) -> str:
        """Send a message and get response."""
        # Add user message to history
        self.history.add_message("user", user_input)
        
        # Create request with conversation context
        request = LLMRequest(
            prompt=user_input,
            model=self.chat_bot.model,
            max_tokens=self.chat_bot.max_tokens,
            temperature=self.chat_bot.temperature,
            provider=self.chat_bot.provider,
            system_prompt=self.chat_bot.system_prompt,
            context={"history": [msg.dict() for msg in self.history.get_messages()[-10:]]}
        )
        
        if self.chat_bot.stream:
            # Stream response
            response_parts = []
            async for chunk in self.chat_bot.client.stream_generate(request):
                response_parts.append(chunk)
                yield chunk
            
            full_response = "".join(response_parts)
        else:
            # Get full response
            response = await self.chat_bot.client.generate(request)
            full_response = response.content
            yield full_response
        
        # Add assistant response to history
        self.history.add_message("assistant", full_response)
    
    def get_history(self) -> List[ChatMessage]:
        """Get conversation history."""
        return self.history.get_messages()
    
    def clear_history(self) -> None:
        """Clear conversation history."""
        self.history.clear()


class ChatBot:
    """Main chat bot class."""
    
    def __init__(
        self,
        client,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4000,
        stream: bool = True,
        provider: str = "openai"
    ):
        self.client = client
        self.model = model
        self.system_prompt = system_prompt or "You are a helpful AI assistant."
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.stream = stream
        self.provider = provider
        self.logger = setup_logging(module_name="chat_bot")
    
    async def start_session(self) -> None:
        """Start an interactive chat session."""
        from rich.console import Console
        from rich.panel import Panel
        from rich.markdown import Markdown
        
        console = Console()
        
        console.print(Panel.fit(
            "[bold blue]🤖 LLM Chat Bot[/bold blue]\n"
            f"Model: {self.model or 'default'}\n"
            f"Provider: {self.provider}\n"
            f"Stream: {self.stream}\n"
            "Type 'quit' or 'exit' to end the session",
            title="Chat Session Started"
        ))
        
        session = ChatSession(self)
        
        while True:
            try:
                # Get user input
                user_input = input("\n👤 You: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'bye']:
                    console.print("\n[green]Goodbye! 👋[/green]")
                    break
                
                if not user_input:
                    continue
                
                # Show typing indicator
                console.print("\n🤖 Assistant: ", end="")
                
                # Get and display response
                response_parts = []
                async for chunk in session.send_message(user_input):
                    response_parts.append(chunk)
                    print(chunk, end="", flush=True)
                
                print()  # New line after response
                
            except KeyboardInterrupt:
                console.print("\n\n[yellow]Session interrupted. Goodbye! 👋[/yellow]")
                break
            except Exception as e:
                self.logger.error(f"Chat error: {e}")
                console.print(f"\n[red]Error: {e}[/red]")
    
    async def generate_response(self, prompt: str) -> str:
        """Generate a single response."""
        request = LLMRequest(
            prompt=prompt,
            model=self.model,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            provider=self.provider,
            system_prompt=self.system_prompt
        )
        
        response = await self.client.generate(request)
        return response.content
    
    async def stream_response(self, prompt: str) -> AsyncGenerator[str, None]:
        """Stream a response."""
        request = LLMRequest(
            prompt=prompt,
            model=self.model,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            provider=self.provider,
            system_prompt=self.system_prompt
        )
        
        async for chunk in self.client.stream_generate(request):
            yield chunk