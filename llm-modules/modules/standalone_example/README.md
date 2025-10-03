# Standalone Example Module

This module demonstrates how to create a **standalone module** with minimal shared dependencies.

## Features

- ✅ **Minimal Dependencies**: Only uses `shared.utils` and `shared.config`
- ✅ **Independent Deployment**: Own Dockerfile and requirements.txt
- ✅ **Self-Contained**: Can run without the full LLM stack
- ✅ **Flexible**: Can be deployed separately or as part of the unified environment

## Usage

### As Part of Unified Environment

```bash
# Run within the unified environment
uv shell
python -m modules.standalone_example.main run input.txt --output result.json
```

### Standalone Deployment

```bash
# Build standalone container
docker build -f modules/standalone_example/Dockerfile -t standalone-example .

# Run standalone
docker run -v $(pwd)/data:/app/data standalone-example run /app/data/input.txt
```

### Batch Processing

```bash
python -m modules.standalone_example.main batch ./input_dir --output ./output_dir
```

## Module Independence Levels

### This Module: Level 1 - Fully Standalone
- ✅ Own requirements.txt
- ✅ Own Dockerfile  
- ✅ Minimal shared dependencies
- ✅ Can run independently
- ✅ Own configuration options

### Other Modules: Level 2-3 - Shared Integration
- Chat Bot: Uses shared LLM clients
- Text Analyzer: Uses shared LLM clients
- Code Generator: Uses shared LLM clients

## Benefits

1. **Deployment Flexibility**: Deploy this module separately
2. **Minimal Dependencies**: Faster startup, smaller footprint
3. **Team Independence**: Different teams can work on different modules
4. **Version Control**: Module can have its own release cycle
5. **Resource Efficiency**: Only loads what it needs

## Configuration

This module uses minimal shared configuration:

```python
# Only uses these shared components
from shared.utils import setup_logging
from shared.config import get_settings
```

## Adding to Your Project

To create your own standalone module:

1. Copy this structure
2. Modify `core.py` with your business logic
3. Update `requirements.txt` with your dependencies
4. Customize `Dockerfile` if needed
5. Add your own tests

## Example: Custom Standalone Module

```python
# modules/my_standalone/main.py
import typer
from shared.utils import setup_logging  # Minimal shared dependency

app = typer.Typer()

@app.command()
def process():
    logger = setup_logging()
    # Your standalone logic here
    pass
```

This approach gives you the best of both worlds: shared utilities when you need them, complete independence when you want it.