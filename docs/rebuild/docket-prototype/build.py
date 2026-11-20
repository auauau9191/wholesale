D='/tmp/claude-0/-home-claude/330a1bfe-ff63-5625-a2c5-134b965420da/scratchpad/docket/'
src=open(D+'index.html').read().replace('LOTTIES_PLACEHOLDER',open(D+'lotties.js').read())
open(D+'dist/index.html','w').write(src)
# local test page with the publish skeleton around it
sk='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
open(D+'dist/test.html','w').write(sk+src+'</body></html>')
print('built',len(src))
