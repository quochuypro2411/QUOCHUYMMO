import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    if file == 'auth.html' or file == 'admin.html' or file == 'checkout.html':
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # We want to replace <li><a href="..."><i class="..."></i>TEXT</a></li>
    # with <li><a href="..."><span class="nav-icon"><i class="..."></i></span><span class="nav-text">TEXT</span></a></li>
    # We need to handle the fact that some items might already be converted.
    
    # Let's find all <li class="nav-item...
    def replace_li(match):
        li_start = match.group(1) # <li class="nav-item...">
        a_start = match.group(2) # <a href="...">
        inner_html = match.group(3) # <i class="..."></i>TEXT
        
        # if it already has nav-icon, skip
        if 'nav-icon' in inner_html:
            return match.group(0)
            
        # extract i tag and text
        i_match = re.search(r'(<i[^>]+></i>)\s*(.*)', inner_html)
        if i_match:
            i_tag = i_match.group(1)
            text = i_match.group(2).strip()
            # Clean up text (remove old specific labels if necessary, but keep as is for now)
            # Actually, the user's index.html has slightly different text: "FACEBOOK" instead of "TÀI KHOẢN FACEBOOK"
            new_inner = f'<span class="nav-icon">{i_tag}</span><span class="nav-text">{text}</span>'
            return f'{li_start}{a_start}{new_inner}</a></li>'
        return match.group(0)

    new_content = re.sub(r'(<li[^>]*class="nav-item[^"]*"[^>]*>)\s*(<a[^>]*>)\s*(.*?)\s*</a>\s*</li>', replace_li, content, flags=re.IGNORECASE|re.DOTALL)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {file}')

