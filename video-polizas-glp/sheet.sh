#!/bin/bash
# sheet.sh out.jpg t1..t9  : renderiza stills y arma una hoja 3x3
P=$(dirname "$0"); out=$1; shift
node $P/still.js "$@" >/dev/null 2>&1
args=""; for t in "$@"; do args="$args -i $P/stills/$(printf '%.1f' $t).jpg"; done
ffmpeg -y -loglevel error $args -filter_complex "xstack=inputs=9:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h1|w0_h0+h1|w0+w1_h0+h1,scale=1920:-1" $P/stills/$out
