import { _WarnImport } from "../Misc/devTools.js";
import { IsDocumentAvailable } from "../Misc/domManagement.js";
export const EngineFunctionContext = {};
/**
 * @internal
 */
export function _ConcatenateShader(source, defines, shaderVersion = "") {
    return shaderVersion + (defines ? defines + "\n" : "") + source;
}
/**
 * @internal
 */
export function _loadFile(url, onSuccess, onProgress, offlineProvider, useArrayBuffer, onError, injectedLoadFile) {
    const loadFile = injectedLoadFile || EngineFunctionContext.loadFile;
    if (loadFile) {
        const request = loadFile(url, onSuccess, onProgress, offlineProvider, useArrayBuffer, onError);
        return request;
    }
    throw _WarnImport("FileTools");
}
/**
 * Gets host document
 * @param renderingCanvas if provided, the canvas' owner document will be returned
 * @returns the host document object
 */
export function getHostDocument(renderingCanvas = null) {
    if (renderingCanvas && renderingCanvas.ownerDocument) {
        return renderingCanvas.ownerDocument;
    }
    return IsDocumentAvailable() ? document : null;
}
/** @internal */
export function _getGlobalDefines(defines, isNDCHalfZRange, useReverseDepthBuffer, useExactSrgbConversions) {
    if (defines) {
        if (isNDCHalfZRange) {
            defines["IS_NDC_HALF_ZRANGE"] = "";
        }
        else {
            delete defines["IS_NDC_HALF_ZRANGE"];
        }
        if (useReverseDepthBuffer) {
            defines["USE_REVERSE_DEPTHBUFFER"] = "";
        }
        else {
            delete defines["USE_REVERSE_DEPTHBUFFER"];
        }
        if (useExactSrgbConversions) {
            defines["USE_EXACT_SRGB_CONVERSIONS"] = "";
        }
        else {
            delete defines["USE_EXACT_SRGB_CONVERSIONS"];
        }
        return;
    }
    else {
        let s = "";
        if (isNDCHalfZRange) {
            s += "#define IS_NDC_HALF_ZRANGE";
        }
        if (useReverseDepthBuffer) {
            if (s) {
                s += "\n";
            }
            s += "#define USE_REVERSE_DEPTHBUFFER";
        }
        if (useExactSrgbConversions) {
            if (s) {
                s += "\n";
            }
            s += "#define USE_EXACT_SRGB_CONVERSIONS";
        }
        return s;
    }
}
//# sourceMappingURL=abstractEngine.functions.js.map