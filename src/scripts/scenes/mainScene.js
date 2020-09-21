

this.scale.on('leavefullscreen', function () {
    this.scene.pause();
    this.scene.launch('pauseScene');
}, this);
// just in case, pausing when focus lost
this.game.events.on('hidden', function () {
    this.scene.pause();
    this.scene.launch('pauseScene');
}, this);