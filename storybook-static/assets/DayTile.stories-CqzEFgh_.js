import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";import{n,t as r}from"./CardSurface-Bmo3oyjo.js";import{n as i,t as a}from"./ProgressPill-6LBjG0lJ.js";import{n as o,t as s}from"./Icon-BG3Qn0gJ.js";function c({completedCount:e,date:t,dayNumber:n,iconName:i=`calendar`,itemCount:o,onOpen:c,subtitle:u,title:d}){return(0,l.jsx)(r,{as:`button`,className:`day-tile`,onClick:c,children:(0,l.jsxs)(`div`,{className:`day-tile__content`,children:[(0,l.jsx)(`span`,{className:`day-tile__icon`,"aria-hidden":`true`,children:(0,l.jsx)(s,{name:i,size:`large`})}),(0,l.jsxs)(`div`,{className:`day-tile__header`,children:[(0,l.jsxs)(`div`,{className:`day-tile__text`,children:[(0,l.jsx)(`h2`,{children:d}),t?(0,l.jsx)(`p`,{className:`muted day-tile__summary`,children:t}):u?(0,l.jsx)(`p`,{className:`muted day-tile__summary`,children:u}):null,t?(0,l.jsxs)(`span`,{className:`day-tile__day-label`,children:[`Day `,n]}):null]}),o>0?(0,l.jsx)(`div`,{className:`day-tile__stats`,children:(0,l.jsxs)(a,{tone:e===o&&o>0?`complete`:`default`,children:[e,` / `,o]})}):null]})]})})}var l,u=e((()=>{n(),o(),i(),l=t(),c.__docgenInfo={description:``,methods:[],displayName:`DayTile`,props:{completedCount:{required:!0,tsType:{name:`number`},description:``},date:{required:!1,tsType:{name:`string`},description:``},dayNumber:{required:!0,tsType:{name:`number`},description:``},iconName:{required:!1,tsType:{name:`union`,raw:`| 'add'
| 'back'
| 'bed'
| 'calendar'
| 'check'
| 'chevron-right'
| 'close'
| 'compass'
| 'delete'
| 'edit'
| 'image'
| 'plane'
| 'refresh'
| 'settings'
| 'sign-out'
| 'star'
| 'ticket'
| 'tree-palm'
| 'user-plus'
| 'utensils'
| 'x-circle'`,elements:[{name:`literal`,value:`'add'`},{name:`literal`,value:`'back'`},{name:`literal`,value:`'bed'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'check'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'compass'`},{name:`literal`,value:`'delete'`},{name:`literal`,value:`'edit'`},{name:`literal`,value:`'image'`},{name:`literal`,value:`'plane'`},{name:`literal`,value:`'refresh'`},{name:`literal`,value:`'settings'`},{name:`literal`,value:`'sign-out'`},{name:`literal`,value:`'star'`},{name:`literal`,value:`'ticket'`},{name:`literal`,value:`'tree-palm'`},{name:`literal`,value:`'user-plus'`},{name:`literal`,value:`'utensils'`},{name:`literal`,value:`'x-circle'`}]},description:``,defaultValue:{value:`'calendar'`,computed:!1}},itemCount:{required:!0,tsType:{name:`number`},description:``},onOpen:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},subtitle:{required:!1,tsType:{name:`string`},description:``},title:{required:!0,tsType:{name:`string`},description:``}}}})),d,f,p,m,h,g,_,v;e((()=>{u(),d=t(),f={title:`Patterns/DayTile`,component:c,parameters:{layout:`centered`}},p={name:`With date`,render:()=>(0,d.jsx)(`div`,{style:{width:340},children:(0,d.jsx)(c,{completedCount:2,date:`Mon, Jun 9`,dayNumber:1,iconName:`plane`,itemCount:5,onOpen:()=>{},title:`Travel Day`})})},m={name:`With subtitle`,render:()=>(0,d.jsx)(`div`,{style:{width:340},children:(0,d.jsx)(c,{completedCount:1,dayNumber:4,iconName:`calendar`,itemCount:3,onOpen:()=>{},subtitle:`Disney Springs · 7:00 PM`,title:`Reservations`})})},h={name:`No progress (itemCount = 0)`,render:()=>(0,d.jsx)(`div`,{style:{width:340},children:(0,d.jsx)(c,{completedCount:0,date:`Wed, Jun 11`,dayNumber:3,iconName:`compass`,itemCount:0,onOpen:()=>{},title:`Explore Day`})})},g={name:`Complete`,render:()=>(0,d.jsx)(`div`,{style:{width:340},children:(0,d.jsx)(c,{completedCount:4,date:`Tue, Jun 10`,dayNumber:2,iconName:`ticket`,itemCount:4,onOpen:()=>{},title:`Activity Day`})})},_={name:`Icon gallery`,render:()=>(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12,width:340},children:[(0,d.jsx)(c,{completedCount:0,date:`Mon, Jun 9`,dayNumber:1,iconName:`calendar`,itemCount:3,onOpen:()=>{},title:`Calendar`}),(0,d.jsx)(c,{completedCount:0,date:`Tue, Jun 10`,dayNumber:2,iconName:`plane`,itemCount:3,onOpen:()=>{},title:`Plane`}),(0,d.jsx)(c,{completedCount:0,date:`Wed, Jun 11`,dayNumber:3,iconName:`compass`,itemCount:3,onOpen:()=>{},title:`Compass`}),(0,d.jsx)(c,{completedCount:0,date:`Thu, Jun 12`,dayNumber:4,iconName:`tree-palm`,itemCount:3,onOpen:()=>{},title:`Tree Palm`}),(0,d.jsx)(c,{completedCount:0,date:`Fri, Jun 13`,dayNumber:5,iconName:`star`,itemCount:3,onOpen:()=>{},title:`Star`}),(0,d.jsx)(c,{completedCount:0,date:`Sat, Jun 14`,dayNumber:6,iconName:`ticket`,itemCount:3,onOpen:()=>{},title:`Ticket`})]})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'With date',
  render: () => <div style={{
    width: 340
  }}>
      <DayTile completedCount={2} date="Mon, Jun 9" dayNumber={1} iconName="plane" itemCount={5} onOpen={() => {}} title="Travel Day" />
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'With subtitle',
  render: () => <div style={{
    width: 340
  }}>
      <DayTile completedCount={1} dayNumber={4} iconName="calendar" itemCount={3} onOpen={() => {}} subtitle="Disney Springs · 7:00 PM" title="Reservations" />
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'No progress (itemCount = 0)',
  render: () => <div style={{
    width: 340
  }}>
      <DayTile completedCount={0} date="Wed, Jun 11" dayNumber={3} iconName="compass" itemCount={0} onOpen={() => {}} title="Explore Day" />
    </div>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Complete',
  render: () => <div style={{
    width: 340
  }}>
      <DayTile completedCount={4} date="Tue, Jun 10" dayNumber={2} iconName="ticket" itemCount={4} onOpen={() => {}} title="Activity Day" />
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Icon gallery',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: 340
  }}>
      <DayTile completedCount={0} date="Mon, Jun 9" dayNumber={1} iconName="calendar" itemCount={3} onOpen={() => {}} title="Calendar" />
      <DayTile completedCount={0} date="Tue, Jun 10" dayNumber={2} iconName="plane" itemCount={3} onOpen={() => {}} title="Plane" />
      <DayTile completedCount={0} date="Wed, Jun 11" dayNumber={3} iconName="compass" itemCount={3} onOpen={() => {}} title="Compass" />
      <DayTile completedCount={0} date="Thu, Jun 12" dayNumber={4} iconName="tree-palm" itemCount={3} onOpen={() => {}} title="Tree Palm" />
      <DayTile completedCount={0} date="Fri, Jun 13" dayNumber={5} iconName="star" itemCount={3} onOpen={() => {}} title="Star" />
      <DayTile completedCount={0} date="Sat, Jun 14" dayNumber={6} iconName="ticket" itemCount={3} onOpen={() => {}} title="Ticket" />
    </div>
}`,..._.parameters?.docs?.source}}},v=[`WithDate`,`WithSubtitle`,`NoProgress`,`Complete`,`Gallery`]}))();export{g as Complete,_ as Gallery,h as NoProgress,p as WithDate,m as WithSubtitle,v as __namedExportsOrder,f as default};