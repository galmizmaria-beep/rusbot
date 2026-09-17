from pathlib import Path
import json
root=Path(__file__).parent
src=root/'src'
read=lambda name:(src/name).read_text()
core,game,css=read('core.js'),read('game.js'),read('game.css')
export_js='const GAME_SOURCE='+json.dumps(core+'\n'+game,ensure_ascii=False)+';\nconst GAME_CSS='+json.dumps(css,ensure_ascii=False)+''';
function makeHTML(project){const data=JSON.stringify(project).replace(/</g,'\\u003c');return '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+Loto.esc(project.title)+'</title><style>'+GAME_CSS+'</style></head><body class="standalone"><main id="game"></main><script>'+GAME_SOURCE+'\\nconst project='+data+';const game=new LotoGame(document.getElementById("game"),project);window.addEventListener("beforeunload",e=>{if(game.session?.status==="playing"&&(game.session.done.size||game.session.errors)){e.preventDefault();e.returnValue="";}});<'+ '/script></body></html>';}
'''
# Literal backslash-u must survive JS parsing, so JSON text cannot close its script.
export_js=export_js.replace("replace(/</g,'\\u003c')", "replace(/</g,'\\\\u003c')")
(src/'export.js').write_text(export_js)
html=read('editor.html')
for tag,content in [('EDITOR_CSS',read('editor.css')),('GAME_CSS',css),('CORE_JS',core),('GAME_JS',game),('EXPORT_JS',export_js),('EDITOR_JS',read('editor.js'))]:
    html=html.replace('/*'+tag+'*/',content)
(root/'Редактор Лото.html').write_text(html)
(root/'index.html').write_text(html)
print('Готово: Редактор Лото.html ('+str(len(html.encode()))+' байт)')
