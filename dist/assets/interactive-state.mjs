export const cloneState=x=>JSON.parse(JSON.stringify(x));
export function sceneAt(scenes,t){return scenes.find(s=>t>=s.start&&t<s.end)||scenes.at(-1);}
export function playbackState(){return{time:0,trial:null,savedTime:null,selected:0,history:[]};}
export function seekState(s,t,duration){s.time=Math.max(0,Math.min(duration,t));s.trial=null;s.savedTime=null;s.history=[];}
export function beginTrial(s,scene,index=0){if(!s.trial){s.savedTime=s.time;s.trial=cloneState(scene.rows);s.history=[];}s.selected=index;}
export function endTrial(s){s.time=s.savedTime??s.time;s.trial=null;s.savedTime=null;s.history=[];}
export function editTrial(s,f){if(!s.trial)return;s.history.push(cloneState(s.trial));f(s.trial);}
