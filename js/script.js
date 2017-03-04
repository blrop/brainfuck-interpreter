var memory;

$(function() {
    function log(n) {
        console.log(n);
    }

    var memorySize = 50;
    var wordSize = 256;

    var outputField = $('#output');

    var memoryPointer;

    memory = new Vue({
        el: '#memory',
        data: {
            content: [],
            selected: 0
        }
    });
    for (var i = 0; i < memorySize; i++) {
        memory.content.push(0);
    }
    clearMemory();

    function clearMemory() {
        // заполняем массив памяти нулями и рендерим нужное кол-во клеток памяти
        for (var i = 0; i < memorySize; i++) {
            Vue.set(memory.content, i, 0);
        }
        memoryPointer = 0;
    }

    $('#start').click(function() {
        clearMemory();

        var code = $('.js-code').val();
        var iterator = interpret(code, 0, code.length);

        var item = iterator.next();
        var intervalId = setInterval(function() {
            if (!item.done) {
                item = iterator.next();
                memory.selected = memoryPointer;
            } else {
                clearInterval(intervalId);
            }
        }, 50);
    });

    $('#test').click(function() {

    });

    function findClosingBracket(start, text) {
        var bracketCount = 0;
        var index = start;
        do {
            if (index > (text.length - 1)) {
                console.log('Error: Unexpected end of line while closing bracket searching');
                return;
            }
            if (text[index] == '[') {
                bracketCount++;
            }
            if (text[index] == ']') {
                bracketCount--;
            }
            index++;
        } while (bracketCount > 0);
        return index - 1;
    }

    function* interpret(code, start, end) {
        for (var codePointer = start; codePointer < end; codePointer++) {
            switch (code[codePointer]) {
                case '.':
                    printToOutput(memory.content[memoryPointer]);
                    break;

                case ',':

                    break;

                case '+':
                    Vue.set(memory.content, memoryPointer, memory.content[memoryPointer] + 1);
                    if (memory.content[memoryPointer] > (wordSize - 1)) {
                        Vue.set(memory.content, memoryPointer, 0);
                    }
                    break;

                case '-':
                    Vue.set(memory.content, memoryPointer, memory.content[memoryPointer] - 1);
                    if (memory.content[memoryPointer] < 0) {
                        Vue.set(memory.content, memoryPointer, wordSize - 1);
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
                    var closingBracketPosition = findClosingBracket(codePointer, code);
                    while (memory.content[memoryPointer]) {
                        yield* interpret(code, codePointer + 1, closingBracketPosition);
                    }
                    codePointer = closingBracketPosition;
                    break;

                case ']':
                    console.log('Error: met closing bracket!');
                    break;

                default:
                    //console.log('Unknown character');
            }
            yield codePointer;
        }
    }

    function printToOutput(byte) {
        var char;
        if (byte == 10) {
            char = '<br>';
        } else {
            char = String.fromCharCode(byte);
        }
        var newOutput = outputField.html() + char;
        outputField.html(newOutput);
    }
});