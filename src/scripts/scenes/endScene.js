import postData from '../utils/postdata'
import { onBeforeUnload } from '../game'
// a nice message, a summary, increment the day counter
export default class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' })
  }
  create(today_data) {
    let height = this.game.config.height
    let center = height / 2

    // increment day
    let day = parseInt(localStorage['day'])
    day++
    localStorage['day'] = day
    let txt = 'Done for today, see you tomorrow!\nFeel free to close this window.'
    if (day > 5) {
      txt = "You're completely finished!\nThanks for participating."
    }
    window.removeEventListener('beforeunload', onBeforeUnload)
    this.add
      .text(center, center, txt, {
        fontFamily: 'Verdana',
        fontSize: 30,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    console.log('Data today:')
    let alldata = { config: this.game.user_config, data: today_data }
    console.log(alldata)

    Promise.all(postData(alldata)).then((values) => {
      if (values[0] !== 500 || values[1] !== 500) {
      } else {
        log.error('Forwarding failed HARD')
      }
    })
    this.scale.stopFullscreen()
  }
}
