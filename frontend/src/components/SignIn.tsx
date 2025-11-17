import React, { useState } from "react";

export default function SignIn({ onSign }: { onSign: (user:{name:string,email?:string})=>void }){
  const [email, setEmail] = useState("");
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:520,maxWidth:'100%',borderRadius:12,background:'var(--card)',padding:24,boxShadow:'0 6px 20px rgba(15,23,42,0.04)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
          <div style={{width:38,height:38,borderRadius:8,background:'#fff4ed',display:'flex',alignItems:'center',justifyContent:'center'}}>✓</div>
          <div>
            <div style={{fontWeight:700}}>Welcome to TaskWise</div>
            <div style={{color:'var(--muted)',fontSize:13}}>Sign in to access your dashboard.</div>
          </div>
        </div>

        <div style={{marginTop:14,display:'grid',gap:10}}>
          <button
            onClick={() => { /* placeholder: replace with real SSO */ onSign({name:'SSO User', email: ''}) }}
            style={{padding:12,borderRadius:8,background:'var(--accent)',color:'#fff',border:'none',fontWeight:600}}
          >
            Sign in with SSO
          </button>

          <div style={{textAlign:'center',color:'var(--muted)',fontSize:13}}>or sign in with email</div>

          <input
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{padding:10,borderRadius:8,border:'1px solid var(--border)'}}
          />

          <button onClick={() => onSign({name: email || 'Guest', email})}
                  style={{padding:10,borderRadius:8,border:'1px solid var(--border)',background:'white'}}>
            Sign in
          </button>

          <div style={{fontSize:12,color:'var(--muted)',textAlign:'center'}}>SSO will be wired later — call your auth endpoint and then call <code>onSign</code>.</div>
        </div>
      </div>
    </div>
  );
}
