import glob
import re
import os

html_files = glob.glob('*.html')

replacements = [
    (r'href="style\.css"', 'href="css/style.css"'),
    (r'href="checkout\.css"', 'href="css/checkout.css"'),
    (r'href="history\.css"', 'href="css/history.css"'),
    (r'src="script\.js"', 'src="js/script.js"'),
    (r'src="logo\.png"', 'src="assets/logo.png"'),
    (r'src="payment-qr\.svg"', 'src="assets/payment-qr.svg"'),
    (r'src="hero_bg\.png"', 'src="assets/hero_bg.png"'),
    (r'src="news1\.png"', 'src="assets/news1.png"'),
    (r'src="news2\.png"', 'src="assets/news2.png"'),
    (r'src="news3\.png"', 'src="assets/news3.png"'),
    (r'src="prod_fb\.png"', 'src="assets/prod_fb.png"'),
    (r'src="prod_gm\.png"', 'src="assets/prod_gm.png"'),
]

count = 0
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    changed = False
    for pattern, repl in replacements:
        if re.search(pattern, new_content):
            new_content = re.sub(pattern, repl, new_content)
            changed = True
    
    if changed:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1
        print(f'Updated paths in: {file}')

print(f'Successfully updated {count} HTML files.')
