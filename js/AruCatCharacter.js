(function(Lab){
  'use strict';
  // Tabby anatomy is drawn from curves, over the existing biped joint chains.
  const profile=view=>view==='left'||view==='right';
  const all=channels=>({front:channels,back:channels,profile:channels});
  const reg=(id,slot,name,draw,extra={})=>Lab.parts.register(id,{name,slot,rigs:['humanoid'],attachment:slot==='face'||slot==='hair'?'head':slot==='feet'?'feet':'torso',layers:'humanoid',hides:[],params:{},draw,...extra});
  const coat=(r,ctx,x=-40,y=-40,x2=40,y2=40)=>r.gradient(ctx,x,y,x2,y2,[[0,r.colors.furLight],[.36,r.colors.fur],[.76,r.colors.furShade],[1,r.colors.furDeep]]);
  function silhouette(r,ctx,d,fill,detail){r.path(ctx,d,fill,r.colors.ink,1.9);ctx.save();ctx.clip(r.paths.get(d));detail?.();ctx.restore();}
  function eye(r,ctx,x,y,scale,p){
    const c=r.colors;ctx.save();ctx.translate(x,y);ctx.scale(scale,Math.max(.055,p.blink??1));
    r.path(ctx,'M -16 -4 Q -8 -18 5 -15 Q 17 -13 16 1 Q 10 18 -4 16 Q -15 13 -16 -4 Z','#f2e4be',c.ink,1.7);
    r.ellipse(ctx,0,0,11.7,15,r.gradient(ctx,-8,-13,7,15,[[0,'#42452c'],[.5,c.iris],[1,'#d9d69a']]),c.furDeep,1);
    r.ellipse(ctx,0,-.2,5.7,12.5,'#171a1c');r.ellipse(ctx,4,-7,4.1,4.5,'#fffef4');r.ellipse(ctx,-4,6,1.5,1.7,'#fff8d3');
    r.path(ctx,'M -17 -4 Q -8 -20 6 -16 Q 13 -15 16 -9',null,c.ink,2.7);ctx.restore();
  }
  function whiskers(r,ctx,side=false){const c=r.colors;
    ctx.save();ctx.globalAlpha=.8;
    if(side){for(const [y,dy] of [[19,-8],[24,0],[29,10]])r.path(ctx,`M 37 ${y} Q 65 ${y-2} 80 ${y+dy}`,null,c.cream,1);}
    else for(const sign of [-1,1]){ctx.save();ctx.scale(sign,1);for(const [y,dy] of [[25,-8],[30,1],[34,12]])r.path(ctx,`M 26 ${y} Q 52 ${y-2} 76 ${y+dy}`,null,c.cream,1);ctx.restore();}
    ctx.restore();
  }
  function ears(r,ctx,side=false,rear=false,p={}){
    const c=r.colors;ctx.save();ctx.rotate((p.hair||0)*.08);
    for(const sign of [-1,1]){ctx.save();if(side)ctx.translate(sign<0?-23:7,sign<0?6:0);else ctx.scale(sign,1);
      const d=side?'M -25 -35 L -29 -96 Q -28 -109 -20 -100 L 17 -40 Z':'M 21 -36 L 34 -99 Q 38 -111 45 -102 Q 65 -82 66 -29 Z';
      silhouette(r,ctx,d,coat(r,ctx),()=>{
        if(!rear)r.path(ctx,side?'M -18 -43 L -23 -94 L 8 -44 Z':'M 30 -43 L 39 -94 Q 41 -99 45 -89 L 57 -37 Z',r.gradient(ctx,30,-90,50,-40,[[0,c.earLight],[1,c.ear]]),c.furShade,1);
        for(let i=0;i<5;i++)r.path(ctx,side?`M -19 ${-88+i*8} L ${-7+i} ${-77+i*7}`:`M 47 ${-86+i*8} L ${31+i} ${-71+i*6}`,null,rear?c.stripe:c.cream,1.1);
      });ctx.restore();}
    ctx.restore();
  }
  function frontHead({r,ctx,p}){
    const c=r.colors;ears(r,ctx,false,false,p);
    const d='M -51 -30 Q -39 -64 -9 -58 L -3 -63 L 5 -57 L 13 -61 Q 43 -57 55 -29 L 61 -6 L 56 -5 L 62 11 L 56 11 L 58 26 L 48 27 Q 35 49 9 53 L 0 57 L -9 53 Q -38 50 -51 29 L -60 25 L -56 12 L -63 11 L -57 -4 L -62 -8 Z';
    silhouette(r,ctx,d,coat(r,ctx,-40,-50,45,45),()=>{
      r.path(ctx,'M -10 -58 L -18 -36 L -8 -43 L -4 -22 L 1 -42 L 7 -28 L 10 -57 Z',c.stripe,null);
      for(const sign of [-1,1]){ctx.save();ctx.scale(sign,1);
        r.path(ctx,'M 17 -56 L 16 -36 L 23 -24 L 23 -43 L 31 -50 Z M 35 -42 L 34 -29 L 51 -19 L 58 -21 L 47 -33 Z M 44 4 L 59 2 L 59 13 L 40 13 L 26 8 Z M 43 20 L 61 16 L 58 27 L 37 28 L 28 22 Z',c.stripe,null);
        r.path(ctx,'M 9 -19 Q 19 -31 36 -24 L 44 -13 Q 24 -21 13 -8 Z',c.furLight,null);
        r.path(ctx,'M 5 22 Q 25 12 40 26 Q 42 39 22 45 L 5 43 Z',c.cream,null);
        r.path(ctx,'M 9 43 L 20 40 L 17 49 L 31 44 L 26 53 L 2 58 L -2 47 Z',c.cream,null);
        for(const [x,y] of [[21,24],[29,28],[19,31]])r.ellipse(ctx,x,y,1.5,1,c.furDeep);
        r.path(ctx,'M 14 -35 L 22 -41 M 32 -35 L 37 -31 M 47 16 L 53 17 M 39 36 L 43 32',null,c.furLight,1.1);ctx.restore();}
    });
    eye(r,ctx,-25,0,.98,p);eye(r,ctx,25,0,.98,p);
    r.path(ctx,'M -8 24 Q 0 18 8 24 L 1 32 L -1 32 Z',c.ear,c.furDeep,1.2);r.path(ctx,'M -4 23 Q 0 21 4 23',null,c.earLight,1);
    r.path(ctx,'M 0 32 L 0 36 Q -8 43 -16 37 M 0 36 Q 8 43 16 37',null,c.furDeep,1.2);whiskers(r,ctx);
  }
  function sideHead({r,ctx,p}){
    const c=r.colors;ears(r,ctx,true,false,p);
    const d='M -39 -35 Q -26 -65 5 -57 Q 33 -53 38 -24 L 40 -6 L 54 8 L 65 17 L 62 25 L 54 28 Q 54 44 33 48 L 17 54 L 3 50 L -5 54 Q -30 40 -37 23 L -45 21 L -41 7 L -47 3 Z';
    silhouette(r,ctx,d,coat(r,ctx,-40,-45,48,40),()=>{
      r.path(ctx,'M -24 -56 L -21 -28 L -9 -16 L -14 -43 L -4 -56 Z M 8 -55 L 7 -34 L 19 -22 L 15 -44 L 23 -48 Z M -43 -9 L -17 -3 L 0 8 L -25 6 L -45 0 Z M -40 14 L -13 18 L 10 29 L -20 25 L -38 24 Z',c.stripe,null);
      r.path(ctx,'M 37 9 Q 51 4 61 17 L 61 29 Q 45 49 24 47 L 17 52 L -1 40 Q 16 46 25 29 Z',c.cream,null);
      for(const [x,y] of [[45,22],[49,27],[40,28]])r.ellipse(ctx,x,y,1.5,1,c.furDeep);
      r.path(ctx,'M -32 -25 L -26 -15 M -29 30 L -20 35 M -3 -42 L -1 -30',null,c.furLight,1.3);
    });eye(r,ctx,25,-2,.79,p);
    r.path(ctx,'M 55 13 L 64 17 L 60 23 L 55 20 Z',c.ear,c.furDeep,1.1);r.path(ctx,'M 60 24 Q 56 33 47 32',null,c.furDeep,1.2);whiskers(r,ctx,true);
  }
  function rearHead({r,ctx,p}){
    const c=r.colors;ears(r,ctx,false,true,p);
    silhouette(r,ctx,'M -52 -29 Q -39 -61 0 -58 Q 38 -62 54 -28 L 61 -6 L 57 -3 L 63 15 L 56 14 L 58 29 L 48 28 Q 27 57 0 56 Q -29 55 -49 31 L -60 28 L -56 15 L -63 14 L -58 -2 L -62 -7 Z',coat(r,ctx,-47,-48,49,44),()=>{
      r.path(ctx,'M -9 -59 L 9 -59 L 4 -34 L 11 -18 L 3 -5 L 9 18 L 0 43 L -8 18 L -3 -3 L -11 -20 L -5 -36 Z',c.stripe,null);
      for(const sign of [-1,1]){ctx.save();ctx.scale(sign,1);for(let i=0;i<4;i++)r.path(ctx,`M ${22+i*4} ${-54+i*24} L ${15+i*2} ${-34+i*22} L ${40+i*5} ${-23+i*22} L ${53+i*3} ${-31+i*22} L ${30+i*3} ${-36+i*23} Z`,c.stripe,null);r.path(ctx,'M 10 44 L 20 47 L 17 53 L 0 58',null,c.furLight,1.3);ctx.restore();}
    });
  }
  function tail({r,ctx,p,view}){
    const c=r.colors;ctx.save();ctx.translate(profile(view)?-15:16,-4);if(profile(view))ctx.scale(-1,1);ctx.rotate(Math.sin(r.actor.animation.clock*2.1-.5)*.075+(p.hip||0)*1.2+(p.hair||0)*.22);
    silhouette(r,ctx,'M -7 -6 Q 14 10 39 23 Q 61 32 80 48 Q 97 63 91 73 Q 84 86 66 73 Q 44 55 26 48 Q 0 38 -12 9 Z',coat(r,ctx,5,0,80,70),()=>{
      r.path(ctx,'M 3 6 Q 14 26 35 34 Q 61 44 80 65',null,c.furLight,5);
      for(let i=0;i<5;i++){const x=12+i*15,y=14+i*10;r.path(ctx,`M ${x-8} ${y+8} Q ${x+2} ${y-3} ${x+8} ${y-1} L ${x+18} ${y+7} Q ${x+6} ${y+11} ${x+4} ${y+22} Z`,c.stripe,null);}
      r.path(ctx,'M 78 44 Q 97 57 96 75 L 84 86 L 65 75 Q 78 62 78 44 Z',c.furDeep,null);
    });ctx.restore();
  }
  function body({r,ctx,view}){
    const c=r.colors,side=profile(view),rear=view==='back',w=side?23:29;
    silhouette(r,ctx,`M -13 -91 L -21 -81 L ${-w} -74 Q ${-w-4} -52 -23 -31 L -28 -13 L -22 6 Q 0 18 22 6 L 28 -13 L 23 -31 Q ${w+4} -52 ${w} -74 L 19 -83 L 12 -91 Z`,coat(r,ctx,-28,-85,30,10),()=>{
      if(!rear)r.path(ctx,side?'M 12 -86 L 24 -78 L 15 -68 L 23 -67 L 14 -53 L 22 -54 L 12 -35 L 14 -11 L 5 6 L -3 -1 L -6 -35 L 0 -63 Z':'M -13 -88 L 0 -81 L 13 -88 L 11 -76 L 21 -79 L 12 -64 L 19 -66 L 10 -53 L 16 -55 L 12 -39 L 18 -24 L 11 -1 L 5 5 L 0 0 L -5 7 L -14 -9 L -18 -24 L -11 -43 L -17 -55 L -9 -53 L -19 -66 L -12 -64 L -21 -79 L -11 -76 Z',r.gradient(ctx,-12,-79,14,6,[[0,c.cream],[.6,'#f5e6cb'],[1,'#d3b99b']]),null);
      if(rear)r.path(ctx,'M -6 -91 L 6 -91 L 10 -73 L 4 -58 L 9 -44 L 4 -27 L 8 -10 L 0 10 L -8 -10 L -4 -27 L -9 -44 L -4 -58 L -10 -73 Z',c.stripe,null);
      for(const sign of [-1,1]){ctx.save();ctx.scale(sign,1);for(let i=0;i<4;i++)r.path(ctx,`M 29 ${-75+i*23} L ${rear?9:19} ${-68+i*23} L 30 ${-62+i*23} L 34 ${-67+i*23} Z`,c.stripe,null);ctx.restore();}
    });
  }
  function furBone({r,ctx,chain},index,isLeg=false){
    const c=r.colors,a=chain[index],b=chain[index+1],len=Math.hypot(b.x-a.x,b.y-a.y),scale=(index?chain.foreScale:chain.upperScale)||1,w=(isLeg?10.5:index?8:10)*scale;
    ctx.save();ctx.translate(a.x,a.y);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2);
    silhouette(r,ctx,`M ${-w} -1 Q 0 -6 ${w} -1 Q ${w+2} ${len*.4} ${w*.75} ${len+2} Q 0 ${len+6} ${-w*.75} ${len+2} Q ${-w-2} ${len*.4} ${-w} -1 Z`,coat(r,ctx,-w,0,w,len),()=>{
      for(let i=0;i<3;i++){const y=4+i*len/3;r.path(ctx,`M ${-w-2} ${y} Q -2 ${y+2} ${w*.4} ${y+7} L -2 ${y+6} L ${-w-2} ${y+6} Z M ${w+2} ${y+9} L 0 ${y+13} L ${w+2} ${y+15} Z`,c.stripe,null);}
      r.path(ctx,`M ${-w*.5} 2 L ${-w*.6} ${len*.3} M ${w*.5} ${len*.6} L ${w*.4} ${len*.84}`,null,c.furLight,1);
    });ctx.restore();
  }
  function paw({r,ctx,view}){const c=r.colors;
    r.path(ctx,'M -7 -5 Q -11 -4 -11 3 Q -13 9 -8 13 Q -4 16 0 13 Q 4 17 8 12 Q 13 10 10 3 L 6 -5 Z',c.cream,c.ink,1.5);
    r.path(ctx,'M -5 5 L -5 11 M 2 5 L 2 12',null,'#b59a85',1);
    if(view==='back'){r.ellipse(ctx,0,4,4,4,c.ear);for(const x of [-6,0,6])r.ellipse(ctx,x,-1,2,2.6,c.ear);}
  }
  function feet({r,ctx,chain,view}){const c=r.colors,f=chain[2],side=profile(view),rear=view==='back';ctx.save();ctx.translate(f.x,f.y);ctx.scale(chain.footScale||1,chain.footScale||1);
    silhouette(r,ctx,side?'M -9 -16 L 8 -15 L 8 -5 Q 22 -4 25 4 Q 27 13 13 14 L -10 11 Q -17 7 -10 -3 Z':rear?'M -9 -17 L 9 -17 L 12 2 Q 18 12 0 13 Q -18 12 -12 2 Z':'M -9 -17 L 9 -17 L 11 -3 Q 19 4 16 11 Q 11 17 6 13 Q 0 18 -6 13 Q -14 16 -17 10 Q -20 2 -11 -3 Z',c.cream,()=>{if(!rear)for(const x of (side?[8,16]:[-7,2,10]))r.path(ctx,`M ${x} 4 Q ${x-2} 8 ${x-1} 13`,null,'#b69a80',1);r.path(ctx,'M -10 -19 L 10 -19 L 9 -10 L 2 -13 L -3 -8 L -10 -12 Z',c.fur,null);});ctx.restore();
  }
  reg('arucat_face','face','阿嚕貓・虎斑臉與大耳朵',{front:{face:frontHead},profile:{face:sideHead,ear:()=>{}}});
  reg('arucat_fur','hair','阿嚕貓・後腦虎斑毛',{back:{front:rearHead}});
  reg('arucat_body','chest','阿嚕貓・胸腹毛與尾巴',all({body,upper:a=>furBone(a,0),forearm:a=>furBone(a,1),hand:paw,cape:a=>{if(a.view!=='back')tail(a);},backAccessory:a=>{if(a.view==='back')tail(a);}}));
  reg('arucat_legs','legs','阿嚕貓・雙足虎斑腿',all({body:()=>{},limbs:a=>{furBone(a,0,true);furBone(a,1,true);}}));
  reg('arucat_paws','feet','阿嚕貓・白色貓掌',all({foot:feet}));
  Lab.characters.register('arucat',{name:'阿嚕貓',category:'npc',rigType:'humanoid',animationSet:'humanoid_basic',appearance:{id:'arucat',subtitle:'ARU · THE LITTLE TABBY',parts:{face:'arucat_face',hair:'arucat_fur'},palette:{ink:'#382c2b',fur:'#b7804c',furLight:'#e4b679',furShade:'#97603e',furDeep:'#49342b',stripe:'#4a352b',cream:'#fff2d8',ear:'#d58d7a',earLight:'#f8c7ab',iris:'#9e9b61',skin:'#b7804c',skinShade:'#97603e',skinLight:'#e4b679',hair:'#4a352b'},outfit:{cape:false},accessories:{satchel:false}},proportions:{headSize:.94,headOffset:123,headClearance:133,bodyWidth:.92,torsoLength:82,upperArm:27,forearm:25,thigh:35,shin:35,handSize:1,footSize:.96,limbWidth:1},equipment:{head:null,hairAccessory:null,chest:'arucat_body',legs:'arucat_legs',feet:'arucat_paws',mainHand:null,offHand:null},movementConfig:{walkSpeed:115,runSpeed:245}});
})(window.ChibiLab=window.ChibiLab||{});
