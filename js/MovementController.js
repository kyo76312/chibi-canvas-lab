(function(Lab){
  'use strict';
  const directions={KeyW:[0,-1,'back'],KeyS:[0,1,'front'],KeyA:[-1,0,'left'],KeyD:[1,0,'right']};
  class MovementController{
    constructor(character){this.character=character;this.keys=new Map();this.runKeys=new Set();this.gait='walk';this.order=0;this.speed=120;this.runSpeed=Lab.MotionSettings.runSpeed;this.wasMoving=false;}
    setRunKey(code,down){if(!['ShiftLeft','ShiftRight'].includes(code))return false;if(down)this.runKeys.add(code);else this.runKeys.delete(code);return true;}
    get running(){return !this.keys.size&&this.analog?.active?(this.analog.run||this.runKeys.size>0):this.gait==='run'||this.runKeys.size>0;}
    setAnalog(x,y,run=false){const length=Math.hypot(x,y);if(!Number.isFinite(length)||length<1e-6){this.analog=null;if(!this.keys.size){this.character.velocity.x=0;this.character.velocity.y=0;}return;}x/=length;y/=length;let facing=this.analog?.facing||this.character.facing;const ax=Math.abs(x),ay=Math.abs(y);if(ax>ay+.12)facing=x>0?'right':'left';else if(ay>ax+.12)facing=y>0?'front':'back';else if(!this.analog?.active)facing=ay>=ax?(y>0?'front':'back'):(x>0?'right':'left');this.analog={x,y,run:!!run,facing,active:true};}
    setKey(code,down){if(!directions[code])return false;if(down){if(!this.keys.has(code))this.keys.set(code,++this.order);}else this.keys.delete(code);return true;}
    clear(){this.keys.clear();this.runKeys.clear();this.analog=null;this.character.velocity.x=0;this.character.velocity.y=0;}
    vector(){
      if(!this.keys.size&&this.analog?.active)return {x:this.analog.x,y:this.analog.y,facing:this.analog.facing};
      let x=0,y=0;for(const code of this.keys.keys()){x+=directions[code][0];y+=directions[code][1];}
      const length=Math.hypot(x,y);if(!length)return {x:0,y:0,facing:null};
      // Last freshly pressed, non-cancelled axis wins; repeats cannot flicker.
      let order=-1,facing=null;for(const [code,n] of this.keys){const [dx,dy,name]=directions[code];if(n>order&&((dx&&Math.sign(x)===dx)||(dy&&Math.sign(y)===dy))){order=n;facing=name;}}
      return {x:x/length,y:y/length,facing};
    }
    update(dt,bounds,animation){
      const state=this.character,v=this.vector(),moving=!!(v.x||v.y),p=state.position;
      if(v.facing)state.facing=v.facing;
      if(moving)animation.setLocomotion(this.running?'run':'walk');else if(this.wasMoving||animation.actionState!=='none')animation.setLocomotion('idle');
      const speed=this.running?this.runSpeed:this.speed;
      animation.runSpeedRatio=this.runSpeed/Lab.MotionSettings.runSpeed;
      const previous={...p};p.x=Lab.math.clamp(p.x+v.x*speed*dt,bounds.minX,bounds.maxX);p.y=Lab.math.clamp(p.y+v.y*speed*dt,bounds.minY,bounds.maxY);
      state.velocity.x=dt>0?(p.x-previous.x)/dt:0;state.velocity.y=dt>0?(p.y-previous.y)/dt:0;this.wasMoving=moving;
    }
  }
  Lab.MovementController=MovementController;
})(window.ChibiLab=window.ChibiLab||{});
