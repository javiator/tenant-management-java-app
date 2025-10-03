"""
Text analyzer module main entry point.
"""

import typer
import json
from pathlib import Path
from typing import Optional, List
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

from ..shared import get_settings, LLMClientFactory, LLMProvider, setup_logging
from .core import TextAnalyzer, AnalysisResult

app = typer.Typer()
console = Console()


@app.command()
def analyze(
    text: Optional[str] = typer.Option(None, "--text", "-t", help="Text to analyze"),
    file: Optional[str] = typer.Option(None, "--file", "-f", help="File to analyze"),
    output: Optional[str] = typer.Option(None, "--output", "-o", help="Output file"),
    format: str = typer.Option("json", "--format", help="Output format (json, markdown, text)"),
    sentiment: bool = typer.Option(True, "--sentiment/--no-sentiment", help="Analyze sentiment"),
    entities: bool = typer.Option(True, "--entities/--no-entities", help="Extract entities"),
    topics: bool = typer.Option(True, "--topics/--no-topics", help="Extract topics"),
    summary: bool = typer.Option(True, "--summary/--no-summary", help="Generate summary"),
    language: bool = typer.Option(True, "--language/--no-language", help="Detect language"),
):
    """Analyze text content."""
    logger = setup_logging(module_name="text_analyzer")
    
    try:
        # Get input text
        if file:
            with open(file, 'r', encoding='utf-8') as f:
                input_text = f.read()
        elif text:
            input_text = text
        else:
            console.print("[red]Error: Must provide either --text or --file[/red]")
            raise typer.Exit(1)
        
        if not input_text.strip():
            console.print("[red]Error: No text to analyze[/red]")
            raise typer.Exit(1)
        
        # Create analyzer
        settings = get_settings()
        client = LLMClientFactory.create_from_settings()
        
        analyzer = TextAnalyzer(
            client=client,
            model=settings.text_analyzer_model,
            temperature=0.3  # Lower temperature for analysis
        )
        
        # Perform analysis
        console.print("[blue]Analyzing text...[/blue]")
        result = await analyzer.analyze_text(
            text=input_text,
            analyze_sentiment=sentiment,
            extract_entities=entities,
            extract_topics=topics,
            generate_summary=summary,
            detect_language=language
        )
        
        # Display results
        display_results(result, format)
        
        # Save results if output file specified
        if output:
            save_results(result, output, format)
            console.print(f"[green]Results saved to {output}[/green]")
        
    except Exception as e:
        logger.error(f"Text analysis error: {e}")
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def batch(
    input_dir: str = typer.Argument(..., help="Directory with text files"),
    output_dir: str = typer.Option("output", "--output", "-o", help="Output directory"),
    pattern: str = typer.Option("*.txt", "--pattern", "-p", help="File pattern"),
):
    """Analyze multiple text files."""
    logger = setup_logging(module_name="text_analyzer")
    
    try:
        input_path = Path(input_dir)
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Find files
        files = list(input_path.glob(pattern))
        if not files:
            console.print(f"[red]No files found matching pattern: {pattern}[/red]")
            raise typer.Exit(1)
        
        console.print(f"[blue]Found {len(files)} files to analyze[/blue]")
        
        # Create analyzer
        settings = get_settings()
        client = LLMClientFactory.create_from_settings()
        
        analyzer = TextAnalyzer(
            client=client,
            model=settings.text_analyzer_model,
            temperature=0.3
        )
        
        # Process files
        results = []
        for i, file_path in enumerate(files, 1):
            console.print(f"[blue]Processing {i}/{len(files)}: {file_path.name}[/blue]")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            result = await analyzer.analyze_text(text)
            results.append({
                "file": str(file_path),
                "analysis": result.dict()
            })
            
            # Save individual result
            output_file = output_path / f"{file_path.stem}_analysis.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result.dict(), f, indent=2)
        
        # Save combined results
        combined_file = output_path / "combined_analysis.json"
        with open(combined_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2)
        
        console.print(f"[green]Analysis complete. Results saved to {output_dir}[/green]")
        
    except Exception as e:
        logger.error(f"Batch analysis error: {e}")
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


def display_results(result: AnalysisResult, format: str) -> None:
    """Display analysis results."""
    if format == "json":
        console.print(json.dumps(result.dict(), indent=2))
    elif format == "markdown":
        markdown = f"""# Text Analysis Results

## Sentiment
**Sentiment**: {result.sentiment or 'N/A'}

## Entities
{', '.join(result.entities) if result.entities else 'None found'}

## Topics
{', '.join(result.topics) if result.topics else 'None found'}

## Summary
{result.summary or 'No summary generated'}

## Language
**Language**: {result.language or 'N/A'}

## Confidence
**Confidence**: {result.confidence or 'N/A'}
"""
        console.print(markdown)
    else:  # text format
        table = Table(title="Text Analysis Results")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")
        
        if result.sentiment:
            table.add_row("Sentiment", result.sentiment)
        if result.entities:
            table.add_row("Entities", ", ".join(result.entities))
        if result.topics:
            table.add_row("Topics", ", ".join(result.topics))
        if result.summary:
            table.add_row("Summary", result.summary)
        if result.language:
            table.add_row("Language", result.language)
        if result.confidence:
            table.add_row("Confidence", f"{result.confidence:.2f}")
        
        console.print(table)


def save_results(result: AnalysisResult, output_file: str, format: str) -> None:
    """Save results to file."""
    output_path = Path(output_file)
    
    if format == "json":
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result.dict(), f, indent=2)
    else:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(str(result))


if __name__ == "__main__":
    app()