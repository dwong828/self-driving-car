class NeuralNetwork{

    //arg:  array of neuron counts
    //eg.  input = [2,3,1]
    //this means:
    //    Level 0 = 2 input neurons
    //    Level 1 = 3 hidden/internal neurons
    //    Level 2 = 1 output neuron
    //And: this.levels = [ Layer(2,3), Layer(3,1)]
    constructor(neuronCounts){
        this.levels=[];
        for (let i=0; i<neuronCounts.length-1; i++){
            this.levels.push(
                new Level(neuronCounts[i], neuronCounts[i+1])
            );
        }
    }

    static feedForward(givenInputs, network){
        //get ouput from first level
        let outputs = Level.feedForward(givenInputs, network.levels[0]);

        //generate outputs for all internal levels
        //feed outputs of previous level as inputs to next level
        for (let i=1; i<network.levels.length; i++){
            outputs = Level.feedForward(outputs, network.levels[i]);
        }
        //return final output level
        return outputs;
    }

    //network = your network
    //amount = How much randomness to add to network weights/biases.  Between [0, 1]
    //eg. if amount = 0.1, then each bias and weight will move 10% towards a random number between [-1,1]
    static mutate(network, amount=1){
        network.levels.forEach(level => {
            for (let i=0; i<level.biases.length; i++){
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random() * 2 - 1, //random number between [-1,1]
                    amount
                );
            }

            for (let i=0; i<level.weights.length; i++){
                for (let j=0; j<level.weights[i].length; j++){
                    level.weights[i][i] = lerp(
                        level.weights[i][j],
                        Math.random() * 2 - 1, //random number between [-1,1]
                        amount
                    );
                }
            }
        });
    }
}


class Level{
    constructor(inputCount, outputCount){
        this.inputs= new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        this.weights=[];
        for (let i=0; i<inputCount; i++){
            this.weights[i] = new Array(outputCount);
        }

        Level.#randomize(this);
    }

    static #randomize(level){
        //set weights betwween (-1, 1)
        for (let i=0; i<level.inputs.length; i++){
            for (let j=0; j<level.outputs.length; j++){
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        //set biases between (-1, 1)
        for (let i=0; i<level.outputs.length; i++){
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    static feedForward(givenInputs, level){
        for (let i=0; i<level.inputs.length; i++){
            level.inputs[i] = givenInputs[i];
        }

        for (let i=0; i<level.outputs.length; i++){
            let sum=0;
            for (let j=0; j<level.inputs.length; j++){
                sum += level.inputs[j] * level.weights[j][i]; 
            }

            //turn on node, since node value is above bias
            if (sum > level.biases[i]){
                level.outputs[i] = 1;
            }
            //turn off node, since node value is below bias
            else{
                level.outputs[i] = 0;
            }
        }
        return level.outputs;
    }
}