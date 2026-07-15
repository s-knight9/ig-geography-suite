import json
import re

with open("un_events.json", "r", encoding="utf-8") as f:
    events = json.load(f)

valid_events = []
# Match patterns like "24 January", "4-10 October", "Third Thursday of November"
# The user wants specific calendar dates to be natively embedded.
# Actually, the user asked to embed UN days. Let's just output them as a JSON list in a ts file.
for e in events:
    date_str = e['date_str']
    if re.search(r'\d', date_str): # at least has a number in the date, avoiding "General Assembly"
        valid_events.append(e)

# output to a typescript file
js_content = "export const UN_DAYS = [\n"
for e in valid_events:
    js_content += f"  {{ date_str: {repr(e['date_str'])}, title: {repr(e['title'])}, url: {repr(e['url'])} }},\n"
js_content += "];\n"

with open(r"c:\Users\steve\antigravity\IG Geography Suite\src\unDays.ts", "w", encoding="utf-8") as f:
    f.write(js_content)
print(f"Filtered down to {len(valid_events)} valid events and saved to unDays.ts")
