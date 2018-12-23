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

import { tags, renderTag } from 'brief-tpl';

function renderComponentNode(target, args) {
  var html = target.render(target.props, renderTag.apply(void 0, _toConsumableArray(args)).join(''));
  if (typeof html === 'function') html = html(_templateObject());
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
      target.key = "bk-".concat(Math.random().toString(36).slice(2));

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
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

export { tags, component, render };