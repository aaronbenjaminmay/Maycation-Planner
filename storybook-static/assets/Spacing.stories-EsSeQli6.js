import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-CaZkqeYb.js";var n,r,i,a,o,s,c;e((()=>{n=t(),r={title:`Foundation/Spacing & Radius`,parameters:{layout:`padded`}},i=[{token:`--spacing-2xs`,label:`2xs`,note:`4px · Tightest spacing`},{token:`--spacing-xs`,label:`xs`,note:`8px · Tag clusters, pill groups, screen-header gaps`},{token:`--spacing-sm`,label:`sm`,note:`12px · Form grid gap, list item gap`},{token:`--spacing-md`,label:`md`,note:`16px · Standard layout gap; modal header, detail header`},{token:`--spacing-lg`,label:`lg`,note:`18px · Dominant — card padding, page-shell gap, modal gap`},{token:`--spacing-xl`,label:`xl`,note:`24px · App-shell horizontal padding, panel padding`},{token:`--spacing-2xl`,label:`2xl`,note:`32px · Reserved for future large-spacing use`}],a=[{token:`--radius-sm`,label:`sm`,note:`8px · Small surface radius (account-strip)`},{token:`--radius-md`,label:`md`,note:`14px · Input fields and feedback messages`},{token:`--radius-lg`,label:`lg`,note:`20px · Dominant — all card and panel surfaces`},{token:`--radius-full`,label:`full`,note:`999px · Pills and circular elements`}],o={name:`Spacing Scale`,render:()=>(0,n.jsxs)(`div`,{style:{maxWidth:500},children:[(0,n.jsx)(`p`,{style:{margin:`0 0 20px`,fontSize:11,fontWeight:900,letterSpacing:`0.18em`,textTransform:`uppercase`,color:`#a1a1a6`},children:`Spacing tokens`}),i.map(({token:e,label:t,note:r})=>(0,n.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:16,marginBottom:12},children:[(0,n.jsx)(`div`,{style:{height:20,width:`var(${e})`,background:`var(--color-accent-default)`,borderRadius:3,flexShrink:0,minWidth:4}}),(0,n.jsxs)(`div`,{style:{flex:1},children:[(0,n.jsxs)(`code`,{style:{fontSize:12,color:`#f5f7fb`},children:[e,` `,(0,n.jsxs)(`span`,{style:{color:`#5a5a5e`},children:[`(`,t,`)`]})]}),(0,n.jsx)(`span`,{style:{fontSize:11,color:`#a1a1a6`,display:`block`},children:r})]})]},e))]})},s={name:`Radius Scale`,render:()=>(0,n.jsxs)(`div`,{style:{maxWidth:540},children:[(0,n.jsx)(`p`,{style:{margin:`0 0 20px`,fontSize:11,fontWeight:900,letterSpacing:`0.18em`,textTransform:`uppercase`,color:`#a1a1a6`},children:`Radius tokens`}),(0,n.jsx)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:24},children:a.map(({token:e,label:t,note:r})=>(0,n.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`flex-start`,gap:10,width:220},children:[(0,n.jsx)(`div`,{style:{width:80,height:80,background:`var(--color-surface-glass)`,border:`1px solid var(--color-border-glass)`,borderRadius:`var(${e})`}}),(0,n.jsxs)(`div`,{children:[(0,n.jsxs)(`code`,{style:{fontSize:12,color:`#f5f7fb`,display:`block`},children:[e,` `,(0,n.jsxs)(`span`,{style:{color:`#5a5a5e`},children:[`(`,t,`)`]})]}),(0,n.jsx)(`span`,{style:{fontSize:11,color:`#a1a1a6`},children:r})]})]},e))})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Spacing Scale',
  render: () => <div style={{
    maxWidth: 500
  }}>
      <p style={{
      margin: '0 0 20px',
      fontSize: 11,
      fontWeight: 900,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: '#a1a1a6'
    }}>
        Spacing tokens
      </p>
      {spacingTokens.map(({
      token,
      label,
      note
    }) => <div key={token} style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12
    }}>
          <div style={{
        height: 20,
        width: \`var(\${token})\`,
        background: 'var(--color-accent-default)',
        borderRadius: 3,
        flexShrink: 0,
        minWidth: 4
      }} />
          <div style={{
        flex: 1
      }}>
            <code style={{
          fontSize: 12,
          color: '#f5f7fb'
        }}>
              {token} <span style={{
            color: '#5a5a5e'
          }}>({label})</span>
            </code>
            <span style={{
          fontSize: 11,
          color: '#a1a1a6',
          display: 'block'
        }}>{note}</span>
          </div>
        </div>)}
    </div>
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Radius Scale',
  render: () => <div style={{
    maxWidth: 540
  }}>
      <p style={{
      margin: '0 0 20px',
      fontSize: 11,
      fontWeight: 900,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: '#a1a1a6'
    }}>
        Radius tokens
      </p>
      <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 24
    }}>
        {radiusTokens.map(({
        token,
        label,
        note
      }) => <div key={token} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 10,
        width: 220
      }}>
            <div style={{
          width: 80,
          height: 80,
          background: 'var(--color-surface-glass)',
          border: '1px solid var(--color-border-glass)',
          borderRadius: \`var(\${token})\`
        }} />
            <div>
              <code style={{
            fontSize: 12,
            color: '#f5f7fb',
            display: 'block'
          }}>
                {token} <span style={{
              color: '#5a5a5e'
            }}>({label})</span>
              </code>
              <span style={{
            fontSize: 11,
            color: '#a1a1a6'
          }}>{note}</span>
            </div>
          </div>)}
      </div>
    </div>
}`,...s.parameters?.docs?.source}}},c=[`SpacingScale`,`RadiusScale`]}))();export{s as RadiusScale,o as SpacingScale,c as __namedExportsOrder,r as default};