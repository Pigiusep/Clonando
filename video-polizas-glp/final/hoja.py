import sys, glob, os
from PIL import Image, ImageDraw, ImageFont
d, out = sys.argv[1], sys.argv[2]; ids = sys.argv[3:]
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
W, H = 640, 360
im = Image.new('RGB', (W * 3, H * ((len(ids) + 2) // 3)), 'white'); dr = ImageDraw.Draw(im)
for i, n in enumerate(ids):
    x, y = (i % 3) * W, (i // 3) * H
    im.paste(Image.open(f'{d}/{n}.jpg').resize((W, H)), (x, y)); dr.rectangle([x, y, x + 70, y + 30], fill='black'); dr.text((x + 6, y + 3), n, fill='yellow', font=f)
im.save(out, quality=82)
