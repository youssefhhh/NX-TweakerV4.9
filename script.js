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
    // Initialize performance data
    this.performanceData = {
      disk: { usage: 0, used: 0, free: 0, total: 100 },
      gpu: { usage: 0, temp: 0, memory: 0 },
      proc: { usage: 0, cores: 0, threads: 0 },
      ram: { usage: 0, used: 0, total: 16 },
      cpu: { usage: 0, freq: 0, temp: 0 },
    }

    this.detectSystemInfo()
  }

  async detectSystemInfo() {
    try {
      // Try to get real system information where possible
      if ("navigator" in window) {
        // Get CPU cores
        this.performanceData.proc.cores = navigator.hardwareConcurrency || 8
        this.performanceData.proc.threads = this.performanceData.proc.cores * 2

        // Get memory info (Chrome only)
        if ("memory" in performance) {
          const memInfo = performance.memory
          this.performanceData.ram.total = Math.round(memInfo.totalJSHeapSize / (1024 * 1024 * 1024))
          this.performanceData.ram.used = Math.round(memInfo.usedJSHeapSize / (1024 * 1024 * 1024))
        }

        // Get storage info (if available)
        if ("storage" in navigator && "estimate" in navigator.storage) {
          const estimate = await navigator.storage.estimate()
          if (estimate.quota && estimate.usage) {
            this.performanceData.disk.total = Math.round(estimate.quota / (1024 * 1024 * 1024))
            this.performanceData.disk.used = Math.round(estimate.usage / (1024 * 1024 * 1024))
            this.performanceData.disk.free = this.performanceData.disk.total - this.performanceData.disk.used
            this.performanceData.disk.usage = Math.round(
              (this.performanceData.disk.used / this.performanceData.disk.total) * 100,
            )
          }
        }
      }
    } catch (error) {
      console.log("[v0] Could not access system APIs, using simulated data")
    }

    // Update static info
    this.updateStaticInfo()

    // Fallback to simulated data with realistic values
    this.initializeSimulatedData()
  }

  updateStaticInfo() {
    // Update processor info
    document.getElementById("proc-cores").textContent = `Cores: ${this.performanceData.proc.cores}`
    document.getElementById("proc-threads").textContent = `Threads: ${this.performanceData.proc.threads}`

    // Update RAM total
    document.getElementById("ram-total").textContent = `Total: ${this.performanceData.ram.total} GB`
  }

  initializeSimulatedData() {
    // Fallback to simulated data with realistic values
    this.performanceData = {
      disk: { usage: 78, used: 234, free: 66, total: 300 },
      gpu: { usage: 45, temp: 67, memory: 6.2 },
      proc: { usage: 32, cores: 8, threads: 16 },
      ram: { usage: 67, used: 10.7, total: 16 },
      cpu: { usage: 28, freq: 3.2, temp: 52 },
    }
  }

  startRealTimeUpdates() {
    // Update performance metrics every 2 seconds
    setInterval(() => {
      this.updatePerformanceMetrics()
    }, 2000)

    // Initial update
    this.updatePerformanceMetrics()
  }

  updatePerformanceMetrics() {
    try {
      // Get real CPU usage approximation using performance timing
      this.measureCPUUsage()

      // Get real memory usage (Chrome only)
      this.measureMemoryUsage()

      // Simulate other metrics with realistic fluctuations
      this.simulateOtherMetrics()

      // Update UI
      this.updateUI()
    } catch (error) {
      console.log("[v0] Error updating metrics, using simulated data")
      this.simulateAllMetrics()
      this.updateUI()
    }
  }

  measureCPUUsage() {
    const start = performance.now()

    // Perform some CPU-intensive work to measure performance
    let iterations = 0
    const targetTime = 10 // 10ms of work

    while (performance.now() - start < targetTime) {
      Math.random() * Math.random()
      iterations++
    }

    const actualTime = performance.now() - start

    // Estimate CPU usage based on how long the work took
    const efficiency = targetTime / actualTime
    const estimatedUsage = Math.max(0, Math.min(100, (1 - efficiency) * 100))

    // Smooth the CPU usage with previous values
    this.performanceData.cpu.usage = Math.round(this.performanceData.cpu.usage * 0.7 + estimatedUsage * 0.3)

    // Simulate temperature based on usage
    this.performanceData.cpu.temp = Math.round(35 + this.performanceData.cpu.usage * 0.4)
    this.performanceData.cpu.freq = (2.8 + this.performanceData.cpu.usage * 0.01).toFixed(1)
  }

  measureMemoryUsage() {
    if ("memory" in performance) {
      const memInfo = performance.memory
      const usedGB = memInfo.usedJSHeapSize / (1024 * 1024 * 1024)
      const totalGB = memInfo.totalJSHeapSize / (1024 * 1024 * 1024)

      this.performanceData.ram.used = usedGB.toFixed(1)
      this.performanceData.ram.usage = Math.round((usedGB / this.performanceData.ram.total) * 100)
    }
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
        valueElement.style.animation = "valueFlicker 0.5s ease-in-out"
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
        if (gpuMemory) gpuMemory.textContent = `Memory: ${data.memory} GB`
        break

      case "ram":
        const ramUsed = document.getElementById("ram-used")
        if (ramUsed) ramUsed.textContent = `Used: ${data.used} GB`
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
// Full Clean
document.querySelector('[data-action="full-clean"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("full-clean");
    }
});

// IP Flush
document.querySelector('[data-action="ip-flush"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("ip-flush");
    }
});

// Clear Temp
document.querySelector('[data-action="clear-temp"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("clear-temp");
    }
});

// Delete GameLoop with Confirmation
const deleteGameloopBtn = document.querySelector('[data-action="delete-gameloop"]');
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
        // Fallback
        if (confirm("Are You Sure To Delete Gameloop Completely")) {
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

if (deleteGameloopBtn) {
    deleteGameloopBtn.addEventListener("click", () => {
        showDeleteGameloopConfirm();
    });
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
    deleteGameloopNoBtn.addEventListener("click", () => {
        hideDeleteGameloopConfirm();
    });
}

if (deleteGameloopCloseBtn) {
    deleteGameloopCloseBtn.addEventListener("click", () => {
        hideDeleteGameloopConfirm();
    });
}

if (deleteGameloopOverlay) {
    deleteGameloopOverlay.addEventListener("click", () => {
        hideDeleteGameloopConfirm();
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && deleteGameloopModal && deleteGameloopModal.classList.contains("active")) {
        hideDeleteGameloopConfirm();
    }
});

// Delete NX Folder
document.querySelector('[data-action="delete-nx-folder"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("delete-nx-folder");
    }
});

// Clean GPU
const cleanGpuBtn = document.querySelector('[data-action="clean-gpu"]');
if (cleanGpuBtn) {
    cleanGpuBtn.addEventListener("click", () => {
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage("clean-gpu");
        }
    });
}

// Gameloop Boost
const boostBtn = document.querySelector('[data-action="gameloop-boost"]');
if (boostBtn) {
    boostBtn.addEventListener("click", () => {
        if (window.updateBoostModal) {
            window.updateBoostModal(0, "Initializing GameLoop Boost...", "Connecting to ADB engine & preparing parameters...", "Step 0/9", "loading", "GAMELOOP ULTRA BOOST", "fas fa-rocket");
        }
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage("gameloop-boost");
        }
    });
}

// Fix Open GL
const fixOpenGlBtn = document.querySelector('[data-action="fix-opengl"]');
if (fixOpenGlBtn) {
    fixOpenGlBtn.addEventListener("click", () => {
        if (window.updateBoostModal) {
            window.updateBoostModal(0, "Initializing Local OpenGL Fix...", "Detecting GameLoop paths & creating backups...", "Step 0/9", "loading", "GAMELOOP FIX OPEN GL", "fas fa-cube");
        }
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage("fix-opengl");
        }
    });
}

// Fix VT (Restore GameLoop)
const fixVtBtn = document.querySelector('[data-action="fix-vt"]');
if (fixVtBtn) {
    fixVtBtn.addEventListener("click", () => {
        if (window.updateBoostModal) {
            window.updateBoostModal(0, "Initializing Fix VT / Restore...", "Stopping processes & preparing to restore defaults...", "Step 0/6", "loading", "GAMELOOP FIX VT", "fas fa-undo-alt");
        }
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage("fix-vt");
        }
    });
}

// Kill Emulator
document.querySelector('[data-action="kill-emulator"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("kill-emulator");
    }
});


// start-game
document.querySelector('[data-action="start-game"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("start-game");
    }
});

// start-gameloop
document.querySelector('[data-action="start-gameloop"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("start-gameloop");
    }
});

// Smooth mods
document.querySelector('[data-mod="super-smooth-120"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("super-smooth-120");
    }
});

document.querySelector('[data-mod="smooth-120"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("smooth-120");
    }
});

document.querySelector('[data-mod="balanced-120"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("balanced-120");
    }
});


// HDR mods
document.querySelector('[data-mod="hdr-60"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("hdr-60");
    }
});

document.querySelector('[data-mod="hdr-90"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("hdr-90");
    }
});

document.querySelector('[data-mod="hdr-120"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("hdr-120");
    }
});

// Ultra HDR mods
document.querySelector('[data-mod="ultra-hdr-60"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("ultra-hdr-60");
    }
});

document.querySelector('[data-mod="ultra-hdr-90"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("ultra-hdr-90");
    }
});

document.querySelector('[data-mod="ultra-hdr-120"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("ultra-hdr-120");
    }
});


// nx-script
document.querySelector('[data-action="nx-script"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("nx-script");
    }
});

// optimize
document.querySelector('[data-action="optimize"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("optimize");
    }
});

// debloate
document.querySelector('[data-action="debloate"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("debloate");
    }
});

// download-programs
document.querySelector('[data-action="download-programs"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("download-programs");
    }
});

// download-gameloop-opt
document.querySelector('[data-action="download-gameloop-opt"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("download-gameloop-opt");
    }
});

// download-nx-json
document.querySelector('[data-action="download-nx-json"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("download-nx-json");
    }
});

// 120-fps-tool
const btn120Fps = document.querySelector('[data-action="120-fps-tool"]');
if (btn120Fps) {
    btn120Fps.addEventListener("click", () => {
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage("120-fps-tool");
        }
    });
}

// dp-clat
document.querySelector('[data-action="dp-clat"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("dp-clat");
    }
});

// msi-util
document.querySelector('[data-action="msi-util"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("msi-util");
    }
});

// control-panel
document.querySelector('[data-action="control-panel"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("control-panel");
    }
});

// visual-effects
document.querySelector('[data-action="visual-effects"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("visual-effects");
    }
});

// msconfig
document.querySelector('[data-action="msconfig"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("msconfig");
    }
});

// windows-update-blocker
document.querySelector('[data-action="windows-update-blocker"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("windows-update-blocker");
    }
});

// defender-control
document.querySelector('[data-action="defender-control"]').addEventListener("click", () => {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage("defender-control");
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



window.updateDashboard = (data) => {
  if (window.dashboard && window.dashboard.performanceData) {
    // Update all metrics with real data from C#
    Object.keys(data).forEach((metric) => {
      if (window.dashboard.performanceData[metric]) {
        Object.assign(window.dashboard.performanceData[metric], data[metric]);
      }
    });
    window.dashboard.updateUI();
  }
};

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

