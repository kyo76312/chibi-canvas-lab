(function (Lab) {
  'use strict';
  // Appearance is independent of poses; lengths are the shared rig's art-space units.
  Lab.CharacterAppearance = {
    id: 'aster', name: '星汐', subtitle: 'The Tidestar Explorer',
    palette: {
      ink:'#24334e', hair:'#243454', hairShade:'#17233d', hairLight:'#425d82', hairGlint:'#7295b4',
      skin:'#ffe3ce', skinShade:'#edb9aa', skinLight:'#fff2df', blush:'#ed9ea4',
      iris:'#358fba', irisDeep:'#224578', irisLight:'#7be1e0',
      blue:'#426d9d', blueLight:'#759bc4', blueShade:'#2a486d',
      white:'#fcf9ef', whiteShade:'#c5d8df', gold:'#d4ae65', goldLight:'#ffdf95',
      leather:'#34435b', leatherShade:'#222e44', sole:'#1e293c', gem:'#7ce0dd'
    },
    rig: { upperArm:29, forearm:27, thigh:38, shin:38 },
    hair: {style:'layered',length:1, fringe:1},
    outfit: {style:'tidestar', cape:true, emblem:'star'},
    accessories: {hairStar:true, satchel:true},
    parts:{face:'aster_face',hair:'aster_hair'},
    outline:2.1
  };
  Lab.createAppearance = function (overrides = {}) {
    const base=Lab.CharacterAppearance;
    return {...base,...overrides,parts:{...base.parts,...overrides.parts},palette:{...base.palette,...overrides.palette},rig:{...base.rig,...overrides.rig},hair:{...base.hair,...overrides.hair},outfit:{...base.outfit,...overrides.outfit},accessories:{...base.accessories,...overrides.accessories}};
  };
})(window.ChibiLab = window.ChibiLab || {});
