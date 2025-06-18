// Mock Adobe Express SDK for demonstration purposes
export const editor = {
    ready: true,
    context: {
        document: {
            pages: [
                {
                    artboards: [
                        {
                            children: [
                                {
                                    type: 'text',
                                    text: 'Welcome to Adobe Express',
                                    fontSize: 24,
                                    fontWeight: 700,
                                    fill: {
                                        type: 'solid',
                                        color: { r: 50, g: 50, b: 50, a: 1 }
                                    },
                                    parent: {
                                        fill: {
                                            type: 'solid',
                                            color: { r: 255, g: 255, b: 255, a: 1 }
                                        }
                                    },
                                    altText: ''
                                },
                                {
                                    type: 'text',
                                    text: 'This text has poor contrast',
                                    fontSize: 14,
                                    fontWeight: 400,
                                    fill: {
                                        type: 'solid',
                                        color: { r: 200, g: 200, b: 200, a: 1 }
                                    },
                                    parent: {
                                        fill: {
                                            type: 'solid',
                                            color: { r: 255, g: 255, b: 255, a: 1 }
                                        }
                                    },
                                    altText: ''
                                },
                                {
                                    type: 'text',
                                    text: 'THIS IS ALL CAPS TEXT WHICH IS HARDER TO READ',
                                    fontSize: 16,
                                    fontWeight: 400,
                                    fill: {
                                        type: 'solid',
                                        color: { r: 0, g: 0, b: 0, a: 1 }
                                    },
                                    parent: {
                                        fill: {
                                            type: 'solid',
                                            color: { r: 255, g: 255, b: 255, a: 1 }
                                        }
                                    },
                                    altText: ''
                                },
                                {
                                    type: 'text',
                                    text: 'Small text',
                                    fontSize: 8,
                                    fontWeight: 400,
                                    fill: {
                                        type: 'solid',
                                        color: { r: 0, g: 0, b: 0, a: 1 }
                                    },
                                    parent: {
                                        fill: {
                                            type: 'solid',
                                            color: { r: 255, g: 255, b: 255, a: 1 }
                                        }
                                    },
                                    altText: ''
                                },
                                {
                                    type: 'image',
                                    altText: '',
                                    parent: null
                                },
                                {
                                    type: 'shape',
                                    altText: 'Decorative circle',
                                    parent: null
                                },
                                {
                                    type: 'group',
                                    children: new Array(15).fill(null).map((_, i) => ({
                                        type: 'shape',
                                        altText: `Shape ${i + 1}`
                                    }))
                                },
                                {
                                    type: 'text',
                                    text: 'Click here for more info',
                                    fontSize: 16,
                                    fontWeight: 400,
                                    fill: {
                                        type: 'solid',
                                        color: { r: 0, g: 0, b: 255, a: 1 }
                                    },
                                    parent: {
                                        fill: {
                                            type: 'solid',
                                            color: { r: 255, g: 255, b: 255, a: 1 }
                                        }
                                    },
                                    altText: '',
                                    isInteractive: true
                                },
                                {
                                    type: 'text',
                                    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                                    fontSize: 14,
                                    fontWeight: 400,
                                    fill: {
                                        type: 'solid',
                                        color: { r: 0, g: 0, b: 0, a: 1 }
                                    },
                                    parent: {
                                        fill: {
                                            type: 'solid',
                                            color: { r: 255, g: 255, b: 255, a: 1 }
                                        }
                                    },
                                    altText: ''
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    on: (event, callback) => {
        if (event === 'ready') {
            setTimeout(callback, 100);
        }
    }
};