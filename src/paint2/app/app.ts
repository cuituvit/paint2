import { Studio } from "../../studio/common/studio.js";
import "./app.css";



class _AppBase extends DisposableStack {
    constructor() {
        super();

        this.element = document.createElement("div");
        this.element.id = "app";
        document.body.appendChild(this.element);
    }

    readonly element: HTMLElement;
}

class _App extends _AppBase {
    constructor() {
        super();

        this.use(new Studio(this.element));
    }
}

const _app = new _App;