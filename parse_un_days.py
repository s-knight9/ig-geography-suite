import re
from bs4 import BeautifulSoup
import json
import datetime

with open(r"C:\Users\steve\.gemini\antigravity-ide\brain\9c20b902-f8fd-43c0-8d36-24a03aec83db\.system_generated\steps\70\content.md", "r", encoding="utf-8") as f:
    html = f.read()

# Remove the markdown frontmatter
html = re.sub(r"^.*?---", "", html, flags=re.DOTALL)

soup = BeautifulSoup(html, 'html.parser')

events = []
current_month = None

# The page has a structure where days might be listed under month headers or within views-row
# Let's find all rows with date and title.
# In the UN page, they often have <span class="date-display-single"> and then an <a> link.
rows = soup.find_all('div', class_='views-row')
for row in rows:
    date_elem = row.find('span', class_='date-display-single')
    if not date_elem:
        # Some are just text
        date_elem = row.find(class_='field-content', string=re.compile(r'\d{1,2}\s+[A-Z][a-z]+'))
    
    a_elem = row.find('a')
    
    if date_elem and a_elem:
        date_str = date_elem.get_text(strip=True)
        title = a_elem.get_text(strip=True)
        url = a_elem.get('href')
        if url.startswith('/'):
            url = 'https://www.un.org' + url
            
        events.append({
            'date_str': date_str,
            'title': title,
            'url': url
        })

if not events:
    # alternate approach: look for h4 tags for months, then lists
    for h4 in soup.find_all('h4'):
        ul = h4.find_next_sibling('ul')
        if ul:
            for li in ul.find_all('li'):
                text = li.get_text(" ", strip=True)
                a = li.find('a')
                if a:
                    url = a.get('href')
                    if url.startswith('/'): url = 'https://www.un.org' + url
                    events.append({'date_str': text.split('–')[0].strip(), 'title': a.get_text(strip=True), 'url': url})

with open("un_events.json", "w", encoding="utf-8") as f:
    json.dump(events, f, indent=2)

print("Extracted", len(events), "events")
