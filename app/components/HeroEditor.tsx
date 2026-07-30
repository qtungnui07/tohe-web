'use client';

import { useMemo, Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Center } from '@react-three/drei';
import * as THREE from 'three';
import Link from 'next/link';

type LayerId = 'bg' | 'textBack' | 'model' | 'textFront' | 'tagline';

interface Config {
  rotX: number; rotY: number; rotZ: number;
  posX: number; posY: number;
  modelScale: number;              // size multiplier (1 = default)
  camZ: number; camFov: number;
  textLeft: number; textTop: number;
  fontSize: number; letterSpacing: number; lineHeight: number;
  glowR1: number; glowO1: number;
  glowR2: number; glowO2: number;
  glowR3: number; glowO3: number;
  strokeW: number; strokeO: number;
  tagTop: number; tagRight: number; tagSize: number;
}

const DEFAULTS: Config = {
  rotX: -0.092, rotY: -1.372, rotZ: -0.212,
  posX: 0, posY: 0, modelScale: 1.0,
  camZ: 4.1, camFov: 30,
  textLeft: 50, textTop: 46,
  fontSize: 20.5, letterSpacing: -0.07, lineHeight: 0.8,
  glowR1: 13, glowO1: 0.75, glowR2: 30, glowO2: 0.45, glowR3: 60, glowO3: 0.20,
  strokeW: 1.5, strokeO: 0.9,
  tagTop: 25, tagRight: 15, tagSize: 1.5,
};

const LAYERS: { id: LayerId; icon: string; label: string; desc: string }[] = [
  { id: 'textFront', icon: '◻', label: 'Text Front',  desc: 'Outline, z=3' },
  { id: 'model',     icon: '◈', label: 'Model 3D',    desc: 'Dragon, z=2' },
  { id: 'textBack',  icon: '◼', label: 'Text Back',   desc: 'Glow, z=1'   },
  { id: 'tagline',   icon: 'T', label: 'Tagline',     desc: 'Subtitle, z=4' },
  { id: 'bg',        icon: '▪', label: 'Background',  desc: '#080808'     },
];

/* ── 3D model: position + rotation both reactive via THREE group props ── */
function EditableModel({ rx, ry, rz, px, py, ms }: { rx:number; ry:number; rz:number; px:number; py:number; ms:number }) {
  const { scene } = useGLTF('/base_basic_pbr.glb');
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene.clone());
    const s   = box.getSize(new THREE.Vector3());
    const m   = Math.max(s.x, s.y, s.z);
    return m === 0 ? 1 : 2.0 / m;
  }, [scene]);
  return (
    <group position={[px, py, 0]}>
      <Center>
        <group scale={scale * ms} rotation={[rx, ry, rz]}>
          <primitive object={scene} />
        </group>
      </Center>
    </group>
  );
}

/* ── Slider ── */
function Slider({ label, value, min, max, step = 0.01, onChange, unit = '' }:
  { label:string; value:number; min:number; max:number; step?:number; onChange:(v:number)=>void; unit?:string }) {
  return (
    <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:10, letterSpacing:'0.08em', color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>{label}</span>
        <span style={{ fontSize:11, fontFamily:'monospace', color:'rgba(255,255,255,0.85)' }}>{value.toFixed(3)}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width:'100%', accentColor:'#f5a623', cursor:'pointer', height:3 }} />
    </label>
  );
}

function Section({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
      <div style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase',
                    color:'#f5a623', borderBottom:'1px solid rgba(245,166,35,0.2)', paddingBottom:5 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function HeroEditor() {
  const [cfg, setCfg]             = useState<Config>(DEFAULTS);
  const [activeLayer, setActive]  = useState<LayerId | null>(null);
  const [copied, setCopied]       = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  /* Always-current refs so native callbacks don't go stale */
  const cfgRef    = useRef(cfg);
  useEffect(() => { cfgRef.current = cfg; }, [cfg]);

  const activeRef = useRef(activeLayer);
  useEffect(() => { activeRef.current = activeLayer; }, [activeLayer]);

  /* Drag state - all native, no React synthetic */
  const drag = useRef<{ layer:LayerId; x0:number; y0:number; c0:Config } | null>(null);

  const set = (key: keyof Config) => (v: number) =>
    setCfg(prev => ({ ...prev, [key]: v }));

  /* ── Native drag install (window level – bypasses R3F stopPropagation) ── */
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x0;
      const dy = e.clientY - d.y0;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (d.layer === 'model') {
        /* Convert pixel delta → 3-D units (approx fov+distance based) */
        const scale = (2 * d.c0.camZ * Math.tan((d.c0.camFov * Math.PI / 180) / 2)) / vw;
        setCfg(prev => ({ ...prev, posX: d.c0.posX + dx * scale, posY: d.c0.posY - dy * scale }));
      } else if (d.layer === 'textBack' || d.layer === 'textFront') {
        setCfg(prev => ({
          ...prev,
          textLeft: Math.max(0, Math.min(100, d.c0.textLeft + (dx / vw) * 100)),
          textTop:  Math.max(0, Math.min(100, d.c0.textTop  + (dy / vh) * 100)),
        }));
      } else if (d.layer === 'tagline') {
        setCfg(prev => ({
          ...prev,
          tagTop:   Math.max(0, Math.min(95, d.c0.tagTop   + (dy / vh) * 100)),
          tagRight: Math.max(0, Math.min(95, d.c0.tagRight - (dx / vw) * 100)),
        }));
      }
    };
    const onUp = () => { drag.current = null; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);
    };
  }, []); // mount once; reads refs, never stale

  /* Start drag from any element */
  const startDrag = (e: React.PointerEvent, layer: LayerId) => {
    if (layer === 'bg') return;
    e.preventDefault();
    setActive(layer);
    drag.current = { layer, x0: e.clientX, y0: e.clientY, c0: { ...cfgRef.current } };
  };

  /* Also intercept native pointerdown on Canvas area via ref */
  const modelOverlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = modelOverlayRef.current;
    if (!el) return;
    const down = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setActive('model');
      drag.current = { layer: 'model', x0: e.clientX, y0: e.clientY, c0: { ...cfgRef.current } };
    };
    el.addEventListener('pointerdown', down, { capture: true });
    return () => el.removeEventListener('pointerdown', down, { capture: true });
  }, [activeLayer]); // re-bind when overlay mounts/unmounts

  /* Scroll wheel → scale model when overlay active */
  useEffect(() => {
    const el = modelOverlayRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCfg(prev => ({
        ...prev,
        modelScale: Math.max(0.1, Math.min(5, prev.modelScale - e.deltaY * 0.001)),
      }));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeLayer]);

  /* Copy */
  const handleCopy = () => {
    const c = cfg;
    const code =
`// ModelViewer.tsx
rotation={[${c.rotX.toFixed(4)}, ${c.rotY.toFixed(4)}, ${c.rotZ.toFixed(4)}]}
// group: position=[${c.posX.toFixed(3)}, ${c.posY.toFixed(3)}, 0], scale multiplier=${c.modelScale.toFixed(3)}
camera={{ position: [0, -0.1, ${c.camZ.toFixed(2)}], fov: ${c.camFov} }}

// HeroScene.tsx TITLE_BASE
fontSize: 'clamp(80px, ${c.fontSize.toFixed(1)}vw, 340px)',
top: '${c.textTop.toFixed(1)}%', left: '${c.textLeft.toFixed(1)}%',
letterSpacing: '${c.letterSpacing.toFixed(3)}em', lineHeight: ${c.lineHeight.toFixed(2)},

// Glow
textShadow: '0 0 ${c.glowR1}px rgba(255,255,255,${c.glowO1}), 0 0 ${c.glowR2}px rgba(255,255,255,${c.glowO2}), 0 0 ${c.glowR3}px rgba(255,255,255,${c.glowO3})',
WebkitTextStroke: '${c.strokeW.toFixed(1)}px rgba(255,255,255,${c.strokeO.toFixed(2)})',

// Tagline
top: '${c.tagTop.toFixed(1)}%', right: '${c.tagRight.toFixed(1)}%', fontSize: '${c.tagSize.toFixed(1)}vw',`;
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  /* Shared text style */
  const titleBase: React.CSSProperties = {
    position:'absolute', left:`${cfg.textLeft}%`, top:`${cfg.textTop}%`,
    transform:'translate(-50%,-50%)', width:'max-content', whiteSpace:'nowrap',
    fontFamily:'"BTDanta",sans-serif', fontSize:`${cfg.fontSize}vw`, fontWeight:900,
    lineHeight:cfg.lineHeight, letterSpacing:`${cfg.letterSpacing}em`, userSelect:'none',
  };
  const glow = `0 0 ${cfg.glowR1}px rgba(255,255,255,${cfg.glowO1}), 0 0 ${cfg.glowR2}px rgba(255,255,255,${cfg.glowO2}), 0 0 ${cfg.glowR3}px rgba(255,255,255,${cfg.glowO3})`;

  const sel = (id: LayerId) => activeLayer === id
    ? '1.5px dashed rgba(245,166,35,0.8)' : '1.5px dashed transparent';

  /* Controls */
  function Controls() {
    if (!activeLayer || activeLayer === 'bg')
      return <div style={{ color:'rgba(255,255,255,0.3)', fontSize:11, textAlign:'center', padding:'28px 0' }}>Select a layer<br/>then drag in canvas</div>;
    if (activeLayer === 'model') return (
      <>
        <Section title="Position — drag canvas to move">
          <Slider label="Pos X" value={cfg.posX} min={-3} max={3} step={0.01} onChange={set('posX')} />
          <Slider label="Pos Y" value={cfg.posY} min={-3} max={3} step={0.01} onChange={set('posY')} />
        </Section>
        <Section title="Scale — scroll wheel or slider">
          <Slider label="Scale" value={cfg.modelScale} min={0.1} max={5} step={0.05} onChange={set('modelScale')} />
        </Section>
        <Section title="Rotation — sliders only">
          <Slider label="Rotate X" value={cfg.rotX} min={-Math.PI} max={Math.PI} onChange={set('rotX')} />
          <Slider label="Rotate Y" value={cfg.rotY} min={-Math.PI} max={Math.PI} onChange={set('rotY')} />
          <Slider label="Rotate Z" value={cfg.rotZ} min={-Math.PI} max={Math.PI} onChange={set('rotZ')} />
        </Section>
        <Section title="Camera">
          <Slider label="Distance Z" value={cfg.camZ}   min={2} max={12} step={0.1} onChange={set('camZ')} />
          <Slider label="FOV"        value={cfg.camFov} min={10} max={90} step={1}  onChange={set('camFov')} unit="°" />
        </Section>
      </>
    );
    if (activeLayer === 'textBack' || activeLayer === 'textFront') return (
      <>
        <Section title="Position — drag text to move">
          <Slider label="Left" value={cfg.textLeft} min={0} max={100} step={0.5} onChange={set('textLeft')} unit="%" />
          <Slider label="Top"  value={cfg.textTop}  min={10} max={90} step={0.5} onChange={set('textTop')}  unit="%" />
        </Section>
        <Section title="Typography">
          <Slider label="Font size"    value={cfg.fontSize}     min={8}    max={40}   step={0.5}  onChange={set('fontSize')}     unit="vw" />
          <Slider label="Line height"  value={cfg.lineHeight}   min={0.5}  max={1.5}  step={0.01} onChange={set('lineHeight')} />
          <Slider label="Letter space" value={cfg.letterSpacing} min={-0.15} max={0.1} step={0.005} onChange={set('letterSpacing')} unit="em" />
        </Section>
        {activeLayer === 'textBack' && (
          <Section title="Glow">
            <Slider label="R1 size" value={cfg.glowR1} min={0} max={80}  step={1}   onChange={set('glowR1')} unit="px" />
            <Slider label="R1 α"    value={cfg.glowO1} min={0} max={1}   step={0.01} onChange={set('glowO1')} />
            <Slider label="R2 size" value={cfg.glowR2} min={0} max={120} step={1}   onChange={set('glowR2')} unit="px" />
            <Slider label="R2 α"    value={cfg.glowO2} min={0} max={1}   step={0.01} onChange={set('glowO2')} />
            <Slider label="R3 size" value={cfg.glowR3} min={0} max={200} step={2}   onChange={set('glowR3')} unit="px" />
            <Slider label="R3 α"    value={cfg.glowO3} min={0} max={1}   step={0.01} onChange={set('glowO3')} />
          </Section>
        )}
        {activeLayer === 'textFront' && (
          <Section title="Outline">
            <Slider label="Stroke width"   value={cfg.strokeW} min={0.5} max={5} step={0.1}  onChange={set('strokeW')} unit="px" />
            <Slider label="Stroke opacity" value={cfg.strokeO} min={0}   max={1} step={0.01} onChange={set('strokeO')} />
          </Section>
        )}
      </>
    );
    if (activeLayer === 'tagline') return (
      <Section title="Tagline — drag to move">
        <Slider label="Top"       value={cfg.tagTop}   min={5}  max={90} step={1}   onChange={set('tagTop')}   unit="%" />
        <Slider label="Right"     value={cfg.tagRight} min={1}  max={60} step={1}   onChange={set('tagRight')} unit="%" />
        <Slider label="Font size" value={cfg.tagSize}  min={0.5} max={5} step={0.1} onChange={set('tagSize')}  unit="vw" />
      </Section>
    );
    return null;
  }

  return (
    <div style={{ width:'100vw', height:'100dvh', background:'#080808', position:'relative',
                  overflow:'hidden', fontFamily:'system-ui,sans-serif', touchAction:'none' }}>

      {/* LAYER 1 — back glow */}
      <div onPointerDown={e => startDrag(e, 'textBack')}
        style={{ ...titleBase, zIndex:1, color:'#fff', textShadow:glow,
                 cursor:'grab', pointerEvents:'auto', outline:sel('textBack'), outlineOffset:'8px' }}>
        TÒ HE
      </div>

      {/* LAYER 2 — model */}
      <div style={{ position:'absolute', inset:0, zIndex:2 }}>
        <Canvas camera={{ position:[0, -0.1, cfg.camZ], fov:cfg.camFov }}
          gl={{ antialias:true, alpha:true }}
          style={{ width:'100%', height:'100%', background:'transparent' }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3,5,4]} intensity={2.0} />
          <directionalLight position={[-3,2,-2]} intensity={0.6} color="#ffe0b2" />
          <pointLight position={[0,3,2]} intensity={0.7} color="#fff3e0" />
          <Suspense fallback={null}>
            <EditableModel rx={cfg.rotX} ry={cfg.rotY} rz={cfg.rotZ} px={cfg.posX} py={cfg.posY} ms={cfg.modelScale} />
            <Environment preset="city" />
            <ContactShadows position={[0,-1.1,0]} opacity={0.3} scale={8} blur={2.5} far={3} />
          </Suspense>
        </Canvas>
        {/* Native drag overlay — sits above canvas, ref used for capture-phase pointerdown */}
        {activeLayer === 'model' && (
          <div ref={modelOverlayRef}
            style={{ position:'absolute', inset:0, zIndex:10, cursor:'grab',
                     outline:'1.5px dashed rgba(245,166,35,0.5)', outlineOffset:'-4px',
                     background:'transparent' }} />
        )}
      </div>

      {/* LAYER 3 — front outline */}
      <div onPointerDown={e => startDrag(e, 'textFront')}
        style={{ ...titleBase, zIndex:3, color:'transparent',
                 WebkitTextFillColor:'transparent',
                 WebkitTextStroke:`${cfg.strokeW}px rgba(255,255,255,${cfg.strokeO})`,
                 textShadow:'none', cursor:'grab', pointerEvents:'auto',
                 outline:sel('textFront'), outlineOffset:'8px' }}>
        TÒ HE
      </div>

      {/* LAYER 4 — tagline */}
      <p onPointerDown={e => startDrag(e, 'tagline')}
        style={{ position:'absolute', zIndex:4, top:`${cfg.tagTop}%`, right:`${cfg.tagRight}%`,
                 margin:0, fontFamily:'"BTDanta",sans-serif', fontSize:`${cfg.tagSize}vw`,
                 fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase',
                 color:'rgba(255,255,255,0.85)', whiteSpace:'nowrap', cursor:'grab',
                 userSelect:'none', outline:sel('tagline'), outlineOffset:'6px' }}>
        Đôi tay nặn hồn Việt
      </p>

      {/* Panel toggle */}
      <button onClick={() => setPanelOpen(o => !o)}
        style={{ position:'fixed', top:16, right:panelOpen?316:16, zIndex:9999,
                 background:'rgba(15,15,15,0.9)', border:'1px solid rgba(245,166,35,0.3)',
                 borderRadius:8, color:'#f5a623', padding:'7px 12px', fontSize:12,
                 cursor:'pointer', backdropFilter:'blur(12px)', transition:'right 0.25s ease' }}>
        {panelOpen ? '→' : '⚙ Edit'}
      </button>

      {/* Panel */}
      <div style={{ position:'fixed', top:0, right:panelOpen?0:-310, width:300, height:'100dvh',
                    zIndex:9998, background:'rgba(9,9,9,0.97)', backdropFilter:'blur(20px)',
                    borderLeft:'1px solid rgba(255,255,255,0.07)', display:'flex',
                    flexDirection:'column', transition:'right 0.25s cubic-bezier(0.4,0,0.2,1)' }}>

        {/* Header */}
        <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid rgba(255,255,255,0.07)',
                      display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#f5f0e8' }}>Hero Editor</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:2 }}>
              <Link href="/" style={{ color:'#f5a623', textDecoration:'none' }}>← Back</Link>
              {' · '}select layer → drag canvas
            </div>
          </div>
          <button onClick={() => setCfg(DEFAULTS)}
            style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)',
                     borderRadius:6, color:'rgba(255,255,255,0.4)', fontSize:10,
                     padding:'4px 9px', cursor:'pointer' }}>
            RESET
          </button>
        </div>

        {/* Layer list */}
        <div style={{ padding:'10px 20px 8px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
          <div style={{ fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase',
                        color:'rgba(255,255,255,0.3)', marginBottom:6 }}>
            Layers
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {LAYERS.map(layer => {
              const active = activeLayer === layer.id;
              return (
                <button key={layer.id}
                  onClick={() => setActive(active ? null : layer.id)}
                  style={{ display:'flex', alignItems:'center', gap:10, textAlign:'left',
                           background:active?'rgba(245,166,35,0.10)':'transparent',
                           border:`1px solid ${active?'rgba(245,166,35,0.35)':'transparent'}`,
                           borderRadius:7, padding:'6px 10px', cursor:'pointer',
                           transition:'all 0.15s ease' }}>
                  <span style={{ fontSize:14, color:active?'#f5a623':'rgba(255,255,255,0.35)', width:16, textAlign:'center' }}>
                    {layer.icon}
                  </span>
                  <span style={{ flex:1 }}>
                    <span style={{ fontSize:12, color:active?'#f5f0e8':'rgba(255,255,255,0.6)', display:'block' }}>
                      {layer.label}
                    </span>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>{layer.desc}</span>
                  </span>
                  {active && <span style={{ fontSize:9, background:'rgba(245,166,35,0.2)', color:'#f5a623',
                                            borderRadius:4, padding:'2px 5px' }}>ACTIVE</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px 20px 16px', display:'flex', flexDirection:'column', gap:22 }}>
          <Controls />
        </div>

        {/* Copy footer */}
        <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          <button onClick={handleCopy}
            style={{ width:'100%',
                     background:copied?'rgba(80,200,120,0.12)':'rgba(245,166,35,0.10)',
                     border:`1px solid ${copied?'rgba(80,200,120,0.4)':'rgba(245,166,35,0.3)'}`,
                     borderRadius:8, color:copied?'#7fe0a0':'#f5a623', fontSize:11,
                     fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase',
                     padding:'10px', cursor:'pointer', transition:'all 0.2s ease' }}>
            {copied ? '✓ Copied!' : '⎘  Copy config as code'}
          </button>
        </div>
      </div>
    </div>
  );
}
