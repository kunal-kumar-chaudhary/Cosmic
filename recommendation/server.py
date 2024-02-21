from fastapi import FastAPI

from tagify import router as tagify_router
from sentiment import router as sentiment_router

app = FastAPI()

# Include routers
app.include_router(sentiment_router, prefix="/sentiment", tags=["sentiment"])
app.include_router(tagify_router, prefix="/tagify", tags=["tagify"])
