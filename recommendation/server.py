from fastapi import FastAPI
from pydantic import BaseModel
import tagify

# This is the object that is expected in the post request
# NOTE: the blogs may be multi-line, and it may contain newlines and double quotes that can potentially interfere with JSON parsing. 
# JSON should be a single-line string, and special characters need to be properly escaped.
class Blog(BaseModel):
    blog1: str
    blog2: str

blogtest = Blog()
blogtest.blog1 = "I love to eat apples. I love to eat bananas. I love to eat oranges."
blogtest.blog2 = "I love to eat apples. I love to eat bananas. I love to eat oranges."
print(blogtest.blog1)
app = FastAPI()


@app.post("/tagify/")
async def create_tags(input: Blog):
    blog1_content = input.blog1
    blog2_content = input.blog2

    #to keep tags unique, use sets and reconvert to list
    tags1 = await tagify.extract_tags(blog1_content)
    tags2 = await tagify.extract_tags(blog2_content)

    tags1_list = list(set(tags1))
    tags2_list = list(set(tags2))

    print(tags1_list)
    print(tags2_list)

    # vectorize and compute the cosine similiarity between two tags vector
    return {
        "tags1": tags1_list,
        "tags2": tags2_list,
        "similarity": tagify.similarity(tags1_list, tags2_list)
    }