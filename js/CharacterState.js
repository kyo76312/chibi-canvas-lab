(function(Lab){
  'use strict';
  class CharacterState{
    constructor(){this.position={x:0,y:0};this.velocity={x:0,y:0};this.facing='front';this.animation='idle';this.animationTime=0;this.locomotionState='idle';this.actionState='none';this.initialized=false;}
    sync(animation){this.animation=animation.state;this.animationTime=animation.time;this.locomotionState=animation.locomotionState;this.actionState=animation.actionState;}
  }
  Lab.CharacterState=CharacterState;
})(window.ChibiLab=window.ChibiLab||{});
