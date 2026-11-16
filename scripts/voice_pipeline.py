"""Build static bilingual teaching audio. No synthesis happens during playback.

prepare -> synthesize (network, two requests maximum) -> build (offline).
Cache keys include text, voice and rate. Existing authoring/audio is not erased.
"""
import argparse, asyncio, copy, hashlib, html, json, re, subprocess, wave
from pathlib import Path
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / 'build/voice-repair-2026-11-16'
PLAN = WORK / 'plan.json'
COPY = ROOT / 'content/narration-bilingual.tsv'
VOICES = {'zh': 'zh-CN-XiaoyiNeural', 'en': 'en-GB-SoniaNeural'}
FF = imageio_ffmpeg.get_ffmpeg_exe()

def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def save(p, d):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def clean(text): return ''.join(c.lower() for c in html.unescape(text) if c.isalnum())
def run(args): subprocess.run([FF, '-v', 'error', '-threads', '2', '-y', *map(str,args)], check=True)
def duration(p):
    with wave.open(str(p),'rb') as f: return f.getnframes()/f.getframerate()

def prepare():
    edits = {}
    for line in COPY.read_text(encoding='utf-8-sig').splitlines():
        if line.strip():
            key, zh, en = line.split('|')
            if key in edits: raise ValueError('duplicate '+key)
            edits[key] = (zh,en)
    stories = read(ROOT/'dist/data/stories.json')
    plan = {'voices':VOICES, 'rate':'+6%', 'lessons':{}}
    for n in range(2,9):
        lab = f'{n:02}'
        if n<8: base=read(ROOT/f'build/lab{lab}/authoring.json')
        else:
            raw=(ROOT/'dist/lessons/08/teaching/lesson-data.mjs').read_text(encoding='utf-8')
            base=json.loads(raw.removeprefix('export default ').strip().removesuffix(';'))
        sources={s['key']:s for s in stories.get(lab,[])}
        lesson=copy.deepcopy(base)
        for s in lesson['scenes']:
            key=f'{lab}.{s["key"]}'
            zh,en=edits.pop(key)
            old=s.get('say')
            fallback=old.get('zh','') if isinstance(old,dict) else old
            zh=zh or fallback or sources.get(s.get('voice'),{}).get('say',{}).get('zh','')
            zh=zh.replace('B*-tree','B星树').replace('ΔE','能量差')
            zh=re.sub(r'Lab\s*([2-8])',lambda m:'第'+{'2':'二','3':'三','4':'四','5':'五','6':'六','7':'七','8':'八'}[m[1]]+'课',zh)
            assert zh and en,key
            s['narration']={'zh':zh,'en':en}
        plan['lessons'][lab]=lesson
    assert not edits,edits.keys()
    save(PLAN,plan)
    print('Prepared',sum(len(d['scenes']) for d in plan['lessons'].values()),'scenes in two languages.',flush=True)

def paths(lab,key,lang,text,plan):
    stamp=hashlib.sha256(json.dumps([text,plan['voices'][lang],plan['rate']],ensure_ascii=False).encode()).hexdigest()[:16]
    p=WORK/'clips'/lab/lang/(key+'-'+stamp)
    p.parent.mkdir(parents=True,exist_ok=True)
    return p.with_suffix('.mp3'),p.with_suffix('.json')

async def synthesize():
    import edge_tts
    plan=read(PLAN); sem=asyncio.Semaphore(2); completed=0
    async def one(lab,s,lang):
        nonlocal completed
        text=s['narration'][lang]; audio,meta=paths(lab,s['key'],lang,text,plan)
        if audio.exists() and meta.exists() and read(meta).get('sha256')==sha(audio): return
        async with sem:
            for attempt in range(3):
                temp=audio.with_suffix('.part')
                async def generate():
                    marks=[]
                    talk=edge_tts.Communicate(text,plan['voices'][lang],rate=plan['rate'],boundary='WordBoundary')
                    with temp.open('wb') as f:
                        async for event in talk.stream():
                            if event['type']=='audio': f.write(event['data'])
                            elif event['type']=='WordBoundary': marks.append(event)
                    if not marks or temp.stat().st_size<1000: raise ValueError('Empty audio or missing real word boundaries')
                    temp.replace(audio)
                    save(meta,{'voice':plan['voices'][lang],'rate':plan['rate'],'text':text,'sha256':sha(audio),'events':marks})
                try:
                    await asyncio.wait_for(generate(),60)
                    completed+=1
                    print(f'{completed} generated {lab}/{lang}/{s["key"]}',flush=True)
                    break
                except Exception as e:
                    print(f'Retry {attempt+1} {lab}/{lang}/{s["key"]}: {type(e).__name__}',flush=True)
                    if attempt==2: raise
                    await asyncio.sleep(1+attempt)
    await asyncio.gather(*(one(lab,s,lang) for lab,d in plan['lessons'].items() for s in d['scenes'] for lang in VOICES))

def sentence_captions(text,words,key):
    parts=re.findall(r'[^。！？!?]+[。！？!?]*',text) if re.search('[\u4e00-\u9fff]',text) else re.findall(r'.+?(?:[.!?](?:\s+|$)|$)',text)
    spans=[]; charpos=0
    for w in words:
        size=len(clean(w['text'])); spans.append((charpos,charpos+size,w)); charpos+=size
    # Service text must actually cover the submitted text. Never guess timings by character ratios.
    assert ''.join(clean(w['text']) for w in words)==clean(text),(key,'WordBoundary text mismatch')
    offset=0; result=[]
    for part in parts:
        end=offset+len(clean(part)); chosen=[w for a,b,w in spans if b>offset and a<end]
        if chosen:
            result.append({'start':chosen[0]['start'],'end':chosen[-1]['end'],'text':part.strip(),'delivery':'voice','sourceKey':key,'words':chosen})
        offset=end
    assert result and offset==charpos,key
    return result

def build(labs=None):
    plan=read(PLAN); reports=[]
    annotations=read(ROOT/'content/voice-cues.json')
    titles=read(ROOT/'content/teaching-titles-en.json')
    questions={}
    for line in (ROOT/'content/teaching-questions-en.tsv').read_text(encoding='utf8').splitlines():
        if line.strip():
            key,prompt,*items=line.split('|'); assert len(items)==6,key
            questions[key]={'prompt':prompt,'choices':items[:3],'replies':items[3:]}
    for lab,base in plan['lessons'].items():
        if labs and lab not in labs: continue
        for lang in VOICES:
            d=copy.deepcopy(base); cursor=0.; clips=[]; captions=[]; utterances=[]
            tmp=WORK/'assembled'/lab/lang; tmp.mkdir(parents=True,exist_ok=True)
            for s in d['scenes']:
                key=s['key']; text=s['narration'][lang]; audio,meta=paths(lab,key,lang,text,plan)
                info=read(meta); assert sha(audio)==info['sha256']
                wav=tmp/(key+'.wav'); padded=tmp/(key+'.pad.wav')
                run(['-i',audio,'-ar','24000','-ac','1','-c:a','pcm_s16le',wav])
                secs=duration(wav); lead=.22; tail=.45
                run(['-i',wav,'-af',f'adelay=220,apad=pad_dur={tail}','-c:a','pcm_s16le',padded])
                total=duration(padded)
                words=[dict(text=e['text'],start=round(cursor+lead+e['offset']/1e7,6),end=round(cursor+lead+(e['offset']+e['duration'])/1e7,6)) for e in info['events']]
                assert words[-1]['end']<=cursor+total+.02,(lab,key,secs,words[-1])
                cues=sentence_captions(text,words,key)
                captions.extend(cues)
                s.update(start=round(cursor,6),end=round(cursor+total,6),seconds=round(total,6),delivery='voice',voice=plan['voices'][lang],speechStart=words[0]['start'],speechEnd=words[-1]['end'],wordCues=words)
                spec=annotations.get(lab+'.'+key,{}).get(lang,{})
                def phrase(phrase,end=False):
                    joined=''.join(clean(w['text']) for w in words); token=clean(phrase); at=joined.find(token)
                    if at<0: raise ValueError(f'Missing semantic cue {lab}/{lang}/{key}: {phrase}')
                    offset=0; selected=[]
                    for w in words:
                        n=len(clean(w['text']))
                        if offset+n>at and offset<at+len(token): selected.append(w)
                        offset+=n
                    return selected[-1]['end'] if end else selected[0]['start']
                if 'motion' in spec:
                    first,last=spec['motion']; a=phrase(first); b=phrase(last,True)
                    assert a<b,(lab,lang,key)
                    s['motionStart']=round(a-cursor,6);s['motionEnd']=round(b-cursor,6);s['anchorType']='measured-word'
                if 'visual' in spec:
                    s['visualCues']=[{'at':cursor,'p':0}]+[{'at':phrase(token),'p':p} for token,p in spec['visual']]+[{'at':cursor+total,'p':1}]
                    assert all(a['at']<b['at'] and a['p']<b['p'] for a,b in zip(s['visualCues'],s['visualCues'][1:])),(lab,key)
                if isinstance(s.get('say'),dict): s['say'][lang]=text
                else: s['say']=text
                if lang=='en':
                    title=titles[lab][key]
                    if isinstance(s.get('title'),dict): s['title']['en']=title
                    else: s['title']=title
                    s['note']=text.split('. ')[0]
                    if len(s['note'])>105: s['note']=s['note'][:102].rsplit(' ',1)[0]+'…'
                    if s.get('question'): s['question'].update(questions[lab+'.'+key])
                utterances.append({'scene':key,'text':text,'voice':info['voice'],'source':str(audio.relative_to(ROOT)).replace('\\','/'),'sha256':info['sha256'],'start':words[0]['start'],'end':words[-1]['end'],'wordBoundaries':len(words)})
                clips.append(padded); cursor+=total
            listing=tmp/'concat.txt'; listing.write_text(''.join("file '%s'\n"%p.as_posix() for p in clips),encoding='utf8')
            out=ROOT/f'dist/lessons/{lab}/teaching'; suffix='' if lang=='zh' else '-en'
            target=out/f'narration{suffix}.m4a'
            run(['-f','concat','-safe','0','-i',listing,'-c:a','aac','-b:a','96k','-movflags','+faststart',target])
            d.update(duration=round(cursor,6),readingSeconds=0,newSpeech=True,language=lang,captions=captions,cuts=[],utterances=utterances,voice=plan['voices'][lang],audioSha256=sha(target),sourceHashes={'content/narration-bilingual.tsv':sha(COPY),'build/voice-repair-2026-11-16/plan.json':sha(PLAN)})
            if lang=='en' and lab!='08':
                d['chapters']=[next(s['title'] for s in d['scenes'] if s['chapter']==i+1) for i in range(len(d['chapters']))]
            (out/f'lesson-data{suffix}.mjs').write_text('export default '+json.dumps(d,ensure_ascii=False)+';\n',encoding='utf8')
            if lang=='zh':
                save(ROOT/f'build/lab{lab}/provenance.json',d)
                if lab=='08': save(ROOT/'build/complete-interactive-manifest.json',d)
            reports.append({'lab':lab,'language':lang,'scenes':len(d['scenes']),'duration':d['duration'],'captions':len(captions),'voice':d['voice'],'readingSeconds':0})
            print('Built',reports[-1],flush=True)
    save(WORK/'coverage.json',reports)

if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('action',choices=['prepare','synthesize','build']); parser.add_argument('--labs',nargs='+'); args=parser.parse_args()
    if args.action=='prepare': prepare()
    elif args.action=='synthesize': asyncio.run(synthesize())
    else: build(args.labs)
