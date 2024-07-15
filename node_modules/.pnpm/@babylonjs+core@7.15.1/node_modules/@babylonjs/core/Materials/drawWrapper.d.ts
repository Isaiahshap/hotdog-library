import type { IDrawContext } from "../Engines/IDrawContext";
import type { IMaterialContext } from "../Engines/IMaterialContext";
import type { Nullable } from "../types";
import type { AbstractEngine } from "../Engines/abstractEngine";
import type { Effect } from "./effect";
import type { MaterialDefines } from "./materialDefines";
/** @internal */
export declare class DrawWrapper {
    effect: Nullable<Effect>;
    defines: Nullable<string | MaterialDefines>;
    materialContext?: IMaterialContext;
    drawContext?: IDrawContext;
    /**
     * @internal
     * Specifies if the effect was previously ready
     */
    _wasPreviouslyReady: boolean;
    /**
     * @internal
     * Forces the code from bindForSubMesh to be fully run the next time it is called
     */
    _forceRebindOnNextCall: boolean;
    /**
     * @internal
     * Specifies if the effect was previously using instances
     */
    _wasPreviouslyUsingInstances: Nullable<boolean>;
    static GetEffect(effect: Effect | DrawWrapper): Nullable<Effect>;
    constructor(engine: AbstractEngine, createMaterialContext?: boolean);
    setEffect(effect: Nullable<Effect>, defines?: Nullable<string | MaterialDefines>, resetContext?: boolean): void;
    dispose(): void;
}
