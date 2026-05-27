const state = {
  lang: localStorage.getItem("shixing-lang") || "zh",
  projectFilter: "all",
  content: null,
};

const displayLevels = new Set(["full", "publicLink", "textOnly", "hidden"]);
const projectClassOrder = new Map([
  ["A", 1],
  ["GamePV", 2],
  ["ThreeD", 3],
  ["Support", 4],
  ["AIGC", 5],
  ["B", 6],
  ["", 7],
]);

let revealObserver = null;

const i18n = {
  zh: {
    nav: { work: "项目", motion: "能力", about: "关于", contact: "联系" },
    hero: {
      kicker: "TYC / 十行文化",
      title: "商业影像合成与 AIGC 视觉增强设计师",
      lede: "Motion Compositing / AIGC Visual Enhancement / Director-oriented Creator",
      ctaPrimary: "联系合作",
      ctaSecondary: "查看项目",
      reelLabel: "Featured Motion Reel",
    },
    motion: {
      title: "核心能力",
      body: "围绕商业影像合成、动画包装与 AIGC 视觉增强，集中展示可直接服务商业成片的后期执行与视觉整合能力。",
    },
    work: {
      title: "精选项目",
      body: "项目分为实拍合成、动画包装、三维辅助、大厂项目链路与 AIGC 实验。部分项目因客户版权限制，仅展示公开链接、职责说明或阶段性画面。",
      view: "查看详情",
      external: "外部链接",
      textOnly: "项目说明",
      filterAll: "全部",
      filterA: "商业影像合成",
      filterGamePV: "动画包装",
      filter3D: "三维辅助",
      filterSupport: "大厂项目链路",
      filterAIGC: "AIGC实验",
      filterB: "导演型实验",
      count: "个案例",
    },
    about: {
      title: "关于十行文化",
      body: "我是一名商业影像合成与动画包装设计师，曾在湖南广电体系工作，后参与视觉内容公司合伙经营，目前以一人公司形式承接项目。长期为上海视觉/内容制作公司提供动画包装、实拍合成与商业成片支持，并参与腾讯、米哈游等大厂相关项目链路。\n\n目前重点探索 AIGC 工具在实拍合成、商业影像增强和导演型短片中的应用。",
    },
    contact: {
      title: "联系合作",
      body: "可合作方向：实拍合成、商业影像后期、动画包装、品牌视频、AIGC视觉增强、AI生成素材修复与成片质感统一。\n\n适合品牌短片、产品概念片、内容包装、发布会视觉、AIGC影像实验及远程项目制合作。",
    },
  },
  en: {
    nav: { work: "Work", motion: "Capabilities", about: "About", contact: "Contact" },
    hero: {
      kicker: "TYC / Shixing Studio",
      title: "Commercial Compositing & AIGC Visual Enhancement Designer",
      lede: "Motion Compositing / AIGC Visual Enhancement / Director-oriented Creator",
      ctaPrimary: "Start a Collaboration",
      ctaSecondary: "View Work",
      reelLabel: "Featured Motion Reel",
    },
    motion: {
      title: "Core Capabilities",
      body: "Focused on commercial compositing, motion packaging, and AIGC visual enhancement for delivery-ready image work.",
    },
    work: {
      title: "Selected Projects",
      body: "Projects are grouped across live-action compositing, motion packaging, 3D support, major client pipelines, and AIGC experiments. Some projects are limited by client copyright and are shown through public links, role descriptions, or selected in-progress visuals.",
      view: "View Detail",
      external: "External Link",
      textOnly: "Project Note",
      filterAll: "All",
      filterA: "Commercial Compositing",
      filterGamePV: "Motion Packaging",
      filter3D: "3D Support",
      filterSupport: "Major Client Pipelines",
      filterAIGC: "AIGC Experiments",
      filterB: "Director-led Experiments",
      count: "cases",
    },
    about: {
      title: "About Shixing Studio",
      body: "I am a commercial image compositing and motion packaging designer. I previously worked within the Hunan Broadcasting System, later participated in the partnership operation of a visual content company, and now take on projects through a one-person company. I have long supported Shanghai visual and content production companies with motion packaging, live-action compositing, and commercial finishing, while participating in project pipelines connected to Tencent, miHoYo, and other major clients.\n\nI am currently focused on applying AIGC tools to live-action compositing, commercial image enhancement, and director-led short films.",
    },
    contact: {
      title: "Contact",
      body: "Collaboration areas: live-action compositing, commercial image post-production, motion packaging, brand videos, AIGC visual enhancement, AI-generated material repair, and finishing-quality unification.\n\nSuitable for brand films, product concept films, content packaging, launch-event visuals, AIGC image experiments, and remote project-based collaboration.",
    },
  },
};

async function boot() {
  try {
    const response = await fetch(`content/site.json?v=${Date.now()}`, { cache: "no-store" });
    state.content = await response.json();
  } catch (error) {
    console.error("Could not load content/site.json", error);
    state.content = { projects: [], capabilities: [], facts: [], contacts: [] };
  }

  bindEvents();
  render();
}

function t(path) {
  return path.split(".").reduce((value, key) => value?.[key], i18n[state.lang]) || path;
}

function localize(value) {
  if (!value || typeof value !== "object") return value || "";
  return value[state.lang] || value.zh || value.en || "";
}

function bindEvents() {
  document.querySelector(".language-toggle")?.addEventListener("click", () => {
    state.lang = state.lang === "zh" ? "en" : "zh";
    localStorage.setItem("shixing-lang", state.lang);
    render();
  });

  document.querySelector("[data-close-dialog]")?.addEventListener("click", closeDialog);
  document.querySelector("[data-media-dialog]")?.addEventListener("click", (event) => {
    if (event.target.matches("[data-media-dialog]")) closeDialog();
  });
  document.querySelector("[data-open-featured]")?.addEventListener("click", () => {
    const reel = state.content?.featuredReel;
    openMedia({
      title: reel?.title,
      description: reel?.description,
      video: reel?.video,
      image: reel?.poster || "assets/brand/bg-grid-dark.png",
    });
  });
}

function render() {
  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  document.querySelector("[data-lang-label]").textContent = state.lang === "zh" ? "EN" : "中";

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  renderFeaturedReel();
  renderCapabilities();
  renderProjectFilters();
  renderProjects();
  renderFacts();
  renderContacts();
  setupRevealAnimations();
}

function renderFeaturedReel() {
  const container = document.querySelector("[data-featured-reel]");
  const reel = state.content?.featuredReel;
  if (!container) return;

  const existing = container.querySelector("video");
  if (existing) existing.remove();
  const existingImage = container.querySelector(":scope > img");
  if (existingImage) existingImage.remove();

  const placeholder = container.querySelector(".motion-placeholder");
  if (placeholder) placeholder.hidden = Boolean(reel?.video || reel?.poster);

  if (reel?.video) {
    const video = document.createElement("video");
    video.src = reel.video;
    video.poster = reel.poster || "";
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "metadata";
    container.prepend(video);
    return;
  }

  if (reel?.poster) {
    const image = document.createElement("img");
    image.src = reel.poster;
    image.alt = localize(reel.title);
    container.prepend(image);
  }
}

function renderCapabilities() {
  const grid = document.querySelector("[data-capabilities]");
  if (!grid) return;

  grid.innerHTML = state.content.capabilities.map((item) => `
    <article class="capability-item">
      <div class="capability-icon" aria-hidden="true"><span></span></div>
      <h3>${localize(item.title)}</h3>
      <p>${localize(item.description)}</p>
    </article>
  `).join("");
}

function renderProjects() {
  const grid = document.querySelector("[data-projects]");
  if (!grid) return;

  const projects = getFilteredProjects();
  grid.innerHTML = projects.map(({ project, index }, position) => `
    <article class="${getProjectCardClass(project, position)}">
      ${renderProjectMediaButton(project, index)}
      <div class="project-info">
        <div class="project-meta">
          <span>${project.year}</span>
          <span>${project.client ? localize(project.client) : localize(project.role)}</span>
        </div>
        <h3>${localize(project.title)}</h3>
        ${project.client ? `<p class="project-role">${localize(project.role)}</p>` : ""}
        <p>${localize(project.summary)}</p>
        ${renderProjectNote(project)}
        <div class="project-actions">
          <button class="mini-link" type="button" data-project-index="${index}">${t("work.view")}</button>
          ${(project.externalLinks || []).slice(0, 1).map((link) => `
            <a class="mini-link" href="${link.url}" target="_blank" rel="noreferrer">${localize(link.label) || t("work.external")}</a>
          `).join("")}
        </div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-project-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const project = state.content.projects[Number(button.dataset.projectIndex)];
      openProject(project);
    });
  });
}

function getProjectCardClass(project, position) {
  return [
    "project-card",
    getProjectDisplayLevel(project) === "textOnly" ? "is-text-only" : "",
    state.projectFilter === "all" && position < 2 ? "is-featured-project" : "",
  ].filter(Boolean).join(" ");
}

function renderProjectFilters() {
  const toolbar = document.querySelector("[data-project-filters]");
  if (!toolbar) return;

  const filters = [
    { value: "all", label: t("work.filterAll") },
    { value: "A", label: t("work.filterA") },
    { value: "GamePV", label: t("work.filterGamePV") },
    { value: "ThreeD", label: t("work.filter3D") },
    { value: "Support", label: t("work.filterSupport") },
    { value: "AIGC", label: t("work.filterAIGC") },
    { value: "B", label: t("work.filterB") },
  ];

  const activeCount = getFilteredProjects().length;
  toolbar.innerHTML = `
    <div class="filter-buttons" role="list" aria-label="${state.lang === "zh" ? "项目筛选" : "Project filters"}">
      ${filters.map((filter) => `
        <button class="filter-button" type="button" data-project-filter="${filter.value}" aria-pressed="${state.projectFilter === filter.value}">
          ${filter.label}
        </button>
      `).join("")}
    </div>
    <p class="project-count">${activeCount} ${t("work.count")}</p>
  `;

  toolbar.querySelectorAll("[data-project-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.projectFilter = button.dataset.projectFilter;
      renderProjectFilters();
      renderProjects();
      requestAnimationFrame(setupRevealAnimations);
    });
  });
}

function getFilteredProjects() {
  return getVisibleProjects()
    .filter(({ project }) => state.projectFilter === "all" || project.caseClass === state.projectFilter);
}

function getVisibleProjects() {
  return (state.content.projects || [])
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => getProjectDisplayLevel(project) !== "hidden")
    .sort((a, b) => getProjectSortValue(a.project, a.index) - getProjectSortValue(b.project, b.index));
}

function getProjectSortValue(project, index) {
  const classOrder = projectClassOrder.get(project?.caseClass || "") || 99;
  return classOrder * 10000 + index;
}

function getProjectDisplayLevel(project) {
  if (displayLevels.has(project?.displayLevel)) return project.displayLevel;
  return project?.externalLinks?.length ? "publicLink" : "textOnly";
}

function canShowProjectMedia(project) {
  return getProjectDisplayLevel(project) !== "textOnly";
}

function canPlayProjectVideo(project) {
  return getProjectDisplayLevel(project) === "full";
}

function renderProjectMediaButton(project, index) {
  if (!canShowProjectMedia(project)) {
    return `
      <button class="project-text-trigger" type="button" data-project-index="${index}" aria-label="${localize(project.title)}">
        <span>${t("work.textOnly")}</span>
      </button>
    `;
  }

  return `
    <button class="project-media" type="button" data-project-index="${index}" aria-label="${localize(project.title)}">
      ${renderProjectMedia(project)}
      <span class="media-badge">${project.mediaType || "mixed"}</span>
    </button>
  `;
}

function renderProjectMedia(project) {
  if (canPlayProjectVideo(project) && project.coverVideo) {
    return `<video src="${project.coverVideo}" poster="${project.coverImage || ""}" muted loop autoplay playsinline preload="metadata"></video>`;
  }
  if (project.coverImage) {
    return `<img src="${project.coverImage}" alt="${localize(project.title)}" loading="lazy">`;
  }
  return `<div class="project-media-fallback">${localize(project.title)}</div>`;
}

function renderProjectNote(project) {
  const note = project.displayNote || project.sourceNote;
  return note ? `<p class="source-note">${localize(note)}</p>` : "";
}

function openProject(project) {
  const level = getProjectDisplayLevel(project);
  const externalLinks = project.externalLinks || [];

  openMedia({
    title: project.title,
    description: project.detail,
    note: project.displayNote || project.sourceNote,
    video: level === "full" ? project.videoUrl || project.coverVideo || project.motionClips?.[0]?.src : "",
    image: level === "textOnly" ? "" : project.coverImage || project.gallery?.[0],
    gallery: level === "full" ? project.gallery : level === "publicLink" ? (project.gallery || []).slice(0, 3) : [],
    motionClips: level === "full" ? project.motionClips : [],
    externalLinks,
  });
}

function renderFacts() {
  const list = document.querySelector("[data-facts]");
  if (!list) return;

  list.innerHTML = buildCareerTimeline(state.content.facts || []).map((item, index) => `
    <li>
      <span class="timeline-marker">${String(index + 1).padStart(2, "0")}</span>
      <div class="timeline-copy">
        <h3>${item.label}</h3>
        <p>${item.value}</p>
      </div>
    </li>
  `).join("");
}

function buildCareerTimeline(facts) {
  const careerLabels = state.lang === "zh"
    ? ["湖南广电经历", "合伙公司经历", "一人公司"]
    : ["Hunan Broadcasting", "Partnership Company", "One-person Company"];

  return facts.flatMap((fact) => {
    const label = localize(fact.label);
    const value = localize(fact.value);
    const normalizedLabel = label.toLowerCase();
    if (!label || !value || label.includes("主理人") || normalizedLabel.includes("founder")) return [];

    if (label.includes("履历") || normalizedLabel.includes("career")) {
      return value.split(/\s*\/\s*/).filter(Boolean).map((part, index) => ({
        label: careerLabels[index] || label,
        value: part.trim(),
      }));
    }

    return [{ label, value }];
  });
}

function renderContacts() {
  const list = document.querySelector("[data-contact-links]");
  if (!list) return;

  list.innerHTML = state.content.contacts.map((contact) => {
    const body = `<span class="contact-label">${localize(contact.label)}</span>${localize(contact.value)}`;
    if (contact.href) {
      return `<a href="${contact.href}">${body}</a>`;
    }
    return `<span>${body}</span>`;
  }).join("");
}

function openMedia(item) {
  const dialog = document.querySelector("[data-media-dialog]");
  const body = document.querySelector("[data-dialog-body]");
  if (!dialog || !body) return;

  const gallery = (item.gallery || []).filter(Boolean);
  const clips = (item.motionClips || []).filter((clip) => clip?.src);
  const media = item.video
    ? `<div class="dialog-hero-media"><video src="${item.video}" poster="${item.image || ""}" controls autoplay playsinline></video></div>`
    : item.image
      ? `<div class="dialog-hero-media"><img src="${item.image}" alt="${localize(item.title)}"></div>`
      : "";
  const galleryMedia = gallery.length > 1
    ? `<div class="media-strip-label">Stills / Frames</div>
      <div class="dialog-gallery media-strip">
        ${gallery.map((src) => `<figure><img src="${src}" alt="${localize(item.title)}"></figure>`).join("")}
      </div>`
    : "";
  const clipMedia = clips.length > 1
    ? `<div class="media-strip-label">Motion Clips</div>
      <div class="dialog-clips media-strip">
        ${clips.map((clip) => `<figure><button class="clip-select" type="button" data-clip-src="${clip.src}" data-clip-poster="${clip.poster || item.image || ""}" aria-label="Play clip in main viewer"><video src="${clip.src}" poster="${clip.poster || item.image || ""}" muted loop playsinline preload="metadata" data-preview-video></video></button></figure>`).join("")}
      </div>`
    : "";
  const externalLinks = (item.externalLinks || []).length
    ? `<div class="dialog-links">
        ${(item.externalLinks || []).map((link) => `<a class="mini-link" href="${link.url}" target="_blank" rel="noreferrer">${localize(link.label) || t("work.external")}</a>`).join("")}
      </div>`
    : "";
  const note = item.note ? `<p class="source-note">${localize(item.note)}</p>` : "";

  body.innerHTML = `
    ${media}
    <div class="dialog-copy">
      <h3>${localize(item.title)}</h3>
      <p>${localize(item.description)}</p>
      ${note}
      ${externalLinks}
    </div>
    ${galleryMedia}
    ${clipMedia}
  `;
  const heroMedia = body.querySelector(".dialog-hero-media");
  body.querySelectorAll("[data-preview-video]").forEach((video) => {
    video.addEventListener("mouseenter", () => video.play().catch(() => {}));
    video.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });
  });
  body.querySelectorAll(".clip-select").forEach((button) => {
    button.addEventListener("click", () => {
      body.querySelectorAll("[data-preview-video]").forEach((preview) => {
        preview.pause();
        preview.currentTime = 0;
      });
      if (!heroMedia) return;
      heroMedia.innerHTML = `<video src="${button.dataset.clipSrc}" poster="${button.dataset.clipPoster || item.image || ""}" controls autoplay playsinline></video>`;
      heroMedia.querySelector("video")?.play().catch(() => {});
    });
  });
  dialog.showModal();
}

function closeDialog() {
  const dialog = document.querySelector("[data-media-dialog]");
  document.querySelector("[data-dialog-body]").innerHTML = "";
  dialog?.close();
}

function setupRevealAnimations() {
  const items = document.querySelectorAll(".capability-item, .project-card, .career-timeline li, .contact-links > *");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.14,
  });

  items.forEach((item, index) => {
    item.classList.add("reveal-item");
    item.style.setProperty("--reveal-delay", `${Math.min(index * 40, 360)}ms`);
    revealObserver.observe(item);
  });
}

boot();
