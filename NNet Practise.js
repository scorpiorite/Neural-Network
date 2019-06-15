
// IDEAS:
// - Make a simple doom clone to train on
// - Make a game similar to 'Three body problem'
// - Make an option to upload personal image data

// TODO:
// - Add option for graphcanvas to show learning history plot instead of bar graph
// - Add cross-entropy cost function
// - Add new training tasks (2d video game)

// Please forgive me for my sins
// OMG Clean this at some point... 95% of these are unnecessary now
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
var scrollMode = 0
var stopIncorrect = false

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
	
	//loadNets()
	
	stop()
	
	netFunction()
}

function draw() { //P5js loops this function 60 times per second (as defined by 'frameRate()')
	
	clear()
	
	var countA = 0
	
	if(learn === true) {
		netFunction()
	}
	
	if(render === 1) {
		drawNet(networks[selectedNet])
	}
	
	// Surely this can go somewhere else
	for(var i = 0; i < networks[selectedNet].layers[networks[selectedNet].layers.length-1].length; i++) {
		document.getElementById('result' + i).style.height = networks[selectedNet].layers[networks[selectedNet].layers.length-1][i][0][1]*100 + "%"
		if(i === input) {
			document.getElementById('resultHeader' + i).style.color = 'white'
			document.getElementById('resultHeader' + i).style.background = 'darkgrey'
		} else {
			document.getElementById('resultHeader' + i).style.color = 'black'
			document.getElementById('resultHeader' + i).style.background = '#e3e3e3'
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
	
	drawGraphCanvas()
	
	turboAdjust()
}

function toggleRender() {
	if(render == 1) {
		render = 0
	} else if(render == 0) {
		render = 1
	}
}

function toggleRenderMode() {
	
	if (networks[selectedNet].canvasData.renderMode == 1) {
		networks[selectedNet].canvasData.renderMode = 0
		document.getElementById('renderModeText').innerHTML = "Standard"
	} else {
		networks[selectedNet].canvasData.renderMode = 1
		document.getElementById('renderModeText').innerHTML = "Experimental"
	}
}

function toggleStopIncorrect() {
	stopIncorrect = !stopIncorrect
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
	document.getElementById('details').style.display = 'none'
	
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

function turboAdjust() { //Adjusts the Turbo slider according to benchmarked performance per frame
	
	benchLast = benchThis
	benchThis = new Date()
	benchDiff = benchThis - benchLast
	if(turbo === true && learn === true) {
		if(benchDiff > 17) {
			turboBuffer -= Math.round(Math.E**(0.06*benchDiff)-Math.E**(17*0.06)+1) // Could be better
		} else {
			turboBuffer += Math.floor(1.7*Math.log(benchDiff)+1.7*Math.log(17)+1)   // Amazing
		}
		sliderTemp = document.getElementById('turboSlider').value
		if(turboBuffer > 10) {
			sliderTemp++
			turboBuffer = 0
		} else if(turboBuffer < -10) {
			sliderTemp--
			turboBuffer = 0
		}
		document.getElementById('turboSlider').value = sliderTemp
	}
	
	document.getElementById('turboMultiplier').innerHTML = 'x' + document.getElementById('turboSlider').value
}

function turboToggle() { //Manages TurboMode, attached to 'Turbo' Button
	
	if(turbo === true) {
		turbo = false
		document.getElementById('turboToggle').parentElement.style.backgroundColor = ''
		
		//render = 1
	} else {
		turbo = true
		document.getElementById('turboToggle').parentElement.style.backgroundColor = '#7bd'
		turboBuffer = 0
		//render = 0
		
		//turboLoop()
	}
}

function stop() { //Halts and Resumed the networks progress
	
	if(document.getElementById('stopToggle').innerHTML === 'Stop') {
		learn = false
		document.getElementById('stopToggle').innerHTML = 'Go'
	} else if (document.getElementById('stopToggle').innerHTML === 'Paused'){
		document.getElementById('stopToggle').innerHTML = 'Go'
	} else {
		learn = true
		document.getElementById('stopToggle').innerHTML = 'Stop'
	}
}

function canvasClick() { //Manages Neuron Selection on the Canvas
	
	canvasData = networks[selectedNet].canvasData
	
	// Finds a 'grid region' in which the cursor has clicked -- Each grid contains only one neuron
	col = Math.round((mouseX                               )/canvasData.widthDiv          - 1/2) // Which column the mouse pointer is in
	row = Math.round((mouseY - canvasData.layerData[col][2])/canvasData.layerData[col][1] - 1/2) // Which row the mouse pointer is in
	
	point_ = { // Object containing x,y for the coordinates of the centre of the Neuron corresponding to the grid in which the cursor has selected
		x: col*canvasData.widthDiv 			+ canvasData.widthDiv/2,
		y: row*canvasData.layerData[col][1] + canvasData.layerData[col][1]/2
	}
	
	// Calculates the distance of the cursor from the centre of the appropriate neuron
	// d  = Square Root(( X1  -    X2   )^2  + (                  Y1                    -    Y2   )^2 )
	dist_ = Math.sqrt((mouseX - point_.x)**2 + ((mouseY - canvasData.layerData[col][2]) - point_.y)**2) 
	
	if(dist_ < nodeRadius) { // If the cursor is on the neuron
		
		if(networks[selectedNet].canvasData.layerData[col][5] === row) { // If That neuron is already selected
			
			// Deselect the neuron and remove the display Listing
			networks[selectedNet].canvasData.layerData[col][5] = NaN
			remNeuronListing(col,row)
			
		} else if(networks[selectedNet].canvasData.layerData[col][5] != NaN) { // Otherwise if another neuron in that layer is selected
			
			// Remove the listing for the other neuron, change the row selection to this neuron, and add a display listing for this neuron
			remNeuronListing(col,networks[selectedNet].canvasData.layerData[col][5])
			networks[selectedNet].canvasData.layerData[col][5] = row
			addNeuronListing(col,row)
			
		} else { // Otherwise (if there is no other neuron selected in this row)
			
			// Select this neuron and add a display listing for it
			networks[selectedNet].canvasData.layerData[col][5] = row
			addNeuronListing(col,row)
			
		}
	}
}

function addNeuronListing(col,row) { // Add a Neuron Listing to the Details div
	
	details = document.getElementById('details')
	
	neuronListing = document.createElement("div")   // Initialise The 'neuronListing' Element
	neuronListing.classList.add("neuronListing")
	
	neuronDisplay = document.createElement("div")   // Initialise The Neuron display box
	neuronDisplay.classList.add("neuronDisplay")
	
	neuronCanvas = document.createElement("Canvas") // Initialise the Neuron rendering canvas
	neuronCanvas.classList.add("neuronCanvas")
	neuronCanvas.id = 'c ' + col + ' ' + row
	neuronCanvas.height = window.innerHeight*(6.75/100)
	neuronCanvas.width = window.innerHeight*(6.75/100)
	
	neuronDisplay.appendChild(neuronCanvas)  // Append the neuron canvas to the display box
	neuronListing.appendChild(neuronDisplay) // Append the display box to the neuron listing
	
	neuronListing.id = col + ' ' + row
	neuronListing.innerHTML += col + ' ' + row
	
	added = false // flag for success in appending the new 'neuronListing' element
	
	for(var i = 0; i < details.childNodes.length; i++) { // Iterate through all elements in the Display Div
		
		try { // Creating the id array fails if an element (i.e a text node) does not have an id
			
			// Seperate the id (in string format) back into the 'col' and 'row' components for evaluation
			id = details.childNodes[i].id.split(' ')
			
		} catch(err) {
			
			id = [] // Value that never passes
			
		}
		
		if(id.length == 2 && id[0] > col || id.length == 4 && id[0] == col) { // If the first component of the id (the respective element's column) is greater than the column of the new element
			
			// Append the new element before the current element, set the added flag to true, and break the loop
			details.insertBefore(neuronListing, document.getElementById('details').childNodes[i])
			added = true
			break;
			
		}
	}
	
	if(!added) { // If the new element has not been added yet, apend it to the end of the list
		details.appendChild(neuronListing)
	}
	
	checkWeights() // Manages weight placement
	
}

function remNeuronListing(col,row) { // Remove a Neuron Listing from the Details div
	
	details = document.getElementById('details')
	
	for(var i = 0; i < details.childNodes.length; i++) {
		if(details.childNodes[i].id == col + ' ' + row) {
			
			temp = document.createElement('div')
			temp.classList.add('neuronListing')
			temp.classList.add('ghostListing')
			temp.innerHTML = details.childNodes[i].innerHTML
			temp.style.borderBottom = 'black solid 0px'
			
			details.removeChild(details.childNodes[i])
			details.insertBefore(temp,details.childNodes[i])
			
			setTimeout(function() {
				elem = document.getElementsByClassName('ghostListing')[0]
				document.getElementById('details').removeChild(elem)
			},1000)
		}
	}
	
	checkWeights() // Manages weight placement
}

function checkWeights() { // Detects when adding a Weight Listing should be added to the Display div

	details = document.getElementById('details')
	
	layerData = networks[selectedNet].canvasData.layerData
	
	listedWeights = []
	
	for(var i = 0; i < details.childNodes.length; i++) { // For each element in the details div
		
		try { // id assignment fails if childNodes[i] does not have an id
			
			id = details.childNodes[i].id.split(' ') // Convert string format id of the elements to an array
			
		} catch(err) {
			
			id = [] // Value that fails later tests
			
		}
		
		if(id.length == 4) { // If the element is a weight listing (only weight listings have 4 arguments)
			
			listedWeights.push(id)
			
		}
		
	}
	
	for(var i = 0; i < layerData.length-1; i++) { // For every network layer
		
		if(layerData[i][5] > -1 && layerData[i+1][5] > -1) { // If two consecutive layers have selected neurons
			
			listingExists = false // Test Flag
			
			for(var j = 0; j < listedWeights.length; j++) { // For every listed weight
				
				if(listedWeights[j][0] == i && listedWeights[j][2] == i+1) { // If the start and end columns of the weight correspond to current pair of selected neurons then:
					
					listingExists = true // This weight listing already exists
					
				}
				
			}
			
			if(!listingExists) { // If this weight listing does not exist yet:
				
				addWeightListing(i,layerData[i][5],i+1,layerData[i+1][5]) // Add the weight listing
				
			}
			
		}
		
	}
	
	for(var i = 0; i < listedWeights.length; i++) { // For all weight listings
		
		// if(!(layerData[listedWeights[i][0]][5] > -1 && layerData[listedWeights[i][2]][5] > -1)) { // If there is no selected neuron in either column corresponding to the weight listing:
		if(!(layerData[listedWeights[i][0]][5] == listedWeights[i][1] && layerData[listedWeights[i][2]][5] == listedWeights[i][3])) { // If there is no selected neuron in either column corresponding to the weight listing:
			
			remWeightListing(listedWeights[i][0],listedWeights[i][1],listedWeights[i][2],listedWeights[i][3]) // Remove the weight listing
			
		}
		
	}
	
}

function addWeightListing(iniCol,iniRow,endCol,endRow) { // Add a Weight Listing the the Details div
	
	details = document.getElementById('details')
	
	weightListing = document.createElement("div")   // Initialise The 'weightListing' Element
	weightListing.classList.add("weightListing")
	
	weightDisplay = document.createElement("div")   // Initialise The weight display box
	weightDisplay.classList.add("weightDisplay")
	
	weightCanvas = document.createElement("Canvas") // Initialise The weight Canvas
	weightCanvas.classList.add("weightCanvas")
	weightCanvas.id = 'c ' + iniCol + ' ' + iniRow + ' ' + endCol + ' ' + endRow
	weightCanvas.height = window.innerHeight*(6.75/100)
	weightCanvas.width = window.innerHeight*(6.75/100)
	
	weightDisplay.appendChild(weightCanvas)  // Append the weight canvas to the display box
	weightListing.appendChild(weightDisplay) // Append the display box to the neuron listing
	
	weightListing.id = iniCol + ' ' + iniRow + ' ' + endCol + ' ' + endRow
	weightListing.innerHTML += iniCol + ' ' + iniRow + ' ' + endCol + ' ' + endRow
	
	for(var i = 0; i < details.childNodes.length; i++) { // Iterate through all elements in the Display Div
		
		try { // Creating the id array fails if an element (i.e a text node) does not have an id
			
			// Seperate the id (in string format) back into the 'col' and 'row' components for evaluation
			id = details.childNodes[i].id.split(' ')
			
		} catch(err) {
			
			id = [] // Value that never passes
			
		}
		
		if(id.length == 2 && id[0] == endCol) { // If the first component of the id (the respective element's column) is greater than the column of the new element
			
			// Append the new element before the current element, set the added flag to true, and break the loop
			details.insertBefore(weightListing, document.getElementById('details').childNodes[i])
			added = true
			break;
			
		}
	}
	
	if(!added) { // If the new element has not been added yet, append it to the end of the list
		details.appendChild(weightListing) // This should never Happen
	}
	
}

function remWeightListing(iniCol,iniRow,endCol,endRow) { // Remove a Weight Listing from the Details div
	
	details = document.getElementById('details')
	
	for(var i = 0; i < details.childNodes.length; i++) {
		if(details.childNodes[i].id == iniCol + ' ' + iniRow + ' ' + endCol + ' ' + endRow) {
			
			temp = document.createElement('div')
			temp.classList.add('weightListing')
			temp.classList.add('ghostListing')
			temp.innerHTML = details.childNodes[i].innerHTML
			temp.style.borderBottom = 'black solid 0px'
			
			details.removeChild(details.childNodes[i])
			details.insertBefore(temp,details.childNodes[i])
			
			setTimeout(function() {
				elem = document.getElementsByClassName('ghostListing')[0]
				document.getElementById('details').removeChild(elem)
			},1000)
		}
	}
	
	checkWeights()
}

function canvasScroll(event) { //Event listener for canvas scrolling
	
	if(scrollMode == 0) {
		SDY = -event.deltaY
	} else {
		SDY = (Math.abs(event.deltaY)/event.deltaY)*8
	}
	
	for(var i = 0; i < networks[selectedNet].layers.length; i++) { // WTF
		if(mouseX > networks[selectedNet].canvasData.widthDiv/2 + networks[selectedNet].canvasData.widthDiv*i - nodeRadius && mouseX < networks[selectedNet].canvasData.widthDiv/2 + networks[selectedNet].canvasData.widthDiv*i + nodeRadius) {
			if(-networks[selectedNet].canvasData.layerData[i][2] - SDY < networks[selectedNet].canvasData.layerData[i][1]*(networks[selectedNet].canvasData.layerData[i][0] - networks[selectedNet].canvasData.layerData[i][3]) == false) {
				networks[selectedNet].canvasData.layerData[i][2] = -networks[selectedNet].canvasData.layerData[i][1]*(networks[selectedNet].canvasData.layerData[i][0] - networks[selectedNet].canvasData.layerData[i][3])
			} else if(networks[selectedNet].canvasData.layerData[i][2] + SDY > 0) {
				networks[selectedNet].canvasData.layerData[i][2] = 0
			} else {
				networks[selectedNet].canvasData.layerData[i][2] += SDY
			}
			
			if(i == 0) {
				document.getElementById('canvasScroll').value = -networks[selectedNet].canvasData.layerData[0][2]
			}
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
	
	if(maxIndex === number) { // Network was correct
		networks[selectedNet].lastCorrects.unshift(1)
	} else {				  // Network was incorrect
		networks[selectedNet].lastCorrects.unshift(0)
		if(stopIncorrect) {
			learn = false
			document.getElementById('stopToggle').innerHTML = 'Paused'
			setTimeout(function(){
				if (document.getElementById('stopToggle').innerHTML != 'Go') {
					learn = true;
					document.getElementById('stopToggle').innerHTML = 'Stop';
				}
			}, 1000)
		}
	}
	
	lastInputs.push(number)
}

function drawGraphCanvas() {
	
	graphCanvasCTX.clearRect(0, 0, graphCanvas.width, graphCanvas.height)
	for(var i = 0; i < graphCanvas.width; i++) {
		if(i > graphCanvas.width) {
			break;
		} else {
			if(networks[selectedNet].lastCorrects[i] === 1) {
				graphCanvasCTX.strokeStyle = "#00d2ff"
			} else if(networks[selectedNet].lastCorrects[i] === 0) {
				graphCanvasCTX.strokeStyle = "#008cff"
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
	
}

function drawNet(net) { //Renders the active Network with the help of P5js
	
	// p5js Canvas only draws weights, not Neurons!!
	
	// Needs to avoid rendering elements that are off canvas to save processing
	// Needs to scale and scroll both horizontally and vertically
	
	canvasHeight = document.getElementById('canvasHolder').clientHeight
	canvasWidth = document.getElementById('canvasHolder').clientWidth
	
	nodeRadius = canvasHeight/((15)*3)
	
	var widthDiv = canvasWidth/net.layers.length+1
	net.canvasData.widthDiv = canvasWidth/net.layers.length+1
	var widthOffScroll = 0
	net.canvasData.widthOffScroll = 0
	var heightDiv = nodeRadius*3
	net.canvasData.heightDiv = nodeRadius*3
	var heightDiv_half = heightDiv/2
	net.canvasData.heightDiv_half = heightDiv/2
	
	document.getElementById('canvasScroll').max = heightDiv*(net.canvasData.layerData[0][0] - net.canvasData.layerData[0][3])
	net.canvasData.layerData[0][2] = -document.getElementById('canvasScroll').value
	
	//				0						1							2							3							4
	// LData[Neurons in layer i, heightDiv for this layer, Scroll value for this layer, number of Neurons displayable, First displayable Neuron]
	for(var i = 0; i < net.canvasData.layerData.length; i++) {
		if(net.layers[i].length*heightDiv < canvasHeight) {
			net.canvasData.layerData[i][0] = net.layers[i].length
			net.canvasData.layerData[i][1] = canvasHeight/net.layers[i].length
			net.canvasData.layerData[i][3] = net.layers[i].length
			net.canvasData.layerData[i][4] = 0
		} else {
			net.canvasData.layerData[i][0] = net.layers[i].length
			net.canvasData.layerData[i][1] = heightDiv
			net.canvasData.layerData[i][3] = canvasHeight/heightDiv
			net.canvasData.layerData[i][4] = 0
		}
	}
	
	for(var i = 0; i < net.canvasData.layerData.length; i++) {
		if(net.canvasData.layerData[i][0]*heightDiv > canvasHeight) {
			if(Math.floor(-net.canvasData.layerData[i][2]/net.canvasData.layerData[i][1]) + net.canvasData.layerData[i][3] - 1 <= net.canvasData.layerData[i][0]) {
				net.canvasData.layerData[i][4] = Math.round(-net.canvasData.layerData[i][2]/net.canvasData.layerData[i][1])
			}
		}
	}
	
	for(var i = 1; i < net.canvasData.layerData.length; i++) {
		var widthOff = i*widthDiv + widthDiv/2
		var widthOff_PrevInd = (i-1)*widthDiv + widthDiv/2
		for(var j = net.canvasData.layerData[i][4]; j < net.canvasData.layerData[i][4] + net.canvasData.layerData[i][3]; j++) {
			var heightOff = j*net.canvasData.layerData[i][1] + net.canvasData.layerData[i][1]/2
			for(var n = net.canvasData.layerData[i-1][4]; n < net.canvasData.layerData[i-1][4] + net.canvasData.layerData[i-1][3]; n++) {
				colorMode(HSB)
				strokeWeight((1 - 3.7*net.sigmoid_d(net.layers[i][j][1][n])).toFixed(2))
				
				if(j == net.canvasData.layerData[i][5] && n == net.canvasData.layerData[i-1][5]) {
					strokeWeight(1)
					H = 0
				} else {
					H = 200 + (2*net.sigmoid(net.layers[i][j][1][n])-1)*30
				}
				
				if(net.canvasData.renderMode == 0) {
					S = 100
				} else {
					S = (1 - 4*net.sigmoid_d(net.layers[i][j][1][n]*net.layers[i][j][0][1]))*100
				}
				
				B = 100
				
				stroke(H,S,B)
				noSmooth() //										   |													   |														   |
				line(Math.round(widthOff + widthOffScroll - nodeRadius), Math.round(heightOff + net.canvasData.layerData[i][2]), Math.round(widthOff_PrevInd + widthOffScroll + nodeRadius), Math.round(n*net.canvasData.layerData[i-1][1] + net.canvasData.layerData[i-1][1]/2 + net.canvasData.layerData[i-1][2]))
			}
		}
	}
	
	for(var i = 0; i < net.canvasData.layerData.length; i++) {
		for(var j = net.canvasData.layerData[i][4]; j < net.canvasData.layerData[i][4] + net.canvasData.layerData[i][3]; j++) {
			
			if(j == net.canvasData.layerData[i][5]) {
				selected = true
			} else {
				selected = false
			}
			
			if(i == 0) {
				drawNode(i*widthDiv + widthDiv/2 + widthOffScroll,j*net.canvasData.layerData[i][1] + net.canvasData.layerData[i][1]/2 + net.canvasData.layerData[i][2],net.layers[0][j],selected)
			} else {
				drawNode(i*widthDiv + widthDiv/2 + widthOffScroll,j*net.canvasData.layerData[i][1] + net.canvasData.layerData[i][1]/2 + net.canvasData.layerData[i][2],net.layers[i][j][0][1],selected)
			}
		}
	}
	
	updateListings(net)
}

function drawNode(x,y,content,selected) { //Renders Neurons on the canvas (part of 'drawNet')
	
	colorMode(RGB)
	strokeWeight(1)
	
	if(selected === true) {
		fill("pink")
	} else {
		fill(255,255,255)
	}
	
	noFill()
	
	if(selected == false) {
		if(content == 0) {
			strokeWeight(2)
			stroke(119,187,221)
			ellipse(x,y,nodeRadius*2,nodeRadius*2)
		} else {
			strokeWeight(2)
			stroke(119,187,221)
			arc(x,y,nodeRadius*2,nodeRadius*2,PI + HALF_PI + content*2*PI,PI + HALF_PI)
			stroke(0,255,255)
			arc(x,y,nodeRadius*2,nodeRadius*2,PI + HALF_PI,PI + HALF_PI + content*2*PI)
		}
	} else {
		if(content == 0) {
			strokeWeight(2)
			stroke(119,187,221)
			ellipse(x,y,nodeRadius*2,nodeRadius*2)
		} else {
			strokeWeight(2)
			stroke(255,200,200)
			arc(x,y,nodeRadius*2,nodeRadius*2,PI + HALF_PI + content*2*PI,PI + HALF_PI)
			// stroke(0,255,0)
			stroke(255,0,0)
			arc(x,y,nodeRadius*2,nodeRadius*2,PI + HALF_PI,PI + HALF_PI + content*2*PI)
		}
	}
	
	strokeWeight(1)
	stroke(255)
	fill(0)
	textSize(nodeRadius)
	textAlign(CENTER,CENTER)
	try {
		text(content.toFixed(2),x,y)
	} catch(err) {
		text(0,x,y)
	}
}

function updateListings(net) {
	
	var listingArray = []
	for(var i = 0; i < document.getElementById('details').childNodes.length; i++) {
		try {
			listingArray.push(document.getElementById('details').childNodes[i].childNodes[0].childNodes[0])
		} catch {/*please don't judge me*/}
	}
	for(var i = 0; i < listingArray.length; i++) {
		var context = listingArray[i].getContext('2d')
		var unPack = listingArray[i].id.split(' ')
		var listingHeight = listingArray[i].height
		var listingWidth = listingArray[i].width
		if(unPack.length == 3) {
			
			if (unPack[1] == 0) {
				var content = net.layers[unPack[1]][unPack[2]]
			} else {
				var content = net.layers[unPack[1]][unPack[2]][0][1]
			}
			
			context.clearRect(0,0,listingWidth,listingHeight)
			context.lineWidth = 2
			
			try {
				if(listingArray[i-1].id.split(' ').length == 5) {
					context.beginPath()
					context.moveTo(listingWidth/2,0)
					context.lineTo(listingWidth/2,listingHeight/2 - nodeRadius)
					context.stroke()
				}
			} catch {}
			try {
				if(listingArray[i+1].id.split(' ').length == 5) {
					context.beginPath()
					context.moveTo(listingWidth/2,listingHeight)
					context.lineTo(listingWidth/2,listingHeight/2 + nodeRadius)
					context.stroke()
				}
			} catch {}
			
			context.beginPath()
			// context.strokeStyle = "#FFC8C8"
			context.strokeStyle = "#ffafaf"
			context.arc(listingWidth/2,listingHeight/2,nodeRadius,PI + HALF_PI + content*2*PI,PI + HALF_PI)
			context.stroke()
			
			context.beginPath()
			context.strokeStyle = "#FF0000"
			// context.strokeStyle = "#00FF00"
			context.arc(listingWidth/2,listingHeight/2,nodeRadius,PI + HALF_PI,PI + HALF_PI + content*2*PI)
			context.stroke()
			
			context.font = nodeRadius + "px Arial"
			context.fillText(content.toFixed(2),listingWidth/5,listingHeight/2 + nodeRadius/3)
			
		} else if (unPack.length == 5) {
			
			context.clearRect(0,0,listingWidth,listingHeight)
			context.strokeStyle = "#FF0000"
			// context.strokeStyle = "#00FF00"
			context.lineWidth = 2
			
			context.beginPath()
			context.moveTo(listingWidth/2,0)
			context.lineTo(listingWidth/2,listingHeight)
			context.stroke()
			
		}
	}
}

function benchMark(name) {
	this.name = name
	this.start = new Date()
	this.end = function() {
		console.log(this.name + ": " + (new Date() - this.start))
		return this.name + ": " + (new Date() - this.start)
	}
}

function temp() {
	console.log('0', networks[selectedNet].canvasData.layerData[2][0])
	console.log('1', networks[selectedNet].canvasData.layerData[2][1])
	console.log('2', networks[selectedNet].canvasData.layerData[2][2])
	console.log('3', networks[selectedNet].canvasData.layerData[2][3])
	console.log('4', networks[selectedNet].canvasData.layerData[2][4])
	console.log('h', canvasHeight)
}