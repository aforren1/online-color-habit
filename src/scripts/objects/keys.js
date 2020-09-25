export default class KeyFeedback extends Phaser.GameObjects.Container {
  constructor(scene, x, y, alpha) {
    let boxes = {
      h: scene.add.rectangle(-120, 0, 60, 60, 0xffffff).setStrokeStyle(4, 0xffffff),
      u: scene.add.rectangle(-40, 0, 60, 60, 0xffffff).setStrokeStyle(4, 0xffffff),
      i: scene.add.rectangle(40, 0, 60, 60, 0xffffff).setStrokeStyle(4, 0xffffff),
      l: scene.add.rectangle(120, 0, 60, 60, 0xffffff).setStrokeStyle(4, 0xffffff),
    }
    for (let prop in boxes) {
      boxes[prop].isFilled = false
    }
    let extras = { fontFamily: 'Georgia', fontSize: 60, color: '#dddddd', align: 'center' }
    let h = scene.add.text(-120, 0, 'H', extras).setOrigin(0.5, 0.5)
    let u = scene.add.text(-40, 0, 'U', extras).setOrigin(0.5, 0.5)
    let i = scene.add.text(40, 0, 'I', extras).setOrigin(0.5, 0.5)
    let l = scene.add.text(120, 0, 'L', extras).setOrigin(0.5, 0.5)
    super(scene, x, y, [boxes.h, boxes.u, boxes.i, boxes.l, h, u, i, l])
    this.alpha = alpha
    scene.add.existing(this)
    this.boxes = boxes
  }

  press(key) {
    this.boxes[key.toLowerCase()].isFilled = true
  }
  release(key) {
    this.boxes[key.toLowerCase()].isFilled = false
  }
}
