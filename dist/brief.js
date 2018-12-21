(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.briefjs = {}));
}(this, function (exports) { 'use strict';

  function _templateObject2() {
    var data = _taggedTemplateLiteral([""]);

    _templateObject2 = function _templateObject2() {
      return data;
    };

    return data;
  }

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

  function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

  function _templateObject() {
    var data = _taggedTemplateLiteral([""]);

    _templateObject = function _templateObject() {
      return data;
    };

    return data;
  }

  function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

  function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

  function generateId() {
    var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return "".concat(prefix).concat(Math.random().toString(36).slice(2));
  }

  function innerHTML(textNodes) {
    for (var _len = arguments.length, subElements = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      subElements[_key - 1] = arguments[_key];
    }

    return [].concat(_toConsumableArray(subElements.map(function (el, i) {
      if (typeof el === 'function') {
        el = el(_templateObject());
      }

      return "".concat(textNodes[i]).concat(el);
    })), [textNodes.slice(-1)]).join('');
  }

  function expandAttributes(attrs) {
    return Object.entries(attrs).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];

      if (typeof value === 'function') {
        var handler = generateId('e_');
        window[handler] = value;
        return "".concat(key, "=\"").concat(handler, "()\"");
      }

      if (value && _typeof(value) === 'object') {
        value = Object.entries(value).map(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
              key = _ref4[0],
              value = _ref4[1];

          return "".concat(key, ":").concat(value, ";");
        }).join('');
      }

      return "".concat(key, "=\"").concat(value, "\"");
    }).join(' ');
  }

  function taged(tagName) {
    return function () {
      if (Array.isArray(arguments.length <= 0 ? undefined : arguments[0])) {
        return "<".concat(tagName, ">").concat(innerHTML.apply(void 0, arguments), "</").concat(tagName, ">");
      }

      var attrs = arguments.length <= 0 ? undefined : arguments[0];
      return function () {
        return "<".concat(tagName, " ").concat(expandAttributes(attrs), ">").concat(innerHTML.apply(void 0, arguments), "</").concat(tagName, ">");
      };
    };
  }

  function renderComponentNode(target, args) {
    var html = target.render(target.props, innerHTML.apply(void 0, _toConsumableArray(args)));
    if (typeof html === 'function') html = html(_templateObject2());
    var root = document.createElement('div');
    root.innerHTML = html;

    if (root.children.length !== 1) {
      throw new Error('Component should have one root element.');
    }

    var node = root.children[0];
    node.setAttribute(target.key, '');
    node.setAttribute('bk-component-root', '');
    document.addEventListener('DOMNodeInserted', function f(e) {
      if (target.updated) target.updated();
      document.removeEventListener('DOMNodeInserted', f);
    });
    return root;
  }

  var updatePromise = null;

  function update(target, args) {
    if (updatePromise) return updatePromise;
    updatePromise = Promise.resolve().then(function () {
      var root = renderComponentNode(target, args);
      var oldNode = target.node;
      var newNode = root.children[0];
      oldNode.parentNode.replaceChild(newNode, oldNode);
      updatePromise = null;
    });
  }

  function component(options) {
    var defaultProps = options.props;
    return function () {
      var p = {};

      function t() {
        var target = Object.assign({}, options);
        target.key = generateId('bk-');

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        target.update = update.bind(null, target, args);
        var props = {};

        if (typeof defaultProps === 'function') {
          props = defaultProps.call(options);
        }

        props = Object.assign({}, props, p);
        target.props = {};
        Object.keys(props).forEach(function (key) {
          Object.defineProperty(target.props, key, {
            enumerable: true,
            get: function get() {
              return props[key];
            },
            set: function set(val) {
              props[key] = val;
              target.update();
            }
          });
        });
        Object.defineProperties(target, {
          refs: {
            get: function get() {
              var nodes = Array.from(document.querySelectorAll("[".concat(target.key, "][ref],[").concat(target.key, "] [ref]")));
              var refs = {};
              nodes.forEach(function (el) {
                refs[el.getAttribute('ref')] = el;
              });
              return refs;
            }
          },
          node: {
            get: function get() {
              return document.querySelector("[".concat(target.key, "]"));
            }
          }
        });
        return renderComponentNode(target, args).innerHTML;
      }

      if ((arguments.length <= 0 ? undefined : arguments[0]) && !Array.isArray(arguments.length <= 0 ? undefined : arguments[0])) {
        p = arguments.length <= 0 ? undefined : arguments[0];
        return t;
      }

      return t.apply(void 0, arguments);
    };
  }

  function render(tpl, el) {
    el.innerHTML = tpl;
  }

  var tagNames = ('html,body,base,head,link,meta,style,title,' + 'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' + 'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' + 'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' + 's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' + 'embed,object,param,source,canvas,script,noscript,del,ins,' + 'caption,col,colgroup,table,thead,tbody,td,th,tr,' + 'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' + 'output,progress,select,textarea,' + 'details,dialog,menu,menuitem,summary,' + 'content,element,shadow,template,blockquote,iframe,tfoot').split(',');
  var tags = {};
  tagNames.forEach(function (name) {
    tags[name] = taged(name);
  });

  exports.tags = tags;
  exports.component = component;
  exports.render = render;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
