
function parseNetwork(networkJSON) { //accepts a JSON in string format, created with JSON.stringify()
	var tempNet = JSON.parse(networkJSON)
	
	// JSON does not support Object Methods, so the stored Network data must be reassigned to a new Network Object
	tempDetails = []
	for(var i = 0; i < tempNet.layer.length; i++) {
		tempDetails.push(tempNet.layer[i].neuron.length)
	}
	console.log(tempDetails)
	
	loadingNet = new network(tempNet.id,tempDetails)
	
	loadingNet.cost = tempNet.cost
	loadingNet.LR = tempNet.LR
	loadingNet.lastCorrects = tempNet.lastCorrects
	
	for(var i = 0; i < loadingNet.layer.length; i++) {
		loadingNet.layer[i].id = 			tempNet.layer[i].id
		loadingNet.layer[i].network = 		tempNet.layer[i].network
		loadingNet.layer[i].displayOffset = tempNet.layer[i].displayOffset
		
		for(var j = 0; j < loadingNet.layer[i].neuron.length; j++) {
			loadingNet.layer[i].neuron[j].id = 				tempNet.layer[i].neuron[j].id
			loadingNet.layer[i].neuron[j].layer = 			tempNet.layer[i].neuron[j].layer
			loadingNet.layer[i].neuron[j].network = 		tempNet.layer[i].neuron[j].network
			loadingNet.layer[i].neuron[j].weight = 			tempNet.layer[i].neuron[j].weight
			loadingNet.layer[i].neuron[j].weightDelta = 	tempNet.layer[i].neuron[j].weightDelta
			loadingNet.layer[i].neuron[j].bias = 			tempNet.layer[i].neuron[j].bias
			loadingNet.layer[i].neuron[j].biasDelta = 		tempNet.layer[i].neuron[j].biasDelta
			loadingNet.layer[i].neuron[j].value = 			tempNet.layer[i].neuron[j].value
			loadingNet.layer[i].neuron[j].activation = 		tempNet.layer[i].neuron[j].activation
			loadingNet.layer[i].neuron[j].error =			tempNet.layer[i].neuron[j].error
			loadingNet.layer[i].neuron[j].pos = 			tempNet.layer[i].neuron[j].pos
			loadingNet.layer[i].neuron[j].selected = 		tempNet.layer[i].neuron[j].selected
			loadingNet.layer[i].neuron[j].selectedIndex = 	tempNet.layer[i].neuron[j].selectedIndex
		}
	}
	
	console.log(loadingNet)
	
	return loadingNet
}

function bubbleSort(objectArray) { //Specifically sorts Network objects by the 'id' attribute
	var count = 0
	var sorted = false
	var tempObject
	var charCodeArray = []
	var tempCharCode = 0
	
	
	//Converts the String id's into char codes to be sorted
	for(var i = 0; i < objectArray.length; i++) {
		charCodeArray[i] = 0
		for(var j = 0; j < objectArray[i].id.length; j++) {
			charCodeArray[i] += objectArray[i].id.toLowerCase().charCodeAt(j)*Math.pow(1/10,j*3)
		}
	}
	
	//Bubble sort core
	while(sorted === false && count < 100) {
		count++
		sorted = true
		for(var i = 0; i < charCodeArray.length - 1; i++) {
			if(charCodeArray[i] > charCodeArray[i + 1]) {
				//Both Objects, and numerical place holders are swapped simultaneously
				tempObject = objectArray[i]
				tempCharCode = charCodeArray[i]
				objectArray[i] = objectArray[i + 1]
				charCodeArray[i] = charCodeArray[i + 1]
				objectArray[i + 1] = tempObject
				charCodeArray[i + 1] = tempCharCode
				sorted = false
			}
		}
	}
}

function binarySearch(searchItem,searchArray) { //Specifically searches through Network objects by the 'id' attribute
	var max = searchArray.length
	var min = 0
	var index = 0
	var found = false
	var count = 0
	var inputCharCode = 0
	var charCodeArray = []
	
	
	//Converts the String id's into char codes to be sorted
	for(var i = 0; i < searchItem.length; i++) {
		inputCharCode += searchItem.toLowerCase().charCodeAt(i)*Math.pow(1/10,i*3)
	}
	
	for(var i = 0; i < searchArray.length; i++) {
		charCodeArray[i] = 0
		for(var j = 0; j < searchArray[i].id.length; j++) {
			charCodeArray[i] += searchArray[i].id.toLowerCase().charCodeAt(j)*Math.pow(1/10,j*3)
		}
	}
	
	//Binary search Core
	while(found === false && count < 20) {
		count++
		if(inputCharCode === charCodeArray[Math.floor((max + min)/2)]) {
			index = Math.floor((max + min)/2)
			found = true
		} else if(inputCharCode > charCodeArray[Math.floor((max + min)/2)]) {
			min = Math.floor((max + min)/2)
		} else {
			max = Math.floor((max + min)/2)
		}
	}
	
	return index
}


