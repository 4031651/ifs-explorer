"use strict";
exports.__esModule = true;
exports.elem = void 0;
function elem(tagName, props, children) {
    if (props === void 0) { props = {}; }
    if (children === void 0) { children = []; }
    var e = document.createElement(tagName);
    for (var _i = 0, _a = Object.entries(props); _i < _a.length; _i++) {
        var _b = _a[_i], a = _b[0], v = _b[1];
        if (a === 'style') {
            Object.assign(e.style, v);
            continue;
        }
        e.setAttribute(a, v);
    }
    console.log(children);
    var childs = Array.isArray(children) ? children : [children];
    for (var _c = 0, childs_1 = childs; _c < childs_1.length; _c++) {
        var c = childs_1[_c];
        e.appendChild(c);
    }
    return e;
}
exports.elem = elem;
