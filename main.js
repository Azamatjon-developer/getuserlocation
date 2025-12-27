const btn = document.getElementById('loadBtn');
const gpsBtn = document.getElementById('gpsBtn');
const statusEl = document.getElementById('status');
const mapFrame = document.getElementById('mapFrame');
const openMaps = document.getElementById('openMaps');
const copyIpBtn = document.getElementById('copyIp');

const ipEl = document.getElementById('ip');
const hostnameEl = document.getElementById('hostname');
const countryEl = document.getElementById('country');
const regionEl = document.getElementById('region');
const cityEl = document.getElementById('city');
const coordsEl = document.getElementById('coords');
const postalEl = document.getElementById('postal');
const tzEl = document.getElementById('tz');
const localTimeEl = document.getElementById('localTime');
const orgEl = document.getElementById('org');
const ipTypeEl = document.getElementById('ipType');
const flagEl = document.getElementById('flag');

statusEl.textContent = '“Joylashuvni ko‘rsat” tugmasini bosing.';

btn.addEventListener('click', loadIpInfo);

gpsBtn.addEventListener('click', useGPS);

copyIpBtn.addEventListener('click', async () => {
  const ip = ipEl.textContent.trim();
  if (!ip || ip === '—') return;
  try {
    await navigator.clipboard.writeText(ip);
    toast('IP copied ✅');
  } catch {
    toast('Copy failed');
  }
});

async function loadIpInfo(){
  statusEl.textContent = 'Yuklanmoqda...';
  try{
    const res = await fetch('https://ipinfo.io/json');
    if(!res.ok) throw new Error('HTTP '+res.status);
    const d = await res.json();
    console.log(d)

    const [lat, lon] = (d.loc || '').split(',').map(Number);

    ipEl.textContent = d.ip ?? '—';
    hostnameEl.textContent = d.hostname || '—';
    countryEl.textContent = d.country || '—';
    flagEl.textContent = codeToFlagEmoji(d.country);
    regionEl.textContent = d.region || '—';
    cityEl.textContent = d.city || '—';
    coordsEl.textContent = d.loc ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : '—';
    postalEl.textContent = d.postal || '—';
    tzEl.textContent = d.timezone || '—';
    localTimeEl.textContent = d.timezone ? new Date().toLocaleString('en-GB', { timeZone: d.timezone }) : '—';
    orgEl.textContent = d.org || '—';
    ipTypeEl.textContent = (d.anycast ? 'Anycast' : 'Unicast') + (d.bogon ? ' (Bogon)' : '');

    // Xarita va havola
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      setMap(lat, lon);
    } else {
      mapFrame.src = '';
      openMaps.href = '#';
    }

    statusEl.textContent = 'Tayyor ✅ (IP asosida taxminiy joylashuv)';
  }catch(err){
    console.error(err);
    statusEl.textContent = 'Xatolik: ma’lumot olinmadi.';
  }
}

function useGPS(){
  if (!('geolocation' in navigator)) {
    toast('Geolocation mavjud emas');
    return;
  }
  statusEl.textContent = 'GPS so‘rov yuborildi...';
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude, accuracy } = pos.coords;
      coordsEl.textContent = `${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${Math.round(accuracy)} m)`;
      setMap(latitude, longitude, 14);
      statusEl.textContent = 'GPS koordinata qo‘llandi ✅';
      openMaps.focus();
    },
    err => {
      console.warn(err);
      statusEl.textContent = 'GPS rad etildi yoki xato.';
    },
    { enableHighAccuracy:true, timeout:10000, maximumAge:30000 }
  );
}

function setMap(lat, lon, zoom = 12){
  const q = `${lat},${lon}`;
  mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&output=embed`;
  openMaps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function codeToFlagEmoji(code=''){
  const up = String(code || '').toUpperCase();
  if (up.length !== 2) return '🏳️';
  const A = 0x1F1E6;
  return String.fromCodePoint(A + up.charCodeAt(0) - 65) +
         String.fromCodePoint(A + up.charCodeAt(1) - 65);
}

function toast(msg){
  statusEl.textContent = msg;
  setTimeout(()=>{ statusEl.textContent = ''; }, 1500);
}



