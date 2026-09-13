function setupProgressionSelection(){
  const row=$('#startOverlay .select-row');
  if(!row)return;
  row.innerHTML='';
  const levels=[
    ...Array.from({length:9},(_,i)=>({id:`block${i+1}`,title:`第 ${i+1} 關｜${i+1} 的乘法`,detail:`${i+1}×1 ～ ${i+1}×9，隨機出題`})),
    {id:'blockRandom',title:'第 10 關｜九九隨機',detail:'1×1 ～ 9×9 隨機出題，不含加減法'},
    {id:'blockMixed',title:'最終關｜九九＋加減法',detail:'九九隨機，並穿插兩數皆 200 以內的加減法'}
  ];
  for(const [i,l] of levels.entries()){
    const b=document.createElement('button');
    b.dataset.level=l.id;b.className=i===0?'on':'';
    b.innerHTML=`${l.title}<br><span class="small">${l.detail}</span>`;
    row.appendChild(b);
  }
  game.level='block1';game.stage=1;
}
setupProgressionSelection();

const scenes={duel:new DuelScene(),campaign:new CampaignScene(),war:new WarScene()};
function isCampaignLevel(){return game.level==='blockRandom'}
function isWarLevel(){return game.level==='blockMixed'}
function currentScene(){return isWarLevel()?scenes.war:isCampaignLevel()?scenes.campaign:scenes.duel}

function resetSession(){AnswerReview.cancel();game.running=true;game.paused=false;game.score=0;game.combo=0;game.correctCount=0;game.round=0;game.question=null;game.phase='idle';CommonUI.update();$('#startOverlay').classList.add('hidden');$('#endOverlay').classList.add('hidden');currentScene().start()}
function finish(victory,data={}){
  AnswerReview.cancel();game.running=false;game.phase='ended';game.question=null;
  const title=$('#endTitle'),text=$('#endText'),next=$('#nextBtn');
  title.textContent=victory?'任務完成！':'再挑戰一次！';
  text.innerHTML=`本次答對 <b>${game.correctCount}</b> 題，得到 <b>${game.score}</b> 分。<br>目前九九熟練度：<b>${masteryCount()} / 81</b>。`;
  const order=levelOrder(),i=order.indexOf(game.level);
  next.textContent=i===order.length-1?'再玩一次最終關':'下一關';
  $('#endOverlay').classList.remove('hidden');
}
function goSelection(){AnswerReview.cancel();game.running=false;game.paused=false;game.phase='idle';game.question=null;$('#endOverlay').classList.add('hidden');$('#tableOverlay').classList.add('hidden');$('#warQuestionOverlay').classList.remove('show');$('#startOverlay').classList.remove('hidden');syncLevelButtons();CommonUI.setMode('選關');CommonUI.update()}
function nextLevel(){
  const order=levelOrder(),i=order.indexOf(game.level);
  if(i>=0&&i<order.length-1)game.level=order[i+1];
  game.stage=1;
  syncLevelButtons();resetSession();
}
function syncLevelButtons(){$$('[data-level]').forEach(b=>b.classList.toggle('on',b.dataset.level===game.level))}
function renderTable(){const grid=$('#tableGrid');grid.innerHTML='';for(let a=1;a<=9;a++)for(let b=1;b<=9;b++){const d=document.createElement('div'),key=`${a}x${b}`,m=game.mastery[key]||0;d.className='table-cell'+(m>=2?' mastered':'')+(game.question?.key===key?' current':'');d.textContent=`${a}×${b}`;d.title=`${a} × ${b} = ${a*b}（答對 ${m} 次）`;grid.appendChild(d)}}

$$('[data-level]').forEach(btn=>btn.onclick=()=>{$$('[data-level]').forEach(b=>b.classList.remove('on'));btn.classList.add('on');game.level=btn.dataset.level;game.stage=1});
$('#startBtn').onclick=resetSession;$('#nextBtn').onclick=nextLevel;$('#backSelectBtn').onclick=goSelection;$('#selectBtn').onclick=goSelection;
$('#tableBtn').onclick=()=>{renderTable();$('#tableOverlay').classList.remove('hidden')};$('#closeTable').onclick=()=>$('#tableOverlay').classList.add('hidden');
$('#soundBtn').onclick=()=>{game.sound=!game.sound;$('#soundBtn').textContent='音效：'+(game.sound?'開':'關');if(game.sound)Sound.tap()};
$('#resetBtn').onclick=()=>{if(confirm('要重新開始這一場嗎？九九熟練度會保留。'))resetSession()};
window.addEventListener('keydown',e=>{if(['1','2','3','4'].includes(e.key)&&game.running&&!game.paused&&game.phase==='question'){const root=isWarLevel()?$('#warQuestionPanel'):isCampaignLevel()?$('#campaignQuestionPanel'):$('#duelQuestionPanel');const b=root.querySelectorAll('.answer')[Number(e.key)-1];if(b&&!b.disabled)b.click()}});
CommonUI.update();CommonUI.setMode('選關');renderTable();activateScene('duelScene');
