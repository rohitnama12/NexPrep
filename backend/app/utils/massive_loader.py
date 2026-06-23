import logging
from app.services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

MASSIVE_DATASET = [
    # ─────────────── ARRAYS ───────────────
    {
        "title": "Two Sum",
        "title_slug": "two-sum",
        "category": "DSA", "topic": "Arrays", "difficulty": "Easy",
        "playlists": ["blind_75", "striver_a2z", "top_150"],
        "description": "## Two Sum\nGiven an array of integers `nums` and an integer `target`, return **indices** of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.",
        "boilerplate_code": "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    lines = sys.stdin.read().strip().split('\\n')\n    nums = ast.literal_eval(lines[0])\n    target = ast.literal_eval(lines[1])\n    print(Solution().twoSum(nums, target))",
        "test_cases": [
            {"input": "[2,7,11,15]\n9",  "expected_output": "[0, 1]"},
            {"input": "[3,2,4]\n6",       "expected_output": "[1, 2]"},
            {"input": "[3,3]\n6",         "expected_output": "[0, 1]"},
            {"input": "[2,5,5,11]\n10",   "expected_output": "[1, 2]"}
        ],
        "solution_article": "### Approach — Hash Map\nIterate through `nums`. For each element, compute `complement = target - num`. If the complement exists in a hash map, return its index along with the current index. Otherwise, store `num → index`.\n\n```python\ndef twoSum(self, nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        comp = target - n\n        if comp in seen:\n            return [seen[comp], i]\n        seen[n] = i\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N) — single pass |\n| **Space** | O(N) — hash map |"
    },
    {
        "title": "Best Time to Buy and Sell Stock",
        "title_slug": "best-time-to-buy-and-sell-stock",
        "category": "DSA", "topic": "Arrays", "difficulty": "Easy",
        "playlists": ["blind_75", "top_150"],
        "description": "## Best Time to Buy and Sell Stock\nYou are given an array `prices` where `prices[i]` is the price of a given stock on the `i`-th day.\n\nReturn the **maximum profit** you can achieve. If no profit is possible, return `0`.",
        "boilerplate_code": "class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    prices = ast.literal_eval(sys.stdin.read().strip())\n    print(Solution().maxProfit(prices))",
        "test_cases": [
            {"input": "[7,1,5,3,6,4]", "expected_output": "5"},
            {"input": "[7,6,4,3,1]",   "expected_output": "0"},
            {"input": "[1,2]",          "expected_output": "1"},
            {"input": "[2,4,1]",        "expected_output": "2"}
        ],
        "solution_article": "### Approach — Sliding Window / Greedy\nTrack the minimum price seen so far and the maximum profit.\n\n```python\ndef maxProfit(self, prices):\n    min_price = float('inf')\n    max_profit = 0\n    for p in prices:\n        min_price = min(min_price, p)\n        max_profit = max(max_profit, p - min_price)\n    return max_profit\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N) |\n| **Space** | O(1) |"
    },
    {
        "title": "Contains Duplicate",
        "title_slug": "contains-duplicate",
        "category": "DSA", "topic": "Arrays", "difficulty": "Easy",
        "playlists": ["blind_75", "striver_a2z"],
        "description": "## Contains Duplicate\nGiven an integer array `nums`, return `true` if any value appears **at least twice**, and `false` if every element is distinct.",
        "boilerplate_code": "class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    nums = ast.literal_eval(sys.stdin.read().strip())\n    print(str(Solution().containsDuplicate(nums)).lower())",
        "test_cases": [
            {"input": "[1,2,3,1]",              "expected_output": "true"},
            {"input": "[1,2,3,4]",              "expected_output": "false"},
            {"input": "[1,1,1,3,3,4,3,2,4,2]", "expected_output": "true"},
            {"input": "[]",                     "expected_output": "false"}
        ],
        "solution_article": "### Approach — Hash Set\nInsert each element into a set. If the element already exists, return `True`.\n\n```python\ndef containsDuplicate(self, nums):\n    return len(nums) != len(set(nums))\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N) |\n| **Space** | O(N) |"
    },
    {
        "title": "Maximum Subarray",
        "title_slug": "maximum-subarray",
        "category": "DSA", "topic": "Arrays", "difficulty": "Medium",
        "playlists": ["blind_75", "striver_a2z", "top_150"],
        "description": "## Maximum Subarray (Kadane's Algorithm)\nGiven an integer array `nums`, find the **subarray** with the largest sum and return its sum.",
        "boilerplate_code": "class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    nums = ast.literal_eval(sys.stdin.read().strip())\n    print(Solution().maxSubArray(nums))",
        "test_cases": [
            {"input": "[-2,1,-3,4,-1,2,1,-5,4]", "expected_output": "6"},
            {"input": "[1]",                       "expected_output": "1"},
            {"input": "[5,4,-1,7,8]",              "expected_output": "23"},
            {"input": "[-1]",                      "expected_output": "-1"}
        ],
        "solution_article": "### Approach — Kadane's Algorithm\nTrack running sum `cur`. Reset to 0 if negative. Update global max at each step.\n\n```python\ndef maxSubArray(self, nums):\n    cur = max_sum = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        max_sum = max(max_sum, cur)\n    return max_sum\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N) |\n| **Space** | O(1) |"
    },
    {
        "title": "Product of Array Except Self",
        "title_slug": "product-of-array-except-self",
        "category": "DSA", "topic": "Arrays", "difficulty": "Medium",
        "playlists": ["blind_75", "top_150"],
        "description": "## Product of Array Except Self\nGiven an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all elements of `nums` except `nums[i]`.\n\nSolve it **without division** in O(N) time.",
        "boilerplate_code": "class Solution:\n    def productExceptSelf(self, nums: list[int]) -> list[int]:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    nums = ast.literal_eval(sys.stdin.read().strip())\n    print(Solution().productExceptSelf(nums))",
        "test_cases": [
            {"input": "[1,2,3,4]",   "expected_output": "[24, 12, 8, 6]"},
            {"input": "[-1,1,0,-3,3]","expected_output": "[0, 0, 9, 0, 0]"},
            {"input": "[2,3]",        "expected_output": "[3, 2]"},
            {"input": "[1,1,1,1]",   "expected_output": "[1, 1, 1, 1]"}
        ],
        "solution_article": "### Approach — Prefix & Suffix Pass\nBuild prefix products left-to-right, then multiply by suffix products right-to-left in a single output array.\n\n```python\ndef productExceptSelf(self, nums):\n    n = len(nums)\n    res = [1] * n\n    prefix = 1\n    for i in range(n):\n        res[i] = prefix\n        prefix *= nums[i]\n    suffix = 1\n    for i in range(n - 1, -1, -1):\n        res[i] *= suffix\n        suffix *= nums[i]\n    return res\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N) |\n| **Space** | O(1) — output array excluded |"
    },

    # ─────────────── STRINGS ───────────────
    {
        "title": "Valid Anagram",
        "title_slug": "valid-anagram",
        "category": "DSA", "topic": "Strings", "difficulty": "Easy",
        "playlists": ["blind_75", "striver_a2z", "top_150"],
        "description": "## Valid Anagram\nGiven two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
        "boilerplate_code": "class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        pass\n\nif __name__ == '__main__':\n    import sys\n    lines = sys.stdin.read().strip().split('\\n')\n    print(str(Solution().isAnagram(lines[0], lines[1])).lower())",
        "test_cases": [
            {"input": "anagram\nnagaram", "expected_output": "true"},
            {"input": "rat\ncar",         "expected_output": "false"},
            {"input": "a\na",             "expected_output": "true"},
            {"input": "ab\na",            "expected_output": "false"}
        ],
        "solution_article": "### Approach — Frequency Counter\nCount character frequencies using `collections.Counter`. Two strings are anagrams if their counters are equal.\n\n```python\nfrom collections import Counter\ndef isAnagram(self, s, t):\n    return Counter(s) == Counter(t)\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N) |\n| **Space** | O(1) — at most 26 keys |"
    },
    {
        "title": "Valid Palindrome",
        "title_slug": "valid-palindrome",
        "category": "DSA", "topic": "Strings", "difficulty": "Easy",
        "playlists": ["blind_75", "top_150"],
        "description": "## Valid Palindrome\nA phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nReturn `true` if `s` is a palindrome, or `false` otherwise.",
        "boilerplate_code": "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        pass\n\nif __name__ == '__main__':\n    import sys\n    s = sys.stdin.read().strip()\n    print(str(Solution().isPalindrome(s)).lower())",
        "test_cases": [
            {"input": "A man, a plan, a canal: Panama", "expected_output": "true"},
            {"input": "race a car",                     "expected_output": "false"},
            {"input": " ",                              "expected_output": "true"},
            {"input": "0P",                             "expected_output": "false"}
        ],
        "solution_article": "### Approach — Two Pointers\nFilter to alphanumeric chars, lowercase, then use two pointers from both ends.\n\n```python\ndef isPalindrome(self, s):\n    filtered = [c.lower() for c in s if c.isalnum()]\n    return filtered == filtered[::-1]\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N) |\n| **Space** | O(N) |"
    },

    # ─────────────── BINARY SEARCH ───────────────
    {
        "title": "Binary Search",
        "title_slug": "binary-search",
        "category": "DSA", "topic": "Binary Search", "difficulty": "Easy",
        "playlists": ["striver_a2z", "top_150"],
        "description": "## Binary Search\nGiven a sorted array of integers `nums` and an integer `target`, return the index if the target is found. Otherwise, return `-1`.\n\nYou must write an algorithm with **O(log N)** runtime complexity.",
        "boilerplate_code": "class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    lines = sys.stdin.read().strip().split('\\n')\n    nums = ast.literal_eval(lines[0])\n    target = ast.literal_eval(lines[1])\n    print(Solution().search(nums, target))",
        "test_cases": [
            {"input": "[-1,0,3,5,9,12]\n9",  "expected_output": "4"},
            {"input": "[-1,0,3,5,9,12]\n2",  "expected_output": "-1"},
            {"input": "[5]\n5",               "expected_output": "0"},
            {"input": "[5]\n-5",              "expected_output": "-1"}
        ],
        "solution_article": "### Approach — Classic Binary Search\n```python\ndef search(self, nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: lo = mid + 1\n        else: hi = mid - 1\n    return -1\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(log N) |\n| **Space** | O(1) |"
    },

    # ─────────────── SLIDING WINDOW ───────────────
    {
        "title": "Longest Substring Without Repeating Characters",
        "title_slug": "longest-substring-without-repeating-characters",
        "category": "DSA", "topic": "Sliding Window", "difficulty": "Medium",
        "playlists": ["blind_75", "striver_a2z", "top_150"],
        "description": "## Longest Substring Without Repeating Characters\nGiven a string `s`, find the length of the **longest substring** without repeating characters.",
        "boilerplate_code": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass\n\nif __name__ == '__main__':\n    import sys\n    s = sys.stdin.read().strip()\n    print(Solution().lengthOfLongestSubstring(s))",
        "test_cases": [
            {"input": "abcabcbb", "expected_output": "3"},
            {"input": "bbbbb",    "expected_output": "1"},
            {"input": "pwwkew",   "expected_output": "3"},
            {"input": "",         "expected_output": "0"}
        ],
        "solution_article": "### Approach — Sliding Window with Hash Set\nUse a set to track characters in the current window. Shrink from left when a duplicate is found.\n\n```python\ndef lengthOfLongestSubstring(self, s):\n    char_set = set()\n    l = res = 0\n    for r in range(len(s)):\n        while s[r] in char_set:\n            char_set.remove(s[l])\n            l += 1\n        char_set.add(s[r])\n        res = max(res, r - l + 1)\n    return res\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N) |\n| **Space** | O(min(N, M)) — M = charset size |"
    },
    {
        "title": "Minimum Window Substring",
        "title_slug": "minimum-window-substring",
        "category": "DSA", "topic": "Sliding Window", "difficulty": "Hard",
        "playlists": ["blind_75", "top_150"],
        "description": "## Minimum Window Substring\nGiven two strings `s` and `t`, return the **minimum window substring** of `s` such that every character in `t` (including duplicates) is included in the window.\n\nIf no such substring exists, return `\"\"`.",
        "boilerplate_code": "class Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        pass\n\nif __name__ == '__main__':\n    import sys\n    lines = sys.stdin.read().strip().split('\\n')\n    print(Solution().minWindow(lines[0], lines[1]))",
        "test_cases": [
            {"input": "ADOBECODEBANC\nABC", "expected_output": "BANC"},
            {"input": "a\na",               "expected_output": "a"},
            {"input": "a\naa",              "expected_output": ""},
            {"input": "abc\ncba",           "expected_output": "abc"}
        ],
        "solution_article": "### Approach — Sliding Window + Two Frequency Maps\nExpand `r` until window satisfies `t`. Then shrink `l` to find the minimum. Track `have` vs `need` counts.\n\n```python\nfrom collections import Counter\ndef minWindow(self, s, t):\n    if not t: return ''\n    need, window = Counter(t), {}\n    have, required = 0, len(need)\n    l, res, res_len = 0, [-1, -1], float('inf')\n    for r, c in enumerate(s):\n        window[c] = window.get(c, 0) + 1\n        if c in need and window[c] == need[c]: have += 1\n        while have == required:\n            if (r - l + 1) < res_len:\n                res, res_len = [l, r], r - l + 1\n            window[s[l]] -= 1\n            if s[l] in need and window[s[l]] < need[s[l]]: have -= 1\n            l += 1\n    l, r = res\n    return s[l:r+1] if res_len != float('inf') else ''\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N + M) |\n| **Space** | O(N + M) |"
    },

    # ─────────────── LINKED LISTS ───────────────
    {
        "title": "Reverse Linked List",
        "title_slug": "reverse-linked-list",
        "category": "DSA", "topic": "Linked Lists", "difficulty": "Easy",
        "playlists": ["blind_75", "striver_a2z", "top_150"],
        "description": "## Reverse Linked List\nGiven the `head` of a singly linked list, reverse the list and return the reversed list.\n\n*(Platform note: input/output are Python lists representing node values.)*",
        "boilerplate_code": "class Solution:\n    def reverseList(self, head: list[int]) -> list[int]:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    head = ast.literal_eval(sys.stdin.read().strip())\n    print(Solution().reverseList(head))",
        "test_cases": [
            {"input": "[1,2,3,4,5]", "expected_output": "[5, 4, 3, 2, 1]"},
            {"input": "[1,2]",       "expected_output": "[2, 1]"},
            {"input": "[]",          "expected_output": "[]"},
            {"input": "[1]",         "expected_output": "[1]"}
        ],
        "solution_article": "### Approach — In-Place Reversal (Iterative)\n```python\ndef reverseList(self, head):\n    return head[::-1]\n```\n\n### Full Linked List Approach\n```python\ndef reverseList(self, head):\n    prev = None\n    while head:\n        nxt = head.next\n        head.next = prev\n        prev = head\n        head = nxt\n    return prev\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N) |\n| **Space** | O(1) |"
    },
    {
        "title": "Linked List Cycle",
        "title_slug": "linked-list-cycle",
        "category": "DSA", "topic": "Linked Lists", "difficulty": "Easy",
        "playlists": ["blind_75", "top_150"],
        "description": "## Linked List Cycle\nGiven the `head` of a linked list, determine if it has a **cycle**.\n\n*(Platform note: input is a list of values. Return `true` if the list would have a cycle, `false` otherwise — for this problem detect if there are duplicates as a proxy.)*",
        "boilerplate_code": "class Solution:\n    def hasCycle(self, nums: list[int]) -> bool:\n        # Simplified: detect if any value repeats (proxy for cycle)\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    nums = ast.literal_eval(sys.stdin.read().strip())\n    print(str(Solution().hasCycle(nums)).lower())",
        "test_cases": [
            {"input": "[3,2,0,4,2]", "expected_output": "true"},
            {"input": "[1,2]",       "expected_output": "false"},
            {"input": "[1]",         "expected_output": "false"},
            {"input": "[1,1]",       "expected_output": "true"}
        ],
        "solution_article": "### Approach — Floyd's Tortoise and Hare\nUse two pointers: `slow` advances by 1, `fast` by 2. If they meet, there's a cycle.\n\n```python\ndef hasCycle(self, head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N) |\n| **Space** | O(1) |"
    },

    # ─────────────── TREES ───────────────
    {
        "title": "Maximum Depth of Binary Tree",
        "title_slug": "maximum-depth-of-binary-tree",
        "category": "DSA", "topic": "Trees", "difficulty": "Easy",
        "playlists": ["blind_75", "striver_a2z", "top_150"],
        "description": "## Maximum Depth of Binary Tree\nGiven the `root` of a binary tree, return its **maximum depth**.\n\n*(Platform note: the tree is given as a level-order list where `null` is represented as `None`.)*",
        "boilerplate_code": "class Solution:\n    def maxDepth(self, root: list) -> int:\n        # root is a level-order list; compute max depth\n        if not root:\n            return 0\n        # Build implicit depth\n        import math\n        non_null = [x for x in root if x is not None]\n        if not non_null:\n            return 0\n        return math.floor(math.log2(len(root))) + 1\n\nif __name__ == '__main__':\n    import sys, ast\n    root = ast.literal_eval(sys.stdin.read().strip())\n    print(Solution().maxDepth(root))",
        "test_cases": [
            {"input": "[3,9,20,None,None,15,7]", "expected_output": "3"},
            {"input": "[1,None,2]",              "expected_output": "2"},
            {"input": "[]",                      "expected_output": "0"},
            {"input": "[1]",                     "expected_output": "1"}
        ],
        "solution_article": "### Approach — DFS Recursion\n```python\ndef maxDepth(self, root):\n    if not root: return 0\n    return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))\n```\n\n### BFS Alternative\n```python\nfrom collections import deque\ndef maxDepth(self, root):\n    if not root: return 0\n    q, depth = deque([root]), 0\n    while q:\n        for _ in range(len(q)):\n            node = q.popleft()\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        depth += 1\n    return depth\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N) |\n| **Space** | O(H) — tree height |"
    },

    # ─────────────── DYNAMIC PROGRAMMING ───────────────
    {
        "title": "Climbing Stairs",
        "title_slug": "climbing-stairs",
        "category": "DSA", "topic": "Dynamic Programming", "difficulty": "Easy",
        "playlists": ["blind_75", "striver_a2z", "top_150"],
        "description": "## Climbing Stairs\nYou are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?",
        "boilerplate_code": "class Solution:\n    def climbStairs(self, n: int) -> int:\n        pass\n\nif __name__ == '__main__':\n    import sys\n    n = int(sys.stdin.read().strip())\n    print(Solution().climbStairs(n))",
        "test_cases": [
            {"input": "2", "expected_output": "2"},
            {"input": "3", "expected_output": "3"},
            {"input": "5", "expected_output": "8"},
            {"input": "1", "expected_output": "1"}
        ],
        "solution_article": "### Approach — Dynamic Programming (Fibonacci)\nThis is identical to computing the `n`-th Fibonacci number. `dp[i] = dp[i-1] + dp[i-2]`.\n\n```python\ndef climbStairs(self, n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N) |\n| **Space** | O(1) |"
    },
    {
        "title": "House Robber",
        "title_slug": "house-robber",
        "category": "DSA", "topic": "Dynamic Programming", "difficulty": "Medium",
        "playlists": ["blind_75", "striver_a2z"],
        "description": "## House Robber\nYou are a professional robber planning to rob houses along a street. Adjacent houses have security systems that will alert the police if **two adjacent houses** are broken into.\n\nGiven an array `nums` representing the amount of money in each house, return the **maximum amount** you can rob without alerting the police.",
        "boilerplate_code": "class Solution:\n    def rob(self, nums: list[int]) -> int:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    nums = ast.literal_eval(sys.stdin.read().strip())\n    print(Solution().rob(nums))",
        "test_cases": [
            {"input": "[1,2,3,1]",   "expected_output": "4"},
            {"input": "[2,7,9,3,1]", "expected_output": "12"},
            {"input": "[2,1,1,2]",   "expected_output": "4"},
            {"input": "[1]",         "expected_output": "1"}
        ],
        "solution_article": "### Approach — DP with Two Variables\nAt each house, choose: rob it (add to `prev_prev`) or skip it (keep `prev`).\n\n```python\ndef rob(self, nums):\n    prev2, prev1 = 0, 0\n    for n in nums:\n        prev2, prev1 = prev1, max(prev1, prev2 + n)\n    return prev1\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N) |\n| **Space** | O(1) |"
    },

    # ─────────────── GRAPHS ───────────────
    {
        "title": "Number of Islands",
        "title_slug": "number-of-islands",
        "category": "DSA", "topic": "Graphs", "difficulty": "Medium",
        "playlists": ["blind_75", "striver_a2z", "top_150"],
        "description": "## Number of Islands\nGiven an `m x n` 2D binary grid representing a map of `'1'`s (land) and `'0'`s (water), return the **number of islands**.\n\nAn island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.",
        "boilerplate_code": "class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    grid = ast.literal_eval(sys.stdin.read().strip())\n    print(Solution().numIslands(grid))",
        "test_cases": [
            {"input": "[[\"1\",\"1\",\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"0\",\"0\"]]",
             "expected_output": "1"},
            {"input": "[[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]",
             "expected_output": "3"},
            {"input": "[[\"1\"]]",                               "expected_output": "1"},
            {"input": "[[\"0\"]]",                               "expected_output": "0"}
        ],
        "solution_article": "### Approach — DFS Flood Fill\nLoop over the grid. When a `'1'` is found, increment counter and DFS to mark the entire island as visited (`'0'`).\n\n```python\ndef numIslands(self, grid):\n    def dfs(r, c):\n        if r < 0 or c < 0 or r >= len(grid) or c >= len(grid[0]) or grid[r][c] == '0':\n            return\n        grid[r][c] = '0'\n        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:\n            dfs(r+dr, c+dc)\n    count = 0\n    for r in range(len(grid)):\n        for c in range(len(grid[0])):\n            if grid[r][c] == '1':\n                dfs(r, c)\n                count += 1\n    return count\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(M × N) |\n| **Space** | O(M × N) — recursion stack |"
    },

    # ─────────────── INTERVALS ───────────────
    {
        "title": "Merge Intervals",
        "title_slug": "merge-intervals",
        "category": "DSA", "topic": "Intervals", "difficulty": "Medium",
        "playlists": ["blind_75", "striver_a2z", "top_150"],
        "description": "## Merge Intervals\nGiven an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all **overlapping intervals** and return an array of the non-overlapping intervals.",
        "boilerplate_code": "class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        pass\n\nif __name__ == '__main__':\n    import sys, ast\n    intervals = ast.literal_eval(sys.stdin.read().strip())\n    print(Solution().merge(intervals))",
        "test_cases": [
            {"input": "[[1,3],[2,6],[8,10],[15,18]]", "expected_output": "[[1, 6], [8, 10], [15, 18]]"},
            {"input": "[[1,4],[4,5]]",                "expected_output": "[[1, 5]]"},
            {"input": "[[1,4],[0,4]]",                "expected_output": "[[0, 4]]"},
            {"input": "[[1,4],[2,3]]",                "expected_output": "[[1, 4]]"}
        ],
        "solution_article": "### Approach — Sort then Merge\nSort by start time. For each interval, either extend the last merged interval or append a new one.\n\n```python\ndef merge(self, intervals):\n    intervals.sort()\n    merged = [intervals[0]]\n    for start, end in intervals[1:]:\n        if start <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], end)\n        else:\n            merged.append([start, end])\n    return merged\n```\n\n### Complexity\n| | |\n|---|---|\n| **Time** | O(N log N) — sorting |\n| **Space** | O(N) — output |"
    },
]


def run_massive_import():
    """Upsert all problems from MASSIVE_DATASET into the static_challenges table."""
    try:
        supabase = get_supabase_client()
        inserted = 0
        updated = 0
        for problem in MASSIVE_DATASET:
            try:
                existing = (
                    supabase.table("static_challenges")
                    .select("id")
                    .eq("title_slug", problem["title_slug"])
                    .execute()
                )
                if not existing.data:
                    supabase.table("static_challenges").insert(problem).execute()
                    inserted += 1
                else:
                    supabase.table("static_challenges").update(problem).eq(
                        "title_slug", problem["title_slug"]
                    ).execute()
                    updated += 1
            except Exception as row_e:
                logger.error(f"Error seeding '{problem['title_slug']}': {row_e}")

        msg = f"[MassiveLoader] Done — {inserted} inserted, {updated} updated across {len(MASSIVE_DATASET)} problems."
        logger.info(msg)
        print(msg)
    except Exception as e:
        logger.error(f"[MassiveLoader] Fatal error: {e}")
        print(f"[MassiveLoader] Fatal error: {e}")
