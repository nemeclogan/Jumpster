
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var keys;
var score = 0;
var gameOver = false;
var scoreText;

window.addEventListener('load', function() {
    var game = new Phaser.Game(config);
});

function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('chicken', 'assets/ChickenLeg.png');
    this.load.image('fish', 'assets/Fish.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('ground1', 'assets/ground.png');

    this.load.spritesheet('player1', 'assets/CatIdle.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player1run', 'assets/CatWalk.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player1runL', 'assets/CatWalkL.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player1hurt', 'assets/CatHurt.png', { frameWidth: 48, frameHeight: 48 });

    this.load.spritesheet('player2', 'assets/DogIdle.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player2run', 'assets/DogWalk.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player2runL', 'assets/DogWalkL.png', { frameWidth: 48, frameHeight: 48 });
}

function create ()
{

    this.cameras.main.setBounds(0, 0, 800, 600);

    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground1').setScale(2).refreshBody();

    //  Now let's create some ledges
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // The player and its settings
    playerA = this.physics.add.sprite(400, 450, 'player1');
    playerB = this.physics.add.sprite(100, 450, 'player2');


    //  Player physics properties. Give the little guy a slight bounce.
    playerA.setBounce(0.2);
    playerA.setCollideWorldBounds(true);
    playerB.setBounce(0.2);
    playerB.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    // Player 1
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player1runL', { start: 0, end: 6 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'player1', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player1run', { start: 1, end: 6 }),
        frameRate: 10,
        repeat: -1
    });

   // this.anims.create({
    //    key: 'hurt',
    //    frames: [ {key: 'player1hurt', frame: 2} ],
    //    freameRate:20
    //})

    this.anims.create({
        key: 'idle',
        frames: [ { key: 'player1', frame: 4 } ],
        frameRate: 20
    });

    // Player 2
    this.anims.create({
        key: 'left2',
        frames: this.anims.generateFrameNumbers('player2runL', { start: 0, end: 6 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn2',
        frames: [ { key: 'player2', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right2',
        frames: this.anims.generateFrameNumbers('player2run', { start: 1, end: 6 }),
        frameRate: 10,
        repeat: -1
    });

   // this.anims.create({
    //    key: 'hurt2',
    //    frames: [ {key: 'player2hurt', frame: 2} ],
    //    freameRate:20
   // })

    this.anims.create({
        key: 'idle2',
        frames: [ { key: 'player2', frame: 4 } ],
        frameRate: 20
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('W,A,D');

    //  Some food to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
   
   // chicken for dog
    chickens = this.physics.add.group({
        key: 'chicken',
        repeat: 6,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    chickens.children.iterate(function (child) {

        //  Give each chicken a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    // fish for cat
    fishes = this.physics.add.group({
        key: 'fish',
        repeat: 5,
        setXY: { x:400, y:0, stepX: 70}
    });

    fishes.children.iterate(function (child){
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Collide the players and the food with the platforms
    this.physics.add.collider(playerA, platforms);
    this.physics.add.collider(playerB, platforms);
    this.physics.add.collider(chickens, platforms);
    this.physics.add.collider(fishes, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the chickens and fishes, if they do call the collectFood function
    this.physics.add.overlap(playerA, fishes, collectFood, null, this);
    this.physics.add.overlap(playerB, chickens, collectFood, null, this);
    this.physics.add.collider(playerA, bombs, hitBomb, null, this);
    this.physics.add.collider(playerB, bombs, hitBomb, null, this);
}

function update ()
{
    if (gameOver)
    {
        location.reload(true);
        return;
    }

    // If the player is not moving, play the 'idle' animation
    // Player 1
    if (playerA.body.velocity.x === 0 && playerA.body.velocity.y === 0) {
        playerA.anims.play('idle', true);
    }
    if (playerB.body.velocity.x === 0 && playerB.body.velocity.y === 0) {
        playerA.anims.play('idle2', true);
    }

    if (cursors.left.isDown)
    {
        playerA.setVelocityX(-160);

        playerA.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        playerA.setVelocityX(160);

        playerA.anims.play('right', true);
    }
    else
    {
        playerA.setVelocityX(0);

        // If the player is not moving left or right, play the 'idle' animation
        if (playerA.body.velocity.y === 0) {
            playerA.anims.play('idle', true);
        } else {
            playerA.anims.play('turn');
        }
    }

    if (cursors.up.isDown && playerA.body.touching.down)
    {
        playerA.setVelocityY(-330);
    }
    // Player 2
    if (keys.A.isDown)
    {
        playerB.setVelocityX(-160);

        playerB.anims.play('left2', true);
    }
    else if (keys.D.isDown)
    {
        playerB.setVelocityX(160);

        playerB.anims.play('right2', true);
    }
    else
    {
        playerB.setVelocityX(0);

        // If the player is not moving left or right, play the 'idle' animation
        if (playerB.body.velocity.y === 0) {
            playerB.anims.play('idle2', true);
        } else {
            playerB.anims.play('turn2');
        }
    }

    if (keys.W.isDown && playerB.body.touching.down)
    {
        playerB.setVelocityY(-330);
    }
}


function collectFood (playerA, chicken)
{
    chicken.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (chickens.countActive(true) === 0 && fishes.countActive(true) === 0)
    {
        //  A new batch of food to collect
        chickens.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });
        fishes.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });
       
        var x = (playerA.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}



function hitBomb (playerA, bomb)
{
    playerA.anims.play('idle', true);
    playerB.anims.play('idle2', true);
    this.physics.pause();

    playerA.setTint(0xff0000);
    playerB.setTint(0xff0000);
    playerA.setVelocity(0, 0);
    playerB.setVelocity(0, 0);

    gameOver = true;
}