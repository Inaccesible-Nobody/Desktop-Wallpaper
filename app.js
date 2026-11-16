(() => {
  const $ = (s) => document.querySelector(s);
  const room = $('#room');
  const player = $('#player');
  const frame = $('#spotifyFrame');
  const cassettes = [...document.querySelectorAll('.cassette')];
  const playlists = Array.isArray(window.LISTENING_ROOM_PLAYLISTS) ? window.LISTENING_ROOM_PLAYLISTS : [];
  let active = -1;
  let playing = false;
  let hintTimer;

  function say(message) {
    const el = $('#hint');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function spotifyEmbed(raw) {
    try {
      const url = new URL(raw.trim());
      if (!/(^|\.)spotify\.com$/i.test(url.hostname)) return '';
      const match = url.pathname.match(/\/(playlist|album|track|artist|episode|show)\/([A-Za-z0-9]+)/);
      return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0` : '';
    } catch { return ''; }
  }

  function setPlaying(value) {
    playing = value;
    room.classList.toggle('is-playing', value);
  }

  function playCassette(index) {
    const url = playlists[index];
    if (!url || !url.trim()) {
      say(`Add a Spotify URL to Cassette ${index + 1} in playlists.js`);
      return;
    }
    const embed = spotifyEmbed(url);
    if (!embed) {
      say(`Cassette ${index + 1} needs a valid Spotify playlist URL`);
      return;
    }
    active = index;
    cassettes.forEach((el, i) => el.classList.toggle('selected', i === index));
    frame.src = embed;
    player.hidden = false;
    $('#playerTitle').textContent = `CASSETTE ${index + 1} · NOW PLAYING`; 
    setPlaying(true);
  }

  cassettes.forEach((el, index) => {
    el.addEventListener('click', () => playCassette(index));
    el.draggable = true;
    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/cassette-index', String(index));
      e.dataTransfer.effectAllowed = 'copy';
    });
  });

  // Drag a cassette onto the boombox to load its playlist.
  const boombox = $('#boomboxHit');
  boombox.addEventListener('dragover', e => { e.preventDefault(); });
  boombox.addEventListener('drop', e => {
    e.preventDefault();
    const index = Number(e.dataTransfer.getData('text/cassette-index'));
    if (Number.isInteger(index)) playCassette(index);
  });
  boombox.addEventListener('click', () => {
    if (active >= 0 && !player.hidden) player.hidden = true;
    else if (active >= 0) player.hidden = false;
    else say('Choose a cassette on the wall to load its playlist');
  });

  $('#lampToggle').addEventListener('click', () => {
    room.classList.toggle('lamp-on');
    say(room.classList.contains('lamp-on') ? 'Lamp on' : 'Lamp off');
  });
  $('#onAirHit').addEventListener('click', () => {
    if (playing) {
      frame.src = '';
      setPlaying(false);
      cassettes.forEach(el => el.classList.remove('selected'));
      active = -1;
      player.hidden = true;
      say('Playback stopped');
    } else if (active >= 0) {
      player.hidden = false;
      say('Use the Spotify player controls to resume playback');
    } else {
      say('Choose a cassette to start listening');
    }
  });
  function stop() {
    frame.src = '';
    player.hidden = true;
    setPlaying(false);
    cassettes.forEach(el => el.classList.remove('selected'));
    active = -1;
  }
  $('#stopPlayback').addEventListener('click', stop);
  $('#closePlayer').addEventListener('click', () => { player.hidden = true; });

  // Persistent, blank-by-default to-do note.
  const todo = $('#todo');
  try { todo.value = localStorage.getItem('listening-room-todo') || ''; } catch {}
  todo.addEventListener('input', () => {
    try { localStorage.setItem('listening-room-todo', todo.value); } catch {}
  });

  function updateTime() {
    const now = new Date();
    const h = now.getHours() % 12 || 12;
    const next = h % 12 + 1;
    const n = ['twelve','one','two','three','four','five','six','seven','eight','nine','ten','eleven'];
    const mins = now.getMinutes();
    let text;
    if (mins < 5) text = `It's just after ${n[h % 12]}`;
    else if (mins < 10) text = `It's five past ${n[h % 12]}`;
    else if (mins < 15) text = `It's ten past ${n[h % 12]}`;
    else if (mins < 20) text = `It's a quarter past ${n[h % 12]}`;
    else if (mins < 25) text = `It's twenty past ${n[h % 12]}`;
    else if (mins < 30) text = `It's twenty-five past ${n[h % 12]}`;
    else if (mins < 35) text = `It's half past ${n[h % 12]}`;
    else if (mins < 40) text = `It's twenty-five to ${n[next % 12]}`;
    else if (mins < 45) text = `It's twenty to ${n[next % 12]}`;
    else if (mins < 50) text = `It's a quarter to ${n[next % 12]}`;
    else if (mins < 55) text = `It's ten to ${n[next % 12]}`;
    else text = `It's five to ${n[next % 12]}`;
    $('#fuzzyTime').textContent = text;
    $('#dateLine').textContent = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();
    $('#month').textContent = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    $('#day').textContent = String(now.getDate()).padStart(2, '0');
    $('#weekday').textContent = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  }
  updateTime();
  setInterval(updateTime, 30000);
})();
