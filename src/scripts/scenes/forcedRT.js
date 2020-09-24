export default class ForcedRT extends Phaser.Scene {
  constructor() {
    super({ key: 'ForcedRT' })
  }
  preload() {}
  create(today_config) {
    this.conf = today_config
    this.task_config = this.conf.day_sched.shift()
  }
  update() {
    console.log(this.task_config)
    if (this.conf.day_sched.length === 0) {
      console.log('Done! Redirect to end...')
      this.scene.start('EndScene')
    } else {
      console.log('Exiting forcedRT.')
      console.log(this.conf)
      this.scene.start(this.conf.day_sched[0].task, this.conf)
    }
  }
}
