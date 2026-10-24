(function(Lab){
  'use strict';
  const mix=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const length=v=>Math.hypot(v.x,v.y,v.z||0),dot=(a,b)=>a.x*b.x+a.y*b.y+(a.z||0)*(b.z||0);
  const unit=v=>{const d=length(v)||1;return{x:v.x/d,y:v.y/d,z:(v.z||0)/d};};
  const minus=(a,b)=>({x:a.x-b.x,y:a.y-b.y,z:(a.z||0)-(b.z||0)});
  class SwordSystem{
    static isProfile(s){return s.facing==='left'||s.facing==='right';}
    static carry(s,p){
      const side=s.facing==='front'?-1:1,swing=p.gaitSwing||0;
      // The sword arm keeps a compact guard; the unarmed arm owns the full swing.
      return {angle:this.isProfile(s)?.55+swing*.045:side*((s.facing==='back'?.85:.48)+swing*.025),radius:(40+(p.runWeight||0)*1.5)*(s.rig.upperArm+s.rig.forearm)/56,
        depth:this.isProfile(s)?0:(s.facing==='back'?-12:12)};
    }
    static handAngle(s,cut){
      if(this.isProfile(s))return mix(2.10,.65,cut);
      // Up-facing has its own outside-shoulder arc. Its hand NEVER crosses
      // the spinal line: the visible silhouette is different from the front.
      if(s.facing==='back')return mix(2.10,.92,cut);
      return mix(2.05,-.78,cut);
    }
    static target(s,cut){
      const angle=this.handAngle(s,cut),radius=(this.isProfile(s)?46:s.facing==='back'?38:44)*(s.rig.upperArm+s.rig.forearm)/56,start=s.swordShoulder;
      return {x:start.x+Math.sin(angle)*radius,y:start.y+Math.cos(angle)*radius,z:this.isProfile(s)?0:(s.facing==='back'?-14:14)};
    }
    static bladeAngle(s,cut){
      if(this.isProfile(s))return mix(.52,2.60,cut);
      // Viewed from behind, the same right-handed cut winds the other way.
      // Finish outside the right hem instead of aiming across the lower back.
      if(s.facing==='back')return mix(.65,3.45,cut);
      return mix(.80,-2.15,cut);
    }
    static solveArm(s,chain,p){
      const profile=this.isProfile(s),sign=s.facing==='back'?-1:1,w=p.slashWeight||0,carry=this.carry(s,p),guard=1-(p.hurt||0);
      const model=chain.spatial?chain.spatial.map(v=>({x:v.x,y:v.y,z:v.z*sign})):chain.map(v=>({x:v.x,y:v.y,z:0}));
      const start=model[0],goal=this.target(s,p.slashCut),baseVector=minus(model[2],start),goalVector=minus(goal,start);
      // Blend direction and radius separately; crossing the torso cannot collapse
      // the reach to zero and fold the elbow against itself.
      // Use a fixed winding for the sword raise. Shortest-arc quaternion/vector
      // blending flips branches when the running hand crosses the antipode.
      const baseAngle=Math.atan2(baseVector.x,baseVector.y),goalAngle=this.handAngle(s,p.slashCut);
      const intendedAngle=mix(carry.angle,goalAngle,w);
      const angle=mix(baseAngle,intendedAngle,guard),goalRadius=Math.hypot(goalVector.x,goalVector.y);
      const intendedDepth=mix(Math.atan2(carry.depth,carry.radius),Math.atan2(goalVector.z,goalRadius),w);
      const depth=mix(Math.atan2(baseVector.z,Math.hypot(baseVector.x,baseVector.y)),intendedDepth,guard);
      const direction={x:Math.sin(angle)*Math.cos(depth),y:Math.cos(angle)*Math.cos(depth),z:Math.sin(depth)};
      const a=s.rig.upperArm,b=s.rig.forearm,reach=clamp(mix(length(baseVector),mix(Math.hypot(carry.radius,carry.depth),length(goalVector),w),guard),Math.abs(a-b)+.001,a+b-.001);
      const along=(a*a-b*b+reach*reach)/(2*reach),height=Math.sqrt(Math.max(0,a*a-along*along));
      if(profile){
        // In the side camera the elbow has one anatomical flexion direction.
        // Solve that branch analytically instead of rotating a 3D pole through it.
        const flex=Math.acos(clamp((reach*reach-a*a-b*b)/(2*a*b),-1,1));
        const shoulder=angle-Math.atan2(b*Math.sin(flex),a+b*Math.cos(flex));
        const spatial=[start,{x:start.x+Math.sin(shoulder)*a,y:start.y+Math.cos(shoulder)*a,z:0},{x:start.x+Math.sin(angle)*reach,y:start.y+Math.cos(angle)*reach,z:0}];
        const result=spatial.map(v=>({...v}));result.spatial=spatial;result.depth=0;return result;
      }
      const basePole=unit(minus(model[1],start)),side=profile?-1:(s.facing==='back'?1:-1);
      const pole={x:mix(basePole.x,side,guard),y:mix(basePole.y,.85,guard),z:mix(basePole.z,-.1,guard)};
      const projection=dot(pole,direction);let perpendicular={x:pole.x-direction.x*projection,y:pole.y-direction.y*projection,z:pole.z-direction.z*projection};
      if(length(perpendicular)<.001)perpendicular={x:-direction.y,y:direction.x,z:.1};perpendicular=unit(perpendicular);
      const elbow={x:start.x+direction.x*along+perpendicular.x*height,y:start.y+direction.y*along+perpendicular.y*height,z:start.z+direction.z*along+perpendicular.z*height};
      const hand={x:start.x+direction.x*reach,y:start.y+direction.y*reach,z:start.z+direction.z*reach};
      const spatial=[start,elbow,hand];
      return s.projectChain(spatial.map(v=>({...v,z:v.z*sign})),sign);
    }
    static attach(s,p){
      // Legacy arm slots describe the illustration's projected limbs. Resolve
      // anatomical handedness explicitly, rather than mirroring the weapon owner.
      // Front: right is screen-left. Back: right is screen-right.
      // Right profile shows the right arm near; left profile shows it far.
      const slot=s.canonical?'rightArm':s.facing==='right'?'rightArm':'leftArm',other=slot==='rightArm'?'leftArm':'rightArm';
      s.swordShoulder=s[slot][0];
      s[slot]=this.solveArm(s,s[slot],p);
      const arm=s[slot];arm.handScale=(arm.handScale||1)*(s.rig.handSize||1);arm.upperScale=(arm.upperScale||1)*(s.rig.limbWidth||1);arm.foreScale=(arm.foreScale||1)*(s.rig.limbWidth||1);
      const fore=minus(arm[2],arm[1]),d=length({x:fore.x,y:fore.y,z:0})||1,handScale=arm.handScale||1;
      const grip={x:arm[2].x+fore.x/d*(s.rig.gripOffset||3.5)*handScale,y:arm[2].y+fore.y/d*(s.rig.gripOffset||3.5)*handScale};
      const foreTilt=Math.atan2(fore.x,fore.y),profile=this.isProfile(s);
      const rest=(s.facing==='front'?-.48:profile?.36:.40)+Math.sin(foreTilt)*.055+(p.gaitSwing||0)*.025+s.angle*.35;
      const desired=this.bladeAngle(s,p.slashCut||0),weight=p.slashWeight||0;
      const angle=mix(rest,desired,weight),scale=clamp(1+(arm.depth||0)*.0015,.94,1.05);
      const weapon={owner:'right',slot,grip,angle,scale,tip:{x:grip.x+Math.sin(angle)*66*scale,y:grip.y-Math.cos(angle)*66*scale}};
      arm.handedness='right';arm.weapon=weapon;s[other].handedness='left';s.weapon=weapon;
      s.hands={right:arm,left:s[other]};
    }
    static draw(r,ctx,weapon){
      const c=r.colors;ctx.save();ctx.translate(weapon.grip.x,weapon.grip.y);ctx.rotate(weapon.angle);ctx.scale(weapon.scale,weapon.scale);
      // Original Aster equipment: a faceted tide blade, wing guard and star gem.
      r.path(ctx,'M -4 -15 L -6 -23 L -4 -50 L 0 -66 L 4 -50 L 6 -23 L 4 -15 Z',r.gradient(ctx,-6,-30,6,-30,[[0,'#7998b6'],[.38,'#e7f7ff'],[.48,'#ffffff'],[.52,'#adc9df'],[1,'#e9faff']]),c.ink,1.4);
      r.path(ctx,'M 0 -63 L -1 -25 L -4 -20 L 0 -17 L 4 -20 L 1 -25 Z','#709abc',null);
      r.path(ctx,'M 0 -60 L 0 -23',null,'#f3ffff',1.1);
      r.path(ctx,'M -3 -47 L -4 -26 M 2 -49 L 4 -26',null,'#ffffff',.75);
      r.path(ctx,'M -4 -24 L 0 -20 L 4 -24 M -4 -20 L 0 -16 L 4 -20',null,c.gold,1.1);
      r.path(ctx,'M 0 -39 L -1.8 -35 L 0 -31 L 1.8 -35 Z',c.gem,null);
      r.path(ctx,'M 0 -29 L 0 -26',null,c.gem,1);
      r.path(ctx,'M -3 -10 Q -9 -11 -14 -18 L -13 -10 Q -10 -5 -4 -7 L 0 -5 L 4 -7 Q 10 -5 13 -10 L 14 -18 Q 9 -11 3 -10 Z',r.gradient(ctx,-13,-17,12,-5,[[0,c.gold],[.46,c.goldLight],[1,'#b68642']]),c.ink,1.3);
      r.path(ctx,'M -11 -14 Q -9 -9 -5 -9 M 11 -14 Q 9 -9 5 -9',null,'#fff4c2',.9);
      r.path(ctx,'M -3 -7 L 3 -7 L 3 8 Q 0 11 -3 8 Z',c.hairShade,c.ink,1.1);
      r.path(ctx,'M -2 -4 L 2 -3 M -2 0 L 2 1 M -2 4 L 2 5',null,c.blueLight,1);
      r.path(ctx,'M -2 -5 L -2 7',null,c.gold,.55);
      r.path(ctx,'M 0 -16 L 5 -11 L 0 -6 L -5 -11 Z',c.gold,c.ink,.9);
      r.path(ctx,'M 0 -14 L 3 -11 L 0 -8 L -3 -11 Z',r.gradient(ctx,-2,-13,2,-8,[[0,'#e4ffff'],[.5,c.gem],[1,'#278ca5']]),c.ink,.6);
      r.path(ctx,'M -3 8 L 3 8 L 4 11 L 0 16 L -4 11 Z',c.gold,c.ink,1);
      r.path(ctx,'M 0 9 L 2 11 L 0 14 L -2 11 Z',c.blueLight,c.ink,.5);
      ctx.restore();
    }
    static drawTrail(r,ctx,s,p){
      if(p.slashTrail<=.01||p.slashWeight<.9)return;
      const weapon=s.weapon,profile=s.facing==='left'||s.facing==='right';
      const predicted=cut=>{const goal=this.target(s,cut),angle=this.bladeAngle(s,cut);const y=profile?goal.y:s.swordShoulder.y+(goal.y-s.swordShoulder.y)*Math.cos(.17)+goal.z*Math.sin(.17);return{h:{x:goal.x,y},outer:{x:goal.x+Math.sin(angle)*66*weapon.scale,y:y-Math.cos(angle)*66*weapon.scale},angle};};
      const end=predicted(p.slashCut),offset={x:weapon.tip.x-end.outer.x,y:weapon.tip.y-end.outer.y},outer=[],inner=[];
      for(let i=0;i<=12;i++){const cut=mix(Math.max(0,p.slashCut-.22),p.slashCut,i/12),v=predicted(cut);outer.push({x:v.outer.x+offset.x,y:v.outer.y+offset.y});inner.push({x:v.h.x+Math.sin(v.angle)*43+offset.x,y:v.h.y-Math.cos(v.angle)*43+offset.y});}
      let path='';[...outer,...inner.reverse()].forEach((v,i)=>path+=(i?'L':'M')+v.x+' '+v.y);path+='Z';
      ctx.save();ctx.globalAlpha=p.slashTrail*.30;
      r.path(ctx,path,r.gradient(ctx,weapon.grip.x-55,weapon.grip.y-60,weapon.tip.x,weapon.tip.y,[[0,'#b9e7ef00'],[.6,'#c2f1f4'],[1,'#fff7d8']]),null);
      ctx.globalAlpha=p.slashTrail*.55;ctx.beginPath();outer.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.strokeStyle='#efffff';ctx.lineWidth=1.4;ctx.stroke();ctx.restore();
    }
  }
  Lab.SwordSystem=SwordSystem;
})(window.ChibiLab=window.ChibiLab||{});
