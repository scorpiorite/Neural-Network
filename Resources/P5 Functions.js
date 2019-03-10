
var fps = 60
var ballCount = 500
var concentration = 10
var velocity = 1
var ballSize = 10
var recur = 0
var ballArray = []
var enemyArray = []

/*
function setup() {
	createCanvas(windowWidth,windowHeight)
	frameRate(fps)
}

function draw() {

}
*/

function Ball(color,id) {
	this.pos = {x:500, y:500}
	this.color = color
	this.id = id
	this.moving = 0
	this.alive = true
	this.draw = function(){
		fill(color)
		ellipse(this.pos.x,this.pos.y,ballSize,ballSize)
	}
	ballArray.push(this)
}

function enemy(color,id) {
	this.pos = {x:Math.random()*windowWidth, y:Math.random()*windowHeight}
	this.color = color
	this.id = id
	this.chain = 0
	this.alive = true
	this.draw = function(){
		fill(color)
		ellipse(this.pos.x,this.pos.y,ballSize,ballSize)
	}
	enemyArray.push(this)
}

var keys = {}
function keyPressed() {
	keys[key] = true
}

function keyReleased() {
	keys[key] = false
}

function keyParse(item) {
	
	if(keys.A === true) {
		item.pos.x -= velocity
	}
	if(keys.D === true) {
		item.pos.x += velocity
	}

	if(keys.W === true) {
		item.pos.y -= velocity
		if(keys.D === true) {
			item.pos.x -= (velocity - velocity*cos(Math.PI/4))
			item.pos.y += (velocity - velocity*cos(Math.PI/4))
		} 
		if (keys.A === true) {
			item.pos.x += (velocity - velocity*cos(Math.PI/4))
			item.pos.y += (velocity - velocity*cos(Math.PI/4))
		}
	} else if (keys.S === true) {
		item.pos.y += velocity
		if(keys.D === true) {
			item.pos.x -= (velocity - velocity*cos(Math.PI/4))
			item.pos.y -= (velocity - velocity*cos(Math.PI/4))
		}
		if (keys.A === true) {
			item.pos.x += (velocity - velocity*cos(Math.PI/4))
			item.pos.y -= (velocity - velocity*cos(Math.PI/4))
		}
	}
	
	if(keys.W === true || keys.D === true || keys.S === true || keys.A === true) {
		item.moving = 1
	} else {
		item.moving = 0
	}
}

function follow(follower,target,speed) {

	if(speed > 1000) {	//speed cannot be greater than 1000
		alert("Speed has been set above 1000, this is too high for the program to handle")
	}

	var invSpeed = 1000/speed

	if(target.pos.x > follower.pos.x) {
		follower.pos.x += Math.abs(target.pos.x - follower.pos.x)/invSpeed
	}
	if(target.pos.x < follower.pos.x) {
		follower.pos.x -= Math.abs(target.pos.x - follower.pos.x)/invSpeed
	}
	if(target.pos.y > follower.pos.y) {
		follower.pos.y += Math.abs(target.pos.y - follower.pos.y)/invSpeed
	}
	if(target.pos.y < follower.pos.y) {
		follower.pos.y -= Math.abs(target.pos.y - follower.pos.y)/invSpeed
	}
}

function chase(chaser,target,speed) {
	
	var distance = Math.sqrt(Math.pow(target.pos.x - chaser.pos.x,2) + Math.pow(target.pos.y - chaser.pos.y,2))
	var direction = 0
	
	if(target.pos.x === chaser.pos.x) {
		if(target.pos.y > chaser.pos.y) {
			chaser.pos.y += speed					//DOWN
		} else if (target.pos.y < chaser.pos.y) {
			chaser.pos.y -= speed					//UP
		} else {
			direction = "NA"
		}
	} else if(target.pos.y === chaser.pos.y) {
		if(target.pos.x > chaser.pos.x) {
			chaser.pos.x += speed 					//RIGHT
		} else if (target.pos.x < chaser.pos.x) {
			chaser.pos.x -= speed					//LEFT
		} else {
			direction = "NA"
		}
	}
	
	if(target.pos.x > chaser.pos.x) {
		if(target.pos.y < chaser.pos.y) {
			direction = Math.atan((target.pos.x - chaser.pos.x)/(chaser.pos.y - target.pos.y))	//1ST QUADRANT
			chaser.pos.x += speed*Math.sin(direction)
			chaser.pos.y -= speed*Math.cos(direction)
		} else if (target.pos.y > chaser.pos.y) {
			direction = Math.atan((target.pos.y - chaser.pos.y)/(target.pos.x - chaser.pos.x))	//2ND QUADRANT
			chaser.pos.x += speed*Math.cos(direction)
			chaser.pos.y += speed*Math.sin(direction)
		}
	} else if (target.pos.x < chaser.pos.x) {
		if(target.pos.y > chaser.pos.y) {
			direction = Math.atan((chaser.pos.x - target.pos.x)/(target.pos.y - chaser.pos.y))	//3RD QUADRANT
			chaser.pos.x -= speed*Math.sin(direction)
			chaser.pos.y += speed*Math.cos(direction)
		} else if (target.pos.y < chaser.pos.y) {
			direction = Math.atan((chaser.pos.y - target.pos.y)/(chaser.pos.x - target.pos.x))	//4TH QUADRANT
			chaser.pos.x -= speed*Math.cos(direction)
			chaser.pos.y -= speed*Math.sin(direction)
		}
	}
	
	if(distance < speed) {
		chaser.pos.x = target.pos.x
		chaser.pos.y = target.pos.y
		chaser.moving = 0
	} else {
		chaser.moving = 1
	}
}

function lightningNode(posx,posy) {
	this.pos = {x:posx, y:posy}
}

function distance(a,b) {
	return(Math.sqrt(Math.pow(a.pos.x - b.pos.x,2) + Math.pow(a.pos.y - b.pos.y,2)))
}

function lightning(color) {
	
	var dispersion = 0
	var length = 0
	var ballStat = 0
	
	for(var i = 0; i < ballArray.length; i++) {
		if(ballArray[i].moving === 1) {
			ballStat += 1
		}
	}
	
	for(var i = 1; i < ballArray.length; i++) {
		length += distance(ballArray[i],ballArray[i-1])
	}
	
	dispersion = Math.ceil(ballStat/length*20)
	
	stroke(color)
	var lightningArray = []
	for(var i = 0; i < ballArray.length; i++) {
		lightningArray.push(new lightningNode(Math.random()*ballSize*2 + ballArray[i].pos.x - ballSize, Math.random()*ballSize*2 + ballArray[i].pos.y - ballSize))
	}
	
	for(var i = dispersion; i < lightningArray.length; i+= dispersion) {
		if(ballArray[i].moving === 1) {
			line(lightningArray[i].pos.x,lightningArray[i].pos.y,lightningArray[i-dispersion].pos.x,lightningArray[i-dispersion].pos.y)
			lightningChain(lightningArray[i],enemyArray)
		}
	}
}

function lightningChain(shooter,receiverArray) {
	for(var j = 0; j < receiverArray.length; j++) {
		if((distance(shooter,receiverArray[j]) < ballSize*5) && (receiverArray[j].alive === true)) {
			line(shooter.pos.x,shooter.pos.y,receiverArray[j].pos.x,receiverArray[j].pos.y)
			receiverArray[j].color = [0,255,255]
			receiverArray[j].draw()
			receiverArray[j].alive = false
			lightningChain(receiverArray[j],receiverArray)
		}
	}
}











