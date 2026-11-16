// Paint decoded MP4 frames into an ordinary 2D canvas. This avoids relying on
// the native video presentation layer, while retaining the actual MP4 timeline.
export function bindVideoDisplay({video,root,lang='zh'}){
 if(!video||!root)return;
 const canvas=root.querySelector('canvas'),play=root.querySelector('[data-video-play]'),seek=root.querySelector('[data-video-position]'),clock=root.querySelector('[data-video-clock]'),mode=root.querySelector('[data-video-display]'),full=root.querySelector('[data-video-fullscreen]'),mute=root.querySelector('[data-video-mute]');
 const context=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
 const events=new AbortController();
 const status=document.createElement('p');status.className='video-error';status.setAttribute('role','status');status.hidden=true;root.append(status);
 let compatible=true,raf=0,lastPaint=-1,lastDiagnostic=-2,disposed=false;
 const label=(zh,en)=>lang==='zh'?zh:en;
 const stamp=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
 function fail(error){if(disposed)return;cancelAnimationFrame(raf);raf=0;video.pause();status.hidden=false;status.textContent=label('视频显示失败，已暂停。可切换“原生视频”、重试播放，或下载 MP4。','Video display failed and playback paused. Try native video, retry, or download the MP4.');root.dataset.displayError=String(error?.message||error||'media error');}
 function paint(force=false){
  if(disposed||!compatible||video.readyState<2||!video.videoWidth)return;
  const t=video.currentTime;if(!force&&Math.abs(t-lastPaint)<1/15)return;
  if(canvas.width!==video.videoWidth||canvas.height!==video.videoHeight){canvas.width=video.videoWidth;canvas.height=video.videoHeight;}
  try{context.drawImage(video,0,0,canvas.width,canvas.height);}catch(error){fail(error);return;}lastPaint=t;
  canvas.dataset.paintedTime=String(t);
  // Read back a small spatial sample for local QA: actual decoded frame pixels,
  // independent of whether a native video plane is visible on the user's screen.
  if(force||Math.abs(t-lastDiagnostic)>1){try{const bg=context.getImageData(0,0,1,1).data;let lit=0;for(let y=1;y<=5;y++)for(let x=1;x<=9;x++){const p=context.getImageData(Math.floor(canvas.width*x/10),Math.floor(canvas.height*y/6),1,1).data;if(Math.max(...[0,1,2].map(i=>Math.abs(p[i]-bg[i])))>45)lit++;}canvas.dataset.detailSamples=String(lit);lastDiagnostic=t;}catch(error){fail(error);}}
 }
 function update(){
  if(disposed)return;seek.max=Number.isFinite(video.duration)?video.duration:0;seek.value=video.currentTime;
  play.textContent=video.paused?label('播放','Play'):label('暂停','Pause');play.setAttribute('aria-label',video.paused?label('播放视频','Play video'):label('暂停视频','Pause video'));
  clock.textContent=`${stamp(video.currentTime)} / ${stamp(Number.isFinite(video.duration)?video.duration:0)}`;if(mute){mute.textContent=video.muted?label('开启声音','Unmute'):label('静音','Mute');mute.setAttribute('aria-label',mute.textContent);}paint();
 }
 function tick(){raf=0;update();if(!disposed&&!video.paused&&compatible)raf=requestAnimationFrame(tick);}
 function schedule(){if(!raf&&!video.paused&&compatible)raf=requestAnimationFrame(tick);}
 function setMode(){
  compatible=mode.value==='compatible';root.classList.toggle('canvas-playback',compatible);canvas.hidden=!compatible;
  video.controls=!compatible;video.tabIndex=compatible?-1:0;root.querySelector('.video-canvas-controls').hidden=!compatible;
  if(compatible){paint(true);schedule();}else{cancelAnimationFrame(raf);raf=0;}
 }
 play.onclick=()=>{status.hidden=true;if(video.paused)video.play().catch(fail);else video.pause();};
 seek.oninput=()=>{video.currentTime=Number(seek.value);update();};
 full.onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else root.requestFullscreen?.().catch(()=>{});};
 if(mute)mute.onclick=()=>{video.muted=!video.muted;update();};
 mode.onchange=setMode;
 for(const event of ['loadeddata','loadedmetadata','seeked','pause','ended','timeupdate'])video.addEventListener(event,()=>{update();if(event==='seeked'||event==='pause')paint(true);},{signal:events.signal});
 video.addEventListener('play',()=>{update();schedule();},{signal:events.signal});video.addEventListener('error',()=>fail(video.error),{signal:events.signal});
 const poster=new Image();poster.onload=()=>{if(!disposed&&compatible&&video.readyState<2&&context){canvas.width=poster.naturalWidth;canvas.height=poster.naturalHeight;context.drawImage(poster,0,0);}};poster.src=video.poster;
 if(!context)mode.value='native';
 setMode();update();
 return ()=>{disposed=true;cancelAnimationFrame(raf);events.abort();poster.onload=null;play.onclick=seek.oninput=full.onclick=mode.onchange=null;if(mute)mute.onclick=null;};
}
