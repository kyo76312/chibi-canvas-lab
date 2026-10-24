(function(Lab){
  'use strict';
  const labels={idle:['待機','IDLE','獨立呼吸與眨眼。'],walk:['走路','WALK','基本移動週期，各角色獨立計時。'],run:['跑步','RUN','Shift 跑步，持物與衣服跟隨骨架。'],attack:['舊版劍擊','ATTACK','保留原有單手劍動作。'],cast:['施法','CAST','準備、舉杖／抬手、釋放事件、回復。'],hurt:['受傷','HURT','短暫失衡與閃光。'],bumpAttack:['撞擊','BUMP','史萊姆蓄力、短暫突進與回彈。']};
  const slotNames={head:'頭盔／護額',hairAccessory:'髮飾',chest:'上衣／盔甲',legs:'裙子／褲子',feet:'鞋子／靴子',mainHand:'主手',offHand:'副手'};
  class UIController{
    constructor(engine){
      this.engine=engine;this.buttons=[...document.querySelectorAll('[data-state]')];this.lastState=null;this.actionKeys=new Set();
      this.runSpeed=document.getElementById('run-speed');this.speed=document.getElementById('speed');this.scale=document.getElementById('scale');this.skeleton=document.getElementById('skeleton');this.characterSelect=document.getElementById('character-select');
      for(const a of engine.scene.characters)this.characterSelect.add(new Option(a.name,a.instanceId));
      this.characterSelect.addEventListener('change',()=>{this.touch?.reset();engine.select(this.characterSelect.value);this.lastState=null;this.refreshEquipment();this.refreshRunSpeed();this.sync();});
      this.buttons.forEach(b=>b.addEventListener('click',()=>this.select(b.dataset.state)));
      this.speed.addEventListener('input',()=>{engine.speed=Number(this.speed.value);this.updateRanges();});this.scale.addEventListener('input',()=>{engine.zoom=Number(this.scale.value);this.updateRanges();engine.draw();});
      this.runSpeed.addEventListener('input',()=>{if(this.runSpeed.value!==''&&this.runSpeed.validity.valid)engine.actor.setRunSpeed(this.runSpeed.valueAsNumber);});
      this.runSpeed.addEventListener('change',()=>this.refreshRunSpeed());
      this.skeleton.addEventListener('change',()=>{engine.showSkeleton=this.skeleton.checked;engine.draw();});
      document.getElementById('show-all').addEventListener('change',e=>{engine.showAll=e.target.checked;Object.assign(engine.scene.camera,engine.showAll?{x:0,y:0}:engine.actor.position);engine.draw();});
      document.getElementById('show-effects').addEventListener('change',e=>{engine.scene.effects.enabled=e.target.checked;});
      document.querySelectorAll('[data-facing]').forEach(b=>b.addEventListener('click',()=>{engine.actor.facing=b.dataset.facing;engine.draw();this.sync();}));
      for(const [slot,name] of Object.entries(slotNames)){const label=document.createElement('label');label.textContent=name;const select=document.createElement('select');select.id='equip-'+slot;select.dataset.slot=slot;select.addEventListener('change',()=>{engine.actor.equip(slot,select.value||null);engine.draw();this.lastState=null;this.sync();});label.append(select);document.getElementById('equipment-controls').append(label);}
      document.getElementById('others-walk').addEventListener('click',()=>engine.scene.characters.filter(a=>a!==engine.actor).forEach(a=>a.animation.setLocomotion('walk')));
      document.getElementById('others-idle').addEventListener('click',()=>engine.scene.characters.filter(a=>a!==engine.actor).forEach(a=>{a.move(0,0);a.animation.setLocomotion('idle');}));
      document.getElementById('pause').addEventListener('click',()=>this.togglePause());document.getElementById('step').addEventListener('click',()=>engine.step());document.getElementById('reset').addEventListener('click',()=>this.reset());document.getElementById('reset-position').addEventListener('click',()=>{engine.resetPosition();this.sync();});engine.canvas.addEventListener('pointerdown',()=>engine.canvas.focus({preventScroll:true}));
      this.onKeyDown=e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.target.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;if(engine.movement.setRunKey(e.code,true)||engine.movement.setKey(e.code,true)){e.preventDefault();return;}if(e.repeat)return;
        if(/^Digit[1-7]$/.test(e.code)){if(this.actionKeys.has(e.code))return;this.actionKeys.add(e.code);e.preventDefault();this.select(['idle','walk','run','attack','hurt','cast','bumpAttack'][Number(e.code.slice(-1))-1]);}else if(e.code==='Space'&&!['BUTTON','A'].includes(e.target.tagName)){e.preventDefault();this.togglePause();}};
      this.onKeyUp=e=>{this.actionKeys.delete(e.code);if(engine.movement.setKey(e.code,false)||engine.movement.setRunKey(e.code,false))e.preventDefault();};
      document.addEventListener('keydown',this.onKeyDown);document.addEventListener('keyup',this.onKeyUp);this.onBlur=()=>this.actionKeys.clear();window.addEventListener('blur',this.onBlur);
      engine.onFrame=()=>this.sync();this.refreshEquipment();this.refreshRunSpeed();this.updateRanges();this.sync();
    }
    refreshRunSpeed(){this.runSpeed.value=String(this.engine.actor.movementConfig.runSpeed);}
    refreshEquipment(){const a=this.engine.actor;for(const slot of Lab.equipmentSlots){const select=document.getElementById('equip-'+slot);select.replaceChildren(new Option('無／基礎',''));for(const p of Lab.parts.list().filter(p=>p.slot===slot&&p.rigs.includes(a.rigType)))select.add(new Option(p.name,p.id));select.value=a.equipment[slot]||'';select.disabled=!Lab.parts.list().some(p=>p.slot===slot&&p.rigs.includes(a.rigType));}}
    select(state){this.engine.setState(state);if(this.engine.paused){this.engine.paused=false;this.updatePause();}this.sync();}
    sync(){const e=this.engine,a=e.actor,state=e.animation.state,data=labels[state]||[state,state.toUpperCase(),''];if(state!==this.lastState){this.buttons.forEach(b=>{const active=b.dataset.state===state;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});document.getElementById('state-label').textContent='● '+data[0]+' · '+data[1];document.getElementById('motion-description').textContent=data[2];this.lastState=state;}
      document.getElementById('fps').textContent=e.fps+' FPS';const names={front:'正面 · FRONT',back:'背面 · BACK',left:'左側 · LEFT',right:'右側 · RIGHT'};document.getElementById('facing-value').textContent=names[a.facing];document.getElementById('position-value').value=`${Math.round(a.position.x)}, ${Math.round(a.position.y)}`;
      document.getElementById('actor-name').textContent=a.name;document.getElementById('actor-info').textContent=a.rigType+' · '+a.category+' · '+a.instanceId;document.getElementById('stage-word').textContent=a.characterId.toUpperCase();document.querySelector('.stage-name>span').textContent=a.appearance.subtitle;
      document.querySelector('[data-state=bumpAttack]').disabled=!a.animation.duration.bumpAttack;document.getElementById('rig-info').textContent=a.rigType==='humanoid'?`頭 ${a.rig.rig.headSize} · 軀幹 ${a.rig.rig.torsoLength} · 臂 ${a.rig.rig.upperArm}/${a.rig.rig.forearm} · 腿 ${a.rig.rig.thigh}/${a.rig.rig.shin}`:a.rigType+' · 獨立骨架與動畫';
      this.touch?.sync();const events=e.scene.effects.received;document.getElementById('event-readout').textContent=events.length?`釋放事件 ${events.length} · ${events.at(-1).sourceId}`:'尚未施法 · 按 6 觀察事件';
    }
    updateRanges(){for(const input of [this.speed,this.scale]){const percent=(Number(input.value)-Number(input.min))/(Number(input.max)-Number(input.min))*100;input.style.background=`linear-gradient(to right,#649a98 ${percent}%,#e7eded ${percent}%)`;}document.getElementById('speed-value').value=Number(this.speed.value).toFixed(2)+'×';document.getElementById('scale-value').value=Math.round(Number(this.scale.value)*100)+'%';}
    togglePause(){this.engine.paused=!this.engine.paused;this.updatePause();}
    updatePause(){const paused=this.engine.paused;document.getElementById('pause-label').textContent=paused?'繼續播放':'暫停動畫';document.getElementById('pause-icon').textContent=paused?'▷':'Ⅱ';document.getElementById('pause').setAttribute('aria-pressed',String(paused));document.getElementById('play-status').textContent=paused?'已暫停 · 觀察姿勢':'即時演算中';document.getElementById('step').disabled=!paused;}
    reset(){this.touch?.reset();const e=this.engine,a=e.actor;this.speed.value='1';this.scale.value='1';this.skeleton.checked=false;e.speed=1;e.zoom=1;e.showSkeleton=false;a.animation=Lab.animationSets.get(a.definition.animationSet).create();a.equipment=Lab.cloneData(a.definition.equipment);a.command={x:0,y:0,run:false};a.setRunSpeed(a.definition.movementConfig?.runSpeed??228);this.refreshRunSpeed();e.movement.gait='walk';a.facing='front';e.paused=false;e.resetPosition();this.lastState=null;this.refreshEquipment();this.updateRanges();this.updatePause();this.sync();e.draw();}
    destroy(){this.touch?.destroy();document.removeEventListener('keydown',this.onKeyDown);document.removeEventListener('keyup',this.onKeyUp);window.removeEventListener('blur',this.onBlur);this.engine.onFrame=null;}
  }
  Lab.UIController=UIController;
})(window.ChibiLab=window.ChibiLab||{});
