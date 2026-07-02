import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./iframe-y-qt8ZDi.js";import{t as n}from"./jsx-runtime-CaZkqeYb.js";import{t as r}from"./forms-BcOhCm5W.js";import{n as i,t as a}from"./TextInput-C3ibuDTq.js";function o({children:e}){return(0,s.jsx)(`div`,{className:`form-grid`,children:e})}var s,c=e((()=>{t(),r(),s=n(),o.__docgenInfo={description:``,methods:[],displayName:`FormGrid`,props:{children:{required:!0,tsType:{name:`ReactNode`},description:``}}}})),l,u,d,f,p,m;e((()=>{c(),i(),l=n(),u={title:`Components/Forms/FormGrid`,component:o,parameters:{layout:`centered`}},d={name:`Two-column grid`,render:()=>(0,l.jsx)(`div`,{style:{width:560},children:(0,l.jsxs)(o,{children:[(0,l.jsx)(a,{label:`Start Date`,type:`date`,value:`2025-06-07`,onChange:()=>{}}),(0,l.jsx)(a,{label:`End Date`,type:`date`,value:`2025-06-12`,onChange:()=>{}})]})})},f={name:`Odd field count (last spans full)`,render:()=>(0,l.jsx)(`div`,{style:{width:560},children:(0,l.jsxs)(o,{children:[(0,l.jsx)(a,{label:`First Name`,value:`Aaron`,onChange:()=>{}}),(0,l.jsx)(a,{label:`Last Name`,value:`May`,onChange:()=>{}}),(0,l.jsx)(a,{label:`Email`,type:`email`,value:`user@example.com`,onChange:()=>{}})]})})},p={name:`Date range pattern`,render:()=>(0,l.jsx)(`div`,{style:{width:560},children:(0,l.jsxs)(o,{children:[(0,l.jsx)(a,{label:`Trip Starts`,type:`date`,value:`2025-06-07`,onChange:()=>{}}),(0,l.jsx)(a,{label:`Trip Ends`,type:`date`,value:`2025-06-12`,onChange:()=>{}})]})})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Two-column grid',
  render: () => <div style={{
    width: 560
  }}>
      <FormGrid>
        <TextInput label="Start Date" type="date" value="2025-06-07" onChange={() => {}} />
        <TextInput label="End Date" type="date" value="2025-06-12" onChange={() => {}} />
      </FormGrid>
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Odd field count (last spans full)',
  render: () => <div style={{
    width: 560
  }}>
      <FormGrid>
        <TextInput label="First Name" value="Aaron" onChange={() => {}} />
        <TextInput label="Last Name" value="May" onChange={() => {}} />
        <TextInput label="Email" type="email" value="user@example.com" onChange={() => {}} />
      </FormGrid>
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Date range pattern',
  render: () => <div style={{
    width: 560
  }}>
      <FormGrid>
        <TextInput label="Trip Starts" type="date" value="2025-06-07" onChange={() => {}} />
        <TextInput label="Trip Ends" type="date" value="2025-06-12" onChange={() => {}} />
      </FormGrid>
    </div>
}`,...p.parameters?.docs?.source}}},m=[`Default`,`ThreeFields`,`DateRange`]}))();export{p as DateRange,d as Default,f as ThreeFields,m as __namedExportsOrder,u as default};