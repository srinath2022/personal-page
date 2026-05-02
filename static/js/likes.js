import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getDatabase, ref, get, runTransaction } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUwGx90psqd48dYZKSDV38OKscnMvGdU4",
  authDomain: "sid-s-personal.firebaseapp.com",
  projectId: "sid-s-personal",
  storageBucket: "sid-s-personal.firebasestorage.app",
  messagingSenderId: "352843531407",
  appId: "1:352843531407:web:8092c436ceab2a06101cfa",
  databaseURL: "https://sid-s-personal-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function getLikedSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem("liked") || "[]"));
  } catch (_) {
    return new Set();
  }
}

function saveLikedSet(s) {
  localStorage.setItem("liked", JSON.stringify([...s]));
}

function waitForCards() {
  return new Promise(function (resolve) {
    function check() {
      if (document.querySelector(".like-btn")) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    }
    check();
  });
}

async function initLikes() {
  await waitForCards();

  var liked = getLikedSet();

  // Mark already-liked buttons
  document.querySelectorAll(".like-btn").forEach(function (btn) {
    if (liked.has(btn.dataset.id)) {
      btn.classList.add("liked");
    }
  });

  // Fetch counts from Firebase
  try {
    var snapshot = await get(ref(db, "likes"));
    var data = snapshot.val() || {};
    document.querySelectorAll(".like-count").forEach(function (el) {
      var id = el.dataset.id;
      if (data[id]) {
        el.textContent = data[id];
      }
    });
  } catch (err) {
    console.error("Firebase read failed:", err);
  }

  // Handle clicks
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".like-btn");
    if (!btn) return;

    var id = btn.dataset.id;
    var liked = getLikedSet();

    if (liked.has(id)) return;

    liked.add(id);
    saveLikedSet(liked);
    btn.classList.add("liked");

    var countRef = ref(db, "likes/" + id);
    runTransaction(countRef, function (current) {
      return (current || 0) + 1;
    }).then(function (result) {
      var countEl = btn.querySelector(".like-count");
      if (countEl) {
        countEl.textContent = result.snapshot.val();
      }
    }).catch(function (err) {
      console.error("Firebase write failed:", err);
    });
  });
}

initLikes();
