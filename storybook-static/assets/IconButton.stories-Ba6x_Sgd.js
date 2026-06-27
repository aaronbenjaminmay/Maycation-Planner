import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";import{n,t as r}from"./IconButton-BQ2aLIs5.js";var i,a,o,s,c,l,u,d,f,p;e((()=>{n(),i=t(),a={title:`Components/Actions/IconButton`,component:r,parameters:{layout:`centered`},argTypes:{variant:{control:`select`,options:[`default`,`primary`,`destructive`,`complete`]},selected:{control:`boolean`},disabled:{control:`boolean`}}},o={args:{icon:`settings`,label:`Settings`,variant:`default`}},s={args:{icon:`add`,label:`Add item`,variant:`primary`}},c={args:{icon:`delete`,label:`Delete`,variant:`destructive`}},l={name:`Complete (unchecked)`,args:{icon:`check`,label:`Mark complete`,variant:`complete`,selected:!1}},u={name:`Complete (checked)`,args:{icon:`check`,label:`Completed`,variant:`complete`,selected:!0}},d={args:{icon:`settings`,label:`Settings`,disabled:!0}},f={name:`All Variants`,render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:16,alignItems:`center`,flexWrap:`wrap`},children:[(0,i.jsx)(r,{icon:`settings`,label:`Default`,variant:`default`}),(0,i.jsx)(r,{icon:`add`,label:`Primary`,variant:`primary`}),(0,i.jsx)(r,{icon:`delete`,label:`Destructive`,variant:`destructive`}),(0,i.jsx)(r,{icon:`check`,label:`Complete`,variant:`complete`}),(0,i.jsx)(r,{icon:`check`,label:`Complete selected`,variant:`complete`,selected:!0}),(0,i.jsx)(r,{icon:`settings`,label:`Disabled`,disabled:!0})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    icon: 'settings',
    label: 'Settings',
    variant: 'default'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    icon: 'add',
    label: 'Add item',
    variant: 'primary'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    icon: 'delete',
    label: 'Delete',
    variant: 'destructive'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Complete (unchecked)',
  args: {
    icon: 'check',
    label: 'Mark complete',
    variant: 'complete',
    selected: false
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Complete (checked)',
  args: {
    icon: 'check',
    label: 'Completed',
    variant: 'complete',
    selected: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    icon: 'settings',
    label: 'Settings',
    disabled: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'All Variants',
  render: () => <div style={{
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap'
  }}>
      <IconButton icon="settings" label="Default" variant="default" />
      <IconButton icon="add" label="Primary" variant="primary" />
      <IconButton icon="delete" label="Destructive" variant="destructive" />
      <IconButton icon="check" label="Complete" variant="complete" />
      <IconButton icon="check" label="Complete selected" variant="complete" selected />
      <IconButton icon="settings" label="Disabled" disabled />
    </div>
}`,...f.parameters?.docs?.source}}},p=[`Default`,`Primary`,`Destructive`,`Complete`,`CompleteSelected`,`Disabled`,`AllVariants`]}))();export{f as AllVariants,l as Complete,u as CompleteSelected,o as Default,c as Destructive,d as Disabled,s as Primary,p as __namedExportsOrder,a as default};