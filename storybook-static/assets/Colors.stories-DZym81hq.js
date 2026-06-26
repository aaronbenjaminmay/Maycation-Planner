import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";function n({token:e,label:t,note:n}){return(0,i.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:16,marginBottom:12},children:[(0,i.jsx)(`div`,{style:{width:44,height:44,borderRadius:10,background:`var(${e})`,border:`1px solid rgba(255,255,255,0.12)`,flexShrink:0}}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`code`,{style:{fontSize:12,color:`#f5f7fb`,display:`block`},children:e}),(0,i.jsx)(`span`,{style:{fontSize:12,color:`#a1a1a6`},children:t}),n?(0,i.jsx)(`span`,{style:{fontSize:11,color:`#5a5a5e`,display:`block`},children:n}):null]})]})}function r({title:e,children:t}){return(0,i.jsxs)(`div`,{style:{marginBottom:36},children:[(0,i.jsx)(`p`,{style:{margin:`0 0 16px`,fontSize:11,fontWeight:900,letterSpacing:`0.18em`,textTransform:`uppercase`,color:`#a1a1a6`},children:e}),t]})}var i,a,o,s;e((()=>{i=t(),a={title:`Foundation/Colors`,parameters:{layout:`padded`}},o={name:`Color Palette`,render:()=>(0,i.jsxs)(`div`,{style:{maxWidth:560},children:[(0,i.jsxs)(r,{title:`Background`,children:[(0,i.jsx)(n,{token:`--color-background-default`,label:`App background`,note:`#000000`}),(0,i.jsx)(n,{token:`--color-surface-default`,label:`Panel background`,note:`#121316`}),(0,i.jsx)(n,{token:`--color-surface-elevated`,label:`Elevated control surface`,note:`#1a1c20`}),(0,i.jsx)(n,{token:`--color-surface-glass`,label:`Card / modal surface (glass)`,note:`rgba(28, 28, 30, 0.74)`}),(0,i.jsx)(n,{token:`--color-surface-input`,label:`Form input background`,note:`rgba(0, 0, 0, 0.28)`})]}),(0,i.jsxs)(r,{title:`Border`,children:[(0,i.jsx)(n,{token:`--color-border-default`,label:`Opaque border`,note:`#2b2d32`}),(0,i.jsx)(n,{token:`--color-border-glass`,label:`Glass surface border`,note:`rgba(255, 255, 255, 0.08)`}),(0,i.jsx)(n,{token:`--color-border-control`,label:`Interactive control border`,note:`rgba(255, 255, 255, 0.1)`})]}),(0,i.jsxs)(r,{title:`Text`,children:[(0,i.jsx)(n,{token:`--color-text-primary`,label:`Headings, strong text, labels`,note:`#f5f7fb`}),(0,i.jsx)(n,{token:`--color-text-secondary`,label:`Body text`,note:`#b6bfcc`}),(0,i.jsx)(n,{token:`--color-text-muted`,label:`Metadata, summaries`,note:`#a1a1a6`})]}),(0,i.jsxs)(r,{title:`Accent`,children:[(0,i.jsx)(n,{token:`--color-accent-default`,label:`Brand accent`,note:`#35b8a8`}),(0,i.jsx)(n,{token:`--color-accent-text`,label:`Text on accent backgrounds`,note:`#061312`})]}),(0,i.jsxs)(r,{title:`Danger`,children:[(0,i.jsx)(n,{token:`--color-danger-surface`,label:`Danger action background`,note:`rgba(168, 75, 75, 0.2)`}),(0,i.jsx)(n,{token:`--color-danger-border`,label:`Danger action border`,note:`#a84b4b`}),(0,i.jsx)(n,{token:`--color-danger-text`,label:`Danger state text`,note:`#ffd7d7`})]}),(0,i.jsx)(r,{title:`Overlay`,children:(0,i.jsx)(n,{token:`--color-overlay-default`,label:`Modal backdrop`,note:`rgba(0, 0, 0, 0.78)`})})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Color Palette',
  render: () => <div style={{
    maxWidth: 560
  }}>
      <Group title="Background">
        <Swatch token="--color-background-default" label="App background" note="#000000" />
        <Swatch token="--color-surface-default" label="Panel background" note="#121316" />
        <Swatch token="--color-surface-elevated" label="Elevated control surface" note="#1a1c20" />
        <Swatch token="--color-surface-glass" label="Card / modal surface (glass)" note="rgba(28, 28, 30, 0.74)" />
        <Swatch token="--color-surface-input" label="Form input background" note="rgba(0, 0, 0, 0.28)" />
      </Group>

      <Group title="Border">
        <Swatch token="--color-border-default" label="Opaque border" note="#2b2d32" />
        <Swatch token="--color-border-glass" label="Glass surface border" note="rgba(255, 255, 255, 0.08)" />
        <Swatch token="--color-border-control" label="Interactive control border" note="rgba(255, 255, 255, 0.1)" />
      </Group>

      <Group title="Text">
        <Swatch token="--color-text-primary" label="Headings, strong text, labels" note="#f5f7fb" />
        <Swatch token="--color-text-secondary" label="Body text" note="#b6bfcc" />
        <Swatch token="--color-text-muted" label="Metadata, summaries" note="#a1a1a6" />
      </Group>

      <Group title="Accent">
        <Swatch token="--color-accent-default" label="Brand accent" note="#35b8a8" />
        <Swatch token="--color-accent-text" label="Text on accent backgrounds" note="#061312" />
      </Group>

      <Group title="Danger">
        <Swatch token="--color-danger-surface" label="Danger action background" note="rgba(168, 75, 75, 0.2)" />
        <Swatch token="--color-danger-border" label="Danger action border" note="#a84b4b" />
        <Swatch token="--color-danger-text" label="Danger state text" note="#ffd7d7" />
      </Group>

      <Group title="Overlay">
        <Swatch token="--color-overlay-default" label="Modal backdrop" note="rgba(0, 0, 0, 0.78)" />
      </Group>
    </div>
}`,...o.parameters?.docs?.source}}},s=[`ColorPalette`]}))();export{o as ColorPalette,s as __namedExportsOrder,a as default};