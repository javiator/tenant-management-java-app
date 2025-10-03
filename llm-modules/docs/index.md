# LLM Modules Documentation

Welcome to the LLM Modules documentation! This collection provides a unified environment for multiple LLM mini-modules with shared utilities and configuration.

## Quick Start

1. **Install UV** (if not already installed):
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Setup the environment**:
   ```bash
   cd llm-modules
   python scripts/setup.py
   ```

3. **Activate the environment**:
   ```bash
   uv shell
   ```

4. **Run a module**:
   ```bash
   python -m modules.chat_bot.main chat
   ```

## Available Modules

### 🤖 Chat Bot
Interactive chat interface with multiple LLM providers.

**Features:**
- Multi-provider support (OpenAI, Anthropic, Google)
- Streaming responses
- Conversation history
- Batch processing

**Usage:**
```bash
python -m modules.chat_bot.main chat --model gpt-4
```

### 📊 Text Analyzer
Text analysis and content processing.

**Features:**
- Sentiment analysis
- Entity extraction
- Topic extraction
- Language detection
- Text summarization

**Usage:**
```bash
python -m modules.text_analyzer.main analyze --text "Your text here"
```

### 💻 Code Generator
Automated code generation and documentation.

**Features:**
- Code generation from descriptions
- Code refactoring
- Code explanation
- Unit test generation
- Documentation generation

**Usage:**
```bash
python -m modules.code_generator.main generate "Create a Python function to calculate fibonacci"
```

## Configuration

### Environment Variables

Create a `.env` file with your API keys:

```bash
# LLM API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# Application Settings
LOG_LEVEL=INFO
DEBUG=false
MAX_TOKENS=4000
TEMPERATURE=0.7

# Module-specific settings
CHAT_BOT_MODEL=gpt-4
TEXT_ANALYZER_MODEL=claude-3-sonnet
CODE_GENERATOR_MODEL=gpt-4-turbo
```

### Module Configuration

Each module can be configured independently:

```python
from modules.shared.config import get_module_config

# Get chat bot configuration
chat_config = get_module_config('chat_bot')
print(chat_config['model'])  # gpt-4
```

## Architecture

### Project Structure

```
llm-modules/
├── shared/                     # Shared utilities
│   ├── config.py              # Configuration management
│   ├── llm_clients.py         # LLM client abstractions
│   ├── types.py               # Type definitions
│   └── utils.py               # Common utilities
├── modules/                   # Individual modules
│   ├── chat_bot/              # Chat bot module
│   ├── text_analyzer/         # Text analysis module
│   └── code_generator/        # Code generation module
├── tests/                      # Test suite
├── scripts/                   # Utility scripts
└── docs/                      # Documentation
```

### Shared Components

- **Configuration Management**: Centralized settings with environment variable support
- **LLM Clients**: Unified interface for different LLM providers
- **Type Definitions**: Shared data structures and types
- **Utilities**: Common helper functions

## Development

### Adding New Modules

1. Create a new directory in `modules/`
2. Add `__init__.py` and `main.py`
3. Implement your module following the shared patterns
4. Add tests in `tests/test_modules/`
5. Update documentation

### Module Structure

Each module should follow this structure:

```python
# modules/your_module/__init__.py
from .main import YourModule
from .core import YourCore

__all__ = ["YourModule", "YourCore"]

# modules/your_module/main.py
import typer
from ..shared import get_settings, LLMClientFactory

app = typer.Typer()

@app.command()
def your_command():
    """Your command implementation."""
    pass

if __name__ == "__main__":
    app()

# modules/your_module/core.py
class YourModule:
    """Your module implementation."""
    pass
```

### Testing

Run the test suite:

```bash
uv run pytest
```

Run specific tests:

```bash
uv run pytest tests/test_modules/test_chat_bot.py
```

### Code Quality

Format code:

```bash
uv run black .
uv run isort .
```

Lint code:

```bash
uv run flake8 .
uv run mypy .
```

## Deployment

### Docker

Build and run with Docker:

```bash
python scripts/deploy.py --provider docker
docker run -p 8000:8000 llm-modules
```

### Cloud Deployment

Deploy to cloud providers:

```bash
# AWS
python scripts/deploy.py --provider aws

# Google Cloud
python scripts/deploy.py --provider gcp

# Azure
python scripts/deploy.py --provider azure
```

## API Reference

### Shared Types

- `LLMRequest`: Standard request structure
- `LLMResponse`: Standard response structure
- `AnalysisResult`: Text analysis results
- `CodeGenerationRequest`: Code generation parameters

### Shared Utilities

- `setup_logging()`: Configure logging
- `format_response()`: Format responses
- `validate_api_key()`: Validate API keys
- `chunk_text()`: Split text into chunks

### LLM Clients

- `OpenAIClient`: OpenAI API client
- `AnthropicClient`: Anthropic API client
- `LLMClientFactory`: Factory for creating clients

## Examples

### Basic Chat Session

```python
from modules.chat_bot import ChatBot
from modules.shared import LLMClientFactory

# Create client
client = LLMClientFactory.create_from_settings()

# Create chat bot
chat_bot = ChatBot(client=client, model="gpt-4")

# Generate response
response = await chat_bot.generate_response("Hello!")
print(response)
```

### Text Analysis

```python
from modules.text_analyzer import TextAnalyzer
from modules.shared import LLMClientFactory

# Create analyzer
client = LLMClientFactory.create_from_settings()
analyzer = TextAnalyzer(client=client)

# Analyze text
result = await analyzer.analyze_text("This is a great product!")
print(f"Sentiment: {result.sentiment}")
print(f"Entities: {result.entities}")
```

### Code Generation

```python
from modules.code_generator import CodeGenerator
from modules.shared import LLMClientFactory, CodeGenerationRequest

# Create generator
client = LLMClientFactory.create_from_settings()
generator = CodeGenerator(client=client)

# Generate code
request = CodeGenerationRequest(
    description="Create a Python function to calculate fibonacci",
    language="python",
    include_tests=True
)
code = await generator.generate_code(request)
print(code)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.