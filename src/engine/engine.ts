import { Component, createDecorator, registerSingleton } from "../common/component.js";



export interface IEngine {

}

export const IEngine = createDecorator<IEngine>("engine");

class Engine extends Component implements IEngine {
    constructor() {
        super();
    }

    [Symbol.dispose](): void {
        
    }
}

registerSingleton(IEngine, Engine);