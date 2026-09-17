from pathlib import Path
import json,re,base64,zipfile
root=Path(__file__).parent
src=root/'src';vendor=root/'vendor'
if not (vendor/'katex.min.js').exists():
    with zipfile.ZipFile(root/'vendor-assets.zip') as archive: archive.extractall(vendor)
read=lambda name:(src/name).read_text()
def js_string(value):
    return json.dumps(value,ensure_ascii=False).replace('<','\\u003c')
def inline_fonts(css):
    def replace(match):
        path=vendor/match[1];mime='font/woff2' if path.suffix=='.woff2' else 'font/ttf'
        return 'url(data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()+')'
    return re.sub(r'url\((fonts/[^)]+)\)',replace,css)
math_css=inline_fonts((vendor/'katex.min.css').read_text())
font_css=inline_fonts((vendor/'ui-fonts.css').read_text())
fonts={}
for block in re.findall(r'@font-face\s*\{[^}]+\}',font_css):
    name=re.search(r"font-family:\s*'([^']+)'",block)[1]
    fonts[name]=fonts.get(name,'')+block
core,game,css=read('core.js'),read('game.js'),read('game.css')
math_js=(vendor/'katex.min.js').read_text().replace('</script','<\\/script')
game_source='\n'.join([math_js,core,read('support.js'),read('barrel-art.js'),read('media.js'),read('storage.js'),read('scratch.js'),read('viewport.js'),read('cell-drag.js'),read('task-peek.js'),game])
export_js='const GAME_SOURCE='+js_string(game_source)+';\nconst GAME_CSS='+js_string(css)+';\nconst MATH_CSS='+js_string(math_css)+';\nconst UI_FONT_CSS='+js_string(fonts)+';\n'
# UI_FONT_CSS is an object, not a double-encoded string.
export_js=export_js.replace('const UI_FONT_CSS='+js_string(fonts), 'const UI_FONT_CSS='+json.dumps(fonts,ensure_ascii=False).replace('<','\\u003c'))
export_js+=read('export-runtime.js')
(src/'export.js').write_text(export_js)
html=read('editor.html')
font_styles='<style id="math-css">'+math_css+'</style>'+''.join('<style id="font-'+name.replace(' ','-')+'">'+css+'</style>' for name,css in fonts.items())
html=html.replace('/*FONT_STYLES*/',font_styles)
editor_export="const GAME_SOURCE=document.getElementById('core-source').textContent+'\\n'+document.getElementById('game-source').textContent;const GAME_CSS=document.getElementById('game-css').textContent;const MATH_CSS=document.getElementById('math-css').textContent;const UI_FONT_CSS=Object.fromEntries(['Nunito','Roboto','Open Sans'].map(name=>[name,document.getElementById('font-'+name.replaceAll(' ','-')).textContent]));\n"+read('export-runtime.js')
replacements=[('EDITOR_CSS',read('editor.css')),('GAME_CSS',css),('CORE_JS',math_js+'\n'+core+'\n'+read('support.js')+'\n'+read('barrel-art.js')+'\n'+read('media.js')+'\n'+read('storage.js')+'\n'+read('scratch.js')+'\n'+read('viewport.js')+'\n'+read('cell-drag.js')+'\n'+read('task-peek.js')),('GAME_JS',game),('EXPORT_JS',editor_export),('EDITOR_JS',read('gif-codecs.js')+'\n'+read('editor-media.js')+'\n'+read('editor-i18n.js')+'\n'+read('editor-extras.js')+'\n'+read('editor.js'))]
for tag,content in replacements:html=html.replace('/*'+tag+'*/',content)
html=html.replace('Лото Студия <b>1.0</b>','Лото Студия <b>1.5</b>')
(root/'Редактор Лото.html').write_text(html);(root/'index.html').write_text(html)
print('Готово: Редактор Лото.html ('+str(len(html.encode()))+' байт)')
