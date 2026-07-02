import{i as e,s as t}from"./preload-helper-xPQekRTU.js";import{t as n}from"./iframe-y-qt8ZDi.js";import{t as r}from"./jsx-runtime-CaZkqeYb.js";import{n as i,t as a}from"./Button-3rDWthW8.js";import{n as o,t as s}from"./IconButton-Cou2_2JI.js";var c=e((()=>{}));function l({ariaLabel:e,children:t,eyebrow:n,onClose:r,title:i}){return(0,u.useEffect)(()=>{function e(e){e.key===`Escape`&&r()}return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[r]),(0,d.jsx)(`div`,{className:`modal-backdrop`,role:`presentation`,children:(0,d.jsxs)(`section`,{className:`modal-sheet`,"aria-label":e,"aria-modal":`true`,role:`dialog`,children:[(0,d.jsxs)(`div`,{className:`modal-sheet__header`,children:[(0,d.jsxs)(`div`,{children:[n?(0,d.jsx)(`p`,{className:`eyebrow`,children:n}):null,(0,d.jsx)(`h2`,{children:i})]}),(0,d.jsx)(s,{icon:`close`,label:`Close`,onClick:r})]}),t]})})}var u,d,f=e((()=>{u=t(n(),1),o(),c(),d=r(),l.__docgenInfo={description:``,methods:[],displayName:`ModalSheet`,props:{ariaLabel:{required:!0,tsType:{name:`string`},description:``},children:{required:!0,tsType:{name:`ReactNode`},description:``},eyebrow:{required:!1,tsType:{name:`string`},description:``},onClose:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},title:{required:!0,tsType:{name:`string`},description:``}}}})),p,m,h,g,_,v;e((()=>{f(),i(),p=r(),m={title:`Components/ModalSheet`,component:l,parameters:{layout:`fullscreen`}},h={args:{title:`Edit Trip`,ariaLabel:`Edit trip details`,onClose:()=>{},children:(0,p.jsx)(`div`,{style:{padding:`0 24px 24px`},children:(0,p.jsx)(`p`,{className:`muted`,children:`Form fields would appear here.`})})}},g={name:`With eyebrow`,args:{title:`Edit Trip`,eyebrow:`Beach Maycation`,ariaLabel:`Edit trip details`,onClose:()=>{},children:(0,p.jsx)(`div`,{style:{padding:`0 24px 24px`},children:(0,p.jsx)(`p`,{className:`muted`,children:`The eyebrow appears above the title when provided.`})})}},_={name:`With form content`,args:{title:`Add Item`,ariaLabel:`Add planner item`,onClose:()=>{},children:(0,p.jsxs)(`div`,{style:{padding:`0 24px 24px`,display:`flex`,flexDirection:`column`,gap:16},children:[(0,p.jsx)(`p`,{className:`muted`,children:`This story shows the modal with realistic content dimensions.`}),(0,p.jsx)(`p`,{className:`muted`,children:`Close is triggered by pressing Escape or clicking the × button. In this story, close is a no-op.`}),(0,p.jsxs)(`div`,{style:{display:`flex`,gap:12,justifyContent:`flex-end`,paddingTop:8},children:[(0,p.jsx)(a,{variant:`secondary`,children:`Cancel`}),(0,p.jsx)(a,{variant:`primary`,children:`Save`})]})]})}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v=[`Default`,`WithEyebrow`,`WithContent`]}))();export{h as Default,_ as WithContent,g as WithEyebrow,v as __namedExportsOrder,m as default};