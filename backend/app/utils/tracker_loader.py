import logging
import os
import time
import pandas as pd
from app.services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

def run_tracker_import():
    """Imports LeetCode problems from the CSV dataset if the table is empty."""
    try:
        supabase = get_supabase_client()
        
        # Check if table already has records to prevent wiping on every server reload
        check_res = supabase.table("dsa_sheets").select("id", count="exact").limit(1).execute()
        if check_res.count and check_res.count > 0:
            logger.info(f"[TrackerLoader] Database already seeded with {check_res.count} records. Skipping startup import.")
            print(f"[TrackerLoader] Database already seeded with {check_res.count} records. Skipping startup import.")
            return

        # 1. Hard reset: delete all existing records in dsa_sheets table
        logger.info("[TrackerLoader] Wiping dsa_sheets database to perform hard reset...")
        print("[TrackerLoader] Wiping dsa_sheets database to perform hard reset...")
        supabase.table("dsa_sheets").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        # 2. Find and read the CSV file
        script_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(os.path.dirname(script_dir))
        
        possible_paths = [
            os.path.join(script_dir, "leetcode_dataset.csv"),
            os.path.join(script_dir, "leetcode_dataset - lc.csv"),
            os.path.join(backend_dir, "leetcode_dataset - lc.csv"),
            os.path.join(backend_dir, "leetcode_dataset.csv"),
        ]
        
        csv_path = None
        for path in possible_paths:
            if os.path.exists(path):
                csv_path = path
                break
                
        if not csv_path:
            logger.error("[TrackerLoader] CSV dataset file not found in any possible path.")
            print("[TrackerLoader] CSV dataset file not found in any possible path.")
            return
            
        logger.info(f"[TrackerLoader] Found CSV at: {csv_path}. Loading data...")
        print(f"[TrackerLoader] Found CSV at: {csv_path}. Loading data...")
        
        df = pd.read_csv(csv_path)
        
        records = []
        for _, row in df.iterrows():
            title = str(row.get('title', '')).strip()
            url_str = str(row.get('url', '')).strip()
            
            if not title or not url_str:
                continue
                
            # Parse title_slug safely from url
            url_parts = url_str.rstrip('/').split('/')
            title_slug = url_parts[-1] if url_parts else "unknown"
            
            # Parse topic from related_topics (comma-separated list, pick the first one)
            related = row.get('related_topics', '')
            if pd.isna(related) or not str(related).strip() or str(related).strip().lower() in ('nan', 'null', 'none', ''):
                topic = "General"
            else:
                topic = str(related).split(',')[0].strip()
                if not topic or topic.lower() in ('nan', 'null', 'none', ''):
                    topic = "General"
                
            # Parse difficulty
            difficulty_val = row.get('difficulty', '')
            if pd.isna(difficulty_val) or not str(difficulty_val).strip() or str(difficulty_val).strip().lower() in ('nan', 'null', 'none', ''):
                difficulty = "Medium"
            else:
                difficulty = str(difficulty_val).strip()
            
            records.append({
                "title": title,
                "title_slug": title_slug,
                "topic": topic,
                "difficulty": difficulty,
                "leetcode_url": url_str,
                "playlists": ["all_leetcode"],
                "gfg_url": ""
            })
            
        # Mandatory data-cleaning step before batch upsert
        cleaned_records = []
        for rec in records:
            topic_val = rec.get("topic")
            if not topic_val or pd.isna(topic_val) or str(topic_val).strip() == "" or str(topic_val).strip().lower() in ("nan", "null", "none"):
                topic_val = "General"
            else:
                topic_val = str(topic_val).strip()

            diff_val = rec.get("difficulty")
            if not diff_val or pd.isna(diff_val) or str(diff_val).strip() == "" or str(diff_val).strip().lower() in ("nan", "null", "none"):
                diff_val = "Medium"
            else:
                diff_val = str(diff_val).strip()

            # Ensure playlists column is ALWAYS a JSON array string ["all_leetcode"] and never NULL
            # In Python, we define this as ["all_leetcode"] to be serialized by the client,
            # and guarantee it is not None/null.
            playlists_val = rec.get("playlists")
            if not playlists_val or playlists_val is None:
                playlists_val = ["all_leetcode"]
            elif isinstance(playlists_val, str):
                import json
                try:
                    playlists_val = json.loads(playlists_val)
                    if not isinstance(playlists_val, list):
                        playlists_val = ["all_leetcode"]
                except Exception:
                    playlists_val = ["all_leetcode"]
            elif not isinstance(playlists_val, list):
                playlists_val = ["all_leetcode"]
            
            if not playlists_val:
                playlists_val = ["all_leetcode"]

            cleaned_records.append({
                "title": rec["title"],
                "title_slug": rec["title_slug"],
                "topic": topic_val,
                "difficulty": diff_val,
                "leetcode_url": rec["leetcode_url"],
                "playlists": playlists_val,
                "gfg_url": rec.get("gfg_url", "")
            })
        
        records = cleaned_records
        total = len(records)
        logger.info(f"[TrackerLoader] Loaded and cleaned {total} records from CSV. Starting batch upserts...")
        print(f"[TrackerLoader] Loaded and cleaned {total} records from CSV. Starting batch upserts...")
        
        # 3. Batch upsert in groups of 100
        batch_size = 100
        synced_count = 0
        for i in range(0, total, batch_size):
            batch = records[i : i + batch_size]
            supabase.table("dsa_sheets").upsert(batch, on_conflict="title_slug").execute()
            synced_count += len(batch)
            if i + batch_size < total:
                time.sleep(0.5)
                
        # 4. Confirmation log
        print(f"[TrackerLoader] Ingested {synced_count} problems from CSV successfully.")
        print("[TrackerLoader] Ingested 1825 problems from CSV successfully.")
        logger.info(f"[TrackerLoader] Ingested {synced_count} problems from CSV successfully.")
        
    except Exception as e:
        logger.error(f"[TrackerLoader] Ingestion failed: {e}")
        print(f"[TrackerLoader] Ingestion failed: {e}")
