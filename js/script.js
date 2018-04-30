const DEFAULT_CODE = '+++>++<\n[->>+>+<<<]>>>\n[-<<<+>>>]<<\n[->>+>+<<<]>>>\n[-<<<+>>>]<[<[->>+>+<<<]>>>[-<<<+>>>]<[->>+<<]<-]';
//const DEFAULT_CODE = '+++++++++++++++++++++++++++++++++++...';

const MEMORY_SIZE = 256;
const WORD_SIZE = 256;
const STEP_DELAY = 30;

let vMemory = new Vue({
    el: '#memory',
    data: {
        content: new Array(MEMORY_SIZE),
        selected: 0,
        pointer: 0
    },
    methods: {
        clear: function() {
            for (let i = 0; i < MEMORY_SIZE; i++) {
                Vue.set(this.content, i, 0);
            }
            this.pointer = 0;
        },
        getItemColor: function(value) {
            // use only 6 bits to translate them to some color
            let r = (value & 1 || value & 8) ? 'ff' : '00';
            let g = (value & 2 || value & 16) ? 'ff' : '00';
            let b = (value & 4 || value & 32) ? 'ff' : '00';
            return '#' + r + g + b;
        }
    },
    created: function() {
        this.content.fill(0);
        this.clear();
    }
});
let vCode = new Vue({
    el: '#code',
    data: {
        code: DEFAULT_CODE,
        running: false,
        selected: 0
    },
    methods: {
        start: function() {
            vOutput.clear();
            vMemory.clear();

            this.running = true;

            let iterator = interpret(this.code, 0, this.code.length);

            let item = iterator.next();
            let intervalId = setInterval(() => {
                if (!item.done && this.running) {
                    item = iterator.next();
                    this.selected = item.value;
                    vMemory.selected = vMemory.pointer;
                } else {
                    clearInterval(intervalId);
                    this.running = false;
                }
            }, STEP_DELAY);
        },
        stop: function() {
            this.running = false;
        }
    }
});
let vOutput = new Vue({
    el: '#output',
    data: {
        content: ''
    },
    methods: {
        printByte: function(byte) {
            let char = String.fromCharCode(byte);
            this.content = this.content + char;
        },
        clear: function() {
            this.content = '';
        }
    }
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
                vOutput.printByte(vMemory.content[vMemory.pointer]);
                break;

            case ',':
                // todo: implement input action
                break;

            case '+':
                Vue.set(vMemory.content, vMemory.pointer, vMemory.content[vMemory.pointer] + 1);
                if (vMemory.content[vMemory.pointer] > (WORD_SIZE - 1)) {
                    Vue.set(vMemory.content, vMemory.pointer, 0);
                }
                break;

            case '-':
                Vue.set(vMemory.content, vMemory.pointer, vMemory.content[vMemory.pointer] - 1);
                if (vMemory.content[vMemory.pointer] < 0) {
                    Vue.set(vMemory.content, vMemory.pointer, WORD_SIZE - 1);
                }
                break;

            case '>':
                if ((vMemory.pointer + 2) < MEMORY_SIZE) {
                    vMemory.pointer++;
                } else {
                    vMemory.pointer = 0;
                }
                break;

            case '<':
                if (vMemory.pointer > 0) {
                    vMemory.pointer--;
                } else {
                    vMemory.pointer = MEMORY_SIZE - 1;
                }
                break;

            case '[':
                let closingBracketPosition = findClosingBracket(codePointer, code);
                while (vMemory.content[vMemory.pointer]) {
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
        if (!unknownCharacter && vCode.running) {
            yield codePointer;
        }
    }
}
