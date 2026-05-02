import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update style.css?v=... and premium.css?v=... to v=3.0
    content = re.sub(r'style\.css\?v=[0-9.]+', 'style.css?v=3.0', content)
    content = re.sub(r'premium\.css\?v=[0-9.]+', 'premium.css?v=3.0', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Force-refreshed cache for {file}')

