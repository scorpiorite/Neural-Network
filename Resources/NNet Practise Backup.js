
var networks = []
var canvasHeight = 0
var canvasWidth = 0
var MNISTCanvas = document.getElementById('MNISTCanvas')
var MNISTctx = MNISTCanvas.getContext('2d')
var result = []
var input = 0
var inputArray = []
var expectedArray = []
var lastInputs = []
var nodeRadius = 20
var weightGraph = 200
var errorAverage = 0
var cost = 0
var learnRate = 0
var speedA = 1
var speedOflo = 0
var render = 1
var LTask = 0		// 0 = initial; 1 = 3*5 digit; 2 = MNIST digit; 3 = Obstacle Course
var LMethod = 0		// 0 = initial; 1 = Simple Gradient descent; 2 = Advanced gradient descent; 3 = Evolution
var selectedNet
var turbo = false
var countB = 0
var scrollBar = {pos: 0, length: 50, width: 10, clicked: false, clickPos: 0}
var loadingNet

function setup() {
	
	// canvasHeight = windowHeight
	canvasHeight = document.getElementById('canvasHolder').clientHeight
	// canvasWidth = (windowWidth/2)-1
	canvasWidth = document.getElementById('canvasHolder').clientWidth
	
	var canvas = createCanvas(Math.floor(canvasWidth),canvasHeight)
	
	canvas.parent('canvasHolder')
	
	canvas.mousePressed(canvasClick)
	
	canvas.mouseWheel(canvasScroll)
	
	MNISTCanvas.width = 28
	MNISTCanvas.height = 28
	
	count = 0
	
	frameRate(60)
	
	learnRate = 60
	
	selectedNet = new network("firstNet",[784,18,18,10])
	networks.push(selectedNet)
	console.log(selectedNet)
	
	stop()
}

function draw() {
	
	clear()
	
	if(frameRate() < 1000 && frameRate() > 0) {
		speedParse()
	}
	
	var countA = 0
	
	for(var i = 1; i <= speedA; i++) {
		countA++
		if(countA > 1000) {
			console.log(speedA)
			break;
		}
		netFunction()
	}
	
	if(render === 1) {
		drawNet(selectedNet)
	}
	
	for(var i = 0; i < selectedNet.layer[selectedNet.layer.length-1].neuron.length; i++) {
		document.getElementById('result' + i).style.height = selectedNet.layer[selectedNet.layer.length-1].neuron[i].activation*100 + "%"
		if(i === input) {
			document.getElementById('resultHeader' + i).style.color = 'white'
			document.getElementById('resultHeader' + i).style.background = 'darkgrey'
		} else {
			document.getElementById('resultHeader' + i).style.color = 'black'
			document.getElementById('resultHeader' + i).style.background = 'lightgrey'
		}
	}
	
	if(selectedNet.lastCorrects.length > 10000) {
		selectedNet.lastCorrects.length = 10000
	}
	count = 0
	for(var i = 0; i < selectedNet.lastCorrects.length; i++) {
		count += selectedNet.lastCorrects[i]
	}
	count = count/selectedNet.lastCorrects.length
	document.getElementById('error').innerHTML = (count*100).toFixed(2) + '%'
	
	if(turbo === true) {
		if(frameRate() < 60) {
			learnRate *= 0.9
		} else if(frameRate() > 70) {
			learnRate *= 1.1
		}
	}
}

function newNet() {
	document.getElementById('newNet').style.display = 'block'
	document.getElementById('detailsLeft').style.display = 'none'
	document.getElementById('detailsRight').style.display = 'none'
	
	if(LTask === 1) {
		document.getElementById("newNet").childNodes[12].value = 15
	} else if(LTask === 2) {
		document.getElementById("newNet").childNodes[12].value = 784
	} else {
		document.getElementById("newNet").childNodes[12].value = "Choose a Learning Task"
	}
}

function newLayer() {
	label = document.createElement("p3")
	label.appendChild(document.createTextNode("Layer " + (document.getElementById("newNet").childNodes.length - 9)/3))
	document.getElementById('newNet').appendChild(label)
	document.getElementById('newNet').appendChild(document.createElement("textarea"))
	document.getElementById('newNet').appendChild(document.createElement("br"))
}

function removeLayer() {
	if(document.getElementById("newNet").childNodes.length > 15) {
		for(var i = 0; i < 3; i++) {
			document.getElementById("newNet").removeChild(document.getElementById("newNet").childNodes[document.getElementById("newNet").childNodes.length - 1])
		}
	}
}

function submitNet() {
	var netID = document.getElementById("newNet").childNodes[8].value
	var netDetails = []
	var failed = false
	
	netDetails.push(document.getElementById("newNet").childNodes[12].value)
	for(var i = 16; i < document.getElementById("newNet").childNodes.length; i += 3) {
		netDetails.push(document.getElementById("newNet").childNodes[i].value)
	}
	
	if(netID === "") {
		failed = true
		alert("Please name your Network")
	}
	if(LTask === 1 && netDetails[0] === "15" || LTask === 2 && netDetails[0] === "784") {
		failed = false
	} else {
		failed = true
		alert("The First layer must match a preset value")
	}
	for(var i = 1; i < netDetails.length-1; i++) {
		if(Number.isInteger(parseInt(netDetails[i])) === false) {
			failed = true
			alert("All Layers must have integer values")
		}
	}
	if(netDetails[netDetails.length-1] !== "10") {
		failed = true
		alert("The last Layer must have a value of '10' ")
	}
	console.log(failed)
	
	if(failed === false) {
		networks.push(new network(netID,netDetails))
		console.log(networks)
		
		document.getElementById("newNet").childNodes[8].value = ""
		document.getElementById("newNet").childNodes[12].value = ""
		for(var i = 16; i < document.getElementById("newNet").childNodes.length; i += 3) {
			document.getElementById("newNet").childNodes[i].value = ""
		}
		
		document.getElementById('newNet').style.display = 'none'
		document.getElementById('detailsLeft').style.display = 'block'
		document.getElementById('detailsRight').style.display = 'block'
	}
}

function windowResized() {
	resizeCanvas(document.getElementById('canvasHolder').clientWidth, document.getElementById('canvasHolder').clientHeight)
	
	for(var i = 0; i < selectedNet.layer.length; i++) {
		selectedNet.layer[i].displayOffset = 0
	}
}

function speedParse() {
	speedA = learnRate/Math.round(frameRate()) + speedOflo
	speedOflo = speedA - Math.floor(speedA)
}

function netFunction()  {
	
	input = NaN
	
	if(LTask === 1 && LMethod !== 0) {
		input = Math.floor(Math.random()*10)
		BASICParse(input)
	} else if (LTask === 2) {
		input = Math.floor(Math.random()*10)
		MNISTParse(input)
	}
}

function temp() {
	
}

function turboToggle() {
	
	if(turbo === true) {
		turbo = false
		document.getElementById('turboToggle').parentElement.style.backgroundColor = ''
		
		learnRate = 60
		
		render = 1
	} else {
		turbo = true
		document.getElementById('turboToggle').parentElement.style.backgroundColor = '#7bd'
		
		render = 0
		console.log("Turbo Mode Engaged!")
		
		learnRate = 60
		
		if(document.getElementById('stopToggle').innerHTML === 'Go') {
			document.getElementById('stopToggle').innerHTML = 'Stop'
		}
	}
}

function stop() {
	
	if(turbo === true) {
		turboToggle()
	}
	
	if(document.getElementById('stopToggle').innerHTML === 'Stop') {
		learnRate = 0
		document.getElementById('stopToggle').innerHTML = 'Go'
	} else {
		learnRate = 60
		document.getElementById('stopToggle').innerHTML = 'Stop'
	}
}

function canvasClick() {
	var selectedCount = 0
	
	for(var i = 0; i < selectedNet.layer.length; i++) {
		for(var j = 0; j < selectedNet.layer[i].neuron.length; j++) {
			selectedNet.layer[i].neuron[j].selectedIndex = int
		}
	}
	
	for(var i = 0; i < selectedNet.layer.length; i++) {
		for(var j = 0; j < selectedNet.layer[i].neuron.length; j++) {
			if(selectedNet.layer[i].neuron[j].selected === true) {
				selectedCount++
			}
		}
	}
	
	var selectedCountPast = selectedCount
	
	for(var i = 0; i < selectedNet.layer.length; i++) {
		for(var j = 0; j < selectedNet.layer[i].neuron.length; j++) {
			if(dist(selectedNet.layer[i].neuron[j].pos.x,selectedNet.layer[i].neuron[j].pos.y,mouseX,mouseY) < nodeRadius) {
				
				if(selectedCount === 0) {
					selectedNet.layer[i].neuron[j].selected = true
					selectedCount++
				} else if(selectedCount === 1) {
					
					if(i > 0) {
						for(var n = 0; n < selectedNet.layer[i-1].neuron.length; n++) {
							if(selectedNet.layer[i-1].neuron[n].selected === true) {
								selectedNet.layer[i].neuron[j].selected = true
								selectedNet.layer[i].neuron[j].selectedIndex = n
								selectedCount++
							}
						}
					}
					if(i < selectedNet.layer.length-1) {
						for(var n = 0; n < selectedNet.layer[i+1].neuron.length; n++) {
							if(selectedNet.layer[i+1].neuron[n].selected === true) {
								selectedNet.layer[i].neuron[j].selected = true
								selectedNet.layer[i+1].neuron[n].selectedIndex = j
								selectedCount++
							}
						}
					}
					if(selectedCount !== 2) {
						for(var k = 0; k < selectedNet.layer.length; k ++) {
							for(var m = 0; m < selectedNet.layer[k].neuron.length; m++) {
								selectedNet.layer[k].neuron[m].selected = false
								selectedCount--
							}
						}
						selectedNet.layer[i].neuron[j].selected = true
						selectedCount++
					}
					
				} else if(selectedCount === 2) {
					
					if(i > 0) {
						for(var n = 0; n < selectedNet.layer[i-1].neuron.length; n++) {
							if(selectedNet.layer[i-1].neuron[n].selected === true) {
								selectedNet.layer[i].neuron[j].selectedIndex = n
								selectedCount++
							}
						}
					}
					if(i < selectedNet.layer.length-1) {
						for(var n = 0; n < selectedNet.layer[i+1].neuron.length; n++) {
							if(selectedNet.layer[i+1].neuron[n].selected === true) {
								selectedNet.layer[i+1].neuron[n].selectedIndex = j
								selectedCount++
							}
						}
					}
					if(selectedCount !== 3) {
						for(var k = 0; k < selectedNet.layer.length; k ++) {
							for(var m = 0; m < selectedNet.layer[k].neuron.length; m++) {
								selectedNet.layer[k].neuron[m].selected = false
								selectedCount--
							}
						}
					} else {
						for(var k = 0; k < selectedNet.layer.length; k++) {
							for(var m = 0; m < selectedNet.layer[k].neuron.length; m++) {
								if(k !== i-1 && k!== i+1) {
									selectedNet.layer[k].neuron[m].selected = false
									selectedCount--
								}
							}
						}
					}
					selectedNet.layer[i].neuron[j].selected = true
				} else if(selectedCount > 2) {
					for(var k = 0; k < selectedNet.layer.length; k ++) {
						for(var m = 0; m < selectedNet.layer[k].neuron.length; m++) {
							selectedNet.layer[k].neuron[m].selected = false
							selectedCount--
						}
					}
				}
			}
		}
	}
	
	if(selectedCount === selectedCountPast) {
		for(var i = 0; i < selectedNet.layer.length; i++) {
			for(var j = 0; j < selectedNet.layer[i].neuron.length; j++) {
				selectedNet.layer[i].neuron[j].selected = false
			}
		}
	}
	
	var count = 0
	
	document.getElementById("detailsLeft").innerHTML = ""
	document.getElementById("detailsRight").innerHTML = ""
	
	for(var i = 0; i < selectedNet.layer.length; i++) {
		for(var j = 0; j < selectedNet.layer[i].neuron.length; j++) {
			if(selectedNet.layer[i].neuron[j].selected === true) {
				if(count === 0) {
					displayNeuron(selectedNet.layer[i].neuron[j],"detailsLeft")
					count++
				} else if(count === 1) {
					displayNeuron(selectedNet.layer[i].neuron[j],"detailsRight")
					count++
				}
			}
		}
	}
	
	if(mouseX < scrollBar.width && mouseY > scrollBar.pos && mouseY < scrollBar.pos + scrollBar.length) {
		scrollBar.clicked = true
		scrollBar.clickPos = mouseY - scrollBar.pos
	}
}

function mouseReleased() {
	scrollBar.clicked = false
	selectedNet.layer[0].displayOffset = Math.ceil(selectedNet.layer[0].displayOffset / 10) * 10
}

function canvasScroll(event) {
	for(var i = 0; i < selectedNet.layer.length; i++) {
		if(mouseX > selectedNet.layer[i].neuron[0].pos.x - nodeRadius*2 && mouseX < selectedNet.layer[i].neuron[0].pos.x + nodeRadius*2) {
			if(event.deltaY > 0 && selectedNet.layer[i].displayOffset < 0) {
				selectedNet.layer[i].displayOffset += 10
			} 
			if(event.deltaY < 0 && selectedNet.layer[i].displayOffset > height - selectedNet.layer[i].neuron.length*3*nodeRadius) {
				selectedNet.layer[i].displayOffset -= 10
			}
			// selectedNet.layer[i].displayOffset += event.deltaY
		}
	}
}

function displayNeuron(neuron,displayID) {
	
	var displayElement = ""
	
		displayElement += "Activation: " 			+ neuron.activation 	+ "\n"
		displayElement += "Value: "					+ neuron.value 		+ "\n"
		displayElement += "Bias: "					+ neuron.bias 			+ "\n"
	for(var i = 0; i < neuron.weight.length; i++){
		displayElement += "Weight(" + i + "): "		+ neuron.weight[i] 			+ "\n"
	}
	
	//document.getElementById(displayID).innerHTML = displayElement
}

function inputSelect(LType,input) {
	
	if(LType === "LTask") {
		LTask = input
		if(LTask === 1) {
			document.getElementById('MNISTDigit').style.display = "none"
			document.getElementById('BASICDigit').style.display = "block"
			document.getElementById("newNet").childNodes[12].value = 15
		} else if (LTask === 2) {
			document.getElementById('BASICDigit').style.display = "none"
			document.getElementById('MNISTDigit').style.display = "block"
			document.getElementById("newNet").childNodes[12].value = 784
		}
	}
	if(LType === "LMethod") {
		LMethod = input
	}
	console.log(LTask,LMethod)
	
	document.getElementById(LType).innerHTML = document.getElementById(LType).parentElement.parentElement.children[input].children[0].innerHTML
	
	for(var i = 0; i < document.getElementById(LType).parentElement.parentElement.children.length; i++) {
		document.getElementById(LType).parentElement.parentElement.children[i].classList.remove("dropContentActive")
	}
	
	document.getElementById(LType).parentElement.parentElement.children[input].classList.add("dropContentActive")
}

function MNISTParse(number) {
	var digit = mnist[number].get()
	mnist.draw(digit, MNISTctx)
	
							  //|0|1|2|3|4|5|6|7|8|9|
	if(number === 0) {		  //| | | | | | | | | | |
		expectedArray = 		[1,0,0,0,0,0,0,0,0,0];
	} else if (number === 1) {//| | | | | | | | | | |
		expectedArray = 		[0,1,0,0,0,0,0,0,0,0];
	} else if (number === 2) {//| | | | | | | | | | |
		expectedArray = 		[0,0,1,0,0,0,0,0,0,0];
	} else if (number === 3) {//| | | | | | | | | | |
		expectedArray = 		[0,0,0,1,0,0,0,0,0,0];
	} else if (number === 4) {//| | | | | | | | | | |
		expectedArray = 		[0,0,0,0,1,0,0,0,0,0];
	} else if (number === 5) {//| | | | | | | | | | |
		expectedArray = 		[0,0,0,0,0,1,0,0,0,0];
	} else if (number === 6) {//| | | | | | | | | | |
		expectedArray = 		[0,0,0,0,0,0,1,0,0,0];
	} else if (number === 7) {//| | | | | | | | | | |
		expectedArray = 		[0,0,0,0,0,0,0,1,0,0];
	} else if (number === 8) {//| | | | | | | | | | |
		expectedArray = 		[0,0,0,0,0,0,0,0,1,0];
	} else if (number === 9) {//| | | | | | | | | | |
		expectedArray = 		[0,0,0,0,0,0,0,0,0,1];
	}
	
	selectedNet.train(digit, expectedArray)
	
	maxValue = 0
	maxIndex = 0
	for(var i = 0; i < selectedNet.layer[selectedNet.layer.length-1].neuron.length; i++) {
		if(maxValue < selectedNet.layer[selectedNet.layer.length-1].neuron[i].activation) {
			maxValue = selectedNet.layer[selectedNet.layer.length-1].neuron[i].activation
			maxIndex = i
		}
	}
	if(maxIndex === number) {
		selectedNet.lastCorrects.unshift(1)
	} else {
		selectedNet.lastCorrects.unshift(0)
	}
	
	lastInputs.push(number)
}

function BASICParse(number) {
	
	input = number
							  //|  1  |  2  |  3  |  4  |  5  |					 |0|1|2|3|4|5|6|7|8|9|
	if(number === 0) {		  //|     |     |     |     |     |					 | | | | | | | | | | |
		inputArray = 			[1,1,1,1,0,1,1,0,1,1,0,1,1,1,1]; expectedArray = [1,0,0,0,0,0,0,0,0,0];
	} else if (number === 1) {//|     |     |     |     |     |					 | | | | | | | | | | |
		inputArray = 			[0,1,0,0,1,0,0,1,0,0,1,0,0,1,0]; expectedArray = [0,1,0,0,0,0,0,0,0,0];
	} else if (number === 2) {//|     |     |     |     |     |					 | | | | | | | | | | |
		inputArray = 			[1,1,1,0,0,1,1,1,1,1,0,0,1,1,1]; expectedArray = [0,0,1,0,0,0,0,0,0,0];
	} else if (number === 3) {//|     |     |     |     |     |					 | | | | | | | | | | |
		inputArray = 			[1,1,1,0,0,1,1,1,1,0,0,1,1,1,1]; expectedArray = [0,0,0,1,0,0,0,0,0,0];
	} else if (number === 4) {//|     |     |     |     |     |					 | | | | | | | | | | |
		inputArray = 			[1,0,1,1,0,1,1,1,1,0,0,1,0,0,1]; expectedArray = [0,0,0,0,1,0,0,0,0,0];
	} else if (number === 5) {//|     |     |     |     |     |					 | | | | | | | | | | |
		inputArray = 			[1,1,1,1,0,0,1,1,1,0,0,1,1,1,1]; expectedArray = [0,0,0,0,0,1,0,0,0,0];
	} else if (number === 6) {//|     |     |     |     |     |					 | | | | | | | | | | |
		inputArray = 			[1,1,1,1,0,0,1,1,1,1,0,1,1,1,1]; expectedArray = [0,0,0,0,0,0,1,0,0,0];
	} else if (number === 7) {//|     |     |     |     |     |					 | | | | | | | | | | |
		inputArray = 			[1,1,1,0,0,1,0,0,1,0,0,1,0,0,1]; expectedArray = [0,0,0,0,0,0,0,1,0,0];
	} else if (number === 8) {//|     |     |     |     |     |					 | | | | | | | | | | |
		inputArray = 			[1,1,1,1,0,1,1,1,1,1,0,1,1,1,1]; expectedArray = [0,0,0,0,0,0,0,0,1,0];
	} else if (number === 9) {//|     |     |     |     |     |					 | | | | | | | | | | |
		inputArray = 			[1,1,1,1,0,1,1,1,1,0,0,1,0,0,1]; expectedArray = [0,0,0,0,0,0,0,0,0,1];
	}
	
	for(var i = 0; i < 15; i++) {
		if(inputArray[i] === 0) {
			document.getElementById('aim' + (i + 1)).style.backgroundColor = "white"
		} else {
			document.getElementById('aim' + (i + 1)).style.backgroundColor = "black"
		}
	}
	
	selectedNet.train(inputArray, expectedArray)
	
	maxValue = 0
	maxIndex = 0
	for(var i = 0; i < selectedNet.layer[selectedNet.layer.length-1].neuron.length; i++) {
		if(maxValue < selectedNet.layer[selectedNet.layer.length-1].neuron[i].activation) {
			maxValue = selectedNet.layer[selectedNet.layer.length-1].neuron[i].activation
			maxIndex = i
		}
	}
	if(maxIndex === input) {
		selectedNet.lastCorrects.unshift(1)
	} else {
		selectedNet.lastCorrects.unshift(0)
	}
	
	lastInputs.push(number)
}

function checkInputs(inputs,outputs) {
	
	var countArray = []
	var count = 0
	
	for(var i = 0; i < outputs.length; i++) {
		for(var j = 0; j < inputs.length; j++) {
			if(inputs[j] === outputs[i]) {
				countArray[i] = 1
			}
		}
	}
	
	for(var i = 0; i < outputs.length; i++) {
		if(countArray[i] > 0) {
			count += 1
		}
	}
	
	if(count === outputs.length) {
		return(true)
	}
}

function drawNet(net) {
	
	var cols = net.layer.length
	var colWidth = width/cols
	var rows = 0
	var rowHeight = 0
	var xArray = []
	var yArray = []
	nodeRadius = height/45
	
	if(mouseIsPressed && scrollBar.clicked === true && scrollBar.pos >= 0 && scrollBar.pos <= height-scrollBar.length) {
		scrollBar.pos = mouseY - scrollBar.clickPos
		net.layer[0].displayOffset = -(scrollBar.pos/(height-scrollBar.length))*(net.layer[0].neuron.length*nodeRadius*3 - height)
	} else if(mouseIsPressed && scrollBar.clicked === true && scrollBar.pos < 0) {
		scrollBar.clicked = false
		scrollBar.pos = 0
		net.layer[0].displayOffset = -(scrollBar.pos/(height-scrollBar.length))*(net.layer[0].neuron.length*nodeRadius*3 - height)
	} else if(mouseIsPressed && scrollBar.clicked === true && scrollBar.pos > height-scrollBar.length) {
		scrollBar.clicked = false
		scrollBar.pos = height - scrollBar.length
		net.layer[0].displayOffset = -(scrollBar.pos/(height-scrollBar.length))*(net.layer[0].neuron.length*nodeRadius*3 - height)
	}
	
	scrollBar.pos = (-net.layer[0].displayOffset/(net.layer[0].neuron.length*nodeRadius*3 - height))*(height-scrollBar.length)
	stroke(119,187,221)
	fill(119,187,221)
	rect(0,scrollBar.pos,scrollBar.width,scrollBar.length)
	
	for(var i = 0; i < net.layer.length; i++) {
		if(height < net.layer[i].neuron.length*3*nodeRadius) {
			for(var j = 0; j < net.layer[i].neuron.length; j++) {
				net.layer[i].neuron[j].pos.x = colWidth*i + colWidth/2
				net.layer[i].neuron[j].pos.y = nodeRadius*3*j + nodeRadius*3/2 + net.layer[i].displayOffset
			}
		} else {
			for(var j = 0; j < net.layer[i].neuron.length; j++) {
				net.layer[i].neuron[j].pos.x = colWidth*i + colWidth/2
				net.layer[i].neuron[j].pos.y = (height/net.layer[i].neuron.length)*j + (height/net.layer[i].neuron.length)/2
			}
		}
		if(net.layer[i].neuron.length > height/nodeRadius/3 && i > 0) {
			for(var j = - Math.ceil(net.layer[i].displayOffset/nodeRadius/3); j < height/nodeRadius/3 - net.layer[i].displayOffset/nodeRadius/3; j++) {
				if(net.layer[i-1].neuron.length > height/nodeRadius/3 && j < net.layer[i].neuron.length && j >= 0) {
					for(var n = - Math.ceil(net.layer[i-1].displayOffset/nodeRadius/3); n < height/nodeRadius/3 - net.layer[i-1].displayOffset/nodeRadius/3; n++) {
						if(n < net.layer[i-1].neuron.length && n >= 0) {
							if(net.layer[i].neuron[j].selectedIndex == n) {
								stroke(255,0,0)
							} else if(net.layer[i].neuron[j].weight[n] > 0) {
								stroke(255-(net.activate(net.layer[i].neuron[j].weight[n])-0.5)*2*255,255,255)
							} else {
								stroke(net.activate(net.layer[i].neuron[j].weight[n])*2*255,net.activate(net.layer[i].neuron[j].weight[n])*2*255,255)
							}
							line(net.layer[i].neuron[j].pos.x-nodeRadius,net.layer[i].neuron[j].pos.y,net.layer[i-1].neuron[n].pos.x+nodeRadius,net.layer[i-1].neuron[n].pos.y)
						}
					}
				} else if(j < net.layer[i].neuron.length && j >= 0) {
					for(var n = 0; n < net.layer[i-1].neuron.length; n++) {
						if(n < net.layer[i-1].neuron.length) {
							if(net.layer[i].neuron[j].selectedIndex == n) {
								stroke(255,0,0)
							} else if(net.layer[i].neuron[j].weight[n] > 0) {
								stroke(255-(net.activate(net.layer[i].neuron[j].weight[n])-0.5)*2*255,255,255)
							} else {
								stroke(net.activate(net.layer[i].neuron[j].weight[n])*2*255,net.activate(net.layer[i].neuron[j].weight[n])*2*255,255)
							}
							line(net.layer[i].neuron[j].pos.x-nodeRadius,net.layer[i].neuron[j].pos.y,net.layer[i-1].neuron[n].pos.x+nodeRadius,net.layer[i-1].neuron[n].pos.y)
						}
					}
				}
			}
		} else if(i > 0) {
			for(var j = 0; j < net.layer[i].neuron.length; j++) {
				if(net.layer[i-1].neuron.length > height/nodeRadius/3) {
					for(var n = - Math.ceil(net.layer[i-1].displayOffset/nodeRadius/3); n < height/nodeRadius/3 - net.layer[i-1].displayOffset/nodeRadius/3; n++) {
						if(n < net.layer[i-1].neuron.length && n >= 0) {
							if(net.layer[i].neuron[j].selectedIndex == n) {
								stroke(255,0,0)
							} else if(net.layer[i].neuron[j].weight[n] > 0) {
								stroke(255-(net.activate(net.layer[i].neuron[j].weight[n])-0.5)*2*255,255,255)
							} else {
								stroke(net.activate(net.layer[i].neuron[j].weight[n])*2*255,net.activate(net.layer[i].neuron[j].weight[n])*2*255,255)
							}
							line(net.layer[i].neuron[j].pos.x-nodeRadius,net.layer[i].neuron[j].pos.y,net.layer[i-1].neuron[n].pos.x+nodeRadius,net.layer[i-1].neuron[n].pos.y)
						}
					}
				} else {
					for(var n = 0; n < net.layer[i-1].neuron.length; n++) {
						if(n < net.layer[i-1].neuron.length) {
							if(net.layer[i].neuron[j].selectedIndex == n) {
								stroke(255,0,0)
							} else if(net.layer[i].neuron[j].weight[n] > 0) {
								stroke(255-(net.activate(net.layer[i].neuron[j].weight[n])-0.5)*2*255,255,255)
							} else {
								stroke(net.activate(net.layer[i].neuron[j].weight[n])*2*255,net.activate(net.layer[i].neuron[j].weight[n])*2*255,255)
							}
							line(net.layer[i].neuron[j].pos.x-nodeRadius,net.layer[i].neuron[j].pos.y,net.layer[i-1].neuron[n].pos.x+nodeRadius,net.layer[i-1].neuron[n].pos.y)
						}
					}
				}
			}
		}
	}
	
	for(var i = 0; i < cols; i++) {
		rows = net.layer[i].neuron.length
		for(var j = 0; j < net.layer[i].neuron.length; j++) {
			drawNode(net.layer[i].neuron[j].pos.x,net.layer[i].neuron[j].pos.y,net.layer[i].neuron[j].activation.toFixed(2),net.layer[i].neuron[j].selected)
		}
	}
}

function drawNode(x,y,content,selected) {
	
	
	if(selected === true) {
		fill("pink")
	} else {
		fill(255,255,255)
	}
	
	stroke(0,0,0)
	ellipse(x,y,nodeRadius*2,nodeRadius*2)
	
	stroke(255)
	fill(0)
	textSize(nodeRadius)
	textAlign(CENTER,CENTER)
	text(content,x,y)
}