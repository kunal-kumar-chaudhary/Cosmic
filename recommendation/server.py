from fastapi import FastAPI
from pydantic import BaseModel
import tagify
from typing import List

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

app = FastAPI()


@app.post("/tagify/")
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
        cosine_similarity = await tagify.get_cosine_similarity(created_blog_data.content, blog.content)
        
        similarity = Similarity(id=blog.id, similarity=cosine_similarity)

        resp.id = created_blog_data.id
        resp.similarities.append(similarity)
    
    # print(jaccard_similarity)
    # print(cosine_similarity1)
    print(cosine_similarity)
    
    return resp
# {
#         # "User Name" : username,
#         # "Tags" : tags,
#         # "Jaccard_Similarity" : jaccard_similarity,
#         # "Cosine_Similarity1" : cosine_similarity1,
#         # "Cosine_Similarity" : cosine_similarity,

#     }