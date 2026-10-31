import { Component, registerSingleton } from "../../../../common/component.js";
import { CanvasPointerEvent, ICanvas, ICanvasParameters } from "../../../common/components/canvas.js";
import { IPanTool } from "../../../common/components/pan.js";
import { IToolbox, IToolboxTools } from "../../../common/components/toolbox.js";
import { ITool } from "../../../common/tool.js";



class _PanTool extends Component implements IPanTool {
    constructor(
        @IToolbox
        private readonly toolbox: IToolboxTools,
        @ICanvas
        private readonly canvas: ICanvasParameters,
    ) {
        super();

        this.toolbox.addTool({
            id:   "panTool",
            name: "Pan Tool",
            tool: this._createTool(),
        });
    }

    private readonly _createTool = ()=>new class implements ITool {
        constructor(private readonly _pt: _PanTool) {}

        onPointer(event: CanvasPointerEvent): void {
            const _dt = [event.event.movementX, event.event.movementY];
            this._pt.canvas.pan(_dt);
        }
    }(this) as ITool;

    dispose() {
        
    }
}

registerSingleton(IPanTool, _PanTool);