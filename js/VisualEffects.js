(function(Lab){
  'use strict';
  class VisualEffects{
    constructor(){this.effects=[];this.enabled=true;this.received=[];}
    handle(event){this.received.push(event);if(this.received.length>64)this.received.shift();if(!this.enabled||event.type!=='skillRelease')return;const dir={front:[0,1],back:[0,-1],left:[-1,0],right:[1,0]}[event.facing];this.effects.push({sourceId:event.sourceId,x:event.origin.x,y:event.origin.y,dx:dir[0],dy:dir[1],age:0,life:event.effectProfile==='hexRay'?.28:.9,kind:event.effectProfile});if(this.effects.length>128)this.effects.shift();}
    update(dt){this.effects.forEach(e=>{e.age+=dt;if(e.kind!=='hexRay'){e.x+=e.dx*200*dt;e.y+=e.dy*200*dt;}});this.effects=this.effects.filter(e=>e.age<e.life);}
    draw(ctx){for(const e of this.effects){ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha=Math.min(1,(e.life-e.age)*4);ctx.rotate(Math.atan2(e.dy,e.dx));if(e.kind==='hexRay'){ctx.globalAlpha=Math.sin(Math.PI*e.age/e.life)*.85;ctx.lineCap='round';ctx.shadowColor='#83f2ff';ctx.shadowBlur=14;for(const [width,color] of [[13,'#50cbd940'],[6,'#65efff99'],[2,'#f0ffff']]){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(155,0);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}ctx.restore();continue;}const g=ctx.createRadialGradient(0,0,1,0,0,18);g.addColorStop(0,'#fff5c8');g.addColorStop(.35,'#ffbc6ccc');g.addColorStop(1,'#e56c5400');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,19,14,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffdba1';ctx.beginPath();ctx.moveTo(-5,-6);ctx.quadraticCurveTo(-30,Math.sin(e.age*30)*6,-31,0);ctx.quadraticCurveTo(-15,9,-5,6);ctx.fill();ctx.restore();}}
    static charge(r,ctx,at,weight){if(!at||weight<.01)return;ctx.save();ctx.globalAlpha=weight*.7;const g=ctx.createRadialGradient(at.x,at.y,1,at.x,at.y,21);g.addColorStop(0,'#e9ffff');g.addColorStop(.25,'#98e9ef90');g.addColorStop(1,'#7dd7ee00');r.ellipse(ctx,at.x,at.y,21,21,g);ctx.restore();}
  }
  Lab.VisualEffects=VisualEffects;
})(window.ChibiLab=window.ChibiLab||{});
