class PerformanceDashboard {
  constructor() {
    this.initializeNavigation()
    this.initializePerformanceMonitoring()
    this.startRealTimeUpdates()
  }

  initializeNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn")
    const pages = document.querySelectorAll(".page")

    navButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const targetPage = e.currentTarget.dataset.page
        this.switchPage(targetPage, navButtons, pages)
        this.createRippleEffect(e)
      })
    })
  }

  switchPage(targetPage, navButtons, pages) {
    // Remove active class from all buttons and pages
    navButtons.forEach((btn) => btn.classList.remove("active"))
    pages.forEach((page) => page.classList.remove("active"))

    // Add active class to clicked button and corresponding page
    const activeButton = document.querySelector(`[data-page="${targetPage}"]`)
    const activePage = document.getElementById(targetPage)

    if (activeButton && activePage) {
      activeButton.classList.add("active")
      activePage.classList.add("active")
    }
  }

  createRippleEffect(e) {
    const ripple = e.currentTarget.querySelector(".btn-ripple")
    if (ripple) {
      ripple.style.animation = "none"
      ripple.offsetHeight // Trigger reflow
      ripple.style.animation = null
    }
  }

  initializePerformanceMonitoring() {
    // Initialize performance data with realistic baseline
    const totalRam = (navigator.deviceMemory && navigator.deviceMemory >= 4) ? navigator.deviceMemory : 16;
    const initialRamUsed = parseFloat((totalRam * 0.44).toFixed(1));

    this.performanceData = {
      disk: { usage: 52, used: 245, free: 231, total: 476 },
      gpu: { usage: 24, temp: 46, memory: 3.2 },
      proc: { usage: 14, cores: navigator.hardwareConcurrency || 8, threads: (navigator.hardwareConcurrency || 8) * 2 },
      ram: { usage: 44, used: initialRamUsed, total: totalRam },
      cpu: { usage: 12, freq: 3.4, temp: 42 },
    }

    this.detectSystemInfo()
  }

  async detectSystemInfo() {
    try {
      if ("navigator" in window) {
        if (navigator.hardwareConcurrency) {
          this.performanceData.proc.cores = navigator.hardwareConcurrency;
          this.performanceData.proc.threads = this.performanceData.proc.cores * 2;
        }

        if (navigator.deviceMemory && navigator.deviceMemory >= 4) {
          this.performanceData.ram.total = navigator.deviceMemory;
          this.performanceData.ram.used = parseFloat((this.performanceData.ram.total * (this.performanceData.ram.usage / 100)).toFixed(1));
        }

        if ("storage" in navigator && "estimate" in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          if (estimate.quota && estimate.usage && estimate.quota > 1024 * 1024 * 1024) {
            this.performanceData.disk.total = Math.round(estimate.quota / (1024 * 1024 * 1024));
            this.performanceData.disk.used = Math.round(estimate.usage / (1024 * 1024 * 1024));
            this.performanceData.disk.free = this.performanceData.disk.total - this.performanceData.disk.used;
            this.performanceData.disk.usage = Math.round(
              (this.performanceData.disk.used / this.performanceData.disk.total) * 100
            );
          }
        }
      }
    } catch (error) {
      console.log("[v0] System info fallback initialized");
    }

    this.updateStaticInfo();
    this.updateUI();
  }

  updateStaticInfo() {
    const pCores = document.getElementById("proc-cores");
    if (pCores) pCores.textContent = `Cores: ${this.performanceData.proc.cores}`;
    const pThreads = document.getElementById("proc-threads");
    if (pThreads) pThreads.textContent = `Threads: ${this.performanceData.proc.threads}`;

    const rTotal = document.getElementById("ram-total");
    if (rTotal) rTotal.textContent = `Total: ${this.performanceData.ram.total} GB`;
  }

  initializeSimulatedData() {
    this.updateStaticInfo();
    this.updateUI();
  }

  startRealTimeUpdates() {
    this.simTimer = setInterval(() => {
      if (window.hasNativeTelemetry) {
        clearInterval(this.simTimer)
        this.simTimer = null
        return
      }
      this.updatePerformanceMetrics()
    }, 2000)
  }

  updatePerformanceMetrics() {
    if (window.hasNativeTelemetry) {
      return; // Real hardware telemetry is streamed from C++ host!
    }

    try {
      this.measureCPUUsage()
      this.measureMemoryUsage()
      this.simulateOtherMetrics()
      this.updateUI()
    } catch (error) {
      this.updateUI()
    }
  }

  measureCPUUsage() {
    const start = performance.now()
    let iterations = 0
    const targetTime = 8

    while (performance.now() - start < targetTime) {
      Math.random() * Math.random()
      iterations++
    }

    const actualTime = performance.now() - start
    const efficiency = targetTime / actualTime
    const estimatedUsage = Math.max(5, Math.min(95, (1 - efficiency) * 100))

    this.performanceData.cpu.usage = Math.round(this.performanceData.cpu.usage * 0.7 + estimatedUsage * 0.3)
    this.performanceData.cpu.temp = Math.round(36 + this.performanceData.cpu.usage * 0.35)
    this.performanceData.cpu.freq = (3.0 + (this.performanceData.cpu.usage * 0.015)).toFixed(1)
  }

  measureMemoryUsage() {
    const ram = this.performanceData.ram;
    if (!ram.total || ram.total < 4) ram.total = 16;
    ram.usage = Math.min(80, Math.max(25, Math.round(ram.usage + (Math.random() - 0.5) * 2)));
    ram.used = parseFloat(((ram.total * ram.usage) / 100).toFixed(1));
  }

  simulateOtherMetrics() {
    // Simulate GPU usage with realistic patterns
    this.performanceData.gpu.usage += (Math.random() - 0.5) * 10
    this.performanceData.gpu.usage = Math.max(20, Math.min(90, this.performanceData.gpu.usage))
    this.performanceData.gpu.usage = Math.round(this.performanceData.gpu.usage)

    // GPU temperature correlates with usage
    this.performanceData.gpu.temp = Math.round(45 + this.performanceData.gpu.usage * 0.5)
    this.performanceData.gpu.memory = (4 + this.performanceData.gpu.usage * 0.05).toFixed(1)

    // Processor usage (different from CPU)
    this.performanceData.proc.usage += (Math.random() - 0.5) * 8
    this.performanceData.proc.usage = Math.max(15, Math.min(85, this.performanceData.proc.usage))
    this.performanceData.proc.usage = Math.round(this.performanceData.proc.usage)

    // Disk usage changes slowly
    if (Math.random() < 0.1) {
      // 10% chance to change
      this.performanceData.disk.usage += (Math.random() - 0.5) * 2
      this.performanceData.disk.usage = Math.max(60, Math.min(95, this.performanceData.disk.usage))
      this.performanceData.disk.usage = Math.round(this.performanceData.disk.usage)

      this.performanceData.disk.used = Math.round(
        (this.performanceData.disk.usage / 100) * this.performanceData.disk.total,
      )
      this.performanceData.disk.free = this.performanceData.disk.total - this.performanceData.disk.used
    }
  }

  simulateAllMetrics() {
    // Fallback simulation for all metrics
    Object.keys(this.performanceData).forEach((key) => {
      if (key !== "disk") {
        // Disk changes slowly
        this.performanceData[key].usage += (Math.random() - 0.5) * 10
        this.performanceData[key].usage = Math.max(10, Math.min(90, this.performanceData[key].usage))
        this.performanceData[key].usage = Math.round(this.performanceData[key].usage)
      }
    })
  }

  updateUI() {
    // Update all performance cards
    Object.keys(this.performanceData).forEach((metric) => {
      const data = this.performanceData[metric]

      // Update percentage value
      const valueElement = document.getElementById(`${metric}-value`)
      if (valueElement) {
        valueElement.textContent = `${data.usage}%`
      }

      // Update progress bar
      const fillElement = document.getElementById(`${metric}-fill`)
      if (fillElement) {
        fillElement.style.width = `${data.usage}%`
      }

      // Update specific details
      this.updateMetricDetails(metric, data)

      // Update status indicator color based on usage
      this.updateStatusIndicator(metric, data.usage)
    })
  }

  updateMetricDetails(metric, data) {
    switch (metric) {
      case "disk":
        const diskUsed = document.getElementById("disk-used")
        const diskFree = document.getElementById("disk-free")
        if (diskUsed) diskUsed.textContent = `Used: ${data.used} GB`
        if (diskFree) diskFree.textContent = `Free: ${data.free} GB`
        break

      case "gpu":
        const gpuTemp = document.getElementById("gpu-temp")
        const gpuMemory = document.getElementById("gpu-memory")
        if (gpuTemp) gpuTemp.textContent = `Temp: ${data.temp}°C`
        if (gpuMemory) {
          if (data.total) {
            gpuMemory.textContent = `VRAM: ${data.memory} / ${data.total} GB`
          } else {
            gpuMemory.textContent = `VRAM: ${data.memory} GB`
          }
        }
        break

      case "ram":
        const ramUsed = document.getElementById("ram-used")
        const ramTotal = document.getElementById("ram-total")
        if (ramUsed) ramUsed.textContent = `Used: ${data.used} GB`
        if (ramTotal && data.total) ramTotal.textContent = `Total: ${data.total} GB`
        break

      case "cpu":
        const cpuFreq = document.getElementById("cpu-freq")
        const cpuTemp = document.getElementById("cpu-temp")
        if (cpuFreq) cpuFreq.textContent = `Freq: ${data.freq} GHz`
        if (cpuTemp) cpuTemp.textContent = `Temp: ${data.temp}°C`
        break
    }
  }

  updateStatusIndicator(metric, usage) {
    const card = document.querySelector(`[data-metric="${metric}"]`)
    const indicator = card?.querySelector(".status-indicator")

    if (indicator) {
      if (usage > 80) {
        indicator.style.background = "#ff4444" // Red for high usage
      } else if (usage > 60) {
        indicator.style.background = "#ffaa00" // Orange for medium usage
      } else {
        indicator.style.background = "var(--primary-red)" // Normal red
      }
    }
  }

  // Public method for external control (C# integration)
  updateMetric(metric, value) {
    if (this.performanceData[metric]) {
      this.performanceData[metric].usage = Math.max(0, Math.min(100, value))
      this.updateUI()
    }
  }

  // Public method to switch pages (C# integration)
  switchToPage(pageName) {
    const button = document.querySelector(`[data-page="${pageName}"]`)
    if (button) {
      button.click()
    }
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.dashboard = new PerformanceDashboard()
})

// Expose methods for C++ / host telemetry integration
window.updateDashboard = (data) => {
  window.hasNativeTelemetry = true
  if (window.dashboard && window.dashboard.simTimer) {
    clearInterval(window.dashboard.simTimer)
    window.dashboard.simTimer = null
  }
  if (!window.dashboard || !window.dashboard.performanceData) return
  if (data.cpu) Object.assign(window.dashboard.performanceData.cpu, data.cpu)
  if (data.ram) Object.assign(window.dashboard.performanceData.ram, data.ram)
  if (data.gpu) Object.assign(window.dashboard.performanceData.gpu, data.gpu)
  if (data.disk) Object.assign(window.dashboard.performanceData.disk, data.disk)
  window.dashboard.updateUI()
}

// Expose methods for C# WebView integration
window.updatePerformanceMetric = (metric, value) => {
  if (window.dashboard) {
    window.dashboard.updateMetric(metric, value)
  }
}

window.switchToPage = (pageName) => {
  if (window.dashboard) {
    window.dashboard.switchToPage(pageName)
  }
}
// ==========================================
// Delete GameLoop Modal Controller
// ==========================================
const deleteGameloopOverlay = document.getElementById("deleteGameloopOverlay");
const deleteGameloopModal = document.getElementById("deleteGameloopModal");
const deleteGameloopYesBtn = document.getElementById("deleteGameloopYesBtn");
const deleteGameloopNoBtn = document.getElementById("deleteGameloopNoBtn");
const deleteGameloopCloseBtn = document.getElementById("deleteGameloopCloseBtn");

function showDeleteGameloopConfirm() {
    if (deleteGameloopOverlay && deleteGameloopModal) {
        deleteGameloopOverlay.classList.add("active");
        deleteGameloopModal.classList.add("active");
    } else {
        if (confirm("Are You Sure To Delete Gameloop Completely?")) {
            if (window.chrome && window.chrome.webview) {
                window.chrome.webview.postMessage("delete-gameloop");
            }
        }
    }
}

function hideDeleteGameloopConfirm() {
    if (deleteGameloopOverlay && deleteGameloopModal) {
        deleteGameloopOverlay.classList.remove("active");
        deleteGameloopModal.classList.remove("active");
    }
}

if (deleteGameloopYesBtn) {
    deleteGameloopYesBtn.addEventListener("click", () => {
        hideDeleteGameloopConfirm();
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage("delete-gameloop");
        }
    });
}

if (deleteGameloopNoBtn) {
    deleteGameloopNoBtn.addEventListener("click", hideDeleteGameloopConfirm);
}

if (deleteGameloopCloseBtn) {
    deleteGameloopCloseBtn.addEventListener("click", hideDeleteGameloopConfirm);
}

if (deleteGameloopOverlay) {
    deleteGameloopOverlay.addEventListener("click", hideDeleteGameloopConfirm);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && deleteGameloopModal && deleteGameloopModal.classList.contains("active")) {
        hideDeleteGameloopConfirm();
    }
});

// ==========================================
// Universal Unified Click Dispatcher (All Tabs & Duplicate Buttons)
// ==========================================
document.addEventListener("click", (e) => {
    // 1. Data-action buttons (Dashboard, Clean, GameLoop, Tweaks, Settings)
    const actionEl = e.target.closest("[data-action]");
    if (actionEl) {
        const action = actionEl.getAttribute("data-action");
        if (!action) return;

        // Visual click feedback
        actionEl.classList.add("btn-clicked");
        setTimeout(() => actionEl.classList.remove("btn-clicked"), 250);

        // Delete GameLoop Confirmation
        if (action === "delete-gameloop") {
            showDeleteGameloopConfirm();
            return;
        }

        // Action-specific UI preparation (Boost & Fix Modals)
        if (action === "gameloop-boost" || action === "boost") {
            if (window.updateBoostModal) {
                window.updateBoostModal(0, "Initializing GameLoop Boost...", "Connecting to ADB engine & preparing parameters...", "Step 0/9", "loading", "GAMELOOP ULTRA BOOST", "fas fa-rocket");
            }
        } else if (action === "fix-opengl" || action === "fix-open-gl") {
            if (window.updateBoostModal) {
                window.updateBoostModal(0, "Initializing Local OpenGL Fix...", "Detecting GameLoop paths & creating backups...", "Step 0/9", "loading", "GAMELOOP FIX OPEN GL", "fas fa-cube");
            }
        } else if (action === "fix-vt" || action === "fix-vt-restore" || action === "restore-gameloop") {
            if (window.updateBoostModal) {
                window.updateBoostModal(0, "Initializing Fix VT / Restore...", "Stopping processes & preparing to restore defaults...", "Step 0/6", "loading", "GAMELOOP FIX VT", "fas fa-undo-alt");
            }
        }
        
        // Post message to C++ WebView2 host (C++ dispatches native loading & completed notifications)
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage(action);
        }
        return;
    }

    // 2. Data-mod buttons (GameLoop graphic / FPS active.sav mods)
    const modEl = e.target.closest("[data-mod]");
    if (modEl) {
        const mod = modEl.getAttribute("data-mod");
        if (!mod) return;

        modEl.classList.add("btn-clicked");
        setTimeout(() => modEl.classList.remove("btn-clicked"), 250);

        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage(mod);
        }
        return;
    }
});




// Info popup toggle
document.getElementById('infoToggle').addEventListener('click', () => {
    document.getElementById('infoPopup').classList.add('active');
    document.getElementById('infoOverlay').classList.add('active');
});

document.getElementById('infoClose').addEventListener('click', () => {
    document.getElementById('infoPopup').classList.remove('active');
    document.getElementById('infoOverlay').classList.remove('active');
});

document.getElementById('infoOverlay').addEventListener('click', () => {
    document.getElementById('infoPopup').classList.remove('active');
    document.getElementById('infoOverlay').classList.remove('active');
});

window.updateAdbStatus = (connected, statusText) => {
  const badge = document.getElementById('adbStatusBadge');
  const textEl = document.getElementById('adbStatusText');
  if (badge && textEl) {
    textEl.textContent = statusText;
    
    // Clear existing status classes
    badge.classList.remove('connected', 'disconnected', 'connecting');
    
    if (statusText === 'Connecting...' || statusText.startsWith('Connecting') || statusText.startsWith('Waiting') || statusText.startsWith('Launching')) {
      badge.classList.add('connecting');
    } else if (connected) {
      badge.classList.add('connected');
    } else {
      badge.classList.add('disconnected');
    }
  }
};

// Native Window Controls & Dragging Bridge
function setupWindowControls() {
  const minBtn = document.getElementById("winMinimize");
  const maxBtn = document.getElementById("winMaximize");
  const closeBtn = document.getElementById("winClose");
  const dragRegion = document.getElementById("titlebarDrag");
  const titlebar = document.getElementById("customTitlebar");

  if (minBtn) {
    minBtn.addEventListener("click", () => {
      if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("window-minimize");
      }
    });
  }

  if (maxBtn) {
    maxBtn.addEventListener("click", () => {
      if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("window-maximize");
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("window-close");
      }
    });
  }

  if (dragRegion) {
    dragRegion.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        if (window.chrome && window.chrome.webview) {
          window.chrome.webview.postMessage("window-drag");
        }
      }
    });
  }

  if (titlebar) {
    titlebar.addEventListener("mousedown", (e) => {
      if (e.button === 0 && !e.target.closest(".win-control-btn")) {
        if (window.chrome && window.chrome.webview) {
          window.chrome.webview.postMessage("window-drag");
        }
      }
    });

    titlebar.addEventListener("dblclick", (e) => {
      if (!e.target.closest(".win-control-btn")) {
        if (window.chrome && window.chrome.webview) {
          window.chrome.webview.postMessage("window-maximize");
        }
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupWindowControls);
} else {
  setupWindowControls();
}

