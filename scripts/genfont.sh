#!/usr/bin/env bash
: '''
Subset a TTF file to only contain extended ASCII and
the glyphs that are actually used in the application.
Also create a .min.css file with classes for each glyph.
'''
die(){ printf "$1\n" >&2 ; exit 1; }
info(){ printf "\033[34m!>\033[0m $1\n" >&2; }
usage="usage: $(basename $0) <client source> <full font> <font output> <.min.css output>"

command -v pyftsubset &> /dev/null || die "Missing pyftsubset"
[ -z "$1" ] && die "$usage"

INPUT=${1}
FULL_FONT=${2:-fonts/meslo-nerd-fonts.ttf}
TTF=${3:-./public/assets/meslo-nass.ttf}
MIN_CSS=${4:-fonts/nerd-fonts-nass.min.css}

readonly FONT_FAMILY="Meslo"
readonly GLYPH_INDEX=./fonts/nerdfonts.raw
MATCHED_GLYPHS=$(mktemp)
CSS=$(mktemp)
SUBSET=$(mktemp)

# Determine the unicode value of each glyph from a lookup table
while read -r line; do
  sed -nE "/${line/nf-/}\$/s/.*([a-f0-9]{4}) (.*)/\1 \2/p" \
    $GLYPH_INDEX >> $MATCHED_GLYPHS
done < <(grep -hiEoR "nf-[-_0-9a-z]+" $INPUT|sort -u)

info "Generating font and css for:"
cat $MATCHED_GLYPHS
echo "==============================="


# == Generate CSS ==
# NOTE: we do not directly include the TTF font into vite's build process
# it is resolved at runtime by using the /app/assets endpoint in the app.
# I.e. there should not be an extra ttf file with a hash under ./dist/assets
cat << EOF > $CSS
@font-face {
  font-family: "$FONT_FAMILY";
  src: url("/app/assets/$(basename $TTF))") format("truetype");
  font-weight: 400;
  font-style: normal;
}
.nf {
  font-family: "$FONT_FAMILY";
  speak: none;
  font-style: normal;
  font-weight: 400;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF

sed -E "s/.*([a-f0-9]{4}) (.*)/.nf-\2:before { content: \"\\\\\1\"; }/" \
  $MATCHED_GLYPHS >> "$CSS"
cat $CSS | tr -d ' '  | tr -d '\n' > $MIN_CSS

# == Generate subset font ==
# Extended ASCII codepoints
cat << EOF > $SUBSET
0021-007e
0080
0082-008c
008e
0091-009c
009e-009f
00a1-00ac
00ae-00ff

EOF

# Append codepoints for matched glyphs
grep -oE "^[a-f0-9]{4}" $MATCHED_GLYPHS >> $SUBSET

pyftsubset "$FULL_FONT" --unicodes-file="$SUBSET" --output-file="$TTF"

echo Done.
info "$TTF"
info "$MIN_CSS"
