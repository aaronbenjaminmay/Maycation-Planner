import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";import{n,t as r}from"./Button-Bf5yJuE4.js";var i,a,o,s,c,l,u,d;e((()=>{n(),i=t(),a={title:`Components/Actions/Button`,component:r,parameters:{layout:`centered`},argTypes:{variant:{control:`select`,options:[`primary`,`secondary`,`destructive`]},disabled:{control:`boolean`}}},o={args:{children:`Save trip`,variant:`primary`}},s={args:{children:`Cancel`,variant:`secondary`}},c={args:{children:`Delete trip`,variant:`destructive`}},l={args:{children:`Save trip`,variant:`primary`,disabled:!0}},u={name:`All Variants`,render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:12,alignItems:`center`},children:[(0,i.jsx)(r,{variant:`primary`,children:`Save trip`}),(0,i.jsx)(r,{variant:`secondary`,children:`Cancel`}),(0,i.jsx)(r,{variant:`destructive`,children:`Delete trip`}),(0,i.jsx)(r,{variant:`primary`,disabled:!0,children:`Disabled`})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Save trip',
    variant: 'primary'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Cancel',
    variant: 'secondary'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Delete trip',
    variant: 'destructive'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Save trip',
    variant: 'primary',
    disabled: true
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'All Variants',
  render: () => <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center'
  }}>
      <Button variant="primary">Save trip</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="destructive">Delete trip</Button>
      <Button variant="primary" disabled>Disabled</Button>
    </div>
}`,...u.parameters?.docs?.source}}},d=[`Primary`,`Secondary`,`Destructive`,`Disabled`,`AllVariants`]}))();export{u as AllVariants,c as Destructive,l as Disabled,o as Primary,s as Secondary,d as __namedExportsOrder,a as default};