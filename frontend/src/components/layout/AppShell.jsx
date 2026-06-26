import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowLeft, FiBell, FiCheck, FiEdit2, FiHash, FiLogOut, FiMenu, FiMessageCircle, FiMoreVertical, FiPlus, FiSearch, FiSend, FiTrash2, FiUser, FiUserPlus, FiUsers, FiX } from 'react-icons/fi';
import { api } from '../../services/api.js';
import { useChatSocket } from '../../hooks/useChatSocket.js';
import { useLanChatSocket } from '../../hooks/useLanChatSocket.js';
import { ConfirmModal } from '../ui/ConfirmModal.jsx';
import { LanForm } from '../lan/LanForm.jsx';

const formatTime=value=>new Intl.DateTimeFormat([],{hour:'2-digit',minute:'2-digit'}).format(new Date(value));
const initialData={users:[],connections:[],channels:[],notifications:[]};

export default function AppShell({user, onUserChange, onLogout, lanAddress, onHostLan, onJoinLan, onStopLan}) {
  const [data,setData]=useState(initialData),[screen,setScreen]=useState(null),[modal,setModal]=useState(null),[confirmModal, setConfirmModal] = useState(null),[menu,setMenu]=useState(false),[error,setError]=useState(''),[typing,setTyping]=useState('');
  const [messages,setMessages]=useState([]);
  const load=useCallback(()=>api('/bootstrap').then(setData).catch(e=>setError(e.message)),[]);
  const onEvent=useCallback((event,payload)=>{
    if(event==='presence')setData(x=>({...x,users:payload.filter(p=>p.id!==user.id)}));
    if(event==='notification')setData(x=>({...x,notifications:[payload,...x.notifications]}));
    if(['connection_accept','connection_accepted','connection_rejected','connection_removed','create_channel','leave_channel'].includes(event))load();
    if(event==='connection_removed'&&screen?.kind==='private'&&payload.userIds.includes(screen.id))setScreen(null);
    if(event==='chat_cleared'&&screen?.kind==='private'&&payload.userIds.includes(screen.id))setMessages([]);
    if(event==='receive_message'&&screen?.kind!=='ai'&&screen&&((screen.kind==='channel'&&payload.channelId===screen.id)||(screen.kind==='private'&&(payload.senderId===screen.id||payload.receiverId===screen.id))||(screen.kind==='lan')))setMessages(x=>x.some(m=>m.id===payload.id)?x:[...x,payload]);
    if(event==='message_updated')setMessages(x=>x.map(m=>m.id===payload.id?{...m,...payload}:m));
    if(event==='message_deleted')setMessages(x=>x.map(m=>m.id===payload.messageId?{...m,deletedAt:new Date().toISOString(),content:''}:m));
    if(event==='message_read')setMessages(x=>x.map(m=>m.id===payload.messageId?{...m,readStatus:'read'}:m));
    if(event==='typing')setTyping('typing…'); if(event==='stop_typing')setTyping('');
  },[load,screen,user.id]);

  const {status,emit}=useChatSocket({onEvent,onError:setError});
  const {status: lanStatus, emit: lanEmit } = useLanChatSocket(lanAddress, { onEvent, onError: setError });

  useEffect(()=>{load()},[load]);
  
  useEffect(() => {
    if (lanAddress) {
        setScreen({ kind: 'lan', id: lanAddress, name: 'LAN Party', subtitle: `Connected to ${lanAddress}` });
    } else {
        if (screen?.kind === 'lan') {
            setScreen(null);
        }
    }
  }, [lanAddress, screen?.kind]);

  useEffect(()=>{
    if(!screen||screen.kind==='ai'||screen.kind==='lan') {
      if(screen?.kind !== 'lan') setMessages([]);
      return;
    }
    const q=screen.kind==='channel'?`channelId=${screen.id}`:`userId=${screen.id}`;
    api(`/messages?${q}`).then(rows=>{setMessages(rows);rows.filter(m=>m.receiverId===user.id&&m.readStatus!=='read').forEach(m=>emit('message_read',{messageId:m.id}))}).catch(e=>setError(e.message));
    if(screen.kind==='channel')emit('join_channel',{channelId:screen.id});
    setTyping('')
  },[screen,user.id]);

  const openChannel=c=>setScreen({kind:'channel',id:c.id,name:c.name,subtitle:`${c.memberCount} members · ${c.onlineCount} online`,role:c.role});
  const openConnection=c=>setScreen({kind:'private',id:c.userId,name:c.fullname,subtitle:c.onlineStatus?'Online':'Offline'});

  const handleJoinLan = (address) => {
    setModal(null);
    onJoinLan(address);
  };

  const send=(content,replyToId)=>{
    const payload = {content,replyToId,...(screen.kind==='channel'?{channelId:screen.id}:screen.kind==='private'?{receiverId:screen.id}:{})};
    const socket = screen.kind === 'lan' ? lanEmit : emit;
    socket('send_message', payload, r=>{if(!r?.ok)setError(r?.message||'Could not send message.')});
  }

  const handleTyping = isTyping => {
    const payload = screen.kind==='channel'?{channelId:screen.id}:screen.kind==='private'?{receiverId:screen.id}:{};
    const socket = screen.kind === 'lan' ? lanEmit : emit;
    socket(isTyping?'typing':'stop_typing', payload);
  };
  
  const removeAccount=()=>{setConfirmModal({title: 'Delete Account',message: 'Are you sure you want to delete your Beacon account and all associated data?', onConfirm: async () => {await api('/users/me',{method:'DELETE'});setConfirmModal(null);onLogout();}, onCancel: () => setConfirmModal(null)})};
  
  const currentStatus = screen?.kind === 'lan' ? lanStatus : status;

  const onChatScreenBack = () => {
    if (screen?.kind === 'lan') {
      onStopLan();
    }
    setScreen(null);
    load();
  }
  
  const onClearChat = () => {
    setConfirmModal({
        title: 'Clear Chat',
        message: 'Are you sure you want to clear this private chat for both users?',
        onConfirm: async () => {
            await api(`/messages?userId=${screen.id}`,{method:'DELETE'});
            setMessages([]);
            setConfirmModal(null);
        },
        onCancel: () => setConfirmModal(null)
    });
  };

  return <main className="relative min-h-screen overflow-hidden bg-[var(--page-bg)] text-[var(--text-primary)]"><div className="ambient-bg"/><div className="noise-layer"/>
    <div className="relative z-10 min-h-screen">
      {screen?<ChatScreen screen={screen} user={user} messages={messages} typing={typing} status={currentStatus} onBack={onChatScreenBack} onSend={send} onTyping={handleTyping} onInfo={()=>setModal('channelInfo')} onClear={onClearChat} setMessages={setMessages}/>:<>
        <header className="sticky top-0 z-30 border-b border-[var(--glass-border)] bg-slate-950/45 px-4 py-3 backdrop-blur-2xl sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><div className="relative"><Icon label="Menu" onClick={()=>setMenu(v=>!v)}><FiMenu/></Icon><AnimatePresence>{menu&&<motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="glass-panel absolute left-0 top-12 w-52 p-2"><MenuButton icon={<FiUser/>} onClick={()=>{setModal('profile');setMenu(false)}}>My Profile</MenuButton><MenuButton icon={<FiLogOut/>} onClick={onLogout}>Logout</MenuButton><MenuButton danger icon={<FiTrash2/>} onClick={removeAccount}>Delete Account</MenuButton></motion.div>}</AnimatePresence></div><div className="flex items-center gap-2"><button onClick={()=>setScreen({kind:'ai',name:'Beacon Buddy',subtitle:'Simple AI · Online'})} className="flex h-11 items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-3 text-sm font-semibold text-cyan-100"><span>🤖</span><span className="hidden sm:inline">Beacon Buddy</span></button><Icon label="Notifications" badge={data.notifications.filter(n=>!n.isRead).length} onClick={()=>setModal('notifications')}><FiBell/></Icon></div></div></header>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8"><div className="mb-9 flex items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.28em] text-cyan-300">Beacon LAN</p><h1 className="text-3xl font-black sm:text-4xl">Welcome back, {user.fullname.split(' ')[0]}.</h1><p className="mt-2 text-[var(--text-muted)]">Your nearby people and conversations, all in one quiet place.</p></div><span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300 sm:block">● {status}</span></div>
          {error&&<button onClick={()=>setError('')} className="mb-5 w-full rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-left text-sm text-red-200">{error} · Dismiss</button>}
          <DashboardSection title="Channels" subtitle="Private spaces for your groups" action={<div className="flex gap-2"><Action onClick={()=>setModal('createChannel')} icon={<FiPlus/>}>Create</Action><Action onClick={()=>setModal('joinChannel')} icon={<FiSearch/>}>Join</Action></div>}>
            <CardGrid>{data.channels.map(c=><ChannelCard key={c.id} channel={c} onClick={()=>openChannel(c)}/>)}{!data.channels.length&&<EmptyCard text="No channels yet. Create one or join with a channel username."/>}</CardGrid>
          </DashboardSection>
          <ConnectByUsername onResult={setError}/>
          <DashboardSection title="People on this LAN" subtitle="Beacon users who are online right now" action={lanAddress ? <Action onClick={onStopLan} icon={<FiX/>}>Leave LAN</Action> : <div className="flex gap-2"><Action onClick={onHostLan} icon={<FiPlus/>}>Host</Action><Action onClick={()=>setModal('joinLan')} icon={<FiSearch/>}>Join</Action></div>}><CardGrid>{data.users.filter(p=>p.onlineStatus).map(p=><PeopleCard key={p.id} person={p} onView={()=>setModal({type:'person',person:p})} onRequest={async()=>{try{await api(`/connections/${p.id}`,{method:'POST'});setError('Connection request sent.')}catch(e){setError(e.message)}}}/>) }{!data.users.some(p=>p.onlineStatus)&&<EmptyCard text="Nobody else is online on Beacon right now."/>}</CardGrid></DashboardSection>
          <DashboardSection title="My Connections" subtitle="Only accepted connections appear here"><ConnectionGroup title="Online connections" items={data.connections.filter(c=>c.onlineStatus)} open={openConnection} view={c=>setModal({type:'connection',person:{...c,id:c.userId}})}/><ConnectionGroup title="Offline connections" items={data.connections.filter(c=>!c.onlineStatus)} open={openConnection} view={c=>setModal({type:'connection',person:{...c,id:c.userId}})}/></DashboardSection>
        </div>
      </>}
    </div>
    <AnimatePresence>{modal&&<Modal onClose={()=>setModal(null)}>{modal==='profile'?<Profile user={user} onChange={onUserChange} onLogout={onLogout} onDelete={removeAccount}/>:modal==='notifications'?<Notifications items={data.notifications} close={()=>setModal(null)} reload={load} emit={emit}/>:modal==='createChannel'?<ChannelForm mode="create" close={()=>{setModal(null);load()}}/>:modal==='joinChannel'?<ChannelForm mode="join" close={(channel)=>{setModal(null);load();if(channel){emit('join_channel',{channelId:channel.id});openChannel({...channel,memberCount:1,onlineCount:1,role:'member'})}}}/>:modal==='joinLan'?<LanForm onJoin={handleJoinLan} />:modal==='channelInfo'?<ChannelInfo screen={screen} users={data.users} close={()=>setModal(null)} back={()=>{setModal(null);setScreen(null);load()}} setConfirmModal={setConfirmModal}/>:modal.type==='person'?<PersonProfile person={modal.person} close={()=>setModal(null)} request={async()=>{await api(`/connections/${modal.person.id}`,{method:'POST'});setModal(null);setError('Connection request sent.')}}/>:modal.type==='connection'?<PersonProfile person={modal.person} close={()=>setModal(null)} remove={async()=>{await api(`/connections/user/${modal.person.id}`,{method:'DELETE'});setModal(null);load()}}/>:null}</Modal>}</AnimatePresence>
    <AnimatePresence>
        {confirmModal && (
            <Modal onClose={() => setConfirmModal(null)}>
                <ConfirmModal {...confirmModal} />
            </Modal>
        )}
    </AnimatePresence>
  </main>;
}

function DashboardSection({title,subtitle,action,children}){return <section className="mb-10"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p></div>{action}</div>{children}</section>}
function ConnectByUsername({onResult}){const [username,setUsername]=useState(''),[loading,setLoading]=useState(false);const submit=async e=>{e.preventDefault();setLoading(true);try{await api('/connections/by-username',{method:'POST',body:JSON.stringify({username})});setUsername('');onResult('Connection request sent.')}catch(error){onResult(error.message)}finally{setLoading(false)}};return <DashboardSection title="Connect by Username" subtitle="Send a connection request using a Beacon username."><form onSubmit={submit} className="glass-panel flex flex-col gap-3 p-4 sm:flex-row"><input required value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter username" className="h-12 min-w-0 flex-1 rounded-xl border border-[var(--glass-border)] bg-[var(--composer-bg)] px-4 outline-none focus:border-cyan-400/50"/><button disabled={loading} className="h-12 rounded-xl bg-[var(--accent)] px-6 font-semibold text-white disabled:opacity-60">{loading?'Sending…':'Send Request'}</button></form></DashboardSection>}
function CardGrid({children}){return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>}
function ChannelCard({channel,onClick}){return <motion.button whileHover={{y:-3}} onClick={onClick} className="glass-panel flex items-center gap-4 p-4 text-left"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300"><FiHash/></div><div className="min-w-0 flex-1"><h3 className="truncate font-semibold">{channel.name}</h3><p className="text-xs text-[var(--text-muted)]">{channel.memberCount} members · {channel.onlineCount} online</p></div><FiArrowLeft className="rotate-180 opacity-40"/></motion.button>}
function PeopleCard({person,onView,onRequest}){return <div className="glass-panel p-4"><div className="flex items-center gap-3"><Avatar name={person.fullname}/><div className="min-w-0 flex-1"><h3 className="truncate font-semibold">{person.fullname}</h3><p className="truncate text-xs text-[var(--text-muted)]">@{person.username}</p></div><span className="text-xs text-emerald-300">● Online</span></div><div className="mt-4 grid grid-cols-2 gap-2"><SmallButton onClick={onView}>View profile</SmallButton><SmallButton primary onClick={onRequest}>Send request</SmallButton></div></div>}
function ConnectionGroup({title,items,open,view}){return <div className="mb-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{title} · {items.length}</p><CardGrid>{items.map(c=><motion.div whileHover={{y:-2}} key={c.userId} className="glass-panel p-4"><div className="flex items-center gap-3"><Avatar name={c.fullname}/><div className="min-w-0 flex-1"><h3 className="truncate font-semibold">{c.fullname}</h3><p className="truncate text-xs text-[var(--text-muted)]">@{c.username}</p></div><span className={`text-xs ${c.onlineStatus?'text-emerald-300':'text-slate-500'}`}>● {c.onlineStatus?'Online':'Offline'}</span></div><div className="mt-4 grid grid-cols-2 gap-2"><SmallButton primary onClick={()=>open(c)}>Open chat</SmallButton><SmallButton onClick={()=>view(c)}>View profile</SmallButton></div></motion.div>)}</CardGrid>{!items.length&&<p className="rounded-2xl border border-dashed border-[var(--glass-border)] p-4 text-sm text-[var(--text-muted)]">No {title.toLowerCase()}.</p>}</div>}
function EmptyCard({text}){return <div className="rounded-2xl border border-dashed border-[var(--glass-border)] p-6 text-sm text-[var(--text-muted)]">{text}</div>}
function Action({children,icon,onClick}){return <button onClick={onClick} className="flex h-10 items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-soft)] px-3 text-sm font-semibold">{icon}{children}</button>}
function Icon({children,label,onClick,badge}){return <button onClick={onClick} aria-label={label} title={label} className="relative grid h-11 w-11 place-items-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-soft)]">{children}{badge>0&&<span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] text-white">{badge}</span>}</button>}
function MenuButton({children,icon,onClick,danger}){return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-white/5 ${danger?'text-red-300':''}`}>{icon}{children}</button>}
function Avatar({name=''}){return <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] font-bold text-white">{name.charAt(0).toUpperCase()}</div>}
function SmallButton({children,onClick,primary}){return <button onClick={onClick} className={`rounded-xl px-3 py-2 text-xs font-semibold ${primary?'bg-cyan-500 text-white':'bg-[var(--glass-soft)]'}`}>{children}</button>}

function ChatScreen({screen,user,messages,typing,status,onBack,onSend,onTyping,onInfo,onClear,setMessages}){
  const [reply,setReply]=useState(null),[editing,setEditing]=useState(null); const ai=screen.kind==='ai';
  const [aiMessages,setAiMessages]=useState([{id:'hello',senderId:0,content:'Hello. Welcome to Beacon Buddy.',createdAt:new Date().toISOString()}]);
  const shown=ai?aiMessages:messages;
  const submit=content=>{if(ai){const mine={id:crypto.randomUUID(),senderId:user.id,content,createdAt:new Date().toISOString()};setAiMessages(x=>[...x,mine]);setTimeout(()=>setAiMessages(x=>[...x,{id:crypto.randomUUID(),senderId:0,content:buddyReply(content),createdAt:new Date().toISOString()}]),350);return}if(editing){api(`/messages/${editing.id}`,{method:'PATCH',body:JSON.stringify({content})}).then(updated=>setMessages(x=>x.map(m=>m.id===updated.id?{...m,...updated}:m)));setEditing(null);return}onSend(content,reply?.id);setReply(null)};
  return <div className="mx-auto flex h-screen max-w-5xl flex-col sm:p-4"><section className="glass-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-none sm:rounded-[24px]"><header className="flex items-center justify-between border-b border-[var(--glass-border)] p-4"><div className="flex items-center gap-3"><Icon label="Back" onClick={onBack}><FiArrowLeft/></Icon><Avatar name={screen.name}/><div><h1 className="font-bold">{ai?'🤖 ':''}{screen.name}</h1><p className="text-xs text-[var(--text-muted)]">{typing||screen.subtitle||status}</p></div></div>{screen.kind==='channel'?<Icon label="Channel information" onClick={onInfo}><FiMoreVertical/></Icon>:screen.kind==='private'?<button onClick={onClear} className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-soft)] px-3 py-2 text-xs text-red-200">Clear chat</button>:null}</header><div className="chat-scroll flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">{shown.map(m=><Message key={m.id} message={m} self={m.senderId===user.id} onReply={()=>setReply(m)} onEdit={()=>setEditing(m)} onDelete={()=>api(`/messages/${m.id}`,{method:'DELETE'})}/>)}</div>{(reply||editing)&&<div className="flex items-center justify-between border-t border-[var(--glass-border)] bg-cyan-400/5 px-4 py-2 text-xs"><span>{editing?'Editing message':`Replying to ${reply.fullname||reply.username||'Beacon Buddy'}`}</span><button onClick={()=>{setReply(null);setEditing(null)}}><FiX/></button></div>}<Composer initial={editing?.content||''} resetKey={editing?.id} onSend={submit} onTyping={onTyping}/></section></div>}
function Message({message,self,onReply,onEdit,onDelete}){return <div className={`group flex ${self?'justify-end':'justify-start'}`}><div className={`relative max-w-[82%] rounded-2xl px-4 py-3 ${self?'bg-[var(--user-bubble)] text-white':'border border-[var(--glass-border)] bg-[var(--assistant-bubble)]'}`}><div className="mb-1 flex gap-2 text-[10px] opacity-65"><b>{self?'You':message.fullname||message.username||'Beacon Buddy'}</b><span>{formatTime(message.createdAt)}</span>{message.editedAt&&<span>edited</span>}</div><p className="whitespace-pre-wrap text-sm">{message.deletedAt?'Message unsent':message.content}</p>{self&&!message.deletedAt&&<p className="mt-1 text-right text-[9px] opacity-65">{message.readStatus==='read'?'✓✓ Read':message.readStatus==='delivered'?'✓✓ Delivered':'✓ Sent'}</p>}{!message.deletedAt&&<div className={`absolute top-0 hidden -translate-y-full gap-1 group-hover:flex ${self?'right-0':'left-0'}`}><Tiny title="Reply" onClick={onReply}>↩</Tiny>{self&&<><Tiny title="Edit" onClick={onEdit}><FiEdit2/></Tiny><Tiny title="Unsend" onClick={onDelete}><FiTrash2/></Tiny></>}</div>}</div></div>}
function Tiny({children,onClick,title}){return <button title={title} onClick={onClick} className="grid h-7 w-7 place-items-center rounded-lg bg-slate-800 text-xs">{children}</button>}
function Composer({onSend,onTyping,initial='',resetKey}){const [value,setValue]=useState(initial);useEffect(()=>setValue(initial),[initial,resetKey]);return <form onSubmit={e=>{e.preventDefault();const x=value.trim();if(x){onSend(x);setValue('');onTyping?.(false)}}} className="flex gap-2 border-t border-[var(--glass-border)] p-3"><button type="button" onClick={()=>setValue(v=>v+' 😊')} className="grid h-12 w-10 place-items-center">😊</button><input value={value} onChange={e=>{setValue(e.target.value);onTyping?.(e.target.value)}} placeholder="Write a message…" className="h-12 min-w-0 flex-1 rounded-2xl border border-[var(--glass-border)] bg-[var(--composer-bg)] px-4 outline-none"/><button className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent)]"><FiSend/></button></form>}
function buddyReply(text){const x=text.toLowerCase();if(/hello|hi|hey/.test(x))return 'Hello. Welcome to Beacon Buddy.';if(x.includes('how are you'))return "I'm doing great. How can I help?";if(x.includes('thank'))return "You're welcome. I'm always around when you need me.";if(x.includes('beacon'))return 'Beacon keeps your conversations close, fast, and on your local network.';return "I'm still learning, but I'm glad you asked. Full AI features are coming soon."}

function Modal({children,onClose}){return <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e=>e.target===e.currentTarget&&onClose()} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4 backdrop-blur-sm"><motion.div initial={{scale:.97,y:12}} animate={{scale:1,y:0}} className="glass-panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"><div className="mb-4 flex justify-end"><button onClick={onClose}><FiX/></button></div>{children}</motion.div></motion.div>}
function Profile({user,onChange,onLogout,onDelete}){const [editing,setEditing]=useState(false),[form,setForm]=useState({fullname:user.fullname,age:user.age,gender:user.gender});const save=async()=>{const next=await api('/users/me',{method:'PATCH',body:JSON.stringify(form)});onChange(next);setEditing(false)};return <div><div className="flex items-center gap-4"><Avatar name={user.fullname}/><div><h2 className="text-xl font-bold">{user.fullname}</h2><p className="text-[var(--text-muted)]">@{user.username}</p></div></div>{editing?<div className="my-5 space-y-3"><Field value={form.fullname} onChange={v=>setForm(x=>({...x,fullname:v}))} label="Name"/><Field type="number" value={form.age} onChange={v=>setForm(x=>({...x,age:v}))} label="Age"/><Field value={form.gender} onChange={v=>setForm(x=>({...x,gender:v}))} label="Gender"/><SmallButton primary onClick={save}>Save profile</SmallButton></div>:<dl className="my-6 grid grid-cols-2 gap-3">{[['Age',user.age],['Gender',user.gender],['Status','Online'],['Join date',new Date(user.createdAt).toLocaleDateString()]].map(([a,b])=><div key={a} className="rounded-xl bg-[var(--glass-soft)] p-3"><dt className="text-xs text-[var(--text-muted)]">{a}</dt><dd>{b}</dd></div>)}</dl>}<div className="grid gap-2"><SmallButton onClick={()=>setEditing(v=>!v)}>Edit profile</SmallButton><SmallButton onClick={onLogout}>Logout</SmallButton><button onClick={onDelete} className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">Delete account</button></div></div>}
function PersonProfile({person,close,request,remove}){return <div className="text-center"><div className="mx-auto w-fit"><Avatar name={person.fullname}/></div><h2 className="mt-3 text-xl font-bold">{person.fullname}</h2><p className="text-[var(--text-muted)]">@{person.username}</p><div className="my-5 grid grid-cols-3 gap-2 text-sm"><Info label="Age" value={person.age}/><Info label="Gender" value={person.gender}/><Info label="Status" value={person.onlineStatus?'Online':'Offline'}/></div><div className="grid grid-cols-2 gap-2"><SmallButton onClick={close}>Close</SmallButton>{remove?<button onClick={remove} className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">Remove connection</button>:<SmallButton primary onClick={request}>Send request</SmallButton>}</div></div>}
function Info({label,value}){return <div className="rounded-xl bg-[var(--glass-soft)] p-3"><p className="text-xs text-[var(--text-muted)]">{label}</p><p className="mt-1">{value}</p></div>}
function Field({label,value,onChange,type='text',placeholder}){return <label className="block"><span className="mb-1 block text-xs text-[var(--text-muted)]">{label}</span><input required type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="h-12 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--composer-bg)] px-4 outline-none"/></label>}
function ChannelForm({mode,close}){const create=mode==='create';const [form,setForm]=useState(create?{name:'',channelUsername:'',password:'',members:''}:{channelUsername:'',password:''}),[error,setError]=useState('');const submit=async e=>{e.preventDefault();try{const body=create?{...form,members:form.members.split(',').map(x=>x.trim()).filter(Boolean)}:form;const channel=await api(create?'/channels':'/channels/join',{method:'POST',body:JSON.stringify(body)});close(channel)}catch(x){setError(x.message)}};return <form onSubmit={submit}><h2 className="text-xl font-bold">{create?'Create channel':'Join channel'}</h2><p className="mt-1 text-sm text-[var(--text-muted)]">{create?'You become the channel admin.':'Enter the channel credentials shared with you.'}</p><div className="mt-5 space-y-3">{create&&<Field label="Channel name" value={form.name} onChange={v=>setForm(x=>({...x,name:v}))}/>}<Field label="Channel username" value={form.channelUsername} onChange={v=>setForm(x=>({...x,channelUsername:v}))}/><Field label="Password" type="password" value={form.password} onChange={v=>setForm(x=>({...x,password:v}))}/>{create&&<Field label="Add members (optional)" placeholder="sohel123, rahul22" value={form.members} onChange={v=>setForm(x=>({...x,members:v}))}/>} {error&&<p className="text-sm text-red-300">{error}</p>}<button className="h-12 w-full rounded-xl bg-[var(--accent)] font-bold">{create?'Create channel':'Join channel'}</button></div></form>}
function Notifications({items,close,reload,emit}){const act=async(n,action)=>{if(n.type==='connection_request')await api(`/connections/${n.payload.connectionId}`,{method:'PATCH',body:JSON.stringify({status:action==='join'?'accepted':'rejected'})});else await api(`/channels/${n.payload.channelId}/invitation`,{method:'POST',body:JSON.stringify({action})});if(action==='join'&&n.type==='channel_invitation')emit('join_channel',{channelId:n.payload.channelId});await api(`/notifications/${n.id}/read`,{method:'PATCH'});reload()};return <div><h2 className="text-xl font-bold">Notifications</h2><div className="mt-4 space-y-3">{!items.length&&<p className="text-[var(--text-muted)]">You’re all caught up.</p>}{items.map(n=><div key={n.id} className={`rounded-2xl p-4 ${n.isRead?'bg-white/[.03] opacity-60':'bg-[var(--glass-soft)]'}`}><p className="text-sm">{n.type==='connection_request'?`@${n.payload.from?.username} sent you a connection request.`:`You were invited to ${n.payload.channelName}.`}</p>{!n.isRead&&<div className="mt-3 flex gap-2"><SmallButton primary onClick={()=>act(n,'join')}>{n.type==='connection_request'?'Accept':'Join'}</SmallButton><SmallButton onClick={()=>act(n,'reject')}>Reject</SmallButton></div>}</div>)}</div></div>}
function ChannelInfo({screen,users,close,back, setConfirmModal}){
    const [username,setUsername]=useState(''),[error,setError]=useState('');
    const add=async()=>{try{await api(`/channels/${screen.id}/members`,{method:'POST',body:JSON.stringify({username})});setUsername('');setError('Invitation sent.')}catch(e){setError(e.message)}};
    const remove=async p=>{await api(`/channels/${screen.id}/members/${p.id}`,{method:'DELETE'});setError(`${p.fullname} removed.`)};
    const del=()=>{
        setConfirmModal({
            title: 'Delete Channel',
            message: `Are you sure you want to delete ${screen.name}?`,
            onConfirm: async () => {
                await api(`/channels/${screen.id}`,{method:'DELETE'});
                setConfirmModal(null);
                back();
            },
            onCancel: () => setConfirmModal(null)
        });
    };
    return <div><h2 className="text-xl font-bold">{screen.name}</h2><p className="mt-1 text-[var(--text-muted)]">{screen.subtitle}</p>{screen.role==='admin'?<div className="mt-5"><p className="mb-3 text-xs font-bold uppercase text-cyan-300">Admin controls</p><div className="flex gap-2"><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username to invite" className="h-10 min-w-0 flex-1 rounded-xl bg-[var(--composer-bg)] px-3 outline-none"/><SmallButton primary onClick={add}>Add user</SmallButton></div><div className="mt-4 max-h-48 space-y-2 overflow-y-auto">{users.map(p=><div key={p.id} className="flex items-center gap-2 rounded-xl bg-[var(--glass-soft)] p-2"><span className="flex-1 text-sm">{p.fullname} <small className="text-[var(--text-muted)]">@{p.username}</small></span><button onClick={()=>remove(p)} className="text-xs text-red-300">Remove</button></div>)}</div>{error&&<p className="mt-3 text-sm text-cyan-200">{error}</p>}<button onClick={del} className="mt-5 w-full rounded-xl bg-red-500/10 p-3 text-red-300">Delete channel</button></div>:<p className="mt-5 text-sm text-[var(--text-muted)]">Only the channel admin can manage members.</p>}</div>
}
