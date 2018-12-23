import {tags, renderTag} from 'brief-tpl';

function renderComponentNode(target, args) {
  let html = target.render(target.props, renderTag(...args).join(''));
  if(typeof html === 'function') html = html``;
  const root = document.createElement('div');
  root.innerHTML = html;
  if(root.children.length !== 1) {
    throw new Error('Component should have one root element.');
  }
  const node = root.children[0];
  node.setAttribute(target.key, '');
  node.setAttribute('bk-component-root', '');
  document.addEventListener('DOMNodeInserted', function f(e) {
    if(target.updated) target.updated();
    document.removeEventListener('DOMNodeInserted', f);
  });
  return root;
}

let updatePromise = null;

function update(target, args) {
  if(updatePromise) return updatePromise;
  updatePromise = Promise.resolve().then(() => {
    const root = renderComponentNode(target, args);
    const oldNode = target.node;
    const newNode = root.children[0];
    oldNode.parentNode.replaceChild(newNode, oldNode);
    updatePromise = null;
  });
}

function component(options) {
  const defaultProps = options.props;

  return function (...args) {
    let p = {};
    function t(...args) {
      const target = Object.assign({}, options);
      target.key = `bk-${Math.random().toString(36).slice(2)}`;
      target.update = update.bind(null, target, args);
      let props = {};
      if(typeof defaultProps === 'function') {
        props = defaultProps.call(options);
      }
      props = Object.assign({}, props, p);
      target.props = {};
      Object.keys(props).forEach((key) => {
        Object.defineProperty(target.props, key, {
          enumerable: true,
          get() {
            return props[key];
          },
          set(val) {
            props[key] = val;
            target.update();
          },
        });
      });
      Object.defineProperties(target, {
        refs: {
          get() {
            const nodes = Array.from(document.querySelectorAll(`[${target.key}][ref],[${target.key}] [ref]`));
            const refs = {};
            nodes.forEach((el) => {
              refs[el.getAttribute('ref')] = el;
            });
            return refs;
          },
        },
        node: {
          get() {
            return document.querySelector(`[${target.key}]`);
          },
        },
      });
      return renderComponentNode(target, args).innerHTML;
    }

    if(args[0] && !Array.isArray(args[0])) {
      p = args[0];
      return t;
    }

    return t(...args);
  };
}

function render(tpl, el) {
  el.innerHTML = tpl;
}

export {
  tags,
  component,
  render,
};