import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";import{n,t as r}from"./TextInput-C3ibuDTq.js";var i,a,o,s,c,l,u,d,f,p,m;e((()=>{n(),i=t(),a={title:`Components/Forms/TextInput`,component:r,parameters:{layout:`centered`}},o=e=>(0,i.jsx)(`div`,{style:{width:320},children:e}),s={name:`Default`,render:()=>o((0,i.jsx)(r,{label:`Trip Name`,value:`Beach Maycation`,onChange:()=>{}}))},c={name:`With placeholder`,render:()=>o((0,i.jsx)(r,{label:`Trip Name`,value:``,onChange:()=>{},placeholder:`e.g. Beach Maycation`}))},l={name:`With hint`,render:()=>o((0,i.jsx)(r,{label:`Destination`,value:`Orange Beach, AL`,onChange:()=>{},hint:`Enter the city and state or country`}))},u={name:`Email type`,render:()=>o((0,i.jsx)(r,{label:`Email`,type:`email`,value:`user@example.com`,onChange:()=>{}}))},d={name:`Password type`,render:()=>o((0,i.jsx)(r,{label:`Password`,type:`password`,value:`secret`,onChange:()=>{}}))},f={name:`Disabled`,render:()=>o((0,i.jsx)(r,{label:`Trip Name`,value:`Beach Maycation`,onChange:()=>{},disabled:!0}))},p={name:`All variants`,render:()=>(0,i.jsxs)(`div`,{style:{width:320,display:`flex`,flexDirection:`column`,gap:16},children:[(0,i.jsx)(r,{label:`Default`,value:`Beach Maycation`,onChange:()=>{}}),(0,i.jsx)(r,{label:`With hint`,value:``,onChange:()=>{},placeholder:`e.g. Beach Maycation`,hint:`Choose a memorable name`}),(0,i.jsx)(r,{label:`Disabled`,value:`Beach Maycation`,onChange:()=>{},disabled:!0})]})},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Default',
  render: () => wrap(<TextInput label="Trip Name" value="Beach Maycation" onChange={() => {}} />)
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'With placeholder',
  render: () => wrap(<TextInput label="Trip Name" value="" onChange={() => {}} placeholder="e.g. Beach Maycation" />)
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'With hint',
  render: () => wrap(<TextInput label="Destination" value="Orange Beach, AL" onChange={() => {}} hint="Enter the city and state or country" />)
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Email type',
  render: () => wrap(<TextInput label="Email" type="email" value="user@example.com" onChange={() => {}} />)
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Password type',
  render: () => wrap(<TextInput label="Password" type="password" value="secret" onChange={() => {}} />)
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Disabled',
  render: () => wrap(<TextInput label="Trip Name" value="Beach Maycation" onChange={() => {}} disabled />)
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'All variants',
  render: () => <div style={{
    width: 320,
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  }}>
      <TextInput label="Default" value="Beach Maycation" onChange={() => {}} />
      <TextInput label="With hint" value="" onChange={() => {}} placeholder="e.g. Beach Maycation" hint="Choose a memorable name" />
      <TextInput label="Disabled" value="Beach Maycation" onChange={() => {}} disabled />
    </div>
}`,...p.parameters?.docs?.source}}},m=[`Default`,`WithPlaceholder`,`WithHint`,`Email`,`Password`,`Disabled`,`AllVariants`]}))();export{p as AllVariants,s as Default,f as Disabled,u as Email,d as Password,l as WithHint,c as WithPlaceholder,m as __namedExportsOrder,a as default};