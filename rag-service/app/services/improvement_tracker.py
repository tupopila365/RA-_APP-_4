"""
Improvement tracking service for continuous chatbot enhancement.
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from collections import defaultdict, Counter
import asyncio
from app.services.cache import cache_service

logger = logging.getLogger(__name__)


class ImprovementTracker:
    """Track and analyze chatbot performance for continuous improvement."""
    
    def __init__(self):
        self.metrics_history = defaultdict(list)
        self.user_feedback = []
        self.content_gaps = defaultdict(int)
        self.question_patterns = Counter()
        
    async def track_response_quality(
        self,
        question: str,
        answer: str,
        sources: List[Dict[str, Any]],
        response_time: float,
        cached: bool = False
    ) -> Dict[str, float]:
        """Track response quality metrics."""
        
        try:
            # Calculate quality scores
            quality_scores = {
                'relevance_score': self._calculate_relevance_score(question, answer, sources),
                'completeness_score': self._calculate_completeness_score(question, answer),
                'clarity_score': self._calculate_clarity_score(answer),
                'source_confidence': self._calculate_source_confidence(sources),
                'response_time': response_time,
                'cached': cached
            }
            
            # Overall quality score
            quality_scores['overall_quality'] = (
                quality_scores['relevance_score'] * 0.3 +
                quality_scores['completeness_score'] * 0.25 +
                quality_scores['clarity_score'] * 0.25 +
                quality_scores['source_confidence'] * 0.2
            )
            
            # Store metrics
            timestamp = datetime.now()
            metric_entry = {
                'timestamp': timestamp.isoformat(),
                'question': question,
                'quality_scores': quality_scores,
                'question_category': self._categorize_question(question)
            }
            
            # Cache metrics for analysis
            cache_key = f"quality_metrics:{timestamp.strftime('%Y%m%d_%H%M%S')}"
            await asyncio.to_thread(
                cache_service.cache_context,
                question,
                [],  # No search results needed for this
                json.dumps(metric_entry),
                ttl=86400 * 7  # Keep for 7 days
            )
            
            logger.debug(f"Tracked response quality: {quality_scores['overall_quality']:.2f}")
            return quality_scores
            
        except Exception as e:
            logger.error(f"Error tracking response quality: {e}")
            return {}
    
    def _calculate_relevance_score(self, question: str, answer: str, sources: List[Dict]) -> float:
        """Calculate how relevant the answer is to the question."""
        
        # Simple keyword overlap method (could be enhanced with embeddings)
        question_words = set(question.lower().split())
        answer_words = set(answer.lower().split())
        
        # Remove common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'}
        question_words -= stop_words
        answer_words -= stop_words
        
        if not question_words:
            return 0.5  # Neutral score for empty question
        
        # Calculate overlap
        overlap = len(question_words & answer_words)
        relevance = overlap / len(question_words)
        
        # Boost score if high-confidence sources are used
        if sources:
            avg_source_relevance = sum(s.get('relevance', 0) for s in sources) / len(sources)
            relevance = (relevance + avg_source_relevance) / 2
        
        return min(relevance, 1.0)
    
    def _calculate_completeness_score(self, question: str, answer: str) -> float:
        """Calculate how completely the answer addresses the question."""
        
        # Check for question words and if they're addressed
        question_indicators = {
            'what': ['is', 'are', 'definition', 'means'],
            'how': ['steps', 'process', 'procedure', 'method'],
            'when': ['time', 'date', 'schedule', 'hours'],
            'where': ['location', 'address', 'office', 'place'],
            'why': ['because', 'reason', 'purpose'],
            'who': ['person', 'contact', 'responsible'],
            'which': ['option', 'choice', 'alternative']
        }
        
        question_lower = question.lower()
        answer_lower = answer.lower()
        
        completeness = 0.5  # Base score
        
        for q_word, indicators in question_indicators.items():
            if q_word in question_lower:
                # Check if answer contains relevant indicators
                if any(indicator in answer_lower for indicator in indicators):
                    completeness += 0.2
                break
        
        # Check answer length (longer answers often more complete)
        if len(answer) > 200:
            completeness += 0.1
        if len(answer) > 500:
            completeness += 0.1
        
        return min(completeness, 1.0)
    
    def _calculate_clarity_score(self, answer: str) -> float:
        """Calculate how clear and readable the answer is."""
        
        clarity = 0.5  # Base score
        
        # Check for good structure
        if '•' in answer or '-' in answer:  # Bullet points
            clarity += 0.2
        
        if any(str(i) + '.' in answer for i in range(1, 6)):  # Numbered lists
            clarity += 0.2
        
        # Check for clear formatting
        if '\n\n' in answer:  # Paragraph breaks
            clarity += 0.1
        
        # Penalize very long sentences (harder to read)
        sentences = answer.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
        
        if avg_sentence_length < 20:  # Good sentence length
            clarity += 0.1
        elif avg_sentence_length > 40:  # Too long
            clarity -= 0.1
        
        # Check for helpful elements
        if any(word in answer.lower() for word in ['phone:', 'email:', 'address:']):
            clarity += 0.1
        
        return min(clarity, 1.0)
    
    def _calculate_source_confidence(self, sources: List[Dict]) -> float:
        """Calculate confidence based on source quality."""
        
        if not sources:
            return 0.0
        
        # Average relevance of sources
        relevances = [s.get('relevance', 0) for s in sources]
        avg_relevance = sum(relevances) / len(relevances)
        
        # Boost if multiple high-quality sources
        high_quality_sources = sum(1 for r in relevances if r > 0.7)
        if high_quality_sources >= 2:
            avg_relevance += 0.1
        
        return min(avg_relevance, 1.0)
    
    def _categorize_question(self, question: str) -> str:
        """Categorize question for analysis."""
        
        question_lower = question.lower()
        
        categories = {
            'vehicle_registration': ['register', 'registration', 'vehicle', 'car'],
            'licenses': ['license', 'licence', 'driving', 'permit'],
            'plates': ['plate', 'number plate', 'pln', 'personalized'],
            'fees': ['cost', 'fee', 'price', 'pay', 'nad'],
            'locations': ['office', 'address', 'where', 'location'],
            'procedures': ['how', 'steps', 'process', 'procedure'],
            'requirements': ['need', 'require', 'document', 'bring'],
            'timing': ['when', 'time', 'hours', 'schedule']
        }
        
        for category, keywords in categories.items():
            if any(keyword in question_lower for keyword in keywords):
                return category
        
        return 'general'
    
    async def analyze_content_gaps(self, timeframe_days: int = 7) -> List[Dict[str, Any]]:
        """Analyze content gaps based on user questions."""
        
        try:
            # This would typically query a database of user interactions
            # For now, we'll simulate with cached data
            
            gaps = []
            
            # Common gap patterns (would be data-driven in production)
            potential_gaps = [
                {
                    'topic': 'Online payment methods',
                    'frequency': 15,
                    'coverage': 0.3,
                    'sample_questions': [
                        'Can I pay online?',
                        'What payment methods do you accept?',
                        'Is there an online portal?'
                    ]
                },
                {
                    'topic': 'Emergency vehicle procedures',
                    'frequency': 8,
                    'coverage': 0.1,
                    'sample_questions': [
                        'What if my car breaks down?',
                        'Emergency registration process',
                        'Temporary permits'
                    ]
                },
                {
                    'topic': 'International driving permits',
                    'frequency': 12,
                    'coverage': 0.4,
                    'sample_questions': [
                        'Can I drive with foreign license?',
                        'International driving permit',
                        'Tourist driving requirements'
                    ]
                }
            ]
            
            # Filter gaps that need attention (low coverage, high frequency)
            for gap in potential_gaps:
                if gap['coverage'] < 0.5 and gap['frequency'] > 5:
                    gaps.append(gap)
            
            # Sort by priority (frequency / coverage ratio)
            gaps.sort(key=lambda x: x['frequency'] / max(x['coverage'], 0.1), reverse=True)
            
            return gaps[:5]  # Top 5 gaps
            
        except Exception as e:
            logger.error(f"Error analyzing content gaps: {e}")
            return []
    
    async def generate_improvement_recommendations(self) -> List[Dict[str, Any]]:
        """Generate actionable improvement recommendations."""
        
        try:
            recommendations = []
            
            # Analyze content gaps
            content_gaps = await self.analyze_content_gaps()
            
            for gap in content_gaps[:3]:  # Top 3 gaps
                recommendations.append({
                    'type': 'content_gap',
                    'priority': 'high',
                    'title': f"Add content for '{gap['topic']}'",
                    'description': f"Users frequently ask about {gap['topic']} but coverage is only {gap['coverage']*100:.1f}%",
                    'action': f"Create comprehensive documentation covering: {', '.join(gap['sample_questions'][:2])}",
                    'impact': 'Reduce user frustration and improve answer accuracy'
                })
            
            # Performance recommendations (would be based on real metrics)
            recommendations.extend([
                {
                    'type': 'performance',
                    'priority': 'medium',
                    'title': 'Optimize response time for complex queries',
                    'description': 'Complex queries (>10 words) show 20% slower response times',
                    'action': 'Implement query complexity routing with different timeout thresholds',
                    'impact': 'Improve user experience for detailed questions'
                },
                {
                    'type': 'user_experience',
                    'priority': 'medium',
                    'title': 'Enhance quick reply suggestions',
                    'description': 'Only 25% of users use quick replies, suggesting low relevance',
                    'action': 'Implement machine learning for personalized suggestions',
                    'impact': 'Increase user engagement and conversation efficiency'
                }
            ])
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return []
    
    async def track_user_feedback(
        self,
        session_id: str,
        rating: int,
        categories: List[str],
        feedback_text: Optional[str] = None
    ) -> None:
        """Track user feedback for analysis."""
        
        try:
            feedback_entry = {
                'session_id': session_id,
                'rating': rating,
                'categories': categories,
                'feedback_text': feedback_text,
                'timestamp': datetime.now().isoformat()
            }
            
            # Cache feedback for analysis
            cache_key = f"user_feedback:{session_id}:{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            await asyncio.to_thread(
                cache_service.cache_context,
                f"feedback_{session_id}",
                [],
                json.dumps(feedback_entry),
                ttl=86400 * 30  # Keep for 30 days
            )
            
            logger.info(f"Tracked user feedback: rating={rating}, categories={len(categories)}")
            
        except Exception as e:
            logger.error(f"Error tracking user feedback: {e}")


# Global improvement tracker instance
improvement_tracker = ImprovementTracker()