
function network(id,detailsArray) {
	this.id = id
	this.layer = []
	this.cost = 0
	this.LR = 0.1
	this.lastCorrects = []
	
	this.train = function(inputs,outputs) {
		this.update(inputs)
		this.error(outputs)
		this.adjust()
	}
	
	this.update = function(inputArray) {
		for(var i = 0; i < this.layer.length; i++) {
			for(var j = 0; j < this.layer[i].neuron.length; j++) {
				this.layer[i].neuron[j].update(inputArray[j])
			}
		}
	}
	
	this.error = function(expectedArray) {
		
		this.cost = 0
		
		//	-BP0-	Cost for Network
		for(var i = 0; i < this.layer[this.layer.length-1].neuron.length; i++) {
			// this.cost += Math.pow(this.layer[this.layer.length-1].neuron[i].activation - expectedArray[i],2)*0.5
			this.cost += Math.pow(expectedArray[i] - this.layer[this.layer.length-1].neuron[i].activation,2)*0.5
		}
		
		//	-BP1-	Error for last layer Neurons
		for(var i = 0; i < this.layer[this.layer.length-1].neuron.length; i++) {
			this.layer[this.layer.length-1].neuron[i].error = (this.layer[this.layer.length-1].neuron[i].activation - expectedArray[i])*this.deActivate(this.layer[this.layer.length-1].neuron[i].value)
		}
		
		//	-BP2-	Error for previous layer Neurons
		for(var i = this.layer.length-2; i > -1; i--) {
			for(var j = 0; j < this.layer[i].neuron.length; j++) {
				this.layer[i].neuron[j].error = 0
				for(var n = 0; n < this.layer[i+1].neuron.length; n++) {
					this.layer[i].neuron[j].error += this.layer[i+1].neuron[n].weight[j]*this.layer[i+1].neuron[n].error
				}
				this.layer[i].neuron[j].error *= this.deActivate(this.layer[i].neuron[j].value)
			}
		}
		
		//	-BP3-	Delta for Biases
		for(var i = 0; i < this.layer.length-1; i++) {
			for(var j = 0; j < this.layer[i].neuron.length; j++) {
				this.layer[i].neuron[j].biasDelta.push(this.layer[i].neuron[j].error)
			}
		}
		
		//	-BP4-	Delta for Weights
		for(var i = 0; i < this.layer.length; i++) {
			for(var j = 0; j < this.layer[i].neuron.length; j++) {
				for(var n = 0; n < this.layer[i].neuron[j].weight.length; n++) {
					this.layer[i].neuron[j].weightDelta[n].push(this.layer[i-1].neuron[n].activation*this.layer[i].neuron[j].error)
				}
			}
		}
	}
	
	this.adjust = function() {
		for(var i = 0; i < this.layer.length; i++) {
			for(var j = 0; j < this.layer[i].neuron.length; j++) {
				this.layer[i].neuron[j].deltaParse()
			}
		}
	}
	
	this.activate = function(x) {
		return(1/(1 + Math.pow(Math.E, -x)))
	}
	
	this.deActivate = function(x) {
		return(this.activate(x)*(1 - this.activate(x)))
	}
	
	for(var i = 0; i < detailsArray.length; i++) {
		this.layer[i] = new layer(i,detailsArray[i],id)
	}
	
	for(var i = 1; i < this.layer.length; i++) {
		for(var j = 0; j < this.layer[i].neuron.length; j++) {
			for(var n = 0; n < this.layer[i-1].neuron.length; n++) {
				this.layer[i].neuron[j].weight.push((Math.random()*0.2)-0.1)
				this.layer[i].neuron[j].weightDelta.push(new Array(0))
			}
		}
	}
	
	window[id] = this
}

function layer(id,length,parent) {
	this.id = id
	this.network = parent
	this.neuron = []
	this.displayOffset = 0
	
	for(var i = 0; i < length; i++) {
		this.neuron[i] = new neuron(i,this.id,this.network)
	}
}

function neuron(id,layer,network) {
	
	this.id = id
	this.layer = layer
	this.network = network
	this.weight = []
	this.weightDelta = []
	// this.bias = (Math.random()*0.2)-0.1
	this.bias = (0)
	this.biasDelta = []
	this.value = 0.5
	this.activation = 0
	this.error = 0
	this.pos = {x:0, y:0}
	this.selected = false
	this.selectedIndex
	
	this.update = function(input){
		this.value = 0
		
		if(this.layer > 0) {
			for(var i = 0; i < window[this.network].layer[layer-1].neuron.length; i++) {
				this.value += window[this.network].layer[layer-1].neuron[i].activation*this.weight[i]
			}
			this.value += this.bias
			this.activation = window[this.network].activate(this.value)
		} else {
			this.value = input
			this.activation = input
		}
	}
	
	this.deltaParse = function() {
		for(var i = 0; i < this.weightDelta.length; i++) {
			for(var j = 0; j < this.weightDelta[i].length; j++) {
				this.weight[i] -= window[this.network].LR*this.weightDelta[i][j]
			}
			this.weightDelta[i] = []
		}
		for(var i = 0; i < this.biasDelta.length; i++) {
			this.bias -= window[this.network].LR*this.biasDelta[i]
		}
		this.biasDelta = []
	}
}

function network_matrix(id, detailsArray) {
	this.id = id
	this.layers = [] // this.layers[layer][neuron][[value, activation, activation_d, error],[bias, weight, weight , weight,...],[bias_D, weight_D, weight_D, weight_D,...]]
	
	for(var i = 0; i < detailsArray.length; i++) { //	Build data structure
		this.layers.push(new Array(detailsArray[i]))
	}
	
	for(var i = 1; i < this.layers.length; i++) { //	Build Data Structure
		for(var j = 0; j < this.layers[i].length; j++) {
			this.layers[i][j] = [[0,0,0,0],new Array(this.layers[i-1].length + 1),new Array(this.layers[i-1].length + 1)]
		}
	}
	
	for(var i = 1; i < this.layers.length; i++) { // 	Initialise Random Weights and Biases
		for(var j = 0; j < this.layers[i].length; j++) {
			for(var n = 0; n < this.layers[i][j][1].length-1; n++) {
				this.layers[i][j][1][n+1] = (Math.random()-0.5)*2
				this.layers[i][j][2][n+1] = 0
			}
			this.layers[i][j][1][0] = 0
			this.layers[i][j][2][0] = 0
		}
	}
	
	this.update = function(inputs) {
		if(inputs.length <= this.layers[0].length) { //											Values for 1st Layer
			for(var i = 0; i < inputs.length; i++) {
				console.log("a",i)
				this.layers[0][i] = inputs[i]
			}
		} else {
			for(var i = 0; i < this.layers[0].length; i++) {
				console.log("b",i)
				this.layers[0][i] = inputs[i]
			}
		}
		
		for(var j = 0; j < this.layers[1].length; j++) { //										Values for 2nd Layer
			for(var n = 0; n < this.layers[0].length; n++) {
				this.layers[1][j][0][0] += this.layers[0][n]*this.layers[1][j][1][n+1]
			}
			this.layers[1][j][0][0] += this.layers[1][j][1][0]
			this.layers[1][j][0][1] = this.sigmoid(this.layers[1][j][0][0])
		}
		
		for(var i = 2; i < this.layers.length; i++) { // 										Values for 3rd+ Layer
			for(var j = 0; j < this.layers[i].length; j++) {
				for(var n = 0; n < this.layers[i-1].length; n++) {
					this.layers[i][j][0][0] += this.layers[i-1][n][0][1]*this.layers[i][j][1][n+1]
				}
				this.layers[i][j][0][0] += this.layers[i][j][1][0]
				this.layers[i][j][0][1] = this.sigmoid(this.layers[i][j][0][0])
			}
		}
	}
	
	this.error = function(corrects) {//	Further optimisation can be done here by using variables for current layer.length and next/prev. layer.length ect.
									 //	Further optimisations can also by storing the value of sigmoid_d(value)
		this.cost = 0
		
		//	-BP0-	Cost for Network
		for(var i = 0; i < this.layers[this.layers.length-1].length; i++) {
			this.cost += Math.pow(corrects[i] - this.layers[this.layers.length-1][i][0][1],2)*0.5
		}
		
		//	-BP1-	Error for last layer Neurons
		for(var i = 0; i < this.layers[this.layers.length-1].length; i++) {
			this.layers[this.layers.length-1][i][0][3] = (this.layers[this.layers.length-1][i][0][1] - corrects[i])*this.sigmoid_d(this.layers[this.layers.length-1][i][0][0])
		}
		
		//	-BP2-	Error for previous layer Neurons
		for(var i = this.layers.length-2; i > -1; i--) {
			for(var j = 0; j < this.layers[i].length; j++) {
				this.layers[i][j][0][3] = 0
				for(var n = 0; n < this.layer[i+1].length; n++) {
					this.layers[i][j][0][3] += this.layers[i+1][n][1][j+1]*this.layers[i+1][n][0][3]
				}
				this.layers[i][j][0][3] *= this.sigmoid_d(this.layers[i][j][0][0])
			}
		}
		
		//	-BP3-	Delta for Biases
		for(var i = 0; i < this.layers.length-1; i++) {
			for(var j = 0; j < this.layers[i][j].length; j++) {
				this.layers[i][j][2][0] += this.layers[i][j][0][3]
			}
		}
		
		//	-BP4-	Delta for Weights
		for(var i = 0; i < this.layer.length; i++) {
			for(var j = 0; j < this.layer[i][j].length; j++) {
				for(var n = 0; n < this.layers[i][j][1].length-1; n++) {
					this.layers[i][j][2][n+1] += this.layers[i-1][n][0][1]*this.layers[i][j][0][3]
				}
			}
		}
	}
	
	this.adjust = function() {
		for(var i = 1; i < layers.length; i++) {
			for(var j = 0; j < layers[i].length; j++) {
				for(var n = 0; n < this.layers[i][j][1].length; n++) {
					this.layers[i][j][1][n+1] += this.layers[i][j][2][n+1]
				}
				this.layers[i][j][1][0] += this.layers[i][j][2][0]
			}
		}
	}
	
	this.sigmoid = function(x) {
		return(1/(1 + Math.pow(Math.E, -x)))
	}
	
	this.sigmoid_d = function(x) {
		return(this.sigmoid(x)*(1 - this.sigmoid(x)))
	}
	
	window[id] = this
	
	console.log(this)
	this.update([1,2,3,4,5,6,7,8,9,10])
}

















