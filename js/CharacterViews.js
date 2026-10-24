(function(Lab){
  'use strict';
  // Dedicated orthographic art, not a transformed front-facing illustration.
  // All paths share the original palette, line weight and anatomical anchors.
  class CharacterViews{
    constructor(renderer){this.r=renderer;}
    draw(ctx,s,p,facing){this.r.activeRig=s;this.r.activeView=facing;this.r.views=this;Lab.PaperDoll.render(this.r,ctx,s,p,0,facing);}
    rearLeg(ctx,chain,far){const r=this.r,c=r.colors,[hip,knee,foot]=chain;
      if(!r.hidden('legSkin')&&!r.part('legs','limbs',ctx,{}, {chain,back:far})){
      r.segment(ctx,hip,knee,18*(chain.upperScale||1),far?c.skinShade:c.skin);
      r.segment(ctx,knee,foot,16*(chain.foreScale||1),far?'#aebdce':c.whiteShade);
      }
      if(!r.part('feet','foot',ctx,{}, {chain,back:far}))r.bareFeet(ctx,chain);
    }
    rearLegFeet(ctx,chain,far){const r=this.r,c=r.colors,foot=chain[2];
      ctx.save();ctx.translate(foot.x,foot.y);ctx.scale(chain.footScale||1,chain.footScale||1);
      // Rear toe extends upstage behind the shaft; the viewer sees the heel.
      r.path(ctx,'M -11 3 L -12 -11 Q -15 -26 0 -28 Q 15 -26 12 -11 L 11 3 Z',c.leatherShade,c.ink,1.4);
      r.path(ctx,'M -9 -21 Q 0 -24 9 -21 L 10 -2 Q 15 2 13 9 Q 0 13 -13 9 Q -15 2 -10 -2 Z',r.gradient(ctx,-12,-18,12,8,[[0,c.leatherShade],[.45,c.leather],[.8,'#52627a'],[1,c.leatherShade]]));
      r.path(ctx,'M -13 5 Q 0 9 13 5 L 13 10 Q 0 14 -13 10 Z',c.sole,c.ink,1.4);
      r.path(ctx,'M -9 -21 Q 0 -18 9 -21 L 10 -15 Q 0 -12 -10 -15 Z',c.blueShade,c.ink,1.3);
      r.path(ctx,'M 0 -13 L 0 4 M -8 1 Q 0 4 8 1',null,'#8293a9',1);
      r.path(ctx,'M -3 -18 L -3 -12 L 3 -12 L 3 -18 Z',c.gold,c.ink,.7);
      ctx.restore();
    }
    rearBody(ctx,p){const r=this.r;if(!r.part('legs','body',ctx,p))r.basePelvis(ctx,p);this.rearBodyNeck(ctx,p);if(!r.part('chest','body',ctx,p))r.baseTorso(ctx,p);this.rearBodyPouch(ctx,p);}
    rearBodySkirt(ctx,p){const r=this.r,c=r.colors;
      ctx.save();ctx.translate(0,-17);ctx.rotate(-p.skirt);
      r.path(ctx,'M -24 -8 Q 0 -13 24 -8 L 36 29 Q 18 37 0 33 Q -18 37 -36 29 Z',r.gradient(ctx,-34,0,34,20,[[0,c.blueShade],[.45,c.blueLight],[1,c.blueShade]]));
      r.path(ctx,'M -22 0 L -29 27 M -8 0 L -10 31 M 8 0 L 10 31 M 22 0 L 29 27',null,c.blueShade,1.5);
      r.path(ctx,'M -34 24 Q -18 32 0 28 Q 18 32 34 24 L 36 29 Q 18 39 0 34 Q -18 39 -36 29 Z',c.white,c.ink,1.4);
      r.path(ctx,'M -31 26 Q 0 36 31 26',null,c.gold,1);ctx.restore();
    }
    rearBodyNeck(ctx,p){const r=this.r,c=r.colors;
      r.path(ctx,'M -12 -88 L -12 -75 Q 0 -67 12 -75 L 12 -88 Z',c.skinShade,c.ink,1.6);
    }
    rearBodyChest(ctx,p){const r=this.r,c=r.colors;
      r.path(ctx,'M -25 -74 Q -34 -62 -27 -45 L -23 -20 Q 0 -12 24 -21 L 29 -47 Q 33 -63 25 -74 Q 0 -84 -25 -74 Z',r.gradient(ctx,-26,-75,26,-18,[[0,c.blueShade],[.5,c.blue],[1,c.blueLight]]));
      r.path(ctx,'M -1 -72 L -1 -25 M -19 -65 Q -20 -40 -16 -28 M 20 -65 Q 21 -40 17 -28',null,c.blueShade,1.3);
      // White mantle wraps the shoulders; its rear scallop and gold piping are unique.
      r.path(ctx,'M -12 -84 Q -28 -82 -36 -69 L -39 -56 Q -23 -49 -13 -58 Q 0 -53 13 -58 Q 26 -49 39 -56 Q 34 -79 12 -84 L 10 -73 Q 0 -68 -10 -73 Z',r.gradient(ctx,-34,-79,34,-51,[[0,c.whiteShade],[.45,c.white],[1,c.whiteShade]]));
      r.path(ctx,'M -35 -59 Q -24 -54 -14 -62 Q 0 -57 14 -62 Q 25 -54 35 -59',null,c.gold,1.4);
      r.path(ctx,'M -12 -85 L -16 -76 Q 0 -65 16 -76 L 12 -85 Q 0 -78 -12 -85 Z',c.white,c.ink,1.4);
      if(r.appearance.outfit.cape){
        ctx.save();ctx.translate(0,-61);ctx.rotate(-p.cape);
        r.path(ctx,'M -23 -3 Q 0 6 23 -3 L 30 36 Q 15 42 0 36 Q -15 42 -30 36 Z',r.gradient(ctx,-26,0,26,36,[[0,c.blueShade],[.5,c.blue],[1,c.blueLight]]));
        r.path(ctx,'M -26 32 Q -13 37 0 31 Q 13 37 26 32',null,c.gold,1.4);
        r.path(ctx,'M -14 6 L -19 27 M 14 6 L 19 27',null,c.blueShade,1.2);
        r.star(ctx,0,25,7,c.gold,c.blueShade);
        r.path(ctx,'M -11 20 Q -9 30 0 32 Q 9 30 11 20',null,c.gold,.9);ctx.restore();
      }
      // The lower fold of the rear collar peeks out beneath the long nape hair.
      r.path(ctx,'M -35 -56 Q -28 -47 -17 -52 Q 0 -43 17 -52 Q 28 -47 35 -56 L 32 -48 Q 22 -40 14 -45 Q 0 -38 -14 -45 Q -26 -39 -35 -48 Z',r.gradient(ctx,-30,-54,30,-40,[[0,c.whiteShade],[.5,c.white],[1,c.whiteShade]]),c.ink,1.4);
      r.path(ctx,'M -31 -47 Q -22 -42 -14 -47 Q 0 -41 14 -47 Q 23 -42 31 -47',null,c.gold,1);
      r.path(ctx,'M -25 -28 Q 0 -21 25 -28 L 25 -17 Q 0 -10 -25 -17 Z',c.leather,c.ink,1.6);
      r.path(ctx,'M -22 -22 Q 0 -17 22 -22',null,'#8293a9',.8);
      for(const x of [-15,15])r.path(ctx,`M ${x-2} -27 L ${x+2} -27 L ${x+2} -16 L ${x-2} -16 Z`,c.blueShade,c.ink,.7);
    }
    rearBodyPouch(ctx,p){const r=this.r,c=r.colors;
      // The satchel is on the anatomical right, hence the left of a rear view.
      if(r.appearance.accessories.satchel){r.path(ctx,'M -31 -23 L -18 -21 L -17 0 Q -28 5 -34 -3 Z','#947d68',c.ink,1.4);r.path(ctx,'M -31 -22 L -18 -20 L -18 -12 L -25 -8 L -33 -13 Z','#b69b77',c.ink,1.2);r.ellipse(ctx,-25,-12,1.5,1.5,c.gold,c.ink,.6);}
    }
    rearHead(ctx,p){const r=this.r;r.part('hair','front',ctx,p);r.part('hairAccessory','head',ctx,p);r.part('head','head',ctx,p);}
    asterRearHair(ctx,p){const r=this.r,c=r.colors;
      // Full rear cranium: there is deliberately no face/eye/nose/mouth call.
      r.path(ctx,'M -55 15 Q -67 -12 -55 -39 Q -47 -65 -20 -69 Q 6 -77 32 -62 Q 59 -48 61 -19 Q 65 8 54 31 Q 33 62 0 63 Q -34 61 -55 15 Z',r.gradient(ctx,-52,-64,55,65,[[0,c.hairLight],[.4,c.hair],[1,c.hairShade]]));
      ctx.save();ctx.translate(0,22);ctx.rotate(p.hair*.60);ctx.scale(1,r.appearance.hair.length);
      const shape=r.appearance.hair.style==='bob'?'M -55 -54 Q -58 12 -57 40 Q -26 62 0 56 Q 28 62 58 40 L 55 -54 Z':'M -55 -54 Q -60 14 -59 40 Q -60 58 -71 69 Q -56 75 -43 61 Q -49 80 -35 84 Q -25 77 -23 60 Q -12 67 0 56 Q 12 67 24 60 Q 25 81 38 83 Q 51 77 47 61 Q 61 75 72 66 Q 60 54 59 31 L 55 -54 Z';
      r.path(ctx,shape,r.gradient(ctx,-60,0,63,80,[[0,c.hairShade],[.3,c.hair],[.7,c.hairLight],[1,c.hairShade]]));
      r.path(ctx,'M -46 -38 Q -46 29 -51 48 Q -50 57 -56 64 M -26 -30 Q -32 24 -32 61 M -8 -25 Q -14 22 -9 43 M 11 -25 Q 20 24 15 46 M 31 -30 Q 35 26 34 62 M 48 -38 Q 47 32 56 55',null,c.hairLight,1.8);
      r.path(ctx,'M -42 24 Q -44 42 -47 49 M 38 31 L 40 48',null,c.hairGlint,1.2);ctx.restore();
      // Crown locks overlay the moving tips, preventing a hinge-like seam.
      r.path(ctx,'M -55 -4 Q -58 -40 -33 -58 Q -7 -80 24 -63 Q 53 -49 57 -12 Q 39 -22 30 -37 Q 28 -8 14 4 Q 13 -23 3 -35 Q -5 -4 -19 5 Q -20 -20 -29 -35 Q -36 -12 -55 -4 Z',r.gradient(ctx,-36,-68,42,5,[[0,c.hairLight],[.45,c.hair],[1,c.hairShade]]),c.ink,1.6);
      r.path(ctx,'M -48 -31 Q -33 -58 -9 -62 Q 18 -67 37 -44 Q 9 -56 -9 -50 Q -30 -49 -48 -31 Z','#6486a44a',null);
      r.path(ctx,'M -47 -30 Q -35 -50 -23 -53 M -15 -57 Q 5 -62 22 -52',null,c.hairGlint,1.5);
      r.path(ctx,'M -28 -45 Q -31 -26 -37 -18 M -9 -49 Q -10 -28 -14 -16 M 8 -49 Q 20 -34 20 -20 M 30 -42 Q 40 -28 44 -18',null,c.hairLight,1.6);
      r.path(ctx,'M -5 -69 Q -13 -85 2 -85 Q -5 -80 6 -69',c.hair,c.ink,1.7);
    }
    rearAccessory(ctx,p){const r=this.r,c=r.colors;
      if(r.appearance.accessories.hairStar){r.path(ctx,'M 53 -24 L 59 -20',null,c.gold,2.5);r.ellipse(ctx,57,-22,1.7,2,c.goldLight);}
    }
    profileLeg(ctx,chain,far){const r=this.r,c=r.colors,[hip,knee,foot]=chain;
      if(!r.hidden('legSkin')&&!r.part('legs','limbs',ctx,{}, {chain,back:far})){
      r.segment(ctx,hip,knee,16*(chain.upperScale||1),far?c.skinShade:c.skin);r.segment(ctx,knee,foot,14*(chain.foreScale||1),far?'#aebdce':c.whiteShade);
      }
      if(!r.part('feet','foot',ctx,{}, {chain,back:far}))r.bareFeet(ctx,chain);
    }
    profileLegFeet(ctx,chain,far){const r=this.r,c=r.colors,knee=chain[1],foot=chain[2];
      ctx.save();ctx.translate(foot.x,foot.y);ctx.rotate(-Math.atan2(foot.x-knee.x,foot.y-knee.y)*.16);ctx.scale(chain.footScale||1,chain.footScale||1);
      r.path(ctx,'M -9 -21 Q 0 -24 8 -20 L 8 -5 Q 11 -2 20 0 Q 27 1 26 8 Q 12 13 -12 10 Q -15 6 -12 0 Z',r.gradient(ctx,-11,-18,24,8,[[0,c.leatherShade],[.5,c.leather],[1,'#53637b']]));
      r.path(ctx,'M -13 5 Q 8 9 26 5 L 26 10 Q 7 15 -13 11 Z',c.sole,c.ink,1.4);
      r.path(ctx,'M -9 -21 Q 0 -18 8 -21 L 9 -15 Q 0 -12 -10 -15 Z',c.blueShade,c.ink,1.3);
      r.path(ctx,'M 3 -12 L 7 -7 M 5 -7 L 10 -3 M -7 -10 L -8 0 M 17 1 Q 23 1 23 4',null,far?'#6c809b':c.gold,1);
      ctx.restore();
    }
    profileBody(ctx,p){const r=this.r;r.part('chest','cape',ctx,p);if(!r.part('legs','body',ctx,p))r.basePelvis(ctx,p);this.profileBodyNeck(ctx,p);if(!r.part('chest','body',ctx,p))r.baseTorso(ctx,p);this.profileBodyPouch(ctx,p);}
    profileBodySkirt(ctx,p){const r=this.r,c=r.colors;
      ctx.save();ctx.translate(0,-17);ctx.rotate(p.skirt);
      r.path(ctx,'M -17 -8 Q 1 -13 19 -7 L 29 29 Q 4 39 -27 29 Z',r.gradient(ctx,-25,0,28,30,[[0,c.blueShade],[.6,c.blue],[1,c.blueLight]]));
      r.path(ctx,'M -12 0 L -18 28 M 2 -1 L 2 31 M 14 0 L 21 28',null,c.blueShade,1.5);
      r.path(ctx,'M -26 24 Q 3 34 27 24 L 29 29 Q 5 41 -27 29 Z',c.white,c.ink,1.4);r.path(ctx,'M -22 27 Q 3 35 24 27',null,c.gold,1);ctx.restore();
    }
    profileBodyNeck(ctx,p){const r=this.r,c=r.colors;
      r.path(ctx,'M -10 -88 L -10 -73 Q 2 -67 13 -75 L 12 -88 Z',c.skin,c.ink,1.6);
    }
    profileBodyChest(ctx,p){const r=this.r,c=r.colors;
      r.path(ctx,'M -15 -77 Q -24 -64 -20 -43 L -17 -20 Q 0 -14 19 -20 Q 24 -42 23 -55 Q 26 -71 13 -77 Z',r.gradient(ctx,-21,-70,24,-22,[[0,c.blueShade],[.45,c.blue],[1,c.blueLight]]));
      r.path(ctx,'M 15 -74 Q 26 -56 20 -24 L 13 -22 L 12 -64 Z',c.white,c.ink,1.2);
      r.path(ctx,'M 10 -63 L 9 -24 M -11 -60 L -11 -26',null,c.gold,1.1);
      r.path(ctx,'M -10 -84 Q -25 -81 -28 -62 Q -17 -52 -6 -59 L 12 -64 L 24 -59 Q 28 -72 12 -82 L 1 -74 Z',r.gradient(ctx,-26,-80,26,-55,[[0,c.whiteShade],[.45,c.white],[1,c.whiteShade]]));
      r.path(ctx,'M -25 -63 Q -14 -56 -5 -64 L 12 -69 L 22 -63',null,c.gold,1.3);
      r.path(ctx,'M 10 -83 L 4 -74 L 15 -63 L 22 -74 Z',c.white,c.ink,1.4);
      r.path(ctx,'M 18 -67 L 15 -48 L 22 -53 L 27 -49 L 25 -65 Z',c.blueShade,c.ink,1.1);
      r.star(ctx,23,-65,5.5,c.gold);r.ellipse(ctx,24,-65,2.2,3.5,c.gem,c.ink,.6);
      r.path(ctx,'M -20 -27 Q 0 -22 21 -27 L 20 -16 Q 0 -11 -20 -17 Z',c.leather,c.ink,1.6);
      r.path(ctx,'M -18 -22 Q 0 -17 18 -22',null,'#8293a9',.8);r.path(ctx,'M 15 -25 L 22 -26 L 22 -15 L 15 -15 Z',c.gold,c.ink,1);
    }
    profileBodyPouch(ctx,p){const r=this.r,c=r.colors;
      if(r.appearance.accessories.satchel){r.path(ctx,'M -20 -22 L -8 -22 L -5 -2 Q -13 4 -23 -1 Z','#947d68',c.ink,1.4);r.path(ctx,'M -20 -22 L -8 -22 L -6 -13 L -14 -8 L -23 -12 Z','#b69b77',c.ink,1.2);r.ellipse(ctx,-14,-12,1.5,1.5,c.gold,c.ink,.6);}
    }
    profileCape(ctx,p){const r=this.r,c=r.colors;
      if(r.appearance.outfit.cape){ctx.save();ctx.translate(-12,-72);ctx.rotate(p.cape);r.path(ctx,'M -1 -4 Q -17 2 -18 23 L -25 61 Q -6 70 7 57 L 15 10 Z',r.gradient(ctx,-23,10,14,58,[[0,c.blueShade],[.5,c.blue],[1,c.blueLight]]));r.path(ctx,'M -22 55 Q -8 62 4 54',null,c.gold,1.6);r.path(ctx,'M -9 12 Q -14 34 -12 49',null,c.blueShade,1.2);ctx.restore();}
    }
    profileHairBack(ctx,p){this.r.part('hair','back',ctx,p);}
    asterProfileHairBack(ctx,p){
      const r=this.r,c=r.colors;ctx.save();ctx.rotate(p.hair*.65);ctx.scale(1,r.appearance.hair.length);
      const shape=r.appearance.hair.style==='bob'?'M -45 -37 Q -65 -7 -57 24 L -57 69 Q -35 86 -8 70 L 15 31 Q 37 0 21 -32 Z':'M -45 -37 Q -66 -8 -57 24 Q -53 65 -69 87 Q -53 94 -41 79 Q -44 101 -27 104 Q -14 98 -15 80 Q 1 96 13 86 Q 4 66 11 43 Q 35 4 21 -32 Z';
      r.path(ctx,shape,r.gradient(ctx,-62,-5,13,85,[[0,c.hairShade],[.5,c.hair],[.8,c.hairLight],[1,c.hairShade]]));
      ctx.save();ctx.clip(r.paths.get(shape));r.path(ctx,'M -45 -13 Q -52 32 -50 61 Q -51 73 -57 82 M -30 6 Q -37 46 -30 78 M -11 25 Q -21 51 -7 74',null,c.hairLight,1.8);r.path(ctx,'M -49 39 L -49 54 M -33 52 L -32 65',null,c.hairGlint,1.2);ctx.restore();ctx.restore();
    }
    profileHead(ctx,p){const r=this.r;r.part('face','face',ctx,p);r.part('hair','front',ctx,p);this.profileEar(ctx,p);r.part('hair','side',ctx,p);r.part('hairAccessory','head',ctx,p);r.part('head','head',ctx,p);}
    profileFace(ctx,p){const r=this.r,c=r.colors;
      // A true forehead / nose bridge / nose tip / lip / chin silhouette.
      r.path(ctx,'M -22 -39 Q 5 -58 31 -37 Q 45 -26 43 -5 L 44 9 Q 46 15 54 19 Q 60 24 48 27 Q 49 34 43 37 Q 43 49 26 54 Q 8 61 -12 43 Q -34 23 -22 -39 Z',r.gradient(ctx,-16,-38,43,52,[[0,c.skinLight],[.65,c.skin],[1,c.skinShade]]));
      r.path(ctx,'M -19 -10 Q -25 22 -6 38 Q 9 54 30 49 Q 14 62 -4 48 Q -28 37 -28 13 Z',c.skinShade,null);
      const blush=ctx.createRadialGradient(26,29,1,26,29,14);blush.addColorStop(0,'#ec8e9960');blush.addColorStop(1,'#ec8e9900');r.ellipse(ctx,26,29,14,8,blush);
      r.path(ctx,'M 23 -12 Q 33 -17 40 -11',null,c.hairShade,2);
      this.profileEye(ctx,p);
      r.path(ctx,'M 47 25 L 49 24 M 37 39 Q 43 41 46 36',null,'#a76670',1.2);r.path(ctx,'M 32 48 L 37 47',null,c.skinLight,1.1);
    }
    profileCrown(ctx,p){const r=this.r,c=r.colors;
      r.path(ctx,'M -52 12 Q -64 -12 -49 -42 Q -32 -70 -4 -71 Q 28 -75 45 -47 Q 54 -31 46 -9 L 34 -16 Q 37 -27 24 -34 Q 17 -12 2 0 Q -2 -11 0 -23 Q -12 -7 -29 1 Z',r.gradient(ctx,-48,-63,41,12,[[0,c.hairLight],[.5,c.hair],[1,c.hairShade]]));
      r.path(ctx,'M -43 -37 Q -28 -62 -4 -63 Q 21 -65 36 -45 Q 10 -57 -10 -51 Q -28 -48 -43 -37 Z','#6486a449',null);
      r.path(ctx,'M -45 -30 Q -34 -50 -20 -55 M -13 -59 Q 9 -65 25 -51',null,c.hairGlint,1.5);
      r.path(ctx,'M -15 -52 Q -16 -27 -26 -17 M 2 -53 Q 7 -33 -1 -14 M 17 -49 Q 28 -35 28 -24',null,c.hairLight,1.8);
    }
    profileEar(ctx,p){const r=this.r,c=r.colors;
      if(r.part('face','ear',ctx,p))return;
      r.ellipse(ctx,-10,15,9,13,c.skin,c.ink,1.6);r.path(ctx,'M -12 9 Q -5 7 -6 16 L -10 21',null,'#c98e88',1.2);
    }
    profileStrand(ctx,p){const r=this.r,c=r.colors;
      // Near temple strand overlaps the ear, not the eye or cheek.
      ctx.save();ctx.rotate(p.hair*.25);
      r.path(ctx,'M -24 -35 Q -12 -24 -15 0 Q -22 24 -15 43 Q -17 66 -7 75 Q -23 82 -31 62 Q -39 40 -30 15 Q -25 -4 -32 -21 Z',r.gradient(ctx,-35,-30,-9,70,[[0,c.hairLight],[.5,c.hair],[1,c.hairShade]]));
      r.path(ctx,'M -24 -16 Q -21 1 -27 24 Q -29 44 -22 59',null,c.hairLight,2);r.path(ctx,'M -28 31 L -27 44',null,c.hairGlint,1.2);ctx.restore();
      r.path(ctx,'M -5 -69 Q -13 -85 2 -85 Q -5 -80 6 -69',c.hair,c.ink,1.7);
    }
    profileAccessory(ctx,p){const r=this.r,c=r.colors;
      if(r.appearance.accessories.hairStar){r.path(ctx,'M -21 -20 L -3 -25',null,c.goldLight,2.4);r.star(ctx,-12,-23,6.5,c.gold);r.ellipse(ctx,-7,29,2,3,c.gold,c.ink,.7);}
    }
    profileEye(ctx,p){
      const r=this.r,c=r.colors;ctx.save();ctx.translate(30,9);ctx.scale(1,Math.max(.04,p.blink));
      const shape='M -11 -5 Q -6 -17 6 -13 Q 14 -8 11 6 Q 8 17 -3 16 Q -10 13 -11 -5 Z';
      r.path(ctx,shape,'#fffcf5',c.ink,1.2);ctx.save();ctx.clip(r.paths.get(shape));
      r.ellipse(ctx,5,1,8,14,r.gradient(ctx,0,-13,0,15,[[0,c.irisDeep],[.5,c.iris],[1,c.irisLight]]),c.irisDeep,.9);
      r.ellipse(ctx,7,-2,3.5,9.5,'#1b3055');r.path(ctx,'M 0 10 Q 5 14 10 8',null,'#c3f7e7',1.4);r.ellipse(ctx,1,-6,3.4,4.7,'#fff');r.ellipse(ctx,9,6,1.9,2.2,'#fff9e6');ctx.restore();
      r.path(ctx,'M -13 -6 Q -8 -18 5 -15 Q 12 -13 13 -6 M 10 -12 L 14 -16',null,c.hairShade,2.7);r.path(ctx,'M -4 17 Q 4 19 9 13',null,'#bb8f8e',1);
      if(p.hurt>.2)r.path(ctx,'M -7 -1 L 7 6 L -4 11',null,c.ink,2.2);ctx.restore();
    }
  }
  Lab.CharacterViews=CharacterViews;
})(window.ChibiLab=window.ChibiLab||{});
