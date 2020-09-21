import log from '../utils/logger'

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' })
  }
  preload() {
    // load all assets
    this.load.image('optional_audio', 'assets/img/optional_audio.png')
    this.load.atlas('flares', 'assets/img/flares.png', 'assets/img/flares.json')
  }
  create() {
    let height = this.game.config.height
    let center = height / 2
    // little icon in the corner indicating audio is used, but optional
    this.add
      .image(15, 5, 'optional_audio')
      .setOrigin(0, 0)
      .setScale(0.45, 0.45)
    // this.add
    //   .text(center, center - 300, 'Treasure Hunt', {
    //     fontFamily: 'title_font',
    //     fontSize: 160,
    //     color: '#D2B48C',
    //     stroke: '#000',
    //     strokeThickness: 2,
    //     align: 'center',
    //     padding: {
    //       x: 64,
    //       y: 64,
    //     },
    //   })
    //   .setOrigin(0.5, 0.5)
    let txt = this.add
      .text(center, center + 300, 'Click here to start.', {
        fontFamily: 'Verdana',
        fontStyle: 'bold',
        fontSize: 64,
        color: '#ffef9b',
        stroke: '#444444',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    txt.setInteractive()
    this.tweens.add({
      targets: txt,
      alpha: { from: 0.2, to: 1 },
      ease: 'Cubic',
      duration: 500,
      repeat: -1,
      yoyo: true,
    })

    this.scale.on('fullscreenunsupported', function () {
      log.error('Fullscreen unsupported!');
    });

    this.input.on('pointerdown', () => {
      this.input.mouse.requestPointerLock()
    })
    let cb = () => {
      this.scale.startFullscreen() // todo: warn folks
      log.info(`RAF: ${this.game.loop.raftime}`)
      log.info('Starting instruction scene.')
      txt.removeInteractive()
      this.tweens.addCounter({
        from: 255,
        to: 0,
        duration: 1500,
        onUpdate: (t) => {
          let v = Math.floor(t.getValue())
          this.cameras.main.setAlpha(v / 255)
        },
        onComplete: () => this.scene.start('InstructionScene'),
      })
    }
    txt.once('pointerdown', cb)
  }
}
