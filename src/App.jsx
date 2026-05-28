import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

// --- PASO 2.1: INVOCAR (IMPORTAR) LA IMAGEN LOCAL ---
import logoIpuc from './assets/images/logo_ipuc.png'; 

// --- BANCO DE DATOS LOCALES (AUTOMÁTICOS POR DÍA DEL MES) ---
const VERSICULOS = [
  { texto: "Dios es Espíritu; y los que le adoran, en espíritu y en verdad es necesario que adoren.", cita: "Juan 4:24" },
  { texto: "Alabadle con sonido de bocina; Alabadle con salterio y arpa. ¡Todo lo que respira alabe a Jehová!", cita: "Salmo 150:3, 6" },
  { texto: "Cantad alegres a Dios, habitantes de toda la tierra. Servid a Jehová con alegría; Venid ante su presencia con regocijo.", cita: "Salmo 100:1-2" },
  { texto: "Bueno es alabarte, oh Jehová, y cantar salmos a tu nombre, oh Altísimo; anunciar por la mañana tu misericordia, y tu fidelidad cada noche.", cita: "Salmo 92:1-2" },
  { texto: "Entrad por sus puertas con acción de gracias, por sus atrios con alabanza; Alabadle, bendecid su nombre.", cita: "Salmo 100:4" },
  { texto: "Grandes y maravillosas son tus obras, Señor Dios Todopoderoso; justos y verdaderos son tus caminos, Rey de los santos.", cita: "Apocalipsis 15:3" },
  { texto: "Jehová es mi fuerza y mi escudo; En él esperó mi corazón, y fui ayudado, por lo que se gozó mi corazón, y con mi cántico le alabaré.", cita: "Salmo 28:7" },
  { texto: "Puso luego en mi boca cántico nuevo, alabanza a nuestro Dios. Verán esto muchos, y temerán, y confiarán en Jehová.", cita: "Salmo 40:3" }
]

const EJERCICIOS_VOCAL = [
  { titulo: "Control de Apoyo Diafragmático", desc: "Inhala en 4 tiempos, retén el aire por 4 tiempos, y expúlsalo imitando el sonido de una serpiente (Sssss) de forma lineal y constante durante 20 segundos. No dejes que la intensidad caiga." },
  { titulo: "Resonancia y Vibración (Mmm)", desc: "Haz un sonido de 'M' con los labios suavemente juntos como si saborearas algo rico. Siente la vibración en tus labios y máscara facial. Sube y baja el tono suavemente (glissando) sin forzar la garganta." },
  { titulo: "Vocalización y Apertura Real", desc: "Practica cantando la escala 'Do-Re-Mi-Fa-Sol' usando la sílaba 'GIA'. La 'G' ayuda a activar el cierre de las cuerdas vocales y la 'IA' abre espacio interno en tu boca bajando la mandíbula." },
  { titulo: "Relajación y Brillo (Lip Trill)", desc: "Haz vibrar tus labios imitando el motor de un carro flojo (Prrr). Mantén el flujo de aire constante. Hazlo durante 15 segundos para masajear tus cuerdas vocales antes de comenzar a cantar." }
]

function App() {
  // --- CONTROL DE NAVEGACIÓN Y ROLES ---
  const [isAdmin, setIsAdmin] = useState(false) 
  const [mostrarLogin, setMostrarLogin] = useState(false) 
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  
  const [subSeccion, setSubSeccion] = useState('canciones') 
  const [categoriaActiva, setCategoriaActiva] = useState('Alabanza')
  const [busquedaGlobal, setBusquedaGlobal] = useState('')
  const [cantoSeleccionado, setCantoSeleccionado] = useState(null) 

  const [mostrarModalAgenda, setMostrarModalAgenda] = useState(false);
  const [agendaEditando, setAgendaEditando] = useState(null);

  

  // --- ESTADOS DE LA BASE DE DATOS ---
  const [canciones, setCanciones] = useState([])
  const [miembros, setMiembros] = useState([])
  const [agendas, setAgendas] = useState([]) 
  const [cargando, setCargando] = useState(false)
  const [busqueda, setBusqueda] = useState('');

  // --- ESTADOS DE EDICIÓN (ADMIN) ---
  const [mostrarModalCancion, setMostrarModalCancion] = useState(false)
  const [editandoCancionId, setEditandoCancionId] = useState(null)
  const [nuevaCancion, setNuevaCancion] = useState({ 
    titulo: '', autor: '', categoria: 'Alabanza', tono: '', letra: '', audio_url: '' 
  })

  const [mostrarModalMiembro, setMostrarModalMiembro] = useState(false)
  const [editandoMiembroId, setEditandoMiembroId] = useState(null)
  const [nuevoMiembro, setNuevoMiembro] = useState({ Nombres: '', Apellido: '' })
  const [rolesSeleccionados, setRolesSeleccionados] = useState([])

  const [programacion, setProgramacion] = useState({
    dia: 'Domingo', hora: '09:00 AM', tipoServicio: 'Dominical', 
    vozLider: '', apoyo1: '', apoyo2: '', apoyo3: '', baterista: '', pianista: '', otroInstrumento: ''
  })

  const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const TIPOS_SERVICIO = ['Dominical', 'Escuela Dominical', 'Alabanza', 'Jóvenes', 'Dorcas', 'Evangelismo', 'Refam', 'Obra Social', 'Junta Local', 'Otro Servicio']
  const HORAS_DISPONIBLES = [
  '07:00 AM', '07:15 AM', '07:30 AM', '07:45 AM', 
  '08:00 AM', '08:15 AM', '08:30 AM', '08:45 AM', 
  '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM', 
  '10:00 AM', 
  // ... puedes seguir agregando los de la tarde igual
  '04:00 PM', '04:15 PM', '04:30 PM', '04:45 PM', 
  '05:00 PM', '05:15 PM', '05:30 PM', '05:45 PM', 
  '06:00 PM', '06:15 PM', '06:30 PM', '06:45 PM', 
  '07:00 PM'
];
  const VOCES_LISTA = ['Soprano', 'Mezzosoprano', 'Contralto', 'Tenor', 'Barítono', 'Bajo']
  const INSTRUMENTOS_LISTA = ['Piano', 'Batería', 'Guitarra', 'Bajo Eléctrico', 'Saxofón']

  // --- LOGICA DIARIA ROTATIVA ---
  const fechaHoy = new Date()
  const indiceDia = fechaHoy.getDate() 
  const versiculoDelDia = VERSICULOS[indiceDia % VERSICULOS.length]
  const ejercicioDelDia = EJERCICIOS_VOCAL[indiceDia % EJERCICIOS_VOCAL.length]

  const IconoEditar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
  const IconoBasura = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const resCanciones = await supabase.from('canciones').select('*')
      const resMiembros = await supabase.from('Miembros').select('*')
      const resAgendas = await supabase.from('programacion').select('*')
      
      if (resCanciones.data) setCanciones(resCanciones.data)
      if (resMiembros.data) setMiembros(resMiembros.data)
      if (resAgendas.data) setAgendas(resAgendas.data)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const eliminarMiembro = async (id) => {
  if (window.confirm("¿Seguro que deseas eliminar este miembro?")) {
    await supabase.from('Miembros').delete().eq('id', id);
    cargarDatos(); // IMPORTANTE: Esto recarga la lista automáticamente
  }
};

  const obtenerBloquePorTono = (categoria) => {
    const filtradas = canciones.filter(c => c.categoria === categoria)
    if (filtradas.length === 0) return { tono: 'Ninguno', lista: [] }

    const frecuencias = {}
    filtradas.forEach(c => {
      if (c.tono) frecuencias[c.tono] = (frecuencias[c.tono] || 0) + 1
    })

    const tonosOrdenados = Object.keys(frecuencias).sort((a, b) => frecuencias[b] - frecuencias[a])

    for (let t of tonosOrdenados) {
      const delTono = filtradas.filter(c => c.tono === t)
      if (delTono.length >= 3) {
        return { tono: t, lista: delTono.slice(0, 3) }
      }
    }

    return { tono: filtradas[0]?.tono || 'Varios', lista: filtradas.slice(0, 3) }
  }

  const bloqueAlabanza = obtenerBloquePorTono('Alabanza')
  const bloqueAdoracion = obtenerBloquePorTono('Adoración')
  const bloqueNiños = obtenerBloquePorTono('Niños')

  const cancionesFiltradasYOrdenadas = canciones
    .filter(canto => {
      const matchCategoria = canto.categoria === categoriaActiva
      const query = busquedaGlobal.toLowerCase().trim()
      
      if (!query) return matchCategoria

      return (
        canto.titulo?.toLowerCase().includes(query) ||
        canto.autor?.toLowerCase().includes(query) ||
        canto.tono?.toLowerCase().includes(query) ||
        canto.letra?.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''))

  const ejecutarLogin = (e) => {
    e.preventDefault()
    if (username === 'ipuceltriunfo' && password === 'ipuceltriunfo@') {
      setIsAdmin(true)
      setMostrarLogin(false)
      setLoginError('')
    } else {
      setLoginError('Acceso denegado.')
    }
  }

  const guardarCancion = async (e) => {
    e.preventDefault()
    const cantoData = { ...nuevaCancion, titulo: nuevaCancion.titulo.trim(), autor: nuevaCancion.autor.trim(), tono: nuevaCancion.tono.trim() }
    if (editandoCancionId) {
      await supabase.from('canciones').update(cantoData).eq('id', editandoCancionId)
    } else {
      await supabase.from('canciones').insert([cantoData])
    }
    setMostrarModalCancion(false)
    cargarDatos()
  }

  const eliminarCancion = async (id) => {
    if (window.confirm('¿Eliminar canto?')) {
      await supabase.from('canciones').delete().eq('id', id)
      cargarDatos()
    }
  }

  const guardarMiembro = async (e) => {
    e.preventDefault()
    const miembroData = { Nombres: nuevoMiembro.Nombres.trim(), Apellido: nuevoMiembro.Apellido.trim(), Rango: rolesSeleccionados.join(', ') }
    if (editandoMiembroId) {
      await supabase.from('Miembros').update(miembroData).eq('id', editandoMiembroId)
    } else {
      await supabase.from('Miembros').insert([miembroData])
    }
    setMostrarModalMiembro(false)
    cargarDatos()
  }

  const guardarProgramacion = async (e) => {
    e.preventDefault()
    await supabase.from('programacion').insert([programacion])
    alert('¡Agenda publicada!')
    cargarDatos()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-16 relative overflow-x-hidden">
      
      {/* --- ENCABEZADO: FONDO AZUL REY (bg-blue-600), LOGO PROTEGIDO CON SUS COLORES Y TEXTO BLANCO --- */}
      <header className="bg-blue-600 border-b border-blue-700 sticky top-0 z-50 px-4 py-4.5 shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            {/* El logo circular preserva su diseño original nítido e independiente */}
            <img 
              src={logoIpuc} 
              alt="Icono IPUC Unánimes" 
              className="w-12 h-12 object-contain rounded-full bg-white p-0.5 shadow-sm" 
            />
            <div>
              {/* Título en color blanco impecable y sin subtítulo de administración debajo */}
              <h1 className="font-black text-xl text-white tracking-tight leading-none">Cancionero.IPUC El Triunfo</h1>
            </div>
          </div>

          {isAdmin ? (
            <button onClick={() => setIsAdmin(false)} className="text-xs font-bold bg-white/20 text-white hover:bg-white/30 px-3 py-2 rounded-xl transition-colors border border-white/20">Vista Pública</button>
          ) : (
            <button onClick={() => setMostrarLogin(true)} className="text-xs font-bold bg-white text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors shadow-sm">⚙️ Admin</button>
          )}
        </div>
      </header>

      {/* --- CAPA DE FONDO TRANSPARENTE: BIBLIA ABIERTA Y LLUVIA MUSICAL --- */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-0 flex flex-col justify-center items-center select-none pt-24">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-80 h-80 text-blue-900">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <div className="absolute w-full h-full flex justify-between px-10 text-blue-800 text-3xl font-serif">
          <span className="absolute top-1/4 left-10 animate-pulse">♫</span>
          <span className="absolute top-1/3 right-12">♪</span>
          <span className="absolute bottom-1/4 left-16">𝄢</span>
          <span className="absolute bottom-1/3 right-10 animate-pulse">∮</span>
          <span className="absolute top-1/2 left-4">♩</span>
          <span className="absolute top-2/3 left-14 text-2xl">a</span>
          <span className="absolute top-1/4 right-24 text-2xl">b</span>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-md mx-auto p-4 space-y-6 relative z-10">

        {!isAdmin && (
          <>
            {/* VERSÍCULO DIARIO */}
            <section className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm text-center space-y-1 bg-gradient-to-b from-blue-50/30 to-white">
              <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Versículo del Día</span>
              <p className="text-sm font-medium italic text-slate-700 leading-relaxed">"{versiculoDelDia?.texto}"</p>
              <p className="text-xs font-bold text-blue-600">{versiculoDelDia?.cita}</p>
            </section>

            {/* OMNI-BUSCADOR POTENTE */}
            <section className="space-y-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="🔍 Buscar por título, coro, letra, tono o autor..." 
                  value={busquedaGlobal}
                  onChange={(e) => setBusquedaGlobal(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              {/* TABS CATEGORÍAS */}
              <div className="flex gap-2 bg-slate-200/60 p-1 rounded-xl text-xs font-bold">
                {['Alabanza', 'Adoración', 'Niños'].map(cat => (
                  <button key={cat} onClick={() => setCategoriaActiva(cat)} className={`flex-1 py-2 rounded-lg text-center ${categoriaActiva === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{cat}</button>
                ))}
              </div>

              {/* REPERTORIO ALFABÉTICO */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider px-1">Cantos Disponibles ({categoriaActiva} - De la A a la Z)</p>
                {cancionesFiltradasYOrdenadas.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-4">No se encontraron cantos en esta sección.</p>
                ) : (
                  cancionesFiltradasYOrdenadas.map(canto => (
                    <div key={canto.id} onClick={() => setCantoSeleccionado(canto)} className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between items-center shadow-sm cursor-pointer hover:border-blue-300 transition-all">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{canto.titulo}</h4>
                        <p className="text-xs text-slate-400">Por: {canto.autor}</p>
                      </div>
                      {canto.tono && <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-mono font-black">{canto.tono}</span>}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* REPERTORIO DIARIO INDEPENDIENTE POR TONO */}
            <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">🎵 Repertorios Sugeridos de Hoy</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">3 canciones por categoría acopladas en su mismo tono armónico.</p>
              </div>
              
              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-black text-blue-700 uppercase text-[10px] tracking-wider">⚡ Bloque Alabanza</span>
                    <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded text-[10px]">Tono: {bloqueAlabanza.tono}</span>
                  </div>
                  <p className="text-slate-700 font-medium">
                    {bloqueAlabanza.lista.length > 0 ? bloqueAlabanza.lista.map(c => c.titulo).join('  •  ') : 'Registra más canciones de Alabanza.'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-black text-indigo-700 uppercase text-[10px] tracking-wider">🛐 Bloque Adoración</span>
                    <span className="bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded text-[10px]">Tono: {bloqueAdoracion.tono}</span>
                  </div>
                  <p className="text-slate-700 font-medium">
                    {bloqueAdoracion.lista.length > 0 ? bloqueAdoracion.lista.map(c => c.titulo).join('  •  ') : 'Registra más canciones de Adoración.'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-black text-emerald-700 uppercase text-[10px] tracking-wider">👶 Bloque Niños</span>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[10px]">Tono: {bloqueNiños.tono}</span>
                  </div>
                  <p className="text-slate-700 font-medium">
                    {bloqueNiños.lista.length > 0 ? bloqueNiños.lista.map(c => c.titulo).join('  •  ') : 'Registra más canciones de Niños.'}
                  </p>
                </div>
              </div>
            </section>

            {/* AGENDA SEMANAL */}
            <section className="space-y-3">
  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">📅 Agenda de Servicios Semanal</h3>
  {agendas.length === 0 ? (
    <p className="text-xs text-slate-400 text-center py-4 bg-white border border-dashed rounded-xl">No hay servicios programados en cartelera.</p>
  ) : (
    agendas.map(agenda => (
      <div key={agenda.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
        <div className="flex justify-between items-center border-b pb-1.5">
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{agenda.dia} - {agenda.hora}</span>
          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 rounded uppercase">{agenda.tipoServicio}</span>
        </div>
        <div className="text-xs space-y-0.5 text-slate-600">
          <p>🎤 <strong>Director:</strong> {agenda.vozLider || 'Por definir'}</p>
          
          {/* Solo mostramos la línea si al menos uno de los tres apoyos tiene valor */}
{(agenda.apoyo1 || agenda.apoyo2 || agenda.apoyo3) ? (
  <p>
    <strong>👥 Apoyos:</strong> {[agenda.apoyo1, agenda.apoyo2, agenda.apoyo3].filter(Boolean).join(' • ')}
  </p>
) : (
  <p className="text-slate-400 italic">👥 Sin apoyos asignados</p>
)}
          
          <p>🎹 <strong>Músicos:</strong> Piano: {agenda.pianista || '--'} | Batería: {agenda.baterista || '--'}</p>
          {agenda.otroInstrumento && <p>📌 <strong>Nota:</strong> {agenda.otroInstrumento}</p>}
        </div>
      </div>
    ))
  )}
</section> 

            {/* CUIDADO VOCAL */}
            <section className="bg-gradient-to-br from-indigo-900 to-slate-900 text-slate-100 rounded-2xl p-5 shadow-md space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🎙️</span>
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300">Cuidado Vocal Diario</h3>
              </div>
              <h4 className="text-sm font-bold text-white">{ejercicioDelDia?.titulo}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{ejercicioDelDia?.desc}</p>
            </section>
          </>
        )}

        {/* --- PANELS ADMINISTRADOR REAL --- */}
        {isAdmin && (
          <div className="space-y-4">
            <div className="flex gap-1 bg-blue-600 p-1 rounded-xl text-xs font-bold text-white shadow">
              <button onClick={() => setSubSeccion('canciones')} className={`flex-1 py-2 rounded-lg text-center ${subSeccion === 'canciones' ? 'bg-white text-blue-700 shadow-sm' : 'text-white/70'}`}>🎵 Cantos</button>
              <button onClick={() => setSubSeccion('programacion')} className={`flex-1 py-2 rounded-lg text-center ${subSeccion === 'programacion' ? 'bg-white text-blue-700 shadow-sm' : 'text-white/70'}`}>📅 Agenda</button>
              <button onClick={() => setSubSeccion('miembros')} className={`flex-1 py-2 rounded-lg text-center ${subSeccion === 'miembros' ? 'bg-white text-blue-700 shadow-sm' : 'text-white/70'}`}>👥 Miembros</button>
            </div>

            {subSeccion === 'canciones' && (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Panel de Canciones</h3>
      <button 
        onClick={() => { setEditandoCancionId(null); setNuevaCancion({ titulo: '', autor: '', categoria: 'Alabanza', tono: '', letra: '', audio_url: '' }); setMostrarModalCancion(true); }} 
        className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-xl shadow"
      >
        + Agregar
      </button>
    </div>

    {/* BUSCADOR POTENTE */}
    <input 
      type="text" 
      placeholder="🔍 Buscar por título, tono o categoría..."
      className="w-full p-2 text-xs border rounded-xl bg-white shadow-sm outline-none focus:border-blue-500"
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
    />

    <div className="space-y-2">
      {canciones
        .filter(c => 
          c.titulo?.toLowerCase().includes(busqueda.toLowerCase()) || 
          c.tono?.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.categoria?.toLowerCase().includes(busqueda.toLowerCase())
        )
        .map(c => (
          <div key={c.id} className="p-3 bg-white border rounded-xl flex justify-between items-center shadow-sm">
            <div>
              <h4 className="font-bold text-sm text-slate-800">{c.titulo} <span className="text-xs font-normal text-slate-400">({c.categoria})</span></h4>
              <p className="text-xs text-slate-400">Tono: {c.tono || '--'}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditandoCancionId(c.id); setNuevaCancion(c); setMostrarModalCancion(true); }} className="p-1.5 text-blue-600 bg-blue-50 border rounded-lg"><IconoEditar /></button>
              <button onClick={() => eliminarCancion(c.id)} className="p-1.5 text-red-600 bg-red-50 border rounded-lg"><IconoBasura /></button>
            </div>
          </div>
        ))
      }
    </div>
  </div>
)}

    {subSeccion === 'programacion' && (
  <div className="space-y-6">
    {/* FORMULARIO DE AGENDAMIENTO */}
    <form onSubmit={async (e) => {
      e.preventDefault();
      // VALIDACIONES OBLIGATORIAS
      if (!programacion.tipoServicio || !programacion.vozLider || !programacion.dia) {
        alert("¡Error! Debes completar al menos: Tipo de Servicio, Día y Voz Líder.");
        return;
      }
      
      if (programacion.id) {
        await supabase.from('programacion').update(programacion).eq('id', programacion.id);
        alert("Servicio actualizado con éxito");
      } else {
        await supabase.from('programacion').insert([programacion]);
        alert("Servicio publicado");
      }
      setProgramacion({ dia: 'Domingo', hora: '09:00 AM', tipoServicio: '', vozLider: '', apoyo1: '', apoyo2: '', apoyo3: '', baterista: '', pianista: '', invitado: '' });
      cargarDatos();
    }} className="bg-white p-4 rounded-xl shadow border border-slate-100 space-y-3 text-xs">
      
      <h2 className="text-sm font-bold border-b pb-2">{programacion.id ? "Modificar Servicio" : "Agendar Servicio"}</h2>
      
      <select required className="w-full p-2 border rounded-xl bg-slate-50" value={programacion.tipoServicio} onChange={e => setProgramacion({...programacion, tipoServicio: e.target.value})}>
        <option value="">Seleccionar Tipo de Servicio</option>
        {['Dominical', 'Escuela Dominical', 'Alabanza', 'Jóvenes', 'Dorcas', 'Evangelismo', 'Refam', 'Obra Social', 'Junta Local', 'Otro Servicio'].map(t => <option key={t}>{t}</option>)}
      </select>

      <div className="grid grid-cols-2 gap-2">
        <select className="p-2 border rounded-xl bg-slate-50" value={programacion.dia} onChange={e => setProgramacion({...programacion, dia: e.target.value})}>{DIAS_SEMANA.map(d => <option key={d}>{d}</option>)}</select>
        <select className="p-2 border rounded-xl bg-slate-50" value={programacion.hora} onChange={e => setProgramacion({...programacion, hora: e.target.value})}>{HORAS_DISPONIBLES.map(h => <option key={h}>{h}</option>)}</select>
      </div>

      <select 
  required 
  className="w-full p-2 border rounded-xl bg-slate-50" 
  value={programacion.vozLider} 
  onChange={e => setProgramacion({...programacion, vozLider: e.target.value})}
>
  <option value="">🎤 Seleccionar Voz Líder</option>
  {miembros
    .filter(m => {
      // Definimos la lista de registros vocales
      const registrosVocales = ['Soprano', 'Mezzosoprano', 'Contralto', 'Tenor', 'Barítono', 'Bajo'];
      // Solo permite miembros que tengan al menos uno de estos registros en su rango
      return registrosVocales.some(vocal => m.Rango?.includes(vocal));
    })
    .map(m => (
      <option key={m.id} value={`${m.Nombres} ${m.Apellido}`}>
        {m.Nombres} {m.Apellido}
      </option>
    ))
  }
</select>
      
  <div className="grid grid-cols-3 gap-2">
  {[1, 2, 3].map(i => (
    <select 
      key={i} 
      className="p-2 border rounded-xl bg-slate-50" 
      value={programacion[`apoyo${i}`] || ''} 
      onChange={e => setProgramacion({...programacion, [`apoyo${i}`]: e.target.value})}
    >
      <option value="">Apoyo {i}</option>
      {miembros
        .filter(m => {
          // Lista de registros vocales
          const registrosVocales = ['Soprano', 'Mezzosoprano', 'Contralto', 'Tenor', 'Barítono', 'Bajo'];
          // Si el rango contiene alguna de estas palabras, lo incluimos
          return registrosVocales.some(vocal => m.Rango?.includes(vocal));
        })
        .map(m => (
          <option key={m.id} value={`${m.Nombres} ${m.Apellido}`}>
            {m.Nombres} {m.Apellido}
          </option>
        ))
      }
    </select>
  ))}
</div>
      
      <div className="grid grid-cols-2 gap-2">
        <select className="p-2 border rounded-xl bg-slate-50" value={programacion.pianista} onChange={e => setProgramacion({...programacion, pianista: e.target.value})}>
           <option value="">🎹 Pianista</option>
           {miembros.filter(m => m.Rango?.toLowerCase().includes('piano')).map(m => <option key={m.id}>{m.Nombres} {m.Apellido}</option>)}
        </select>
        <select className="p-2 border rounded-xl bg-slate-50" value={programacion.baterista} onChange={e => setProgramacion({...programacion, baterista: e.target.value})}>
           <option value="">🥁 Baterista</option>
           {miembros.filter(m => m.Rango?.toLowerCase().includes('batería')).map(m => <option key={m.id}>{m.Nombres} {m.Apellido}</option>)}
        </select>
      </div>

      <input type="text" placeholder="👤 Músico/Vocalista Invitado (Opcional)" className="w-full p-2 border rounded-xl bg-slate-50" value={programacion.invitado || ''} onChange={e => setProgramacion({...programacion, invitado: e.target.value})} />
      
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-xl font-bold hover:bg-blue-700">
        {programacion.id ? "Guardar Cambios" : "Publicar Agenda"}
      </button>
    </form>

    {/* LISTA DE SERVICIOS */}
    <div className="space-y-3 mt-6">
      <h3 className="text-sm font-bold text-slate-700">📅 SERVICIOS PROGRAMADOS</h3>
      {agendas.map(a => (
        <div key={a.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start">
          <div className="text-xs space-y-1.5 w-full">
            <p className="font-black text-blue-700 uppercase">{a.tipoServicio} • {a.dia} {a.hora}</p>
            <p><strong>🎤 Líder:</strong> {a.vozLider}</p>
            {a.invitado && <p className="text-purple-600 font-semibold">✨ Invitado: {a.invitado}</p>}
            <p><strong>👥 Apoyos:</strong> {`${a.apoyo1 || ''} ${a.apoyo2 ? '• '+a.apoyo2 : ''} ${a.apoyo3 ? '• '+a.apoyo3 : ''}` || 'Sin apoyos'}</p>
            <div className="bg-slate-50 p-2 rounded-lg mt-1">
              <p><strong>🎹 Músicos:</strong> {a.pianista}, {a.baterista}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-2">
             <button onClick={() => { setProgramacion(a); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1.5 bg-slate-100 rounded-lg text-blue-600 hover:bg-slate-200">
                <IconoEditar />
             </button>
             <button onClick={async () => { if(confirm('¿Eliminar?')) { await supabase.from('programacion').delete().eq('id', a.id); cargarDatos(); }}} className="p-1.5 bg-red-50 rounded-lg text-red-500 hover:bg-red-100">
                <IconoBasura />
             </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
{subSeccion === 'miembros' && (
  <div className="space-y-4">
    {/* Encabezado con el botón de agregar - INSERCIÓN SEGURA */}
    <div className="flex justify-between items-center px-1">
      <h2 className="font-bold text-lg">Equipo de Alabanza</h2>
      <button 
        onClick={() => { 
          setEditandoMiembroId(null); 
          setNuevoMiembro({ Nombres: '', Apellido: '', Rango: '' }); 
          setMostrarModalMiembro(true); 
        }} 
        className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-xl shadow"
      >
        + Agregar
      </button>
    </div>

    {/* Lista de miembros existente - INTACTA */}
    <div className="space-y-3">
      {miembros.map(m => (
        <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
          <div>
            <p className="font-bold text-slate-800">{m.Nombres} {m.Apellido}</p>
            <p className="text-xs text-blue-600 font-bold">{m.Rango}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { 
                setEditandoMiembroId(m.id); 
                setNuevoMiembro({ Nombres: m.Nombres, Apellido: m.Apellido, Rango: m.Rango }); 
                setMostrarModalMiembro(true); 
              }} 
              className="p-2 bg-slate-100 rounded-lg text-blue-600"
            >
              <IconoEditar />
            </button>
            <button 
              onClick={() => eliminarMiembro(m.id)} 
              className="p-2 bg-red-50 rounded-lg text-red-500"
            >
              <IconoBasura />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODALES REGISTROS                                         */}
      {/* ========================================================= */}

      {/* MODAL DETALLE CANCIÓN */}
      {/* MODAL DETALLE CANCIÓN */}
{cantoSeleccionado && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl relative">
      <button onClick={() => setCantoSeleccionado(null)} className="absolute top-4 right-4 text-slate-400 font-bold text-lg">✕</button>
      <div>
        <span className="text-[10px] font-black tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{cantoSeleccionado.categoria}</span>
        <h2 className="text-xl font-black text-slate-900 mt-1">{cantoSeleccionado.titulo}</h2>
        <p className="text-xs text-slate-400">Autor: {cantoSeleccionado.autor}</p>
      </div>
      
      {cantoSeleccionado.tono && (
        <div className="inline-block bg-slate-100 px-3 py-1 rounded-xl text-xs font-mono font-bold text-slate-700">Tono: {cantoSeleccionado.tono}</div>
      )}

      {/* --- AQUÍ COMIENZA EL REPRODUCTOR INTELIGENTE --- */}
{/* --- AQUÍ REPRODUCTOR INTELIGENTE ACTUALIZADO --- */}
{cantoSeleccionado.audio_url && (
  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
    {cantoSeleccionado.audio_url.includes('youtube.com') || cantoSeleccionado.audio_url.includes('youtu.be') ? (
      <div className="space-y-1">
        <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Reproductor YouTube</p>
        <div className="w-full aspect-video">
          <iframe 
            className="w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${cantoSeleccionado.audio_url.split('v=')[1]?.split('&')[0] || cantoSeleccionado.audio_url.split('/').pop()}`}
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
    ) : (
      /* Tu reproductor de audio normal sigue igual aquí debajo */
      <div className="space-y-1">
        <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Reproductor de Audio</p>
        <audio controls className="w-full h-8">
          <source src={cantoSeleccionado.audio_url} type="audio/mpeg" />
        </audio>
      </div>
    )}
  </div>
)}      {/* --- AQUÍ TERMINA EL REPRODUCTOR --- */}

      <div className="bg-slate-50 border p-4 rounded-xl">
        <pre className="text-xs font-sans whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">{cantoSeleccionado.letra || "Letra no registrada todavía."}</pre>
      </div>
    </div>
  </div>
)}

      {/* MODAL LOGIN */}
      {mostrarLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <h3 className="font-black text-lg text-slate-800 text-center">Panel de Control Jerickson</h3>
            <form onSubmit={ejecutarLogin} className="space-y-3">
              <input type="text" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 border rounded-xl text-sm" required />
              <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-xl text-sm" required />
              {loginError && <p className="text-xs text-red-500 font-bold text-center bg-red-50 py-1 rounded-lg">{loginError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setMostrarLogin(false)} className="flex-1 py-2.5 text-xs text-slate-500 font-bold">Cerrar</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">Entrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDICIÓN CANCIÓN */}
      {mostrarModalCancion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl my-8">
            <h3 className="text-sm font-bold text-slate-800">{editandoCancionId ? 'Modificar Canción' : 'Agregar Canto'}</h3>
            <form onSubmit={guardarCancion} className="space-y-3 text-xs">
              <input type="text" placeholder="Título" required value={nuevaCancion.titulo} onChange={e => setNuevaCancion({...nuevaCancion, titulo: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
              <input type="text" placeholder="Autor" required value={nuevaCancion.autor} onChange={e => setNuevaCancion({...nuevaCancion, autor: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
              <div className="grid grid-cols-2 gap-2">
                <select value={nuevaCancion.categoria} onChange={e => setNuevaCancion({...nuevaCancion, categoria: e.target.value})} className="p-3 bg-slate-50 border rounded-xl">
                  <option value="Alabanza">Alabanza</option>
                  <option value="Adoración">Adoración</option>
                  <option value="Niños">Niños</option>
                </select>
                <select 
  className="w-full p-2 border rounded-xl bg-slate-50" 
  value={nuevaCancion.tono} 
  onChange={e => setNuevaCancion({...nuevaCancion, tono: e.target.value})}
>
  <option value="">Seleccionar Tono</option>
  <optgroup label="Mayores">
    <option value="Do">Do</option>
    <option value="Re">Re</option>
    <option value="Mi">Mi</option>
    <option value="Fa">Fa</option>
    <option value="Sol">Sol</option>
    <option value="La">La</option>
    <option value="Si">Si</option>
  </optgroup>
  <optgroup label="Menores">
    <option value="Dom">Dom</option>
    <option value="Rem">Rem</option>
    <option value="Mim">Mim</option>
    <option value="Fam">Fam</option>
    <option value="Solm">Solm</option>
    <option value="Lam">Lam</option>
    <option value="Sim">Sim</option>
  </optgroup>
  <optgroup label="Sostenidos/Bemoles">
    <option value="Do#">Do#</option>
    <option value="Re#">Re#</option>
    <option value="Fa#">Fa#</option>
    <option value="Sol#">Sol#</option>
    <option value="La#">La#</option>
  </optgroup>
</select>
              </div>
              <input type="url" placeholder="Audio URL" value={nuevaCancion.audio_url} onChange={e => setNuevaCancion({...nuevaCancion, audio_url: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
              <textarea placeholder="Letra..." rows="4" value={nuevaCancion.letra} onChange={e => setNuevaCancion({...nuevaCancion, letra: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setMostrarModalCancion(false)} className="px-3 py-1.5 text-slate-500">Cancelar</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl shadow">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MIEMBRO */}
      {mostrarModalMiembro && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl my-8">
            <h3 className="text-sm font-bold text-slate-800">Registrar Integrante</h3>
            <form onSubmit={guardarMiembro} className="space-y-4 text-xs">
              <input type="text" placeholder="Nombres" required value={nuevoMiembro.Nombres} onChange={e => setNuevoMiembro({...nuevoMiembro, Nombres: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
              <input type="text" placeholder="Apellidos" required value={nuevoMiembro.Apellido} onChange={e => setNuevoMiembro({...nuevoMiembro, Apellido: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border">
                <p className="font-bold text-blue-600 uppercase text-[10px]">Asignar Roles Vocales e Instrumentos:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[...VOCES_LISTA, ...INSTRUMENTOS_LISTA].map(rol => (
                    <label key={rol} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={rolesSeleccionados.includes(rol)} onChange={() => {
                        if(rolesSeleccionados.includes(rol)) setRolesSeleccionados(rolesSeleccionados.filter(r => r !== rol))
                        else setRolesSeleccionados([...rolesSeleccionados, rol])
                      }} className="w-4 h-4 text-blue-600" />
                      {rol}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setMostrarModalMiembro(false)} className="px-3 py-1.5 text-slate-500">Cancelar</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl shadow">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default App