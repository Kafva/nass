#!/usr/bin/env python3
"""
Subset the given TTF file to only contain latin characters and a subset of specific
unicode points.
"""
import fontforge # This is an .so, not a script btw
import os


def add_range_to_subset(start: int, end: int):
    FULL_FONT.selection.select(("ranges","unicode"), start, end)
    FULL_FONT.copy()

    SUBSET_FONT.selection.select(("ranges","unicode"), start, end)
    SUBSET_FONT.paste()

def add_glyph_to_subset(codepoint: int):
    FULL_FONT.selection.byGlyphs.select(
        ("ranges", "unicode"), codepoint, codepoint + 1)
    FULL_FONT.copy()

    SUBSET_FONT.selection.byGlyphs.select(
        ("ranges", "unicode"), codepoint, codepoint + 1)
    SUBSET_FONT.paste()


OUTFILE = "public/assets/meslo-nass.ttf"
FULL_FONT = fontforge.open("public/assets/meslo-nerd-fonts.ttf")

SUBSET_FONT = fontforge.font()
SUBSET_FONT.fontname = "Meslo nass"

# FULL_FONT.selection.all()
# FULL_FONT.copy()
# SUBSET_FONT.selection.all()
# SUBSET_FONT.paste()

add_range_to_subset(0x21, 0x7e) # '!' -> '~'
add_glyph_to_subset(0xe61e)


if os.path.isfile(OUTFILE):
  os.remove(OUTFILE)

SUBSET_FONT.generate(OUTFILE)



