/**
 * Created by Dries on 16/05/2017.
 */
/**
 * Created by dries on 13/05/2017.
 */
function breakout(args) {

    let $canvas = $(args.selector)[0];
    let ctx = $canvas.getContext("2d");
    let requestId;

    class Ball {
        constructor(x, y, radius, speed, direction, color) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.speed = speed;
            this.direction = direction;
            this.color = color;
        }
    }

    class Paddle {
        constructor(x, y, dx, height, width, color) {
            this.x = x;
            this.y = y;
            this.dx = dx;
            this.height = height;
            this.width = width;
            this.color = color;
        }
    }

    class Brick {
        constructor(x, y, status) {
            this.x = x;
            this.y = y;
            this.status = status;
        }
    }

    class Info {
        constructor(count, font, color, text, x, y) {
            this.count = count;
            this.font = font;
            this.color = color;
            this.text = text;
            this.x = x;
            this.y = y;
        }
    }

    let color;
    let ball;
    let paddle;
    let score;
    let lives;
    let allBricks;

    function start(rows, cols) {
        if(requestId) {
            cancelAnimationFrame(requestId);
            requestId = undefined;
        }

        color = randomColorGenerator();
        score = new Info(0, "16px Arial", color, "Score: ", 8, 20);
        lives = new Info(3, "16px Arial", color, "Lives: ", $canvas.width - 65, 20);
        allBricks = initializeBricks(color);
        paddle = new Paddle(($canvas.width - 75) / 2, $canvas.height-10, 7, 10, allBricks.width, color);
        ball = new Ball($canvas.width / 2, paddle.y - 10, 10, 3, Math.PI/3.5, color);
        allBricks.bricks.add(paddle);

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
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, allBricks.width, allBricks.height);
            ctx.fillStyle = allBricks.color;
            ctx.fill();
            ctx.closePath();
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

    // Moving
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
        if (event.keyCode == 39) {
            rightPressed = false;
        }
        // Left arrow
        else if (event.keyCode == 37) {
            leftPressed = false;
        }
    }

    function mouseMoveHandler(event) {
        let relativeX = event.clientX - $canvas.offsetLeft;
        if (relativeX > paddle.width/2 && relativeX < $canvas.width - paddle.width/2) {
            let newX = relativeX - paddle.width / 2;
            if (newX > paddle.x) {
            } else {
            }
            paddle['x'] = newX;
        }

    }


    var prevPaddleX;
    function collisionHandler() {
        let b = collisionDetection();
        if (b) {
            collisionReaction(b);
        }
    }

    function collisionDetection() {
        let dx = Math.cos(ball.direction)*ball.speed;
        let dy = -Math.sin(ball.direction)*ball.speed;

        for (let brick of allBricks.bricks) {
            if (brick.x < ball.x + ball.radius + dx && brick.x + allBricks.width > ball.x - ball.radius + dx
                            && brick.y < ball.y + ball.radius +dy && brick.y + allBricks.height > ball.y - ball.radius + dy) {
                return brick;
            }
        }
}

    function collisionReaction(brick) {
        if (brick instanceof Brick) {
            allBricks['color'] = randomColorGenerator();
            brick['status'] -= 1;
            score['count'] += 1;
            if (brick.status < 1) {
                allBricks['bricks'].delete(brick);
            }
        } else {
            ball['speed'] += 0.5;
            if (paddle.x > prevPaddleX) {
                if (ball.direction <= 3*Math.PI/2) {
                    ball['direction'] = ball.direction + Math.PI/2;
                }
            } else if (paddle.x < prevPaddleX) {
                if (ball.direction > 3*Math.PI/2) {
                    ball['direction'] = ball.direction - Math.PI/2;
                }
            }
        }

        if (!(brick instanceof Paddle) && ball.x > brick.x + allBricks.width || ball.x < brick.x) {
            if (ball.y > brick.y + allBricks.height) {
                ball['direction'] = 2*Math.PI - ball.direction;
            } else {
                ball['direction'] = 3*Math.PI - ball.direction;
            }

        } else {
            ball['direction'] = 2*Math.PI - ball.direction;
        }
    }

    function randomColorGenerator() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

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

    function draw() {
        if(!checkIfDone()) {
            ctx.clearRect(0, 0, $canvas.width, $canvas.height);
            drawBricks();
            drawBall();
            drawPaddle();
            collisionHandler();
            drawScore();
            drawLives();

            let dx = Math.cos(ball.direction) * ball.speed;
            let dy = -Math.sin(ball.direction) * ball.speed;

            if (ball.y + dy < ball.radius) {
                ball['direction'] = 2 * Math.PI - ball.direction;
            } else if (ball.y > $canvas.height - ball.radius) {
                lives['count'] -= 1;
                lives.text
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

            ball['direction'] %= 2 * Math.PI;
            if (ball.direction < 0) {
                ball['direction'] += 2 * Math.PI;
            }

            // Translate
            ball['x'] += Math.cos(ball.direction) * ball.speed;
            ball['y'] += -Math.sin(ball.direction) * ball.speed;

            // Paddle
            prevPaddleX = paddle.x;
            if (rightPressed && paddle.x < $canvas.width - paddle.width) {
                paddle['x'] += paddle.dx;
            }
            else if (leftPressed && paddle.x > 0) {
                paddle['x'] -= paddle.dx;
            }

            if (lives.count > 0) {
                requestId = requestAnimationFrame(draw);
            }
        }
    }

    start(args.rows, args.columns);

    // geef object terug dat publieke methoden aanbiedt
    return {

        start: start,

        layout: function(r, c) {
            try {
                start(r,c);
            } catch(e) {}
        }
    }

    function dialog(selector, type, boodschap, titel) {
        // dictionary die verschillende types van dialoogvensters bepaalt,
        // die elk type van een standaard titel voorziet
        var titels = {
            "primary": "Informatie",
            "success": "Succes",
            "info": "Informatie",
            "warning": "Waarschuwing",
            "danger": "Gevaar",
        }

        // selecteer het element dat het dialoogvenster voorstelt + add handlder
        var $dialog = $(selector),
            $dialog_header = $dialog.find('.modal-header'),
            $dialog_body = $dialog.find('.modal-body'),
            $dialog_btn = $dialog.find('.btn');

        // verwijder alle voorgaande kleuren
        Object.keys(titels).forEach(function (type) {
            $dialog_header.removeClass('bg-' + type);
            $dialog_body.removeClass('text-' + type);
            $dialog_btn.removeClass('btn-' + type);
        });

        // stel nieuwe kleur in
        if (titels.hasOwnProperty(type)) {
            $dialog_header.addClass('bg-' + type);
            $dialog_body.addClass('text-' + type);
            $dialog_btn.addClass('btn-' + type);
        }

        // boodschap instellen
        $dialog_body.find('p').html(boodschap);

        // titel instellen
        titel = titel || titels[type] || "";
        $dialog_header.find('h4').html(titel);

        // dialoogvenster weergeven
        $dialog.modal();

        return $dialog;
    }

    function assert(voorwaarde, boodschap) {

        if (!voorwaarde) {

            // dialoogvenster weergeven
            dialog("#dialoogvenster", "warning", boodschap);

            throw {
                name: 'MemoryConfigurationError',
                message: boodschap
            };
        }

    }
}