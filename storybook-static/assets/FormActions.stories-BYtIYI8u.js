import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./iframe-DRe1FD2j.js";import{t as n}from"./jsx-runtime-CaZkqeYb.js";import{n as r,t as i}from"./Button-Bf5yJuE4.js";import{n as a,t as o}from"./IconButton-tzcc_MYn.js";import{t as s}from"./forms-Cdu6lfr5.js";function c({leading:e,children:t}){return e==null?(0,l.jsx)(`div`,{className:`form-actions`,children:t}):(0,l.jsxs)(`div`,{className:`form-actions form-actions--has-leading`,children:[(0,l.jsx)(`div`,{className:`form-actions__leading`,children:e}),(0,l.jsx)(`div`,{className:`form-actions__main`,children:t})]})}var l,u=e((()=>{t(),s(),l=n(),c.__docgenInfo={description:``,methods:[],displayName:`FormActions`,props:{leading:{required:!1,tsType:{name:`ReactNode`},description:``},children:{required:!0,tsType:{name:`ReactNode`},description:``}}}})),d,f,p,m,h,g,_;e((()=>{u(),r(),a(),d=n(),f={title:`Components/Forms/FormActions`,component:c,parameters:{layout:`centered`}},p={name:`Two buttons (Cancel / Save)`,render:()=>(0,d.jsx)(`div`,{style:{width:480},children:(0,d.jsxs)(c,{children:[(0,d.jsx)(i,{variant:`secondary`,children:`Cancel`}),(0,d.jsx)(i,{variant:`primary`,children:`Save Trip`})]})})},m={name:`With leading destructive action`,render:()=>(0,d.jsx)(`div`,{style:{width:480},children:(0,d.jsxs)(c,{leading:(0,d.jsx)(o,{icon:`delete`,label:`Delete trip`,variant:`destructive`}),children:[(0,d.jsx)(i,{variant:`secondary`,children:`Cancel`}),(0,d.jsx)(i,{variant:`primary`,children:`Save`})]})})},h={name:`Destructive confirm pattern`,render:()=>(0,d.jsx)(`div`,{style:{width:480},children:(0,d.jsxs)(c,{children:[(0,d.jsx)(i,{variant:`secondary`,children:`Cancel`}),(0,d.jsx)(i,{variant:`destructive`,children:`Delete Trip`})]})})},g={name:`Single action`,render:()=>(0,d.jsx)(`div`,{style:{width:480},children:(0,d.jsxs)(c,{children:[(0,d.jsx)(`div`,{}),(0,d.jsx)(i,{variant:`primary`,children:`Create Trip`})]})})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Two buttons (Cancel / Save)',
  render: () => <div style={{
    width: 480
  }}>
      <FormActions>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save Trip</Button>
      </FormActions>
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'With leading destructive action',
  render: () => <div style={{
    width: 480
  }}>
      <FormActions leading={<IconButton icon="delete" label="Delete trip" variant="destructive" />}>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </FormActions>
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Destructive confirm pattern',
  render: () => <div style={{
    width: 480
  }}>
      <FormActions>
        <Button variant="secondary">Cancel</Button>
        <Button variant="destructive">Delete Trip</Button>
      </FormActions>
    </div>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Single action',
  render: () => <div style={{
    width: 480
  }}>
      <FormActions>
        <div />
        <Button variant="primary">Create Trip</Button>
      </FormActions>
    </div>
}`,...g.parameters?.docs?.source}}},_=[`Default`,`WithLeadingAction`,`DestructiveConfirm`,`SingleAction`]}))();export{p as Default,h as DestructiveConfirm,g as SingleAction,m as WithLeadingAction,_ as __namedExportsOrder,f as default};