"""
Chat bot module main entry point.
"""

import asyncio
import typer
from typing import Optional, List
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown

from ..shared import get_settings, LLMClientFactory, LLMProvider, setup_logging
from .core import ChatBot, ChatSession

app = typer.Typer()
console = Console()


@app.command()
def chat(
    model: Optional[str] = typer.Option(None, "--model", "-m", help="Model to use"),
    provider: str = typer.Option("openai", "--provider", "-p", help="LLM provider"),
    system_prompt: Optional[str] = typer.Option(None, "--system", "-s", help="System prompt"),
    temperature: float = typer.Option(0.7, "--temperature", "-t", help="Temperature"),
    max_tokens: int = typer.Option(4000, "--max-tokens", help="Max tokens"),
    stream: bool = typer.Option(True, "--stream/--no-stream", help="Stream responses"),
):
    """Start an interactive chat session."""
    logger = setup_logging(module_name="chat_bot")
    
    try:
        # Get settings and create client
        settings = get_settings()
        
        if provider.lower() == "openai" and settings.openai_api_key:
            client = LLMClientFactory.create_client(
                LLMProvider.OPENAI, 
                settings.openai_api_key,
                settings.openai_base_url
            )
        elif provider.lower() == "anthropic" and settings.anthropic_api_key:
            client = LLMClientFactory.create_client(
                LLMProvider.ANTHROPIC,
                settings.anthropic_api_key,
                settings.anthropic_base_url
            )
        else:
            console.print("[red]Error: No valid API key found for the specified provider[/red]")
            raise typer.Exit(1)
        
        # Create chat bot
        chat_bot = ChatBot(
            client=client,
            model=model,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=stream
        )
        
        # Start chat session
        asyncio.run(chat_bot.start_session())
        
    except Exception as e:
        logger.error(f"Chat bot error: {e}")
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def batch(
    input_file: str = typer.Argument(..., help="Input file with prompts"),
    output_file: str = typer.Option("output.json", "--output", "-o", help="Output file"),
    model: Optional[str] = typer.Option(None, "--model", "-m", help="Model to use"),
    provider: str = typer.Option("openai", "--provider", "-p", help="LLM provider"),
):
    """Process multiple prompts from a file."""
    logger = setup_logging(module_name="chat_bot")
    
    try:
        # Load prompts from file
        with open(input_file, 'r', encoding='utf-8') as f:
            prompts = [line.strip() for line in f if line.strip()]
        
        console.print(f"[green]Processing {len(prompts)} prompts...[/green]")
        
        # Process prompts (implementation would go here)
        results = []
        for i, prompt in enumerate(prompts, 1):
            console.print(f"[blue]Processing prompt {i}/{len(prompts)}[/blue]")
            # Add actual processing logic here
            results.append({"prompt": prompt, "response": "Generated response"})
        
        # Save results
        import json
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2)
        
        console.print(f"[green]Results saved to {output_file}[/green]")
        
    except Exception as e:
        logger.error(f"Batch processing error: {e}")
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


if __name__ == "__main__":
    app()