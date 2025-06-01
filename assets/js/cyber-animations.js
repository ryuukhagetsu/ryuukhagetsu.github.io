class CyberAnimations {
  constructor() {
    this.animationContainer = null;
    this.networkContainer = null;
    this.glitchContainer = null;
    this.isActive = true;

    this.init();
  }

  init() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.isActive = false;
      return;
    }

    this.createContainers();
    this.startAnimations();
    this.handleVisibilityChange();
  }

  createContainers() {
    this.animationContainer = document.createElement("div");
    this.animationContainer.className = "cyber-animations";
    this.animationContainer.id = "cyberAnimations";

    this.networkContainer = document.createElement("div");
    this.networkContainer.className = "network-bg";
    this.networkContainer.id = "networkBg";

    this.glitchContainer = document.createElement("div");
    this.glitchContainer.className = "glitch-bg";
    this.glitchContainer.id = "glitchBg";

    this.animationContainer.appendChild(this.networkContainer);
    this.animationContainer.appendChild(this.glitchContainer);

    document.body.appendChild(this.animationContainer);
  }

  startAnimations() {
    if (!this.isActive) return;

    this.createNetworkNodes();
    this.createGlitchParticles();
  }

  createNetworkNodes() {
    const createNode = () => {
      const node = document.createElement("div");
      node.className = "network-node";
      node.style.left = Math.random() * 100 + "%";
      node.style.animationDuration = Math.random() * 6 + 8 + "s";
      node.style.animationDelay = Math.random() * 2 + "s";

      this.networkContainer.appendChild(node);

      setTimeout(() => {
        if (this.networkContainer.contains(node)) {
          this.networkContainer.removeChild(node);
        }
      }, 14000);
    };

    setInterval(createNode, 1800);

    for (let i = 0; i < 3; i++) {
      setTimeout(createNode, i * 600);
    }
  }

  createGlitchParticles() {
    const createParticle = () => {
      const particle = document.createElement("div");
      const sizes = ["small", "", "large"];
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

      particle.className = `glitch-particle ${randomSize}`;
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDuration = Math.random() * 3 + 4 + "s";
      particle.style.animationDelay = Math.random() * 2 + "s";

      this.glitchContainer.appendChild(particle);

      setTimeout(() => {
        if (this.glitchContainer.contains(particle)) {
          this.glitchContainer.removeChild(particle);
        }
      }, 7000);
    };

    setInterval(createParticle, 400);

    for (let i = 0; i < 5; i++) {
      setTimeout(createParticle, i * 200);
    }
  }

  handleVisibilityChange() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  pause() {
    if (this.animationContainer) {
      this.animationContainer.style.animationPlayState = "paused";
    }
  }

  resume() {
    if (this.animationContainer) {
      this.animationContainer.style.animationPlayState = "running";
    }
  }

  destroy() {
    if (
      this.animationContainer &&
      document.body.contains(this.animationContainer)
    ) {
      document.body.removeChild(this.animationContainer);
    }
    this.isActive = false;
  }

  toggle() {
    if (this.isActive) {
      this.destroy();
      this.isActive = false;
    } else {
      this.init();
      this.isActive = true;
    }
  }
}

let cyberAnimations;

document.addEventListener("DOMContentLoaded", function () {
  cyberAnimations = new CyberAnimations();

  window.cyberAnimations = cyberAnimations;
});

document.addEventListener("visibilitychange", function () {
  if (cyberAnimations) {
    if (document.hidden) {
      cyberAnimations.pause();
    } else {
      cyberAnimations.resume();
    }
  }
});

window.addEventListener("beforeunload", function () {
  if (cyberAnimations) {
    cyberAnimations.destroy();
  }
});
