"""
Code generator module main entry point.
"""

import typer
import json
from pathlib import Path
from typing import Optional, List
from rich.console import Console
from rich.syntax import Syntax
from rich.panel import Panel

from ..shared import get_settings, LLMClientFactory, LLMProvider, setup_logging
from .core import CodeGenerator, CodeGenerationRequest

app = typer.Typer()
console = Console()


@app.command()
def generate(
    description: str = typer.Argument(..., help="Code description"),
    language: str = typer.Option("python", "--language", "-l", help="Programming language"),
    framework: Optional[str] = typer.Option(None, "--framework", "-f", help="Framework or library"),
    output: Optional[str] = typer.Option(None, "--output", "-o", help="Output file"),
    include_tests: bool = typer.Option(False, "--tests/--no-tests", help="Include unit tests"),
    include_docs: bool = typer.Option(True, "--docs/--no-docs", help="Include documentation"),
    style: Optional[str] = typer.Option(None, "--style", "-s", help="Code style (pep8, black, etc.)"),
):
    """Generate code from description."""
    logger = setup_logging(module_name="code_generator")
    
    try:
        # Create code generator
        settings = get_settings()
        client = LLMClientFactory.create_from_settings()
        
        generator = CodeGenerator(
            client=client,
            model=settings.code_generator_model,
            temperature=0.1  # Very low temperature for code generation
        )
        
        # Create request
        request = CodeGenerationRequest(
            description=description,
            language=language,
            framework=framework,
            style=style,
            include_tests=include_tests,
            include_docs=include_docs
        )
        
        # Generate code
        console.print("[blue]Generating code...[/blue]")
        result = await generator.generate_code(request)
        
        # Display result
        display_code(result, language)
        
        # Save to file if specified
        if output:
            save_code(result, output)
            console.print(f"[green]Code saved to {output}[/green]")
        
    except Exception as e:
        logger.error(f"Code generation error: {e}")
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def refactor(
    file: str = typer.Argument(..., help="File to refactor"),
    instructions: str = typer.Argument(..., help="Refactoring instructions"),
    output: Optional[str] = typer.Option(None, "--output", "-o", help="Output file"),
):
    """Refactor existing code."""
    logger = setup_logging(module_name="code_generator")
    
    try:
        # Read input file
        with open(file, 'r', encoding='utf-8') as f:
            original_code = f.read()
        
        # Create code generator
        settings = get_settings()
        client = LLMClientFactory.create_from_settings()
        
        generator = CodeGenerator(
            client=client,
            model=settings.code_generator_model,
            temperature=0.1
        )
        
        # Refactor code
        console.print("[blue]Refactoring code...[/blue]")
        result = await generator.refactor_code(original_code, instructions)
        
        # Display result
        display_code(result, "python")  # Assume Python for now
        
        # Save to file if specified
        if output:
            save_code(result, output)
            console.print(f"[green]Refactored code saved to {output}[/green]")
        
    except Exception as e:
        logger.error(f"Code refactoring error: {e}")
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def explain(
    file: str = typer.Argument(..., help="File to explain"),
    detail: str = typer.Option("medium", "--detail", "-d", help="Detail level (low, medium, high)"),
):
    """Explain existing code."""
    logger = setup_logging(module_name="code_generator")
    
    try:
        # Read input file
        with open(file, 'r', encoding='utf-8') as f:
            code = f.read()
        
        # Create code generator
        settings = get_settings()
        client = LLMClientFactory.create_from_settings()
        
        generator = CodeGenerator(
            client=client,
            model=settings.code_generator_model,
            temperature=0.3
        )
        
        # Explain code
        console.print("[blue]Analyzing code...[/blue]")
        explanation = await generator.explain_code(code, detail)
        
        # Display explanation
        console.print(Panel(explanation, title="Code Explanation", border_style="blue"))
        
    except Exception as e:
        logger.error(f"Code explanation error: {e}")
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


def display_code(code: str, language: str) -> None:
    """Display generated code with syntax highlighting."""
    syntax = Syntax(code, language, theme="monokai", line_numbers=True)
    console.print(Panel(syntax, title="Generated Code", border_style="green"))


def save_code(code: str, output_file: str) -> None:
    """Save code to file."""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(code)


if __name__ == "__main__":
    app()