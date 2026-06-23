import logging
from app.services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

SEED_DATA = [
    {
        "title": "Two Sum",
        "title_slug": "two-sum",
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "category": "DSA",
        "topic": "Arrays",
        "difficulty": "Easy",
        "playlists": ["blind_75", "striver_a2z"],
        "solution_article": "### Approach\nUse a Hash Map to store complement values.\n### Complexity\n- Time: O(N)\n- Space: O(N)",
        "boilerplate_code": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    input_data = sys.stdin.read().strip().split('\\n')\n    if len(input_data) >= 2:\n        nums = ast.literal_eval(input_data[0])\n        target = ast.literal_eval(input_data[1])\n        print(Solution().twoSum(nums, target))",
        "test_cases": [
            {"input": "[2,7,11,15]\n9", "expected_output": "[0, 1]"},
            {"input": "[3,2,4]\n6", "expected_output": "[1, 2]"},
            {"input": "[3,3]\n6", "expected_output": "[0, 1]"},
            {"input": "[2,5,5,11]\n10", "expected_output": "[1, 2]"}
        ]
    },
    {
        "title": "Valid Anagram",
        "title_slug": "valid-anagram",
        "description": "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
        "category": "DSA",
        "topic": "Strings",
        "difficulty": "Easy",
        "playlists": ["blind_75", "striver_a2z"],
        "solution_article": "### Approach\nUse a Hash Map to store complement values.\n### Complexity\n- Time: O(N)\n- Space: O(N)",
        "boilerplate_code": "class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        pass\n\nif __name__ == '__main__':\n    import sys\n    input_data = sys.stdin.read().strip().split('\\n')\n    if len(input_data) >= 2:\n        s, t = input_data[0], input_data[1]\n        print(str(Solution().isAnagram(s, t)).lower())",
        "test_cases": [
            {"input": "anagram\nnagaram", "expected_output": "true"},
            {"input": "rat\ncar", "expected_output": "false"},
            {"input": "a\na", "expected_output": "true"},
            {"input": "ab\na", "expected_output": "false"}
        ]
    },
    {
        "title": "Binary Search",
        "title_slug": "binary-search",
        "description": "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.",
        "category": "DSA",
        "topic": "Binary Search",
        "difficulty": "Easy",
        "playlists": ["blind_75", "striver_a2z"],
        "solution_article": "### Approach\nUse a Hash Map to store complement values.\n### Complexity\n- Time: O(N)\n- Space: O(N)",
        "boilerplate_code": "class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    input_data = sys.stdin.read().strip().split('\\n')\n    if len(input_data) >= 2:\n        nums = ast.literal_eval(input_data[0])\n        target = ast.literal_eval(input_data[1])\n        print(Solution().search(nums, target))",
        "test_cases": [
            {"input": "[-1,0,3,5,9,12]\n9", "expected_output": "4"},
            {"input": "[-1,0,3,5,9,12]\n2", "expected_output": "-1"},
            {"input": "[5]\n5", "expected_output": "0"},
            {"input": "[5]\n-5", "expected_output": "-1"}
        ]
    },
    {
        "title": "Contains Duplicate",
        "title_slug": "contains-duplicate",
        "description": "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
        "category": "DSA",
        "topic": "Arrays",
        "difficulty": "Easy",
        "playlists": ["blind_75", "striver_a2z"],
        "solution_article": "### Approach\nUse a Hash Map to store complement values.\n### Complexity\n- Time: O(N)\n- Space: O(N)",
        "boilerplate_code": "class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        nums = ast.literal_eval(input_data)\n        print(str(Solution().containsDuplicate(nums)).lower())",
        "test_cases": [
            {"input": "[1,2,3,1]", "expected_output": "true"},
            {"input": "[1,2,3,4]", "expected_output": "false"},
            {"input": "[1,1,1,3,3,4,3,2,4,2]", "expected_output": "true"},
            {"input": "[]", "expected_output": "false"}
        ]
    },
    {
        "title": "Reverse Linked List",
        "title_slug": "reverse-linked-list",
        "description": "Given the `head` of a singly linked list, reverse the list, and return the reversed list. (Note: For this coding platform, assume `head` is passed as a Python list and return it reversed).",
        "category": "DSA",
        "topic": "Linked Lists",
        "difficulty": "Easy",
        "playlists": ["blind_75", "striver_a2z"],
        "solution_article": "### Approach\nUse a Hash Map to store complement values.\n### Complexity\n- Time: O(N)\n- Space: O(N)",
        "boilerplate_code": "class Solution:\n    def reverseList(self, head: list[int]) -> list[int]:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        nums = ast.literal_eval(input_data)\n        print(Solution().reverseList(nums))",
        "test_cases": [
            {"input": "[1,2,3,4,5]", "expected_output": "[5, 4, 3, 2, 1]"},
            {"input": "[1,2]", "expected_output": "[2, 1]"},
            {"input": "[]", "expected_output": "[]"},
            {"input": "[1]", "expected_output": "[1]"}
        ]
    },
    {
        "title": "Merge Intervals",
        "title_slug": "merge-intervals",
        "description": "Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        "category": "DSA",
        "topic": "Intervals",
        "difficulty": "Medium",
        "playlists": ["blind_75", "striver_a2z"],
        "solution_article": "### Approach\nUse a Hash Map to store complement values.\n### Complexity\n- Time: O(N)\n- Space: O(N)",
        "boilerplate_code": "class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        intervals = ast.literal_eval(input_data)\n        print(Solution().merge(intervals))",
        "test_cases": [
            {"input": "[[1,3],[2,6],[8,10],[15,18]]", "expected_output": "[[1, 6], [8, 10], [15, 18]]"},
            {"input": "[[1,4],[4,5]]", "expected_output": "[[1, 5]]"},
            {"input": "[[1,4],[0,4]]", "expected_output": "[[0, 4]]"},
            {"input": "[[1,4],[2,3]]", "expected_output": "[[1, 4]]"}
        ]
    },
    {
        "title": "Valid Palindrome",
        "title_slug": "valid-palindrome",
        "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
        "category": "DSA",
        "topic": "Strings",
        "difficulty": "Easy",
        "playlists": ["blind_75", "striver_a2z"],
        "solution_article": "### Approach\nUse a Hash Map to store complement values.\n### Complexity\n- Time: O(N)\n- Space: O(N)",
        "boilerplate_code": "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        pass\n\nif __name__ == '__main__':\n    import sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        print(str(Solution().isPalindrome(input_data)).lower())",
        "test_cases": [
            {"input": "A man, a plan, a canal: Panama", "expected_output": "true"},
            {"input": "race a car", "expected_output": "false"},
            {"input": " ", "expected_output": "true"},
            {"input": "0P", "expected_output": "false"}
        ]
    },
    {
        "title": "Maximum Subarray",
        "title_slug": "maximum-subarray",
        "description": "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
        "category": "DSA",
        "topic": "Arrays",
        "difficulty": "Medium",
        "playlists": ["blind_75", "striver_a2z"],
        "solution_article": "### Approach\nUse a Hash Map to store complement values.\n### Complexity\n- Time: O(N)\n- Space: O(N)",
        "boilerplate_code": "class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        nums = ast.literal_eval(input_data)\n        print(Solution().maxSubArray(nums))",
        "test_cases": [
            {"input": "[-2,1,-3,4,-1,2,1,-5,4]", "expected_output": "6"},
            {"input": "[1]", "expected_output": "1"},
            {"input": "[5,4,-1,7,8]", "expected_output": "23"},
            {"input": "[-1]", "expected_output": "-1"}
        ]
    }
]

def run_bulk_seed():
    try:
        supabase = get_supabase_client()
        for problem in SEED_DATA:
            try:
                # To emulate an upsert without conflicts on title_slug, we first check if it exists
                existing = supabase.table("static_challenges").select("id").eq("title_slug", problem["title_slug"]).execute()
                if not existing.data:
                    supabase.table("static_challenges").insert(problem).execute()
                else:
                    supabase.table("static_challenges").update(problem).eq("title_slug", problem["title_slug"]).execute()
            except Exception as row_e:
                logger.error(f"Error seeding row {problem['title_slug']}: {row_e}")
        logger.info("Database successfully seeded with static challenges.")
        print("Database successfully seeded with static challenges.")
    except Exception as e:
        logger.error(f"Failed to seed database: {e}")
        print(f"Failed to seed database: {e}")
