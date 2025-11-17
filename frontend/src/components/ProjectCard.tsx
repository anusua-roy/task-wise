import React from "react";

export default function ProjectCard({title, subtitle, progress}:{title:string, subtitle?:string, progress?:number}){
  return (
    <div className="card" role="article" aria-label={title}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <h3 style={{margin:0,fontSize:15}}>{title}</h3>
          <div style={{color:'var(--muted)',fontSize:13,marginTop:8}}>{subtitle}</div>
        </div>
        <div style={{textAlign:'right',fontSize:13,color:'var(--muted)'}}>{progress ?? 0}%</div>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
        <div style={{fontSize:12,color:'var(--muted)'}}>1 of {Math.max(1, Math.round((progress ?? 0)/33))} tasks</div>
      </div>

      <div className="progress" style={{marginTop:12}}>
        <i style={{width: `${progress ?? 10}%`}} />
      </div>
    </div>
  );
}
