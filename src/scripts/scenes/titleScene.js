import log from '../utils/logger'
import scheds from '../../scheds/sched.json'
import KeyFeedback from '../objects/keys'
// TODO: HUIL to start.
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
    // // little icon in the corner indicating audio is used, but optional
    // this.add
    //   .image(height - 100, -10, 'optional_audio')
    //   .setOrigin(0, 0)
    //   .setScale(0.4, 0.4)
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

    this.add.text(0, 0, `ID: ${this.game.user_config.id}`, {
      fontFamily: 'Verdana',
      fontSize: 12,
    })

    let txt = this.add
      .text(center, center + 300, 'Hold the H-U-I-L keys\nto start.', {
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

    let kf = new KeyFeedback(this, center, center + 100, 1)
    this.keyvals = { h: 0, u: 0, i: 0, l: 0 }
    for (let key of ['H', 'U', 'I', 'L']) {
      this.input.keyboard
        .addKey(key)
        .on('down', (evt) => {
          let foo = evt.originalEvent.key
          // timestamp is evt.originalEvent.timeStamp
          kf.press(foo)
          this.keyvals[foo] = 1
        })
        .on('up', (evt) => {
          let foo = evt.originalEvent.key
          this.keyvals[foo] = 0
          kf.release(foo)
        })
    }
    this.cb = () => {
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
      //this.scale.startFullscreen() // todo: warn folks
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
          this.scene.start(today_config.day_sched[0].task, { today_config: today_config, today_data: [] })
        },
      })
    }

    console.log(this.game.user_config)
    this.trig = false
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

    if (!this.trig && Object.values(this.keyvals).reduce((a, b) => a + b, 0) >= 4) {
      this.trig = true
      this.cb()
    }
  }
}
