/* =========================
   Scene 1: DuelScene
   Newbie + skilled levels only.
   Scene owns layout; DuelTurnContext owns the interaction.
   ========================= */
class DuelScene{
  constructor(){
    this.root=$('#duelScene');this.heroHP=$('#duelHeroHP');this.enemyHP=$('#duelEnemyHP');
    this.hero=$('#duelHeroRobot');this.enemy=$('#duelEnemyRobot');
    this.heroName=this.root.querySelector('.fighter.hero .fighter-name');this.enemyName=this.root.querySelector('.fighter.enemy .fighter-name');
    this.panel=new QuestionPanel($('#duelQuestionPanel'),(v,b)=>this.answer(v,b));
    this.heroState=new CombatantState(100);this.enemyState=new CombatantState(100);
  }
  start(){
    activateScene('duelScene');this.heroState.reset();this.enemyState.reset();
    if(isBlocksGame()){this.heroName.textContent='積木勇者';this.enemyName.textContent='苦力怕'}
    else{this.heroName.textContent='RX 教學鋼彈';this.enemyName.textContent='薩克練習兵'}
    this.paint();this.ask();
  }
  paint(){this.heroHP.style.width=this.heroState.hp+'%';this.enemyHP.style.width=this.enemyState.hp+'%'}
  ask(){if(!game.running||game.paused)return;game.phase='question';game.question=QuestionService.next();CommonUI.setMode(game.question.isReview?mode().review:'乘法');this.panel.show(game.question,`MISSION ${game.round}`,questionHint())}
  async answer(value,btn){
    if(game.phase!=='question'||game.paused)return;
    game.phase='acting';this.panel.disable();
    const ok=value===game.question.answer;
    this.panel.mark(value,game.question.answer,btn);applyAnswerScore(ok);
    const ctx=new DuelTurnContext(this,ok,value);
    await ctx.run();
    if(!game.running)return;
    this.paint();await delay(300);
    this.hero.classList.remove('attackHero','attackEnemy','hit','weapon-recoil');
    this.enemy.classList.remove('attackHero','attackEnemy','hit','weapon-recoil');
    if(!this.heroState.alive||!this.enemyState.alive){finish(!this.enemyState.alive,{hero:this.heroState.hp});return}
    this.ask();
  }
  pauseChanged(){if(!game.paused&&game.phase==='idle')this.ask()}
}

/* =========================
   Scene 2: CampaignScene
   Sequential 1-v-5 only.
   Scene owns layout; CampaignTurnContext owns the interaction.
   ========================= */
class CampaignScene{
  constructor(){
    this.root=$('#campaignScene');this.heroHP=$('#campaignHeroHP');this.enemyHP=$('#campaignEnemyHP');
    this.hero=$('#campaignHeroRobot');this.enemy=$('#campaignEnemyRobot');this.enemyName=$('#campaignEnemyName');this.squad=$('#campaignSquad');
    this.heroName=this.root.querySelector('.fighter.hero .fighter-name');
    this.panel=new QuestionPanel($('#campaignQuestionPanel'),(v,b)=>this.answer(v,b));
    this.heroState=new CombatantState(100);this.enemyState=new CombatantState(100);this.enemyIndex=1;this.enemyTotal=5;
  }
  blockEnemyName(){return ['苦力怕','殭屍','苦力怕','監守者','鐵高侖'][this.enemyIndex-1]||'怪物'}
  start(){activateScene('campaignScene');this.heroState.reset();this.enemyState.reset();this.enemyIndex=1;if(this.heroName)this.heroName.textContent=isBlocksGame()?'積木勇者':'RX 實戰鋼彈';this.paint();this.ask()}
  paint(){
    this.heroHP.style.width=this.heroState.hp+'%';this.enemyHP.style.width=this.enemyState.hp+'%';
    this.enemy.dataset.blockEnemy=String(this.enemyIndex);
    this.enemyName.textContent=isBlocksGame()?this.blockEnemyName():`薩克實戰兵 ${this.enemyIndex} 號`;
    this.squad.innerHTML=`<span>${isBlocksGame()?'怪物':'敵軍'} ${this.enemyIndex} / ${this.enemyTotal}</span>`;
    for(let i=1;i<=this.enemyTotal;i++){const d=document.createElement('i');d.className='zaku-dot'+(i<this.enemyIndex?' down':i===this.enemyIndex?' current':'');this.squad.appendChild(d)}
  }
  ask(){
    if(!game.running||game.paused)return;game.phase='question';game.question=QuestionService.next();CommonUI.setMode(game.question.isReview?mode().review:'乘法');
    const foe=isBlocksGame()?this.blockEnemyName():`薩克 ${this.enemyIndex}/${this.enemyTotal}`;
    this.panel.show(game.question,`${isBlocksGame()?'挑戰':'實戰'} ${game.stage}｜MISSION ${game.round}｜${foe}`,questionHint())
  }
  async answer(value,btn){
    if(game.phase!=='question'||game.paused)return;
    game.phase='acting';this.panel.disable();
    const ok=value===game.question.answer;
    this.panel.mark(value,game.question.answer,btn);applyAnswerScore(ok);
    const ctx=new CampaignTurnContext(this,ok,value);
    await ctx.run();
    if(!game.running)return;
    this.paint();await delay(300);
    this.hero.classList.remove('attackHero','attackEnemy','hit','weapon-recoil');
    this.enemy.classList.remove('attackHero','attackEnemy','hit','weapon-recoil');
    if(!this.heroState.alive){finish(false,{defeated:this.enemyIndex-1,total:5});return}
    if(!this.enemyState.alive){if(this.enemyIndex>=this.enemyTotal){finish(true,{defeated:5,total:5});return}await this.spawnNext();return}
    this.ask();
  }
  async spawnNext(){
    game.phase='acting';this.enemyIndex++;this.enemyState.reset();this.paint();
    flashIn(this.root,isBlocksGame()?`${this.blockEnemyName()} 出現！`:'薩克增援！','var(--gold)');Sound.next();
    this.enemy.animate([{opacity:0,translate:'100px 0'},{opacity:1,translate:'0 0'}],{duration:430,easing:'ease-out'});
    await delay(450);this.ask()
  }
  pauseChanged(){if(!game.paused&&game.phase==='idle')this.ask()}
}
