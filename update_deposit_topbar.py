from pathlib import Path
root = Path(r'c:/Users/QUOCHUY/.gemini/antigravity/scratch/quochuy-mmo')
pattern = '<a href="history.html"><i class="fas fa-history"></i>Lịch sử giao dịch</a>'
insert = pattern + '\n      <a href="deposit.html"><i class="fas fa-wallet"></i>Nạp tiền</a>'
for p in root.glob('*.html'):
    if p.name == 'deposit.html':
        continue
    text = p.read_text(encoding='utf-8')
    if pattern in text and 'deposit.html' not in text:
        p.write_text(text.replace(pattern, insert), encoding='utf-8')
        print('updated', p.name)
