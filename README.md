# BriefJS

Deadly simple declarative JavaScript framework for building UI.

## Why BriefJS?

- Tiny size. (_2.3kb gzipped_)
- Zero dependence.
- Pure ES6.
- No compiler. (_Directly use taged template strings_).
- Stateless.
- Fast and extendable.

## Installation

From CDN:

```html
<script src="https://s3.ssl.qhres.com/!f8bdfee3/brief.min.js"></script>
```

With NPM:

```bash
npm install briefjs
```

## Example

```js
const {tags, component, render} = briefjs;
const {div, span} = tags;

function randomColor() {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return `rgb(${r},${g},${b})`;
}

const MyTag = component({
  props: {
    color: 'red;',
    onclick: 'void(0)',
  },
  render(props, slot) {
    return div({style: {color: props.color}, onclick: props.onclick})`
      ${span({ref: 'foo'})`1`}
      ${span`${props.color}`}
      ${slot}
    `;
  },
  updated() {
    console.log(this.refs);
  },
});

const Outer = component({
  render(props, slot) {
    let color = randomColor();
    const onclick = () => {
      color = randomColor();
      this.update();
    };
    return MyTag({color, onclick})`${slot}`;
  },
  updated() {
    this.node.addEventListener('mousedown', () => {
      console.log('mousedown');
    });
  },
});

const tpl = div`
  ${Outer`
    ${span`abc`}
  `}
  ${span`3`}
  ${span`4`}
  ${div`
    ${span`5`}
  `}
`;

render(tpl, document.getElementById('app'));
```
