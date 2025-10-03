# LLM Modules Collection

A unified collection of LLM mini-modules with shared UV environment management.

## Project Structure

```
llm-modules/
├── pyproject.toml              # Root UV configuration
├── README.md                   # This file
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── shared/                     # Shared utilities and components
│   ├── __init__.py
│   ├── config.py              # Configuration management
│   ├── llm_clients.py         # LLM client abstractions
│   ├── utils.py               # Common utilities
│   └── types.py               # Shared type definitions
├── modules/                    # Individual LLM mini-modules
│   ├── __init__.py
│   ├── chat_bot/              # Chat bot module
│   ├── text_analyzer/         # Text analysis module
│   ├── code_generator/        # Code generation module
│   ├── document_processor/    # Document processing module
│   └── api_wrapper/           # API wrapper module
├── tests/                      # Test suite
│   ├── __init__.py
│   ├── test_shared/
│   └── test_modules/
├── scripts/                    # Utility scripts
│   ├── setup.py               # Environment setup
│   └── deploy.py              # Deployment utilities
└── docs/                      # Documentation
    ├── index.md
    ├── modules/
    └── api/
```

## Quick Start

1. **Install UV** (if not already installed):
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Setup environment**:
   ```bash
   cd llm-modules
   uv sync
   ```

3. **Activate environment**:
   ```bash
   uv shell
   ```

4. **Run a module**:
   ```bash
   python -m modules.chat_bot.main
   ```

## Environment Variables

Copy `.env.example` to `.env` and configure your API keys:

```bash
cp .env.example .env
```

## Available Modules

- **Chat Bot**: Interactive chat interface with multiple LLM providers
- **Text Analyzer**: Text analysis, sentiment, and content processing
- **Code Generator**: Code generation and documentation tools
- **Document Processor**: PDF, text, and document processing
- **API Wrapper**: RESTful API wrapper for LLM services

## Development

- **Install dev dependencies**: `uv sync --dev`
- **Run tests**: `uv run pytest`
- **Format code**: `uv run black .`
- **Lint code**: `uv run flake8 .`
- **Type check**: `uv run mypy .`

## Adding New Modules

1. Create a new directory in `modules/`
2. Add `__init__.py` and `main.py`
3. Implement your module following the shared patterns
4. Add tests in `tests/test_modules/`
5. Update this README

## Architecture

Each module follows a consistent structure:
- `main.py`: Entry point and CLI interface
- `core.py`: Core business logic
- `config.py`: Module-specific configuration
- `utils.py`: Module-specific utilities
- `README.md`: Module documentation