let allPGs = [];
let map;

// =======================
// 🔥 FIREBASE SETUP
// =======================
const firebaseConfig = {
  apiKey: "AIzaSyCXe8N12h0vncGfQrD3_bf0bgteQTsgpms",
  authDomain: "roommatefinder2.firebaseapp.com",
  projectId: "roommatefinder2",
  storageBucket: "roommatefinder2.appspot.com",
  messagingSenderId: "862492867866",
  appId: "1:862492867866:web:d17c64ef0f1ae0348740a3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// =======================
// 🧪 TEST FIREBASE
// =======================
function testFirebase() {
  db.collection("test").add({
    message: "Connected ✅",
    time: new Date()
  })
  .then(() => alert("Firebase Working ✅"))
  .catch(err => alert(err.message));
}

// =======================
// 🌗 THEME
// =======================
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

function loadTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
}

// =======================
// 🔗 NAVIGATION
// =======================
function goToHome() {
  window.location.href = "index.html";
}

function goToProfile() {
  window.location.href = "profile.html";
}

function goToRegister() {
  window.location.href = "register.html";
}

// =======================
// 👤 CURRENT USER HELPERS
// =======================
function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("userData")) || null;
}

function getCurrentUserName() {
  const user = getLoggedInUser();
  return user?.name || user?.contact || "Anonymous User";
}

// =======================
// 📝 REGISTER
// =======================
function register() {
  const nameEl = document.getElementById("fullName");
  const contactEl = document.getElementById("contact");
  const passEl = document.getElementById("password");

  if (!nameEl || !contactEl || !passEl) return;

  const name = nameEl.value.trim();
  const contact = contactEl.value.trim();
  const pass = passEl.value.trim();

  if (!name || !contact || !pass) {
    alert("Fill all fields");
    return;
  }

  const existingUser = JSON.parse(localStorage.getItem("userData"));

  if (existingUser && existingUser.contact === contact) {
    alert("User already exists! Please login instead 🔐");
    return;
  }

  localStorage.setItem("userData", JSON.stringify({ name, contact, pass }));
  alert("Registered ✅");
  window.location.href = "profile.html";
}

// =======================
// 🔐 LOGIN
// =======================
function login() {
  const contactEl = document.getElementById("loginContact");
  const passEl = document.getElementById("loginPass");

  if (!contactEl || !passEl) return;

  const contact = contactEl.value.trim();
  const pass = passEl.value.trim();

  const user = JSON.parse(localStorage.getItem("userData"));

  if (user && user.contact === contact && user.pass === pass) {
    alert("Login Success 🎉");
    window.location.href = "profile.html";
  } else {
    alert("Invalid Credentials ❌");
  }
}

function logout() {
  localStorage.removeItem("userData");
  alert("Logged out ✅");
  window.location.href = "register.html";
}

// =======================
// 🏠 ADD PG (FIREBASE)
// =======================
function addPG() {
  const nameEl = document.getElementById("pgName");
  const locationEl = document.getElementById("pgLocation");
  const addressEl = document.getElementById("pgAddress");
  const rentEl = document.getElementById("pgRent");
  const genderEl = document.getElementById("pgGender");
  const contactEl = document.getElementById("pgContact");
  const sharingEl = document.getElementById("pgSharing");
  const imagesEl = document.getElementById("pgImages");

  if (!nameEl || !locationEl || !addressEl || !rentEl || !genderEl || !contactEl || !sharingEl || !imagesEl) {
    alert("Some PG fields are missing");
    return;
  }

  const name = nameEl.value.trim();
  const location = locationEl.value.trim();
  const address = addressEl.value.trim();
  const rent = rentEl.value.trim();
  const gender = genderEl.value;
  const contact = contactEl.value.trim().replace(/\s+/g, "");
  const sharing = sharingEl.value;
  const imagesInput = imagesEl.value.trim();

  if (!name || !location || !address || !rent || !contact || !imagesInput) {
    alert("Fill all fields");
    return;
  }

  const loggedInUser = getLoggedInUser();
  const ownerName = loggedInUser?.name || "PG Owner";
  const ownerEmailOrPhone = loggedInUser?.contact || "";

  const images = imagesInput
    .split(",")
    .map(img => img.trim())
    .filter(img => img !== "");

  if (images.length === 0) {
    alert("Please enter at least one image URL");
    return;
  }

  db.collection("pgs").add({
    name,
    location,
    address,
    rent,
    gender,
    contact,
    sharing,
    images,
    ownerName,
    ownerEmailOrPhone,
    createdAt: new Date()
  })
  .then(() => {
    alert("PG Added ✅");

    nameEl.value = "";
    locationEl.value = "";
    addressEl.value = "";
    rentEl.value = "";
    genderEl.value = "Any";
    contactEl.value = "";
    sharingEl.value = "Single";
    imagesEl.value = "";

    loadPG();
  })
  .catch(err => alert(err.message));
}

// =======================
// 📥 LOAD PG (FIREBASE)
// =======================
function loadPG() {
  const container = document.getElementById("pgList");
  if (!container) return;

  container.innerHTML = "Loading...";

  db.collection("pgs")
    .orderBy("createdAt", "desc")
    .get()
    .then(snapshot => {
      allPGs = [];

      snapshot.forEach(doc => {
        allPGs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      displayPGs(allPGs);
    })
    .catch(err => {
      container.innerHTML = `<p>Error loading PGs: ${err.message}</p>`;
    });
}

function displayPGs(pgs) {
  const container = document.getElementById("pgList");
  if (!container) return;

  container.innerHTML = "";

  if (pgs.length === 0) {
    container.innerHTML = "<p>No matching PGs found.</p>";
    return;
  }

  pgs.forEach(pg => {
    const firstImage = pg.images && pg.images.length > 0 ? pg.images[0] : "";

    container.innerHTML += `
      <div class="card">
        <img src="${firstImage}" alt="${pg.name}" style="width:100%; height:150px; object-fit:cover; border-radius:10px;">
        <h3>${pg.name}</h3>
        <p>📍 ${pg.location}</p>
        <p style="font-size:12px; color:gray;">${pg.address || ""}</p>
        <p>💰 ₹${pg.rent}</p>
        <p>🛏 ${pg.sharing || ""}</p>
        <p>👤 ${pg.gender || ""}</p>
        <p>🙍 Owner: ${pg.ownerName || "PG Owner"}</p>

        <button onclick="viewDetails('${pg.id}')">View</button>
        <button onclick="deletePG('${pg.id}')">Delete</button>
      </div>
    `;
  });
}

// =======================
// 🗑 DELETE PG
// =======================
function deletePG(id) {
  if (confirm("Delete this PG?")) {
    db.collection("pgs").doc(id).delete()
      .then(() => {
        alert("Deleted ✅");
        loadPG();
      })
      .catch(err => alert(err.message));
  }
}

// =======================
// 🔍 SEARCH & FILTER
// =======================
function searchAndFilterPG() {
  const searchText = document.getElementById("search")?.value.toLowerCase().trim() || "";

  const filtered = allPGs.filter(pg => {
    const combinedText = `
      ${pg.name || ""}
      ${pg.location || ""}
      ${pg.address || ""}
      ${pg.gender || ""}
      ${pg.sharing || ""}
      ${pg.rent || ""}
      ${pg.contact || ""}
      ${pg.ownerName || ""}
    `.toLowerCase();

    return combinedText.includes(searchText);
  });

  displayPGs(filtered);
}

// =======================
// 📄 VIEW DETAILS
// =======================
function viewDetails(id) {
  db.collection("pgs").doc(id).get()
    .then(doc => {
      if (!doc.exists) {
        alert("PG not found");
        return;
      }

      localStorage.setItem("selectedPG", JSON.stringify({
        id: doc.id,
        ...doc.data()
      }));

      window.location.href = "pg-details.html";
    })
    .catch(err => alert(err.message));
}

// =======================
// 📄 LOAD DETAILS PAGE
// =======================
function loadDetails() {
  const pg = JSON.parse(localStorage.getItem("selectedPG"));
  const div = document.getElementById("details");

  if (!div) return;

  if (!pg) {
    div.innerHTML = "No data found ❌";
    return;
  }

  let imagesHTML = "";

  if (pg.images && pg.images.length > 0) {
    pg.images.forEach(img => {
      imagesHTML += `
        <img src="${img}" alt="${pg.name}" style="width:100%; margin-bottom:10px; border-radius:10px;">
      `;
    });
  }

  div.innerHTML = `
    ${imagesHTML}
    <h2>${pg.name}</h2>
    <p>📍 ${pg.location}</p>
    <p><strong>Address:</strong> ${pg.address || ""}</p>
    <p>💰 ₹${pg.rent}/month</p>
    <p>👤 ${pg.gender}</p>
    <p>🛏 ${pg.sharing}</p>
    <p><strong>Owner Name:</strong> ${pg.ownerName || "PG Owner"}</p>

    <h3>Contact Owner</h3>
    <p>📞 ${pg.contact}</p>

    <a href="tel:${pg.contact}" onclick="return confirm('Call this owner?')">
      <button class="main-btn">📞 Call Now</button>
    </a>
  `;
}

// =======================
// 💬 PG-SPECIFIC CHAT
// =======================
function handlePGMessageKey(event) {
  if (event.key === "Enter") {
    sendPGMessage();
  }
}

function sendPGMessage() {
  const input = document.getElementById("pgMessageInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) {
    alert("Enter a message");
    return;
  }

  const pg = JSON.parse(localStorage.getItem("selectedPG"));
  if (!pg || !pg.id) {
    alert("PG not found");
    return;
  }

  db.collection("pgChats").add({
    pgId: pg.id,
    ownerName: pg.ownerName || "PG Owner",
    sender: getCurrentUserName(),
    text: text,
    createdAt: new Date()
  })
  .then(() => {
    input.value = "";
  })
  .catch(err => alert(err.message));
}

function loadPGMessages() {
  const chatBox = document.getElementById("pgChatBox");
  if (!chatBox) return;

  const pg = JSON.parse(localStorage.getItem("selectedPG"));
  if (!pg || !pg.id) {
    chatBox.innerHTML = "<p>No PG selected.</p>";
    return;
  }

  const currentUser = getCurrentUserName();

  db.collection("pgChats")
    .orderBy("createdAt", "asc")
    .onSnapshot(snapshot => {
      chatBox.innerHTML = "";

      snapshot.forEach(doc => {
        const msg = doc.data();

        if (msg.pgId !== pg.id) return;

        const isMe = msg.sender === currentUser;

        chatBox.innerHTML += `
          <div class="chat-row ${isMe ? "me" : "other"}">
            <div class="chat-message">${msg.text}</div>
            <div class="chat-meta">
              ${msg.sender} • ${formatTime(msg.createdAt)}
            </div>
          </div>
        `;
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// =======================
// 💬 COMMON CHAT HELPERS
// =======================
function formatTime(dateValue) {
  if (!dateValue) return "";

  let date;
  if (dateValue.toDate) {
    date = dateValue.toDate();
  } else {
    date = new Date(dateValue);
  }

  return date.toLocaleString();
}

// =======================
// 🖼 PROFILE IMAGE PREVIEW
// =======================
document.addEventListener("DOMContentLoaded", function () {
  const profilePic = document.getElementById("profilePic");
  const preview = document.getElementById("preview");

  const savedImage = localStorage.getItem("profileImage");
  if (savedImage && preview) {
    preview.src = savedImage;
    preview.style.display = "block";
  }

  if (profilePic && preview) {
    profilePic.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
        localStorage.setItem("profileImage", e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  typeEffect();
});

// =======================
// 📍 MAP LOCATION
// =======================
function openMap() {
  const mapDiv = document.getElementById("mapContainer");
  const locationInput = document.getElementById("currentLocation");

  if (!mapDiv || !locationInput) {
    alert("Map container or location input not found");
    return;
  }

  if (typeof google === "undefined" || !google.maps) {
    alert("Google Maps script not loaded");
    return;
  }

  mapDiv.style.display = "block";

  const defaultCenter = { lat: 19.0760, lng: 72.8777 };

  if (!map) {
    map = new google.maps.Map(mapDiv, {
      center: defaultCenter,
      zoom: 12
    });

    map.addListener("click", function (e) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ location: { lat, lng } }, function (results, status) {
        if (status === "OK" && results[0]) {
          locationInput.value = results[0].formatted_address;
        } else {
          locationInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
      });
    });
  }

  setTimeout(() => {
    google.maps.event.trigger(map, "resize");
    map.setCenter(defaultCenter);
  }, 200);
}

// =======================
// 💾 PROFILE SAVE
// =======================
function saveProfile() {
  const data = {
    name: document.getElementById("name")?.value.trim() || "",
    age: document.getElementById("age")?.value.trim() || "",
    gender: document.getElementById("gender")?.value || "",
    phone: document.getElementById("phone")?.value.trim() || "",
    email: document.getElementById("email")?.value.trim() || "",

    location: document.getElementById("location")?.value.trim() || "",
    minRent: document.getElementById("minRent")?.value.trim() || "",
    maxRent: document.getElementById("maxRent")?.value.trim() || "",
    roomType: document.getElementById("roomType")?.value || "",

    prefGender: document.getElementById("prefGender")?.value || "",
    ageRange: document.getElementById("ageRange")?.value.trim() || "",
    smoking: document.getElementById("smoking")?.value || "",
    drinking: document.getElementById("drinking")?.value || "",
    food: document.getElementById("food")?.value || "",
    sleep: document.getElementById("sleep")?.value || "",

    occupation: document.getElementById("occupation")?.value || "",
    company: document.getElementById("company")?.value.trim() || "",
    lifestyle: document.getElementById("lifestyle")?.value.trim() || "",
    currentLocation: document.getElementById("currentLocation")?.value.trim() || "",
    idProof: document.getElementById("idProof")?.value || "",
    about: document.getElementById("about")?.value.trim() || ""
  };

  localStorage.setItem("profileData", JSON.stringify(data));
  alert("Profile Saved 💜");
}

function loadSavedProfile() {
  const data = JSON.parse(localStorage.getItem("profileData"));
  if (!data) return;

  if (document.getElementById("name")) document.getElementById("name").value = data.name || "";
  if (document.getElementById("age")) document.getElementById("age").value = data.age || "";
  if (document.getElementById("gender")) document.getElementById("gender").value = data.gender || "";
  if (document.getElementById("phone")) document.getElementById("phone").value = data.phone || "";
  if (document.getElementById("email")) document.getElementById("email").value = data.email || "";

  if (document.getElementById("location")) document.getElementById("location").value = data.location || "";
  if (document.getElementById("minRent")) document.getElementById("minRent").value = data.minRent || "";
  if (document.getElementById("maxRent")) document.getElementById("maxRent").value = data.maxRent || "";
  if (document.getElementById("roomType")) document.getElementById("roomType").value = data.roomType || "";

  if (document.getElementById("prefGender")) document.getElementById("prefGender").value = data.prefGender || "";
  if (document.getElementById("ageRange")) document.getElementById("ageRange").value = data.ageRange || "";
  if (document.getElementById("smoking")) document.getElementById("smoking").value = data.smoking || "";
  if (document.getElementById("drinking")) document.getElementById("drinking").value = data.drinking || "";
  if (document.getElementById("food")) document.getElementById("food").value = data.food || "";
  if (document.getElementById("sleep")) document.getElementById("sleep").value = data.sleep || "";

  if (document.getElementById("occupation")) document.getElementById("occupation").value = data.occupation || "";
  if (document.getElementById("company")) document.getElementById("company").value = data.company || "";
  if (document.getElementById("lifestyle")) document.getElementById("lifestyle").value = data.lifestyle || "";
  if (document.getElementById("currentLocation")) document.getElementById("currentLocation").value = data.currentLocation || "";
  if (document.getElementById("idProof")) document.getElementById("idProof").value = data.idProof || "";
  if (document.getElementById("about")) document.getElementById("about").value = data.about || "";
}

// =======================
// ⌨ TYPING EFFECT
// =======================
const words = ["Roommate 💜", "PG 🏠", "Stay ✨"];
let i = 0;
let j = 0;
let currentWord = "";
let isDeleting = false;

function typeEffect() {
  const typingEl = document.getElementById("typing");
  if (!typingEl) return;

  currentWord = words[i];

  if (isDeleting) {
    j--;
  } else {
    j++;
  }

  typingEl.innerText = currentWord.substring(0, j);

  if (!isDeleting && j === currentWord.length) {
    isDeleting = true;
    setTimeout(typeEffect, 1200);
    return;
  }

  if (isDeleting && j === 0) {
    isDeleting = false;
    i = (i + 1) % words.length;
  }

  setTimeout(typeEffect, isDeleting ? 50 : 100);
}