// it's wrong and it's right

export default class CorrectFeedback extends Phaser.GameObjects.Container {
  constructor(scene, x, y, alpha) {
    let extras = { fontFamily: 'Georgia', fontSize: 160, color: '#ffffff', align: 'center' }
    let left = scene.add.text(-300, 0, '', extras).setOrigin(0.5, 0.5)
    let right = scene.add.text(300, 0, '', extras).setOrigin(0.5, 0.5)
    super(scene, x, y, [left, right])
    this.left = left
    this.right = right
    this.alpha = alpha
    scene.add.existing(this)
  }

  feedback(good) {
    if (good !== null) {
      this.left.text = this.right.text = good ? '✔' : '✘'
    } else {
      this.left.text = this.right.text = ''
    }
  }
}
