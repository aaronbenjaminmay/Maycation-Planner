import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";import{n,t as r}from"./Icon-DddlY8fB.js";var i,a,o,s,c,l,u;e((()=>{n(),i=t(),a={title:`Components/Icon`,component:r,parameters:{layout:`centered`},argTypes:{name:{control:`select`},size:{control:`select`,options:[`small`,`default`,`large`]}}},o={args:{name:`calendar`,size:`default`}},s=[`add`,`back`,`bed`,`calendar`,`check`,`chevron-right`,`close`,`compass`,`delete`,`edit`,`image`,`plane`,`refresh`,`settings`,`sign-out`,`star`,`ticket`,`tree-palm`,`user-plus`,`utensils`,`x-circle`],c={render:()=>(0,i.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fill, minmax(100px, 1fr))`,gap:8,maxWidth:560},children:s.map(e=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:8,padding:`12px 8px`,background:`var(--color-surface-glass)`,border:`1px solid var(--color-border-glass)`,borderRadius:10},children:[(0,i.jsx)(r,{name:e,size:`default`}),(0,i.jsx)(`code`,{style:{fontSize:10,color:`#a1a1a6`,textAlign:`center`,wordBreak:`break-all`},children:e})]},e))})},l={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:24,alignItems:`center`},children:[(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:8},children:[(0,i.jsx)(r,{name:`star`,size:`small`}),(0,i.jsx)(`code`,{style:{fontSize:11,color:`#a1a1a6`},children:`small (16px)`})]}),(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:8},children:[(0,i.jsx)(r,{name:`star`,size:`default`}),(0,i.jsx)(`code`,{style:{fontSize:11,color:`#a1a1a6`},children:`default (18px)`})]}),(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:8},children:[(0,i.jsx)(r,{name:`star`,size:`large`}),(0,i.jsx)(`code`,{style:{fontSize:11,color:`#a1a1a6`},children:`large (20px)`})]})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'calendar',
    size: 'default'
  }
}`,...o.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: 8,
    maxWidth: 560
  }}>
      {allIcons.map(name => <div key={name} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      padding: '12px 8px',
      background: 'var(--color-surface-glass)',
      border: '1px solid var(--color-border-glass)',
      borderRadius: 10
    }}>
          <Icon name={name} size="default" />
          <code style={{
        fontSize: 10,
        color: '#a1a1a6',
        textAlign: 'center',
        wordBreak: 'break-all'
      }}>{name}</code>
        </div>)}
    </div>
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 24,
    alignItems: 'center'
  }}>
      <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }}>
        <Icon name="star" size="small" />
        <code style={{
        fontSize: 11,
        color: '#a1a1a6'
      }}>small (16px)</code>
      </div>
      <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }}>
        <Icon name="star" size="default" />
        <code style={{
        fontSize: 11,
        color: '#a1a1a6'
      }}>default (18px)</code>
      </div>
      <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }}>
        <Icon name="star" size="large" />
        <code style={{
        fontSize: 11,
        color: '#a1a1a6'
      }}>large (20px)</code>
      </div>
    </div>
}`,...l.parameters?.docs?.source}}},u=[`Single`,`Catalog`,`Sizes`]}))();export{c as Catalog,o as Single,l as Sizes,u as __namedExportsOrder,a as default};