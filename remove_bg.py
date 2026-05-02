"""
Remove white background from logo.png
"""
from PIL import Image
import shutil

src = 'assets/logo.png'

# Backup
shutil.copy2(src, 'assets/logo_backup.png')
print("Backup saved to assets/logo_backup.png")

img = Image.open(src).convert('RGBA')
data = img.getdata()

new_data = []
for pixel in data:
    r, g, b, a = pixel
    # Pure white or near-white -> fully transparent
    if r > 220 and g > 220 and b > 220:
        new_data.append((255, 255, 255, 0))
    # Anti-alias zone (slightly off-white) -> reduce alpha gradually
    elif r > 180 and g > 180 and b > 180:
        avg = (r + g + b) // 3
        new_alpha = max(0, 255 - int((avg - 180) * (255 / 75)))
        new_data.append((r, g, b, min(a, new_alpha)))
    else:
        new_data.append(pixel)

img.putdata(new_data)
img.save(src, 'PNG')

print(f"Done! White background removed from {src}")
print(f"Image size: {img.size[0]}x{img.size[1]}")
