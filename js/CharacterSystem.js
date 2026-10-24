(function(Lab){
  'use strict';
  const clone=value=>structuredClone(value);
  const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
  class Registry{
    constructor(kind){this.kind=kind;this.items=new Map();}
    register(id,value){if(!id||this.items.has(id))throw Error(this.kind+' duplicate/empty ID: '+id);this.items.set(id,value);return value;}
    get(id){if(!this.items.has(id))throw Error('Unknown '+this.kind+': '+id);return this.items.get(id);}
    list(){return [...this.items.entries()].map(([id,value])=>({id,...value}));}
  }
  class CharacterRegistry extends Registry{
    constructor(){super('character');}
    register(id,definition){return super.register(id,freeze(clone({...definition,characterId:id})));}
  }
  class PartRegistry extends Registry{
    constructor(){super('part');}
    register(id,part){return super.register(id,{...part,id});}
    validate(id,slot,rigType){if(id==null)return null;const part=this.get(id);if(part.slot!==slot||!part.rigs.includes(rigType))throw Error('Incompatible '+slot+' part '+id+' for '+rigType);return part;}
  }
  const slots=['head','hairAccessory','chest','legs','feet','mainHand','offHand'];
  class CharacterInstance{
    constructor(definition,options={}){
      this.definition=definition;this.instanceId=options.instanceId||definition.characterId+'-'+(++CharacterInstance.serial);
      this.characterId=definition.characterId;this.name=definition.name;this.category=definition.category;this.rigType=definition.rigType;
      this.appearance=Lab.createAppearance(clone(definition.appearance||{}));this.proportions=clone(definition.proportions||{});
      this.equipment={...Object.fromEntries(slots.map(s=>[s,null])),...clone(definition.equipment||{})};
      for(const [slot,id] of Object.entries(this.equipment))Lab.parts.validate(id,slot,this.rigType);
      this.state=new Lab.CharacterState();this.position=this.state.position;Object.assign(this.position,options.position||{});this.state.initialized=true;this.state.facing=options.facing||'front';
      this.animation=Lab.animationSets.get(definition.animationSet).create();
      const recipe=Lab.rigs.get(this.rigType),components=recipe.create(this);this.rig=components.rig;this.renderer=components.renderer;this.equipmentBinder=recipe.applyEquipment;this.paperDoll=!!recipe.paperDoll;this.defaultAction=recipe.defaultAction;
      this.movementConfig={walkSpeed:120,runSpeed:228,...clone(definition.movementConfig||{})};
      this.movement=new Lab.MovementController(this.state);this.movement.speed=this.movementConfig.walkSpeed;this.movement.runSpeed=this.movementConfig.runSpeed;
      this.command={x:0,y:0,run:false};this.events=[];this.actionSerial=0;this.releasedAction=-1;this.listeners=new Set();this.lastResolved=null;
      this.validateAppearance();this.solve();
    }
    validateAppearance(){if(this.paperDoll)for(const slot of ['face','hair'])Lab.parts.validate(this.appearance.parts[slot],slot,this.rigType);}
    equip(slot,id){if(!slots.includes(slot))throw Error('Unknown equipment slot '+slot);Lab.parts.validate(id,slot,this.rigType);if(this.equipment[slot]!==id){this.equipment[slot]=id;this.animation.setState(this.animation.locomotionState);this.solve();}return this;}
    setAppearance(overrides){const next=Lab.createAppearance({...this.appearance,...overrides,palette:{...this.appearance.palette,...overrides.palette},parts:{...this.appearance.parts,...overrides.parts}});if(this.paperDoll)for(const slot of ['face','hair'])Lab.parts.validate(next.parts[slot],slot,this.rigType);this.appearance=next;this.renderer.appearance=next;return this;}
    get facing(){return this.state.facing;}set facing(v){if(!['front','back','left','right'].includes(v))throw Error('Invalid facing');this.state.facing=v;}
    move(x,y,run=false){if(!Number.isFinite(x)||!Number.isFinite(y))throw Error('Invalid movement');this.command={x,y,run};return this;}
    setRunSpeed(speed){if(!Number.isFinite(speed)||speed<=0)throw Error('Run speed must be positive and finite');this.movementConfig.runSpeed=speed;this.movement.runSpeed=speed;return this;}
    action(name){if(name==='attack')name=this.defaultAction||Lab.EquipmentSystem.actionFor(this);if(this.animation.requestAction(name)){this.actionSerial++;return true;}return false;}
    onEvent(listener){this.listeners.add(listener);return()=>this.listeners.delete(listener);}
    update(dt,options={}){
      const bounds=options.bounds||{minX:-Infinity,maxX:Infinity,minY:-Infinity,maxY:Infinity};
      if(options.player&&(!(this.command.x||this.command.y)||this.movement.keys.size||this.movement.analog?.active)){this.movement.update(dt,bounds,this.animation);}else{
        const {x,y,run}=this.command,length=Math.hypot(x,y),n=length>1?length:1,speed=run?this.movementConfig.runSpeed:this.movementConfig.walkSpeed;
        const previous={...this.position};this.position.x=Lab.math.clamp(this.position.x+x/n*speed*dt,bounds.minX,bounds.maxX);this.position.y=Lab.math.clamp(this.position.y+y/n*speed*dt,bounds.minY,bounds.maxY);
        this.state.velocity.x=dt?(this.position.x-previous.x)/dt:0;this.state.velocity.y=dt?(this.position.y-previous.y)/dt:0;
        if(length){this.facing=Math.abs(x)>Math.abs(y)?(x>0?'right':'left'):(y>0?'front':'back');this.animation.setLocomotion(run?'run':'walk');this.commandMoving=true;}else if(this.commandMoving){this.animation.setLocomotion('idle');this.commandMoving=false;}
      }
      const speed=options.playback||1,oldAction=this.animation.actionState,before=this.animation.actionTime;
      if(this.animation.locomotionState==='run'&&Math.hypot(this.state.velocity.x,this.state.velocity.y)>0){const m=Lab.MotionSettings;this.animation.runSpeedRatio=Math.hypot(this.state.velocity.x,this.state.velocity.y)/(2*m.runStride*m.runCadence/(Math.PI*2*m.runStance)*1.25*speed);}
      this.animation.update(dt*speed);this.state.sync(this.animation);this.solve();
      const marker=this.animation.actionEvents?.[oldAction],release=marker?.time;
      if(marker&&before<release&&before+dt*speed>=release&&this.releasedAction!==this.actionSerial){
        this.releasedAction=this.actionSerial;const event={type:marker.type,sourceId:this.instanceId,action:oldAction,facing:this.facing,origin:this.worldAttachment('castOrigin'),equipment:clone(this.equipment)};
        const chest=this.equipment.chest&&Lab.parts.get(this.equipment.chest);if(chest?.effectProfile)event.effectProfile=chest.effectProfile;
        this.events.push(event);if(this.events.length>64)this.events.shift();this.listeners.forEach(fn=>fn(event));
      }
    }
    solve(){this.rig.solve(this.animation.pose,this.facing);if(this.equipmentBinder)this.equipmentBinder(this);this.state.sync(this.animation);return this.rig;}
    worldAttachment(name){const v=this.rig.attachments?.[name]||this.rig.root;return{x:this.position.x+(this.rig.mirrored?-v.x:v.x),y:this.position.y+v.y};}
    render(ctx,debug=false){ctx.save();ctx.translate(this.position.x,this.position.y);this.solve();this.renderer.draw(ctx,this.rig,this.animation.pose,this.animation.clock,this.facing);if(debug)this.rig.draw(ctx,1);ctx.restore();}
  }
  CharacterInstance.serial=0;
  class CharacterFactory{static create(id,options){return new CharacterInstance(Lab.characters.get(id),options);}}
  Object.assign(Lab,{Registry,CharacterRegistry,PartRegistry,CharacterInstance,CharacterFactory,cloneData:clone,equipmentSlots:slots});
  Lab.characters=new CharacterRegistry();Lab.parts=new PartRegistry();Lab.rigs=new Registry('rig');Lab.animationSets=new Registry('animation set');
})(window.ChibiLab=window.ChibiLab||{});
