import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";import{n,t as r}from"./ProgressPill-6LBjG0lJ.js";var i,a,o,s,c,l,u;e((()=>{n(),i=t(),a={title:`Components/Feedback/ProgressPill`,component:r,parameters:{layout:`centered`},argTypes:{tone:{control:`select`,options:[`default`,`complete`,`attention`]}}},o={name:`In progress`,render:()=>(0,i.jsx)(r,{tone:`default`,children:`3 of 7`})},s={name:`Complete`,render:()=>(0,i.jsx)(r,{tone:`complete`,children:`7 of 7`})},c={name:`Needs attention`,render:()=>(0,i.jsx)(r,{tone:`attention`,children:`0 of 7`})},l={name:`All tones`,render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:10,alignItems:`center`},children:[(0,i.jsx)(r,{tone:`default`,children:`3 of 7`}),(0,i.jsx)(r,{tone:`complete`,children:`7 of 7`}),(0,i.jsx)(r,{tone:`attention`,children:`0 of 7`})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'In progress',
  render: () => <ProgressPill tone="default">3 of 7</ProgressPill>
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Complete',
  render: () => <ProgressPill tone="complete">7 of 7</ProgressPill>
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Needs attention',
  render: () => <ProgressPill tone="attention">0 of 7</ProgressPill>
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'All tones',
  render: () => <div style={{
    display: 'flex',
    gap: 10,
    alignItems: 'center'
  }}>
      <ProgressPill tone="default">3 of 7</ProgressPill>
      <ProgressPill tone="complete">7 of 7</ProgressPill>
      <ProgressPill tone="attention">0 of 7</ProgressPill>
    </div>
}`,...l.parameters?.docs?.source}}},u=[`Default`,`Complete`,`Attention`,`AllTones`]}))();export{l as AllTones,c as Attention,s as Complete,o as Default,u as __namedExportsOrder,a as default};