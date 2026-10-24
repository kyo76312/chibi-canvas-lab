(function(Lab){
  'use strict';
  // Tune running here. Walking values and the accepted foot-contact solver stay intact.
  Lab.MotionSettings={
    walkSpeed:120,
    runBaseSpeed:190,runSpeedMultiplier:1.20,
    runStride:20,runLift:25,runArmSwing:.76,runLean:.16,runBob:5.2,runStance:.40,
    get runSpeed(){return this.runBaseSpeed*this.runSpeedMultiplier;},
    // Speed = stride × cadence: a longer stride shares the 20% increase with cadence.
    get runCadence(){return 11.4*(this.runSpeed/190)*(17/this.runStride);}
  };
})(window.ChibiLab=window.ChibiLab||{});
