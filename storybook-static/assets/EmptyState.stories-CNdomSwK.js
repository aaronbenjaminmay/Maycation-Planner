import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./iframe-DRe1FD2j.js";import{t as n}from"./jsx-runtime-CaZkqeYb.js";import{n as r,t as i}from"./Button-Bf5yJuE4.js";import{n as a,t as o}from"./CardSurface-DKdvzPIk.js";function s({action:e,children:t,title:n}){return(0,c.jsxs)(o,{className:`empty-state`,children:[(0,c.jsx)(`h2`,{children:n}),t?(0,c.jsx)(`div`,{className:`empty-state__body`,children:t}):null,e]})}var c,l=e((()=>{t(),a(),c=n(),s.__docgenInfo={description:``,methods:[],displayName:`EmptyState`,props:{action:{required:!1,tsType:{name:`ReactNode`},description:``},children:{required:!1,tsType:{name:`ReactNode`},description:``},title:{required:!0,tsType:{name:`string`},description:``}}}})),u,d,f,p,m,h,g;e((()=>{l(),r(),u=n(),d={title:`Components/Feedback/EmptyState`,component:s,parameters:{layout:`centered`}},f={name:`Title only`,render:()=>(0,u.jsx)(`div`,{style:{width:320},children:(0,u.jsx)(s,{title:`No trips yet`})})},p={name:`With body text`,render:()=>(0,u.jsx)(`div`,{style:{width:320},children:(0,u.jsx)(s,{title:`No items for this day`,children:(0,u.jsx)(`p`,{children:`Add reservations, activities, and notes to build your day plan.`})})})},m={name:`With action`,render:()=>(0,u.jsx)(`div`,{style:{width:320},children:(0,u.jsx)(s,{title:`No trips yet`,action:(0,u.jsx)(i,{variant:`primary`,children:`Create your first trip`})})})},h={name:`With body and action`,render:()=>(0,u.jsx)(`div`,{style:{width:320},children:(0,u.jsx)(s,{title:`No items for this day`,action:(0,u.jsx)(i,{variant:`primary`,children:`Add an item`}),children:(0,u.jsx)(`p`,{children:`Reservations, activities, travel, and notes all go here.`})})})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Title only',
  render: () => <div style={{
    width: 320
  }}>
      <EmptyState title="No trips yet" />
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'With body text',
  render: () => <div style={{
    width: 320
  }}>
      <EmptyState title="No items for this day">
        <p>Add reservations, activities, and notes to build your day plan.</p>
      </EmptyState>
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'With action',
  render: () => <div style={{
    width: 320
  }}>
      <EmptyState title="No trips yet" action={<Button variant="primary">Create your first trip</Button>} />
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'With body and action',
  render: () => <div style={{
    width: 320
  }}>
      <EmptyState title="No items for this day" action={<Button variant="primary">Add an item</Button>}>
        <p>Reservations, activities, travel, and notes all go here.</p>
      </EmptyState>
    </div>
}`,...h.parameters?.docs?.source}}},g=[`Default`,`WithBody`,`WithAction`,`Full`]}))();export{f as Default,h as Full,m as WithAction,p as WithBody,g as __namedExportsOrder,d as default};