import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";import{n,t as r}from"./IconButton-BQ2aLIs5.js";function i({disabled:e=!1,isComplete:t,label:n,onToggle:i,readOnly:o=!1}){return(0,a.jsx)(r,{disabled:e||o,icon:`check`,label:t?`Mark ${n} active`:`Mark ${n} complete`,onClick:i,selected:t,variant:`complete`})}var a,o=e((()=>{n(),a=t(),i.__docgenInfo={description:``,methods:[],displayName:`StatusButton`,props:{disabled:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},isComplete:{required:!0,tsType:{name:`boolean`},description:``},label:{required:!0,tsType:{name:`string`},description:``},onToggle:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},readOnly:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}}}}})),s,c,l,u,d,f,p,m;e((()=>{o(),s=t(),c={title:`Components/Feedback/StatusButton`,component:i,parameters:{layout:`centered`},argTypes:{isComplete:{control:`boolean`},disabled:{control:`boolean`},readOnly:{control:`boolean`}}},l={name:`Incomplete`,render:()=>(0,s.jsx)(i,{label:`Dinner reservation`,isComplete:!1,onToggle:()=>{}})},u={name:`Complete`,render:()=>(0,s.jsx)(i,{label:`Dinner reservation`,isComplete:!0,onToggle:()=>{}})},d={name:`Read-only`,render:()=>(0,s.jsx)(i,{label:`Dinner reservation`,isComplete:!1,readOnly:!0})},f={name:`Disabled`,render:()=>(0,s.jsx)(i,{label:`Dinner reservation`,isComplete:!1,disabled:!0})},p={name:`Both states`,render:()=>(0,s.jsxs)(`div`,{style:{display:`flex`,gap:24,alignItems:`center`},children:[(0,s.jsx)(i,{label:`Item A`,isComplete:!1,onToggle:()=>{}}),(0,s.jsx)(i,{label:`Item B`,isComplete:!0,onToggle:()=>{}})]})},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Incomplete',
  render: () => <StatusButton label="Dinner reservation" isComplete={false} onToggle={() => {}} />
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Complete',
  render: () => <StatusButton label="Dinner reservation" isComplete={true} onToggle={() => {}} />
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Read-only',
  render: () => <StatusButton label="Dinner reservation" isComplete={false} readOnly />
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Disabled',
  render: () => <StatusButton label="Dinner reservation" isComplete={false} disabled />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Both states',
  render: () => <div style={{
    display: 'flex',
    gap: 24,
    alignItems: 'center'
  }}>
      <StatusButton label="Item A" isComplete={false} onToggle={() => {}} />
      <StatusButton label="Item B" isComplete={true} onToggle={() => {}} />
    </div>
}`,...p.parameters?.docs?.source}}},m=[`Incomplete`,`Complete`,`ReadOnly`,`Disabled`,`BothStates`]}))();export{p as BothStates,u as Complete,f as Disabled,l as Incomplete,d as ReadOnly,m as __namedExportsOrder,c as default};