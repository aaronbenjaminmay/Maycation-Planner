import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./iframe-y-qt8ZDi.js";import{n,t as r}from"./Badge-DT3itCw1.js";import{t as i}from"./jsx-runtime-CaZkqeYb.js";import{n as a,t as o}from"./CardSurface-Bmo3oyjo.js";import{n as s,t as c}from"./ProgressPill-6LBjG0lJ.js";function l({children:e,className:t=``,eyebrow:n,meta:r,onClick:i,subtitle:a,title:s}){let c=(0,u.jsxs)(u.Fragment,{children:[n?(0,u.jsx)(`span`,{className:`label`,children:n}):null,(0,u.jsx)(`strong`,{children:s}),a?(0,u.jsx)(`span`,{className:`muted`,children:a}):null,r?(0,u.jsx)(`div`,{className:`dashboard-card__meta`,children:r}):null,e]}),l=`dashboard-card${t?` ${t}`:``}`;return i?(0,u.jsx)(o,{as:`button`,className:l,onClick:i,children:c}):(0,u.jsx)(o,{className:l,children:c})}var u,d=e((()=>{t(),a(),u=i(),l.__docgenInfo={description:``,methods:[],displayName:`DashboardCard`,props:{children:{required:!1,tsType:{name:`ReactNode`},description:``},className:{required:!1,tsType:{name:`string`},description:``,defaultValue:{value:`''`,computed:!1}},eyebrow:{required:!1,tsType:{name:`string`},description:``},meta:{required:!1,tsType:{name:`ReactNode`},description:``},onClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},subtitle:{required:!1,tsType:{name:`string`},description:``},title:{required:!0,tsType:{name:`string`},description:``}}}})),f,p,m,h,g,_,v,y,b;e((()=>{d(),n(),s(),f=i(),p={title:`Patterns/DashboardCard`,component:l,parameters:{layout:`centered`}},m={name:`Default (static)`,render:()=>(0,f.jsx)(`div`,{style:{width:300},children:(0,f.jsx)(l,{title:`Beach Maycation`})})},h={name:`With subtitle`,render:()=>(0,f.jsx)(`div`,{style:{width:300},children:(0,f.jsx)(l,{title:`Beach Maycation`,subtitle:`Jun 7–12 · Orange Beach`})})},g={name:`With eyebrow`,render:()=>(0,f.jsx)(`div`,{style:{width:300},children:(0,f.jsx)(l,{eyebrow:`Upcoming`,title:`Beach Maycation`,subtitle:`Jun 7–12 · Orange Beach`})})},_={name:`Interactive (as button)`,render:()=>(0,f.jsx)(`div`,{style:{width:300},children:(0,f.jsx)(l,{title:`Beach Maycation`,subtitle:`Jun 7–12 · Orange Beach`,onClick:()=>{}})})},v={name:`With meta content`,render:()=>(0,f.jsx)(`div`,{style:{width:300},children:(0,f.jsx)(l,{eyebrow:`Trip`,title:`Beach Maycation`,subtitle:`Jun 7–12 · Orange Beach`,meta:(0,f.jsxs)(`div`,{style:{display:`flex`,gap:8,alignItems:`center`,marginTop:4},children:[(0,f.jsx)(c,{tone:`default`,children:`3 of 7`}),(0,f.jsx)(r,{tone:`accent`,children:`Active`})]}),onClick:()=>{}})})},y={name:`Card gallery`,render:()=>(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12,width:300},children:[(0,f.jsx)(l,{title:`Static card`}),(0,f.jsx)(l,{title:`With subtitle`,subtitle:`Jun 7–12 · Orange Beach`}),(0,f.jsx)(l,{eyebrow:`Upcoming`,title:`With eyebrow`,subtitle:`Jun 7–12`}),(0,f.jsx)(l,{title:`Interactive`,subtitle:`Tap to open`,onClick:()=>{}})]})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Default (static)',
  render: () => <div style={{
    width: 300
  }}>
      <DashboardCard title="Beach Maycation" />
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'With subtitle',
  render: () => <div style={{
    width: 300
  }}>
      <DashboardCard title="Beach Maycation" subtitle="Jun 7–12 · Orange Beach" />
    </div>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'With eyebrow',
  render: () => <div style={{
    width: 300
  }}>
      <DashboardCard eyebrow="Upcoming" title="Beach Maycation" subtitle="Jun 7–12 · Orange Beach" />
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Interactive (as button)',
  render: () => <div style={{
    width: 300
  }}>
      <DashboardCard title="Beach Maycation" subtitle="Jun 7–12 · Orange Beach" onClick={() => {}} />
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'With meta content',
  render: () => <div style={{
    width: 300
  }}>
      <DashboardCard eyebrow="Trip" title="Beach Maycation" subtitle="Jun 7–12 · Orange Beach" meta={<div style={{
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      marginTop: 4
    }}>
            <ProgressPill tone="default">3 of 7</ProgressPill>
            <Badge tone="accent">Active</Badge>
          </div>} onClick={() => {}} />
    </div>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Card gallery',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: 300
  }}>
      <DashboardCard title="Static card" />
      <DashboardCard title="With subtitle" subtitle="Jun 7–12 · Orange Beach" />
      <DashboardCard eyebrow="Upcoming" title="With eyebrow" subtitle="Jun 7–12" />
      <DashboardCard title="Interactive" subtitle="Tap to open" onClick={() => {}} />
    </div>
}`,...y.parameters?.docs?.source}}},b=[`Default`,`WithSubtitle`,`WithEyebrow`,`Interactive`,`WithMeta`,`AllVariants`]}))();export{y as AllVariants,m as Default,_ as Interactive,g as WithEyebrow,v as WithMeta,h as WithSubtitle,b as __namedExportsOrder,p as default};