// a nice message, a summary, increment the day counter
export default class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' })
  }
  create(today_data) {
    console.log('Data today:')
    console.log(today_data)
  }
}
