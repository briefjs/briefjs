# BriefJS

Deadly simple declarative JavaScript framework for building UI.

## Why BriefJS?

- Tiny size. (_2.3kb gzipped_)
- Zero dependence.
- Pure ES6.
- No compiler. (_Directly use taged template strings_).
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
  },
  componentDidMount() {
    console.log('mounted');
  },
  clicked() {
    this.props.color = randomColor();
  },
  render(slot) {
    return div({style: {color: this.props.color}, onclick: this.clicked.bind(this)})`
      ${span`1`}
      ${span`2`}
      ${slot}
    `;
  },
});

const tpl = div`
  ${MyTag({color: 'blue'})}
  ${span`3`}
  ${span`4`}
  ${div`
    ${span`5`}
  `}
`;

render('#app', tpl);
```
