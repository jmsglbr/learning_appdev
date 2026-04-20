// UI Rendering Functions

// Navigation between views
function navigateTo(viewName) {
  // Hide all views
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.remove("active");
  });

  // Show selected view
  document.getElementById(`${viewName}View`).classList.add("active");

  // Update nav active state
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
    if (item.getAttribute("data-nav") === viewName) {
      item.classList.add("active");
    }
  });

  // Load specific view data
  if (viewName === "leaderboard") loadLeaderboard();
  if (viewName === "profile") loadProfile();
}

// Initialize navigation
function initNavigation() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const viewName = item.getAttribute("data-nav");
      navigateTo(viewName);
    });
  });
}

// Render rooms grid
async function renderRooms() {
  const grid = document.getElementById("roomsGrid");
  if (!grid) return;

  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .order("order");
  allRooms = rooms || [];

  grid.innerHTML = allRooms
    .map((room) => {
      const roomTasks = userProgress.filter((p) => p.room_id === room.id);
      const completedCount = roomTasks.length;
      const totalTasks = 3; // Each room has 3 tasks
      const percent = (completedCount / totalTasks) * 100;

      return `
            <div class="room-card" onclick="openRoom(${room.id})">
                <div class="room-icon">${room.icon || "📚"}</div>
                <div class="room-title">${room.title}</div>
                <div class="room-desc">${room.description}</div>
                <div class="room-progress">
                    <div class="room-progress-fill" style="width: ${percent}%"></div>
                </div>
                <div class="room-stats">
                    <span>${completedCount}/${totalTasks} tasks</span>
                    <span>${Math.floor(percent)}% complete</span>
                </div>
            </div>
        `;
    })
    .join("");

  // Also render featured rooms for dashboard
  renderFeaturedRooms();
}

// Render featured rooms on dashboard
function renderFeaturedRooms() {
  const featuredContainer = document.getElementById("featuredRooms");
  if (!featuredContainer) return;

  const topRooms = allRooms.slice(0, 3);
  featuredContainer.innerHTML = topRooms
    .map((room) => {
      const roomTasks = userProgress.filter((p) => p.room_id === room.id);
      const completedCount = roomTasks.length;
      const percent = (completedCount / 3) * 100;

      return `
            <div class="room-card" onclick="openRoom(${room.id})">
                <div class="room-icon">${room.icon || "📚"}</div>
                <div class="room-title">${room.title}</div>
                <div class="room-progress">
                    <div class="room-progress-fill" style="width: ${percent}%"></div>
                </div>
                <div class="room-stats">${completedCount}/3 completed</div>
            </div>
        `;
    })
    .join("");
}

// Open a room and show its tasks
async function openRoom(roomId) {
  currentRoom = allRooms.find((r) => r.id === roomId);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("room_id", roomId)
    .order("task_order");

  allTasks = tasks || [];

  // Hide rooms view, show room detail
  document.getElementById("roomsView").classList.remove("active");
  document.getElementById("roomDetailView").classList.add("active");

  const content = document.getElementById("roomDetailContent");
  content.innerHTML = `
        <div class="room-header-detail">
            <h2>${currentRoom.title}</h2>
            <p>${currentRoom.description}</p>
        </div>
        <div id="roomTasksContainer"></div>
    `;

  const tasksContainer = document.getElementById("roomTasksContainer");
  tasksContainer.innerHTML = "";

  for (let task of allTasks) {
    const isCompleted = userProgress.some(
      (p) => p.room_id === roomId && p.task_id === task.id,
    );
    tasksContainer.innerHTML += renderTaskCard(task, isCompleted);
  }

  attachTaskHandlers();
}

// Render individual task card
function renderTaskCard(task, isCompleted) {
  let inputHtml = "";

  if (isCompleted) {
    inputHtml =
      '<div style="color: var(--success);"><i class="fas fa-check-circle"></i> Task completed! Great job.</div>';
  } else if (task.type === "code") {
    inputHtml = `
            <textarea id="answer-${task.id}" class="task-input" rows="4" placeholder="Write your code here..."></textarea>
            <button class="task-btn" onclick="checkTask(${task.id})">Run & Check Code</button>
        `;
  } else if (task.type === "terminal") {
    inputHtml = `
            <input type="text" id="answer-${task.id}" class="task-input" placeholder="Enter your command...">
            <button class="task-btn" onclick="checkTask(${task.id})">Execute Command</button>
        `;
  } else {
    inputHtml = `
            <input type="text" id="answer-${task.id}" class="task-input" placeholder="Type your answer...">
            <button class="task-btn" onclick="checkTask(${task.id})">Submit Answer</button>
        `;
  }

  return `
        <div class="task-card" id="task-${task.id}">
            <div class="task-header">
                <span class="task-title">Task ${task.task_order}: ${task.title}</span>
                <span class="task-status ${isCompleted ? "completed" : ""}">${isCompleted ? "✓ Completed" : "⏳ Pending"}</span>
            </div>
            <div class="task-question">${task.question}</div>
            ${inputHtml}
            <div id="feedback-${task.id}" class="feedback"></div>
        </div>
    `;
}

// Check task answer
async function checkTask(taskId) {
  const task = allTasks.find((t) => t.id === taskId);
  const userAnswer = document
    .getElementById(`answer-${taskId}`)
    .value.trim()
    .toLowerCase();
  const correctAnswer = task.answer.toLowerCase();

  let isCorrect = false;

  if (task.type === "code") {
    // Simple code validation (remove whitespace for comparison)
    const normalizedUser = userAnswer.replace(/\s/g, "");
    const normalizedCorrect = correctAnswer.replace(/\s/g, "");
    isCorrect =
      normalizedUser.includes(normalizedCorrect) ||
      normalizedUser === normalizedCorrect;
  } else {
    isCorrect =
      userAnswer === correctAnswer ||
      (correctAnswer.includes(",") &&
        correctAnswer.split(",").some((a) => userAnswer === a.trim()));
  }

  const feedback = document.getElementById(`feedback-${taskId}`);

  if (isCorrect) {
    // Save progress to Supabase
    const { error } = await supabase.from("user_progress").insert({
      user_id: currentUser.id,
      room_id: currentRoom.id,
      task_id: taskId,
      completed: true,
      completed_at: new Date(),
    });

    if (!error) {
      feedback.className = "feedback success";
      feedback.innerHTML = "✅ Correct! +10 XP!";

      // Update UI
      const statusSpan = document.querySelector(`#task-${taskId} .task-status`);
      statusSpan.className = "task-status completed";
      statusSpan.innerText = "✓ Completed";

      const inputField = document.getElementById(`answer-${taskId}`);
      if (inputField) inputField.disabled = true;

      // Update XP
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", currentUser.id)
        .single();
      const newXP = (profile?.xp || 0) + 10;
      await supabase
        .from("profiles")
        .update({ xp: newXP })
        .eq("id", currentUser.id);

      document.getElementById("sidebarXP").innerText = newXP + " XP";

      // Refresh progress
      await loadProgress();
      await renderRooms();
      await loadDashboardStats();

      showToast("Task completed! +10 XP", "success");
    } else {
      feedback.className = "feedback error";
      feedback.innerHTML = "Error saving progress. Try again.";
    }
  } else {
    feedback.className = "feedback error";
    feedback.innerHTML = `❌ Incorrect. ${task.hint ? `Hint: ${task.hint}` : "Try again!"}`;
  }
}

// Load user progress
async function loadProgress() {
  const { data } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", currentUser.id);
  userProgress = data || [];
}

// Load dashboard stats
async function loadDashboardStats() {
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp")
    .eq("id", currentUser.id)
    .single();
  const xp = profile?.xp || 0;
  const completedTasks = userProgress.length;
  const roomsStarted = new Set(userProgress.map((p) => p.room_id)).size;
  const level = Math.floor(xp / 50) + 1;

  document.getElementById("dashboardXP").innerText = xp;
  document.getElementById("dashboardTasks").innerText = completedTasks;
  document.getElementById("dashboardRooms").innerText = roomsStarted;
  document.getElementById("dashboardLevel").innerText = level;

  // Render recent activity
  const recentTasks = userProgress.slice(-5).reverse();
  const activityContainer = document.getElementById("recentActivity");
  if (activityContainer) {
    activityContainer.innerHTML = recentTasks
      .map(
        (task) => `
            <div class="activity-item">
                <div class="activity-icon">✅</div>
                <div>Completed task in Room ${task.room_id}</div>
                <div style="margin-left: auto; font-size: 12px; color: var(--gray-light);">
                    ${new Date(task.completed_at).toLocaleDateString()}
                </div>
            </div>
        `,
      )
      .join("");
    if (recentTasks.length === 0) {
      activityContainer.innerHTML =
        '<div class="activity-item">No activity yet. Start learning!</div>';
    }
  }
}

// Load leaderboard
async function loadLeaderboard() {
  const { data } = await supabase
    .from("profiles")
    .select("username, xp")
    .order("xp", { ascending: false })
    .limit(10);

  const container = document.getElementById("leaderboardList");
  container.innerHTML = (data || [])
    .map((user, idx) => {
      let rankClass = "";
      let rankIcon = `#${idx + 1}`;
      if (idx === 0) {
        rankClass = "rank-1";
        rankIcon = "🥇";
      } else if (idx === 1) {
        rankClass = "rank-2";
        rankIcon = "🥈";
      } else if (idx === 2) {
        rankClass = "rank-3";
        rankIcon = "🥉";
      }

      return `
            <div class="leaderboard-item">
                <div class="leaderboard-rank ${rankClass}">${rankIcon}</div>
                <div class="leaderboard-avatar">👨‍💻</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${user.username || "Anonymous"}</div>
                    <div class="leaderboard-xp">${user.xp || 0} XP total</div>
                </div>
                <div class="leaderboard-badge">Level ${Math.floor((user.xp || 0) / 50) + 1}</div>
            </div>
        `;
    })
    .join("");
}

// Load profile
async function loadProfile() {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .single();
  const completedTasks = userProgress.length;
  const totalXP = profile?.xp || 0;
  const level = Math.floor(totalXP / 50) + 1;
  const xpToNext = 50 - (totalXP % 50);
  const percentToNext = ((totalXP % 50) / 50) * 100;

  const container = document.getElementById("profileContent");
  container.innerHTML = `
        <div class="profile-card">
            <div class="profile-avatar">${(profile?.username || "U")[0].toUpperCase()}</div>
            <h2>${profile?.username || currentUser.email}</h2>
            <p style="color: var(--gray-light);">Member since ${new Date(currentUser.created_at).toLocaleDateString()}</p>
            
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${percentToNext}%"></div>
            </div>
            <p>${xpToNext} XP to next level</p>
            
            <div style="display: flex; justify-content: space-around; margin-top: 30px;">
                <div><strong>${totalXP}</strong><br>Total XP</div>
                <div><strong>${completedTasks}</strong><br>Tasks Done</div>
                <div><strong>${level}</strong><br>Current Level</div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border);">
                <h3>🏆 Achievements</h3>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    ${completedTasks >= 5 ? '<span style="background: var(--primary); padding: 5px 12px; border-radius: 20px;">🌟 First 5 Tasks</span>' : ""}
                    ${totalXP >= 100 ? '<span style="background: var(--primary); padding: 5px 12px; border-radius: 20px;">💯 100 XP Club</span>' : ""}
                    ${userProgress.length >= 10 ? '<span style="background: var(--primary); padding: 5px 12px; border-radius: 20px;">🚀 10 Tasks Master</span>' : ""}
                </div>
            </div>
        </div>
    `;
}

// Terminal functionality
function initTerminal() {
  const terminalInput = document.getElementById("terminalInput");
  const terminalOutput = document.getElementById("terminalOutput");

  const commands = {
    help: "Available commands: help, clear, git --version, node --version, python --version, npm --version, whoami, date",
    "git --version": "git version 2.39.2",
    "node --version": "v18.17.0",
    "python --version": "Python 3.11.4",
    "npm --version": "9.6.7",
    whoami: "learner@appdev",
    date: new Date().toString(),
    clear: "CLEAR",
  };

  terminalInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const command = terminalInput.value.trim();
      if (!command) return;

      // Add command to output
      terminalOutput.innerHTML += `<div class="terminal-line">$ ${command}</div>`;

      // Process command
      if (commands[command]) {
        if (commands[command] === "CLEAR") {
          terminalOutput.innerHTML = "";
        } else {
          terminalOutput.innerHTML += `<div class="terminal-line">${commands[command]}</div>`;
        }
      } else {
        terminalOutput.innerHTML += `<div class="terminal-line" style="color: #f87171;">Command not found: ${command}. Type 'help' for available commands.</div>`;
      }

      terminalInput.value = "";
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
  });
}

// Back to rooms
document.getElementById("backToRoomsBtn")?.addEventListener("click", () => {
  document.getElementById("roomDetailView").classList.remove("active");
  document.getElementById("roomsView").classList.add("active");
});

// Attach task handlers
function attachTaskHandlers() {
  // Handlers are attached via onclick in HTML
}
