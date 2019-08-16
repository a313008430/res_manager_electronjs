(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.main = factory());
}(this, function () { 'use strict';

    class Game {
        constructor() {
        }
        test(e) {
            return e;
        }
    }

    class Main {
        constructor() {
            var a = new Game;
            console.log(a.test(232));
        }
    }

    return Main;

}));
