// Real thinking time is independent of audio playback speed.
export function questionClock(){return {phase:'thinking',left:10,held:false};}
export function advanceQuestion(q,seconds){
 if(!q||q.held||q.phase==='done')return null;
 q.left=Math.max(0,q.left-seconds);
 if(q.left>0)return null;
 if(q.phase==='thinking'){q.phase='explanation';q.left=4;return'reveal';}
 q.phase='done';return'continue';
}
export function revealQuestion(q){q.phase='explanation';q.left=4;q.held=false;}
