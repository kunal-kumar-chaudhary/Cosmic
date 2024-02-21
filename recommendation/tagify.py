import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.tag import pos_tag
from nltk.chunk import ne_chunk
import spacy
from pydantic import BaseModel
from typing import List
from fastapi import APIRouter
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity

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
    keywords = [word.lower() for word, _ in nltk.FreqDist(words).most_common(500)] # <- Change this value to see difference in similairy outputs, this decides the number of keywords

    # Combine named entities and keywords as tags
    tags = named_entities + keywords

    return tags

# Get Jaccard similarity
async def similarity(tags1, tags2):
    # Convert the tags into a set
    tags1_set = set(tags1)
    tags2_set = set(tags2)

    # Compute the cosine similarity
    similarity = len(tags1_set.intersection(tags2_set)) / float(len(tags1_set.union(tags2_set)))

    return similarity

# # Get Cosine Similarity
# async def get_cosine_similarity(blog1, blog2):
#     # Extract tags from both blogs
#     tags1 = await extract_tags(blog1)
#     tags2 = await extract_tags(blog2)

#     # Combine tags into sentences for vectorization
#     sentence1 = ' '.join(tags1)
#     sentence2 = ' '.join(tags2)

#     # Create TF-IDF vectorizer
#     vectorizer = TfidfVectorizer()

#     # Fit and transform the text data
#     tfidf_matrix = vectorizer.fit_transform([sentence1, sentence2])

#     # Calculate cosine similarity
#     cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

#     return cosine_sim[0, 1]


async def get_cosine_similarity(blog1, blog2):
    # tokenization 
    X_list = word_tokenize(blog1)  
    Y_list = word_tokenize(blog2) 
    
    # sw contains the list of stopwords 
    sw = stopwords.words('english')  
    l1 =[];l2 =[] 
    
    # remove stop words from the string 
    X_set = {w.lower() for w in X_list if not w in sw}  
    Y_set = {w.lower() for w in Y_list if not w in sw} 
    
    # form a set containing keywords of both strings.
    # Create binary vectors L1 and L2 representing the presence or absence of each word 
    # in the combined set of unique words from both Blogs  
    rvector = X_set.union(Y_set)  
    for w in rvector: 
        if w in X_set: l1.append(1) # create a vector 
        else: l1.append(0) 
        if w in Y_set: l2.append(1) 
        else: l2.append(0) 
    c = 0
    # print(l1)
    # print(l2)
    # cosine formula  
    for i in range(len(rvector)): 
            c+= l1[i]*l2[i] 
    return c / float((sum(l1)*sum(l2))**0.5)


# This is the object that is expected in the post request
# NOTE: the blogs may be multi-line, and it may contain newlines and double quotes that can potentially interfere with JSON parsing. 
# JSON should be a single-line string, and special characters need to be properly escaped.
class CreatedBlog(BaseModel):
    id: str
    content: str

class Blog(BaseModel):
    created_blog: CreatedBlog
    blog_list: List[CreatedBlog]

# Response Body
class Similarity(BaseModel):
    id : str
    # content: str
    similarity:float

class Resp(BaseModel):
    id: str
    similarities: List[Similarity]

router = APIRouter()

@router.post("/")
async def create_tags(input: Blog):
    # username = input.userName
    created_blog_data = input.created_blog
    blog_list = input.blog_list

    #to keep tags unique, use sets and reconvert to list
    # blog1_tags = await tagify.extract_tags(blog1_content)
    # blog2_tags = await tagify.extract_tags(blog2_content)
    # tags = list(set(tags))

    # print( "Tag1:" , set(blog1_tags))
    # print( "Tag2:" , set(blog2_tags))
    
    # jaccard_similarity = await tagify.similarity(blog1_tags, blog2_tags)
    # cosine_similarity1 = await tagify.get_cosine_similarity(blog1_content, blog2_content)
    resp = Resp(id=created_blog_data.id, similarities=[])
    for blog in blog_list:
        cosine_similarity = await get_cosine_similarity(created_blog_data.content, blog.content)
        
        similarity = Similarity(id=blog.id, similarity=cosine_similarity)

        resp.id = created_blog_data.id
        resp.similarities.append(similarity)
    
    # print(jaccard_similarity)
    # print(cosine_similarity1)
    print(cosine_similarity)
    
    return resp