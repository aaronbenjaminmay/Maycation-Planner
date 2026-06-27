import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";import{n,t as r}from"./CardSurface-ByzvnDih.js";var i,a,o,s,c,l,u,d;e((()=>{n(),i=t(),a={title:`Components/CardSurface`,component:r,parameters:{layout:`centered`}},o=(0,i.jsxs)(`div`,{style:{padding:20},children:[(0,i.jsx)(`p`,{style:{margin:`0 0 6px`,fontWeight:600,color:`var(--color-text-primary)`},children:`Beach Maycation`}),(0,i.jsx)(`p`,{className:`muted`,style:{margin:0},children:`Jun 7–12 · Orange Beach`})]}),s={name:`Static (div)`,render:()=>(0,i.jsx)(r,{style:{width:280},children:o})},c={name:`Interactive (div — cursor only)`,render:()=>(0,i.jsx)(r,{interactive:!0,style:{width:280},children:o})},l={name:`As button`,render:()=>(0,i.jsx)(r,{as:`button`,style:{width:280,textAlign:`left`},onClick:()=>{},children:o})},u={name:`With className — intentional variant (trip-intel-card 0.68)`,render:()=>(0,i.jsxs)(r,{className:`trip-intel-card`,style:{width:280},children:[(0,i.jsx)(`div`,{className:`trip-intel-card__header`,children:(0,i.jsx)(`strong`,{children:`Trip summary`})}),(0,i.jsxs)(`dl`,{children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`dt`,{children:`Days`}),(0,i.jsx)(`dd`,{children:`6`})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`dt`,{children:`Complete`}),(0,i.jsx)(`dd`,{children:`4 / 12`})]})]})]})},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Static (div)',
  render: () => <CardSurface style={{
    width: 280
  }}>
      {cardContent}
    </CardSurface>
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Interactive (div — cursor only)',
  render: () => <CardSurface interactive style={{
    width: 280
  }}>
      {cardContent}
    </CardSurface>
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'As button',
  render: () => <CardSurface as="button" style={{
    width: 280,
    textAlign: 'left'
  }} onClick={() => {}}>
      {cardContent}
    </CardSurface>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'With className — intentional variant (trip-intel-card 0.68)',
  render: () => <CardSurface className="trip-intel-card" style={{
    width: 280
  }}>
      <div className="trip-intel-card__header">
        <strong>Trip summary</strong>
      </div>
      <dl>
        <div>
          <dt>Days</dt>
          <dd>6</dd>
        </div>
        <div>
          <dt>Complete</dt>
          <dd>4 / 12</dd>
        </div>
      </dl>
    </CardSurface>
}`,...u.parameters?.docs?.source}}},d=[`Static`,`Interactive`,`AsButton`,`WithClassName`]}))();export{l as AsButton,c as Interactive,s as Static,u as WithClassName,d as __namedExportsOrder,a as default};