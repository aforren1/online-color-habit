// https://github.com/photonstorm/phaser3-project-template-custom-build
require('../../node_modules/phaser/src/polyfills')

var CONST = require('../../node_modules/phaser/src/const')

var Extend = require('../../node_modules/phaser/src/utils/object/Extend')

/**
 * @namespace Phaser
 */

// Patch in RAF timestamp
// after https://github.com/photonstorm/phaser/commit/ec5f3d3a33e786094652c3183428e984a395f100
// the RAF time gives us something closer to VSYNC time
var Core = require('../../node_modules/phaser/src/core')
Core.TimeStep.prototype.oldstep = Core.TimeStep.prototype.step
var ts = function (raftime) {
  this.raftime = raftime
  return this.oldstep()
}
Core.TimeStep.prototype.step = ts

var Phaser = {
  Actions: require('../../node_modules/phaser/src/actions'),
  //Animations: require('../../node_modules/phaser/src/animations'),
  Cache: require('../../node_modules/phaser/src/cache'),
  Cameras: require('../../node_modules/phaser/src/cameras'),
  Core: Core,
  Class: require('../../node_modules/phaser/src/utils/Class'),
  Create: require('../../node_modules/phaser/src/create'),
  Curves: require('../../node_modules/phaser/src/curves'),
  Data: require('../../node_modules/phaser/src/data'),
  Display: require('../../node_modules/phaser/src/display'),
  DOM: require('../../node_modules/phaser/src/dom'),
  Events: require('../../node_modules/phaser/src/events'),
  Game: require('../../node_modules/phaser/src/core/Game'),
  GameObjects: require('../../node_modules/phaser/src/gameobjects'),
  Geom: require('../../node_modules/phaser/src/geom'),
  Input: require('../../node_modules/phaser/src/input'),
  Loader: require('../../node_modules/phaser/src/loader'),
  Math: require('../../node_modules/phaser/src/math'),
  //Physics: require('../../node_modules/phaser/src/physics'),
  Plugins: require('../../node_modules/phaser/src/plugins'),
  Renderer: require('../../node_modules/phaser/src/renderer'),
  Scale: require('../../node_modules/phaser/src/scale'),
  Scene: require('../../node_modules/phaser/src/scene/Scene'),
  Scenes: require('../../node_modules/phaser/src/scene'),
  Sound: require('../../node_modules/phaser/src/sound'),
  Structs: require('../../node_modules/phaser/src/structs'),
  Textures: require('../../node_modules/phaser/src/textures'),
  //Tilemaps: require('../../node_modules/phaser/src/tilemaps'),
  Time: require('../../node_modules/phaser/src/time'),
  Tweens: require('../../node_modules/phaser/src/tweens'),
  Utils: require('../../node_modules/phaser/src/utils'),
}

//   Merge in the consts

Phaser = Extend(false, Phaser, CONST)

//  Export it

export default Phaser

global.Phaser = Phaser
