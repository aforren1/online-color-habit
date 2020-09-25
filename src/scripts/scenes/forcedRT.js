import CorrectFeedback from '../objects/perry'

import { Enum } from '../utils/enum'
import log from '../utils/logger'

const states = Enum([
  'INSTRUCT', // show text instructions (bb typing text style, for emphasis)
  'BEGIN', // countdown (3-2-1-go),
  'MAIN_LOOP', // show box immediately. Wait for resp-- immediate feedback with response. If correct, checkmark + fireworks? Otherwise, X for 1s. If 100 trials elapsed & still more to go, take a break. Otherwise, end section.
  'TAKE_A_BREAK', // min 15s wait, show completion time feedback? and wait for huil to continue
  'END_SECTION', // pretty much like TAKE_A_BREAK, but more final
  'FADE_OUT',
])

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
    this.task_config = this.conf.day_sched.shift()
    // copy the task data
    this.task_data = JSON.parse(JSON.stringify(this.task_config))
    this.task_data.start_time = JSON.stringify(new Date())
    this.task_data.start_ms = performance.now()
    this.today_data = today_data
    this.today_data.push(this.task_data)
    // now task_config has everything we need for this section
    // .stim_type, .swap, .trial_order, (.prep_times for timed response)
    // let foob = new CorrectFeedback(this, center, center, 1)
    // foob.feedback(0)
  }
  update() {
    console.log(this.task_config)
    this.task_data.end_ms = performance.now()
    if (this.conf.day_sched.length === 0) {
      console.log('Done! Redirect to end...')
      this.scene.start('EndScene', this.today_data)
    } else {
      console.log('Exiting forcedRT.')
      this.scene.start(this.conf.day_sched[0].task, { today_config: this.conf, today_data: this.today_data })
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
