/* Record Room — first interactive prototype.
   Add your Spotify playlist URLs using the + add a record button.
   State is saved in localStorage for normal browser use. */
(() => {
  const $ = (selector) => document.querySelector(selector);
  const room = $("#room");
  const recordsEl = $("#records");
  const dialog = $("#playlistDialog");
  const playlistForm = $("#playlistForm");
  const toastEl = $("#toast");

  const LABEL_COLORS = {
    sage: "#b7cfb0", clay: "#d4aa91", butter: "#e2d59b",
    blue: "#a9c5c9", rose: "#d8b4b1"
  };
  const DEFAULT_PLAYLISTS = [
    { id: "01", name: "slow mornings", url: "", mood: "sage", subtitle: "for easing into the day" },
    { id: "02", name: "green noise", url: "", mood: "blue", subtitle: "soft focus, open windows" },
    { id: "03", name: "little detours", url: "", mood: "clay", subtitle: "for going somewhere else" },
    { id: "04", name: "after hours", url: "", mood: "rose", subtitle: "when the day gets quiet" }
  ];
  const safeRead = (key, fallback) => {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  };
  let playlists = safeRead("recordRoom.playlists", DEFAULT_PLAYLISTS);
  let activeId = safeRead("recordRoom.activeId", null);
  let coffee = safeRead("recordRoom.coffee", { date: dateKey(), count: 0 });
  let photoData = safeRead("recordRoom.photo", "");
  let lampOn = safeRead("recordRoom.lamp", false);
  let reminder = safeRead("recordRoom.reminder", $("#reminderText").value);

  function dateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  }
  function persist() {
    localStorage.setItem("recordRoom.playlists", JSON.stringify(playlists));
    localStorage.setItem("recordRoom.activeId", JSON.stringify(activeId));
    localStorage.setItem("recordRoom.coffee", JSON.stringify(coffee));
    localStorage.setItem("recordRoom.lamp", JSON.stringify(lampOn));
    localStorage.setItem("recordRoom.reminder", JSON.stringify(reminder));
    localStorage.setItem("recordRoom.photo", JSON.stringify(photoData));
  }
  let toastTimer;
  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[ch]));
  }
  function spotifyPlaylistId(url) {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      if (!parsed.hostname.includes("spotify.com")) return "";
      const match = parsed.pathname.match(/playlist\/([a-zA-Z0-9]+)/);
      return match ? match[1] : "";
    } catch { return ""; }
  }

  function renderRecords() {
    recordsEl.innerHTML = "";
    playlists.forEach((playlist, index) => {
      const card = document.createElement("div");
      card.className = "record-card";
      card.draggable = true;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Play ${playlist.name}`);
      card.dataset.id = playlist.id;
      card.style.setProperty("--sleeve", LABEL_COLORS[playlist.mood] || LABEL_COLORS.sage);
      card.innerHTML = `
        <div class="sleeve">
          <div class="sleeve-art"></div><div class="mini-vinyl"></div>
          <span class="record-index">${String(index+1).padStart(2,"0")}</span>
          <span class="record-title">${escapeHtml(playlist.name)}</span>
        </div>
        <span class="record-meta">${escapeHtml(playlist.subtitle || "a playlist for now")}</span>`;
      card.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", playlist.id);
        event.dataTransfer.effectAllowed = "copy";
        card.classList.add("dragging");
      });
      card.addEventListener("dragend", () => card.classList.remove("dragging"));
      card.addEventListener("click", () => loadRecord(playlist.id));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); loadRecord(playlist.id); }
      });
      recordsEl.appendChild(card);
    });
  }

  function loadRecord(id) {
    const playlist = playlists.find(item => item.id === id);
    if (!playlist) return;
    activeId = id;
    $("#activeVinyl").style.setProperty("--label-color", LABEL_COLORS[playlist.mood] || LABEL_COLORS.sage);
    $("#activeLabel").innerHTML = `<span>${escapeHtml(playlist.name).replace(/\s+/g,"<br>")}</span>`;
    $("#activeVinyl").classList.add("spinning");
    $("#tonearm").classList.add("playing");
    $("#turntable").classList.add("is-playing");
    $("#playerStatus").textContent = "record in rotation";
    $("#nowPlayingTitle").textContent = playlist.name;
    $("#nowPlayingSubtitle").textContent = playlist.subtitle || "your selected playlist";
    $("#ejectBtn").disabled = false;
    const idFromUrl = spotifyPlaylistId(playlist.url);
    if (idFromUrl) {
      $("#spotifyFrame").src = `https://open.spotify.com/embed/playlist/${idFromUrl}?utm_source=generator&theme=0`;
      $("#spotifyWrap").hidden = false;
    } else {
      $("#spotifyFrame").src = "";
      $("#spotifyWrap").hidden = true;
      toast("Record on the player. Add a Spotify URL to hear it here.");
    }
    persist();
  }
  function ejectRecord() {
    activeId = null;
    $("#activeVinyl").classList.remove("spinning");
    $("#tonearm").classList.remove("playing");
    $("#turntable").classList.remove("is-playing");
    $("#activeLabel").innerHTML = "<span>DROP<br>RECORD</span>";
    $("#nowPlayingTitle").textContent = "Nothing just yet";
    $("#nowPlayingSubtitle").textContent = "Choose a record from the wall above.";
    $("#playerStatus").textContent = "waiting for a record";
    $("#ejectBtn").disabled = true;
    $("#spotifyFrame").src = "";
    $("#spotifyWrap").hidden = true;
    persist();
  }
  $("#turntable").addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    room.classList.add("is-drag-over");
  });
  $("#turntable").addEventListener("dragleave", (event) => {
    if (!$("#turntable").contains(event.relatedTarget)) room.classList.remove("is-drag-over");
  });
  $("#turntable").addEventListener("drop", (event) => {
    event.preventDefault();
    room.classList.remove("is-drag-over");
    const id = event.dataTransfer.getData("text/plain");
    if (id) loadRecord(id);
  });
  $("#ejectBtn").addEventListener("click", ejectRecord);
  $("#hideSpotifyBtn").addEventListener("click", () => { $("#spotifyWrap").hidden = true; });

  $("#addPlaylistBtn").addEventListener("click", () => {
    playlistForm.reset();
    dialog.showModal();
    $("#playlistName").focus();
  });
  playlistForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#playlistName").value.trim();
    const url = $("#playlistUrl").value.trim();
    const mood = $("#playlistMood").value;
    if (!name) return;
    if (url && !spotifyPlaylistId(url)) {
      toast("That doesn't look like a Spotify playlist URL.");
      return;
    }
    const item = { id: `p${Date.now()}`, name, url, mood, subtitle: url ? "spotify playlist" : "add a link when ready" };
    playlists.push(item);
    persist();
    renderRecords();
    dialog.close();
    toast("A new record joined the collection.");
  });

  // Real-time clock and flip-calendar face
  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    $("#clockHours").textContent = String((hours % 12) || 12).padStart(2, "0");
    $("#clockMinutes").textContent = String(now.getMinutes()).padStart(2, "0");
    $("#clockPeriod").textContent = hours >= 12 ? "PM" : "AM";
    const weekdays = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    $("#clockDate").textContent = `${weekdays[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]}`;
    $("#calendarDay").textContent = String(now.getDate()).padStart(2, "0");
    $("#calendarMonth").textContent = months[now.getMonth()];
    $("#calendarWeekday").textContent = weekdays[now.getDay()];
    $("#coffeeDate").textContent = `${now.getDate()} ${months[now.getMonth()]}`;
    if (coffee.date !== dateKey(now)) {
      coffee = { date: dateKey(now), count: 0 };
      renderCoffee();
      persist();
      toast("A new day. Coffee counter reset.");
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Lamp changes the overall colour temperature.
  function setLamp(value) {
    lampOn = value;
    room.classList.toggle("lamp-on", lampOn);
    $(".lamp-object").classList.toggle("on", lampOn);
    $("#lampState").textContent = lampOn ? "ON" : "OFF";
    persist();
  }
  $("#lampToggle").addEventListener("click", () => setLamp(!lampOn));

  // Reminder: editable note saves as the user types.
  $("#reminderText").value = reminder;
  $("#reminderText").readOnly = true;
  $("#editNoteBtn").addEventListener("click", () => {
    const textarea = $("#reminderText");
    textarea.readOnly = !textarea.readOnly;
    $("#editNoteBtn").textContent = textarea.readOnly ? "EDIT" : "DONE";
    if (!textarea.readOnly) textarea.focus();
    else { reminder = textarea.value; persist(); toast("Field note pinned."); }
  });
  $("#reminderText").addEventListener("input", () => { reminder = $("#reminderText").value; persist(); });

  // Polaroid: keep the chosen image in browser storage for this prototype.
  function renderPhoto() {
    if (photoData) {
      $("#polaroidImage").src = photoData;
      $("#polaroidImage").hidden = false;
      $("#photoPlaceholder").hidden = true;
    }
  }
  renderPhoto();
  $("#photoUploadBtn").addEventListener("click", () => $("#photoInput").click());
  $("#photoInput").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      toast("Choose an image under 1.5 MB for this first version.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      photoData = reader.result;
      renderPhoto();
      persist();
      toast("A little memory, pinned in place.");
    };
    reader.readAsDataURL(file);
  });
  $("#photoCaption").value = safeRead("recordRoom.photoCaption", "somewhere, sometime");
  $("#photoCaption").addEventListener("input", () => localStorage.setItem("recordRoom.photoCaption", JSON.stringify($("#photoCaption").value)));

  // Coffee counter. Each local date starts at zero; the check also runs when the wallpaper reopens.
  function renderCoffee() {
    $("#coffeeCount").textContent = coffee.count;
    const stack = $("#cupStack");
    stack.innerHTML = "";
    const visible = Math.min(coffee.count, 8);
    for (let i = 0; i < visible; i++) {
      const cup = document.createElement("span");
      cup.className = "cup";
      cup.title = `Cup ${i+1}`;
      stack.appendChild(cup);
    }
    if (coffee.count > 8) {
      const extra = document.createElement("span");
      extra.className = "cup-overflow";
      extra.textContent = `+${coffee.count - 8}`;
      stack.appendChild(extra);
    }
    $("#undoCoffeeBtn").disabled = coffee.count === 0;
  }
  $("#addCoffeeBtn").addEventListener("click", () => {
    if (coffee.date !== dateKey()) coffee = { date: dateKey(), count: 0 };
    coffee.count += 1;
    renderCoffee();
    persist();
    toast(coffee.count === 1 ? "First cup of the day." : "Cup added to the stack.");
  });
  $("#undoCoffeeBtn").addEventListener("click", () => {
    coffee.count = Math.max(0, coffee.count - 1);
    renderCoffee(); persist();
  });
  renderCoffee();

  // Daily tidy-up: return the record, reset the coffee count, keep personal objects.
  $("#tidyBtn").addEventListener("click", () => {
    ejectRecord();
    coffee = { date: dateKey(), count: 0 };
    renderCoffee(); persist();
    toast("The room is tidy. Your memories and notes stayed put.");
  });

  // Restore initial state.
  setLamp(lampOn);
  renderRecords();
  if (activeId && playlists.some(item => item.id === activeId)) loadRecord(activeId);
})();
