(function(Lab){
  'use strict';
  const defaults={face:'aster_face',hair:'aster_hair',head:null,hairAccessory:'star_pin',chest:'aster_coat',legs:'aster_skirt',feet:'aster_boots'};
  const view=f=>f==='left'||f==='right'?'profile':f;
  class PaperDoll{
    static hidden(actor,name){return Object.values(actor.equipment).filter(Boolean).some(id=>[...(Lab.parts.get(id).hides||[]),...(Lab.parts.get(id).hideRules?.[actor.facing]||[])].includes(name));}
    static drawPart(r,slot,channel,ctx,p,extra){
      const id=r.actor?(slot==='face'||slot==='hair'?r.actor.appearance.parts[slot]:r.actor.equipment[slot]):defaults[slot];
      if(!id||r.actor&&(this.hidden(r.actor,slot)||this.hidden(r.actor,slot+':'+channel)))return false;
      const part=Lab.parts.get(id),f=r.activeView||'front',fn=part.draw?.[f]?.[channel]||part.draw?.[view(f)]?.[channel];if(!fn)return false;
      const previous=r.colors;r.colors={...previous,...part.params?.palette};
      try{fn({r,ctx,p,actor:r.actor,s:r.activeRig,view:f,params:part.params||{},...extra});}finally{r.colors=previous;}return true;
    }
    static render(r,ctx,s,p,time,facing){
      if(!r.views)r.views=new Lab.CharacterViews(r);const v=r.views,jobs=[];
      const job=(layer,draw)=>jobs.push({layer,draw});
      const active=a=>(a.weapon||a.held)&&Math.max(p.slashWeight||0,p.castWeight||0)>.02;
      const arm=(a,far=false,part='all')=>()=>r.arm(ctx,a,far,p,s,part);
      const head=()=>r.withHead(ctx,s,p,()=>facing==='front'?r.head(ctx,p,time):facing==='back'?v.rearHead(ctx,p):v.profileHead(ctx,p));
      ctx.save();ctx.lineJoin='round';ctx.lineCap='round';if(facing==='left')ctx.scale(-1,1);
      if(facing==='front'){
        job(10,()=>r.withHead(ctx,s,p,()=>r.backHair(ctx,p)));job(20,()=>r.withBody(ctx,s,()=>r.cape(ctx,p)));
      }else if(facing!=='back')job(10,()=>r.withHead(ctx,s,p,()=>v.profileHairBack(ctx,p)));
      if(facing==='front'||facing==='back'){
        [s.leftLeg,s.rightLeg].sort((a,b)=>a.depth-b.depth||(facing==='front'?1:-1)*(a[0].x-b[0].x)).forEach((a,i)=>job(30,()=>facing==='front'?r.leg(ctx,a,i===0):v.rearLeg(ctx,a,i===0)));
        const arms=[s.leftArm,s.rightArm].sort((a,b)=>a.depth-b.depth);
        arms.forEach(a=>{if(active(a)){if(facing==='back'){job(65,arm(a,false,'upper'));job(90,arm(a,false,'fore'));}else job(90,arm(a));}else job(a.depth<0?40:70,arm(a,a.depth<0));});
      }else{
        const legs=s.viewLegs||{far:s.leftLeg,near:s.rightLeg},arms=s.viewArms||{far:s.leftArm,near:s.rightArm};
        job(30,()=>v.profileLeg(ctx,legs.far,true));job(31,()=>v.profileLeg(ctx,legs.near,false));
        job(active(arms.far)?90:40,arm(arms.far,true));job(active(arms.near)?91:70,arm(arms.near));
      }
      job(60,()=>r.withBody(ctx,s,()=>facing==='front'?r.body(ctx,p):facing==='back'?v.rearBody(ctx,p):v.profileBody(ctx,p)));
      job(55,()=>r.withBody(ctx,s,()=>r.part('chest','backAccessory',ctx,p)));
      job(80,head);job(85,()=>r.withBody(ctx,s,()=>r.part('chest','accessory',ctx,p)));
      job(98,()=>Lab.EquipmentSystem.drawFloating(r,ctx,s,p));jobs.sort((a,b)=>a.layer-b.layer).forEach(j=>j.draw());r.lastLayers=jobs.map(j=>j.layer);ctx.restore();
    }
  }
  Lab.PaperDoll=PaperDoll;
  const register=(id,slot,draw,extra={})=>Lab.parts.register(id,{name:id,slot,rigs:['humanoid'],attachment:slot==='feet'?'feet':slot==='head'||slot==='hairAccessory'?'head':'torso',layers:'humanoid',hides:[],params:{},draw,...extra});
  const all=channels=>({front:channels,back:channels,left:channels,right:channels});
  register('aster_face','face',{front:{face:({r,ctx,p})=>r.asterFace(ctx,p)},back:{},profile:{face:({r,ctx,p})=>r.views.profileFace(ctx,p)}});
  register('aster_hair','hair',{front:{back:({r,ctx,p})=>r.asterBackHair(ctx,p),front:({r,ctx,p})=>r.frontHair(ctx,p)},back:{front:({r,ctx,p})=>r.views.asterRearHair(ctx,p)},profile:{back:({r,ctx,p})=>r.views.asterProfileHairBack(ctx,p),front:({r,ctx,p})=>r.views.profileCrown(ctx,p),side:({r,ctx,p})=>r.views.profileStrand(ctx,p)}});
  register('star_pin','hairAccessory',{front:{head:({r,ctx,p})=>r.asterAccessory(ctx,p)},back:{head:({r,ctx,p})=>r.views.rearAccessory(ctx,p)},profile:{head:({r,ctx,p})=>r.views.profileAccessory(ctx,p)}},{name:'星形髮飾'});
  const coat={upper:({r,ctx,chain,back})=>r.asterUpper(ctx,chain,back),cuff:({r,ctx,chain,back})=>r.asterCuff(ctx,chain,back),wrist:({r,ctx})=>r.path(ctx,'M -6 -9 Q 0 -6 6 -9 L 7 -1 Q 1 3 -7 -1 Z',r.colors.leather,r.colors.ink,1.3)};
  register('aster_coat','chest',{front:{...coat,body:({r,ctx,p})=>r.asterChest(ctx,p),cape:({r,ctx,p})=>r.asterCape(ctx,p)},back:{...coat,body:({r,ctx,p})=>r.views.rearBodyChest(ctx,p)},profile:{...coat,body:({r,ctx,p})=>r.views.profileBodyChest(ctx,p),cape:({r,ctx,p})=>r.views.profileCape(ctx,p)}},{name:'星汐冒險上衣'});
  register('aster_skirt','legs',{front:{body:({r,ctx,p})=>r.asterSkirt(ctx,p)},back:{body:({r,ctx,p})=>r.views.rearBodySkirt(ctx,p)},profile:{body:({r,ctx,p})=>r.views.profileBodySkirt(ctx,p)}},{name:'藍白百褶裙'});
  const boots={front:{foot:({r,ctx,chain,back})=>r.asterFeet(ctx,chain,back)},back:{foot:({r,ctx,chain,back})=>r.views.rearLegFeet(ctx,chain,back)},profile:{foot:({r,ctx,chain,back})=>r.views.profileLegFeet(ctx,chain,back)}};
  register('aster_boots','feet',boots,{name:'深藍冒險短靴'});
  register('silver_boots','feet',boots,{name:'銀白護甲靴',params:{palette:{leather:'#a5b8c8',leatherShade:'#71869e',sole:'#34445b',blueShade:'#d8e5ed',gold:'#e5c780'}}});
  register('ribbon_pin','hairAccessory',all({head:({r,ctx,view})=>{const x=view==='back'?50:view==='front'?-46:-22;r.path(ctx,`M ${x} -24 Q ${x-22} -42 ${x-20} -19 Q ${x-15} -8 ${x} -20 Q ${x+22} -42 ${x+21} -20 Q ${x+17} -8 ${x} -20 Z`,'#9c6d93',r.colors.ink,1.6);r.ellipse(ctx,x,-22,4,5,r.colors.gold,r.colors.ink,1);}}),{name:'紫緞蝴蝶結'});
  register('silver_circlet','head',all({head:({r,ctx,view})=>{
    const c=r.colors,profile=view==='left'||view==='right';
    r.path(ctx,profile?'M -53 -15 Q -60 -58 -27 -73 Q 17 -87 43 -50 L 44 -19 Q 15 -31 -9 -17 L -16 -3 L -25 -18 Z':'M -58 -10 Q -66 -58 -31 -74 Q 5 -88 38 -67 Q 64 -50 59 -10 L 45 -17 Q 0 -40 -45 -17 Z',r.gradient(ctx,-40,-70,45,-8,[[0,'#849bb7'],[.5,'#edf6fa'],[1,'#637a9b']]),c.ink,2);
    r.path(ctx,profile?'M -49 -23 Q -22 -45 41 -30':'M -54 -18 Q 0 -46 55 -18',null,c.gold,3);r.star(ctx,profile?31:0,-38,9,c.gold);r.ellipse(ctx,profile?31:0,-38,3.5,5,c.gem,c.ink,1);
  }}),{name:'銀翼護額',hides:['hairAccessory'],hideRules:{front:['hair:front'],left:['hair:front'],right:['hair:front']}});
  const robeBody=({r,ctx,view})=>{const c=r.colors,side=view==='left'||view==='right',w=side?23:31;
    r.path(ctx,`M ${-w} -77 Q 0 -90 ${w} -77 L ${w-3} -23 Q 0 -9 ${-w+3} -23 Z`,r.gradient(ctx,-30,-75,30,-20,[[0,'#354d74'],[.5,'#7188b6'],[1,'#3a507c']]),c.ink,2);
    r.path(ctx,`M ${-w+3} -73 L -3 -54 L -6 -22 M ${w-3} -73 L 3 -54 L 6 -22`,null,c.gold,2);r.path(ctx,`M ${-w} -29 Q 0 -20 ${w} -29 L ${w} -18 Q 0 -10 ${-w} -18 Z`,c.leather,c.ink,1.5);r.star(ctx,0,-54,6,c.gold);
  };
  register('robe_blue_01','chest',all({body:robeBody,upper:({r,ctx,chain})=>r.segment(ctx,chain[0],chain[1],23*(chain.upperScale||1),r.gradient(ctx,-20,0,20,0,[[0,'#435779'],[.5,'#7f97bd'],[1,'#44577e']])),cuff:coat.cuff,wrist:coat.wrist}),{name:'星紋施法上衣'});
  register('long_robe','legs',all({body:({r,ctx,p,view})=>{ctx.save();ctx.rotate(p.skirt*.5);const w=view==='front'||view==='back'?33:25;r.path(ctx,`M -23 -23 Q 0 -14 23 -23 L ${w+7} 58 Q 0 74 ${-w-7} 58 Z`,r.gradient(ctx,-40,-20,40,65,[[0,'#35476e'],[.5,'#788bb4'],[1,'#35476e']]),r.colors.ink,2);r.path(ctx,`M ${-w-5} 52 Q 0 66 ${w+5} 52`,null,r.colors.gold,2);for(const x of [-15,0,15])r.path(ctx,`M ${x} -10 L ${x*1.6} 53`,null,'#495b84',1.3);ctx.restore();}}),{name:'星紋長袍下襬',hides:['legSkin']});
  register('traveler_pants','legs',all({body:({r,ctx})=>r.path(ctx,'M -25 -23 L 25 -23 L 24 5 Q 0 12 -24 5 Z','#596681',r.colors.ink,1.6),limbs:({r,ctx,chain,back})=>{r.segment(ctx,chain[0],chain[1],19*(chain.upperScale||1),back?'#485570':'#64748f');r.segment(ctx,chain[1],chain[2],17*(chain.foreScale||1),'#4d5b76');}}),{name:'旅人長褲'});
})(window.ChibiLab=window.ChibiLab||{});
