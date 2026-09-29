const { createClient } = supabase;
const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const animeData=[
{name:"Frieren: Beyond Journey's End",genre:"Fantasy · Adventure"},
{name:"Jujutsu Kaisen",genre:"Action · Supernatural"},
{name:"One Piece",genre:"Adventure · Shonen"},
{name:"Attack on Titan",genre:"Action · Drama"},
{name:"Demon Slayer",genre:"Action · Fantasy"},
{name:"Spy × Family",genre:"Comedy · Family"},
{name:"Chainsaw Man",genre:"Action · Dark Fantasy"},
{name:"Solo Leveling",genre:"Action · Fantasy"},
{name:"My Hero Academia",genre:"Superhero · Shonen"},
{name:"Haikyuu!!",genre:"Sports · Comedy"},
{name:"Death Note",genre:"Thriller · Mystery"},
{name:"Naruto",genre:"Adventure · Shonen"},
{name:"Bleach",genre:"Action · Supernatural"},
{name:"Hunter × Hunter",genre:"Adventure · Fantasy"},
{name:"Blue Lock",genre:"Sports · Drama"},
{name:"Mob Psycho 100",genre:"Action · Comedy"},
{name:"Vinland Saga",genre:"Historical · Drama"},
{name:"Steins;Gate",genre:"Sci-Fi · Thriller"},
{name:"Your Name",genre:"Romance · Fantasy"},
{name:"A Silent Voice",genre:"Drama · Romance"}
];

let currentUser=null, currentProfile=null, currentChatUser=null, currentMessagesChannel=null;

function openModal(id){document.getElementById(id).classList.add("open")}
function closeModal(id){document.getElementById(id).classList.remove("open")}
document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.remove("open")}));

function toast(message){const t=document.createElement("div");t.className="toast";t.textContent=message;document.body.appendChild(t);setTimeout(()=>t.remove(),3000)}
function escapeHtml(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function stars(n){return "★".repeat(Math.floor(n))+(n%1?"½":"")}
function openSignup(){closeModal("loginModal");openModal("signupModal")}
function openReview(){if(!currentUser){openModal("loginModal");return}openModal("reviewModal")}
function openAuthOrProfile(){if(currentUser){window.location.href="profile.html"}else openModal("loginModal")}

function renderAnime(){
 const grid=document.getElementById("animeGrid");
 if(!grid)return;
 grid.innerHTML=animeData.map((a,i)=>`<article class="anime" onclick="openReviewFor('${a.name.replace(/'/g,"\\'")}')"><div class="poster" style="background:${i%3===0?'#111':i%3===1?'#ffd4e0':'#222'};color:${i%3===1?'#111':'#ffd4e0'}">${escapeHtml(a.name)}</div><div class="anime-info"><strong>${escapeHtml(a.name)}</strong><small>${escapeHtml(a.genre)}</small></div></article>`).join("");
 const reviewAnime=document.getElementById("reviewAnime"); if(reviewAnime) reviewAnime.innerHTML=animeData.map(a=>`<option>${escapeHtml(a.name)}</option>`).join("");
}
function filterAnime(){const search=document.getElementById("search"); if(!search)return; const q=search.value.toLowerCase();document.querySelectorAll(".anime").forEach((el,i)=>el.style.display=animeData[i].name.toLowerCase().includes(q)?"":"none")}
function openReviewFor(name){if(!currentUser){openModal("loginModal");return}openModal("reviewModal");document.getElementById("reviewAnime").value=name}

async function signup(e){
 e.preventDefault();
 const username=document.getElementById("signupUsername").value.trim();
 const email=document.getElementById("signupEmail").value.trim().toLowerCase();
 const password=document.getElementById("signupPassword").value;
 const msg=document.getElementById("signupMessage");
 if(!email.endsWith("@gmail.com")){msg.textContent="Please use a Gmail address.";return}
 if(!/^[A-Za-z0-9_]{3,20}$/.test(username)){msg.textContent="Username must be 3–20 letters, numbers or underscores.";return}
 const {data:existing,error:checkError}=await sb.from("profiles").select("id").eq("username",username).maybeSingle();
 if(checkError){msg.textContent=checkError.message;return}
 if(existing){msg.textContent="That username is already taken.";return}
 const {data,error}=await sb.auth.signUp({email,password,options:{data:{username}}});
 if(error){msg.textContent=error.message;return}
 msg.textContent="Account created. Check your Gmail for the verification link, then return and log in.";
}
async function login(e){
 e.preventDefault();const msg=document.getElementById("loginMessage");
 const email=document.getElementById("loginEmail").value.trim();const password=document.getElementById("loginPassword").value;
 const {error}=await sb.auth.signInWithPassword({email,password});
 if(error){msg.textContent=error.message;return}
 closeModal("loginModal");toast("Logged in.");await loadSession();
}
async function logout(){await sb.auth.signOut();toast("Logged out.");await loadSession()}

async function loadSession(){
 const {data:{session}}=await sb.auth.getSession();
 currentUser=session?.user||null;
 if(currentUser){await ensureProfile();await refreshUI();}else resetUI();
}
async function ensureProfile(){
 const {data,error}=await sb.from("profiles").select("*").eq("id",currentUser.id).maybeSingle();
 if(!data && !error){
   const username=(currentUser.user_metadata?.username||("user_"+currentUser.id.slice(0,8))).toLowerCase();
   await sb.from("profiles").insert({id:currentUser.id,username,email:currentUser.email});
   const {data:p}=await sb.from("profiles").select("*").eq("id",currentUser.id).single();currentProfile=p;
 } else currentProfile=data;
}
async function refreshUI(){
 const authArea=document.getElementById("authArea");
 if(authArea) authArea.innerHTML=`<span class="muted">@${escapeHtml(currentProfile.username)}</span> <button class="btn dark" onclick="logout()">Log out</button>`;
 const profileUsername=document.getElementById("profileUsername"); if(profileUsername) profileUsername.textContent=currentProfile.username;
 const profileBio=document.getElementById("profileBio"); if(profileBio) profileBio.textContent=currentProfile.bio||"No bio yet.";
 const profileAvatar=document.getElementById("profileAvatar"); if(profileAvatar) profileAvatar.innerHTML=currentProfile.avatar_url?`<img src="${escapeHtml(currentProfile.avatar_url)}">`:escapeHtml(currentProfile.username[0]?.toUpperCase()||"?");
 const profileMini=document.getElementById("profileMini"); if(profileMini) profileMini.innerHTML=`<div class="avatar">${currentProfile.avatar_url?`<img src="${escapeHtml(currentProfile.avatar_url)}">`:escapeHtml(currentProfile.username[0]?.toUpperCase()||"?")}</div><div><strong>@${escapeHtml(currentProfile.username)}</strong><small>Your AnimeBox profile</small></div>`;
 const profileSocials=document.getElementById("profileSocials"); if(profileSocials) profileSocials.innerHTML=[currentProfile.instagram?`<a href="https://instagram.com/${encodeURIComponent(currentProfile.instagram.replace("@",""))}" target="_blank">Instagram</a>`:"",currentProfile.tiktok?`<a href="https://tiktok.com/@${encodeURIComponent(currentProfile.tiktok.replace("@",""))}" target="_blank">TikTok</a>`:""].join("");
 await loadReviews();await loadFriends();await loadActivity();
}

function resetUI(){
 const authArea=document.getElementById("authArea"); if(authArea) authArea.innerHTML='<button class="btn dark" onclick="openModal(\'loginModal\')">Log in</button>';
 const profileUsername=document.getElementById("profileUsername"); if(profileUsername) profileUsername.textContent="Not logged in";
 const profileBio=document.getElementById("profileBio"); if(profileBio) profileBio.textContent="Create an account to make your profile.";
 const profileAvatar=document.getElementById("profileAvatar"); if(profileAvatar) profileAvatar.textContent="?";
 const myReviews=document.getElementById("myReviews"); if(myReviews) myReviews.innerHTML='<div class="review"><p class="muted">Log in to see your reviews.</p></div>';
 const friendList=document.getElementById("friendList"); if(friendList) friendList.innerHTML='<p class="muted">Your accepted friends will appear here.</p>';
 const activityList=document.getElementById("activityList"); if(activityList) activityList.innerHTML='<p class="muted">Log in to see your friends\' activity.</p>';
}

async function saveReview(e){
 e.preventDefault();if(!currentUser)return;
 const anime=document.getElementById("reviewAnime").value,type=document.getElementById("reviewType").value,rating=Number(document.getElementById("reviewRating").value),text=document.getElementById("reviewText").value.trim(),part=document.getElementById("reviewPart").value.trim();
 const {error}=await sb.from("reviews").insert({user_id:currentUser.id,anime_title:anime,review_type:type,part,rating,text});
 const msg=document.getElementById("reviewMessage");
 if(error){msg.textContent=error.message;return}
 if(document.getElementById("instagramShare").checked){const excerpt=text.length>110?text.slice(0,110)+"…":text;await navigator.clipboard?.writeText(`${anime} — ${stars(rating)}\n\n"${excerpt}"\n\nReview on AnimeBox`);toast("Instagram share preview copied. Only the beginning was included.")}
 closeModal("reviewModal");e.target.reset();toast("Review posted.");await loadReviews();await loadActivity();
}
async function loadReviews(){
 const reviewsEl=reviewsEl; if(!reviewsEl)return;
 const {data,error}=await sb.from("reviews").select("*").eq("user_id",currentUser.id).order("created_at",{ascending:false});
 if(error){reviewsEl.innerHTML=`<div class="review">${escapeHtml(error.message)}</div>`;return}
 document.getElementById("statReviews").textContent=data.length;
 document.getElementById("statEpisodes").textContent=data.filter(r=>r.review_type==="episode").length;
 document.getElementById("statAvg").textContent=data.length?(data.reduce((s,r)=>s+Number(r.rating),0)/data.length).toFixed(1):"0";
 reviewsEl.innerHTML=data.length?data.map(r=>`<article class="review"><div class="review-head"><div><b>${escapeHtml(r.anime_title)}</b><small> · ${escapeHtml(r.review_type)}${r.part?" "+escapeHtml(r.part):""}</small></div><b>${stars(Number(r.rating))}</b></div><p>${escapeHtml(r.text)}</p><div class="review-actions"><button onclick="toggleLike('${r.id}',this)">♡ Like</button><button onclick="shareReview('${r.id}')">Share</button><button onclick="deleteReview('${r.id}')">Delete</button></div></article>`).join(""):'<div class="review"><p class="muted">No reviews yet. Write your first one.</p></div>';
}
async function deleteReview(id){if(!confirm("Delete this review?"))return;const {error}=await sb.from("reviews").delete().eq("id",id).eq("user_id",currentUser.id);if(error)toast(error.message);else{toast("Review deleted.");await loadReviews()}}
async function toggleLike(reviewId,button){
 const {data:existing}=await sb.from("review_likes").select("id").eq("review_id",reviewId).eq("user_id",currentUser.id).maybeSingle();
 if(existing)await sb.from("review_likes").delete().eq("id",existing.id);else await sb.from("review_likes").insert({review_id:reviewId,user_id:currentUser.id});
 button.textContent=existing?"♡ Like":"♥ Liked";
}
async function shareReview(id){const {data}=await sb.from("reviews").select("*").eq("id",id).single();if(!data)return;const excerpt=data.text.length>110?data.text.slice(0,110)+"…":data.text;await navigator.clipboard?.writeText(`${data.anime_title} — ${stars(Number(data.rating))}\n\n"${excerpt}"\n\nReview on AnimeBox`);toast("Share preview copied.");}

async function saveProfile(e){
 e.preventDefault();const bio=document.getElementById("bioInput").value.trim(),instagram=document.getElementById("instagramInput").value.trim(),tiktok=document.getElementById("tiktokInput").value.trim();let avatar_url=currentProfile.avatar_url;
 const file=document.getElementById("avatarFile").files[0];
 if(file){const ext=file.name.split(".").pop().toLowerCase();const path=`${currentUser.id}/${crypto.randomUUID()}.${ext}`;const {error}=await sb.storage.from("avatars").upload(path,file,{upsert:true});if(error){document.getElementById("profileMessage").textContent=error.message;return}const {data}=sb.storage.from("avatars").getPublicUrl(path);avatar_url=data.publicUrl}
 const {error}=await sb.from("profiles").update({bio,instagram,tiktok,avatar_url}).eq("id",currentUser.id);
 if(error){document.getElementById("profileMessage").textContent=error.message;return}
 await ensureProfile();closeModal("profileModal");toast("Profile saved.");await refreshUI();
}
function openProfileEditor(){if(!currentUser){openModal("loginModal");return}document.getElementById("bioInput").value=currentProfile.bio||"";document.getElementById("instagramInput").value=currentProfile.instagram||"";document.getElementById("tiktokInput").value=currentProfile.tiktok||"";openModal("profileModal")}
function shareProfile(){const url=`${location.origin}${location.pathname}#profile-${currentProfile.username}`;navigator.clipboard?.writeText(url);toast("Profile link copied.")}

async function searchUsers(){
 if(!currentUser){document.getElementById("userResults").innerHTML='<p class="muted">Log in to find people.</p>';return}
 const q=document.getElementById("userSearch").value.trim();if(q.length<2){document.getElementById("userResults").innerHTML='<p class="muted">Type at least 2 characters.</p>';return}
 const {data,error}=await sb.from("profiles").select("id,username,bio,avatar_url").ilike("username",`%${q}%`).neq("id",currentUser.id).limit(12);
 if(error){document.getElementById("userResults").innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`;return}
 document.getElementById("userResults").innerHTML=data.length?data.map(p=>`<div class="user-card"><div class="avatar">${p.avatar_url?`<img src="${escapeHtml(p.avatar_url)}">`:escapeHtml(p.username[0].toUpperCase())}</div><div><b>@${escapeHtml(p.username)}</b><small>${escapeHtml(p.bio||"AnimeBox user")}</small></div><button onclick="sendFriendRequest('${p.id}')">Add friend</button></div>`).join(""):'<p class="muted">No users found.</p>';
}
async function sendFriendRequest(friendId){const {error}=await sb.from("friendships").insert({requester_id:currentUser.id,addressee_id:friendId,status:"pending"});if(error)toast(error.code==="23505"?"Friend request already exists.":error.message);else toast("Friend request sent.")}
async function loadFriends(){
 const friendListEl=friendListEl; if(!friendListEl)return;
 const {data,error}=await sb.from("friendships").select("id,requester_id,addressee_id,status,requester:profiles!friendships_requester_id_fkey(username,avatar_url),addressee:profiles!friendships_addressee_id_fkey(username,avatar_url)").or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`);
 if(error){friendListEl.innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`;return}
 const accepted=data.filter(f=>f.status==="accepted");document.getElementById("statFriends").textContent=accepted.length;
 const pending=data.filter(f=>f.status==="pending"&&f.addressee_id===currentUser.id);
 friendListEl.innerHTML=(pending.map(f=>`<div class="friend-row">@${escapeHtml(f.requester.username)} <button class="btn light" onclick="acceptFriend('${f.id}')">Accept</button></div>`).join(""))+(accepted.map(f=>{const p=f.requester_id===currentUser.id?f.addressee:f.requester;return `<div class="friend-row" onclick="openChat('${p.username}','${p.id}')">@${escapeHtml(p.username)}</div>`}).join(""))||'<p class="muted">No friends yet.</p>';
}
async function acceptFriend(id){const {error}=await sb.from("friendships").update({status:"accepted"}).eq("id",id).eq("addressee_id",currentUser.id);if(error)toast(error.message);else{toast("Friend added.");await loadFriends()}}
async function loadActivity(){
 const activityEl=activityEl; if(!activityEl)return;
 const {data:friends}=await sb.from("friendships").select("requester_id,addressee_id").eq("status","accepted").or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`);
 const ids=(friends||[]).map(f=>f.requester_id===currentUser.id?f.addressee_id:f.requester_id);
 if(!ids.length){activityEl.innerHTML='<p class="muted">Add friends to see their activity.</p>';return}
 const {data}=await sb.from("reviews").select("*,profiles(username,avatar_url)").in("user_id",ids).order("created_at",{ascending:false}).limit(20);
 activityEl.innerHTML=(data||[]).map(r=>`<div class="feed-item"><div class="avatar">${r.profiles?.avatar_url?`<img src="${escapeHtml(r.profiles.avatar_url)}">`:escapeHtml(r.profiles?.username?.[0]?.toUpperCase()||"?")}</div><div><b>@${escapeHtml(r.profiles?.username||"user")}</b> reviewed <b>${escapeHtml(r.anime_title)}</b><div>${stars(Number(r.rating))}</div><small>${escapeHtml(r.text.slice(0,180))}${r.text.length>180?"…":""}</small></div><small>${new Date(r.created_at).toLocaleDateString()}</small></div>`).join("")||'<p class="muted">No recent reviews.</p>';
}

async function openChat(username,id){
 currentChatUser={id,username};document.getElementById("chatHeader").textContent=`@${username}`;document.getElementById("messageInput").disabled=false;document.querySelector("#messageForm button").disabled=false;await loadMessages();
 if(currentMessagesChannel)await sb.removeChannel(currentMessagesChannel);
 currentMessagesChannel=sb.channel("messages:"+[currentUser.id,id].sort().join("-")).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},payload=>{if(payload.new.sender_id===id||payload.new.receiver_id===id)loadMessages()}).subscribe();
}
async function loadMessages(){
 if(!currentChatUser)return;
 const {data,error}=await sb.from("messages").select("*").or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${currentChatUser.id}),and(sender_id.eq.${currentChatUser.id},receiver_id.eq.${currentUser.id})`).order("created_at",{ascending:true});
 if(error){document.getElementById("chatMessages").innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`;return}
 document.getElementById("chatMessages").innerHTML=(data||[]).map(m=>`<div class="bubble ${m.sender_id===currentUser.id?"me":""}">${escapeHtml(m.message)}</div>`).join("")||'<p class="muted">No messages yet.</p>';
 const box=document.getElementById("chatMessages");box.scrollTop=box.scrollHeight;
}
async function sendMessage(e){
 e.preventDefault();if(!currentChatUser)return;const input=document.getElementById("messageInput"),message=input.value.trim();if(!message)return;
 const {error}=await sb.from("messages").insert({sender_id:currentUser.id,receiver_id:currentChatUser.id,message});
 if(error)toast(error.message);else{input.value="";await loadMessages()}
}
async function requestPasswordReset(){if(!currentUser)return;const {error}=await sb.auth.resetPasswordForEmail(currentUser.email,{redirectTo:location.origin+location.pathname});toast(error?error.message:"Password reset email sent.")}

async function requestUsernameChange(){
 const area=document.getElementById("securityArea");
 area.innerHTML='<label>New username</label><input id="newUsername" pattern="[A-Za-z0-9_]{3,20}" maxlength="20"><button class="btn dark full" onclick="changeUsername()">Send verification email</button>';
}
async function changeUsername(){
 const u=document.getElementById("newUsername").value.trim().toLowerCase();if(!/^[a-z0-9_]{3,20}$/.test(u)){toast("Invalid username.");return}
 const {data:existing}=await sb.from("profiles").select("id").eq("username",u).maybeSingle();if(existing){toast("Username is already taken.");return}
 const {error}=await sb.auth.updateUser({data:{pending_username:u}});if(error){toast(error.message);return}
 toast("A verification email should be used before applying this change. For production, implement a server-side verified change flow.");
}

renderAnime();loadSession();sb.auth.onAuthStateChange((_event)=>loadSession());


function setActiveNav(){
 const page=document.body.dataset.page||location.pathname.split("/").pop()||"index.html";
 document.querySelectorAll(".topbar nav a[data-page]").forEach(a=>a.classList.toggle("active",a.dataset.page===page));
}
setActiveNav();
