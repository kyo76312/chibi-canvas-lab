(function(Lab){
  'use strict';
  class CharacterScene{
    constructor(){this.characters=[];this.selectedId=null;this.effects=new Lab.VisualEffects();this.camera={x:0,y:0};this.subscriptions=new Map();this.bounds={minX:-640,maxX:640,minY:-400,maxY:500};}
    add(actor){if(this.characters.some(a=>a.instanceId===actor.instanceId))throw Error('Duplicate scene instance');this.characters.push(actor);this.subscriptions.set(actor.instanceId,actor.onEvent(e=>this.effects.handle(e)));if(!this.selectedId)this.selectedId=actor.instanceId;return actor;}
    remove(id){this.subscriptions.get(id)?.();this.subscriptions.delete(id);this.characters=this.characters.filter(a=>a.instanceId!==id);if(this.selectedId===id)this.selectedId=this.characters[0]?.instanceId||null;}
    get selected(){return this.characters.find(a=>a.instanceId===this.selectedId);}
    select(id){const next=this.characters.find(a=>a.instanceId===id);if(!next)throw Error('Unknown scene actor '+id);const old=this.selected;if(old){old.movement.clear();if(old.movement.wasMoving){old.animation.setLocomotion('idle');old.movement.wasMoving=false;}}this.selectedId=id;return next;}
    update(dt,options={}){for(const actor of this.characters){const b=options.boundsFor?.(actor)||this.bounds;actor.update(dt,{bounds:b,player:actor===this.selected,playback:options.playback||1});}this.effects.update(dt*(options.playback||1));}
    render(ctx,{all=true,skeleton=false}={}){const actors=(all?this.characters:[this.selected]).filter(Boolean).slice().sort((a,b)=>a.position.y-b.position.y||a.instanceId.localeCompare(b.instanceId));this.lastDrawOrder=actors.map(a=>a.instanceId);for(const actor of actors)actor.render(ctx,skeleton);this.effects.draw(ctx);}
    destroy(){this.subscriptions.forEach(fn=>fn());this.subscriptions.clear();this.characters=[];this.effects.effects=[];}
  }
  Lab.CharacterScene=CharacterScene;
})(window.ChibiLab=window.ChibiLab||{});
