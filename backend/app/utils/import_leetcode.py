import os
import sys
import pandas as pd
import time

# Add backend directory to sys.path to allow imports when run directly
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(os.path.dirname(current_dir))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.supabase_client import get_supabase_client

def run_import():
    try:
        supabase = get_supabase_client()
        
        # 1. Fetch all existing title_slugs to avoid duplicates
        print("Fetching existing records from DB to find duplicates...")
        existing_slugs = set()
        
        # Pagination to get all slugs
        page_size = 1000
        offset = 0
        while True:
            response = supabase.table("dsa_sheets").select("title_slug").order("id").range(offset, offset + page_size - 1).execute()
            data = response.data
            if not data:
                break
            for row in data:
                existing_slugs.add(row["title_slug"])
            offset += len(data)
            if len(data) < page_size:
                break
                
        print(f"Found {len(existing_slugs)} existing problems in the database.")
        
        # 2. Read Leetcode.csv
        csv_path = os.path.join(backend_dir, "Leetcode.csv")
            
        print(f"Reading CSV from {csv_path}...")
        df = pd.read_csv(csv_path)
        
        # 3. Process and filter
        records_to_insert = []
        
        for _, row in df.iterrows():
            title = str(row.get('Title', '')).strip()
            url_str = str(row.get('Link', '')).strip()
            
            if not title or title.lower() == 'nan' or not url_str or url_str.lower() == 'nan':
                continue
                
            url_parts = url_str.rstrip('/').split('/')
            title_slug = url_parts[-1] if url_parts else "unknown"
            
            if title_slug in existing_slugs:
                continue  # skip duplicate
                
            # Add to existing slugs so we don't insert duplicate from the CSV itself
            existing_slugs.add(title_slug)
            
            related = row.get('Topics', '')
            if pd.isna(related) or not str(related).strip() or str(related).strip().lower() in ('nan', 'null', 'none', ''):
                topic = "General"
            else:
                topic = str(related).split(',')[0].strip()
                if not topic or topic.lower() in ('nan', 'null', 'none', ''):
                    topic = "General"
                    
            difficulty_val = row.get('Difficulty', '')
            if pd.isna(difficulty_val) or not str(difficulty_val).strip() or str(difficulty_val).strip().lower() in ('nan', 'null', 'none', ''):
                difficulty = "Medium"
            else:
                difficulty = str(difficulty_val).strip()
                
            records_to_insert.append({
                "title": title,
                "title_slug": title_slug,
                "topic": topic,
                "difficulty": difficulty,
                "leetcode_url": url_str,
                "playlists": ["all_leetcode"],
                "gfg_url": ""
            })
            
        print(f"Found {len(records_to_insert)} NEW unique problems to insert.")
        
        if len(records_to_insert) == 0:
            print("No new records to insert. Exiting.")
            return
            
        # 4. Batch insert
        batch_size = 100
        inserted_count = 0
        for i in range(0, len(records_to_insert), batch_size):
            batch = records_to_insert[i : i + batch_size]
            supabase.table("dsa_sheets").insert(batch).execute()
            inserted_count += len(batch)
            print(f"Inserted {inserted_count}/{len(records_to_insert)}...")
            time.sleep(0.5)
            
        print(f"Successfully inserted {inserted_count} new problems.")
    
    except Exception as e:
        print(f"Error during import: {e}")

if __name__ == "__main__":
    run_import()
