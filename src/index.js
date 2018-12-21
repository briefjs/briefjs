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

const registedComponents = {};
const componentKeyName = 'bk-component-';

function getComponentNode(target, args) {
  const html = target.render(innerHTML(...args));
  const root = document.createElement('div');
  root.innerHTML = html;
  if(root.children.length !== 1) {
    throw new Error('Component should have one root element.');
  }
  if(!target.key) target.key = generateId('bk-');
  root.children[0].setAttribute(componentKeyName, target.key);
  return root;
}

function component(options) {
  const defaultProps = options.prop;
  return function (...args) {
    const target = Object.assign({}, options);
    let p = {};
    function t(...args) {
      let props = {};
      if(typeof defaultProps === 'function') {
        props = defaultProps.call(options);
      }
      props = Object.assign({}, props, p);
      target.props = {};
      Object.keys(props).forEach((key) => {
        Object.defineProperty(target.props, key, {
          enumerable: false,
          configurable: true,
          get() {
            return props[key];
          },
          set(val) {
            props[key] = val;
            if(target.componentWillUpdate) target.componentWillUpdate();
            const root = getComponentNode(target, args);
            const oldNode = target.ref;
            const newNode = root.children[0];
            oldNode.parentNode.replaceChild(newNode, oldNode);
            if(target.componentDidUpdate) target.componentDidUpdate();
          },
        });
      });
      Object.defineProperty(target, 'ref', {
        get() {
          return document.querySelector(`[${componentKeyName}="${target.key}"]`);
        },
      });
      if(target.componentWillMount) target.componentWillMount();
      const root = getComponentNode(target, args);
      registedComponents[target.key] = target;
      return `${root.innerHTML}`;
    }
    if(args[0] && !Array.isArray(args[0])) {
      p = args[0];
      return t;
    }

    return t(...args);
  };
}

function render(el, tpl) {
  if(typeof el === 'string') {
    el = document.querySelector(el);
  }
  el.addEventListener('DOMNodeInserted', function inserted(e) {
    const root = e.relatedNode;
    const componentEls = root.querySelectorAll(`[${componentKeyName}]`);
    const components = Array.from(componentEls).map(el => registedComponents[el.getAttribute(componentKeyName)]);
    components.forEach((c) => {
      if(c.componentDidMount) c.componentDidMount();
    });
    el.removeEventListener('DOMNodeInserted', inserted);
  });
  el.innerHTML = tpl;
  return el;
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