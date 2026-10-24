(function(Lab){
  'use strict';
  class CanvasEngine{
    constructor(canvas,scene){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');if(!this.ctx)throw Error('Canvas 2D unavailable');
      this.scene=scene instanceof Lab.CharacterScene?scene:new Lab.CharacterScene();if(!this.scene.selected)this.scene.add(Lab.CharacterFactory.create('aster'));
      this.speed=1;this.zoom=1;this.showAll=true;this.paused=false;this.showSkeleton=false;this.lastTime=null;this.fps=60;this.statsTime=0;this.frames=0;this.width=0;this.height=0;this.viewScale=1;this.running=false;
      this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.onWindowResize=()=>this.resize();window.addEventListener('resize',this.onWindowResize);
      this.onVisibility=()=>{this.lastTime=null;if(document.hidden)this.scene.characters.forEach(a=>a.movement.clear());};document.addEventListener('visibilitychange',this.onVisibility);
      this.onBlur=()=>this.scene.characters.forEach(a=>a.movement.clear());window.addEventListener('blur',this.onBlur);this.resize();
    }
    get actor(){return this.scene.selected;}get appearance(){return this.actor.appearance;}get animation(){return this.actor.animation;}set animation(a){this.actor.animation=a;}
    get skeleton(){return this.actor.rig;}get renderer(){return this.actor.renderer;}get character(){return this.actor.state;}get movement(){return this.actor.movement;}
    resize(){const box=this.canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,this.mobileLayout?2:3);this.width=box.width;this.height=box.height;this.dpr=dpr;this.canvas.width=Math.round(box.width*dpr);this.canvas.height=Math.round(box.height*dpr);this.draw();}
    start(){if(this.running)return;this.running=true;this.lastTime=null;this.frameId=requestAnimationFrame(t=>this.frame(t));}
    stop(){this.running=false;cancelAnimationFrame(this.frameId);}
    destroy(){this.stop();this.scene.destroy();this.resizeObserver.disconnect();window.removeEventListener('resize',this.onWindowResize);window.removeEventListener('blur',this.onBlur);document.removeEventListener('visibilitychange',this.onVisibility);}
    frame(now){if(!this.running)return;const dt=this.lastTime===null?0:Math.min(.05,Math.max(0,(now-this.lastTime)/1000));this.lastTime=now;if(!this.paused)this.update(dt);else this.scene.characters.forEach(a=>{a.state.velocity.x=0;a.state.velocity.y=0;});this.draw();this.frames++;this.statsTime+=dt;if(this.statsTime>=.5){this.fps=Math.round(this.frames/this.statsTime);this.frames=0;this.statsTime=0;}if(this.onFrame)this.onFrame(this);this.frameId=requestAnimationFrame(t=>this.frame(t));}
    update(dt){this.scene.update(dt,{playback:this.speed,boundsFor:a=>{const v=a.movement.vector();return a===this.actor&&(v.x||v.y)?this.boundsFor(a):this.scene.bounds;}});}
    step(){if(!this.paused)return;this.update(1/60);this.draw();if(this.onFrame)this.onFrame(this);}
    setState(state){if(['idle','walk','run'].includes(state)){this.movement.gait=state==='run'?'run':'walk';this.animation.setLocomotion(state);return true;}const v=this.movement.vector();this.animation.setLocomotion(v.x||v.y?(this.movement.running?'run':'walk'):'idle');return this.actor.action(state);}
    select(id){this.scene.select(id);if(!this.showAll)Object.assign(this.scene.camera,this.actor.position);this.draw();return this.actor;}
    getLayout(){
      const w=this.width,h=this.height,actors=this.showAll?this.scene.characters:[this.actor],height=Math.max(...actors.map(a=>{const b=a.rig.getBounds();return b.maxY-b.minY;}));
      if(this.mobileLayout){const top=this.width>this.height?54:74,bottom=this.width>this.height?135:205,available=Math.max(80,h-top-bottom),minY=Math.min(...actors.map(a=>a.rig.getBounds().minY)),spread=this.showAll?Math.max(1000,this.scene.characters.length*240):Math.max(330,2*Math.max(...actors.map(a=>a.rig.getBounds().maxX))+24),scale=Math.max(.08,Math.min(available/height,(w-32)/spread,this.width>this.height?1.4:.72)*this.zoom),home={x:w/2,y:top+(available-height*scale)/2-minY*scale};return{scale,home,bounds:this.boundsFor(this.actor,{scale,home})};}
      const spread=this.showAll?Math.max(1000,this.scene.characters.length*240):Math.max(420,2*Math.max(...actors.map(a=>a.rig.getBounds().maxX))*1.5);
      const base=Math.min((h-235)/(height*1.5),(w-70)/spread,1.4),scale=Math.max(.08,base*this.zoom);
      const home={x:w/2,y:54+(h-173)/2+height*scale*.40};return{scale,home,bounds:this.boundsFor(this.actor,{scale,home})};
    }
    boundsFor(actor,layout){const {scale,home}=layout||this.getLayout(),b=actor.rig.getBounds(),camera=this.scene.camera,world=this.scene.bounds;
      const bounds={minX:Math.max(world.minX,(20-home.x)/scale+camera.x-b.minX),maxX:Math.min(world.maxX,(this.width-20-home.x)/scale+camera.x-b.maxX),minY:Math.max(world.minY,((this.mobileLayout&&this.width<=this.height?74:54)-home.y)/scale+camera.y-b.minY),maxY:Math.min(world.maxY,(this.height-(this.mobileLayout?(this.width>this.height?135:205):119)-home.y)/scale+camera.y-b.maxY)};
      if(bounds.minX>bounds.maxX)bounds.minX=bounds.maxX=camera.x;if(bounds.minY>bounds.maxY)bounds.minY=bounds.maxY=camera.y;return bounds;
    }
    resetPosition(){Object.assign(this.character.position,{x:0,y:0});this.movement.clear();this.movement.wasMoving=false;this.animation.setLocomotion('idle');if(!this.showAll)Object.assign(this.scene.camera,this.actor.position);this.draw();}
    draw(){const ctx=this.ctx,w=this.width,h=this.height;if(!w||!h)return;ctx.setTransform(this.dpr,0,0,this.dpr,0,0);ctx.clearRect(0,0,w,h);
      const {scale,home}=this.getLayout(),camera=this.scene.camera;this.viewScale=scale;this.drawStage(ctx,w,h,home.x,home.y,scale);
      const actors=this.showAll?this.scene.characters:[this.actor];
      for(const a of actors)this.drawShadow(ctx,home.x+(a.position.x-camera.x)*scale,home.y+(a.position.y-camera.y)*scale,a.rigType==='blob'?scale*.7:scale);
      ctx.save();ctx.translate(home.x,home.y);ctx.scale(scale,scale);ctx.translate(-camera.x,-camera.y);this.scene.render(ctx,{all:this.showAll,skeleton:this.showSkeleton});ctx.restore();
    }
    drawShadow(ctx,x,y,scale){ctx.save();ctx.translate(x,y+3*scale);ctx.scale(scale,scale*.22);const g=ctx.createRadialGradient(0,0,1,0,0,48);g.addColorStop(0,'#53788d55');g.addColorStop(1,'#53788d00');ctx.fillStyle=g;ctx.fillRect(-50,-50,100,100);ctx.restore();}
    drawStage(ctx,w,h,x,y,scale){
      const line='#c6d9dc';ctx.save();
      const halo=ctx.createRadialGradient(x,y-180*scale,20,x,y-160*scale,210*scale);halo.addColorStop(0,'#ffffff88');halo.addColorStop(1,'#ffffff00');ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='#d4e1e2';ctx.lineWidth=1;
      ctx.beginPath();ctx.ellipse(x,y-145*scale,Math.min(w*.35,174*scale),Math.min(w*.35,174*scale),0,Math.PI*.12,Math.PI*1.86);ctx.stroke();
      ctx.setLineDash([2,7]);ctx.beginPath();ctx.ellipse(x,y-145*scale,Math.min(w*.37,185*scale),Math.min(w*.37,185*scale),0,Math.PI*.22,Math.PI*1.4);ctx.stroke();ctx.setLineDash([]);
      ctx.beginPath();ctx.ellipse(x,y+7*scale,108*scale,24*scale,0,0,Math.PI*2);ctx.fillStyle='#dce7e8';ctx.fill();ctx.strokeStyle=line;ctx.stroke();
      ctx.beginPath();ctx.ellipse(x,y+5*scale,95*scale,17*scale,0,0,Math.PI*2);ctx.strokeStyle='#edf4f3';ctx.stroke();
      // Registration marks, drawn rather than loaded assets.
      ctx.strokeStyle='#a9c4ca';ctx.lineWidth=1;for(const [xx,yy] of [[x-108*scale,y-224*scale],[x+108*scale,y-104*scale]]){ctx.beginPath();ctx.moveTo(xx-4,yy);ctx.lineTo(xx+4,yy);ctx.moveTo(xx,yy-4);ctx.lineTo(xx,yy+4);ctx.stroke();}
      ctx.fillStyle='#8caab1';ctx.font='8px "Segoe UI",sans-serif';ctx.textAlign='center';ctx.letterSpacing='1px';ctx.fillText('N',x,y+44*scale);ctx.letterSpacing='0px';ctx.restore();
    }
  }
  Lab.CanvasEngine=CanvasEngine;
})(window.ChibiLab=window.ChibiLab||{});
