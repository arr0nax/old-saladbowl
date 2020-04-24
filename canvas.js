var messages = [];
var dorotate = false;
var gravity = false;
var maspeed = 1;
var mascale = 1;
let boticelli;
let dali;
let davinci;
let hokusai;
let monet;
let picasso;
let munch;
let meh_cat;
let attack_cat;
let surprise_cat;
let lazy_cat;
let classic_sheep;
let happy_sheep;
let chimp;
let shrek;
let mike;
let krey;
let nut;
function preload() {
  // boticelli = loadImage('images/boticelli.png');
  // dali = loadImage('images/dali.png');
  // davinci = loadImage('images/davinci.png');
  // hokusai = loadImage('images/hokusai.png');
  // monet = loadImage('images/monet.png');
  // picasso = loadImage('images/picasso.png');
  // munch = loadImage('images/munch.png');
  // meh_cat = loadImage('images/meh_cat.png');
  // attack_cat = loadImage('images/attack_cat.png');
  // surprise_cat = loadImage('images/surprise_cat.png');
  // lazy_cat = loadImage('images/lazy_cat.png');
  // classic_sheep = loadImage('images/classic_sheep.png');
  // happy_sheep = loadImage('images/happy_sheep.png');
  // chimp = loadImage('images/chimp.png');
  // shrek = loadImage('images/shrek.png');
  // mike = loadImage('images/mike.png');
  // krey = loadImage('images/krey.png');
  // nut = loadImage('images/nut.png');
}

$(function () {
  console.log('hello');
  var socket = io();
  socket.on('message', function(msg){
    messages.push(new Message(msg));
    console.log(messages);
  });
  socket.on('effect', function(effect){
    console.log(effect);
    if (effect === 'duplicate') {
      const orig = messages[Math.floor(Math.random() * messages.length)];
      let clone = Object.assign( Object.create( Object.getPrototypeOf(orig)), orig)
      clone.reposition();
      messages.push(clone);
      console.log(messages);
    } else if (effect === 'rotate') { dorotate = true;
    } else if (effect === 'stop_rotate') { dorotate = false;
    } else if (effect === 'gravity') { gravity = true; dorotate = false;
    } else if (effect === 'stop_gravity') { gravity = false; dorotate = false
    } else if (effect === 'scale_up') { (mascale < 12) ? ( mascale += .1 ) : null; console.log(mascale);
    } else if (effect === 'scale_down') { (mascale > 0.2) ? (mascale -= .1) : null;
    } else if (effect === 'speed_up') { maspeed += .1;
    } else if (effect === 'speed_down') { (maspeed > 0.2) ? (maspeed -= .1) : null;
    }
  });
  socket.on('image', function(name){
    switch (name) {
      case 'boticelli': messages.push(new Imagec(boticelli)); break;
      case 'dali': messages.push(new Imagec(dali)); break;
      case 'davinci': messages.push(new Imagec(davinci)); break;
      case 'hokusai': messages.push(new Imagec(hokusai)); break;
      case 'monet': messages.push(new Imagec(monet)); break;
      case 'picasso': messages.push(new Imagec(picasso)); break;
      case 'munch': messages.push(new Imagec(munch)); break;
      case 'meh_cat': messages.push(new Imagec(meh_cat)); break;
      case 'attack_cat': messages.push(new Imagec(attack_cat)); break;
      case 'surprise_cat': messages.push(new Imagec(surprise_cat)); break;
      case 'lazy_cat': messages.push(new Imagec(lazy_cat)); break;
      case 'classic_sheep': messages.push(new Imagec(classic_sheep)); break;
      case 'happy_sheep': messages.push(new Imagec(happy_sheep)); break;
      case 'chimp': messages.push(new Imagec(chimp)); break;
      case 'shrek': messages.push(new Imagec(shrek)); break;
      case 'mike': messages.push(new Imagec(mike)); break;
      case 'krey': messages.push(new Imagec(krey)); break;
      case 'nut': messages.push(new Imagec(nut)); break;
      default: break;
    }
  });
});

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(40);
}

function draw() {
  // background(255/2*sin(frameCount/110)+255/2,255/2*sin(frameCount/120)+255/2, 255/2*sin(frameCount/130)+255/2);
  if (messages.length === 0) reset();
  drawMessages();
}

function drawMessages() {
  const color1 = sinColor1();
  const color2 = sinColor2();
  textSize(40 * mascale);
  for (var i=0;i<messages.length;i++) {
    if (messages[i].type === 'text') {
      stroke(color1.r, color1.g, color1.b);
      strokeWeight(2);
      fill(color2.r, color2.g, color2.b);
      if (dorotate) rotate((frameCount / 1500) % PI);
      text(messages[i].text, messages[i].position.x, messages[i].position.y);
    } else if (messages[i].type === 'image') {
      if (dorotate) rotate((frameCount / 1500) % PI);
      image(messages[i].img, messages[i].position.x, messages[i].position.y, messages[i].img.width * (120/messages[i].img.height) * mascale, 120 * mascale);
    }
    messages[i].position.y = messages[i].position.y + (gravity ? 0.5 : messages[i].velocity.y * maspeed);
    messages[i].position.x = messages[i].position.x + (gravity ? 0 : messages[i].velocity.x * maspeed);
    if (messages[i].position.y > windowHeight + 100 || messages[i].position.y < -100 || messages[i].position.x > windowWidth + 100 || messages[i].position.x < -100) {
      messages.splice(i, 1);
    }
  }
}

class Boid {
  constructor() {
    this.type = null;
    this.position = centeredStartingPosition();
    this.velocity = createVector(randomGaussian(0, .3), randomGaussian(0, .3));
  }
}
class Message extends Boid {
  constructor(text) {
    super();
    this.text = text;
    this.type = 'text';

  }
}

class Shape extends Boid {
  constructor(shape) {
    super();
    this.type = 'shape';

  }
}

class Imagec extends Boid {
  constructor(img) {
    super();
    this.type = 'image';
    this.img = img;
  }
}

Boid.prototype.reposition = function () {
  this.position = createVector(Math.random() * windowWidth, Math.random() * windowHeight);
  this.velocity = createVector(randomGaussian(0, .3), randomGaussian(0, .3));
};

function determineType(text) {

}

function centeredStartingPosition() {
  return createVector((Math.random() * (windowWidth / 2)) + (windowWidth / 4) + randomGaussian(0, windowWidth/6), (Math.random() * (windowHeight / 2)) + (windowHeight / 4) + randomGaussian(0, windowHeight/6));
}

function sinColor1() {
  return {
    r: (255/2*sin((frameCount)/110)+255/2),
    g: (255/2*sin((frameCount)/120)+255/2),
    b: (255/2*sin((frameCount)/130)+255/2)
  }
}

function sinColor2() {
  return {
    r: (255/2*sin((frameCount)/120)+255/2),
    g: (255/2*sin((frameCount)/130)+255/2),
    b: (255/2*sin((frameCount)/140)+255/2)
  }
}

function reset() {
  messages.push(new Message('LONG DISTANCE HUSBAND'));
  dorotate = false;
  mascale = 1;
  gravity = false;
  maspeed = 1;
}
