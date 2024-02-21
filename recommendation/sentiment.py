import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.stem import PorterStemmer, WordNetLemmatizer
from pydantic import BaseModel
from typing import List, Tuple, Dict, Any
from fastapi import APIRouter

async def download_nltk_resources():
    nltk.download('punkt')
    nltk.download('wordnet')
    nltk.download('omw-1.4')
    nltk.download('vader_lexicon')

async def tokenize_text(text: str) -> Tuple[List[str], List[str]]:
    return nltk.word_tokenize(text), nltk.sent_tokenize(text)

async def stem_words(tokens: List[str]) -> List[str]:
    porter_stemmer = PorterStemmer()
    return [porter_stemmer.stem(token) for token in tokens]

async def lemmatize_words(tokens: List[str]) -> List[str]:
    lemmatizer = WordNetLemmatizer()
    return [lemmatizer.lemmatize(token) for token in tokens]

async def pos_tag_tokens(tokens: List[str]) -> List[Tuple[str, str]]:
    return nltk.pos_tag(tokens)

async def analyze_sentiment(text: str) -> Dict[str, float]:
    sid = SentimentIntensityAnalyzer()
    scores = sid.polarity_scores(text)
    return scores

class Blog_Sentiment(BaseModel):
    # pos_tags: List[Tuple[str, str]]
    scores: Dict[str, float]

async def get_sentiment(text: str) -> Blog_Sentiment:
    await download_nltk_resources()
    
    # Tokenization
    # word_tokens, sent_tokens = await tokenize_text(text)
    # print("Word tokens:", word_tokens)
    # print("Sentence tokens:", sent_tokens)
    
    # Stemming
    # stemmed_words = await stem_words(word_tokens)
    # print("Stemmed words:", stemmed_words)
    
    # Lemmatization
    # lemmatized_words = await lemmatize_words(word_tokens)
    # print("Lemmatized words:", lemmatized_words)
    
    # Part-of-speech tagging
    # pos_tags = await pos_tag_tokens(word_tokens)
    # print("POS tags:", pos_tags)
    
    # Sentiment analysis
    sentiment_scores = await analyze_sentiment(text)
    # blog_sentiment = Blog_Sentiment(pos_tags=pos_tags, scores=sentiment_scores)
    blog_sentiment = Blog_Sentiment(scores=sentiment_scores)
    
    return blog_sentiment


router = APIRouter()

# REQUEST BODY
class Comment(BaseModel):
    id: str  # username or id
    comment: str  # comment by user

class SentimentReq(BaseModel):
    comments_list: List[Comment]

# RESPONSE BODY
class Analysis(BaseModel):
    id: str
    analysis: Dict[str, Any] 

class SentimentRes(BaseModel):
    sentiment_list: List[Analysis]

@router.post("/")
async def sentiment_analysis(req: SentimentReq):
    comments_list = req.comments_list
    sentiment_list = []
    for comment_body in comments_list:
        id = comment_body.id
        comment = comment_body.comment
        sentiment_body = await get_sentiment(comment)
        analysis = Analysis(id=id, analysis=sentiment_body.dict())
        sentiment_list.append(analysis)
    sentiment_res = SentimentRes(sentiment_list=sentiment_list)
    return sentiment_res
