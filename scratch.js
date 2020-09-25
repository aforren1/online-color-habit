var config = {
  type: Phaser.WEBGL,
  width: 800,
  height: 800,
  backgroundColor: '#2d2d2d',
  parent: 'phaser-example',
  scene: {
    preload: preload,
    create: create,
  },
}

var game = new Phaser.Game(config)

function preload() {
  this.load.image('block', 'assets/sprites/block.png')
}

function create() {
  var start = 100
  var end = 700
  var t_max = 900
  var speed = (end - start) / t_max
  var end2 = 1000
  var t2 = (end2 - end) / speed

  var timing_tol = 50
  var d_min = speed * (t_max - timing_tol)
  var d_max = speed * (t_max + timing_tol)
  var target_height = Math.round(d_max - d_min)
  var line = this.add.rectangle(400, end, 800, 2, 0xcccccc)
  var image = this.add.rectangle(400, start, target_height, target_height, 0xffffff)
  var tmp = this.add.rectangle(400, start, target_height, 2, 0x000000)

  var middl = this.add.rectangle(400, 400, 200, 2, 0xffffff)

  var timeline = this.tweens.createTimeline()

  timeline.add({
    delay: 250,
    targets: [image, tmp],
    scaleY: 0.3,
    ease: 'Power1',
    duration: 200,
    yoyo: true,
  })

  timeline.add({
    targets: [image, tmp],
    y: end,
    ease: 'Linear',
    duration: t_max,
  })

  timeline.add({
    targets: [image, tmp],
    y: end2,
    ease: 'Linear',
    duration: t2,
  })

  var tl2 = this.tweens.createTimeline()
  var foo = 0
  tl2.add({
    targets: image,
    x: 400,
    //onStart: function() {foo = game.loop.now; console.log(foo);},
    onComplete: function () {
      image.setFillStyle(0xff0000)
      console.log(game.loop.now - foo)
    },
    duration: 400 + 250 + 450, // 1100
  })
  timeline.play()
  console.log(game.loop.now)
  foo = game.loop.now
  tl2.play()
}
