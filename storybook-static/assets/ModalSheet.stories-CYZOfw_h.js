import{i as e,s as t}from"./preload-helper-xPQekRTU.js";import{t as n}from"./iframe-c5htpppT.js";import{t as r}from"./jsx-runtime-CaZkqeYb.js";import{n as i,t as a}from"./Button-D2TQfM8I.js";import{n as o,t as s}from"./IconButton-BQ2aLIs5.js";function c({ariaLabel:e,children:t,eyebrow:n,onClose:r,title:i}){return(0,l.useEffect)(()=>{function e(e){e.key===`Escape`&&r()}return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[r]),(0,u.jsx)(`div`,{className:`modal-backdrop`,role:`presentation`,children:(0,u.jsxs)(`section`,{className:`modal-sheet`,"aria-label":e,"aria-modal":`true`,role:`dialog`,children:[(0,u.jsxs)(`div`,{className:`modal-sheet__header`,children:[(0,u.jsxs)(`div`,{children:[n?(0,u.jsx)(`p`,{className:`eyebrow`,children:n}):null,(0,u.jsx)(`h2`,{children:i})]}),(0,u.jsx)(s,{icon:`close`,label:`Close`,onClick:r})]}),t]})})}var l,u,d=e((()=>{l=t(n(),1),o(),u=r(),c.__docgenInfo={description:``,methods:[],displayName:`ModalSheet`,props:{ariaLabel:{required:!0,tsType:{name:`string`},description:``},children:{required:!0,tsType:{name:`ReactNode`},description:``},eyebrow:{required:!1,tsType:{name:`string`},description:``},onClose:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},title:{required:!0,tsType:{name:`string`},description:``}}}})),f,p,m,h,g,_;e((()=>{d(),i(),f=r(),p={title:`Components/ModalSheet`,component:c,parameters:{layout:`fullscreen`}},m={args:{title:`Edit Trip`,ariaLabel:`Edit trip details`,onClose:()=>{},children:(0,f.jsx)(`div`,{style:{padding:`0 24px 24px`},children:(0,f.jsx)(`p`,{className:`muted`,children:`Form fields would appear here.`})})}},h={name:`With eyebrow`,args:{title:`Edit Trip`,eyebrow:`Beach Maycation`,ariaLabel:`Edit trip details`,onClose:()=>{},children:(0,f.jsx)(`div`,{style:{padding:`0 24px 24px`},children:(0,f.jsx)(`p`,{className:`muted`,children:`The eyebrow appears above the title when provided.`})})}},g={name:`With form content`,args:{title:`Add Item`,ariaLabel:`Add planner item`,onClose:()=>{},children:(0,f.jsxs)(`div`,{style:{padding:`0 24px 24px`,display:`flex`,flexDirection:`column`,gap:16},children:[(0,f.jsx)(`p`,{className:`muted`,children:`This story shows the modal with realistic content dimensions.`}),(0,f.jsx)(`p`,{className:`muted`,children:`Close is triggered by pressing Escape or clicking the × button. In this story, close is a no-op.`}),(0,f.jsxs)(`div`,{style:{display:`flex`,gap:12,justifyContent:`flex-end`,paddingTop:8},children:[(0,f.jsx)(a,{variant:`secondary`,children:`Cancel`}),(0,f.jsx)(a,{variant:`primary`,children:`Save`})]})]})}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Edit Trip',
    ariaLabel: 'Edit trip details',
    onClose: () => {},
    children: <div style={{
      padding: '0 24px 24px'
    }}>
        <p className="muted">Form fields would appear here.</p>
      </div>
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'With eyebrow',
  args: {
    title: 'Edit Trip',
    eyebrow: 'Beach Maycation',
    ariaLabel: 'Edit trip details',
    onClose: () => {},
    children: <div style={{
      padding: '0 24px 24px'
    }}>
        <p className="muted">The eyebrow appears above the title when provided.</p>
      </div>
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'With form content',
  args: {
    title: 'Add Item',
    ariaLabel: 'Add planner item',
    onClose: () => {},
    children: <div style={{
      padding: '0 24px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <p className="muted">This story shows the modal with realistic content dimensions.</p>
        <p className="muted">Close is triggered by pressing Escape or clicking the × button. In this story, close is a no-op.</p>
        <div style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'flex-end',
        paddingTop: 8
      }}>
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Save</Button>
        </div>
      </div>
  }
}`,...g.parameters?.docs?.source}}},_=[`Default`,`WithEyebrow`,`WithContent`]}))();export{m as Default,g as WithContent,h as WithEyebrow,_ as __namedExportsOrder,p as default};