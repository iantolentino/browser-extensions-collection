const API_URL = "http://127.0.0.1:8000/rewrite/";

const rewriteBtn = document.getElementById("rewriteBtn");
const emailText = document.getElementById("emailText");
const tone = document.getElementById("tone");
const result = document.getElementById("result");
const loading = document.getElementById("loading");

rewriteBtn.addEventListener("click", async () => {
  const text = emailText.value.trim();
  if (!text) {
    alert("Please enter or paste your email text first.");
    return;
  }

  loading.classList.remove("hidden");
  result.value = "";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        tone: tone.value
      })
    });

    const data = await res.json();
    if (data.rewritten) {
      result.value = data.rewritten;
    } else {
      result.value = "❌ Error: " + (data.error || "Unknown error");
    }
  } catch (err) {
    result.value = "⚠️ Network Error: " + err.message;
  }

  loading.classList.add("hidden");
});
