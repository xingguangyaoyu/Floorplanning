"""Static development server with byte ranges for seekable audio/video."""
import argparse,functools,http.server,mimetypes,re
from pathlib import Path
mimetypes.add_type('text/javascript','.mjs');mimetypes.add_type('application/wasm','.wasm')
class Handler(http.server.SimpleHTTPRequestHandler):
 def send_head(self):
  p=Path(self.translate_path(self.path.split('?')[0]))
  if not p.is_file() or not self.headers.get('Range'):return super().send_head()
  m=re.fullmatch(r'bytes=(\d*)-(\d*)',self.headers['Range'])
  if not m:return super().send_head()
  size=p.stat().st_size
  if m[1]:start=int(m[1]);end=min(int(m[2]) if m[2] else size-1,size-1)
  else:start=max(0,size-int(m[2]));end=size-1
  if start>=size or end<start:self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.end_headers();return None
  self.send_response(206);self.send_header('Content-Type',self.guess_type(str(p)));self.send_header('Accept-Ranges','bytes');self.send_header('Content-Range',f'bytes {start}-{end}/{size}');self.send_header('Content-Length',str(end-start+1));self.end_headers();f=p.open('rb');f.seek(start);self.range_remaining=end-start+1;return f
 def copyfile(self,source,outputfile):
  if not hasattr(self,'range_remaining'):return super().copyfile(source,outputfile)
  try:
   left=self.range_remaining
   while left:
    buf=source.read(min(65536,left))
    if not buf:break
    outputfile.write(buf);left-=len(buf)
  finally:del self.range_remaining
 def end_headers(self):
  self.send_header('Cache-Control','no-store, max-age=0');self.send_header('Pragma','no-cache')
  self.send_header('X-Content-Type-Options','nosniff');super().end_headers()
p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8830);p.add_argument('--directory',default=str(Path(__file__).resolve().parents[1]/'dist'));args=p.parse_args()
handler=functools.partial(Handler,directory=args.directory)
server=http.server.ThreadingHTTPServer(('127.0.0.1',args.port),handler)
print(f'Local: http://127.0.0.1:{args.port}/',flush=True);server.serve_forever()
