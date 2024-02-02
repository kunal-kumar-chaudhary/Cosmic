import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.tag import pos_tag
from nltk.chunk import ne_chunk
import spacy

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')
nltk.download('maxent_ne_chunker')
nltk.download('words')

# Load spaCy model
nlp = spacy.load( 'en_core_web_sm' )

async def preprocess_text(text):
    # Tokenize the text into words
    words = word_tokenize(text)

    # Remove stopwords and punctuation
    stop_words = set(stopwords.words('english'))
    words = [word.lower() for word in words if word.isalnum() and word.lower() not in stop_words]

    return words

async def extract_named_entities(text):
    
    words = word_tokenize(text)
    pos_tags = pos_tag(words)

    # Use named entity recognition
    named_entities = ne_chunk(pos_tags)

    # Extract named entities
    entities = []
    for chunk in named_entities:
        if hasattr(chunk, 'label'):
            entities.append(' '.join(c[0] for c in chunk.leaves()))

    return entities

async def extract_tags(blog_text):
    # Preprocess the text
    words = await preprocess_text(blog_text)

    named_entities = await extract_named_entities(blog_text)

    # Extract keywords
    keywords = [word for word, _ in nltk.FreqDist(words).most_common(5)]

    # Combine named entities and keywords as tags
    tags = named_entities + keywords

    return tags

async def similarity(tags1, tags2):
    # Convert the tags into a set
    tags1_set = set(tags1)
    tags2_set = set(tags2)

    # Compute the cosine similarity
    similarity = len(tags1_set.intersection(tags2_set)) / float(len(tags1_set.union(tags2_set)))

    return similarity

