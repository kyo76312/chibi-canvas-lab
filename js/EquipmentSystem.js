(function(Lab){
  'use strict';
  Lab.holdStyles=new Lab.Registry('hold style');
  const magicGrip={isProfile:Lab.SwordSystem.isProfile,carry:Lab.SwordSystem.carry,handAngle(s){return this.isProfile(s)?2.05:s.facing==='back'?1.85:-1.85;},target(s){const angle=this.handAngle(s),radius=43*(s.rig.upperArm+s.rig.forearm)/56;return{x:s.swordShoulder.x+Math.sin(angle)*radius,y:s.swordShoulder.y+Math.cos(angle)*radius,z:this.isProfile(s)?0:s.facing==='back'?-12:12};}};
  Lab.holdStyles.register('sword',{apply(actor){Lab.SwordSystem.attach(actor.rig,actor.animation.pose);}});
  Lab.holdStyles.register('staff',{apply(actor,unarmed=false){const s=actor.rig,p=actor.animation.pose;s.swordShoulder=s.rightArm[0];s.rightArm=Lab.SwordSystem.solveArm.call(magicGrip,s,s.rightArm,{...p,hurt:unarmed?1-(p.castWeight||0)*(1-(p.hurt||0)):p.hurt,slashWeight:p.castWeight||0,slashCut:0});s.rightArm.handScale=(s.rightArm.handScale||1)*s.rig.handSize;s.rightArm.upperScale=(s.rightArm.upperScale||1)*s.rig.limbWidth;s.rightArm.foreScale=(s.rightArm.foreScale||1)*s.rig.limbWidth;}});
  Lab.holdStyles.register('orb',Lab.holdStyles.get('staff'));
  Lab.holdStyles.register('unarmed',{apply(actor){if(actor.animation.pose.castWeight>.001)Lab.holdStyles.get('staff').apply(actor,true);}});
  class EquipmentSystem{
    static actionFor(actor){const item=actor.equipment.mainHand&&Lab.parts.get(actor.equipment.mainHand);return item?.actionProfile||'cast';}
    static apply(actor){
      const s=actor.rig,p=actor.animation.pose,main=actor.equipment.mainHand&&Lab.parts.get(actor.equipment.mainHand);
      delete s.weapon;const style=main?.holdStyle==='sword'&&(p.castWeight||0)>.001?'staff':main?.holdStyle||'unarmed';
      Lab.holdStyles.get(style).apply(actor);s.floating=[];s.refreshAttachments();
      if(main?.holdStyle==='sword'&&style==='sword')s.rightArm.held={part:main,weapon:s.weapon,hand:'right'};
      else if(main){const grip=s.attachments.rightHand,angle=(s.facing==='front'?-.22:.22)+s.angle*.2,scale=s.rig.handSize;
        const held={part:main,hand:'right',weapon:{owner:'right',grip,angle,scale}};
        if(main.attachment==='orbitRight'){held.weapon.grip=this.orbit(s,p,'right',actor.animation.clock);s.floating.push(held);s.attachments.castOrigin={...held.weapon.grip};}else{s.rightArm.held=held;s.attachments.castOrigin={x:grip.x+Math.sin(angle)*main.tipLength*scale,y:grip.y-Math.cos(angle)*main.tipLength*scale};}
      }
      const off=actor.equipment.offHand&&Lab.parts.get(actor.equipment.offHand);
      if(off){const grip=this.orbit(s,p,'left',actor.animation.clock);s.floating.push({part:off,hand:'left',weapon:{owner:'left',grip,angle:0,scale:s.rig.handSize}});if(!main)s.attachments.castOrigin=grip;}
      s.hands={left:s.leftArm,right:s.rightArm};
      const chest=actor.equipment.chest&&Lab.parts.get(actor.equipment.chest);chest?.updateAttachments?.(actor);
    }
    static orbit(s,p,hand,clock){const profile=Lab.SwordSystem.isProfile(s),sign=(hand==='right'?1:-1)*(s.facing==='front'?-1:1);return{x:(profile?(hand==='right'?68:86):sign*85)*s.rig.bodyWidth,y:s.root.y-61*s.rig.torsoScale-(profile&&hand==='left'?18:0)-18*(p.castWeight||0)+Math.sin(clock*2.5)*3};}
    static drawHeld(r,ctx,chain,s,p){const h=chain.held;if(h.part.holdStyle==='sword')Lab.SwordSystem.drawTrail(r,ctx,s,p);h.part.drawHeld({r,ctx,weapon:h.weapon,p});this.glow(r,ctx,h.weapon.grip,p.castGlow||0);}
    static drawFloating(r,ctx,s,p){for(const h of s.floating||[]){h.part.drawHeld({r,ctx,weapon:h.weapon,p});this.glow(r,ctx,h.weapon.grip,p.castGlow||0);}if((p.castGlow||0)>.01)this.glow(r,ctx,s.attachments.castOrigin,p.castGlow);}
    static glow(r,ctx,at,weight){Lab.VisualEffects.charge(r,ctx,at,weight);}
  }
  Lab.EquipmentSystem=EquipmentSystem;
  const held=(id,slot,name,style,attachment,drawHeld,extra={})=>Lab.parts.register(id,{name,slot,rigs:['humanoid'],holdStyle:style,attachment,actionProfile:style==='sword'?'attack':'cast',tipLength:76,layers:'hand',hides:[],params:{},draw:{},drawHeld,...extra});
  held('sword_aster','mainHand','星潮單手劍','sword','rightHand',({r,ctx,weapon})=>Lab.SwordSystem.draw(r,ctx,weapon));
  held('staff_crystal_01','mainHand','星晶法杖','staff','rightHand',({r,ctx,weapon})=>{const c=r.colors;ctx.save();ctx.translate(weapon.grip.x,weapon.grip.y);ctx.rotate(weapon.angle);ctx.scale(weapon.scale,weapon.scale);
    r.path(ctx,'M -3 14 L -3 -53 L 3 -53 L 3 14 Q 0 20 -3 14 Z',r.gradient(ctx,-3,0,3,0,[[0,c.hairShade],[.5,c.blueLight],[1,c.hairShade]]),c.ink,1.5);
    r.path(ctx,'M -4 8 L 4 8 M -4 -12 L 4 -12 M -4 -43 L 4 -43',null,c.gold,2);
    r.path(ctx,'M -3 -45 Q -17 -48 -13 -65 L -8 -57 L 0 -52 L 8 -57 L 13 -65 Q 17 -48 3 -45 Z',c.gold,c.ink,1.5);
    r.path(ctx,'M 0 -80 L 9 -66 L 0 -54 L -9 -66 Z',r.gradient(ctx,-8,-78,8,-54,[[0,'#eaffff'],[.4,c.gem],[1,'#438aa5']]),c.ink,1.5);r.path(ctx,'M 0 -78 L -2 -66 L 0 -57 M -7 -66 L 7 -66',null,'#ffffffb0',1);ctx.restore();
  },{tipLength:80});
  const orb=({r,ctx,weapon,p})=>{const c=r.colors;ctx.save();ctx.translate(weapon.grip.x,weapon.grip.y);ctx.scale(weapon.scale,weapon.scale);r.ellipse(ctx,0,0,14,15,r.gradient(ctx,-10,-12,10,13,[[0,'#e6f7ff'],[.4,'#9bc9e8'],[.75,'#766bc0'],[1,'#36496d']]),c.ink,1.6);r.path(ctx,'M -17 3 Q 0 15 17 3 M -11 -11 Q 0 -18 11 -11',null,c.gold,2);r.star(ctx,1,-1,5,c.goldLight);r.ellipse(ctx,-5,-6,3,4,'#ffffffc0');ctx.restore();};
  held('orb_crystal_01','mainHand','漂浮水晶球','orb','orbitRight',orb);
  held('orb_offhand_01','offHand','副手水晶球','orb','orbitLeft',orb);
})(window.ChibiLab=window.ChibiLab||{});
