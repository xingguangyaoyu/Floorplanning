"""Validate measured new narration without weakening legacy-source checks."""
import hashlib, json, wave, math, array
from pathlib import Path

def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def protect_measured_narration(root,lab):
    p=root/'build/complete-interactive-manifest.json' if lab=='08' else root/f'build/lab{lab}/provenance.json'
    if p.exists() and json.loads(p.read_text(encoding='utf8')).get('newSpeech'):
        raise SystemExit('Refusing to replace complete narration with legacy silent/reused audio. Use: python scripts/voice_pipeline.py build')
def validate_new(data,root,audio):
    assert data['newSpeech'] and data['readingSeconds']==0 and data['cuts']==[]
    assert digest(audio)==data['audioSha256']
    assert data['language'] in ('zh','en')
    assert len(data['utterances'])==len(data['scenes'])
    cursor=0; keys=set()
    for scene,u in zip(data['scenes'],data['utterances']):
        key=scene['key'];assert key not in keys;keys.add(key)
        assert abs(scene['start']-cursor)<1e-5 and scene['end']>scene['start'];cursor=scene['end']
        assert scene['delivery']=='voice' and u['scene']==key and u['voice']==data['voice']
        source=root/u['source'];assert digest(source)==u['sha256']
        words=scene['wordCues'];assert words and len(words)==u['wordBoundaries']
        assert scene['start']<=words[0]['start']<words[-1]['end']<=scene['end']+.02
        assert all(w['start']<w['end'] for w in words)
        assert all(a['end']<=b['start']+.025 for a,b in zip(words,words[1:]))
        cues=[c for c in data['captions'] if c['sourceKey']==key]
        assert cues and all(c['words'] for c in cues)
        assert ''.join(w['text'] for c in cues for w in c['words'])==''.join(w['text'] for w in words)
        assert all(scene['start']<=c['start']<c['end']<=scene['end']+.02 for c in cues)
        if 'motionStart' in scene:
            assert 0<=scene['motionStart']<scene['motionEnd']<=scene['end']-scene['start']+.02
    assert abs(cursor-data['duration'])<1e-5
    for name,value in data['sourceHashes'].items():assert digest(root/name)==value,name

if __name__=='__main__':
    root=Path(__file__).resolve().parents[1];results=[]
    for n in range(2,9):
        for lang in ('zh','en'):
            suffix='' if lang=='zh' else '-en';out=root/f'dist/lessons/{n:02}/teaching'
            data=json.loads((out/f'lesson-data{suffix}.mjs').read_text(encoding='utf8').removeprefix('export default ').strip().removesuffix(';'))
            validate_new(data,root,out/f'narration{suffix}.m4a')
            # Every source is decoded by the builder. A nonzero RMS prevents a
            # well-formed silent clip from being mistaken for complete narration.
            for s in data['scenes']:
                wav=root/f'build/voice-repair-2026-11-16/assembled/{n:02}/{lang}/{s["key"]}.wav'
                with wave.open(str(wav),'rb') as w:
                    assert w.getsampwidth()==2 and w.getnchannels()==1
                    samples=array.array('h',w.readframes(w.getnframes()))
                rms=math.sqrt(sum(v*v for v in samples)/len(samples));assert rms>15,(n,lang,s['key'],rms)
            results.append({'lab':f'{n:02}','lang':lang,'scenes':len(data['scenes']),'duration':data['duration'],'completeNarration':True,'realWordBoundaries':True,'nonSilentClips':True})
    target=root/'build/voice-repair-2026-11-16/checks.json';target.write_text(json.dumps(results,indent=2),encoding='utf8')
    print('PASS:',len(results),'tracks,',sum(r['scenes'] for r in results),'narrated scenes; source hashes, real boundaries and non-silent clips.')
