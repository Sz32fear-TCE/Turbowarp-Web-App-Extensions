(function(Scratch) {
    'use strict';

    class EmailChecker {
        getInfo() {
            return {
                id: 'emailchecker',
                name: 'Email Checker',
                color1: '#9966FF',
                color2: '#855CD6',
                blocks: [
                    {
                        opcode: 'isEmail',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '[TEXT] is email format?',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'user@example.com'
                            }
                        }
                    }
                ]
            };
        }

        isEmail(args) {
            const text = Scratch.Cast.toString(args.TEXT).trim();

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            return emailRegex.test(text);
        }
    }

    Scratch.extensions.register(new EmailChecker());
})(Scratch);
