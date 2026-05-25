const state = {
  lang: localStorage.getItem("shixing-lang") || "zh",
  projectFilter: "all",
  content: null,
};

const displayLevels = new Set(["full", "publicLink", "textOnly", "hidden"]);

let revealObserver = null;

const i18n = {
  zh: {
    nav: { work: "项目", motion: "动效", about: "关于", contact: "联系" },
    hero: {
      kicker: "十行文化 / SHIXING STUDIO",
      title: "商业影像合成与 AIGC 视觉增强设计师",
      lede: "擅长实拍合成、动画包装、三维/AI素材整合与商业成片质感控制；正在向导演型影像创作者转型。",
      ctaPrimary: "联系合作",
      ctaSecondary: "查看项目",
      reelLabel: "Featured Motion Reel",
    },
    motion: {
      title: "动态视觉能力",
      body: "用短循环、视频封面和项目片段，让合作方在几秒内看到节奏、质感与执行力。",
    },
    work: {
      title: "精选项目",
      body: "每个案例强调背景、角色、成果和可观看的视觉素材。",
      view: "查看详情",
      external: "外部链接",
      textOnly: "项目说明",
      filterAll: "全部",
      filterA: "实拍合成",
      filterGamePV: "动画包装",
      filter3D: "三维辅助",
      filterSupport: "大厂项目链路",
      filterAIGC: "AIGC实验",
      filterB: "导演型实验",
      count: "个案例",
    },
    visual: {
      title: "TYC 视觉场景作品",
      body: "以电影感场景、奇幻写实空间和氛围叙事，展示个人视觉方向与画面控制力。",
    },
    about: {
      title: "关于十行文化",
      body: "我是一名商业影像合成与动画包装设计师，职业路径从湖南广电体系开始，之后参与视觉内容公司的合伙经营，目前以一人公司形式承接项目。\n\n自由职业与公司项目期间，我长期服务上海视觉 / 内容制作公司，为其提供动画包装、实拍合成与商业成片质感控制支持，并参与腾讯、米哈游等大厂相关项目链路。\n\n目前正在从传统后期执行与视觉包装，转向 AIGC 视觉增强和导演型影像创作：把实拍合成、三维/AI素材整合、画面修复与动态包装经验结合起来，形成更高效、更具表达力的商业影像工作流。",
    },
    contact: {
      title: "联系合作",
      body: "适合品牌视觉、视觉动画、项目提案、内容包装与跨团队创意协作。",
    },
  },
  en: {
    nav: { work: "Work", motion: "Motion", about: "About", contact: "Contact" },
    hero: {
      kicker: "Shixing Studio / Solo Practice",
      title: "Commercial Compositing & AIGC Visual Enhancement Designer",
      lede: "Specialized in live-action compositing, motion packaging, 3D/AI asset integration, and commercial finishing quality control; now transitioning toward director-led image creation.",
      ctaPrimary: "Start a Collaboration",
      ctaSecondary: "View Work",
      reelLabel: "Featured Motion Reel",
    },
    motion: {
      title: "Motion Capability",
      body: "Short loops, video covers, and project clips make rhythm, craft, and execution visible within seconds.",
    },
    work: {
      title: "Selected Projects",
      body: "Each case highlights context, role, outcome, and viewable visual material.",
      view: "View Detail",
      external: "External Link",
      textOnly: "Project Note",
      filterAll: "All",
      filterA: "Live-action / Compositing",
      filterGamePV: "Motion Packaging",
      filter3D: "3D Support",
      filterSupport: "Major Client Pipelines",
      filterAIGC: "AIGC Experiments",
      filterB: "Director-led Experiments",
      count: "cases",
    },
    visual: {
      title: "TYC Cinematic Visuals",
      body: "Cinematic scenes, fantasy-realistic spaces, and atmospheric storytelling show TYC's visual direction and image craft.",
    },
    about: {
      title: "About Shixing Studio",
      body: "I am a commercial image compositing and motion packaging designer. My career path began within the Hunan Broadcasting System, later moved into the partnership operation of a visual content company, and now continues through a one-person company.\n\nAcross freelance and company-side projects, I have long served visual and content production companies in Shanghai, providing motion packaging, live-action compositing, and commercial finishing support while participating in project pipelines connected to major clients such as Tencent and miHoYo.\n\nI am now transitioning from traditional post-production execution and visual packaging toward AIGC visual enhancement and director-led image creation, combining live-action compositing, 3D/AI asset integration, image repair, and motion packaging into a more efficient and expressive commercial image workflow.",
    },
    contact: {
      title: "Contact",
      body: "Open to brand visuals, motion design, proposal design, content packaging, and cross-team creative collaboration.",
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
    .filter(({ project }) => getProjectDisplayLevel(project) !== "hidden");
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
  const items = document.querySelectorAll(".capability-item, .project-card, .visual-strip figure, .career-timeline li, .contact-links > *");
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
