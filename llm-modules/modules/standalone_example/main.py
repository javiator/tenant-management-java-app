"""
Standalone module example - can run independently with minimal shared dependencies.
"""

import typer
import asyncio
from pathlib import Path
from typing import Optional

# Minimal shared dependencies - only what's absolutely necessary
from shared.utils import setup_logging
from shared.config import get_settings

app = typer.Typer()


@app.command()
def run(
    input_file: str = typer.Argument(..., help="Input file to process"),
    output_file: Optional[str] = typer.Option(None, "--output", "-o", help="Output file"),
    config_file: Optional[str] = typer.Option(None, "--config", "-c", help="Config file"),
):
    """Run standalone processing."""
    logger = setup_logging(module_name="standalone_example")
    
    try:
        # Load module-specific config if provided
        if config_file and Path(config_file).exists():
            logger.info(f"Loading config from {config_file}")
            # Load custom config logic here
        
        # Get basic settings (only what we need)
        settings = get_settings()
        
        # Create processor with minimal dependencies
        processor = StandaloneProcessor(
            log_level=settings.log_level,
            debug=settings.debug
        )
        
        # Process the file
        result = asyncio.run(processor.process_file(input_file))
        
        # Save result
        if output_file:
            with open(output_file, 'w') as f:
                f.write(str(result))
            logger.info(f"Result saved to {output_file}")
        else:
            print(result)
        
    except Exception as e:
        logger.error(f"Processing failed: {e}")
        raise typer.Exit(1)


@app.command()
def batch(
    input_dir: str = typer.Argument(..., help="Input directory"),
    output_dir: str = typer.Option("output", "--output", "-o", help="Output directory"),
    pattern: str = typer.Option("*.txt", "--pattern", "-p", help="File pattern"),
):
    """Process multiple files in batch."""
    logger = setup_logging(module_name="standalone_example")
    
    try:
        input_path = Path(input_dir)
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Find files
        files = list(input_path.glob(pattern))
        if not files:
            print(f"No files found matching pattern: {pattern}")
            return
        
        print(f"Processing {len(files)} files...")
        
        # Process each file
        for file_path in files:
            print(f"Processing: {file_path.name}")
            result = asyncio.run(StandaloneProcessor().process_file(str(file_path)))
            
            # Save result
            output_file = output_path / f"{file_path.stem}_processed.txt"
            with open(output_file, 'w') as f:
                f.write(str(result))
        
        print(f"Batch processing complete. Results in {output_dir}")
        
    except Exception as e:
        logger.error(f"Batch processing failed: {e}")
        raise typer.Exit(1)


if __name__ == "__main__":
    app()