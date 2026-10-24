(function(Lab){
  'use strict';
  const scene=new Lab.CharacterScene();
  scene.add(Lab.CharacterFactory.create('aster',{instanceId:'player-aster',position:{x:0,y:0}}));
  scene.add(Lab.CharacterFactory.create('luna',{instanceId:'npc-luna',position:{x:-235,y:-8}}));
  scene.add(Lab.CharacterFactory.create('warden',{instanceId:'npc-warden',position:{x:235,y:-6}}));
  scene.add(Lab.CharacterFactory.create('slime',{instanceId:'enemy-slime',position:{x:120,y:65}}));
  scene.add(Lab.CharacterFactory.create('viktor',{instanceId:'npc-viktor',position:{x:-430,y:70}}));
  scene.add(Lab.CharacterFactory.create('arucat',{instanceId:'npc-arucat',position:{x:430,y:75}}));
  const engine=new Lab.CanvasEngine(document.getElementById('character-canvas'),scene),ui=new Lab.UIController(engine);
  const touch=new Lab.TouchController(engine,ui);Lab.app={engine,ui,scene,touch};engine.start();
})(window.ChibiLab=window.ChibiLab||{});
