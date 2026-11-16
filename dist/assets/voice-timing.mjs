export function sceneProgress(scene,time){
 const cues=scene.visualCues;if(cues?.length){if(time<=cues[0].at)return cues[0].p;for(let i=1;i<cues.length;i++)if(time<=cues[i].at){const a=cues[i-1],b=cues[i];return a.p+(b.p-a.p)*(time-a.at)/(b.at-a.at);}return 1;}
 const start=scene.speechStart??scene.start,end=scene.speechEnd??scene.end;return Math.max(0,Math.min(1,(time-start)/(end-start)));
}
export function motionProgress(scene,time,reduced=false){if(reduced)return 1;const a=scene.start+(scene.motionStart??1),b=scene.start+(scene.motionEnd??3.7);return Math.max(0,Math.min(1,(time-a)/Math.max(.001,b-a)));}
