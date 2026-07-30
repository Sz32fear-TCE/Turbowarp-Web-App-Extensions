(function(Scratch) {
    'use strict';

    let typedText = '';
    let lastKey = '';
    let lastShortcut = '';

    document.addEventListener('keydown', e => {
        const modifier = e.metaKey || e.ctrlKey;

        // Detect shortcuts
        if (modifier) {
            switch (e.key.toLowerCase()) {
                case 'a':
                    lastShortcut = 'Select All';
                    return;

                case 'c':
                    lastShortcut = 'Copy';
                    return;

                case 'v':
                    lastShortcut = 'Paste';
                    return;

                case 'x':
                    lastShortcut = 'Cut';
                    return;

                case 'backspace':
                case 'delete':
                    lastShortcut = 'Delete All';
                    typedText = '';
                    return;
            }
        }

        lastKey = e.key;

        if (e.key === 'Backspace') {
            typedText = typedText.slice(0, -1);
        } else if (e.key === 'Enter') {
            typedText += '\n';
        } else if (e.key === 'Tab') {
            typedText += '\t';
            e.preventDefault();
        } else if (e.key.length === 1) {
            typedText += e.key;
        }
    });

    class Typing {
        getInfo() {
            return {
                id: 'typing',
                name: 'Typing',
                color1: '#4C97FF',
                color2: '#4280D7',
                blocks: [
                    {
                        opcode: 'typedText',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'typed text'
                    },
                    {
                        opcode: 'clearTypedText',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'clear typed text'
                    },

                    {
                        opcode: 'lastKey',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last key pressed'
                    },
                    {
                        opcode: 'clearLastKey',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'clear last key pressed'
                    },

                    {
                        opcode: 'lastShortcut',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last shortcut'
                    },
                    {
                        opcode: 'clearLastShortcut',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'clear last shortcut'
                    },

                    '---',

                    {
                        opcode: 'toUpperCase',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'uppercase [TEXT]',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello'
                            }
                        }
                    },
                    {
                        opcode: 'toLowerCase',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'lowercase [TEXT]',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'HELLO'
                            }
                        }
                    },
                    {
                        opcode: 'substring',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'letters [START] to [END] of [TEXT]',
                        arguments: {
                            START: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            },
                            END: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 5
                            },
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello World'
                            }
                        }
                    },
                    {
                        opcode: 'length',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'length of [TEXT]',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello'
                            }
                        }
                    }
                ]
            };
        }

        // Typed text

        typedText() {
            return typedText;
        }

        clearTypedText() {
            typedText = '';
        }

        // Last key

        lastKey() {
            return lastKey;
        }

        clearLastKey() {
            lastKey = '';
        }

        // Shortcuts

        lastShortcut() {
            return lastShortcut;
        }

        clearLastShortcut() {
            lastShortcut = '';
        }

        // String utilities

        toUpperCase(args) {
            return Scratch.Cast.toString(args.TEXT).toUpperCase();
        }

        toLowerCase(args) {
            return Scratch.Cast.toString(args.TEXT).toLowerCase();
        }

        substring(args) {
            const text = Scratch.Cast.toString(args.TEXT);
            const start = Math.max(0, Scratch.Cast.toNumber(args.START) - 1);
            const end = Scratch.Cast.toNumber(args.END);
            return text.substring(start, end);
        }

        length(args) {
            return Scratch.Cast.toString(args.TEXT).length;
        }
    }

    Scratch.extensions.register(new Typing());
})(Scratch);
