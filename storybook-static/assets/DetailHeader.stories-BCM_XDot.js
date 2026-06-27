import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./iframe-c5htpppT.js";import{t as n}from"./jsx-runtime-CaZkqeYb.js";import{n as r,t as i}from"./IconButton-BQ2aLIs5.js";import{n as a,t as o}from"./PageControls-CwKsg4qt.js";import{n as s,t as c}from"./ScreenHeader-CRtwdwQp.js";function l({action:e,eyebrow:t,meta:n,onBack:r,title:a,titleContent:s}){return(0,u.jsxs)(`header`,{className:`detail-header`,children:[(0,u.jsx)(o,{leading:(0,u.jsx)(i,{icon:`back`,label:`Back`,onClick:r}),trailing:e}),s??(0,u.jsx)(c,{eyebrow:t,title:a,meta:n})]})}var u,d=e((()=>{t(),r(),a(),s(),u=n(),l.__docgenInfo={description:``,methods:[],displayName:`DetailHeader`,props:{action:{required:!1,tsType:{name:`ReactNode`},description:``},eyebrow:{required:!1,tsType:{name:`string`},description:``},meta:{required:!1,tsType:{name:`ReactNode`},description:``},onBack:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},title:{required:!0,tsType:{name:`string`},description:``},titleContent:{required:!1,tsType:{name:`ReactNode`},description:``}}}})),f,p,m,h,g,_,v,y,b,x,S;e((()=>{d(),r(),f=n(),p={title:`Patterns/DetailHeader`,component:l,parameters:{layout:`fullscreen`}},m={paddingTop:`calc(var(--spacing-md) + var(--spacing-xs) * 2 + 40px + var(--spacing-md))`,paddingLeft:`var(--spacing-xl)`,paddingRight:`var(--spacing-xl)`,paddingBottom:`var(--spacing-lg)`,minHeight:`200px`},h={name:`Back and title`,render:()=>(0,f.jsx)(`div`,{style:m,children:(0,f.jsx)(l,{title:`Day 1`,onBack:()=>{}})})},g={name:`With eyebrow`,render:()=>(0,f.jsx)(`div`,{style:m,children:(0,f.jsx)(l,{eyebrow:`Beach Maycation`,title:`Day 1`,onBack:()=>{}})})},_={name:`With trailing action`,render:()=>(0,f.jsx)(`div`,{style:m,children:(0,f.jsx)(l,{title:`Day 1`,onBack:()=>{},action:(0,f.jsx)(i,{icon:`add`,label:`Add item`,variant:`primary`,onClick:()=>{}})})})},v={name:`With settings action`,render:()=>(0,f.jsx)(`div`,{style:m,children:(0,f.jsx)(l,{title:`Beach Maycation`,onBack:()=>{},action:(0,f.jsx)(i,{icon:`settings`,label:`Trip settings`,onClick:()=>{}})})})},y={name:`All slots`,render:()=>(0,f.jsx)(`div`,{style:m,children:(0,f.jsx)(l,{eyebrow:`Beach Maycation`,title:`Day 1`,meta:(0,f.jsx)(`span`,{className:`muted`,children:`Sunday, Jun 7`}),onBack:()=>{},action:(0,f.jsx)(i,{icon:`add`,label:`Add item`,variant:`primary`,onClick:()=>{}})})})},b={name:`titleContent override`,render:()=>(0,f.jsx)(`div`,{style:m,children:(0,f.jsx)(l,{title:`Ignored when titleContent is set`,eyebrow:`Also ignored`,onBack:()=>{},action:(0,f.jsx)(i,{icon:`settings`,label:`Trip settings`,onClick:()=>{}}),titleContent:(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:4,padding:`14px 0 2px`},children:[(0,f.jsx)(`span`,{style:{fontSize:11,fontWeight:700,color:`var(--color-text-muted)`,letterSpacing:`0.18em`,textTransform:`uppercase`},children:`Beach Maycation`}),(0,f.jsx)(`span`,{style:{fontSize:`clamp(1.6rem, 5vw, 2.2rem)`,fontWeight:900,color:`var(--color-text-primary)`,lineHeight:1.05},children:`Custom header block`}),(0,f.jsx)(`span`,{className:`muted`,style:{fontSize:13},children:`titleContent replaces ScreenHeader entirely — title/eyebrow/meta props are not rendered`})]})})})},x={name:`Multiple trailing actions`,render:()=>(0,f.jsx)(`div`,{style:m,children:(0,f.jsx)(l,{eyebrow:`Beach Maycation`,title:`Day 1`,meta:(0,f.jsx)(`span`,{className:`muted`,children:`Sunday, Jun 7`}),onBack:()=>{},action:(0,f.jsxs)(`div`,{style:{display:`flex`,gap:4},children:[(0,f.jsx)(i,{icon:`edit`,label:`Edit day`,onClick:()=>{}}),(0,f.jsx)(i,{icon:`add`,label:`Add item`,variant:`primary`,onClick:()=>{}})]})})})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Back and title',
  render: () => <div style={shellStyle}>
      <DetailHeader title="Day 1" onBack={() => {}} />
    </div>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'With eyebrow',
  render: () => <div style={shellStyle}>
      <DetailHeader eyebrow="Beach Maycation" title="Day 1" onBack={() => {}} />
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'With trailing action',
  render: () => <div style={shellStyle}>
      <DetailHeader title="Day 1" onBack={() => {}} action={<IconButton icon="add" label="Add item" variant="primary" onClick={() => {}} />} />
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'With settings action',
  render: () => <div style={shellStyle}>
      <DetailHeader title="Beach Maycation" onBack={() => {}} action={<IconButton icon="settings" label="Trip settings" onClick={() => {}} />} />
    </div>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'All slots',
  render: () => <div style={shellStyle}>
      <DetailHeader eyebrow="Beach Maycation" title="Day 1" meta={<span className="muted">Sunday, Jun 7</span>} onBack={() => {}} action={<IconButton icon="add" label="Add item" variant="primary" onClick={() => {}} />} />
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'titleContent override',
  render: () => <div style={shellStyle}>
      <DetailHeader title="Ignored when titleContent is set" eyebrow="Also ignored" onBack={() => {}} action={<IconButton icon="settings" label="Trip settings" onClick={() => {}} />} titleContent={<div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      padding: '14px 0 2px'
    }}>
            <span style={{
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--color-text-muted)',
        letterSpacing: '0.18em',
        textTransform: 'uppercase'
      }}>
              Beach Maycation
            </span>
            <span style={{
        fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
        fontWeight: 900,
        color: 'var(--color-text-primary)',
        lineHeight: 1.05
      }}>
              Custom header block
            </span>
            <span className="muted" style={{
        fontSize: 13
      }}>
              titleContent replaces ScreenHeader entirely — title/eyebrow/meta props are not rendered
            </span>
          </div>} />
    </div>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Multiple trailing actions',
  render: () => <div style={shellStyle}>
      <DetailHeader eyebrow="Beach Maycation" title="Day 1" meta={<span className="muted">Sunday, Jun 7</span>} onBack={() => {}} action={<div style={{
      display: 'flex',
      gap: 4
    }}>
            <IconButton icon="edit" label="Edit day" onClick={() => {}} />
            <IconButton icon="add" label="Add item" variant="primary" onClick={() => {}} />
          </div>} />
    </div>
}`,...x.parameters?.docs?.source}}},S=[`Default`,`WithEyebrow`,`WithAction`,`WithSettings`,`Full`,`WithTitleContent`,`WithMultipleActions`]}))();export{h as Default,y as Full,_ as WithAction,g as WithEyebrow,x as WithMultipleActions,v as WithSettings,b as WithTitleContent,S as __namedExportsOrder,p as default};