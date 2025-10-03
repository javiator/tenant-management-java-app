"""
Text analyzer core functionality.
"""

import asyncio
import re
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..shared import LLMRequest, LLMResponse, AnalysisResult, setup_logging


class SentimentAnalyzer:
    """Sentiment analysis using LLM."""
    
    def __init__(self, client, model: str = "gpt-4"):
        self.client = client
        self.model = model
        self.logger = setup_logging(module_name="sentiment_analyzer")
    
    async def analyze(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text."""
        prompt = f"""
Analyze the sentiment of the following text and provide:
1. Overall sentiment (positive, negative, neutral)
2. Confidence score (0-1)
3. Key emotional indicators

Text: {text}

Respond in JSON format:
{{
    "sentiment": "positive/negative/neutral",
    "confidence": 0.85,
    "indicators": ["joy", "excitement", "satisfaction"]
}}
"""
        
        request = LLMRequest(
            prompt=prompt,
            model=self.model,
            temperature=0.3,
            max_tokens=500
        )
        
        response = await self.client.generate(request)
        
        try:
            import json
            result = json.loads(response.content)
            return result
        except json.JSONDecodeError:
            self.logger.warning("Failed to parse sentiment JSON response")
            return {"sentiment": "neutral", "confidence": 0.5, "indicators": []}


class EntityExtractor:
    """Named entity extraction using LLM."""
    
    def __init__(self, client, model: str = "gpt-4"):
        self.client = client
        self.model = model
        self.logger = setup_logging(module_name="entity_extractor")
    
    async def extract(self, text: str) -> List[str]:
        """Extract named entities from text."""
        prompt = f"""
Extract all named entities from the following text. Include:
- Person names
- Organization names
- Location names
- Product names
- Important dates
- Other significant entities

Text: {text}

Return only a comma-separated list of entities, no explanations.
"""
        
        request = LLMRequest(
            prompt=prompt,
            model=self.model,
            temperature=0.3,
            max_tokens=1000
        )
        
        response = await self.client.generate(request)
        
        # Parse entities from response
        entities = [entity.strip() for entity in response.content.split(',')]
        entities = [entity for entity in entities if entity and len(entity) > 1]
        
        return entities


class TopicExtractor:
    """Topic extraction using LLM."""
    
    def __init__(self, client, model: str = "gpt-4"):
        self.client = client
        self.model = model
        self.logger = setup_logging(module_name="topic_extractor")
    
    async def extract(self, text: str) -> List[str]:
        """Extract main topics from text."""
        prompt = f"""
Identify the main topics and themes in the following text. Return 3-5 key topics.

Text: {text}

Return only a comma-separated list of topics, no explanations.
"""
        
        request = LLMRequest(
            prompt=prompt,
            model=self.model,
            temperature=0.3,
            max_tokens=500
        )
        
        response = await self.client.generate(request)
        
        # Parse topics from response
        topics = [topic.strip() for topic in response.content.split(',')]
        topics = [topic for topic in topics if topic and len(topic) > 1]
        
        return topics


class TextAnalyzer:
    """Main text analyzer class."""
    
    def __init__(self, client, model: str = "gpt-4", temperature: float = 0.3):
        self.client = client
        self.model = model
        self.temperature = temperature
        self.logger = setup_logging(module_name="text_analyzer")
        
        # Initialize components
        self.sentiment_analyzer = SentimentAnalyzer(client, model)
        self.entity_extractor = EntityExtractor(client, model)
        self.topic_extractor = TopicExtractor(client, model)
    
    async def analyze_text(
        self,
        text: str,
        analyze_sentiment: bool = True,
        extract_entities: bool = True,
        extract_topics: bool = True,
        generate_summary: bool = True,
        detect_language: bool = True
    ) -> AnalysisResult:
        """Perform comprehensive text analysis."""
        
        # Clean and prepare text
        text = self._clean_text(text)
        
        if not text.strip():
            return AnalysisResult()
        
        # Run analysis tasks
        tasks = []
        
        if analyze_sentiment:
            tasks.append(self._analyze_sentiment(text))
        else:
            tasks.append(asyncio.create_task(asyncio.coroutine(lambda: None)()))
        
        if extract_entities:
            tasks.append(self._extract_entities(text))
        else:
            tasks.append(asyncio.create_task(asyncio.coroutine(lambda: [])()))
        
        if extract_topics:
            tasks.append(self._extract_topics(text))
        else:
            tasks.append(asyncio.create_task(asyncio.coroutine(lambda: [])()))
        
        if generate_summary:
            tasks.append(self._generate_summary(text))
        else:
            tasks.append(asyncio.create_task(asyncio.coroutine(lambda: None)()))
        
        if detect_language:
            tasks.append(self._detect_language(text))
        else:
            tasks.append(asyncio.create_task(asyncio.coroutine(lambda: None)()))
        
        # Wait for all tasks to complete
        results = await asyncio.gather(*tasks)
        
        sentiment_result, entities, topics, summary, language = results
        
        # Extract sentiment and confidence
        sentiment = None
        confidence = None
        if sentiment_result:
            sentiment = sentiment_result.get('sentiment')
            confidence = sentiment_result.get('confidence')
        
        return AnalysisResult(
            sentiment=sentiment,
            entities=entities,
            topics=topics,
            summary=summary,
            language=language,
            confidence=confidence
        )
    
    async def _analyze_sentiment(self, text: str) -> Optional[Dict[str, Any]]:
        """Analyze sentiment of text."""
        try:
            return await self.sentiment_analyzer.analyze(text)
        except Exception as e:
            self.logger.error(f"Sentiment analysis error: {e}")
            return None
    
    async def _extract_entities(self, text: str) -> List[str]:
        """Extract entities from text."""
        try:
            return await self.entity_extractor.extract(text)
        except Exception as e:
            self.logger.error(f"Entity extraction error: {e}")
            return []
    
    async def _extract_topics(self, text: str) -> List[str]:
        """Extract topics from text."""
        try:
            return await self.topic_extractor.extract(text)
        except Exception as e:
            self.logger.error(f"Topic extraction error: {e}")
            return []
    
    async def _generate_summary(self, text: str) -> Optional[str]:
        """Generate summary of text."""
        try:
            prompt = f"""
Summarize the following text in 2-3 sentences, capturing the main points:

{text}
"""
            
            request = LLMRequest(
                prompt=prompt,
                model=self.model,
                temperature=self.temperature,
                max_tokens=300
            )
            
            response = await self.client.generate(request)
            return response.content.strip()
            
        except Exception as e:
            self.logger.error(f"Summary generation error: {e}")
            return None
    
    async def _detect_language(self, text: str) -> Optional[str]:
        """Detect language of text."""
        try:
            prompt = f"""
Detect the language of the following text. Return only the language name in English:

{text[:500]}
"""
            
            request = LLMRequest(
                prompt=prompt,
                model=self.model,
                temperature=0.1,
                max_tokens=50
            )
            
            response = await self.client.generate(request)
            return response.content.strip()
            
        except Exception as e:
            self.logger.error(f"Language detection error: {e}")
            return None
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text."""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove control characters
        text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
        return text.strip()