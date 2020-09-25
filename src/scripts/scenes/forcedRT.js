import CorrectFeedback from '../objects/perry'
import { KeyFeedback } from '../objects/keys'
import { TypingText } from '../objects/typingtext'

import { Enum } from '../utils/enum'
import log from '../utils/logger'

const states = Enum([
  'INSTRUCT', // show text instructions (bb typing text style, for emphasis)
  'COUNTDOWN', // countdown (3-2-1-go),
  'MAIN_LOOP', // show box immediately. Wait for resp-- immediate feedback with response. If correct, checkmark + fireworks? Otherwise, X for 1s. If 100 trials elapsed & still more to go, take a break. Otherwise, end section.
  'TAKE_A_BREAK', // min 15s wait, show completion time feedback? and wait for huil to continue
  'END_SECTION', // pretty much like TAKE_A_BREAK, but more final
])

const texts = {
  practice: [
    'In this [color=red]Forced Response[/color] section, we are going to practice timing in a different task. Press the [color=yellow]H[/color] key when the square intersects with the line running along the bottom of the screen. You will only need to use the [color=yellow]H[/color] key in this task.',
  ],
  color: [
    'In this [color=red]Forced Response[/color] section, we will test how well you know the color-key combinations. The square will travel down the screen, and change to one of the four colors at some point during movement. Press the key corresponding to that color when the square intersects with the line. [i]Some may be very difficult, but do not be afraid of guessing![/i] Always try to get the timing correct, and make a response every trial.',
  ],
}
// assume display is always 800 px (which it should be, we always fix it)
//
const target_start = 100 // 0.4 in drop3, 0.35 in drop2
const line_pos = 700 // -0.35 in both
const t_max = 900 // 900 ms to travel from start to end
const speed = (line_pos - target_start) / t_max // pixels/sec
const overshoot = 1000
const t_overshoot = (overshoot - line_pos) / speed
// +/- 50 ms tolerance (or should we be more stringent?)
const timing_tol = 50
const d_min = speed * (t_max - timing_tol)
const d_max = speed * (t_max + timing_tol)
const target_height = Math.ceil(d_max - d_min) // might be off by a pixel ;)

export default class ForcedRT extends Phaser.Scene {
  constructor() {
    super({ key: 'ForcedRT' })
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
    this.task_data.map = today_config.map
    this.task_data.responses = []
    this.today_data = today_data // all of the data for today
    this.today_data.push(this.task_data)
    console.log(this.conf)
    console.log(this.task_data)
    // now task_config has everything we need for this section
    // .stim_type, .swap, .trial_order, (.prep_times for timed response)
    this.correctness = new CorrectFeedback(this, center, center, 1)
    this.correctness.visible = false
    // this.correctness.feedback(1/0)

    this.title = this.add
      .text(center, 120, 'Forced Response', {
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
      fontSize: 20,
      wrap: {
        mode: 'word',
        width: 500,
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
    this.kf = new KeyFeedback(this, center + 220, center + 350, 1)

    this.line = this.add.rectangle(center, line_pos, height, 2, 0xffffff)
    this.line.visible = false
    // remember to default back to gray
    this.target = this.add
      .rectangle(center, target_start, target_height, target_height, 0x777777)
      .setStrokeStyle(2, 0xffffff)
    this.target.visible = false

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

    this.explosion = this.add.particles('flares', 'green').createEmitter({
      x: center,
      blendMode: 'ADD',
      y: line_pos,
      speed: { min: 100, max: 400 },
      angle: { min: 0, max: 360 },
      gravityY: 200,
      alpha: { start: 1, end: 0 },
      scale: { start: 0.1, end: 0.15 },
      active: false,
      delay: { min: 0, max: 100 },
    })
  }
  update() {
    switch (this.state) {
      case states.INSTRUCT:
        if (this.entering) {
          this.entering = false
          this.instruct_text.visible = true
          //
          let inst_txt = texts[this.task_config.stim_type]
          this.instruct_text.start(inst_txt, 10)
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
          this.target.visible = true
          this.target.y = target_start
          this.line.visible = true
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
          this.consider_these = []
          this.entering = false
          this.target.visible = true
          let key = this.task_config.trial_order[this.trial_counter]
          let prep_time = this.task_config.prep_times[this.trial_counter] * 1000
          let vis_time = t_max - prep_time
          this.prep_time = prep_time
          this.trial_key = key
          this.trial_start = this.game.loop.now

          // make timelines for tweens
          this.target.y = target_start
          this.target.setFillStyle(0x777777)
          let tl = this.tweens.createTimeline()
          tl.add({
            delay: 250,
            targets: this.target,
            scaleY: 0.3,
            ease: 'Power1',
            yoyo: true,
            duration: 200,
          })
          tl.add({
            targets: this.target,
            y: line_pos,
            ease: 'Linear',
            duration: t_max,
          })
          tl.add({
            targets: this.target,
            y: overshoot,
            ease: 'Linear',
            duration: t_overshoot, // the *real* max trial duration
            onComplete: () => {
              // push a garbage
              this.consider_these.push({
                key: null,
                press_time: null,
                type: null,
                trial: this.trial_counter,
                trial_start_time: this.trial_start,
              })
            },
          })
          let color = 0x777777
          if (this.task_config.stim_type === 'color') {
            color = Phaser.Display.Color.HexStringToColor(this.conf.map[key][this.task_config.swap])._color
          }

          let tl2 = this.tweens.createTimeline()
          tl2.add({
            targets: this.target,
            x: 400, // no-op
            onComplete: () => {
              this.target.setFillStyle(color)
            },
            duration: 250 + 400 + vis_time,
          })
          tl.play()
          tl2.play()
          this.tl = tl
          this.trial_resps = []
          this.consider_these = []
          this.locked = false
          // this.game.loop.now is trial start time (or should the next frame be?)
          // extract the correct colors & response,
          // and set up the input devices
        }
        if (this.consider_these.length > 0 && !this.locked) {
          this.locked = true
          this.correctness.visible = true
          let resp = this.consider_these[0].key
          let press_time = this.consider_these[0].timestamp - this.trial_start
          let correct = this.trial_key === resp
          if (this.task_config.stim_type === 'practice') {
            // during practice, *any* response is fine
            correct = resp !== null
          }
          let ideal_time = 250 + 400 + t_max
          console.log(`ideal time: ${ideal_time}, press_time: ${press_time}`)
          let good_timing =
            press_time >= ideal_time - timing_tol && press_time <= ideal_time + timing_tol ? true : false
          this.task_data.responses.push({
            correct: correct,
            good_timing: good_timing,
            target: this.trial_key,
            key: resp,
            press_time: press_time, // should just call press_time
            trial: this.trial_counter,
            trial_start_time: this.trial_start,
            prep_time: this.prep_time,
            actual_prep_time: press_time - 250 - 400 - t_max + this.prep_time,
          })
          this.correctness.feedback(correct && good_timing)
          if (correct && good_timing) {
            this.explosion.active = true
            this.explosion.explode(200)
          }
          if (good_timing) {
            this.target.visible = false
          }
          this.tl.stop()
          this.target.y = target_start + speed * (press_time - 250 - 400)
          this.time.delayedCall(300, () => {
            this.target.setFillStyle(0x777777)
            this.correctness.feedback(null)
          })
          this.time.delayedCall(500, () => {
            // TODO: add criterion
            this.target.visible = false
            this.trial_counter++
            if (this.trial_counter >= this.task_config.trial_order.length) {
              // exit
              this.state = states.END_SECTION
              this.locked = true
            } else if (this.trial_counter % 100 == 0) {
              this.state = states.TAKE_A_BREAK
              this.locked = true
            }
            this.locked = false
            this.entering = true
          })
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
          this.line.visible = false
          this.emitter.visible = true
          this.kf.visible = false
          this.input.keyboard.removeAllKeys()
          this.time.delayedCall(5000, () => {
            if (this.conf.day_sched.length === 0) {
              console.log('Done! Redirect to end...')
              this.scene.start('EndScene', this.today_data)
            } else {
              console.log('Exiting ForcedRT.')
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
