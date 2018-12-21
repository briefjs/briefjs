function generateId(prefix = '') {
  return `${prefix}${Math.random().toString(36).slice(2)}`;
}

function innerHTML(textNodes, ...subElements) {
  return [...subElements.map((el, i) => {
    if(typeof el === 'function') {
      el = el``;
    }
    return `${textNodes[i]}${el}`;
  }), textNodes.slice(-1)].join('');
}

function expandAttributes(attrs) {
  return Object.entries(attrs).map(([key, value]) => {
    if(typeof value === 'function') {
      const handler = generateId('e_');
      window[handler] = value;
      return `${key}="${handler}()"`;
    }
    if(value && typeof value === 'object') {
      value = Object.entries(value).map(([key, value]) => `${key}:${value};`).join('');
    }
    return `${key}="${value}"`;
  }).join(' ');
}

function taged(tagName) {
  return function (...args) {
    if(Array.isArray(args[0])) {
      return `<${tagName}>${innerHTML(...args)}</${tagName}>`;
    }
    const attrs = args[0];
    return function (...args) {
      return `<${tagName} ${expandAttributes(attrs)}>${innerHTML(...args)}</${tagName}>`;
    };
  };
}

function renderComponentNode(target, args) {
  let html = target.render(target.props, innerHTML(...args));
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
      target.key = generateId('bk-');
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

const tagNames = ('html,body,base,head,link,meta,style,title,'
  + 'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,'
  + 'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,'
  + 'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,'
  + 's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,'
  + 'embed,object,param,source,canvas,script,noscript,del,ins,'
  + 'caption,col,colgroup,table,thead,tbody,td,th,tr,'
  + 'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,'
  + 'output,progress,select,textarea,'
  + 'details,dialog,menu,menuitem,summary,'
  + 'content,element,shadow,template,blockquote,iframe,tfoot').split(',');

const tags = {};

tagNames.forEach((name) => { tags[name] = taged(name) });

export {
  tags,
  component,
  render,
};