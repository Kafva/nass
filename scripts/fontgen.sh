#!/usr/bin/env bash
: '''
Subset a TTF file to only contain extended ASCII and 
the glyphs that are actually used in the application.
'''
die(){ printf "$1\n" >&2 ; exit 1; }
info(){ printf "\033[34m!>\033[0m $1\n" >&2; }

command -v pyftsubset &> /dev/null || die "Missing pyftsubset"

INPUT=${1:-./client}
FULL_FONT=${2:-public/assets/meslo-nerd-fonts.ttf}
TTF=${3:-./public/assets/meslo-nass.ttf}
MIN_CSS=${4:-./public/assets/nerd-fonts-nass.min.css}

readonly FONT_FAMILY="Meslo"
GLYPH_INDEX=/tmp/nerdfonts.raw
MATCHED_GLYPHS=$(mktemp)
CSS=$(mktemp)
SUBSET=$(mktemp)

[ -f $GLYPH_INDEX ] || curl -L \
    https://gist.github.com/Kafva/0d143e61eb9c8e10c7ca297aec0701cf/raw/9186cc806887600bbd5127b86f61b66d41b20f5a/nerdfonts.raw \
    > $GLYPH_INDEX

# Determine the unicode value of each glyph from a lookup table
while read -r line; do
  sed -nE "/${line/nf-/}\$/s/.*([a-f0-9]{4}) (.*)/\1 \2/p" \
    $GLYPH_INDEX >> $MATCHED_GLYPHS
done < <(grep -hiEoR "nf-[-_0-9a-z]+" $INPUT|sort -u)

info "Generating font and css for:"
cat $MATCHED_GLYPHS
echo "==============================="


# == Generate CSS ==
cat << EOF > $CSS
@font-face {
  font-family: "$FONT_FAMILY";
  src: url("$(basename $TTF)") format("truetype");
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
