import{i as e}from"./preload-helper-xPQekRTU.js";import{n as t,t as n}from"./Badge-P2dDZLJW.js";import{t as r}from"./jsx-runtime-CaZkqeYb.js";import{n as i,t as a}from"./IconButton-tzcc_MYn.js";import{n as o,t as s}from"./ScreenHeader-Dnegf-qI.js";var c,l,u,d,f,p,m,h;e((()=>{o(),i(),t(),c=r(),l={title:`Components/Navigation/ScreenHeader`,component:s,parameters:{layout:`fullscreen`}},u={name:`Title only`,render:()=>(0,c.jsx)(s,{title:`My Trips`})},d={name:`With eyebrow`,render:()=>(0,c.jsx)(s,{eyebrow:`Beach Maycation`,title:`Day 1`})},f={name:`With meta`,render:()=>(0,c.jsx)(s,{title:`Beach Maycation`,meta:(0,c.jsx)(`span`,{className:`muted`,children:`Jun 7–12 · Orange Beach`})})},p={name:`With actions`,render:()=>(0,c.jsx)(s,{title:`My Trips`,actions:(0,c.jsx)(a,{icon:`add`,label:`New trip`,variant:`primary`})})},m={name:`All slots`,render:()=>(0,c.jsx)(s,{eyebrow:`Beach Maycation`,title:`Day 1`,meta:(0,c.jsxs)(`div`,{style:{display:`flex`,gap:8,alignItems:`center`},children:[(0,c.jsx)(`span`,{className:`muted`,children:`Sunday, Jun 7`}),(0,c.jsx)(n,{tone:`accent`,children:`3 items`})]}),actions:(0,c.jsx)(a,{icon:`settings`,label:`Trip settings`})})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Title only',
  render: () => <ScreenHeader title="My Trips" />
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'With eyebrow',
  render: () => <ScreenHeader eyebrow="Beach Maycation" title="Day 1" />
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'With meta',
  render: () => <ScreenHeader title="Beach Maycation" meta={<span className="muted">Jun 7–12 · Orange Beach</span>} />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'With actions',
  render: () => <ScreenHeader title="My Trips" actions={<IconButton icon="add" label="New trip" variant="primary" />} />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'All slots',
  render: () => <ScreenHeader eyebrow="Beach Maycation" title="Day 1" meta={<div style={{
    display: 'flex',
    gap: 8,
    alignItems: 'center'
  }}>
          <span className="muted">Sunday, Jun 7</span>
          <Badge tone="accent">3 items</Badge>
        </div>} actions={<IconButton icon="settings" label="Trip settings" />} />
}`,...m.parameters?.docs?.source}}},h=[`Default`,`WithEyebrow`,`WithMeta`,`WithActions`,`Full`]}))();export{u as Default,m as Full,p as WithActions,d as WithEyebrow,f as WithMeta,h as __namedExportsOrder,l as default};