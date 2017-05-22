/**
 * Created by Dries Marzougui
 */
function breakout(args) {

    let $canvas = $(args.selector)[0];
    let ctx = $canvas.getContext("2d");
    let requestId;

    // Classes for the used components

    // Superclass for every component
    class Shape {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    // The class that represents the ball
    class Ball extends Shape {
        constructor(x, y, radius, speed, direction, color) {
            super(x, y);
            this.radius = radius;
            this.speed = speed;
            this.direction = direction;
            this.color = color;
        }
    }

    // The class that represents the paddle
    class Paddle extends Shape {
        constructor(x, y, dx, height, width, color) {
            super(x, y);
            this.dx = dx;
            this.height = height;
            this.width = width;
            this.color = color;
        }
    }

    // The class that represents a brick
    class Brick extends Shape {
        constructor(x, y, status) {
            super(x, y);
            this.status = status;
        }
    }

    // The class that represents the 'score' or 'lives' text
    class Info extends Shape {
        constructor(x, y, count, font, color, text) {
            super(x, y);
            this.count = count;
            this.font = font;
            this.color = color;
            this.text = text;
        }
    }

    // Currently shown objects
    let color;
    let ball;
    let paddle;
    let score;
    let lives;
    let allBricks;

    // Function that initializes the objects and starts the game
    // Params: number of rows and columns
    function start(rows, cols) {
        // Start song
        playSong();
        // If there is a (previous) game running, stop it
        if (requestId) {
            cancelAnimationFrame(requestId);
            requestId = undefined;
        }

        // Initialize objects
        color = randomColorGenerator();
        score = new Info(8, 20, 0, "16px Arial", color, "Score: ");
        lives = new Info($canvas.width - 65, 20, 3, "16px Arial", color, "Lives: ");
        allBricks = initializeBricks(color);
        paddle = new Paddle(($canvas.width - 75) / 2, $canvas.height - 10, 7, 10, allBricks.width, color);
        ball = new Ball($canvas.width / 2, paddle.y - 10, 10, 3, Math.PI / 3.5, color);
        allBricks.bricks.add(paddle);

        // Create the bricks using a given color
        function initializeBricks(color) {
            let allBricks = ( {
                rows: rows,
                columns: cols,
                width: 75,
                height: 20,
                padding: 10,
                topOffset: $canvas.height / 8,
                leftOffset: undefined,
                status: 1,
                color: color,
                bricks: new Set()
            });
            allBricks.leftOffset = ($canvas.width - allBricks.columns * (allBricks.width + allBricks.padding)
                - allBricks.padding) / 2;

            // Create the bricks + position them
            let r, c;
            for (r = 0; r < allBricks.rows; r += 1) {
                for (c = 0; c < allBricks.columns; c += 1) {
                    allBricks['bricks'].add(new Brick(( c * (allBricks.width + allBricks.padding)) + allBricks.leftOffset,
                        (r * (allBricks.height + allBricks.padding) + allBricks.topOffset),
                        allBricks.status));
                }
            }
            return allBricks;
        }
        draw();
    }

    // Functions that draws the components (ball, paddle, bricks, score and number of lives)

    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddle.x, $canvas.height - paddle.height, paddle.width, paddle.height);
        ctx.fillStyle = paddle.color;
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (let brick of allBricks.bricks) {
            if (brick instanceof Brick) {
                ctx.beginPath();
                ctx.rect(brick.x, brick.y, allBricks.width, allBricks.height);
                ctx.fillStyle = allBricks.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }

    function drawScore() {
        ctx.font = score.font;
        ctx.fillStyle = score.color;
        ctx.fillText(score.text + score.count, score.x, score.y);
    }

    function drawLives() {
        ctx.font = lives.font;
        ctx.fillStyle = lives.color;
        ctx.fillText(lives.text + lives.count, lives.x, lives.y);
    }


    // Functions to detect and handle user input (moving the paddle)
    let rightPressed = false;
    let leftPressed = false;
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("mousemove", mouseMoveHandler, false);

    function keyDownHandler(event) {
        // Right arrow
        if (event.keyCode === 39) {
            rightPressed = true;
        }
        // Left arrow
        else if (event.keyCode === 37) {
            leftPressed = true;
        }
    }

    function keyUpHandler(event) {
        // Right arrow
        if (event.keyCode === 39) {
            rightPressed = false;
        }
        // Left arrow
        else if (event.keyCode === 37) {
            leftPressed = false;
        }
    }

    function mouseMoveHandler(event) {
        let relativeX = event.clientX - $canvas.offsetLeft;
        if (relativeX > paddle.width / 2 && relativeX < $canvas.width - paddle.width / 2) {
            let newX = relativeX - paddle.width / 2;
            if (newX > paddle.x) {
            } else {
            }
            paddle['x'] = newX;
        }

    }


    // Functions that detect and handle collisions between the ball and the paddle or bricks

    // Variable used to detect paddle movement
    let prevPaddleX;

    function collisionHandler() {
        let b = collisionDetection();
        if (b) {
            collisionReaction(b);
        }
    }

    function collisionDetection() {
        let dx = Math.cos(ball.direction) * ball.speed;
        let dy = -Math.sin(ball.direction) * ball.speed;

        for (let brick of allBricks.bricks) {
            if (brick.x < ball.x + ball.radius + dx && brick.x + allBricks.width > ball.x - ball.radius + dx
                && brick.y < ball.y + ball.radius + dy && brick.y + allBricks.height > ball.y - ball.radius + dy) {
                return brick;
            }
        }
    }

    function collisionReaction(brick) {
        // Changes the brick's properties and delete it if it's status reaches 0
        if (brick instanceof Brick) {
            allBricks['color'] = randomColorGenerator();
            brick['status'] -= 1;
            score['count'] += 1;
            if (brick.status < 1) {
                allBricks['bricks'].delete(brick);
            }
        } else // Changes the ball's direction (and speed when it hits a moving paddle)
            {
            if(ball.speed < 6) {
                ball['speed'] += 0.5;

            }

            if (paddle.x > prevPaddleX) // paddle moving to the right
            {
                if (ball.direction <= 3 * Math.PI / 2) {
                    ball['direction'] = ball.direction + Math.PI / 2;
                }
            } else if (paddle.x < prevPaddleX) // paddle moving to the left
            {
                if (ball.direction > 3 * Math.PI / 2) {
                    ball['direction'] = ball.direction - Math.PI / 2;
                }
            }
        }

        // Changes the ball's direction when it hits a vertical border
        if (!(brick instanceof Paddle) && ball.x > brick.x + allBricks.width || ball.x < brick.x) {
            if (ball.y > brick.y + allBricks.height) {
                ball['direction'] = 2 * Math.PI - ball.direction;
            } else {
                ball['direction'] = 3 * Math.PI - ball.direction;
            }

        } else // Changes the ball's direction when it hits a horizontal border
            {
            ball['direction'] = 2 * Math.PI - ball.direction;
            }
    }

    // Detect and react to collision between the ball and the canvas' borders
    function wallCollision() {
        let dx = Math.cos(ball.direction) * ball.speed;
        let dy = -Math.sin(ball.direction) * ball.speed;

        if (ball.y + dy < ball.radius) {
            ball['direction'] = 2 * Math.PI - ball.direction;
        } else if (ball.y > $canvas.height - ball.radius) {
            lives['count'] -= 1;
            if (!lives.count) {
                let $restartButton = dialog("#dialoogvenster", "danger", "YOU LOST, GAME OVER", "Game lost").find('.btn');
                $restartButton.unbind().click(() => {
                    start(allBricks.rows, allBricks.columns);
                });
            }
            else {
                ball['x'] = paddle.x + paddle.width / 2;
                ball['y'] = paddle.y - ball.radius - Math.abs(dy);
                ball['direction'] = Math.PI / 4;
            }
        } else if (ball.x + dx < ball.radius || ball.x + dx > $canvas.width - ball.radius) {
            ball['direction'] = Math.PI - ball.direction;
        }
    }

    // Generates a random color
    function randomColorGenerator() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Converts ball's direction radian to one between 0 and 2*PI
    function correctRadian() {
        ball['direction'] %= 2 * Math.PI;
        if (ball.direction < 0) {
            ball['direction'] += 2 * Math.PI;
        }
    }

    // Checks if the game is done (=won)
    function checkIfDone() {
        if (score.count === allBricks.rows * allBricks.columns) {
            drawBricks();
            let $restartButton = dialog("#dialoogvenster", "success", "YOU WIN, CONGRATULATIONS!", "Game won").find('.btn').first();
            $restartButton.unbind().click(() => {
                start(allBricks.rows, allBricks.columns);
            });
            return true;
        }
    }

    // Function that draws the components
    function draw() {
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);

        drawBall();
        drawPaddle();
        drawBricks();
        collisionHandler();
        drawScore();
        drawLives();

        wallCollision();

        correctRadian();

        // Translate the ball
        ball['x'] += Math.cos(ball.direction) * ball.speed;
        ball['y'] += -Math.sin(ball.direction) * ball.speed;

        // Translate the paddle according to user input
        prevPaddleX = paddle.x;
        if (rightPressed && paddle.x < $canvas.width - paddle.width) {
            paddle['x'] += paddle.dx;
        }
        else if (leftPressed && paddle.x > 0) {
            paddle['x'] -= paddle.dx;
        }

        //
        if (lives.count > 0 && !checkIfDone()) {
            requestId = requestAnimationFrame(draw);
        }
    }

    // Starts the game when 'breakout' is called
    start(args.rows, args.columns);

    // Returns object that offers public methods
    return {
        start: start,

        layout: function (r, c) {
            try {
                start(r, c);
            } catch (e) {
                assert(false, "Something went wrong...");
            }
        }
    };

    // Source: https://github.ugent.be/Scriptingtalen/ST-practica-2016-2017/tree/master/javascript/demo/memory
    function dialog(selector, type, message, title) {
        // Dictionary that determines the different types of dialog windows and gives them a default title
        let titels = {
            "primary": "Information",
            "success": "Success",
            "info": "Information",
            "warning": "Warning",
            "danger": "Danger",
        };

        // Selects the element that represents the dialog window
        let $dialog = $(selector),
            $dialog_header = $dialog.find('.modal-header'),
            $dialog_body = $dialog.find('.modal-body'),
            $dialog_btn = $dialog.find('.btn');

        // Delete all previous colors
        Object.keys(titels).forEach(function (type) {
            $dialog_header.removeClass('bg-' + type);
            $dialog_body.removeClass('text-' + type);
            $dialog_btn.removeClass('btn-' + type);
        });

        // Set a new color
        if (titels.hasOwnProperty(type)) {
            $dialog_header.addClass('bg-' + type);
            $dialog_body.addClass('text-' + type);
            $dialog_btn.addClass('btn-' + type);
        }

        // Set the message
        $dialog_body.find('p').html(message);

        // Set the title
        title = title || titles[title] || "";
        $dialog_header.find('h4').html(title);

        // Show the dialog window
        $dialog.modal();

        return $dialog;
    }

    function assert(voorwaarde, message) {

        if (!voorwaarde) {

            // dialoogvenster weergeven
            dialog("#dialoogvenster", "warning", message);

            throw {
                name: 'MemoryConfigurationError',
                message: message
            };
        }

    }

    // Starts the backgroundsong
    function playSong() {
        document.getElementById('audiotag1').play();
    }
}