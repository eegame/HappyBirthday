var STARTED = false, COUNT = 0, LIMIT = 999, TAU = Math.PI * 2;
var divMeteors = document.getElementById("meteors");
    divBase = document.getElementById("base"),
    divNote = document.getElementById("note"),
    divBundle = document.getElementById("bundle"),
    divButton = document.getElementById("button"),
    divPop = document.getElementById("pop"),
    divBirthday = document.getElementById("birthday");
var balloons = ["balloon1", "balloon2", "balloon3", "balloon4", "balloon5"],
    settings = {
        margin: 20,
        left: 10,
        top: 10,
        width: 340,
        height: 544
    };

// Meteors
var Stellar = function () {
    this.getColor = function () {
        this.color = Math.random() < 0.5 ? "#222" : "#fff";
    }

    this.draw = function (context) {
        context.fillStyle = this.color;
        context.fillText(this.text, this.x, this.y);
    }

    this.x = Math.ceil(settings.width * Math.random()) + settings.left;
    this.y = Math.ceil(settings.height * Math.random()) + settings.top;
    this.text = ".";
    this.getColor();
}

function playStellar(stellars, stellarCount, context) {
    for (var i = 0; i < stellarCount; i++){
        stellars[i].getColor();
        stellars[i].draw(context);
    }

    setTimeout(playStellar, 100, stellars, stellarCount, context);
}

var Meteor = function () {
    this.getRandomColor = function () {
        var x = Math.ceil(255 - 240 * Math.random());
        this.color1 = "rgba("+x+", "+x+", "+x+", 1)";
        this.color2 = "#222";
    }

    this.getPos = function () {
        this.x = Math.ceil(Math.random() * settings.width) + settings.left;
        this.y = Math.ceil(Math.random() * settings.height) + settings.top;
    }

    this.calcPos = function () {
        this.x = this.x - this.offset_x;
        this.y = this.y + this.offset_y;
    }

    this.draw = function (context) {
        context.save();
        context.beginPath();
        context.lineWidth = 1;
        context.globalAlpha = this.alpha;

        var line = context.createLinearGradient(this.x, this.y, this.x + this.width, this.y - this.height);
        line.addColorStop(0, "#fff");
        line.addColorStop(0.3, this.color1);
        line.addColorStop(0.6, this.color2);
        context.strokeStyle = line;
        context.moveTo(this.x, this.y);
        context.lineTo(this.x + this.width, this.y - this.height);
        context.closePath();
        context.stroke();
        context.restore();
    }

    this.move = function (context) {
        var x = this.x + this.width - this.offset_x,
            y = this.y - this.height;
        context.clearRect(x - 3, y - 3, this.offset_x + 5, this.offset_y + 5);
        this.calcPos();
        this.draw(context);
        this.alpha -= 0.002;
    }

    this.getRandomColor();
    this.getPos();
    this.alpha = 1;
    this.angle = 30;
    this.length = Math.ceil(Math.random() * 80) + 150;
    this.speed = Math.random() + 0.2;
    var cos = Math.cos(this.angle * Math.PI / 180), sin = Math.sin(this.angle * Math.PI / 180);
    this.width = this.length * cos;
    this.height = this.length * sin;
    this.offset_x = this.speed * cos;
    this.offset_y = this.speed * sin;
}

function playMeteors(meteors, meteorCount, context) {
    for (var i = 0; i < meteorCount; i++) {
        var meteor = meteors[i];
        meteor.move(context);

        if (meteor.y > meteor.height + settings.height + settings.top) {
            context.clearRect(meteor.x, meteor.y - meteor.height, meteor.width, meteor.height);
            meteors[i] = new Meteor();
        }
    }

    setTimeout(playMeteors, 2, meteors, meteorCount, context);
}

// Stars
var Particle = (function () {
    function Particle(texture, frame) {
        this.alive = false;
        this.texture = texture;
        this.frame = frame;
        this.width = frame.width;
        this.height = frame.height;
        this.originX = frame.width / 2;
        this.originY = frame.height / 2;
    }

    Particle.prototype.init = function (x, y) {
        if (x === void 0) {
            x = 0;
        }

        if (y === void 0) {
            y = 0;
        }

        var angle = random(TAU), force = random(2, 6);
        this.alive = true;
        this.alpha = 1;
        this.x = x;
        this.y = y;
        this.theta = angle;
        this.vx = Math.sin(angle) * force;
        this.vy = Math.cos(angle) * force;
        this.rotation = Math.atan2(this.vy, this.vx);
        this.drag = random(0.82, 0.97);
        this.scale = random(0.1, 0.8);
        this.wander = random(0.5, 1.0);
        this.matrix = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            tx: 0,
            ty: 0
        };

        return this;
    };

    Particle.prototype.update = function () {
        var matrix = this.matrix;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.theta += random(-0.5, 0.5) * this.wander;
        this.vx += Math.sin(this.theta) * 0.1;
        this.vy += Math.cos(this.theta) * 0.1;
        this.rotation = Math.atan2(this.vy, this.vx);
        this.alpha *= 0.98;
        this.scale *= 0.985;
        this.alive = this.scale > 0.06 && this.alpha > 0.06;

        var cos = Math.cos(this.rotation) * this.scale, sin = Math.sin(this.rotation) * this.scale;
        matrix.a = cos;
        matrix.b = sin;
        matrix.c = -sin;
        matrix.d = cos;
        matrix.tx = this.x - (this.originX * matrix.a + this.originY * matrix.c);
        matrix.ty = this.y - (this.originX * matrix.b + this.originY * matrix.d);

        return this;
    };

    Particle.prototype.draw = function (context) {
        var m = this.matrix, f = this.frame;
        context.globalAlpha = this.alpha;
        context.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
        context.drawImage(this.texture, f.x, f.y, f.width, f.height, 0, 0, this.width, this.height);
        return this;
    };

    return Particle;
} ());

var Stars = (function () {
    function Stars(options) {
        var self = this;

        this.pool = [];
        this.particles = [];
        this.pointer = {
            x: -9999,
            y: -9999
        };

        this.buffer = document.createElement("canvas");
        divBase.appendChild(this.buffer);
        this.bufferContext = this.buffer.getContext("2d");
        this.supportsFilters = typeof this.bufferContext.filter !== "undefined";

        this.pointerMove = function (event) {
            event.preventDefault();
            var pointer = event.targetTouches ? event.targetTouches[0] : event;
            self.pointer.x = pointer.clientX;
            self.pointer.y = pointer.clientY;

            for (var i = 0; i < random(2, 7); i++) {
                self.spawn(self.pointer.x, self.pointer.y);
            }
        };
        this.resize = function (width, height) {
            self.width = self.buffer.width = self.view.width = width;
            self.height = self.buffer.height = self.view.height = height;
        };
        this.render = function (time) {
            var context = self.context;
            var particles = self.particles;
            var bufferContext = self.bufferContext;
            context.fillStyle = self.backgroundColor;
            context.fillRect(0, 0, self.width, self.height);

            bufferContext.globalAlpha = 1;
            bufferContext.setTransform(1, 0, 0, 1, 0, 0);
            bufferContext.clearRect(0, 0, self.width, self.height);
            bufferContext.globalCompositeOperation = self.blendMode;

            for (var i = 0; i < particles.length; i++) {
                var particle = particles[i];

                if (particle.alive) {
                    particle.update();
                }
                else {
                    self.pool.push(particle);
                    removeItems(particles, i, 1);
                }
            }

            for (var i = 0, particles_1 = particles; i < particles_1.length; i++) {
                var particle = particles_1[i];
                particle.draw(bufferContext);
            }

            if (self.supportsFilters) {
                if (self.useBlurFilter) {
                    context.filter = "blur(" + self.filterBlur + "px)";
                }

                context.drawImage(self.buffer, 0, 0);

                if (self.useContrastFilter) {
                    context.filter = "drop-shadow(4px 4px 4px rgba(0,0,0,1)) contrast(" + self.filterContrast + "%)";
                }
            }

            context.filter = "none";
            requestAnimationFrame(self.render);
        };

        Object.assign(this, options);
        this.context = this.view.getContext("2d", {
            alpha: false
        });
    }

    Stars.prototype.spawn = function (x, y) {
        var particle;

        if (this.particles.length > this.maxParticles) {
            particle = this.particles.shift();
        }
        else if (this.pool.length) {
            particle = this.pool.pop();
        }
        else {
            particle = new Particle(this.texture, sample(this.frames));
        }

        particle.init(x, y);
        this.particles.push(particle);

        if (STARTED && ++COUNT == LIMIT) {
            explodeTimer = setInterval(function () {
                if (STARTED) {
                    STARTED = false;

                    for (x of balloons) {
                        $("#" + x).explode({
                            maxWidth: 12,
                            minWidth: 4,
                            maxAngle: 360,
                            radius: 480,
                            explodeTime: 250,
                            gravity: 10,
                            groundDistance: 4096,
                            canvas: true,
                            round: true,
                            recycle: false,
                            release: false
                        });
                    }
                }
                else {
                    playAudio(divPop, false);
                    divMeteors.width = settings.width;
                    divMeteors.height = settings.height;
                    var context = divMeteors.getContext("2d"),
                        stellarCount = 70, meteorCount = 7,
                        stellars = new Array(), meteors = new Array();

                    for (var i = 0; i < stellarCount; i++) {
                        var stellar = new Stellar();
                        stellar.draw(context);
                        stellars.push(stellar);
                    }

                    for (var i = 0; i < meteorCount; i++) {
                        var meteor = new Meteor();
                        meteor.draw(context);
                        meteors.push(meteor);
                    }

                    playStellar(stellars, stellarCount, context);
                    playMeteors(meteors, meteorCount, context);
                    clearInterval(explodeTimer);
                }
            }, 250);
        }

        return this;
    };

    Stars.prototype.start = function () {
        this.resize(this.width, this.height);
        this.render();
        this.view.style.visibility = "visible";

        if (window.PointerEvent) {
            window.addEventListener("pointermove", this.pointerMove);
        }
        else {
            window.addEventListener("mousemove", this.pointerMove);
            window.addEventListener("touchmove", this.pointerMove);
        }

        requestAnimationFrame(this.render);
        return this;
    };

    return Stars;
} ());

function createFrames(numFrames, width, height) {
    var frames = [];

    for (var i = 0; i < numFrames; i++) {
        frames.push({
            x: width * i,
            y: 0,
            width: width,
            height: height
        });
    }

    return frames;
}

function removeItems(items, startIndex, removeCount) {
    var length = items.length;

    if (startIndex >= length || removeCount == 0) {
        return;
    }

    removeCount = startIndex + removeCount > length ? length - startIndex : removeCount;

    var len = length - removeCount;

    for (var i = startIndex; i < len; ++i) {
        items[i] = items[i + removeCount];
    }

    items.length = len;
}

function random(min, max) {
    if (max == null) {
        max = min;
        min = 0;
    }

    if (min > max) {
        var tmp = min;
        min = max;
        max = tmp;
    }

    return Math.random() * (max - min) + min;
}

function sample(array) {
    return array[(Math.random() * array.length) | 0];
}

var stars = new Stars({
    view: document.querySelector("#view"),
    texture: document.querySelector("#stars"),
    frames: createFrames(5, 80, 80),
    width: settings.width,
    height: settings.height,
    maxParticles: 300,
    backgroundColor: "#000",
    blendMode: "lighter",
    filterBlur: 50,
    filterContrast: 300,
    useBlurFilter: true,
    useContrastFilter: true
});

// Balloons
var Balloon = function (id, settings) {
    var self = document.getElementById(id);

	this.bundle = divBundle;
	this.balloon = {
		obj: self,
		x: Math.ceil(Math.random() * (this.bundle.clientWidth - self.clientWidth - settings.margin * 2)) + settings.left + settings.margin,
		y: Math.ceil(Math.random() * settings.margin) + settings.top + settings.margin,
		amplitude: {
			x: 0.02 + Math.random() / 10,
			y: 0.5 + Math.random() / 2
		},
		amplifier: Math.random() * 20,
		angle: 0
	}

	this.setTimer(settings);
};

Balloon.prototype.setTimer = function (settings) {
	this.move(settings);
	var self = this;
	setTimeout(function () {self.setTimer(settings)}, 20);
};

Balloon.prototype.move = function (settings) {
	var balloon = this.balloon;
	balloon.y += balloon.amplitude.y;

	if (balloon.y + balloon.obj.clientHeight + settings.margin > this.bundle.clientHeight + settings.top) {
		balloon.y = Math.ceil(Math.random() * settings.margin) + settings.top + settings.margin;
	}

	balloon.angle += balloon.amplitude.x;
	balloon.obj.style.top = balloon.y + "px";
	balloon.obj.style.left = balloon.x + balloon.amplifier * Math.sin(balloon.angle) + "px";
};

function createObj(type, parent, id, src) {
    var obj = document.createElement(type);
    obj.id = id;
    obj.src = src;
    document.getElementById(parent).appendChild(obj);
}

function createBalloons(settings) {
    var srcs = ["image/balloon_blue.png", "image/balloon_gold.png", "image/balloon_pink.png", "image/balloon_violet.png", "image/balloon_white.png"];

    for (var i = 0, n = balloons.length, m = srcs.length; i < n; i++) {
        createObj("img", "bundle", balloons[i], srcs[i % m]);
        new Balloon(balloons[i], settings);
    }
}

// Menu
function calcPos(element, settings) {
    var x = Math.ceil(Math.random() * (settings.width - element.width() * 1.5 - settings.margin * 4)) + settings.left + settings.margin * 2,
        y = Math.ceil(Math.random() * (settings.height - element.height() * 1.5 - settings.margin * 4)) + settings.top + settings.margin * 2;

    return [x, y];
}

function calcSpeed(curr, next) {
    var x = Math.abs(curr[0] - next[0]),
        y = Math.abs(curr[1] - next[1]),
        greater = x > y ? x : y,
        modifier = 0.05;

    return Math.ceil(greater / modifier);
}

function animateElement(element, settings) {
    var curr = element.offset(),
        next = calcPos(element, settings),
        speed = calcSpeed([curr.left, curr.top], next);

    element.animate({left: next[0], top: next[1]}, speed, function () {
        animateElement(element, settings);
    });
}

function typing(note) {
    var s = "🦌🦌——工作学习再忙也别凑合了今天这个最特别的日子。记得去年这个时候你说过不想长大，所以这一年来我老是惹你不开心，因为不开心的日子过起来比较慢啊。😄但是今天和接下来的每一天都愿你开开心心，心想事成！💖据说在指尖划满999颗星就可以许愿了，试试看吧。🌟",
        n = s.length, i = -1, l = [0, 6, 28, 44, 59, 77, 97, 104, 123, n];

    typingTimer = setInterval(function () {
        if (++i < n) {
            if (l.includes(i)) {
                note.innerHTML = s[i];
                $("#note").fadeIn(500);
            }
            else if (l.includes(i + 1)) {
                note.innerHTML += s[i];
                $("#note").fadeOut(500);
            }
            else {
                note.innerHTML += s[i];
            }
        }
        else {
            note.remove();
            clearInterval(typingTimer);
        }
    }, 375);
}

function playAudio(audio, loop) {
    var playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise.then(_ => {
        })
        .catch(error => {
        });
    }

    audio.onended = function () {
        if (loop) {
            this.currentTime = 0;
            this.play();
        }
    };
}

function stopAudio(audio) {
    audio.pause();
    audio.currentTime = 0;
}

// Main
function main() {
    var isClicked = false, isPlayed = false;

    stars.start()
    animateElement($("#button"), settings);

    divButton.onclick = function () {
        explodeTimer = setInterval(function () {
            if (!isClicked) {
                isClicked = true;
                $("#bubble").explode({
                    maxWidth: 12,
                    minWidth: 4,
                    maxAngle: 360,
                    radius: 480,
                    explodeTime: 250,
                    gravity: 10,
                    groundDistance: 4096,
                    canvas: true,
                    round: true,
                    recycle: false,
                    release: false
                });
            }
            else {
                divButton.remove();
                clearInterval(explodeTimer);
            }
        }, 250);

        if (!STARTED) {
            STARTED = true;
            playAudio(divPop, false);
            playAudio(divBirthday, true);
            createBalloons(settings);
            typing(divNote);
        }
    };
}

window.onload = main();