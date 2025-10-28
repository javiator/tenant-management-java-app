# Module Independence Guide

This project supports both **shared libraries** and **standalone modules**. Each module can be as independent or as integrated as you need.

## Independence Levels

### 🟢 **Level 1: Fully Standalone**
Modules that only use minimal shared utilities and can run independently.

### 🟡 **Level 2: Lightweight Shared**
Modules that use shared configuration and utilities but have their own dependencies.

### 🔴 **Level 3: Full Integration**
Modules that heavily use shared components and benefit from the unified environment.

## Standalone Module Structure

For maximum independence, each module can have its own:

```
modules/your_standalone_module/
├── __init__.py
├── main.py                    # CLI entry point
├── core.py                    # Core business logic
├── config.py                  # Module-specific config
├── requirements.txt           # Module-specific dependencies
├── Dockerfile                 # Standalone container
├── README.md                  # Module documentation
└── tests/                     # Module-specific tests
    ├── test_core.py
    └── test_main.py
```

## Shared vs Standalone Examples

### Standalone Module Example
```python
# modules/standalone_app/main.py
import typer
from pathlib import Path

# Minimal shared dependencies
from shared.config import get_settings
from shared.utils import setup_logging

app = typer.Typer()

@app.command()
def run():
    """Standalone app that can run independently."""
    logger = setup_logging()
    settings = get_settings()
    
    # Module-specific logic here
    logger.info("Running standalone module")
```

### Lightweight Shared Module
```python
# modules/lightweight_module/main.py
import typer
from shared import get_settings, LLMClientFactory

app = typer.Typer()

@app.command()
def process():
    """Uses shared LLM client but has own logic."""
    settings = get_settings()
    client = LLMClientFactory.create_from_settings()
    
    # Module-specific processing
    result = process_with_llm(client)
    return result
```

### Full Integration Module
```python
# modules/integrated_module/main.py
import typer
from shared import *

app = typer.Typer()

@app.command()
def run():
    """Fully integrated with shared components."""
    # Uses all shared utilities
    pass
```

## Module Independence Patterns

### Pattern 1: Completely Standalone
- Own dependencies in `requirements.txt`
- Own Dockerfile
- Minimal shared imports
- Can be deployed separately

### Pattern 2: Shared Config, Own Logic
- Uses shared configuration
- Own business logic
- Shared utilities when needed
- Can run in unified environment

### Pattern 3: Shared Everything
- Uses all shared components
- Benefits from unified environment
- Easy to maintain consistency

## Benefits of This Approach

✅ **Flexibility**: Choose independence level per module
✅ **Reusability**: Share what makes sense
✅ **Maintainability**: Each module can evolve independently
✅ **Deployment**: Deploy modules separately or together
✅ **Development**: Teams can work on modules independently