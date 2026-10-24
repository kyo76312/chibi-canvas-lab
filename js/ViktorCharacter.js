(function(Lab){
  'use strict';
  // Original vector interpretation of the supplied front / profile / rear sheet.
  // Geometry is attached to the shared humanoid rig; no bitmap is loaded.
  const side=view=>view==='left'||view==='right';
  const metal=(r,ctx,x=-35,y=-70,x2=35,y2=25)=>r.gradient(ctx,x,y,x2,y2,[[0,'#dae9ed'],[.26,'#a9c8da'],[.55,'#7189a5'],[1,'#3c4766']]);
  const gold=(r,ctx)=>r.gradient(ctx,-40,-60,40,15,[[0,'#fff1c3'],[.30,'#e8d29a'],[.64,'#b3945d'],[1,'#7c613e']]);
  const reg=(id,slot,name,channels,extra={})=>Lab.parts.register(id,{name,slot,rigs:['humanoid'],attachment:slot==='head'?'head':slot==='feet'?'feet':'torso',layers:'humanoid',hides:[],params:{},draw:channels,...extra});
  const all=channels=>({front:channels,back:channels,profile:channels});
  function crown({r,ctx,p,view}){
    const c=r.colors,g=gold(r,ctx),m=metal(r,ctx,-45,-50,40,60),profile=side(view),rear=view==='back';
    ctx.save();ctx.rotate((p.hair||0)*.12);
    // Layered brown hair peeks around a closed, sculpted mask.
    r.path(ctx,profile?'M -40 -38 Q -51 -67 -12 -67 Q 26 -75 43 -35 L 50 3 L 40 16 L 47 30 L 26 29 L 31 48 L 10 40 L -5 47 L -32 24 Z':'M -52 -32 Q -54 -66 -27 -65 L -11 -77 L 1 -64 L 20 -71 Q 51 -66 58 -32 L 63 -3 L 52 11 L 60 22 L 39 24 L 41 43 L 20 37 L 4 53 L -13 42 L -35 48 L -38 29 L -57 27 L -51 11 L -63 -3 Z',r.gradient(ctx,-50,-60,45,45,[[0,'#69513e'],[.5,'#3c2c29'],[1,'#261e26']]),c.ink,2.2);
    if(profile){
      r.path(ctx,'M -35 -46 Q -6 -61 22 -42 L 37 -19 L 40 3 L 57 14 L 43 22 L 24 57 L -12 40 Q -35 17 -35 -46 Z',m,c.ink,2.2);
      r.path(ctx,'M -14 -41 L 13 -48 L 29 -21 L 22 -7 L 49 14 L 24 57 L 21 13 L 3 -6 Z','#bedbe6',c.ink,1.2);
      r.path(ctx,'M 16 -5 Q 34 -8 42 3 L 26 13 L 17 10 Z','#423a30',c.gold,1.2);
      ctx.save();ctx.shadowColor='#e8fae6';ctx.shadowBlur=8;r.ellipse(ctx,30,3,6,3.4,'#d6ffff');ctx.restore();
      r.path(ctx,'M -39 -30 Q -22 -61 20 -55 L 32 -38 L 10 -41 Q -19 -39 -31 -18 Z',g,c.ink,1.8);
      r.path(ctx,'M -35 -31 Q -42 -61 -11 -81 L -2 -93 Q -7 -64 13 -48 L -7 -46 Q -20 -67 -35 -31 Z',g,c.ink,2);
      r.path(ctx,'M -7 -40 Q 12 -64 22 -78 Q 30 -53 52 -50 L 32 -20 L 23 -31 Z',g,c.ink,2);
      r.path(ctx,'M -29 -13 Q -3 -19 5 1 L -10 24 L -19 45 L -28 34 L -23 15 L -39 19 Z','#4b3730',c.ink,1.6);
      r.path(ctx,'M -18 -11 L 3 -9 L -2 1 L -22 11 L -7 12 L -16 23',null,'#8c6a4b',1.5);
      r.path(ctx,'M 20 26 L 24 46 M 30 22 L 33 30',null,'#e0eef1',1);
    }else{
      r.path(ctx,'M -46 -37 Q -20 -62 0 -54 Q 21 -61 46 -37 L 49 4 Q 39 28 20 45 L 0 59 L -22 44 Q -40 29 -49 4 Z',m,c.ink,2.2);
      if(!rear){
        r.path(ctx,'M 0 -52 L 15 -22 L 8 8 L 0 57 L -8 8 L -15 -22 Z','#c6e5ec',c.ink,1.2);
        for(const sign of [-1,1]){ctx.save();ctx.scale(sign,1);
          r.path(ctx,'M 10 -1 Q 24 -12 42 -7 L 36 8 L 19 14 L 10 9 Z','#493b2b',c.gold,1.2);
          ctx.save();ctx.shadowColor='#ffecc0';ctx.shadowBlur=9;r.path(ctx,'M 17 2 Q 27 -3 34 -1 Q 34 6 23 8 Z','#d2ffff',null);ctx.restore();
          r.path(ctx,'M 11 20 L 35 10 L 26 33 L 4 52 Z','#7b94ae',null);
          r.path(ctx,'M 20 23 L 25 17 M 14 36 L 20 29',null,'#b6d5e5',1.1);ctx.restore();}
        r.path(ctx,'M 0 -36 L 4 -30 L 0 -24 L -4 -30 Z','#fff5cf',c.gold,1);
      }else{
        r.path(ctx,'M 0 -42 L 0 35 L -13 48 L 0 58 L 13 48 Z','#7896ae',c.ink,1.3);
        r.path(ctx,'M -26 -28 Q -33 -2 -24 29 M 26 -28 Q 33 -2 24 29',null,'#d4e3e6',1.4);
        r.path(ctx,'M -19 42 L 0 29 L 19 42 L 0 55 Z',g,c.ink,1.4);
      }
      for(const sign of [-1,1]){ctx.save();ctx.scale(sign,1);
        r.path(ctx,'M 13 -35 Q 24 -49 34 -49 Q 49 -67 50 -77 Q 64 -53 52 -26 L 43 -10 L 31 -21 Z',g,c.ink,2);
        r.path(ctx,'M 37 -31 Q 51 -45 52 -59 M 20 -36 Q 34 -38 40 -28',null,'#fff1c7',1.4);
        r.path(ctx,'M 39 4 L 60 -3 L 50 10 L 34 16 Z',g,c.ink,1.4);
        r.path(ctx,'M 39 17 Q 53 26 35 35 L 26 47 L 25 32 Z','#4a352c',c.ink,1.3);ctx.restore();}
      r.path(ctx,'M -17 -47 L 0 -91 L 17 -47 L 7 -35 L 0 -43 L -7 -35 Z',g,c.ink,2);
      r.path(ctx,'M 0 -85 L 1 -49 L 11 -46',null,'#fff6d5',1.4);
    }
    ctx.restore();
  }
  function cloak({r,ctx,p,view}){
    const profile=side(view);ctx.save();ctx.rotate((p.cape||0)*.65+(p.skirt||0)*.15);
    r.path(ctx,profile?'M -24 -80 Q -43 -64 -45 -32 L -57 70 L -46 54 L -38 68 L -33 46 L -24 63 L -15 49 L -7 64 L 2 50 L 9 67 L 7 -8 L 0 -72 Z':'M -29 -80 Q -40 -61 -40 -20 L -51 69 L -39 52 L -33 66 L -25 46 L -15 61 L -5 49 L 4 65 L 15 46 L 25 60 L 31 46 L 43 67 L 51 77 L 43 -21 Q 39 -67 29 -80 Z',r.gradient(ctx,-45,-40,47,70,[[0,'#491c37'],[.34,'#942948'],[.58,'#a83652'],[1,'#531e3b']]),r.colors.ink,2);
    r.path(ctx,profile?'M -28 -65 Q -35 -5 -46 48 M -8 -49 L -11 43':'M -25 -65 Q -29 -9 -37 42 M 0 -64 Q -9 -5 -10 40 M 24 -62 Q 25 -13 36 42',null,'#541d38',2.5);
    r.path(ctx,profile?'M -43 35 L -48 44 L -44 52 L -39 43 Z':'M -37 33 L -42 44 L -38 50 L -33 43 Z','#eaf0f0',r.colors.ink,1);
    ctx.restore();
  }
  function torso(a){
    const {r,ctx,p,view}=a,c=r.colors,profile=side(view),rear=view==='back',w=profile?21:28,g=gold(r,ctx);
    r.path(ctx,`M ${-w} -77 Q 0 -91 ${w} -77 L ${w-5} -24 L 0 -8 L ${-w+5} -24 Z`,metal(r,ctx),c.ink,2);
    if(rear)cloak(a);
    else{
      r.path(ctx,`M ${-w} -62 L -10 -49 L 0 -57 L 10 -49 L ${w} -62 L 18 -36 L 0 -24 L -18 -36 Z`,g,c.ink,1.5);
      r.path(ctx,'M 0 -71 L 11 -56 L 0 -43 L -11 -56 Z',metal(r,ctx),c.ink,1.2);
      r.path(ctx,'M 0 -36 L 8 -24 L 0 -12 L -8 -24 Z','#a4c8db',c.gold,1.4);
      r.path(ctx,`M ${-w+2} -35 L -12 -30 L 0 -17 L 12 -30 L ${w-2} -35 L ${w+1} -20 L 15 -15 L 0 -2 L -15 -15 L ${-w-1} -20 Z`,g,c.ink,1.5);
      r.path(ctx,'M -18 -52 L -13 -42 M 18 -52 L 13 -42 M 0 -67 L 0 -51',null,'#e9f5f5',1.1);
    }
    // Folded blue mantle and crimson cowl wrap consistently around every view.
    r.path(ctx,profile?'M -21 -84 Q -6 -95 22 -80 L 33 -59 Q 18 -47 -11 -57 L -29 -66 Z':'M -12 -87 Q -33 -90 -40 -74 L -44 -59 Q -20 -49 0 -61 Q 22 -48 43 -61 L 37 -79 Q 15 -92 -12 -87 Z',r.gradient(ctx,-35,-84,30,-51,[[0,'#72a9bf'],[.4,'#326886'],[1,'#183f5e']]),c.ink,2);
    r.path(ctx,profile?'M -23 -77 Q -7 -66 28 -63 M -19 -70 Q -2 -60 19 -57':'M -36 -77 Q -12 -67 27 -78 M -39 -67 Q -13 -57 30 -68 M -13 -83 Q 8 -66 39 -67',null,'#81afc1',1.5);
    r.path(ctx,'M -28 -91 Q -13 -84 0 -87 Q 16 -96 31 -94 L 23 -84 L 37 -82 L 23 -77 Q 0 -72 -29 -81 L -37 -91 Z',r.gradient(ctx,-30,-94,28,-73,[[0,'#bf4b61'],[.5,'#8d2444'],[1,'#4d1938']]),c.ink,1.7);
    r.path(ctx,'M -21 -88 Q 0 -79 22 -87',null,'#dc7081',1.2);
    const badge=profile?12:rear?27:-25;r.ellipse(ctx,badge,-68,8,11,g,c.ink,1.5);r.path(ctx,`M ${badge} -77 L ${badge+5} -69 L ${badge} -60 L ${badge-5} -69 Z`,null,'#fff0be',1.3);
  }
  // Plate shapes are constructed in each bone's local coordinate system.
  function plate({r,ctx,chain,back},which){
    const a=chain[which],b=chain[which+1],len=Math.hypot(b.x-a.x,b.y-a.y),scale=which?(chain.foreScale||1):(chain.upperScale||1),w=(which?8:10)*scale;
    ctx.save();ctx.translate(a.x,a.y);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2);
    r.path(ctx,`M ${-w} 0 Q 0 -6 ${w} 0 L ${w*.7} ${len*.7} L 0 ${len+2} L ${-w*.7} ${len*.7} Z`,metal(r,ctx,-w,0,w,len),r.colors.ink,1.7);
    r.path(ctx,`M 0 2 L ${w*.4} ${len*.4} L -2 ${len-4} M ${-w*.6} 5 L ${-w*.4} ${len*.65}`,null,back?'#7897ae':'#d2e9ef',1.1);
    if(which)r.path(ctx,`M ${-w} 2 L 0 8 L ${w} 2 L ${w+2} 10 L 0 17 L ${-w-2} 10 Z`,gold(r,ctx),r.colors.ink,1.2);
    ctx.restore();
  }
  function wrist({r,ctx}){r.path(ctx,'M -8 -9 L 0 -14 L 8 -9 L 10 -2 L 0 3 L -10 -2 Z',gold(r,ctx),r.colors.ink,1.3);r.ellipse(ctx,0,-3,13,4,null,r.colors.goldLight,2);}
  function hand({r,ctx}){r.path(ctx,'M -6 -2 Q -10 0 -7 6 L -4 12 L -1 11 L -2 5 L 2 11 L 5 10 L 5 4 L 8 6 L 9 3 L 5 -3 Z','#3f435c',r.colors.ink,1.4);r.path(ctx,'M -4 0 L -1 4 M 1 -1 L 4 3',null,'#8b9ab4',1);}
  function legs(a){plate(a,0);plate(a,1);const {r,ctx,chain}=a,k=chain[1];r.path(ctx,`M ${k.x-9} ${k.y-5} L ${k.x} ${k.y-12} L ${k.x+9} ${k.y-5} L ${k.x} ${k.y+9} Z`,gold(r,ctx),r.colors.ink,1.3);}
  function feet({r,ctx,chain,view}){
    const f=chain[2],profile=side(view),rear=view==='back';ctx.save();ctx.translate(f.x,f.y);ctx.scale(chain.footScale||1,chain.footScale||1);
    r.path(ctx,profile?'M -8 -18 L 7 -18 L 9 -4 Q 18 -2 22 3 L 22 9 Q 7 15 -12 9 L -11 0 Z':rear?'M -9 -19 L 9 -19 L 11 4 Q 16 11 0 12 Q -16 11 -11 4 Z':'M -8 -19 L 8 -19 L 11 -1 Q 17 8 13 12 Q 0 17 -13 12 Q -17 8 -11 -1 Z',r.gradient(ctx,-12,-18,16,14,[[0,'#74829b'],[.4,'#434c69'],[1,'#2c314b']]),r.colors.ink,1.6);
    for(const x of [-7,-2,3,8])if(!rear)r.path(ctx,`M ${x} 7 L ${x-1} 12`,null,'#8592aa',.8);
    r.ellipse(ctx,0,-13,13,4.5,gold(r,ctx),r.colors.ink,1.3);r.ellipse(ctx,0,-14,9,2.6,'#48506a',r.colors.goldLight,.8);ctx.restore();
  }
  function machine({r,ctx,p,view},front){
    const profile=side(view),rear=view==='back',sign=profile?-1:rear?1:-1,weight=p.castWeight||0,time=r.actor.animation.clock;
    ctx.save();ctx.scale(sign,1);
    // The proximal links sit behind the torso; the emitter remains outside its silhouette.
    const start={x:profile?4:17,y:-56},elbow={x:55+weight*5,y:-88},tip={x:76+weight*9,y:-111-weight*13+Math.sin(time*2)*1.5};
    if(!front){
      r.segment(ctx,start,elbow,11,'#41465e');r.segment(ctx,elbow,tip,9,metal(r,ctx));
      r.path(ctx,`M ${start.x} ${start.y} Q 67 -43 ${elbow.x} ${elbow.y}`,null,'#baa46d',2);
      for(const v of [start,elbow]){r.ellipse(ctx,v.x,v.y,7,7,gold(r,ctx),r.colors.ink,1.4);r.ellipse(ctx,v.x,v.y,3,3,'#6ca4b5',r.colors.ink,1);}
    }else{
      ctx.translate(tip.x,tip.y);ctx.rotate(-.45-weight*.35);
      r.path(ctx,'M -7 13 L -11 -4 L -7 -13 L 0 -8 L 7 -13 L 11 -4 L 7 13 L 0 20 Z',metal(r,ctx),r.colors.ink,1.6);
      r.path(ctx,'M -10 2 Q -23 -4 -17 -20 L -7 -7 L -4 4 M 10 2 Q 23 -4 17 -20 L 7 -7 L 4 4',gold(r,ctx),r.colors.ink,1.5);
      r.path(ctx,'M -5 -6 L 0 -24 L 5 -6 L 0 3 Z',gold(r,ctx),r.colors.ink,1.3);
      ctx.save();ctx.shadowBlur=6+weight*14;ctx.shadowColor='#aefcff';r.ellipse(ctx,0,8,3,4,'#b5ffff',r.colors.ink,1);ctx.restore();
      if(weight>.05){ctx.globalAlpha=weight*.6;r.ellipse(ctx,0,8,9,10,'#96faff50');}ctx.globalAlpha=1;
    }ctx.restore();
  }
  reg('viktor_mask','head','維克特・奧術面具與頭冠',all({head:crown}),{hides:['face','hair','hairAccessory']});
  reg('viktor_armor','chest','維克特・奧術甲胄與機械臂',all({body:torso,cape:a=>{if(a.view!=='back')cloak(a);},upper:a=>plate(a,0),forearm:a=>plate(a,1),wrist,hand,backAccessory:a=>machine(a,false),accessory:a=>machine(a,true)}),{effectProfile:'hexRay',updateAttachments(actor){const s=actor.rig,p=actor.animation.pose,profile=side(s.facing),sign=profile?-1:s.facing==='back'?1:-1,w=p.castWeight||0,angle=-.45-w*.35,x=sign*(76+w*9-Math.sin(angle)*8)*s.rig.bodyWidth,y=(-111-w*13+Math.sin(actor.animation.clock*2)*1.5+Math.cos(angle)*8)*s.rig.torsoScale,co=Math.cos(s.angle),si=Math.sin(s.angle);s.attachments.arcEmitter={x:s.root.x+x*co-y*si,y:s.root.y+x*si+y*co};s.attachments.castOrigin={...s.attachments.arcEmitter};}});
  reg('viktor_legs','legs','維克特・金紋腿甲',all({body:({r,ctx})=>r.path(ctx,'M -23 -25 L 23 -25 L 19 0 L 0 12 L -19 0 Z',metal(r,ctx),r.colors.ink,1.6),limbs:legs}));
  reg('viktor_feet','feet','維克特・環飾足甲',all({foot:feet}));
  Lab.parts.register('viktor_staff',{name:'維克特・螺旋奧術權杖',slot:'mainHand',rigs:['humanoid'],holdStyle:'staff',attachment:'rightHand',actionProfile:'cast',tipLength:104,layers:'hand',hides:[],params:{},draw:{},drawHeld({r,ctx,weapon}){
    ctx.save();ctx.translate(weapon.grip.x,weapon.grip.y);ctx.rotate(weapon.angle);ctx.scale(weapon.scale,weapon.scale);
    r.path(ctx,'M -2 41 L -3 -64 L 3 -64 L 2 41 L 0 47 Z',metal(r,ctx,-3,0,3,0),r.colors.ink,1.3);
    for(const y of [-55,-35,10,35])r.path(ctx,`M -4 ${y} L 0 ${y-4} L 4 ${y} L 0 ${y+4} Z`,gold(r,ctx),r.colors.ink,.9);
    r.path(ctx,'M -2 -57 Q -22 -61 -14 -77 Q -8 -88 6 -88 Q 21 -90 13 -102 L 20 -111 Q 30 -96 22 -85 Q 16 -77 2 -78 Q -10 -77 -8 -69 Q -4 -65 4 -69 Q 19 -74 22 -61 Q 26 -49 7 -48 L 0 -57 L 11 -56 Q 17 -60 9 -62 Q 0 -59 -2 -57 Z',gold(r,ctx),r.colors.ink,1.6);
    r.path(ctx,'M -10 -73 Q -13 -83 5 -84 Q 22 -87 18 -99 M 4 -66 Q 22 -71 19 -59',null,'#fff3c3',1.3);
    r.path(ctx,'M -1 -57 L 4 -64 L 9 -56 L 3 -49 Z','#a3e8ed',r.colors.ink,1);ctx.restore();
  }});
  Lab.characters.register('viktor',{name:'維克特 Viktor',category:'npc',rigType:'humanoid',animationSet:'humanoid_basic',appearance:{id:'viktor',subtitle:'THE ARCANE TRANSCENDENT',palette:{hair:'#48352c',hairShade:'#271f29',hairLight:'#806149',skin:'#819bb5',skinShade:'#48536f',skinLight:'#c7e2ec',blue:'#376783',blueLight:'#80b0c2',blueShade:'#234760',gold:'#c9ae72',goldLight:'#f3e1ae',leather:'#464b65',leatherShade:'#2b3047'},outfit:{cape:false},accessories:{satchel:false}},proportions:{headSize:.96,bodyWidth:.94,torsoLength:99,upperArm:32,forearm:29,thigh:43,shin:43,limbWidth:.9,handSize:.93,footSize:.94,headOffset:139,headClearance:116},equipment:{head:'viktor_mask',hairAccessory:null,chest:'viktor_armor',legs:'viktor_legs',feet:'viktor_feet',mainHand:'viktor_staff',offHand:null},movementConfig:{walkSpeed:120,runSpeed:240}});
})(window.ChibiLab=window.ChibiLab||{});
