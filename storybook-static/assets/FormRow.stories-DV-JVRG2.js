import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";import{n,t as r}from"./FormRow-drM7uJ5G.js";var i,a,o,s,c,l,u,d;e((()=>{n(),i=t(),a={title:`Components/Forms/FormRow`,component:r,parameters:{layout:`centered`}},o=e=>(0,i.jsx)(`div`,{style:{width:320},children:e}),s={name:`Default`,render:()=>o((0,i.jsx)(r,{label:`Trip Name`,children:(0,i.jsx)(`input`,{className:`form-control`,type:`text`,defaultValue:`Beach Maycation`})}))},c={name:`With hint`,render:()=>o((0,i.jsx)(r,{label:`Destination`,hint:`Enter city and state or country`,children:(0,i.jsx)(`input`,{className:`form-control`,type:`text`,defaultValue:`Orange Beach, AL`})}))},l={name:`With select`,render:()=>o((0,i.jsx)(r,{label:`Timezone`,children:(0,i.jsxs)(`select`,{className:`form-control`,defaultValue:`America/New_York`,children:[(0,i.jsx)(`option`,{value:`America/New_York`,children:`Eastern Time (ET)`}),(0,i.jsx)(`option`,{value:`America/Chicago`,children:`Central Time (CT)`}),(0,i.jsx)(`option`,{value:`America/Los_Angeles`,children:`Pacific Time (PT)`})]})}))},u={name:`With textarea`,render:()=>o((0,i.jsx)(r,{label:`Notes`,hint:`Optional. Visible to all trip members.`,children:(0,i.jsx)(`textarea`,{className:`form-control form-control--textarea`,defaultValue:``,placeholder:`Add any notes…`})}))},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Default',
  render: () => wrap(<FormRow label="Trip Name">
        <input className="form-control" type="text" defaultValue="Beach Maycation" />
      </FormRow>)
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'With hint',
  render: () => wrap(<FormRow label="Destination" hint="Enter city and state or country">
        <input className="form-control" type="text" defaultValue="Orange Beach, AL" />
      </FormRow>)
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'With select',
  render: () => wrap(<FormRow label="Timezone">
        <select className="form-control" defaultValue="America/New_York">
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
        </select>
      </FormRow>)
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'With textarea',
  render: () => wrap(<FormRow label="Notes" hint="Optional. Visible to all trip members.">
        <textarea className="form-control form-control--textarea" defaultValue="" placeholder="Add any notes…" />
      </FormRow>)
}`,...u.parameters?.docs?.source}}},d=[`Default`,`WithHint`,`WithSelect`,`WithTextArea`]}))();export{s as Default,c as WithHint,l as WithSelect,u as WithTextArea,d as __namedExportsOrder,a as default};