const WebSocket = require("ws");
const admin = require("firebase-admin");

// IMPORT từ file key Firebase JSON
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://taixiu-official-default-rtdb.firebaseio.com"
});

const db = admin.database();
const socket = new WebSocket("wss://9r7anbk0xgx.cq.hk8jk.com/");
socket.binaryType = "arraybuffer";

socket.onopen = () => {
  console.log("✅ Đã kết nối WebSocket");
};

socket.onmessage = (event) => {
  const buffer = new Uint8Array(event.data);
  const packetType = buffer[0];
  if (packetType >= 0x70 && packetType <= 0x79) {
    try {
      const utf8Str = new TextDecoder().decode(buffer);
      if (utf8Str.includes("mnmdsbgameend")) {
        const match = utf8Str.match(/\{(\d+)-(\d+)-(\d+)\}/);
        if (match) {
          const data = `{${match[1]}-${match[2]}-${match[3]}}`;
          db.ref("taixiu/").push({ data, time: Date.now() });
          console.log("✅ Gửi Firebase:", data);
        }
      }
    } catch (err) {
      console.error("❌ Lỗi:", err);
    }
  }
};
