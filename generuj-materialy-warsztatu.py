"""Aktualizuje materiały do eksportu JSON po zmianach w kursie."""
from base64 import b64encode
import json
import mimetypes
from pathlib import Path

root = Path(__file__).resolve().parent
pages = [path for path in root.glob('*.html') if path.name != 'run copy.html']
assets = [path for path in (root / 'materialy').rglob('*') if path.is_file()]
materials = []

for path in sorted(pages + assets):
    content = path.read_bytes()
    try:
        value = content.decode('utf-8')
        encoding = 'utf-8'
    except UnicodeDecodeError:
        value = b64encode(content).decode('ascii')
        encoding = 'base64'
    materials.append({
        'sciezka': path.relative_to(root).as_posix(),
        'typ': mimetypes.guess_type(path.name)[0] or 'application/octet-stream',
        'kodowanie': encoding,
        'zawartosc': value,
    })

output = json.dumps(materials, ensure_ascii=False, separators=(',', ':'))
(root / 'warsztat-materialy.js').write_text('window.materialyWarsztatu = ' + output + ';\n')
print(f'Zaktualizowano {len(materials)} materiałów do eksportu.')
