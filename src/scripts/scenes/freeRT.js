// gist of this free RT task: show instruction screen (static, maybe flashing text)
// When [enter] to start, unveil the playing arena and do 3-2-1-start
// show stim immediately. if good, 300ms feedback & onward. if wrong, 1s feedback and repeat
// take-a-break scene pauses for at least 15 sec (maybe showing today's progress? i.e. block completion times)
//
import CorrectFeedback from '../objects/perry'
import { TypingText } from '../objects/typingtext'
import { KeyFeedback, KeyStim } from '../objects/keys'

import { Enum } from '../utils/enum'
import log from '../utils/logger'

const states = Enum([
  'INSTRUCT', // show text instructions (bb typing text style, for emphasis)
  'COUNTDOWN', // countdown (3-2-1-go),
  'MAIN_LOOP', // show box immediately. Wait for resp-- immediate feedback with response. If correct, checkmark + fireworks? Otherwise, X for 1s. If 100 trials elapsed & still more to go, take a break. Otherwise, end section.
  'TAKE_A_BREAK', // min 15s wait, show completion time feedback? and wait for huil to continue
  'END_SECTION', // pretty much like TAKE_A_BREAK, but more final
])
const prac_txt =
  "In this section, you'll practice some of the color-key combinations. Try to respond as quickly and correctly as possible."
const mass_txt =
  "In this section, you'll practice [b][color=red]two more[/b][/color] color-key combinations. Try to respond as quickly and correctly as possible."
const remap_txt =
  'Now, we have switched some of the color-key relationships. This section will make you familiar with those changes. [b]take your time[/b], correctness is most important here.'
const texts = {
  finger: { 1: 'This section will help you to become familiar with one of the tasks.' },
  color: {
    1: "Next, you'll learn the association between color & computer key.",
    2: prac_txt,
    3: prac_txt,
    4: prac_txt,
  },
}

export default class FreeRT extends Phaser.Scene {
  constructor() {
    super({ key: 'FreeRT' })
    this._state = states.INSTRUCT
    this.entering = true
  }
  preload() {}
  create(today) {
    this.state = states.INSTRUCT
    let height = this.game.config.height
    let center = height / 2
    let today_config = today.today_config
    let today_data = today.today_data
    this.conf = today_config
    this.task_config = today_config.day_sched.shift()
    // copy the task data
    this.task_data = JSON.parse(JSON.stringify(this.task_config))
    this.task_data.start_time = JSON.stringify(new Date())
    this.task_data.responses = []
    this.today_data = today_data // all of the data for today
    this.today_data.push(this.task_data)
    console.log(this.task_data)
    // now task_config has everything we need for this section
    // .stim_type, .swap, .trial_order, (.prep_times for timed response)
    this.correctness = new CorrectFeedback(this, center, center, 1)
    this.correctness.visible = false
    // this.correctness.feedback(1/0)

    this.title = this.add
      .text(center, 120, 'Free Response', {
        fontFamily: 'Arial',
        fontStyle: 'italic',
        fontSize: 50,
        color: '#dddddd',
        stroke: '#444444',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
    this.instruct_text = TypingText(this, center, center, '', {
      fontFamily: 'Verdana',
      fontSize: 30,
      wrap: {
        mode: 'word',
        width: 400,
      },
    }).setOrigin(0.5, 0.5)
    this.instruct_text.visible = false
    this.any_start = this.add
      .rexBBCodeText(center, height - 200, 'Press any key to start.', {
        fontFamily: 'Verdana',
        fontSize: 40,
        padding: {
          x: 32,
          y: 32,
        },
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
    this.any_start.visible = false
    this.kf = new KeyFeedback(this, center, height - 100, 1)

    this.target = this.add.rectangle(center, center, 100, 100).setStrokeStyle(2, 0xffffff)
    this.target.visible = false

    this.intro_target = new KeyStim(this, center, center, 1)
    this.intro_target.visible = false

    this.countdown = this.add
      .text(center, center - 150, '', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 140,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
    this.countdown.scale = 0.5
    this.trial_counter = 0
    this.consider_these = []

    this.tab = this.add
      .text(center, center - 150, 'Take a break. Wait at least 10 seconds,\nthen press any key to continue.', {
        fontFamily: 'Verdana',
        fontSize: 30,
        wrap: {
          mode: 'word',
          width: 400,
        },
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
    this.tab.visible = false

    let end_of_section = this.add
      .text(center, center, 'Good Job!', {
        fontSize: 160,
        fontFamily: 'Arial',
        fontStyle: 'italic',
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false)
    let bmz = this.plugins.get('rexBitmapZonePlugin').add(end_of_section)
    let particles = this.add.particles('flares', 'green').setPosition(end_of_section.x, end_of_section.y)
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
    this.emitter.visible = false
  }
  update() {
    switch (this.state) {
      case states.INSTRUCT:
        if (this.entering) {
          this.entering = false
          this.instruct_text.visible = true
          this.instruct_text.start(mass_txt, 10)
          this.instruct_text.typing.once('complete', () => {
            this.any_start.visible = true
            this.input.keyboard.once('keydown', (evt) => {
              this.tweens.add({
                targets: [this.title, this.instruct_text, this.any_start],
                alpha: { from: 1, to: 0 },
                duration: 2000,
                onComplete: () => {
                  this.state = states.COUNTDOWN
                },
              })
            })
          })
        }
      case states.COUNTDOWN:
        if (this.entering) {
          this.entering = false
          let tl = this.tweens.createTimeline()
          this.countdown.scale = 0.5
          this.countdown.visible = true
          tl.add({
            targets: this.countdown,
            onStart: () => {
              this.countdown.text = '3'
              this.countdown.setColor('#ff007d')
            },
            scale: 1,
            yoyo: true,
            duration: 500,
            ease: 'Back',
          })
          tl.add({
            targets: this.countdown,
            onStart: () => {
              this.countdown.text = '2'
              this.countdown.setColor('#bd5e00')
            },
            scale: 1,
            yoyo: true,
            duration: 500,
            ease: 'Back',
          })
          tl.add({
            targets: this.countdown,
            onStart: () => {
              this.countdown.text = '1'
              this.countdown.setColor('#009800')
            },
            scale: 1,
            yoyo: true,
            duration: 500,
            ease: 'Back',
          })
          tl.add({
            targets: this.countdown,
            onStart: () => {
              this.countdown.text = '!'
              this.countdown.setColor('#00a0ff')
            },
            scale: 1,
            yoyo: true,
            duration: 500,
            ease: 'Back',
            onComplete: () => {
              this.countdown.visible = false
              this.state = states.MAIN_LOOP
              // after done,
              for (let key of ['H', 'U', 'I', 'L']) {
                this.input.keyboard
                  .addKey(key)
                  .on('down', (evt) => {
                    let foo = evt.originalEvent.key
                    let dat = {
                      key: foo,
                      timestamp: evt.originalEvent.timeStamp,
                      type: 'press',
                      trial: this.trial_counter,
                      trial_start_time: this.trial_start,
                    }
                    this.trial_resps.push(dat) // all data ends up in trial_resps
                    if (!this.locked) {
                      this.consider_these.push(dat)
                    }
                    this.kf.press(foo)
                  })
                  .on('up', (evt) => {
                    let foo = evt.originalEvent.key
                    this.trial_resps.push({
                      key: foo,
                      timestamp: evt.originalEvent.timeStamp,
                      type: 'release',
                      trial: this.trial_counter,
                      trial_start_time: this.trial_start,
                    })
                    this.kf.release(foo)
                  })
              }
            },
          })
          tl.play()
        }
      case states.MAIN_LOOP:
        if (this.entering) {
          this.entering = false
          let key = this.task_config.trial_order[this.trial_counter]
          this.trial_key = key
          if (this.task_config.stim_type === 'color') {
            this.target.visible = true
            let col = Phaser.Display.Color.HexStringToColor(this.conf.map[key][this.task_config.swap])
            this.target.setFillStyle(col._color)
          } else {
            this.intro_target.visible = true
            this.intro_target.fill(key)
          }
          this.trial_resps = []
          this.consider_these = []
          this.locked = false
          this.trial_start = this.game.loop.now
          this.tries = 0
          // this.game.loop.now is trial start time (or should the next frame be?)
          // extract the correct colors & response,
          // and set up the input devices
        }
        if (this.consider_these.length > 0) {
          this.locked = true
          this.correctness.visible = true
          if (this.trial_key === this.consider_these[0].key) {
            // correct!
            this.task_data.responses.push({
              correct: true,
              target: this.trial_key,
              key: this.consider_these[0].key,
              timestamp: this.consider_these[0].timestamp,
              trial: this.trial_counter,
              trial_start_time: this.trial_start,
              tries: this.tries,
            })
            console.log(this.task_data)
            this.correctness.feedback(1)
            this.time.delayedCall(300, () => {
              this.intro_target.clear()
              this.target.setFillStyle(0x777777)
              this.correctness.feedback(null)
            })
            this.time.delayedCall(500, () => {
              this.trial_counter++
              if (this.trial_counter >= this.task_config.trial_order.length) {
                // exit
                this.state = states.END_SECTION
                this.locked = true
              } else if (this.trial_counter % 5 == 0) {
                this.state = states.TAKE_A_BREAK
                this.locked = true
              }
              this.locked = false
              this.entering = true
            })
          } else {
            this.task_data.responses.push({
              correct: false,
              target: this.trial_key,
              key: this.consider_these[0].key,
              timestamp: this.consider_these[0].timestamp,
              trial: this.trial_counter,
              trial_start_time: this.trial_start,
              tries: this.tries,
            })
            this.tries++
            this.correctness.feedback(0)
            this.intro_target.alpha = 0.3
            this.target.alpha = 0.3
            this.time.delayedCall(1000, () => {
              this.correctness.feedback(null)
              this.locked = false
              this.intro_target.alpha = 1
              this.target.alpha = 1
            })
            // wrong
          }
          this.consider_these = []
        }

      case states.TAKE_A_BREAK:
        if (this.entering) {
          this.entering = false
          this.tab.visible = true
          this.tab.alpha = 1
          this.input.enabled = false
          this.input.keyboard.removeAllKeys()
          this.time.delayedCall(10000, () => {
            this.input.enabled = true
            this.any_start.alpha = 1
            this.any_start.visible = true
            this.input.keyboard.once('keydown', (evt) => {
              this.tweens.add({
                targets: [this.tab, this.any_start],
                alpha: { from: 1, to: 0 },
                duration: 2000,
                onComplete: () => {
                  this.state = states.COUNTDOWN
                },
              })
            })
          })
        }
      case states.END_SECTION:
        if (this.entering) {
          this.entering = false
          this.target.visible = false
          this.intro_target.visible = false
          this.emitter.visible = true
          this.time.delayedCall(5000, () => {
            if (this.conf.day_sched.length === 0) {
              console.log('Done! Redirect to end...')
              this.scene.start('EndScene', this.today_data)
            } else {
              console.log('Exiting freeRT.')
              this.scene.start(this.conf.day_sched[0].task, {
                today_config: this.conf,
                today_data: this.today_data,
              })
            }
          })
        }
    }
  }
  get state() {
    return this._state
  }

  set state(newState) {
    if (this.state != newState) {
      this.entering = true
      this._state = newState
    }
  }
}
