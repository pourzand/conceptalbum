import spotipy
from spotipy.oauth2 import SpotifyOAuth
from langchain_community.llms import HuggingFaceHub, HuggingFaceEndpoint
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# question = "Provided the following list of artists, Can you please provide a brief summary of all of them "

# template = """Question: {question}

# Answer: Let's think step by step."""

# prompt = PromptTemplate.from_template(template)

# import os
# from dotenv import load_dotenv

# Load environment variables
# load_dotenv()

# Spotify API credentials
# SPOTIPY_CLIENT_ID = os.getenv('SPOTIPY_CLIENT_ID')
SPOTIPY_CLIENT_ID = '0dd435f3ccc940f4a8311a13c458b279'

# SPOTIPY_CLIENT_SECRET = os.getenv('SPOTIPY_CLIENT_SECRET')
SPOTIPY_CLIENT_SECRET = '2f43b3f46b4f4966b2dacd067a58cffe'

# SPOTIPY_REDIRECT_URI = os.getenv('SPOTIPY_REDIRECT_URI')
SPOTIPY_REDIRECT_URI = 'http://localhost:8880/callback'


# HuggingFace API token
# HUGGINGFACEHUB_API_TOKEN = os.getenv('HUGGINGFACEHUB_API_TOKEN')
# HUGGINGFACEHUB_API_TOKEN = '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' # t5
HUGGINGFACEHUB_API_TOKEN = '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'

# Spotify authentication
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=SPOTIPY_CLIENT_ID,
                                               client_secret=SPOTIPY_CLIENT_SECRET,
                                               redirect_uri=SPOTIPY_REDIRECT_URI,
                                               scope="user-top-read"))

# Get top 5 artists
results = sp.current_user_top_artists(time_range='short_term', limit=5)

# Initialize HuggingFaceHub LLM
# llm = HuggingFaceHub(repo_id="google/flan-t5-small", 
#                      model_kwargs={"temperature": 0.5, "max_length": 64},
#                      huggingfacehub_api_token=HUGGINGFACEHUB_API_TOKEN)

# Create a prompt template
question = """Provide a brief summary of the music artist {artist_name} in 2-3 sentences."""
template = """Question: {question}"""
prompt = PromptTemplate(template=template, input_variables=["artist_name"])

repo_id = "mistralai/Mistral-7B-Instruct-v0.2"

llm = HuggingFaceEndpoint(
    repo_id=repo_id, max_length=128, temperature=0.5, token=HUGGINGFACEHUB_API_TOKEN
)
llm_chain = LLMChain(prompt=prompt, llm=llm)
# print(llm_chain.run(question))

# old
# Create an LLMChain
# chain = LLMChain(llm=llm, prompt=prompt)



# Process each artist
for i, item in enumerate(results['items']):
    artist_name = item['name']
    print(f"\nTop Artist #{i+1}: {artist_name}")
    
    # old
    # Generate summary
    summary = llm_chain.run(artist_name)

    # new
    print(llm_chain.run(question))

    print(f"Summary: {summary}")

print("\nDone!")