class endScene extends Phaser.Scene {
    constructor() {
      // Name this scene
      super("gameOver");
    }

    create() {
        // Load background
        this.background = this.add.tileSprite(0, 0, config.width, config.height, "background");
        this.background.setOrigin(0, 0);
        // Add the ships as sprites
        this.ship1 = this.add.sprite(config.width / 2 - 50, config.height / 2, "ship");
        this.ship2 = this.add.sprite(config.width / 2, config.height / 2, "ship2");
        this.ship3 = this.add.sprite(config.width / 2 + 50, config.height / 2, "ship3");
        // Add player
        this.player = this.physics.add.sprite(config.width / 2 - 8, config.height - 64, "player");
        // Add text at the top
        this.add.text(20, 20, "Playing Game", {
          font: "25px Arial",
          fill: "yellow",
        });


}