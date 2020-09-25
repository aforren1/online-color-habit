// gist of this free RT task: show instruction screen (static, maybe flashing text)
// When [enter] to start, unveil the playing arena and do 3-2-1-start
// show stim immediately. if good, 300ms feedback & onward. if wrong, 1s feedback and repeat
// take-a-break scene pauses for at least 15 sec (maybe showing today's progress? i.e. block completion times)
//
import CorrectFeedback from '../objects/perry'
import { TypingText } from '../objects/typingtext'
import KeyFeedback from '../objects/keys'

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
    this.task_config = this.conf.day_sched.shift()
    // copy the task data
    this.task_data = JSON.parse(JSON.stringify(this.task_config))
    this.task_data.start_time = JSON.stringify(new Date())
    this.today_data = today_data
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
    this.target.visible = false // this.target.setFillStyle(0xAAAAAA)

    this.countdown = this.add
      .text(center, center - 150, '', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 100,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
    this.countdown.scale = 0.5
  }
  update() {
    switch (this.state) {
      case states.INSTRUCT:
        if (this.entering) {
          this.entering = false
          this.instruct_text.visible = true
          this.instruct_text.start(mass_txt, 50)
          this.instruct_text.typing.once('complete', () => {
            this.any_start.visible = true
            this.input.keyboard.once('keydown', (evt) => {
              this.tweens.add({
                targets: [this.title, this.instruct_text],
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
              this.countdown.color = 0xff007d
            },
            scale: 1,
            yoyo: true,
            duration: 500,
          })
          tl.add({
            targets: this.countdown,
            onStart: () => {
              this.countdown.text = '2'
              this.countdown.color = 0xbd5e00
            },
            scale: 1,
            yoyo: true,
            duration: 500,
          })
          tl.add({
            targets: this.countdown,
            onStart: () => {
              this.countdown.text = '1'
              this.countdown.color = 0x009800
            },
            scale: 1,
            yoyo: true,
            duration: 500,
          })
          tl.add({
            targets: this.countdown,
            onStart: () => {
              this.countdown.text = '!'
              this.countdown.color = 0x00a0ff
            },
            scale: 1,
            yoyo: true,
            duration: 500,
            onComplete: () => {
              this.countdown.visible = false
              this.state = states.END_SECTION
            },
          })
          tl.play()
        }
      case states.END_SECTION:
        if (this.entering) {
          this.entering = false
          if (this.conf.day_sched.length === 0) {
            console.log('Done! Redirect to end...')
            this.scene.start('EndScene', this.today_data)
          } else {
            console.log('Exiting freeRT.')
            this.scene.start(this.conf.day_sched[0].task, { today_config: this.conf, today_data: this.today_data })
          }
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
