(function (Lab) {
  'use strict';
  const TAU=Math.PI*2;
  class CharacterRenderer {
    constructor(appearance){this.appearance=appearance;this.colors=appearance.palette;this.paths=new Map();}
    path(ctx,d,fill,stroke=this.colors.ink,width=this.appearance.outline){
      let path=this.paths.get(d);if(!path){if(this.paths.size>=256)this.paths.clear();path=new Path2D(d);this.paths.set(d,path);}
      if(fill){ctx.fillStyle=fill;ctx.fill(path);}if(stroke&&width){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke(path);}
    }
    ellipse(ctx,x,y,rx,ry,fill,stroke=null,width=1){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
    gradient(ctx,x,y,x2,y2,stops){const g=ctx.createLinearGradient(x,y,x2,y2);stops.forEach(([t,c])=>g.addColorStop(t,c));return g;}
    star(ctx,x,y,r,fill,stroke=this.colors.ink){ctx.save();ctx.translate(x,y);ctx.rotate(.08);let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;d+=(i?'L':'M')+Math.cos(a)*rr+' '+Math.sin(a)*rr;}this.path(ctx,d+'Z',fill,stroke,.9);ctx.restore();}
    withBody(ctx,s,fn){ctx.save();ctx.translate(s.root.x,s.root.y);ctx.rotate(s.angle);ctx.scale(s.rig.bodyWidth||1,s.rig.torsoScale||1);fn();ctx.restore();}
    withHead(ctx,s,p,fn){ctx.save();ctx.translate(s.head.x,s.head.y);ctx.rotate(s.angle*.48+p.head);ctx.scale(s.rig.headSize||1,s.rig.headSize||1);fn();ctx.restore();}
    segment(ctx,start,end,width,fill){
      const dx=end.x-start.x,dy=end.y-start.y,length=Math.hypot(dx,dy);
      ctx.save();ctx.translate(start.x,start.y);ctx.rotate(Math.atan2(dy,dx)-Math.PI/2);
      this.path(ctx,`M ${-width/2} 0 Q ${-width/2-2} ${length*.45} ${-width*.42} ${length} Q 0 ${length+width*.35} ${width*.42} ${length} Q ${width/2+2} ${length*.45} ${width/2} 0 Q 0 ${-width*.35} ${-width/2} 0 Z`,fill);ctx.restore();
    }
    draw(ctx,s,p,time,facing=s.facing||'front'){
      // Tint the vector palette itself: a hurt flash never paints a rectangle
      // over the stage, and does not require a raster sprite or offscreen asset.
      const palette=this.appearance.palette,t=p.flash*.88;
      this.colors=t>0?Object.fromEntries(Object.entries(palette).map(([key,hex])=>{
        const n=parseInt(hex.slice(1),16),rgb=[n>>16,(n>>8)&255,n&255];
        return [key,'#'+rgb.map(v=>Math.round(v+(255-v)*t).toString(16).padStart(2,'0')).join('')];
      })):palette;
      this.activeRig=s;this.activeView=facing;Lab.PaperDoll.render(this,ctx,s,p,time,facing);
    }
    part(slot,channel,ctx,p,extra={}){return Lab.PaperDoll.drawPart(this,slot,channel,ctx,p,extra);}
    hidden(name){return this.actor?Lab.PaperDoll.hidden(this.actor,name):false;}
    backHair(ctx,p){this.part('hair','back',ctx,p);}
    cape(ctx,p){this.part('chest','cape',ctx,p);}
    asterBackHair(ctx,p){
      const c=this.colors,length=this.appearance.hair.length;
      ctx.save();ctx.rotate(p.hair*.75);ctx.scale(1,length);
      const bob=this.appearance.hair.style==='bob';
      const shape=bob?'M -49 -24 Q -66 -8 -60 35 L -57 68 Q -25 86 0 78 Q 30 87 60 68 L 61 14 Q 64 -36 22 -58 Q -16 -72 -49 -24 Z':'M -49 -24 C -71 -13 -58 20 -65 47 Q -67 70 -78 86 Q -63 90 -52 78 Q -57 99 -39 106 Q -27 100 -24 86 Q -12 109 5 106 Q 17 112 27 97 Q 40 111 52 94 Q 67 91 68 74 Q 63 46 64 14 C 64 -33 29 -62 -9 -60 Z';
      this.path(ctx,shape,this.gradient(ctx,-50,0,64,75,[[0,c.hairShade],[.5,c.hair],[1,c.hairShade]]));
      ctx.save();ctx.clip(this.paths.get(shape));
      this.path(ctx,'M -45 5 Q -54 54 -58 73 Q -48 61 -41 45 Q -49 85 -36 93 Q -31 72 -25 62 M 42 7 Q 58 47 52 77 Q 60 68 58 57 M 12 64 Q 22 82 18 96',null,c.hairLight,1.5);
      this.path(ctx,'M -59 45 Q -59 67 -67 78 M 42 40 Q 49 71 42 87',null,'#516c8b',2);
      ctx.restore();
      ctx.restore();
    }
    asterCape(ctx,p){
      if(!this.appearance.outfit.cape)return;
      const c=this.colors;ctx.save();ctx.translate(0,-74);ctx.rotate(p.cape);
      this.path(ctx,'M -26 -4 Q -40 3 -42 28 L -48 71 Q -24 80 -4 67 Q 21 82 43 70 L 35 23 Q 34 1 23 -6 Z',this.gradient(ctx,-39,0,40,60,[[0,c.blueLight],[.45,c.blue],[1,c.blueShade]]));
      this.path(ctx,'M -45 62 Q -20 71 -3 59 Q 20 72 41 62',null,c.gold,2);
      this.path(ctx,'M -31 14 Q -29 44 -34 60 M 29 15 Q 26 44 31 60',null,c.blueShade,1.4);
      this.path(ctx,'M -39 32 Q -34 26 -34 17',null,'#aac4d6',1.2);
      ctx.restore();
    }
    leg(ctx,chain,back){
      const c=this.colors,[hip,knee,foot]=chain;
      if(!this.hidden('legSkin')&&!this.part('legs','limbs',ctx,{}, {chain,back})){
      this.segment(ctx,hip,knee,18*(chain.upperScale||1),back?c.skinShade:c.skin);
      this.segment(ctx,knee,{x:foot.x,y:foot.y-1},16*(chain.foreScale||1),back?'#aebdce':c.whiteShade);
      }
      if(!this.part('feet','foot',ctx,{}, {chain,back})){ctx.save();ctx.translate(foot.x,foot.y);ctx.scale(chain.footScale||1,chain.footScale||1);this.ellipse(ctx,0,4,10,6,c.skin,c.ink,1.4);ctx.restore();}
    }
    asterFeet(ctx,chain,back){const c=this.colors,foot=chain[2];
      // A forward-facing vamp and toe, fixed to facing rather than shin angle.
      ctx.save();ctx.translate(foot.x,foot.y);ctx.scale(chain.footScale||1,chain.footScale||1);
      this.path(ctx,'M -9 -21 Q 0 -24 9 -21 L 9 -6 Q 15 -1 15 7 Q 16 13 0 14 Q -16 13 -15 7 Q -15 -1 -9 -6 Z',this.gradient(ctx,-14,-20,14,14,[[0,c.leatherShade],[.5,'#475873'],[1,c.leatherShade]]));
      this.path(ctx,'M -15 7 Q 0 12 15 7 L 15 11 Q 0 17 -15 11 Z',c.sole,c.ink,1.4);
      this.path(ctx,'M -9 -21 Q 0 -18 9 -21 L 9 -15 Q 0 -12 -10 -15 Z',c.blueShade,c.ink,1.3);
      this.path(ctx,'M -5 -10 L 5 -10 M -5 -5 L 5 -5',null,c.gold,1.3);
      this.path(ctx,'M -8 5 Q 0 2 8 5 M -9 -9 L -10 0',null,'#8596ac',1.4);
      ctx.restore();
    }
    arm(ctx,chain,back,p,skeleton,part='all'){
      const c=this.colors,[shoulder,elbow,wrist]=chain;
      // Both sleeve and forearm share their real elbow, hiding seams under the cuff.
      if(part!=='fore'&&!this.part('chest','upper',ctx,p,{chain,back}))this.segment(ctx,shoulder,elbow,17*(chain.upperScale||1),c.skin);
      if(part!=='upper'&&!this.part('chest','forearm',ctx,p,{chain,back}))this.segment(ctx,elbow,wrist,13*(chain.foreScale||1),back?c.skinShade:this.gradient(ctx,elbow.x-6,0,elbow.x+7,0,[[0,c.skinShade],[.5,c.skinLight],[1,c.skin]]));
      if(part!=='fore')this.part('chest','cuff',ctx,p,{chain,back});
      if(part==='upper')return;
      if(chain.held)Lab.EquipmentSystem.drawHeld(this,ctx,chain,skeleton,p);else if(chain.weapon){Lab.SwordSystem.drawTrail(this,ctx,skeleton,p);Lab.SwordSystem.draw(this,ctx,chain.weapon);}
      ctx.save();ctx.translate(wrist.x,wrist.y);ctx.rotate(Math.atan2(wrist.y-elbow.y,wrist.x-elbow.x)-Math.PI/2);
      ctx.scale(chain.handScale||1,chain.handScale||1);
      this.part('chest','wrist',ctx,p,{chain,back});
      if(chain.weapon){const foreAngle=Math.atan2(wrist.y-elbow.y,wrist.x-elbow.x)-Math.PI/2;ctx.translate(0,3.5);ctx.rotate(chain.weapon.angle-foreAngle);ctx.translate(0,-3.5);}
      if(!this.part('chest','hand',ctx,p,{chain,back})){
        this.path(ctx,'M -7 0 Q -10 4 -6 8 Q -1 13 5 9 Q 10 7 8 2 Q 7 -3 3 -3 Q -1 -5 -3 -2 Q -7 -3 -7 0 Z',back?c.skin:this.gradient(ctx,-7,-3,8,9,[[0,c.skinLight],[1,c.skinShade]]),c.ink,1.6);
        this.path(ctx,'M 4 0 Q -1 1 -2 5 M 2 7 L 4 6',null,'#c98e88',.8);
      }
      ctx.restore();
    }
    asterUpper(ctx,chain,back){const c=this.colors,[shoulder,elbow]=chain;this.segment(ctx,shoulder,elbow,21*(chain.upperScale||1),back?c.whiteShade:this.gradient(ctx,shoulder.x-12,0,shoulder.x+12,0,[[0,c.whiteShade],[.55,c.white],[1,'#e0e9e7']]));}
    asterCuff(ctx,chain,back){const c=this.colors,[shoulder,elbow]=chain;
      const a=Math.atan2(elbow.y-shoulder.y,elbow.x-shoulder.x)-Math.PI/2;
      ctx.save();ctx.translate(elbow.x,elbow.y);ctx.rotate(a);
      ctx.scale(chain.upperScale||1,chain.upperScale||1);
      this.path(ctx,'M -11 -7 Q 0 -3 11 -7 L 10 1 Q 0 5 -10 1 Z',c.blue,c.ink,1.5);
      this.path(ctx,'M -9 -3 Q 0 0 9 -3',null,c.gold,1.1);ctx.restore();
    }
    body(ctx,p){if(!this.part('legs','body',ctx,p))this.basePelvis(ctx,p);this.baseNeck(ctx,p);if(!this.part('chest','body',ctx,p))this.baseTorso(ctx,p);this.asterPouch(ctx,p);}
    baseTorso(ctx,p){const side=this.activeView==='left'||this.activeView==='right',w=side?17:24;this.path(ctx,`M ${-w} -72 Q 0 -80 ${w} -72 L ${w-2} -20 Q 0 -13 ${-w+2} -20 Z`,this.gradient(ctx,-w,-65,w,-20,[[0,this.colors.whiteShade],[.5,this.colors.white],[1,this.colors.whiteShade]]));}
    basePelvis(ctx,p){const side=this.activeView==='left'||this.activeView==='right',w=side?17:24;this.path(ctx,`M ${-w} -25 L ${w} -25 L ${w} 6 Q 0 14 ${-w} 6 Z`,this.colors.leather,this.colors.ink,1.6);}
    bareFeet(ctx,chain){ctx.save();ctx.translate(chain[2].x,chain[2].y);ctx.scale(chain.footScale||1,chain.footScale||1);const side=this.activeView==='left'||this.activeView==='right';this.ellipse(ctx,side?5:0,4,side?12:10,6,this.colors.skin,this.colors.ink,1.4);ctx.restore();}
    asterSkirt(ctx,p){const c=this.colors;
      // Skirt panels remain anchored at the belt; only the hem follows gait.
      ctx.save();ctx.translate(0,-17);ctx.rotate(p.skirt);
      this.path(ctx,'M -24 -8 Q 0 -14 24 -8 L 36 29 Q 17 38 -1 32 Q -22 38 -36 28 Z',this.gradient(ctx,-35,0,36,20,[[0,c.blueShade],[.35,c.blue],[.7,c.blueLight],[1,c.blueShade]]));
      this.path(ctx,'M -27 1 L -32 26 M -12 1 L -15 30 M 7 0 L 10 29 M 24 0 L 29 26',null,c.blueShade,1.5);
      this.path(ctx,'M -34 24 Q -17 34 0 28 Q 19 34 34 24 L 36 29 Q 19 40 0 34 Q -19 40 -36 29 Z',c.white,c.ink,1.4);
      this.path(ctx,'M -31 24 Q -17 30 -3 27 M 4 28 Q 18 31 30 24',null,c.gold,1);
      ctx.restore();
    }
    baseNeck(ctx,p){const c=this.colors;
      this.path(ctx,'M -13 -88 L -11 -73 Q 1 -63 12 -74 L 12 -88 Z',c.skin,c.ink,1.7);
      this.path(ctx,'M -10 -84 Q 0 -78 11 -85 L 10 -77 Q 1 -72 -10 -78 Z',c.skinShade,null);
    }
    asterChest(ctx,p){const c=this.colors;
      this.path(ctx,'M -24 -74 Q -33 -65 -28 -45 L -23 -21 Q -1 -11 24 -22 L 29 -48 Q 34 -67 23 -75 L 10 -78 Q 0 -69 -11 -78 Z',this.gradient(ctx,-26,-70,28,-18,[[0,c.whiteShade],[.45,c.white],[1,'#dbe6e5']]));
      this.path(ctx,'M -20 -70 L -8 -63 L -12 -24 L -23 -25 L -27 -51 Z',c.blue,c.ink,1.3);
      this.path(ctx,'M 21 -70 L 8 -63 L 12 -24 L 24 -25 L 28 -52 Z',this.gradient(ctx,9,0,27,0,[[0,c.blueLight],[1,c.blueShade]]),c.ink,1.3);
      this.path(ctx,'M -16 -67 L -13 -27 M 17 -67 L 14 -27',null,c.gold,1.1);
      this.path(ctx,'M -1 -60 L -1 -25',null,'#b8cdd3',1);
      for(const y of [-46,-35])this.ellipse(ctx,1,y,1.7,1.7,c.gold,c.ink,.6);
      // Short, lined shoulder mantle, independently of the rear cape.
      this.path(ctx,'M -10 -82 Q -26 -82 -35 -69 L -39 -57 Q -25 -51 -14 -58 L 0 -68 L 15 -57 Q 28 -51 38 -58 Q 35 -75 12 -82 L 2 -72 Z',this.gradient(ctx,-32,-81,31,-50,[[0,c.white],[.55,'#f2f4ee'],[1,c.whiteShade]]));
      this.path(ctx,'M -35 -61 Q -25 -56 -15 -62 L -2 -73 M 4 -73 L 16 -62 Q 26 -56 34 -61',null,c.gold,1.4);
      this.path(ctx,'M -12 -83 L -2 -73 L -9 -61 L -20 -77 Z',c.white,c.ink,1.5);
      this.path(ctx,'M 12 -83 L 2 -73 L 9 -61 L 21 -77 Z',c.white,c.ink,1.5);
      this.path(ctx,'M -4 -66 Q -15 -71 -18 -62 Q -17 -56 -6 -59 L -11 -42 L 0 -49 L 9 -43 L 6 -60 Q 18 -56 19 -63 Q 15 -71 4 -66 Z',c.blueShade,c.ink,1.3);
      if(this.appearance.outfit.emblem==='compass'){this.ellipse(ctx,1,-65,7,7,c.gold,c.ink,1);this.path(ctx,'M 1 -71 L 4 -65 L 1 -59 L -2 -65 Z',c.white,c.ink,.7);}else this.star(ctx,1,-65,8,c.gold);
      this.ellipse(ctx,1,-65,3.3,4.4,c.gem,c.ink,.8);this.ellipse(ctx,0,-67,1,1.6,'#fff',null);
      // Belt is a separate curved layer, with metal buckle and a stitched pouch.
      this.path(ctx,'M -25 -28 Q 0 -20 25 -28 L 25 -17 Q 0 -10 -25 -17 Z',c.leather,c.ink,1.7);
      this.path(ctx,'M -23 -23 Q -5 -19 22 -23',null,'#8090a3',.8);
      this.path(ctx,'M -5 -26 L 7 -26 L 7 -14 L -5 -14 Z',c.gold,c.ink,1.2);
      this.path(ctx,'M -2 -23 L 4 -23 L 4 -17 L -2 -17 Z',c.leather,c.ink,.5);
    }
    asterPouch(ctx,p){const c=this.colors;
      if(this.appearance.accessories.satchel){
        this.path(ctx,'M 18 -21 L 31 -22 L 34 -3 Q 28 5 17 -1 Z','#947d68',c.ink,1.5);
        this.path(ctx,'M 18 -21 L 31 -22 L 33 -13 L 24 -8 L 17 -12 Z','#b69b77',c.ink,1.3);
        this.ellipse(ctx,25,-12,1.5,1.5,c.gold,c.ink,.6);
      }
    }
    head(ctx,p){this.part('face','face',ctx,p);this.part('hair','front',ctx,p);this.part('hairAccessory','head',ctx,p);this.part('head','head',ctx,p);const c=this.colors;
      if(p.flash>0){ctx.save();ctx.globalAlpha=p.flash*.7;this.path(ctx,'M -39 -28 Q -6 -49 33 -28 Q 48 2 34 33 Q 2 58 -30 33 Q -46 6 -39 -28 Z','#fff',null);ctx.restore();}
    }
    asterFace(ctx,p){const c=this.colors;
      // Ears lie behind the cheek silhouette and in front of the rear hair.
      this.ellipse(ctx,-50,10,9,13,c.skin,c.ink,1.7);this.ellipse(ctx,50,10,8,12,c.skinShade,c.ink,1.7);
      this.path(ctx,'M -51 4 Q -58 8 -51 15 M 51 5 Q 57 9 51 14',null,'#c98e88',1.3);
      const face=this.gradient(ctx,-30,-35,32,54,[[0,c.skinLight],[.6,c.skin],[1,c.skinShade]]);
      this.path(ctx,'M -49 -24 Q -41 -53 0 -49 Q 43 -49 50 -22 L 49 15 Q 48 39 23 50 Q 3 62 -18 52 Q -44 43 -49 21 Z',face);
      this.path(ctx,'M -46 -15 Q -44 23 -31 34 Q -4 56 25 43 Q 12 57 -6 55 Q -40 48 -47 25 Z','#f4c7b2',null);
      // Soft cheek flush uses a radial gradient instead of a bitmap.
      for(const x of [-32,34]){const blush=ctx.createRadialGradient(x,27,1,x,27,15);blush.addColorStop(0,'#ec8e995c');blush.addColorStop(1,'#ec8e9900');this.ellipse(ctx,x,27,15,8,blush);}
      this.path(ctx,'M -36 -9 Q -25 -16 -13 -10 M 14 -10 Q 27 -17 38 -9',null,c.hairShade,2.1);
      this.eye(ctx,-24,9,1,p);this.eye(ctx,25,8,.96,p);
      // Small reflected nose, a curved smile and a lower-lip highlight.
      this.path(ctx,'M 4 22 Q 9 28 4 29',null,'#cd9690',1.1);
      this.path(ctx,'M -3 38 Q 4 43 12 36',null,'#9e626d',1.5);
      this.path(ctx,'M 3 46 Q 6 47 9 45',null,'#fff0df',1.3);
      if(p.hurt>.2){this.path(ctx,'M -34 6 L -17 13 L -32 17 M 34 5 L 18 12 L 33 16',null,c.ink,2.5);}
    }
    asterAccessory(ctx,p){const c=this.colors;
      if(this.appearance.accessories.hairStar){ctx.save();ctx.translate(-46,-20);ctx.rotate(-.35);this.path(ctx,'M -8 0 L 10 0',null,c.goldLight,3);this.star(ctx,0,0,7,c.gold);this.ellipse(ctx,0,-1,1.2,1.3,c.goldLight);ctx.restore();this.ellipse(ctx,-51,28,2,3,c.gold,c.ink,.7);}
    }
    eye(ctx,x,y,scale,p){
      const c=this.colors;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale*Math.max(.035,p.blink));
      const d='M -16 -5 Q -11 -17 0 -16 Q 13 -16 16 -3 Q 17 10 7 15 Q -5 20 -14 9 Z';
      this.path(ctx,d,'#fffcf5',c.ink,1.3);
      ctx.save();ctx.clip(this.paths.get(d));
      const iris=this.gradient(ctx,0,-14,0,16,[[0,c.irisDeep],[.43,c.iris],[.78,c.irisLight],[1,'#d4fcdf']]);
      this.ellipse(ctx,3,1,10.8,15.5,iris,c.irisDeep,1.1);
      this.ellipse(ctx,3,-2,5.1,10.5,'#1b3055');
      this.path(ctx,'M -4 9 Q 2 15 10 7',null,'#c3f7e7',1.8);
      this.ellipse(ctx,-2,-7,4.5,5.2,'#fff');this.ellipse(ctx,8,5,2.6,2.6,'#fff9e6');this.ellipse(ctx,0,9,1.2,1.6,'#e7ffff');
      this.path(ctx,'M -20 -15 L 20 -15 L 20 -6 Q 0 -11 -20 -5 Z','#28365540',null);ctx.restore();
      this.path(ctx,'M -18 -7 Q -11 -19 1 -17 Q 12 -17 17 -5',null,c.hairShade,3.3);
      this.path(ctx,'M -17 -7 L -21 -10 M -14 -12 L -18 -17',null,c.hairShade,2.1);
      this.path(ctx,'M -10 14 Q -2 20 8 15',null,'#bb8f8e',1);
      ctx.restore();
    }
    frontHair(ctx,p){
      const c=this.colors,fringe=this.appearance.hair.fringe;
      const hair=this.gradient(ctx,-41,-66,40,29,[[0,c.hairLight],[.35,c.hair],[1,c.hairShade]]);
      this.path(ctx,'M -54 12 Q -65 -9 -56 -35 Q -53 -59 -29 -67 Q -7 -78 19 -68 Q 45 -67 56 -41 Q 65 -22 54 11 L 43 0 Q 34 -28 14 -36 Q -5 -39 -24 -25 Q -45 -12 -54 12 Z',hair);
      // Scalp highlight sweeps are broad low-contrast shapes, then a fine rim light.
      this.path(ctx,'M -46 -38 Q -29 -65 -2 -64 Q 27 -62 41 -44 Q 15 -59 -9 -54 Q -31 -52 -46 -38 Z','#5c7fa057',null);
      this.path(ctx,'M -49 -31 Q -39 -51 -22 -56 M -15 -59 Q 5 -63 23 -55',null,c.hairGlint,1.6);
      ctx.save();ctx.rotate(p.hair*.28);ctx.scale(1,fringe);
      this.path(ctx,'M -37 -49 Q -52 -23 -48 4 Q -55 31 -47 61 Q -44 70 -34 73 Q -43 48 -34 24 Q -28 5 -27 -10 Q -21 -32 -11 -43 Z',this.gradient(ctx,-49,-25,-27,54,[[0,c.hairLight],[.5,c.hair],[1,c.hairShade]]));
      this.path(ctx,'M 34 -44 Q 56 -22 51 3 Q 46 30 56 57 Q 51 72 41 76 Q 46 55 36 34 Q 29 13 35 -5 L 20 -35 Z',hair);
      this.path(ctx,'M -26 -57 Q -41 -42 -39 -14 Q -30 -17 -20 -31 Q -22 -14 -31 -3 Q -13 -4 -3 -23 Q -3 -7 -10 0 Q 6 -2 17 -27 Q 23 -14 36 -7 Q 38 -26 24 -46 Q 12 -63 -7 -61 Z',this.gradient(ctx,-27,-59,24,0,[[0,c.hairLight],[.6,c.hair],[1,c.hairShade]]));
      this.path(ctx,'M -19 -48 Q -22 -30 -27 -22 M -7 -52 Q -4 -32 -12 -17 M 5 -51 Q 18 -36 20 -22 M -43 5 Q -43 41 -39 50 M 44 7 Q 39 27 47 48',null,c.hairLight,2);
      this.path(ctx,'M -30 -39 L -33 -31 M -12 -39 L -14 -30 M 4 -41 L 8 -32 M -46 17 L -46 30 M 44 27 L 45 34',null,'#8aa6c080',1.3);
      ctx.restore();
      // Small crown flyaway makes the silhouette distinctive at thumbnail size.
      this.path(ctx,'M -5 -69 Q -13 -85 2 -85 Q -5 -80 6 -69',c.hair,c.ink,1.7);
    }
    depthSwoosh(ctx,s,p){
      const hand=s.rightArm[2];ctx.save();ctx.globalAlpha=p.attack*.65;
      ctx.strokeStyle=this.colors.gem;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(hand.x,hand.y,14*(s.rightArm.handScale||1),5,0,Math.PI*.1,Math.PI*1.3);ctx.stroke();ctx.restore();
    }
    swoosh(ctx,s,p){
      const hand=s.rightArm[2];ctx.save();ctx.globalAlpha=Math.min(.8,(p.attack-.25)*1.2);
      const glow=ctx.createLinearGradient(hand.x-28,hand.y,hand.x+30,hand.y);glow.addColorStop(0,'#e4faff00');glow.addColorStop(.7,'#d9ffff');glow.addColorStop(1,'#7dbbc700');
      this.path(ctx,`M ${hand.x-34} ${hand.y-21} Q ${hand.x+35} ${hand.y-30} ${hand.x+23} ${hand.y+18} Q ${hand.x+30} ${hand.y-16} ${hand.x-34} ${hand.y-21} Z`,glow,null);
      this.path(ctx,`M ${hand.x-37} ${hand.y-12} Q ${hand.x-9} ${hand.y-19} ${hand.x+12} ${hand.y-13}`,null,'#fff7d5',1.6);ctx.restore();
    }
  }
  Lab.CharacterRenderer=CharacterRenderer;
})(window.ChibiLab = window.ChibiLab || {});
