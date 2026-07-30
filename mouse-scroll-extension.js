(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.register) {
        return;
    }

    class MouseScrollExtension {
        constructor() {
            this.scrollX = 0;
            this.scrollY = 0;
            this.lastDirection = 'none';

            this.boundHandleWheel = this.handleWheel.bind(this);
            document.addEventListener('wheel', this.boundHandleWheel);
        }

        handleWheel(event) {
            this.scrollX = event.deltaX;
            this.scrollY = event.deltaY;
            
            if (this.scrollY > 0) {
                this.lastDirection = 'down';
            } else if (this.scrollY < 0) {
                this.lastDirection = 'up';
            }
        }

        getInfo() {
            return {
                id: 'mousescrolldetector',
                name: 'Mouse Scroll',
                color1: '#FFAB19', // Standard orange (Sensing)
                color2: '#E69400',
                blocks: [
                    {
                        opcode: 'isScrollingUp',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'scrolled up?'
                    },
                    {
                        opcode: 'isScrollingDown',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'scrolled down?'
                    },
                    {
                        opcode: 'getScrollDistance',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'scroll distance [AXIS]',
                        arguments: {
                            AXIS: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'axisMenu'
                            }
                        }
                    },
                    {
                        opcode: 'getLastDirection',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last scroll direction'
                    }
                ],
                menus: {
                    axisMenu: {
                        acceptReporters: false,
                        items: ['Y (Vertical)', 'X (Horizontal)']
                    }
                }
            };
        }

        isScrollingUp() {
            const isUp = this.scrollY < 0;
            this.resetScroll(); 
            return isUp;
        }

        isScrollingDown() {
            const isDown = this.scrollY > 0;
            this.resetScroll();
            return isDown;
        }

        getScrollDistance(args) {
            const distance = args.AXIS === 'X (Horizontal)' ? this.scrollX : this.scrollY;
            this.resetScroll();
            return distance;
        }

        getLastDirection() {
            const direction = this.lastDirection;
            this.lastDirection = 'none'; // Reset after reading
            return direction;
        }

        resetScroll() {
            this.scrollX = 0;
            this.scrollY = 0;
        }
    }

    Scratch.extensions.register(new MouseScrollExtension());
})(Scratch);
