import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'brag-output-2026-10-14-162835');
function run(cmd,args,cwd=output){
  const result=spawnSync(cmd,args,{cwd,stdio:'inherit',shell:process.platform==='win32'&&cmd==='npx'});
  if(result.status!==0) throw new Error(`${cmd} failed (${result.status})`);
}
if(!process.argv.includes('--finish-only')){
  run('npx',['--yes','hyperframes@0.8.157','check'],path.join(output,'composition'));
  run('npx',['--yes','hyperframes@0.8.157','render','--fps','30','--quality','delivery','--output','../brag.mp4'],path.join(output,'composition'));
}
run('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss','10.3','-i','brag.mp4','-frames:v','1','-q:v','2','brag.jpg']);
run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i','brag.mp4','-i','brag.jpg','-filter_complex',"[0:v][1:v]overlay=0:0:enable='eq(n,0)'[v]",'-map','[v]','-map','0:a?','-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart','brag.poster.mp4']);
fs.renameSync(path.join(output,'brag.poster.mp4'),path.join(output,'brag.mp4'));
for(const [source,dest] of [['brag.mp4','order-film.mp4'],['brag.jpg','order-film-poster.jpg']]) fs.copyFileSync(path.join(output,source),path.join(root,'public/assets',dest));
run('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,width,height,r_frame_rate,nb_frames','-of','json','brag.mp4']);
console.log('Published the local web assets for the 20-second order film.');
