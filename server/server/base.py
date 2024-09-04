
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv() 

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(url, key)

def fetch_rows_starting_with(number: str):
    try:
        number = str(number)
        response = (
            supabase.table("heu_question")
            .select("*")
            .like("text", f"{number}%")
            .execute()
        )

        if response.data:
            return response.data
        else:
            print("Query executed successfully, but no results were found.")
            return []

    except Exception as e:
        print(f"An error occurred: {e}")
        return []

