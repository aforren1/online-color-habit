// gist of this free RT task: show instruction screen (static, maybe flashing text)
// When [enter] to start, unveil the playing arena and do 3-2-1-start
// show stim immediately. if good, 300ms feedback & onward. if wrong, 1s feedback and repeat
export default class FreeRT extends Phaser.Scene {
  constructor() {
    super({ key: 'FreeRT' })
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
      console.log('Exiting freeRT.')
      console.log(this.conf)
      this.scene.start(this.conf.day_sched[0].task, this.conf)
    }
  }
}
