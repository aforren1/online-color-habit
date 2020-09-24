import log from '../utils/logger'
import scheds from '../../scheds/sched.json'

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' })
  }
  preload() {
    // load all assets
    this.load.image('optional_audio', 'assets/optional_audio.png')
    this.load.atlas('flares', 'assets/flares.png', 'assets/flares.json')
  }
  create() {
    let height = this.game.config.height
    let center = height / 2
    // little icon in the corner indicating audio is used, but optional
    this.add.image(15, 5, 'optional_audio').setOrigin(0, 0).setScale(0.45, 0.45)
    let title = this.add
      .text(center, center - 200, 'Colorific!', {
        fontSize: 160,
        fontFamily: 'Arial',
        fontStyle: 'italic',
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false)
    let bmz = this.plugins.get('rexBitmapZonePlugin').add(title)
    let particles = this.add.particles('flares', 'white').setPosition(title.x, title.y)
    this.emitter = particles.createEmitter({
      blendMode: 'ADD',
      scale: { start: 0.1, end: 0.15 },
      alpha: { start: 1, end: 0 },
      quantity: 15,
      speed: 4,
      gravityY: -40,
      emitZone: {
        type: 'random',
        source: bmz,
      },
    })
    this.counter = 0
    this.twn = this.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 2000,
      repeat: -1,
      onRepeat: () => {
        this.counter += 1
        this.counter %= 4
      },
    })

    this.add
      .text(center, center, `Day ${this.game.user_config.day}/5`, {
        fontFamily: 'Verdana',
        fontSize: 50,
        color: '#dddddd',
        stroke: '#444444',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    let txt = this.add
      .text(center, center + 300, 'Press [enter] to start.', {
        fontFamily: 'Verdana',
        fontStyle: 'bold',
        fontSize: 60,
        color: '#dddddd',
        stroke: '#444444',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    this.tweens.add({
      targets: txt,
      alpha: { from: 0.3, to: 1 },
      ease: 'Linear',
      duration: 800,
      repeat: -1,
      yoyo: true,
    })

    let cb = () => {
      // https://supernapie.com/blog/hiding-the-mouse-in-a-ux-friendly-way/
      // we don't need the cursor, but we also don't need pointer lock or the like
      let canvas = this.sys.canvas
      canvas.style.cursor = 'none'
      canvas.addEventListener('mousemove', () => {
        canvas.style.cursor = 'default'
        clearTimeout(mouseHideTO)
        let mouseHideTO = setTimeout(() => {
          canvas.style.cursor = 'none'
        }, 1000)
      })
      this.scale.startFullscreen() // todo: warn folks
      log.info(`RAF: ${this.game.loop.now}`)
      log.info('Starting next scene.')
      txt.removeInteractive()
      this.tweens.addCounter({
        from: 255,
        to: 0,
        duration: 1500,
        onUpdate: (t) => {
          let v = Math.floor(t.getValue())
          this.cameras.main.setAlpha(v / 255)
        },
        onComplete: () => {
          // extract group, day schedule
          let conf = this.game.user_config
          let group = conf.group
          let day = conf.day
          let grp_config = scheds[group]
          // put together a new obj with 2 things we need-- day sched & act-col map
          let today_config = {
            map: grp_config['action_color_map'],
            day_sched: grp_config.days[day],
          }
          // other scenes should use the same pattern, except
          // to `.shift()` the today_config.day_sched, and if undefined,
          // send to the exit scene
          this.scene.start(today_config.day_sched[0].task, today_config)
        },
      })
    }
    let enter_key = this.input.keyboard.addKey('ENTER')
    enter_key.once('down', cb)
    console.log(this.game.user_config)
  }

  update() {
    let cols = [0xff007d, 0xbd5e00, 0x009800, 0x00a0ff]
    let val = Math.floor(this.twn.getValue())
    let counter = this.counter
    let ref = Phaser.Display.Color.IntegerToColor(cols[counter])
    let targ = Phaser.Display.Color.IntegerToColor(cols[(counter + 1) % 4])

    let col = Phaser.Display.Color.Interpolate.ColorWithColor(ref, targ, 200, val)
    let foo = Phaser.Display.Color.GetColor(col.r, col.g, col.b)
    this.emitter.setTint(foo)
  }
}
