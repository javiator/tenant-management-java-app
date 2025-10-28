# Chat Bot Module

Interactive chat interface with multiple LLM providers.

## Features

- **Multi-provider support**: OpenAI, Anthropic, Google
- **Streaming responses**: Real-time response streaming
- **Conversation history**: Maintains chat context
- **Interactive CLI**: Rich terminal interface
- **Batch processing**: Process multiple prompts from files

## Usage

### Interactive Chat

```bash
# Basic chat with OpenAI
python -m modules.chat_bot.main chat

# Use specific model
python -m modules.chat_bot.main chat --model gpt-4-turbo

# Use Anthropic
python -m modules.chat_bot.main chat --provider anthropic --model claude-3-sonnet

# Custom system prompt
python -m modules.chat_bot.main chat --system "You are a helpful coding assistant"
```

### Batch Processing

```bash
# Process prompts from file
python -m modules.chat_bot.main batch prompts.txt --output results.json
```

## Configuration

Set environment variables in `.env`:

```bash
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
CHAT_BOT_MODEL=gpt-4
```

## Examples

### Basic Chat Session

```bash
$ python -m modules.chat_bot.main chat
🤖 LLM Chat Bot
Model: gpt-4
Provider: openai
Stream: True
Type 'quit' or 'exit' to end the session

👤 You: Hello! Can you help me with Python?
🤖 Assistant: Hello! I'd be happy to help you with Python! I can assist with:
- Writing and debugging Python code
- Explaining Python concepts
- Code optimization and best practices
- Library recommendations
- Project structure advice

What specific Python topic would you like help with?
```

### Custom System Prompt

```bash
$ python -m modules.chat_bot.main chat --system "You are a data science expert"
👤 You: What's the best way to handle missing data?
🤖 Assistant: There are several strategies for handling missing data in data science...
```

## API Usage

```python
from modules.chat_bot import ChatBot, ChatSession
from shared import LLMClientFactory, LLMProvider

# Create client
client = LLMClientFactory.create_from_settings()

# Create chat bot
chat_bot = ChatBot(
    client=client,
    model="gpt-4",
    system_prompt="You are a helpful assistant"
)

# Generate single response
response = await chat_bot.generate_response("Hello!")

# Start interactive session
await chat_bot.start_session()
```