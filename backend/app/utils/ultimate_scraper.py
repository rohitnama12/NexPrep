import logging
import time
import requests
from app.services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

LEETCODE_PROBLEMS_URL = "https://raw.githubusercontent.com/alfaarghya/alfa-leetcode-api/main/src/problems.json"
# Fallback URLs in case the primary one changes
FALLBACK_URLS = [
    "https://raw.githubusercontent.com/alfaarghya/alfa-leetcode-api/main/src/problems.json",
    "https://raw.githubusercontent.com/alfa-leetcode-api/alfa-leetcode-api/master/data/problems.json",
]

BATCH_SIZE = 100
SLEEP_BETWEEN_BATCHES = 0.5  # seconds


def fetch_leetcode_json() -> list:
    """Try multiple URLs to get the LeetCode problems JSON dump."""
    all_urls = [LEETCODE_PROBLEMS_URL] + FALLBACK_URLS
    seen = set()
    for url in all_urls:
        if url in seen:
            continue
        seen.add(url)
        try:
            logger.info(f"[UltimateScraper] Trying: {url}")
            resp = requests.get(url, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                # Handle both array and nested object formats
                if isinstance(data, list):
                    logger.info(f"[UltimateScraper] Got {len(data)} problems from {url}")
                    return data
                elif isinstance(data, dict):
                    # Some versions nest under 'problemsetQuestionList' or 'data'
                    for key in ['problemsetQuestionList', 'data', 'questions', 'problems', 'stat_status_pairs']:
                        if key in data and isinstance(data[key], list):
                            logger.info(f"[UltimateScraper] Got {len(data[key])} problems via key '{key}' from {url}")
                            return data[key]
                    # If it's a dict of items, try to extract values
                    values = list(data.values())
                    if values and isinstance(values[0], dict):
                        logger.info(f"[UltimateScraper] Got {len(values)} problems from dict values at {url}")
                        return values
            else:
                logger.warning(f"[UltimateScraper] HTTP {resp.status_code} from {url}")
        except Exception as e:
            logger.warning(f"[UltimateScraper] Failed to fetch from {url}: {e}")

    logger.error("[UltimateScraper] All URLs exhausted. No data fetched.")
    return []


def normalize_difficulty(raw: str) -> str:
    """Normalize difficulty strings to our standard format."""
    raw_lower = (raw or "").strip().lower()
    if raw_lower in ("easy", "1"):
        return "Easy"
    elif raw_lower in ("medium", "2"):
        return "Medium"
    elif raw_lower in ("hard", "3"):
        return "Hard"
    return "Medium"  # Safe default


def map_topic_from_tags(tags: list) -> str:
    """Extract the most relevant topic from LeetCode tags."""
    if not tags:
        return "General"

    topic_priority = [
        "Array", "String", "Hash Table", "Dynamic Programming", "Math",
        "Sorting", "Greedy", "Depth-First Search", "Binary Search",
        "Breadth-First Search", "Tree", "Matrix", "Bit Manipulation",
        "Two Pointers", "Stack", "Heap (Priority Queue)", "Graph",
        "Linked List", "Sliding Window", "Backtracking", "Divide and Conquer",
        "Trie", "Recursion", "Segment Tree", "Union Find",
    ]

    # tags can be list of strings or list of dicts with 'name' key
    tag_names = []
    for t in tags:
        if isinstance(t, str):
            tag_names.append(t)
        elif isinstance(t, dict):
            tag_names.append(t.get("name", t.get("slug", "")))

    for priority_topic in topic_priority:
        for tag in tag_names:
            if tag.lower() == priority_topic.lower():
                return priority_topic

    return tag_names[0] if tag_names else "General"


def transform_problem(item: dict) -> dict:
    """Transform a raw LeetCode API problem into our dsa_sheets schema."""
    # Handle various JSON formats
    title = item.get("title") or item.get("stat", {}).get("question__title", "")
    title_slug = (
        item.get("titleSlug")
        or item.get("stat", {}).get("question__title_slug", "")
        or item.get("title_slug", "")
    )

    if not title_slug:
        return None

    # Difficulty
    raw_difficulty = item.get("difficulty", "")
    if isinstance(raw_difficulty, dict):
        raw_difficulty = raw_difficulty.get("level", "2")
    raw_difficulty = str(raw_difficulty)
    difficulty = normalize_difficulty(raw_difficulty)

    # Topic from tags
    tags = item.get("topicTags", []) or item.get("tags", [])
    topic = map_topic_from_tags(tags)

    return {
        "title": title,
        "title_slug": title_slug,
        "topic": topic,
        "difficulty": difficulty,
        "playlists": ["all_leetcode"],
        "leetcode_url": f"https://leetcode.com/problems/{title_slug}/",
        "gfg_url": None,
    }


def run_ultimate_import():
    """
    Fetch 3000+ LeetCode problems from a public JSON dump and upsert
    them into the dsa_sheets table in batches.
    """
    try:
        raw_data = fetch_leetcode_json()
        if not raw_data:
            logger.warning("[UltimateScraper] No data to import. Skipping.")
            print("[UltimateScraper] No data to import. Skipping.")
            return

        # Transform all problems
        transformed = []
        skipped = 0
        seen_slugs = set()
        for item in raw_data:
            try:
                problem = transform_problem(item)
                if problem and problem["title_slug"] not in seen_slugs:
                    seen_slugs.add(problem["title_slug"])
                    transformed.append(problem)
                else:
                    skipped += 1
            except Exception as e:
                logger.warning(f"[UltimateScraper] Skipping malformed item: {e}")
                skipped += 1

        total = len(transformed)
        logger.info(f"[UltimateScraper] Transformed {total} problems ({skipped} skipped)")
        print(f"[UltimateScraper] Transformed {total} problems ({skipped} skipped)")

        if total == 0:
            logger.warning("[UltimateScraper] No valid problems after transformation.")
            return

        # Batch upsert
        supabase = get_supabase_client()
        inserted_total = 0
        errors_total = 0

        for i in range(0, total, BATCH_SIZE):
            batch = transformed[i : i + BATCH_SIZE]
            batch_num = (i // BATCH_SIZE) + 1
            total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

            try:
                supabase.table("dsa_sheets").upsert(
                    batch, on_conflict="title_slug"
                ).execute()
                inserted_total += len(batch)
                logger.info(
                    f"[UltimateScraper] Batch {batch_num}/{total_batches} — "
                    f"{len(batch)} upserted ({inserted_total}/{total} total)"
                )
            except Exception as batch_e:
                errors_total += len(batch)
                logger.error(
                    f"[UltimateScraper] Batch {batch_num}/{total_batches} FAILED: {batch_e}"
                )

            # Rate-limit guard
            if i + BATCH_SIZE < total:
                time.sleep(SLEEP_BETWEEN_BATCHES)

        msg = (
            f"[UltimateScraper] COMPLETE — {inserted_total} upserted, "
            f"{errors_total} errors, {total} total problems."
        )
        logger.info(msg)
        print(msg)

    except Exception as e:
        logger.error(f"[UltimateScraper] Fatal error: {e}")
        print(f"[UltimateScraper] Fatal error: {e}")
