import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";import{n,t as r}from"./FeedbackMessage-CQQM7GeJ.js";var i,a,o,s,c,l,u;e((()=>{n(),i=t(),a={title:`Components/Feedback/FeedbackMessage`,component:r,parameters:{layout:`centered`},argTypes:{tone:{control:`select`,options:[`neutral`,`error`,`success`]}}},o={args:{children:`Your changes have been saved.`,tone:`neutral`}},s={args:{children:`Unable to save trip. Please try again.`,tone:`error`}},c={args:{children:`Trip created successfully.`,tone:`success`}},l={name:`All Tones`,render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12,width:320},children:[(0,i.jsx)(r,{tone:`neutral`,children:`Your changes have been saved.`}),(0,i.jsx)(r,{tone:`error`,children:`Unable to save trip. Please try again.`}),(0,i.jsx)(r,{tone:`success`,children:`Trip created successfully.`})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Your changes have been saved.',
    tone: 'neutral'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Unable to save trip. Please try again.',
    tone: 'error'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Trip created successfully.',
    tone: 'success'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'All Tones',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: 320
  }}>
      <FeedbackMessage tone="neutral">Your changes have been saved.</FeedbackMessage>
      <FeedbackMessage tone="error">Unable to save trip. Please try again.</FeedbackMessage>
      <FeedbackMessage tone="success">Trip created successfully.</FeedbackMessage>
    </div>
}`,...l.parameters?.docs?.source}}},u=[`Neutral`,`Error`,`Success`,`AllTones`]}))();export{l as AllTones,s as Error,o as Neutral,c as Success,u as __namedExportsOrder,a as default};