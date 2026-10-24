(function(Lab){
  'use strict';
  function HumanoidRigConfig(input={}){
    const c={headSize:1,bodyWidth:1,torsoLength:88,upperArm:29,forearm:27,thigh:38,shin:38,handSize:1,footSize:1,limbWidth:1,gripOffset:3.5,...input};
    for(const key of ['headSize','bodyWidth','torsoLength','upperArm','forearm','thigh','shin','handSize','footSize','limbWidth'])if(!Number.isFinite(c[key])||c[key]<=0)throw Error('Invalid rig proportion '+key);
    c.torsoScale=c.torsoLength/88;c.pelvisHeight=input.pelvisHeight??c.thigh+c.shin+10;c.neckOffset=input.neckOffset??87*c.torsoScale;
    c.headOffset=input.headOffset??c.neckOffset+48*c.headSize;c.shoulderY=input.shoulderY??70*c.torsoScale;
    c.shoulderHalfWidth=input.shoulderHalfWidth??30*c.bodyWidth;c.hipHalfWidth=input.hipHalfWidth??14*c.bodyWidth;
    return c;
  }
  class HumanoidRig extends Lab.Skeleton{
    constructor(config){super(HumanoidRigConfig(config));this.canonical=true;this.attachments={};}
    solve(p,facing='front'){
      const ratio=(this.rig.thigh+this.rig.shin)/76;
      const adjusted={...p,leftFootX:-18+(p.leftFootX+18)*ratio,rightFootX:19+(p.rightFootX-19)*ratio,leftLift:p.leftLift*ratio,rightLift:p.rightLift*ratio};
      return super.solve(adjusted,facing);
    }
    collect(p){
      // From here onward, all public limbs and joints are anatomical. Projection
      // slots stay private to the original solver; mirrors never change owners.
      if(this.facing!=='right'){[this.leftArm,this.rightArm]=[this.rightArm,this.leftArm];[this.leftLeg,this.rightLeg]=[this.rightLeg,this.leftLeg];}
      this.hands={left:this.leftArm,right:this.rightArm};
      this.viewArms={far:this.facing==='left'?this.rightArm:this.leftArm,near:this.facing==='left'?this.leftArm:this.rightArm};
      this.viewLegs={far:this.facing==='left'?this.rightLeg:this.leftLeg,near:this.facing==='left'?this.leftLeg:this.rightLeg};
      for(const chain of [this.leftArm,this.rightArm,this.leftLeg,this.rightLeg]){
        chain.upperScale=(chain.upperScale||1)*this.rig.limbWidth;chain.foreScale=(chain.foreScale||1)*this.rig.limbWidth;
        chain.handScale=(chain.handScale||1)*this.rig.handSize;chain.footScale=(chain.footScale||1)*this.rig.footSize;
      }
      return super.collect(p);
    }
    refreshAttachments(){
      this.hands={left:this.leftArm,right:this.rightArm};this.viewArms={far:this.facing==='left'?this.rightArm:this.leftArm,near:this.facing==='left'?this.leftArm:this.rightArm};this.attachments={head:this.head,torso:this.bodyPoint(0,-47*this.rig.torsoScale),pelvis:this.root};
      for(const side of ['left','right']){const a=this[side+'Arm'],dx=a[2].x-a[1].x,dy=a[2].y-a[1].y,d=Math.hypot(dx,dy)||1;this.attachments[side+'Hand']={x:a[2].x+dx/d*this.rig.gripOffset*(a.handScale||1),y:a[2].y+dy/d*this.rig.gripOffset*(a.handScale||1)};}
      this.attachments.castOrigin=this.attachments.rightHand;Lab.Skeleton.prototype.collect.call(this,{});return this.attachments;
    }
    getBounds(){const c=this.rig;return{minX:-160*Math.max(c.bodyWidth,c.headSize,(c.upperArm+c.forearm)/56),maxX:160*Math.max(c.bodyWidth,c.headSize,(c.upperArm+c.forearm)/56),minY:-c.pelvisHeight-c.headOffset-(c.headClearance??94)*c.headSize,maxY:23*c.footSize};}
  }
  Object.assign(Lab,{HumanoidRigConfig,HumanoidRig});
})(window.ChibiLab=window.ChibiLab||{});
