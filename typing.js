(() => {
const $=s=>document.querySelector(s);
const target=$('#target'), input=$('#typingInput'), msg=$('#message');
const musicToggle=$('#musicToggle'), musicStyle=$('#musicStyle'), musicVolume=$('#musicVolume'), musicStatus=$('#musicStatus');
const musicTracks={calm:$('#calmMusic'),gaming:$('#gamingMusic')};
let musicPrefs={enabled:false,style:'calm',volume:35};
try{musicPrefs={...musicPrefs,...JSON.parse(localStorage.getItem('smartTypingVillaMusic')||'{}')};}catch(e){}
function saveMusicPrefs(){localStorage.setItem('smartTypingVillaMusic',JSON.stringify(musicPrefs));}
function setMusicStatus(text){musicStatus.textContent=text;}
function applyMusicSettings(){
 musicStyle.value=musicPrefs.style==='gaming'?'gaming':'calm';
 musicVolume.value=String(Math.max(0,Math.min(100,Number(musicPrefs.volume)||0)));
 Object.entries(musicTracks).forEach(([key,audio])=>{audio.volume=Number(musicVolume.value)/100;if(key!==musicPrefs.style){audio.pause();audio.currentTime=0;}});
 musicToggle.setAttribute('aria-pressed',String(musicPrefs.enabled));
 musicToggle.textContent=musicPrefs.enabled?'■ Turn Music Off':'▶ Turn Music On';
}
async function startSelectedMusic(){
 const chosen=musicTracks[musicPrefs.style]||musicTracks.calm;
 Object.entries(musicTracks).forEach(([key,audio])=>{if(audio!==chosen){audio.pause();audio.currentTime=0;}});
 chosen.volume=Number(musicVolume.value)/100;
 try{await chosen.play();musicPrefs.enabled=true;musicToggle.setAttribute('aria-pressed','true');musicToggle.textContent='■ Turn Music Off';setMusicStatus(musicPrefs.style==='gaming'?'Playing upbeat gaming music':'Playing calm instrumental music');saveMusicPrefs();}
 catch(e){musicPrefs.enabled=false;musicToggle.setAttribute('aria-pressed','false');musicToggle.textContent='▶ Turn Music On';setMusicStatus('Tap Turn Music On to allow audio playback');}
}
function stopMusic(){Object.values(musicTracks).forEach(audio=>audio.pause());musicPrefs.enabled=false;musicToggle.setAttribute('aria-pressed','false');musicToggle.textContent='▶ Turn Music On';setMusicStatus('Music is off');saveMusicPrefs();}
musicToggle.addEventListener('click',()=>{if(musicPrefs.enabled){stopMusic();}else{musicPrefs.style=musicStyle.value;startSelectedMusic();}});
musicStyle.addEventListener('change',()=>{musicPrefs.style=musicStyle.value;saveMusicPrefs();if(musicPrefs.enabled)startSelectedMusic();else setMusicStatus(musicPrefs.style==='gaming'?'Upbeat gaming music selected':'Calm instrumental selected');});
musicVolume.addEventListener('input',()=>{musicPrefs.volume=Number(musicVolume.value);Object.values(musicTracks).forEach(audio=>audio.volume=musicPrefs.volume/100);saveMusicPrefs();});
Object.values(musicTracks).forEach(audio=>audio.addEventListener('error',()=>setMusicStatus('Could not load music file. Check that the audio folder was deployed.')));
applyMusicSettings();
if(musicPrefs.enabled){musicPrefs.enabled=false;saveMusicPrefs();setMusicStatus('Tap Turn Music On to start');}

const words=[
"asdf jkl; asdf jkl;","sad lad ask flask;","read red desk deal","fast task safe fall",
"qwerty poiuy asdf jkl;","type with both hands","keep your eyes on the screen",
"practice builds keyboard muscle memory","smarttep academy helps learners grow",
"accuracy first then speed","do not look down at the keyboard",
"professional typing requires rhythm focus and consistency",
"the quick brown fox jumps over the lazy dog",
"learning to type without looking makes digital work faster"
];
const levels=Array.from({length:12},(_,i)=>i+1);
let state={mode:'training',text:'',started:0,errors:0,correct:0,finished:false,score:0,level:1,xp:0,keyErrors:{}};
let progress={bestWpm:0,bestAccuracy:0,bestScore:0,totalSessions:0,totalSeconds:0,streak:0,level:1,xp:0,weakestKeys:[]};
let local=JSON.parse(localStorage.getItem('smartTypingVilla')||'null'); if(local) progress={...progress,...local};

function saveLocal(){localStorage.setItem('smartTypingVilla',JSON.stringify(progress));}
function renderTarget(){
 target.innerHTML=[...state.text].map((c,i)=>`<span class="${i<input.value.length?(input.value[i]===c?'done':'bad'):i===input.value.length?'current':''}">${c===' '?'&nbsp;':c.replace(/&/g,'&amp;')}</span>`).join('');
}
function pickText(){state.text=words[Math.min(words.length-1,Math.floor((state.level-1)*1.2))];input.value='';renderTarget();}
function updateStats(){
 const elapsed=state.started?Math.max(.2,(Date.now()-state.started)/60000):0;
 const chars=Math.max(1,input.value.length);
 const wpm=Math.round((state.correct/5)/elapsed)||0;
 const acc=Math.round((state.correct/Math.max(1,state.correct+state.errors))*100);
 $('#wpm').textContent=wpm; $('#accuracy').textContent=acc+'%'; $('#score').textContent=Math.round(state.score);
 $('#level').textContent=state.level; $('#xp').textContent=state.xp;
 return {wpm,acc,elapsed};
}
function showProgress(){
 $('#bestWpm').textContent=progress.bestWpm; $('#bestAccuracy').textContent=Math.round(progress.bestAccuracy)+'%';
 $('#sessions').textContent=progress.totalSessions; $('#practiceTime').textContent=Math.round(progress.totalSeconds/60)+' min';
 $('#streak').textContent=progress.streak; $('#courseProgress').style.width=Math.min(100,(progress.level/12)*100)+'%';
 $('#courseLabel').textContent=`Level ${progress.level} of 12`;
 const weak=(progress.weakestKeys||[]).slice(0,5);
 $('#coach').textContent=weak.length?`Focus on: ${weak.join('  ')}. Slow down and repeat those keys.`:'Start a session to identify keys that need more practice.';
}
function buildKeys(){
 const chars='qwertyuiopasdfghjkl;zxcvbnm,./1234567890';
 $('#keygrid').innerHTML=[...chars].map(c=>`<span data-key="${c}">${c}</span>`).join('');
}
function finish(){
 if(state.finished)return; state.finished=true;
 const {wpm,acc,elapsed}=updateStats(); const seconds=Math.round(elapsed*60);
 progress.bestWpm=Math.max(progress.bestWpm,wpm); progress.bestAccuracy=Math.max(progress.bestAccuracy,acc);
 progress.bestScore=Math.max(progress.bestScore,Math.round(state.score)); progress.totalSessions++;
 progress.totalSeconds+=seconds; progress.streak=Math.max(progress.streak,1);
 progress.level=Math.max(progress.level,state.level); progress.xp=Math.max(progress.xp,state.xp);
 const weak=Object.entries(state.keyErrors).sort((a,b)=>b[1]-a[1]).map(x=>x[0]).slice(0,8); if(weak.length)progress.weakestKeys=weak;
 saveLocal(); showProgress();
 
 msg.textContent=`Session complete: ${wpm} WPM • ${acc}% accuracy`;
}
function start(){state={mode:state.mode,text:'',started:0,errors:0,correct:0,finished:false,score:0,level:progress.level||1,xp:progress.xp||0,keyErrors:{}};pickText();msg.textContent='';input.focus();}
input.addEventListener('input',()=>{
 if(state.finished)return;
 if(!state.started)state.started=Date.now();
 const v=input.value, idx=v.length-1;
 if(idx>=0){if(v[idx]===state.text[idx]){state.correct++;state.score+=10;state.xp+=1}else{state.errors++;state.keyErrors[state.text[idx]]=(state.keyErrors[state.text[idx]]||0)+1;state.score=Math.max(0,state.score-4)}}
 renderTarget();updateStats();
 if(v===state.text){state.level=Math.min(12,Math.max(state.level,Math.floor(state.correct/18)+1));state.score+=100;state.xp+=25;finish();}
 if(state.mode==='accuracy' && state.errors>=3)finish();
 if(state.mode==='survival' && state.errors>=5)finish();
});
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-mode]').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.mode=b.dataset.mode;start();});
$('#restart').onclick=start;
$('#hideKeyboard').onclick=()=>{const g=$('#keygrid').parentElement;g.style.display=g.style.display==='none'?'block':'none';$('#hideKeyboard').textContent=g.style.display==='none'?'Show Keyboard':'Hide Keyboard';};
buildKeys();showProgress();start();


// Puppy Feeding Challenge: puppy remains visible through all 12 progression stages.
const puppyChallenges=[
 'asdf jkl;', 'sad dog', 'feed the dog', 'good puppy', 'type with care',
 'the puppy eats', 'smart typing villa', 'keep your eyes on screen',
 'practice makes typing better', 'accuracy comes before speed',
 'the happy puppy dances after eating', 'I can type without looking at my keyboard'
];
const puppyFoods=['🦴','🍖','🥩','🍪','🦴','🍗'];
let puppyData={stage:1,treats:0,cleared:0,streak:0,bestStreak:0};
try{puppyData={...puppyData,...JSON.parse(localStorage.getItem('smartTypingVillaPuppy')||'{}')};}catch(e){}
let puppyText='',puppyComplete=false,puppyNextTimer=null;
const puppy=$('#puppyDog'), puppyWrap=$('.puppy-character-wrap'), puppyInput=$('#puppyInput');
function savePuppy(){try{localStorage.setItem('smartTypingVillaPuppy',JSON.stringify(puppyData));}catch(e){}}
function puppySound(kind){
 const toggle=$('#puppySounds'); if(!toggle||!toggle.checked)return;
 try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;const ctx=new Ctx();const now=ctx.currentTime;
  if(kind==='bark'){
   // A short synthesized bark-like sound; no external audio file is needed.
   [0,.23].forEach((offset,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sawtooth';osc.frequency.setValueAtTime(i?220:300,now+offset);osc.frequency.exponentialRampToValueAtTime(i?95:125,now+offset+.12);gain.gain.setValueAtTime(.0001,now+offset);gain.gain.exponentialRampToValueAtTime(.22,now+offset+.018);gain.gain.exponentialRampToValueAtTime(.0001,now+offset+.15);osc.connect(gain);gain.connect(ctx.destination);osc.start(now+offset);osc.stop(now+offset+.16);});
  }else{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(650,now);osc.frequency.exponentialRampToValueAtTime(900,now+.12);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.09,now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+.18);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(now+.19);}
  setTimeout(()=>ctx.close(),600);
 }catch(e){}
}
function puppyStageLook(){
 const stage=Math.max(1,Math.min(12,Number(puppyData.stage)||1));
 $('#puppyStage').textContent=stage;
 $('#puppyAccessory').textContent=stage>=10?'👑':stage>=7?'🎖️':stage>=4?'🎀':'⭐';
 $('#puppyName').textContent=stage>=10?'Puppy Champion':stage>=7?'Super Feeder':stage>=4?'Happy Puppy':'Villa Puppy';
 $('#puppyCleared').textContent=puppyData.cleared;$('#puppyTreats').textContent=puppyData.treats;$('#puppyStreak').textContent=puppyData.bestStreak;
}
function renderPuppy(){
 const eaten=puppyInput.value;
 $('#puppyTarget').innerHTML=[...puppyText].map((ch,i)=>{let cls=i<eaten.length?(eaten[i]===ch?'done':'wrong'):i===eaten.length?'current':'';let shown=ch===' '?'&nbsp;':ch.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');return `<span class="puppy-letter ${cls}">${shown}</span>`;}).join('');
 $('#puppyFood').innerHTML=[...puppyText].map((ch,i)=>`<span class="puppy-food-piece ${i<eaten.length&&eaten[i]===ch?'eaten':''}" title="${ch===' '?'space':ch}"><span class="food-emoji">${puppyFoods[i%puppyFoods.length]}</span><span>${ch===' '?'␣':ch}</span></span>`).join('');
 $('#puppyFoodCount').textContent=`${Math.max(0,puppyText.length-Math.min(eaten.length,puppyText.length))} bites left`;
 $('#puppyProgressFill').style.width=(Math.min(eaten.length,puppyText.length)/puppyText.length*100)+'%';
}
function newPuppyChallenge(focus=true){
 if(puppyNextTimer){clearTimeout(puppyNextTimer);puppyNextTimer=null;}
 puppyComplete=false;const stage=Math.max(1,Math.min(12,Number(puppyData.stage)||1));puppyText=puppyChallenges[stage-1];puppyInput.value='';puppyInput.disabled=false;
 puppyWrap.classList.remove('dancing','eating','barking');$('#puppyMood').textContent=stage>=10?'Ready, champion?':'Woof! I\'m hungry!';$('#puppyMessage').textContent='Type the letters in order to feed your puppy.';puppyStageLook();renderPuppy();if(focus)puppyInput.focus();
}
function completePuppyChallenge(){
 if(puppyComplete)return;puppyComplete=true;puppyInput.disabled=true;puppyData.treats+=puppyText.replace(/\s/g,'').length;puppyData.cleared++;puppyData.streak++;puppyData.bestStreak=Math.max(puppyData.bestStreak,puppyData.streak);
 if(puppyData.cleared%2===0)puppyData.stage=Math.min(12,puppyData.stage+1);
 savePuppy();puppyStageLook();puppyWrap.classList.remove('eating','barking');puppyWrap.classList.add('dancing');$('#puppyMood').textContent='Yippee! Delicious!';$('#puppyMessage').textContent='Challenge complete! Your puppy dances and barks to celebrate!';puppySound('bark');
 puppyNextTimer=setTimeout(()=>newPuppyChallenge(false),2300);
}
puppyInput.addEventListener('input',()=>{
 if(puppyComplete)return;const typed=puppyInput.value;
 if(typed.length>puppyText.length){puppyInput.value=typed.slice(0,puppyText.length);return;}
 let matched=true;for(let i=0;i<typed.length;i++){if(typed[i]!==puppyText[i]){matched=false;break;}}
 if(matched){puppyData.streak=Math.max(0,puppyData.streak);if(typed.length){puppyWrap.classList.remove('dancing','barking');puppyWrap.classList.add('eating');puppySound('eat');$('#puppyMood').textContent='Nom nom nom!';}renderPuppy();
  if(typed===puppyText)completePuppyChallenge();else $('#puppyMessage').textContent=`Great typing! ${typed.length} of ${puppyText.length} bites completed.`;
 }else{puppyData.streak=0;puppyWrap.classList.remove('eating');$('#puppyMood').textContent='Oops! Try that letter again.';$('#puppyMessage').textContent='That letter does not match yet. Correct it and keep feeding your puppy.';renderPuppy();}
});
$('#puppyRestart').addEventListener('click',()=>newPuppyChallenge(true));
puppyStageLook();newPuppyChallenge(false);

})();