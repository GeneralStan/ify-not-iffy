"""Crunchr phone video: the app recording inside a drawn iPhone (Dynamic Island, thin bezel,
titanium band, side buttons, soft shadow) on a transparent 1080x1920 canvas.

Reads rgb24 frames (888x1920) on stdin, writes rgba frames (1080x1920) on stdout.
The recording's status bar (red recording pill, real time, battery) is replaced on every frame:
filled with that frame's own status bar colour, then a clean "9:41" bar drawn in white or black.

usage: python phone.py [preview_in.png preview_out.png]
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC_W, SRC_H = 888, 1920
W, H = 1080, 1920
SS = 2  # supersampling for the static artwork

SCREEN_W = 776
SCREEN_H = round(SCREEN_W * SRC_H / SRC_W)  # 1678
BEZEL = 20  # 5px titanium band + 15px black bezel
OUT_W, OUT_H = SCREEN_W + 2 * BEZEL, SCREEN_H + 2 * BEZEL
PX, PY = (W - OUT_W) // 2, (H - OUT_H) // 2
SX, SY = PX + BEZEL, PY + BEZEL
R_SCREEN = 106
R_OUT = R_SCREEN + BEZEL

FONT = '/System/Library/Fonts/SFNS.ttf'


def rr(draw, box, r, fill):
    draw.rounded_rectangle([round(v * SS) for v in box], radius=round(r * SS), fill=fill)


def static_layers():
    big = (W * SS, H * SS)
    # Shadow: soft and low, like a phone lying slightly above the card.
    sh = Image.new('L', big, 0)
    ImageDraw.Draw(sh).rounded_rectangle(
        [(PX + 10) * SS, (PY + 28) * SS, (PX + OUT_W - 10) * SS, (PY + OUT_H + 10) * SS], radius=R_OUT * SS, fill=255
    )
    sh = sh.filter(ImageFilter.GaussianBlur(34 * SS)).point(lambda v: int(v * 0.26))
    under = Image.new('RGBA', big, (10, 10, 10, 0))
    under.putalpha(sh)

    d = ImageDraw.Draw(under)
    # Side buttons (behind the body, 5px proud of it).
    btn = (58, 58, 60, 255)
    for y0, y1 in ((0.175, 0.215), (0.255, 0.33), (0.355, 0.43)):
        rr(d, (PX - 5, PY + OUT_H * y0, PX + 6, PY + OUT_H * y1), 3, btn)
    rr(d, (PX + OUT_W - 6, PY + OUT_H * 0.285, PX + OUT_W + 5, PY + OUT_H * 0.40), 3, btn)
    rr(d, (PX + OUT_W - 6, PY + OUT_H * 0.58, PX + OUT_W + 4, PY + OUT_H * 0.635), 3, (48, 48, 50, 255))
    # Titanium band, a lighter edge line, then the black bezel.
    rr(d, (PX, PY, PX + OUT_W, PY + OUT_H), R_OUT, (72, 72, 74, 255))
    rr(d, (PX + 2, PY + 2, PX + OUT_W - 2, PY + OUT_H - 2), R_OUT - 2, (98, 98, 100, 255))
    rr(d, (PX + 5, PY + 5, PX + OUT_W - 5, PY + OUT_H - 5), R_OUT - 5, (10, 10, 11, 255))
    under = under.resize((W, H), Image.LANCZOS)

    # Screen mask (rounded corners) at screen size.
    m = Image.new('L', (SCREEN_W * SS, SCREEN_H * SS), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, SCREEN_W * SS - 1, SCREEN_H * SS - 1], radius=R_SCREEN * SS, fill=255)
    mask = m.resize((SCREEN_W, SCREEN_H), Image.LANCZOS)

    # Dynamic Island, with a faint lens, drawn over the screen.
    isl = Image.new('RGBA', (SCREEN_W * SS, SCREEN_H * SS), (0, 0, 0, 0))
    di = ImageDraw.Draw(isl)
    iw, ih, it = 0.31 * SCREEN_W, 0.0215 * SCREEN_H, 21
    ix = (SCREEN_W - iw) / 2
    di.rounded_rectangle([ix * SS, it * SS, (ix + iw) * SS, (it + ih) * SS], radius=ih / 2 * SS, fill=(0, 0, 0, 255))
    cx, cy, cr = ix + iw - ih / 2 - 4, it + ih / 2, ih * 0.22
    di.ellipse([(cx - cr) * SS, (cy - cr) * SS, (cx + cr) * SS, (cy + cr) * SS], fill=(22, 24, 34, 255))
    island = isl.resize((SCREEN_W, SCREEN_H), Image.LANCZOS)
    return under, mask, island, (ix, it, iw, ih)


def status_bar(colour, island_box):
    """A clean status bar for a SCREEN_W-wide screen: 9:41, signal bars, battery."""
    lum = 0.299 * colour[0] + 0.587 * colour[1] + 0.114 * colour[2]
    ink = (255, 255, 255, 255) if lum < 150 else (0, 0, 0, 255)
    ix, it, iw, ih = island_box
    cy = it + ih / 2
    bar = Image.new('RGBA', (SCREEN_W * SS, 110 * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(bar)
    font = ImageFont.truetype(FONT, 34 * SS)
    try:
        font.set_variation_by_axes([100, 17, 400, 590])  # width, optical size, grade, weight (Semibold)
    except Exception:
        pass
    tx = SCREEN_W * 0.16
    d.text((tx * SS, cy * SS), '9:41', font=font, fill=ink, anchor='mm')
    # Signal: four bars.
    right = SCREEN_W - 66
    x0 = right - 140
    for i in range(4):
        h = 9 + i * 5
        d.rounded_rectangle([(x0 + i * 9) * SS, (cy + 11 - h) * SS, (x0 + i * 9 + 6) * SS, (cy + 11) * SS], radius=1.5 * SS, fill=ink)
    # Wi-Fi: three arcs.
    wx, wy = x0 + 58, cy + 10
    for k, rad in enumerate((22, 14, 6)):
        if k < 2:
            d.arc([(wx - rad) * SS, (wy - rad) * SS, (wx + rad) * SS, (wy + rad) * SS], 225, 315, fill=ink, width=round(4.5 * SS))
        else:
            d.pieslice([(wx - rad) * SS, (wy - rad) * SS, (wx + rad) * SS, (wy + rad) * SS], 225, 315, fill=ink)
    # Battery.
    bx, bw, bh = right - 48, 46, 22
    faded = ink[:3] + (110,)
    d.rounded_rectangle([bx * SS, (cy - bh / 2) * SS, (bx + bw) * SS, (cy + bh / 2) * SS], radius=6 * SS, outline=faded, width=round(2.2 * SS))
    d.rounded_rectangle([(bx + bw + 2) * SS, (cy - 4) * SS, (bx + bw + 5) * SS, (cy + 4) * SS], radius=1.5 * SS, fill=faded)
    d.rounded_rectangle([(bx + 4) * SS, (cy - bh / 2 + 4) * SS, (bx + bw - 4) * SS, (cy + bh / 2 - 4) * SS], radius=3 * SS, fill=ink)
    return bar.resize((SCREEN_W, 110), Image.LANCZOS)


def main():
    under, mask, island, island_box = static_layers()
    under_np = np.asarray(under).astype(np.float32)
    mask_np = (np.asarray(mask).astype(np.float32) / 255.0)[..., None]
    bars = {}
    strip = 108  # source px covered by the status bar (pill, time, icons)

    def frame(src_rgb):
        img = src_rgb.copy()
        row = src_rgb[3, 250:640].reshape(-1, 3)
        colour = tuple(int(v) for v in np.median(row, axis=0))
        img[:strip] = colour
        screen = Image.fromarray(img).resize((SCREEN_W, SCREEN_H), Image.LANCZOS).convert('RGBA')
        key = colour
        if key not in bars:
            bars[key] = status_bar(colour, island_box)
        screen.alpha_composite(bars[key], (0, 0))
        screen.alpha_composite(island)
        s = np.asarray(screen).astype(np.float32)
        out = under_np.copy()
        region = out[SY:SY + SCREEN_H, SX:SX + SCREEN_W]
        a = mask_np
        rgb = s[..., :3] * a + region[..., :3] * (1 - a)
        alpha = 255 * a + region[..., 3:4] * (1 - a)
        region[..., :3] = rgb
        region[..., 3:4] = alpha
        return out.clip(0, 255).astype(np.uint8)

    if len(sys.argv) == 3:
        src = np.asarray(Image.open(sys.argv[1]).convert('RGB').resize((SRC_W, SRC_H)))
        Image.fromarray(frame(src)).save(sys.argv[2])
        return

    n = SRC_W * SRC_H * 3
    stdin, stdout = sys.stdin.buffer, sys.stdout.buffer
    while True:
        buf = stdin.read(n)
        if len(buf) < n:
            break
        stdout.write(frame(np.frombuffer(buf, np.uint8).reshape(SRC_H, SRC_W, 3)).tobytes())


if __name__ == '__main__':
    main()
