import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./iframe-y-qt8ZDi.js";import{t as n}from"./jsx-runtime-CaZkqeYb.js";import{n as r,t as i}from"./Button-3rDWthW8.js";import{n as a,t as o}from"./CardSurface-Bmo3oyjo.js";var s=e((()=>{}));function c({action:e,children:t,title:n}){return(0,l.jsxs)(o,{className:`empty-state`,children:[(0,l.jsx)(`h2`,{children:n}),t?(0,l.jsx)(`div`,{className:`empty-state__body`,children:t}):null,e]})}var l,u=e((()=>{t(),a(),s(),l=n(),c.__docgenInfo={description:``,methods:[],displayName:`EmptyState`,props:{action:{required:!1,tsType:{name:`ReactNode`},description:``},children:{required:!1,tsType:{name:`ReactNode`},description:``},title:{required:!0,tsType:{name:`string`},description:``}}}})),d,f,p,m,h,g,_;e((()=>{u(),r(),d=n(),f={title:`Components/Feedback/EmptyState`,component:c,parameters:{layout:`centered`}},p={name:`Title only`,render:()=>(0,d.jsx)(`div`,{style:{width:320},children:(0,d.jsx)(c,{title:`No trips yet`})})},m={name:`With body text`,render:()=>(0,d.jsx)(`div`,{style:{width:320},children:(0,d.jsx)(c,{title:`No items for this day`,children:(0,d.jsx)(`p`,{children:`Add reservations, activities, and notes to build your day plan.`})})})},h={name:`With action`,render:()=>(0,d.jsx)(`div`,{style:{width:320},children:(0,d.jsx)(c,{title:`No trips yet`,action:(0,d.jsx)(i,{variant:`primary`,children:`Create your first trip`})})})},g={name:`With body and action`,render:()=>(0,d.jsx)(`div`,{style:{width:320},children:(0,d.jsx)(c,{title:`No items for this day`,action:(0,d.jsx)(i,{variant:`primary`,children:`Add an item`}),children:(0,d.jsx)(`p`,{children:`Reservations, activities, travel, and notes all go here.`})})})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Title only',
  render: () => <div style={{
    width: 320
  }}>
      <EmptyState title="No trips yet" />
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'With body text',
  render: () => <div style={{
    width: 320
  }}>
      <EmptyState title="No items for this day">
        <p>Add reservations, activities, and notes to build your day plan.</p>
      </EmptyState>
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'With action',
  render: () => <div style={{
    width: 320
  }}>
      <EmptyState title="No trips yet" action={<Button variant="primary">Create your first trip</Button>} />
    </div>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'With body and action',
  render: () => <div style={{
    width: 320
  }}>
      <EmptyState title="No items for this day" action={<Button variant="primary">Add an item</Button>}>
        <p>Reservations, activities, travel, and notes all go here.</p>
      </EmptyState>
    </div>
}`,...g.parameters?.docs?.source}}},_=[`Default`,`WithBody`,`WithAction`,`Full`]}))();export{p as Default,g as Full,h as WithAction,m as WithBody,_ as __namedExportsOrder,f as default};