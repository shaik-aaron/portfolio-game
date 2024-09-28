import kaplay from "kaplay";

kaplay();

//Loading Sprites

loadSprite("playerRunning", "sprites/Run.png", {
  sliceX: 8,
  sliceY: 0,
  anims: {
    run: { from: 0, to: 7, loop: true },
  },
});

loadSprite("playerRunningLeft", "sprites/Run.png", {
  sliceX: 8,
  sliceY: 0,
  flipX: true,
  anims: {
    run: { from: 0, to: 7, loop: true },
  },
});

loadSprite("floor", "sprites/tiles.png", {
  sliceX: 3,
  sliceY: 5,
});

loadSprite("background", "sprites/background.png", {
  sliceX: 3,
  sliceY: 5,
});

loadSprite("playerIdle", "sprites/Idle.png", {
  sliceX: 5,
  sliceY: 0,
  anims: {
    idle: { from: 0, to: 4, loop: true },
  },
});

loadSprite("playerJumping", "sprites/Jump.png", {
  sliceX: 7,
  sliceY: 0,
  anims: {
    jumping: { from: 0, to: 6, loop: true },
  },
});

loadSprite("scroll", "sprites/Scroll.png");

//Main game scene

scene("game", () => {
  //Setting layers
  layers(["background", "floor"], "floor");

  setGravity(1200);

  const user = add([
    sprite("playerIdle", {
      anim: "idle", // the animation to play at the start
    }),
    pos(300, 300),
    area(),
    body(),
  ]);

  let isRunning = false;
  let isJumping = false;

  // Handle running movement
  onKeyDown("right", () => {
    if (!isRunning && !isJumping) {
      user.use(sprite("playerRunning")); // switch to running sprite
      user.play("run"); // play run animation only once
      isRunning = true; // flag to prevent resetting the sprite every frame
    }
    user.move(300, 0); // move to the right
  });

  onKeyDown("left", () => {
    if (!isRunning && !isJumping) {
      user.use(sprite("playerRunningLeft")); // switch to running sprite
      user.play("run"); // play run animation only once
      isRunning = true; // flag to prevent resetting the sprite every frame
    }
    user.move(-300, 0);
    user.flipX = true; // flip player
  });

  onKeyRelease(["right", "left"], () => {
    if (!isJumping) {
      user.use(sprite("playerIdle")); // switch back to idle sprite
      user.play("idle"); // play idle animation
      isRunning = false; // reset running flag
    }
  });

  // Jump action
  onKeyPress("space", () => {
    if (!isJumping) {
      user.use(sprite("playerJumping")); // switch to jump sprite
      user.play("jumping"); // play jump animation
      user.jump(600); // jump with velocity
      isJumping = true;
    }
  });

  user.onGround(() => {
    if (isJumping) {
      // Check if the player is still moving
      if (isKeyDown("right")) {
        user.use(sprite("playerRunning"));
        user.play("run");
      } else if (isKeyDown("left")) {
        user.use(sprite("playerRunningLeft"));
        user.play("run");
      } else {
        user.use(sprite("playerIdle")); // switch back to idle sprite when not moving
        user.play("idle");
      }
      isJumping = false;
    } // reset jumping flag
  });

  //Creating background and floor

  for (let i = 0; i < 12; i++) {
    add([
      sprite("floor"),
      outline(4),
      pos(171 * i, height()),
      anchor("botleft"),
      area(),
      body({ isStatic: true }),
      color(127, 200, 255),
    ]);
  }

  add([
    sprite("floor"),
    outline(4),
    pos(width() - 160, 650),
    anchor("botleft"),
    area(),
    body({ isStatic: true }),
    color(127, 200, 255),
  ]);

  for (let x = 0; x < width(); x += 171) {
    for (let y = 0; y < height(); y += 90) {
      add([
        sprite("background"),
        outline(4),
        pos(x, y),
        layer("background"),
        fixed(),
        color(25, 75, 125),
      ]);
    }
  }

  // Define a variable to store the "Press E" text
  let pressText = null;
  let black_box = null;
  let isNearResume = false;

  // Add the resume (scroll) sprite
  const resume = add([
    sprite("scroll"),
    outline(8),
    pos(width() - 50, 550),
    anchor("botleft"),
    scale(2),
    body({ isStatic: true }),
    color(127, 200, 255),
    area(), // Add an area for detecting proximity
  ]);

  // Continuously check if the player is near the resume
  onUpdate(() => {
    // Check if player is near the resume (within a certain distance)
    if (user.pos.dist(resume.pos) < 200) {
      // 100 units away
      if (!pressText) {
        // Add the "Press E" text if it's not already showing
        black_box = add([
          rect(width(), 120), // Rectangle width and height
          pos(0, height() - 120), // Position below the player
          outline(4, rgb(255, 255, 255)), // White border
          color(0, 0, 0), // Black background
          fixed(), // Fixed to the screen (follows the camera)
        ]);

        // Add the "Press E to view resume" text separately over the background
        pressText = add([
          text("Press E to view resume", {
            size: 22, // Text size
          }),
          pos(5, height() - 90), // Position the text within the black rectangle
          fixed(), // Make sure text follows the camera
          color(255, 255, 255), // White text color
        ]);

        isNearResume = true;
      }
    } else {
      // Remove the text if the player moves away
      if (pressText) {
        destroy(pressText);
        destroy(black_box);
        pressText = null;
        black_box = null;
        isNearResume = false;
      }
    }
  });

  onKeyPress("e", () => {
    if (user.pos.dist(resume.pos) < 200) {
      // Open the resume link when "E" is pressed
      window.open(
        "https://docs.google.com/document/d/1_kEWqLq6rJzve_juZtS8TxKMIkztWjHwwFSMYH2t_ig/edit?usp=sharing ",
        "_blank"
      );
    }
  });
});

go("game");
