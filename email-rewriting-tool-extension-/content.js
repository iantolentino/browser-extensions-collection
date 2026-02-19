// Detect Gmail compose box
function injectRewriterButton() {
  const composeBox = document.querySelector('[aria-label="Message Body"]');
  if (!composeBox || document.querySelector("#ai-rewriter-btn")) return;

  const toolbar = composeBox.closest(".aoI")?.querySelector(".aDh");
  if (!toolbar) return;

  const btn = document.createElement("button");
  btn.id = "ai-rewriter-btn";
  btn.innerText = "✨ Rewrite";
  btn.style = `
    background:#1a73e8;color:#fff;border:none;
    border-radius:6px;padding:4px 10px;margin-left:8px;
    cursor:pointer;font-size:12px;
  `;

  toolbar.appendChild(btn);

  btn.addEventListener("click", async () => {
    const text = composeBox.innerText;
    const tone = localStorage.getItem("tone") || "formal";
    btn.disabled = true;
    btn.innerText = "⏳ Rewriting...";

    try {
      const res = await fetch("http://127.0.0.1:8000/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone })
      });
      const data = await res.json();
      composeBox.innerText = data.rewritten;
      btn.innerText = "✅ Done!";
    } catch (err) {
      btn.innerText = "❌ Error";
      console.error(err);
    }

    setTimeout(() => {
      btn.innerText = "✨ Rewrite";
      btn.disabled = false;
    }, 2000);
  });
}

setInterval(injectRewriterButton, 2000);
