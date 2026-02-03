const API_URL = "http://127.0.0.1:5000";

document.getElementById("password").addEventListener("input", analyzePassword);

let radarChart;

// ================= PASSWORD ANALYSIS =================
async function analyzePassword() {
    const pwd = document.getElementById("password").value;
    if (!pwd) return;

    const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd })
    });

    const data = await res.json();

    // Update text results
    document.getElementById("scoreText").innerText = `Strength Score: ${data.score}/100`;
    document.getElementById("crackTime").innerText = `Estimated Crack Time: ${data.crack_time}`;
    document.getElementById("breachResult").innerText = data.breach;

    // Update strength bar
    updateStrengthMeter(data.score);

    // Update feedback
    const feedbackList = document.getElementById("feedbackList");
    feedbackList.innerHTML = "";
    data.feedback.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        feedbackList.appendChild(li);
    });

    // Advanced features
    updateRadarChart(data.breakdown);
    simulateCracking(pwd);
    showHeatmap(pwd);
    saveHistory(pwd, data.score);
    runCrackSimulation(pwd); 
}

// ================= CYBER STRENGTH METER =================
function updateStrengthMeter(score) {
    const bar = document.getElementById("strengthBar");
    bar.style.width = score + "%";
    bar.classList.remove("weak", "medium", "strong");

    if (score < 40) bar.classList.add("weak");
    else if (score < 70) bar.classList.add("medium");
    else bar.classList.add("strong");
}

// ================= RADAR CHART =================
function updateRadarChart(breakdown) {
    const canvas = document.getElementById("radarChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const lengthScore = Math.min((breakdown.length / 5) * 5, 5);
    const symbolScore = Math.min((breakdown.symbols / 2) * 5, 5);

    const chartData = {
        labels: ["Length", "Symbols", "Entropy", "Uniqueness"],
        datasets: [{
            label: "Password Breakdown",
            data: [
                lengthScore,
                symbolScore,
                breakdown.entropy,
                breakdown.uniqueness
            ],
            backgroundColor: "rgba(34,211,238,0.2)",
            borderColor: "#22d3ee",
            borderWidth: 2,
            pointBackgroundColor: "#22d3ee"
        }]
    };

    if (radarChart) radarChart.destroy();

    radarChart = new Chart(ctx, {
        type: "radar",
        data: chartData,
        options: {
            responsive: true,
            animation: { duration: 800 },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { stepSize: 1 }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// ================= CRACK SIMULATION =================
function simulateCracking(password) {
    const simBox = document.getElementById("crackSimulation");
    if (!simBox) return;

    simBox.innerHTML = "Simulating brute-force attack...<br>";
    const attempts = ["123456", "password", "admin123", "qwerty", "letmein", password];

    let i = 0;
    const interval = setInterval(() => {
        simBox.innerHTML += attempts[i] + " ❌<br>";
        if (i === attempts.length - 1) {
            simBox.innerHTML += "(Not cracked)<br>";
            clearInterval(interval);
        }
        i++;
    }, 400);
}

// ================= PASSWORD HEATMAP =================
function showHeatmap(password) {
    const heatmap = document.getElementById("heatmap");
    if (!heatmap) return;

    let heatHTML = "";

    for (let char of password) {
        if ("1234567890".includes(char)) heatHTML += `<span style="color:red">${char}</span>`;
        else if ("!@#$%^&*".includes(char)) heatHTML += `<span style="color:lime">${char}</span>`;
        else if (char === char.toUpperCase()) heatHTML += `<span style="color:cyan">${char}</span>`;
        else heatHTML += `<span style="color:orange">${char}</span>`;
    }

    heatmap.innerHTML = heatHTML;
}

// ================= PASSWORD VISIBILITY =================
function togglePassword() {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
}

// ================= THEME TOGGLE =================
function toggleTheme() {
    document.body.classList.toggle("light");
    document.body.classList.toggle("dark");
}

// ================= RANDOM PASSWORD =================
async function generatePassword() {
    const res = await fetch(`${API_URL}/generate`);
    const data = await res.json();
    document.getElementById("password").value = data.password;
    analyzePassword();
}

// ================= AI PASSPHRASE =================
async function generatePassphrase() {
    const res = await fetch(`${API_URL}/generate-passphrase`);
    const data = await res.json();
    document.getElementById("password").value = data.passphrase;
    analyzePassword();
}

// ================= HISTORY STORAGE =================
function saveHistory(password, score) {
    let history = JSON.parse(localStorage.getItem("pwdHistory")) || [];
    history.push({ password, score, time: new Date().toLocaleString() });
    localStorage.setItem("pwdHistory", JSON.stringify(history));
}

function showHistory() {
    let history = JSON.parse(localStorage.getItem("pwdHistory")) || [];
    const box = document.getElementById("historyBox");
    box.innerHTML = "<h4>Recent Checks</h4>";
    history.slice(-5).reverse().forEach(h => {
        box.innerHTML += `<p>${h.time} — Score: ${h.score}/100</p>`;
    });
}

/*-------------------------------------------------------------------*/
async function runCrackSimulation(password) {
  const terminal = document.getElementById("terminal");
  terminal.innerHTML = "";

  function typeLine(text, delay = 140) {
    return new Promise(resolve => {
      setTimeout(() => {
        const line = document.createElement("div");
        line.className = "terminal-line";
        line.textContent = text;
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
        resolve();
      }, delay);
    });
  }

  await typeLine("Initializing breach database scan...");
  await typeLine("Checking in breached passwords...");

  const res = await fetch("http://localhost:5000/leak-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  const data = await res.json();

  if (data.similar.length > 0) {
  await typeLine("MATCH FOUND ⚠️");
  await typeLine("Similar leaked passwords detected:");

  for (let sim of data.similar) {
    await typeLine("➜ " + sim + " ❌", 120);
  }

  await typeLine("Pattern-based password — cracked instantly ❌");

} else {
  await typeLine("No direct match in breach dataset ✅");
  await typeLine("Running brute-force estimation...");
  await typeLine("This password would take YEARS to crack 🔒");
}
}



/*===================================================================*/