
// Please forgive me for my sins
var networks = []
var canvasHeight = 0
var canvasWidth = 0
var MNISTCanvas = document.getElementById('MNISTCanvas')
var MNISTctx = MNISTCanvas.getContext('2d')
var graphCanvas = document.getElementById('graphCanvas')
var graphCanvasCTX = graphCanvas.getContext('2d')
var result = []
var input = 0
var inputArray = []
var expectedArray = []
var lastInputs = []
var nodeRadius = 20
var weightGraph = 200
var errorAverage = 0
var cost = 0
var learn = false
var speedA = 1
var speedOflo = 0
var render = 1
var LTask = 2
var LMethod = 2
var selectedNet
var turbo = false
var turboBuffer = 0
var countB = 0
var scrollBar = {pos: 0, length: 50, width: 10, clicked: false, clickPos: 0}
var loadingNet
var savedNets
var benchThis = 0
var benchLast = 0
var benchDiff = 0

function setup() { //P5js calls this function on start-up
	
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
	
	graphCanvas.width = document.getElementById('errorCount').clientWidth
	graphCanvas.height = document.getElementById('errorCount').clientHeight
	
	graphCanvasCTX.moveTo(0,0)
	graphCanvasCTX.lineTo(graphCanvas.width,graphCanvas.height)
	graphCanvasCTX.stroke()
	
	count = 0
	
	frameRate(60)
	
	learnRate = 60
	
	if(localStorage.savedNets) {
		savedNets = JSON.parse(localStorage.savedNets)
		for(var i = 0; i < savedNets.length; i++) {
			title = savedNets[i]
			networks.push(parseNetwork(localStorage.title))
		}
	} else {
		savedNets = []
	}

	selectedNet = 0
	
	//networks.push(parseNetwork(testNetString))
	networks.push(new network_matrix("test_matrix",[784,18,18,10]))
	
	loadNets()
	
	stop()
}

function draw() { //P5js loops this function 60 times per second (as defined by 'frameRate()')
	
	clear()
	
	var countA = 0
	
	if(learn === true) {
		netFunction()
	}
	
	if(render === 1) {
		//drawNet(networks[selectedNet])
	}
	
	for(var i = 0; i < networks[selectedNet].layers[networks[selectedNet].layers.length-1].length; i++) {
		document.getElementById('result' + i).style.height = networks[selectedNet].layers[networks[selectedNet].layers.length-1][i][0][1]*100 + "%"
		if(i === input) {
			document.getElementById('resultHeader' + i).style.color = 'white'
			document.getElementById('resultHeader' + i).style.background = 'darkgrey'
		} else {
			document.getElementById('resultHeader' + i).style.color = 'black'
			document.getElementById('resultHeader' + i).style.background = 'lightgrey'
		}
	}
	
	if(networks[selectedNet].lastCorrects.length > 1000) {
		networks[selectedNet].lastCorrects.length = 1000
	}
	count = 0
	for(var i = 0; i < networks[selectedNet].lastCorrects.length; i++) {
		count += networks[selectedNet].lastCorrects[i]
	}
	count = count/networks[selectedNet].lastCorrects.length
	document.getElementById('error').innerHTML = (count*100).toFixed(1) + '%'
	
	graphCanvasCTX.clearRect(0, 0, graphCanvas.width, graphCanvas.height)
	for(var i = 0; i < graphCanvas.width; i++) {
		if(i > graphCanvas.width) {
			break;
		} else {
			if(networks[selectedNet].lastCorrects[i] === 1) {
				graphCanvasCTX.strokeStyle = "#00FF00"
			} else if(networks[selectedNet].lastCorrects[i] === 0) {
				graphCanvasCTX.strokeStyle = "#FF0000"
			} else {
				graphCanvasCTX.strokeStyle = "#000000"
			}
			graphCanvasCTX.beginPath()
			graphCanvasCTX.imageSmoothingEnabled = false
			graphCanvasCTX.moveTo(i+1.5,0)
			graphCanvasCTX.lineTo(i+1.5,graphCanvas.height)
			graphCanvasCTX.stroke()
			graphCanvasCTX.closePath()
		}
	}
	
	document.getElementById('turboMultiplier').innerHTML = 'x' + document.getElementById('turboSlider').value
	
	benchLast = benchThis
	benchThis = new Date()
	benchDiff = benchThis - benchLast
	if(turbo === true) {
		if(benchDiff > 16) { //Maybe turboBuffer *= 1.1??
			turboBuffer--
		} else {
			turboBuffer++
		}
		sliderTemp = document.getElementById('turboSlider').value
		if(turboBuffer > 5) {
			sliderTemp++
			console.log(turboBuffer, benchDiff)
			turboBuffer = 0
		} else if(turboBuffer < -5) {
			sliderTemp--
			console.log(turboBuffer, benchDiff)
			turboBuffer = 0
		}
		document.getElementById('turboSlider').value = sliderTemp
	}
}

function netTemp(x) {
	networks[x].layers[1][0][1][1] = 0.15
	networks[x].layers[1][0][1][2] = 0.2
	networks[x].layers[1][1][1][1] = 0.25
	networks[x].layers[1][1][1][2] = 0.3
	networks[x].layers[1][0][1][0] = 0.35
	networks[x].layers[1][1][1][0] = 0.35
	
	networks[x].layers[2][0][1][1] = 0.4
	networks[x].layers[2][0][1][2] = 0.45
	networks[x].layers[2][1][1][1] = 0.5
	networks[x].layers[2][1][1][2] = 0.55
	networks[x].layers[2][0][1][0] = 0.6
	networks[x].layers[2][1][1][0] = 0.6
}

function newNet() { //Opens 'new Network' IU, attached to 'New Network' Button
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

function newLayer() { //Creates new layer in the 'new Network' IU, attached to 'New Layer' Button
	label = document.createElement("p3")
	label.appendChild(document.createTextNode("Layer " + (document.getElementById("newNet").childNodes.length - 9)/3))
	document.getElementById('newNet').appendChild(label)
	document.getElementById('newNet').appendChild(document.createElement("textarea"))
	document.getElementById('newNet').appendChild(document.createElement("br"))
}

function removeLayer() { //Removes Layer from the 'new Network' IU, attached to 'Remove Layer' Button
	if(document.getElementById("newNet").childNodes.length > 15) {
		for(var i = 0; i < 3; i++) {
			document.getElementById("newNet").removeChild(document.getElementById("newNet").childNodes[document.getElementById("newNet").childNodes.length - 1])
		}
	}
}

function submitNet() { //Generates a new Network Object based on user's selection in the 'new Network' IU, attached to 'Submit' button
	var netID = document.getElementById("newNet").childNodes[8].value
	var netDetails = []
	var failed = false
	
	netDetails.push(document.getElementById("newNet").childNodes[12].value)
	for(var i = 16; i < document.getElementById("newNet").childNodes.length; i += 3) {
		netDetails.push(document.getElementById("newNet").childNodes[i].value)
	}
	
	if(netID === "" || hasNumber(netID)) {
		failed = true
		alert("Your Network name must contain at least 1 non-number character")
	}
	if(LTask === 1 && netDetails[0] === "15" || LTask === 2 && netDetails[0] === "784") {
		
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
	for(var i = 0; i < networks.length; i++) {
		if(networks[i].id.toLowerCase() === netID.toLowerCase()) {
			failed = true
			alert("You cannot have two networks with the same name (not case sensitive)")
		}
	}
	
	if(failed === false) {
		networks.push(new network(netID,netDetails))
		
		document.getElementById("newNet").childNodes[8].value = ""
		document.getElementById("newNet").childNodes[12].value = ""
		for(var i = 16; i < document.getElementById("newNet").childNodes.length; i += 3) {
			document.getElementById("newNet").childNodes[i].value = ""
		}
		
		document.getElementById('newNet').style.display = 'none'
		document.getElementById('detailsLeft').style.display = 'block'
		document.getElementById('detailsRight').style.display = 'block'
	}
	
	loadNets()
}

function hasNumber(myString) { //RegeX expression to detect if a string contains numbers
  return /\d/.test(myString);
}

function loadNets() { //Manages listing Networks under 'Networks' drop bar
	
	for(var i = document.getElementById('networks').childNodes.length - 1; i > 2; i--) {
		document.getElementById('networks').removeChild(document.getElementById('networks').childNodes[i])
	}
	
	bubbleSort(networks)
	
	for(var i = 0; i < networks.length; i++) {
		label = document.createElement("p3")
		label.appendChild(document.createTextNode(networks[i].id))
		div = document.createElement("div")
		div.classList.add("dropContent")
		div.setAttribute("id",networks[i].id)
		div.addEventListener("click", function() {
			networkSelect(this.id)
		})
		div.appendChild(label)
		document.getElementById('networks').appendChild(div)
	}
}

function saveNet() { //Saves Networks to local Storage, attached to 'Save Network' Button
	
	for(var i = 0; i < savedNets.length; i++) {
		if(savedNets[i].id === networks[selectedNet].id) {
			savedNets[i] === networks[selectedNet]
		} else {
			savedNets.push(networks[selectedNet])
		}
	}
	
	if(savedNets.length === 0) {
		savedNets.push(networks[selectedNet])
	}
	
	localStorage.savedNets = JSON.stringify(savedNets)
	
	parseSaves()
}

function parseSaves() { //Saves Networks to local Storage (part of 'saveNet()')
	
	for(var i = 0; i < savedNets.length; i++) {
		title = savedNets[i].id
		localStorage.title = JSON.stringify(networks[selectedNet])
	}
}

function deleteNet() { //Deletes Networks, attached to 'Delete Network' Button
	
	for(var i = 0; i < savedNets.length; i++) {
		if(savedNets[i].id === networks[selectedNet].id) {
			savedNets.splice(i,0)
		}
	}
	
	title = networks[selectedNet].id
	localStorage.removeItem(title)
	
	networks.splice(selectedNet,1)
	
	loadNets()
}

function windowResized() { //Resizes Canvas upon change in window size
	resizeCanvas(document.getElementById('canvasHolder').clientWidth, document.getElementById('canvasHolder').clientHeight)
	
	for(var i = 0; i < networks[selectedNet].layer.length; i++) {
		networks[selectedNet].layer[i].displayOffset = 0
	}
	
	graphCanvas.width = document.getElementById('errorCount').clientWidth
	graphCanvas.height = document.getElementById('errorCount').clientHeight
}

function netFunction() { //Manages the function of the active Network
	
	input = NaN
	
	if(LTask === 1 && LMethod !== 0) {
		input = Math.floor(Math.random()*10)
		BASICParse(input)
	} else if (LTask === 2) {
		for(var i = 0; i < document.getElementById('turboSlider').value; i++) {
			input = Math.floor(Math.random()*10)
			MNISTParse(input)
		}
	}
}

function turboLoop() {
	// Nothing right now
	// if(turbo === true) {
		// window.requestAnimationFrame(window.setTimeout(turboLoop(),1000))
		// netFunction()
	// }
}

function turboToggle() { //Manages TurboMode, attached to 'Turbo' Button
	
	if(turbo === true) {
		turbo = false
		document.getElementById('turboToggle').parentElement.style.backgroundColor = ''
		
		render = 1
	} else {
		turbo = true
		document.getElementById('turboToggle').parentElement.style.backgroundColor = '#7bd'
		turboBuffer = 0
		render = 0

		turboLoop()
	}
}

function stop() { //Halts and Resumed the networks progress
	
	if(document.getElementById('stopToggle').innerHTML === 'Stop') {
		learn = false
		document.getElementById('stopToggle').innerHTML = 'Go'
	} else {
		learn = true
		document.getElementById('stopToggle').innerHTML = 'Stop'
	}
}

function canvasClick() { //Manages Neuron Selection on the Canvas
	var selectedCount = 0
	
	for(var i = 0; i < networks[selectedNet].layer.length; i++) {
		for(var j = 0; j < networks[selectedNet].layer[i].neuron.length; j++) {
			networks[selectedNet].layer[i].neuron[j].selectedIndex = int
		}
	}
	
	for(var i = 0; i < networks[selectedNet].layer.length; i++) {
		for(var j = 0; j < networks[selectedNet].layer[i].neuron.length; j++) {
			if(networks[selectedNet].layer[i].neuron[j].selected === true) {
				selectedCount++
			}
		}
	}
	
	var selectedCountPast = selectedCount
	
	for(var i = 0; i < networks[selectedNet].layer.length; i++) {
		for(var j = 0; j < networks[selectedNet].layer[i].neuron.length; j++) {
			if(dist(networks[selectedNet].layer[i].neuron[j].pos.x,networks[selectedNet].layer[i].neuron[j].pos.y,mouseX,mouseY) < nodeRadius) {
				
				if(selectedCount === 0) {
					networks[selectedNet].layer[i].neuron[j].selected = true
					selectedCount++
				} else if(selectedCount === 1) {
					
					if(i > 0) {
						for(var n = 0; n < networks[selectedNet].layer[i-1].neuron.length; n++) {
							if(networks[selectedNet].layer[i-1].neuron[n].selected === true) {
								networks[selectedNet].layer[i].neuron[j].selected = true
								networks[selectedNet].layer[i].neuron[j].selectedIndex = n
								selectedCount++
							}
						}
					}
					if(i < networks[selectedNet].layer.length-1) {
						for(var n = 0; n < networks[selectedNet].layer[i+1].neuron.length; n++) {
							if(networks[selectedNet].layer[i+1].neuron[n].selected === true) {
								networks[selectedNet].layer[i].neuron[j].selected = true
								networks[selectedNet].layer[i+1].neuron[n].selectedIndex = j
								selectedCount++
							}
						}
					}
					if(selectedCount !== 2) {
						for(var k = 0; k < networks[selectedNet].layer.length; k ++) {
							for(var m = 0; m < networks[selectedNet].layer[k].neuron.length; m++) {
								networks[selectedNet].layer[k].neuron[m].selected = false
								selectedCount--
							}
						}
						networks[selectedNet].layer[i].neuron[j].selected = true
						selectedCount++
					}
					
				} else if(selectedCount === 2) {
					
					if(i > 0) {
						for(var n = 0; n < networks[selectedNet].layer[i-1].neuron.length; n++) {
							if(networks[selectedNet].layer[i-1].neuron[n].selected === true) {
								networks[selectedNet].layer[i].neuron[j].selectedIndex = n
								selectedCount++
							}
						}
					}
					if(i < networks[selectedNet].layer.length-1) {
						for(var n = 0; n < networks[selectedNet].layer[i+1].neuron.length; n++) {
							if(networks[selectedNet].layer[i+1].neuron[n].selected === true) {
								networks[selectedNet].layer[i+1].neuron[n].selectedIndex = j
								selectedCount++
							}
						}
					}
					if(selectedCount !== 3) {
						for(var k = 0; k < networks[selectedNet].layer.length; k ++) {
							for(var m = 0; m < networks[selectedNet].layer[k].neuron.length; m++) {
								networks[selectedNet].layer[k].neuron[m].selected = false
								selectedCount--
							}
						}
					} else {
						for(var k = 0; k < networks[selectedNet].layer.length; k++) {
							for(var m = 0; m < networks[selectedNet].layer[k].neuron.length; m++) {
								if(k !== i-1 && k!== i+1) {
									networks[selectedNet].layer[k].neuron[m].selected = false
									selectedCount--
								}
							}
						}
					}
					networks[selectedNet].layer[i].neuron[j].selected = true
				} else if(selectedCount > 2) {
					for(var k = 0; k < networks[selectedNet].layer.length; k ++) {
						for(var m = 0; m < networks[selectedNet].layer[k].neuron.length; m++) {
							networks[selectedNet].layer[k].neuron[m].selected = false
							selectedCount--
						}
					}
				}
			}
		}
	}
	
	if(selectedCount === selectedCountPast) {
		for(var i = 0; i < networks[selectedNet].layer.length; i++) {
			for(var j = 0; j < networks[selectedNet].layer[i].neuron.length; j++) {
				networks[selectedNet].layer[i].neuron[j].selected = false
			}
		}
	}
	
	var count = 0
	
	document.getElementById("detailsLeft").innerHTML = ""
	document.getElementById("detailsRight").innerHTML = ""
	
	for(var i = 0; i < networks[selectedNet].layer.length; i++) {
		for(var j = 0; j < networks[selectedNet].layer[i].neuron.length; j++) {
			if(networks[selectedNet].layer[i].neuron[j].selected === true) {
				if(count === 0) {
					displayNeuron(networks[selectedNet].layer[i].neuron[j],"detailsLeft")
					count++
				} else if(count === 1) {
					displayNeuron(networks[selectedNet].layer[i].neuron[j],"detailsRight")
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

function mouseReleased() { //Fixes some issues with incorrect canvas scrolling on mouseoff
	scrollBar.clicked = false
	networks[selectedNet].layer[0].displayOffset = Math.ceil(networks[selectedNet].layer[0].displayOffset / 10) * 10
}

function canvasScroll(event) { //Event listener for canvas scrolling
	for(var i = 0; i < networks[selectedNet].layer.length; i++) {
		if(mouseX > networks[selectedNet].layer[i].neuron[0].pos.x - nodeRadius*2 && mouseX < networks[selectedNet].layer[i].neuron[0].pos.x + nodeRadius*2) {
			if(event.deltaY > 0 && networks[selectedNet].layer[i].displayOffset < 0) {
				networks[selectedNet].layer[i].displayOffset += 10
			} 
			if(event.deltaY < 0 && networks[selectedNet].layer[i].displayOffset > height - networks[selectedNet].layer[i].neuron.length*3*nodeRadius) {
				networks[selectedNet].layer[i].displayOffset -= 10
			}
			// networks[selectedNet].layer[i].displayOffset += event.deltaY
		}
	}
}

function networkSelect(input) { //Manages selected network in the 'Networks' drop box
	for(var i = 0; i < networks.length; i++) {
		document.getElementById(networks[i].id).classList.remove('dropContentActive')
	}
	document.getElementById(input).classList.add('dropContentActive')
	
	selectedNet = binarySearch(input,networks)
}

function MNISTParse(number) { //Generates some of the required Input data for MNIST database
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
	
	networks[selectedNet].train(digit, expectedArray)
	
	maxValue = 0
	maxIndex = 0
	
	for(var i = 0; i < networks[selectedNet].layers[networks[selectedNet].layers.length-1].length; i++) {
		if(maxValue < networks[selectedNet].layers[networks[selectedNet].layers.length-1][i][0][1]) {
			maxValue = networks[selectedNet].layers[networks[selectedNet].layers.length-1][i][0][1]
			maxIndex = i
		}
	}
	
	// for(var i = 0; i < networks[selectedNet].layer[networks[selectedNet].layer.length-1].neuron.length; i++) {
		// if(maxValue < networks[selectedNet].layer[networks[selectedNet].layer.length-1].neuron[i].activation) {
			// maxValue = networks[selectedNet].layer[networks[selectedNet].layer.length-1].neuron[i].activation
			// maxIndex = i
		// }
	// }
	if(maxIndex === number) {
		networks[selectedNet].lastCorrects.unshift(1)
	} else {
		networks[selectedNet].lastCorrects.unshift(0)
	}
	
	lastInputs.push(number)
}

function drawNet(net) { //Renders the active Network with the help of P5js
						//Neuron Position data does not exist with new model -> must be updated
						//Perhaps redesign entire rednering engine

	var cols = net.layers.length
	var colWidth = width/cols
	var rows = 0
	var rowHeight = 0
	var xArray = []
	var yArray = []
	nodeRadius = height/45
	
	if(mouseIsPressed && scrollBar.clicked === true && scrollBar.pos >= 0 && scrollBar.pos <= height-scrollBar.length) {
		scrollBar.pos = mouseY - scrollBar.clickPos
		net.layers[0].displayOffset = -(scrollBar.pos/(height-scrollBar.length))*(net.layers[0].length*nodeRadius*3 - height)
	} else if(mouseIsPressed && scrollBar.clicked === true && scrollBar.pos < 0) {
		scrollBar.clicked = false
		scrollBar.pos = 0
		net.layers[0].displayOffset = -(scrollBar.pos/(height-scrollBar.length))*(net.layers[0].length*nodeRadius*3 - height)
	} else if(mouseIsPressed && scrollBar.clicked === true && scrollBar.pos > height-scrollBar.length) {
		scrollBar.clicked = false
		scrollBar.pos = height - scrollBar.length
		net.layers[0].displayOffset = -(scrollBar.pos/(height-scrollBar.length))*(net.layers[0].length*nodeRadius*3 - height)
	}
	
	scrollBar.pos = (-net.layers[0].displayOffset/(net.layers[0].length*nodeRadius*3 - height))*(height-scrollBar.length)
	stroke(119,187,221)
	fill(119,187,221)
	rect(0,scrollBar.pos,scrollBar.width,scrollBar.length)
	
	for(var i = 0; i < net.layers.length; i++) {
		if(height < net.layers[i].length*3*nodeRadius) {
			for(var j = 0; j < net.layers[i].length; j++) {
				net.layers[i][j].pos.x = colWidth*i + colWidth/2
				net.layers[i][j].pos.y = nodeRadius*3*j + nodeRadius*3/2 + net.layers[i].displayOffset
			}
		} else {
			for(var j = 0; j < net.layers[i].length; j++) {
				net.layers[i][j].pos.x = colWidth*i + colWidth/2
				net.layers[i][j].pos.y = (height/net.layers[i].length)*j + (height/net.layers[i].length)/2
			}
		}
		if(net.layers[i].length > height/nodeRadius/3 && i > 0) {
			for(var j = - Math.ceil(net.layers[i].displayOffset/nodeRadius/3); j < height/nodeRadius/3 - net.layers[i].displayOffset/nodeRadius/3; j++) {
				if(net.layers[i-1].length > height/nodeRadius/3 && j < net.layers[i].length && j >= 0) {
					for(var n = - Math.ceil(net.layers[i-1].displayOffset/nodeRadius/3); n < height/nodeRadius/3 - net.layers[i-1].displayOffset/nodeRadius/3; n++) {
						if(n < net.layers[i-1].length && n >= 0) {
							if(net.layers[i][j].selectedIndex == n) {
								stroke(255,0,0)
							} else if(net.layers[i][j].weight[n] > 0) {
								stroke(255-(net.activate(net.layers[i][j].weight[n])-0.5)*2*255,255,255)
							} else {
								stroke(net.activate(net.layers[i][j].weight[n])*2*255,net.activate(net.layers[i][j].weight[n])*2*255,255)
							}
							line(net.layers[i][j].pos.x-nodeRadius,net.layers[i][j].pos.y,net.layers[i-1][n].pos.x+nodeRadius,net.layers[i-1][n].pos.y)
						}
					}
				} else if(j < net.layers[i].length && j >= 0) {
					for(var n = 0; n < net.layers[i-1].length; n++) {
						if(n < net.layers[i-1].length) {
							if(net.layers[i][j].selectedIndex == n) {
								stroke(255,0,0)
							} else if(net.layers[i][j].weight[n] > 0) {
								stroke(255-(net.activate(net.layers[i][j].weight[n])-0.5)*2*255,255,255)
							} else {
								stroke(net.activate(net.layers[i][j].weight[n])*2*255,net.activate(net.layers[i][j].weight[n])*2*255,255)
							}
							line(net.layers[i][j].pos.x-nodeRadius,net.layers[i][j].pos.y,net.layers[i-1][n].pos.x+nodeRadius,net.layers[i-1][n].pos.y)
						}
					}
				}
			}
		} else if(i > 0) {
			for(var j = 0; j < net.layers[i].length; j++) {
				if(net.layers[i-1].length > height/nodeRadius/3) {
					for(var n = - Math.ceil(net.layers[i-1].displayOffset/nodeRadius/3); n < height/nodeRadius/3 - net.layers[i-1].displayOffset/nodeRadius/3; n++) {
						if(n < net.layers[i-1].length && n >= 0) {
							if(net.layers[i][j].selectedIndex == n) {
								stroke(255,0,0)
							} else if(net.layers[i][j].weight[n] > 0) {
								stroke(255-(net.activate(net.layers[i][j].weight[n])-0.5)*2*255,255,255)
							} else {
								stroke(net.activate(net.layers[i][j].weight[n])*2*255,net.activate(net.layers[i][j].weight[n])*2*255,255)
							}
							line(net.layers[i][j].pos.x-nodeRadius,net.layers[i][j].pos.y,net.layers[i-1][n].pos.x+nodeRadius,net.layers[i-1][n].pos.y)
						}
					}
				} else {
					for(var n = 0; n < net.layers[i-1].length; n++) {
						if(n < net.layers[i-1].length) {
							if(net.layers[i][j].selectedIndex == n) {
								stroke(255,0,0)
							} else if(net.layers[i][j].weight[n] > 0) {
								stroke(255-(net.activate(net.layers[i][j].weight[n])-0.5)*2*255,255,255)
							} else {
								stroke(net.activate(net.layers[i][j].weight[n])*2*255,net.activate(net.layers[i][j].weight[n])*2*255,255)
							}
							line(net.layers[i][j].pos.x-nodeRadius,net.layers[i][j].pos.y,net.layers[i-1][n].pos.x+nodeRadius,net.layers[i-1][n].pos.y)
						}
					}
				}
			}
		}
	}
	
	for(var i = 0; i < cols; i++) {
		rows = net.layers[i].length
		for(var j = 0; j < net.layers[i].length; j++) {
			drawNode(net.layers[i][j].pos.x,net.layers[i][j].pos.y,net.layers[i][j].activation.toFixed(2),net.layers[i][j].selected)
		}
	}
}

function drawNode(x,y,content,selected) { //Renders Neurons on the canvas (part of 'drawNet')
	
	
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