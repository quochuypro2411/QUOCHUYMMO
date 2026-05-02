import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update premium.css?v=... to v=3.1
    content = re.sub(r'premium\.css\?v=[0-9.]+', 'premium.css?v=3.1', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated version in {file}')

