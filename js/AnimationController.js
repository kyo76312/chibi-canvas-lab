(function (Lab) {
  'use strict';
  const lerp=(a,b,t)=>a+(b-a)*t,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  // Sagittal shoulder angles and positive anatomical elbow flexion.
  const defaults=()=>({bob:0,lean:0,head:0,hip:0,shoulderRock:0,pelvisRock:0,runWeight:0,gaitSwing:0,leftArm:-.10,rightArm:-.10,leftElbow:.18,rightElbow:.18,leftFootX:-18,rightFootX:19,leftLift:0,rightLift:0,blink:1,hair:0,cape:0,skirt:0,flash:0,attack:0,hurt:0,punchX:0,punchY:0,punchReach:0,punchWeight:0,castWeight:0,castGlow:0,slashWeight:0,slashCut:0,slashTwist:0,slashTrail:0});
  class AnimationController {
    constructor(){this.locomotionState='idle';this.actionState='none';this.locomotionTime=0;this.actionTime=0;this.clock=0;this.phase=0;this.transition=1;this.source=defaults();this.pose=defaults();this.duration={attack:.98,hurt:.72,cast:1.05};this.actionEvents={cast:{time:.56,type:'skillRelease'}};this.nextBlink=2.5;this.blinkAt=-100;this.hairPosition=0;this.hairVelocity=0;}
    get releaseTime(){return this.actionEvents.cast.time;}
    get attackStage(){const t=this.actionTime;return this.actionState!=='attack'?'none':t<.18?'anticipation':t<.30?'upswing':t<.46?'contact':t<.64?'follow-through':'recovery';}
    get state(){return this.actionState==='none'?this.locomotionState:this.actionState;}
    get time(){return this.actionState==='none'?this.locomotionTime:this.actionTime;}
    beginBlend(preserveGait=false){this.source={...this.pose};this.transition=0;this.transitionDuration=this.pose.slashWeight>.001?.26:.20;this.blendGait=!preserveGait;}
    setLocomotion(state){if(!['idle','walk','run'].includes(state)||this.locomotionState===state)return;this.beginBlend();this.locomotionState=state;this.locomotionTime=0;}
    requestAction(state){
      if(!this.duration[state]||this.actionState===state||(state!=='hurt'&&this.actionState==='hurt'))return false;
      this.beginBlend(true);this.actionState=state;this.actionTime=0;return true;
    }
    setState(state){
      if(this.duration[state])return this.requestAction(state);
      if(!['idle','walk','run'].includes(state))return false;
      if(this.actionState!=='none'){this.beginBlend();this.actionState='none';this.actionTime=0;}
      this.setLocomotion(state);return true;
    }
    finishAction(){this.beginBlend(true);this.actionState='none';this.actionTime=0;}
    sample(){
      const p=defaults(),t=this.actionTime,c=this.clock;
      p.bob=-Math.sin(c*2.3)*.85;p.head=Math.sin(c*1.6)*.014;p.hair=Math.sin(c*1.8)*.018;p.cape=Math.sin(c*2)*.018;
      if(this.locomotionState==='walk'||this.locomotionState==='run'){
        const running=this.locomotionState==='run',s=Math.sin(this.phase),q=Math.cos(this.phase),settings=Lab.MotionSettings,amp=running?settings.runStride:12;
        p.bob=-(running?settings.runBob:2.4)*q*q;p.lean=running?settings.runLean:.025;p.head=-p.lean*.45;
        p.leftFootX=-18+s*amp;p.rightFootX=19-s*amp;
        p.leftLift=smooth(Math.max(0,q))*(running?settings.runLift:12);p.rightLift=smooth(Math.max(0,-q))*(running?settings.runLift:12);
        p.leftArm=(running?-.36:-.13)-s*(running?settings.runArmSwing:.43);
        p.rightArm=(running?-.36:-.13)+s*(running?settings.runArmSwing:.43);
        p.leftElbow=(running?1.30:.30)+s*(running?.12:.04);
        p.rightElbow=(running?1.30:.30)-s*(running?.12:.04);
        p.hair=-p.lean*.65+s*(running?.13:.035);p.cape=-p.lean*.7+s*(running?.075:.06);p.skirt=s*(running?.07:.025);p.hip=s*(running?.045:.035);
        p.gaitSwing=s;
        if(running){
          // A grounded stance takes 40% of a cycle; the other 60% is a bent-knee
          // return. The half-cycle offset leaves two brief flight intervals.
          const tau=Math.PI*2,u=((this.phase/tau+.25)%1+1)%1;
          const foot=v=>{v%=1;if(v<settings.runStance)return{x:amp*(1-2*v/settings.runStance),lift:0};
            const q=(v-settings.runStance)/(1-settings.runStance),q2=q*q,q3=q2*q;
            const tangent=-2*amp*(1-settings.runStance)/settings.runStance;
            return{x:(2*q3-3*q2+1)*-amp+(q3-2*q2+q)*tangent+(-2*q3+3*q2)*amp+(q3-q2)*tangent,lift:settings.runLift*Math.pow(Math.sin(Math.PI*q),1.4)};};
          const l=foot(u),r=foot(u+.5),swing=(l.x-r.x)/(2*amp);
          p.leftFootX=-18+l.x;p.rightFootX=19+r.x;p.leftLift=l.lift;p.rightLift=r.lift;
          p.bob=-settings.runBob*(.5-.5*Math.cos(4*Math.PI*(u-.12)));
          p.lean=settings.runLean+.012*Math.sin(4*Math.PI*u);p.head=-p.lean*.45+.012*Math.sin(4*Math.PI*(u-.05));
          p.leftArm=-.36-swing*settings.runArmSwing;p.rightArm=-.36+swing*settings.runArmSwing;
          p.leftElbow=1.30+swing*.10;p.rightElbow=1.30-swing*.10;
          p.gaitSwing=swing;p.runWeight=1;p.hip=swing*.035;p.shoulderRock=-swing*.018;p.pelvisRock=swing*.035;
          p.hair=-p.lean*.65+.10*Math.sin(this.phase-.45)+.025*Math.sin(2*this.phase-.7);
          p.cape=-p.lean*.7+.07*Math.sin(this.phase-.55);p.skirt=.055*Math.sin(this.phase-.35)+.018*Math.sin(2*this.phase-.6);
        }
      }
      if(this.actionState==='attack'){
        // Five authored beats: anticipation .00-.18, upswing .18-.30,
        // accelerating contact .30-.46, decelerating follow .46-.64,
        // recovery .64-.98. Only the upper body overlays the live leg cycle.
        const raised=smooth(t/.26),recover=smooth((t-.64)/.34);
        const hit=clamp((t-.30)/.16,0,1),follow=clamp((t-.46)/.18,0,1);
        const cut=t<.30?.10*smooth((t-.18)/.12):t<.46?.10+.58*hit*hit:.68+.32*(1-Math.pow(1-follow,3));
        p.slashWeight=raised*(1-recover);p.slashCut=cut;
        // Settle the shoulders into a guard while the independent leg cycle runs.
        // This prevents a running backswing from accelerating the sword raise.
        p.leftArm=lerp(p.leftArm,-.12,p.slashWeight);p.rightArm=lerp(p.rightArm,-.12,p.slashWeight);
        p.leftElbow=lerp(p.leftElbow,.55,p.slashWeight);p.rightElbow=lerp(p.rightElbow,.55,p.slashWeight);
        p.slashTwist=(-.045*(1-cut)+.065*cut)*p.slashWeight;
        p.slashTrail=smooth((t-.335)/.055)*(1-smooth((t-.52)/.12));
        p.lean+=(-.045*(1-cut)+.08*cut)*p.slashWeight;
        p.head+=(.025*(1-cut)-.03*cut)*p.slashWeight;
        p.hair+=-.11*p.slashWeight*cut;p.cape+=-.09*p.slashWeight*cut;
        p.attack=p.slashTrail;
      }else if(this.actionState==='cast'){
        p.castWeight=smooth(t/.30)*(1-smooth((t-.72)/.33));p.castGlow=smooth(t/.28)*(1-smooth((t-.59)/.20));p.head-=.025*p.castWeight;p.cape-=.035*p.castWeight;
      }else if(this.actionState==='hurt'){
        const impact=smooth(t/.09)*(1-smooth((t-.17)/.55));
        p.lean-=.18*impact;p.head-=.10*impact;p.bob+=3*impact;
        p.leftArm=lerp(p.leftArm,-.65,impact);p.rightArm=lerp(p.rightArm,-.65,impact);
        p.leftElbow=lerp(p.leftElbow,.65,impact);p.rightElbow=lerp(p.rightElbow,.65,impact);
        p.hurt=impact;p.flash=t<.28?Math.max(0,Math.sin(t*55))*(1-t/.28):0;p.hair+=impact*.13;p.cape+=impact*.1;
      }
      const elapsed=c-this.blinkAt;p.blink=elapsed>=0&&elapsed<.17?Math.max(.04,Math.abs(elapsed-.085)/.085):1;
      return p;
    }
    update(dt){
      if(!Number.isFinite(dt)||dt<0)return this.pose;
      const ending=this.duration[this.actionState];
      if(ending&&this.actionTime+dt>ending+1e-9){const remaining=Math.max(0,ending-this.actionTime);if(remaining>1e-9)this.update(remaining);else this.finishAction();return this.update(dt-remaining);}
      this.clock+=dt;this.locomotionTime+=dt;if(this.actionState!=='none')this.actionTime+=dt;
      this.phase+=dt*(this.locomotionState==='run'?Lab.MotionSettings.runCadence*(this.runSpeedRatio??1):7.2);
      if(this.clock>=this.nextBlink){this.blinkAt=this.clock;this.nextBlink=this.clock+2.8+Math.sin(this.clock*4.7)*.8;}
      this.transition=Math.min(1,this.transition+dt/(this.transitionDuration||.20));
      const target=this.sample(),mix=smooth(this.transition);
      for(const key of Object.keys(target))this.pose[key]=lerp(this.source[key],target[key],mix);
      if(this.blendGait===false&&this.locomotionState!=='idle')for(const key of ['leftFootX','rightFootX','leftLift','rightLift','hip'])this.pose[key]=target[key];
      const influence=(1-mix)*this.source.punchWeight+mix*target.punchWeight;
      if(influence>0){for(const key of ['punchX','punchY','punchReach'])this.pose[key]=((1-mix)*this.source.punchWeight*this.source[key]+mix*target.punchWeight*target[key])/influence;}
      const steps=Math.max(1,Math.ceil(dt/.008)),h=dt/steps;
      for(let i=0;i<steps;i++){this.hairVelocity+=(95*(this.pose.hair-this.hairPosition)-16*this.hairVelocity)*h;this.hairPosition+=this.hairVelocity*h;}
      this.pose.hair=this.hairPosition;
      if(this.duration[this.actionState]&&this.actionTime>=this.duration[this.actionState]-1e-9)this.finishAction();
      return this.pose;
    }
  }
  Lab.AnimationController=AnimationController;Lab.math={lerp,clamp,smooth};
})(window.ChibiLab=window.ChibiLab||{});
