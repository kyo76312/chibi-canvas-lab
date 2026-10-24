(function(Lab){
  'use strict';
  const point=(x,y)=>({x,y});
  function ik(start,target,a,b,bend){
    let dx=target.x-start.x,dy=target.y-start.y,d=Math.hypot(dx,dy);
    if(d<.00001){dx=0;dy=1;d=1;}
    const softLimit=a+b-6;
    const softDistance=d>softLimit?softLimit+6*(1-Math.exp(-(d-softLimit)/6)):d;
    const reach=Lab.math.clamp(softDistance,Math.abs(a-b)+.001,a+b-.001),ux=dx/d,uy=dy/d;
    const along=(a*a-b*b+reach*reach)/(2*reach),height=Math.sqrt(Math.max(0,a*a-along*along));
    return [start,point(start.x+ux*along-uy*height*bend,start.y+uy*along+ux*height*bend),point(start.x+ux*reach,start.y+uy*reach)];
  }
  function fk(start,angle,bend,a,b){const elbow=point(start.x+Math.sin(angle)*a,start.y+Math.cos(angle)*a);return[start,elbow,point(elbow.x+Math.sin(angle+bend)*b,elbow.y+Math.cos(angle+bend)*b)];}
  class Skeleton{
    constructor(rig){this.rig={pelvisHeight:86,headOffset:135,neckOffset:87,shoulderY:70,shoulderHalfWidth:30,hipHalfWidth:14,bodyWidth:1,torsoScale:1,headSize:1,handSize:1,footSize:1,limbWidth:1,gripOffset:3.5,...rig};this.joints={};}
    solve(p,facing='front'){
      this.facing=facing;this.mirrored=facing==='left';
      if(facing==='left'||facing==='right')return this.solveProfile(p);
      return this.solveFrontal(p,facing==='back');
    }
    collect(p){
      const j=this.joints,body=this.bodyPoint;
      Object.assign(j,{head:this.head,neck:this.neck,torso:body(0,-47),pelvis:this.root});
      for(const side of ['left','right']){const a=this[side+'Arm'],l=this[side+'Leg'];j[side+'Shoulder']=a[0];j[side+'Elbow']=a[1];j[side+'Wrist']=a[2];j[side+'Hip']=l[0];j[side+'Knee']=l[1];j[side+'Foot']=l[2];}
      return this;
    }
    frame(p,lean){
      this.root=point(0,-this.rig.pelvisHeight+p.bob);this.angle=lean;
      this.bodyPoint=(x,y)=>{const c=Math.cos(lean),s=Math.sin(lean);return point(this.root.x+x*c-y*s,this.root.y+x*s+y*c);};
      const roll=p.pelvisRock||0;
      this.hipPoint=(x,y)=>this.bodyPoint(x*Math.cos(roll)-y*Math.sin(roll),x*Math.sin(roll)+y*Math.cos(roll));
      this.head=this.bodyPoint(0,-this.rig.headOffset);this.neck=this.bodyPoint(0,-this.rig.neckOffset);
    }
    projectChain(spatial,sign){
      // Orthographic camera pitched slightly down. Forward motion is depth,
      // not screen X; true bone lengths live in spatial, not their 2D projection.
      const elevation=.17,anchor=spatial[0].y;
      const chain=spatial.map(v=>({x:v.x,y:anchor+(v.y-anchor)*Math.cos(elevation)+sign*v.z*Math.sin(elevation),z:sign*v.z}));
      chain.spatial=spatial;chain.depth=chain[2].z;
      chain.upperScale=Lab.math.clamp(1+(chain[0].z+chain[1].z)*.0015,.88,1.14);
      chain.foreScale=Lab.math.clamp(1+(chain[1].z+chain[2].z)*.0015,.86,1.17);
      chain.handScale=Lab.math.clamp(1+chain[2].z*.004,.84,1.22);
      chain.footScale=Lab.math.clamp(1+chain[2].z*.003,.92,1.08);
      return chain;
    }
    frontalArm(start,angle,bend,side,sign,p,punch){
      const r=this.rig,dx1=side*3,dx2=side*1.5;
      const a=Math.sqrt(r.upperArm*r.upperArm-dx1*dx1),b=Math.sqrt(r.forearm*r.forearm-dx2*dx2);
      if(punch&&p.punchWeight>0){
        const goal=ik(point(0,start.y),point(p.punchReach,p.punchY),a,b,1),wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
        const upper=Math.atan2(goal[1].x,goal[1].y-start.y),flex=wrap(Math.atan2(goal[2].x-goal[1].x,goal[2].y-goal[1].y)-upper);
        angle+=wrap(upper-angle)*p.punchWeight;bend+=wrap(flex-bend)*p.punchWeight;
      }
      const shoulder={x:start.x,y:start.y,z:0};
      const elbow={x:start.x+dx1,y:start.y+Math.cos(angle)*a,z:Math.sin(angle)*a};
      const wrist={x:elbow.x+dx2,y:elbow.y+Math.cos(angle+bend)*b,z:elbow.z+Math.sin(angle+bend)*b};
      return this.projectChain([shoulder,elbow,wrist],sign);
    }
    frontalLeg(start,depth,lift,sign){
      const r=this.rig,yz=ik(point(0,start.y),point(depth,-12-lift),r.thigh,r.shin,-1);
      const chain=this.projectChain(yz.map(v=>({x:start.x,y:v.y,z:v.x})),sign);
      chain.footHeading=sign===1?'down':'up';return chain;
    }
    solveFrontal(p,back){
      const sign=back?-1:1;
      // Sagittal lean is not a sideways torso tilt in a front/back camera.
      this.frame(p,(p.hip*.28+(p.shoulderRock||0)+(p.slashTwist||0))*sign);const body=this.bodyPoint;
      this.leftArm=this.frontalArm(body(-this.rig.shoulderHalfWidth*sign,-this.rig.shoulderY),p.leftArm,p.leftElbow,-sign,sign,p,false);
      this.rightArm=this.frontalArm(body(this.rig.shoulderHalfWidth*sign,-this.rig.shoulderY),p.rightArm,p.rightElbow,sign,sign,p,true);
      this.leftLeg=this.frontalLeg(this.hipPoint(-this.rig.hipHalfWidth*sign,0),p.leftFootX+18,p.leftLift,sign);
      this.rightLeg=this.frontalLeg(this.hipPoint(this.rig.hipHalfWidth*sign,0),p.rightFootX-19,p.rightLift,sign);
      return this.collect(p);
    }
    solveProfile(p){
      const r=this.rig;this.frame(p,p.lean+(p.slashTwist||0)*.7);const body=this.bodyPoint;
      this.leftArm=fk(body(-7*this.rig.bodyWidth,-71*this.rig.torsoScale),p.leftArm+p.lean,p.leftElbow,r.upperArm,r.forearm);
      this.rightArm=fk(body(6*this.rig.bodyWidth,-this.rig.shoulderY),p.rightArm+p.lean,p.rightElbow,r.upperArm,r.forearm);
      if(p.punchWeight>0){
        const a=this.rightArm,goal=ik(a[0],point(p.punchX,p.punchY),r.upperArm,r.forearm,1),wrap=x=>Math.atan2(Math.sin(x),Math.cos(x));
        const angle=Math.atan2(goal[1].x-a[0].x,goal[1].y-a[0].y),bend=wrap(Math.atan2(goal[2].x-goal[1].x,goal[2].y-goal[1].y)-angle),base=p.rightArm+p.lean,w=p.punchWeight;
        this.rightArm=fk(a[0],base+wrap(angle-base)*w,p.rightElbow+wrap(bend-p.rightElbow)*w,r.upperArm,r.forearm);
      }
      this.leftLeg=ik(body(-6*this.rig.bodyWidth,0),point(-6+(p.leftFootX+18)*1.25,-12-p.leftLift),r.thigh,r.shin,-1);
      this.rightLeg=ik(body(6*this.rig.bodyWidth,0),point(6+(p.rightFootX-19)*1.25,-12-p.rightLift),r.thigh,r.shin,-1);
      return this.collect(p);
    }
    draw(ctx,scale){
      ctx.save();ctx.lineWidth=1.1/scale;ctx.strokeStyle='#e88348';ctx.fillStyle='#fff7d8';ctx.setLineDash([3/scale,3/scale]);
      if(this.mirrored)ctx.scale(-1,1);
      const chains=[this.leftArm,this.rightArm,this.leftLeg,this.rightLeg,[this.head,this.neck,this.root],[this.leftArm[0],this.rightArm[0]],[this.leftLeg[0],this.rightLeg[0]]];
      for(const chain of chains){ctx.beginPath();chain.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
      ctx.setLineDash([]);for(const p of Object.values(this.joints)){ctx.beginPath();ctx.arc(p.x,p.y,2.9/Math.sqrt(scale),0,Math.PI*2);ctx.fill();ctx.stroke();}
      ctx.font=`${8/scale}px monospace`;ctx.fillStyle='#9c5e3b';ctx.textAlign='left';ctx.fillText('HEAD',this.head.x+8/scale,this.head.y);ctx.fillText('HIP',this.root.x+8/scale,this.root.y);
      ctx.restore();
    }
  }
  Lab.Skeleton=Skeleton;Lab.solveIK=ik;
})(window.ChibiLab = window.ChibiLab || {});
