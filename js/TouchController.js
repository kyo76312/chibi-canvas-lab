(function(Lab){
  'use strict';
  // Pointer events only supply intent. MovementController owns all displacement.
  class TouchController{
    constructor(engine,ui){
      this.engine=engine;this.ui=ui;ui.touch=this;this.actor=engine.actor;this.listeners=[];
      this.joystick=document.getElementById('joystick');this.knob=document.getElementById('joystick-knob');this.status=document.getElementById('joystick-status');
      this.panel=document.getElementById('settings-panel');this.toggle=document.getElementById('mobile-panel-toggle');this.backdrop=document.getElementById('panel-backdrop');
      this.buttons=[...document.querySelectorAll('[data-touch-action]')];this.pressed=new Map();this.deadZone=.16;this.runThreshold=.67;this.pointerId=null;this.active=false;this.drawerOpen=false;
      this.media=matchMedia('(pointer: coarse)');
      this.listen(this.joystick,'pointerdown',e=>{if(!this.active||this.drawerOpen||this.pointerId!==null||e.button!==0)return;e.preventDefault();this.pointerId=e.pointerId;this.actor=engine.actor;this.joystick.setPointerCapture(e.pointerId);this.joystick.classList.add('dragging');if(engine.paused)ui.togglePause();this.move(e);});
      this.listen(this.joystick,'pointermove',e=>{if(e.pointerId===this.pointerId){e.preventDefault();this.move(e);}});
      for(const name of ['pointerup','pointercancel','lostpointercapture'])this.listen(this.joystick,name,e=>{if(e.pointerId===this.pointerId){e.preventDefault();this.releaseStick();}});
      for(const button of this.buttons){
        this.listen(button,'pointerdown',e=>{if(!this.active||this.drawerOpen||button.disabled||button.hidden||e.button!==0||[...this.pressed.values()].includes(button))return;e.preventDefault();button.setPointerCapture(e.pointerId);this.pressed.set(e.pointerId,button);button.classList.add('pressed');this.perform(button.dataset.touchAction);});
        for(const name of ['pointerup','pointercancel','lostpointercapture'])this.listen(button,name,e=>{if(this.pressed.get(e.pointerId)===button){this.pressed.delete(e.pointerId);button.classList.remove('pressed');}});
        this.listen(button,'click',e=>{if(e.detail===0&&this.active&&!button.disabled&&!button.hidden)this.perform(button.dataset.touchAction);});
        this.listen(button,'contextmenu',e=>e.preventDefault());
      }
      this.listen(this.joystick,'contextmenu',e=>e.preventDefault());
      this.listen(this.toggle,'click',()=>this.setDrawer(!this.drawerOpen));this.listen(this.backdrop,'click',()=>this.setDrawer(false));
      this.listen(document.getElementById('mobile-panel-close'),'click',()=>this.setDrawer(false));
      this.listen(document,'keydown',e=>{if(e.code==='Escape'&&this.drawerOpen){e.preventDefault();this.setDrawer(false);}});
      this.listen(window,'blur',()=>this.reset());this.listen(window,'pagehide',()=>this.reset());
      this.listen(document,'visibilitychange',()=>{if(document.hidden)this.reset();});
      this.listen(window,'resize',()=>{this.reset();this.setMode();});this.listen(this.media,'change',()=>this.setMode());
      this.setMode();this.sync();
    }
    listen(target,name,fn){target.addEventListener(name,fn);this.listeners.push(()=>target.removeEventListener(name,fn));}
    setMode(){
      const active=this.media.matches;if(active===this.active)return;
      this.reset();this.active=active;document.body.classList.toggle('touch-mode',active);this.engine.mobileLayout=active;
      if(active){this.desktopShowAll=this.engine.showAll;this.engine.showAll=false;document.getElementById('show-all').checked=false;Object.assign(this.engine.scene.camera,this.engine.actor.position);}
      else{this.engine.showAll=this.desktopShowAll??this.engine.showAll;document.getElementById('show-all').checked=this.engine.showAll;if(this.engine.showAll)Object.assign(this.engine.scene.camera,{x:0,y:0});}
      this.setDrawer(false);this.engine.resize();
    }
    setDrawer(open){
      this.reset();this.drawerOpen=this.active&&open;document.body.classList.toggle('drawer-open',this.drawerOpen);
      this.toggle.setAttribute('aria-expanded',String(this.drawerOpen));this.backdrop.hidden=!this.drawerOpen;
      this.panel.inert=this.active&&!this.drawerOpen;this.panel.setAttribute('aria-hidden',String(this.active&&!this.drawerOpen));
      if(this.drawerOpen)document.getElementById('mobile-panel-close').focus({preventScroll:true});
      else if(this.active)this.toggle.focus({preventScroll:true});
    }
    move(e){
      const rect=this.joystick.getBoundingClientRect(),radius=rect.width*.35,dx=e.clientX-(rect.left+rect.width/2),dy=e.clientY-(rect.top+rect.height/2),distance=Math.hypot(dx,dy),strength=Math.min(1,distance/radius),factor=distance?Math.min(1,radius/distance):0;
      this.knob.style.transform=`translate(${dx*factor}px,${dy*factor}px)`;
      if(strength<this.deadZone){this.actor.movement.setAnalog(0,0);this.setStatus('輕推走路 · 遠推跑步');return;}
      const run=strength>(this.actor.movement.analog?.run?this.runThreshold-.09:this.runThreshold);
      this.actor.movement.setAnalog(dx,dy,run);this.setStatus(run?'跑步':'走路');
    }
    setStatus(text){if(this.status.textContent!==text)this.status.textContent=text;}
    releaseStick(){const id=this.pointerId;this.pointerId=null;this.actor.movement.setAnalog(0,0);this.knob.style.transform='translate(0px,0px)';this.joystick.classList.remove('dragging');this.setStatus('輕推走路 · 遠推跑步');if(id!==null&&this.joystick.hasPointerCapture(id))this.joystick.releasePointerCapture(id);}
    reset(){this.releaseStick();this.actor.movement.clear();for(const [id,button] of this.pressed){button.classList.remove('pressed');if(button.hasPointerCapture(id))button.releasePointerCapture(id);}this.pressed.clear();}
    perform(action){if(action==='attack'||this.engine.animation.duration[action])this.ui.select(action);}
    sync(){
      if(this.actor!==this.engine.actor){this.reset();this.actor=this.engine.actor;}
      const a=this.engine.actor,attack=a.defaultAction||Lab.EquipmentSystem.actionFor(a);
      for(const button of this.buttons){const action=button.dataset.touchAction,supported=!!a.animation.duration[action==='attack'?attack:action];button.hidden=!supported;button.disabled=!supported;}
    }
    destroy(){this.reset();this.listeners.forEach(remove=>remove());this.listeners=[];this.panel.inert=false;this.panel.removeAttribute('aria-hidden');document.body.classList.remove('touch-mode','drawer-open');this.engine.mobileLayout=false;this.ui.touch=null;}
  }
  Lab.TouchController=TouchController;
})(window.ChibiLab=window.ChibiLab||{});
