$(function() {
    let defaultCode = '+++>+++++<\n[->>+>+<<<]>>>\n[-<<<+>>>]<<\n[->>+>+<<<]>>>\n[-<<<+>>>]<[<[->>+>+<<<]>>>[-<<<+>>>]<[->>+<<]<-]';

    let memorySize = 256;
    let wordSize = 256;
    let stepDelay = 30;

    let outputField = $('#output .content');

    let memoryPointer;

    let vMemory = new Vue({
        el: '#memory',
        data: {
            content: [],
            selected: 0
        }
    });
    for (let i = 0; i < memorySize; i++) {
        vMemory.content.push(0);
    }
    clearMemory();

    let vCode = new Vue({
        el: '#code',
        data: {
            code: defaultCode,
            running: false,
            selected: 0
        }
    });


    function clearMemory() {
        for (let i = 0; i < memorySize; i++) {
            Vue.set(vMemory.content, i, 0);
        }
        memoryPointer = 0;
    }

    $('#start-button').click(function() {
        vCode.running = true;

        clearMemory();

        vCode.codeToDisplay = vCode.code;

        let iterator = interpret(vCode.code, 0, vCode.code.length);

        let item = iterator.next();
        let intervalId = setInterval(function() {
            if (!item.done) {
                item = iterator.next();
                vCode.selected = item.value;
                vMemory.selected = memoryPointer;
            } else {
                clearInterval(intervalId);
                vCode.running = false;
            }
        }, stepDelay);
    });

    function findClosingBracket(start, text) {
        let bracketCount = 0;
        let index = start;
        do {
            if (index > (text.length - 1)) {
                console.log('Error: Unexpected end of line while closing bracket searching');
                return;
            }
            if (text[index] === '[') {
                bracketCount++;
            }
            if (text[index] === ']') {
                bracketCount--;
            }
            index++;
        } while (bracketCount > 0);
        return index - 1;
    }

    function* interpret(code, start, end) {
        for (let codePointer = start; codePointer < end; codePointer++) {
            let unknownCharacter = false;
            switch (code[codePointer]) {
                case '.':
                    printToOutput(vMemory.content[memoryPointer]);
                    break;

                case ',':

                    break;

                case '+':
                    Vue.set(vMemory.content, memoryPointer, vMemory.content[memoryPointer] + 1);
                    if (vMemory.content[memoryPointer] > (wordSize - 1)) {
                        Vue.set(vMemory.content, memoryPointer, 0);
                    }
                    break;

                case '-':
                    Vue.set(vMemory.content, memoryPointer, vMemory.content[memoryPointer] - 1);
                    if (vMemory.content[memoryPointer] < 0) {
                        Vue.set(vMemory.content, memoryPointer, wordSize - 1);
                    }
                    break;

                case '>':
                    if ((memoryPointer + 2) < memorySize) {
                        memoryPointer++;
                    } else {
                        memoryPointer = 0;
                    }
                    break;

                case '<':
                    if (memoryPointer > 0) {
                        memoryPointer--;
                    } else {
                        memoryPointer = memorySize - 1;
                    }
                    break;

                case '[':
                    let closingBracketPosition = findClosingBracket(codePointer, code);
                    while (vMemory.content[memoryPointer]) {
                        yield* interpret(code, codePointer + 1, closingBracketPosition);
                    }
                    codePointer = closingBracketPosition;
                    break;

                case ']':
                    console.log('Error: met closing bracket!');
                    break;

                default:
                    unknownCharacter = true;
            }
            if (!unknownCharacter) {
                yield codePointer;
            }
        }
    }

    function printToOutput(byte) {
        let char;
        if (byte === 13) {
            char = '<br>';
        } else {
            char = String.fromCharCode(byte);
        }
        let newOutput = outputField.html() + char;
        outputField.html(newOutput);
    }
});