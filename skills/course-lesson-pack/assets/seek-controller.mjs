// A gesture temporarily pauses media, while retaining the user's prior intent.
// Explicit pause, trial, hidden-page and disposal cancel that intent.
export function bindSeek(range,{isPlaying,pause,seek,play,eventTarget=window}){
 let active=false,resume=false;
 function cancel(){active=false;resume=false;}
 function input(){
  const target=Number(range.value); // pause() may render and overwrite the slider.
  if(!active){const intended=isPlaying();pause();active=true;resume=intended;}
  seek(target);
 }
 function commit(){if(!active)return;const intended=resume;cancel();if(intended)play();}
 function interrupted(){cancel();pause();}
 range.addEventListener('input',input);
 range.addEventListener('change',commit);
 range.addEventListener('blur',commit);
 eventTarget.addEventListener('pointerup',commit);
 eventTarget.addEventListener('pointercancel',interrupted);
 return{cancel,get active(){return active;},dispose(){cancel();range.removeEventListener('input',input);range.removeEventListener('change',commit);range.removeEventListener('blur',commit);eventTarget.removeEventListener('pointerup',commit);eventTarget.removeEventListener('pointercancel',interrupted);}};
}
