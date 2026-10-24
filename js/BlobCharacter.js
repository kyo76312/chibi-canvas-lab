(function(Lab){
  'use strict';
  class BlobAnimation{
    constructor(){this.clock=0;this.phase=0;this.locomotionState='idle';this.actionState='none';this.locomotionTime=0;this.actionTime=0;this.duration={bumpAttack:.82,hurt:.65,cast:1.05};this.actionEvents={cast:{time:.56,type:'skillRelease'}};this.pose={sx:1,sy:1,bob:0,bump:0,blink:1,flash:0,castGlow:0};}
    get releaseTime(){return this.actionEvents.cast.time;}
    get state(){return this.actionState==='none'?this.locomotionState:this.actionState;}get time(){return this.actionState==='none'?this.locomotionTime:this.actionTime;}
    setLocomotion(v){if(!['idle','walk','run'].includes(v))return false;if(v!==this.locomotionState)this.locomotionTime=0;this.locomotionState=v;return true;}
    setState(v){return this.duration[v]?this.requestAction(v):this.setLocomotion(v);}
    requestAction(v){if(!this.duration[v]||this.actionState===v||this.actionState==='hurt'&&v!=='hurt')return false;this.actionState=v;this.actionTime=0;return true;}
    update(dt){if(!Number.isFinite(dt)||dt<0)return this.pose;this.clock+=dt;this.locomotionTime+=dt;this.phase+=dt*(this.locomotionState==='run'?10:6);if(this.actionState!=='none')this.actionTime+=dt;
      const t=this.actionTime,smooth=Lab.math.smooth,p={sx:1,sy:1,bob:0,bump:0,blink:Math.sin(this.clock*1.7)> .992?.12:1,flash:0,castGlow:0};
      const moving=this.locomotionState!=='idle',wave=Math.sin(this.phase);p.sx=1+.035*Math.sin(this.clock*2);p.sy=1-.025*Math.sin(this.clock*2);
      if(moving){const up=Math.max(0,wave);p.bob=-up*(this.locomotionState==='run'?16:10);p.sx=1-.08*up+.04*Math.max(0,-wave);p.sy=1+.13*up-.07*Math.max(0,-wave);}
      if(this.actionState==='bumpAttack'){const wind=smooth(t/.23)*(1-smooth((t-.24)/.14)),dash=smooth((t-.23)/.13)*(1-smooth((t-.47)/.35));p.sx+=.23*wind-.08*dash;p.sy-=.25*wind;p.sy+=.06*dash;p.bump=38*dash;p.bob-=5*dash;}
      if(this.actionState==='hurt'){const w=smooth(t/.08)*(1-smooth((t-.14)/.51));p.sx+=.22*w;p.sy-=.22*w;p.flash=Math.max(0,Math.sin(t*50))*w;}
      if(this.actionState==='cast'){p.castGlow=smooth(t/.25)*(1-smooth((t-.64)/.41));p.sy+=p.castGlow*.10;}
      this.pose=p;if(this.duration[this.actionState]&&t>=this.duration[this.actionState]){this.actionState='none';this.actionTime=0;}return p;
    }
  }
  class BlobRig{
    constructor(config={}){this.config={width:48,height:63,...config};this.attachments={};this.joints={};}
    solve(p,facing='front'){this.facing=facing;const dirs={front:[0,1],back:[0,-1],left:[-1,0],right:[1,0]},d=dirs[facing];this.root={x:d[0]*p.bump,y:d[1]*p.bump*.35+p.bob};this.pose=p;this.attachments={head:{x:this.root.x,y:this.root.y-this.config.height*.65},castOrigin:{x:this.root.x,y:this.root.y-this.config.height*.5}};this.joints={root:this.root,crown:this.attachments.head};return this;}
    getBounds(){return{minX:-95,maxX:95,minY:-110,maxY:25};}
    draw(ctx){ctx.save();ctx.strokeStyle='#dc8655';ctx.fillStyle='#fff7d9';for(const p of Object.values(this.joints)){ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();ctx.stroke();}ctx.restore();}
  }
  class BlobRenderer extends Lab.CharacterRenderer{
    draw(ctx,s,p,time,facing){const c=this.appearance.palette,w=s.config.width,h=s.config.height;this.colors=c;ctx.save();ctx.translate(s.root.x,s.root.y);ctx.scale(p.sx*w/48,p.sy*h/63);
      const tint=p.flash>.2?'#efffff':c.blueLight;
      this.path(ctx,'M -46 -10 C -51 -26 -32 -39 -27 -48 Q -22 -68 0 -65 Q 25 -67 30 -43 C 33 -28 52 -22 46 -9 Q 43 4 29 1 Q 18 8 7 2 Q -5 8 -17 1 Q -36 7 -46 -10 Z',this.gradient(ctx,-30,-60,35,3,[[0,tint],[.4,c.gem],[1,c.blueShade]]),c.ink,2.1);
      this.path(ctx,'M -35 -22 Q -22 -52 -8 -54 Q -23 -47 -27 -28 Z','#edffff88',null);this.ellipse(ctx,-9,-55,7,3,'#ffffffa0');this.ellipse(ctx,28,-19,6,3,'#62a5c760');
      if(facing!=='back'){const shift=facing==='left'?-13:facing==='right'?13:0;const eyes=facing==='front'?[-14,14]:[shift+4];for(const x of eyes){ctx.save();ctx.translate(x,-25);ctx.scale(1,p.blink);this.ellipse(ctx,0,0,5,8,c.ink);this.ellipse(ctx,-1,-3,1.5,2,'#fff');ctx.restore();}this.path(ctx,`M ${shift-5} -13 Q ${shift} -8 ${shift+5} -13`,null,c.ink,1.8);this.ellipse(ctx,shift-22,-15,6,2.5,'#e4b5c46a');}
      this.star(ctx,18,-43,4,c.goldLight);ctx.restore();
    }
  }
  Object.assign(Lab,{BlobAnimation,BlobRig,BlobRenderer});
})(window.ChibiLab=window.ChibiLab||{});
