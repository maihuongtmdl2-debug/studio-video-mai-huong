/**
 * MAI HƯỜNG AI VIDEO STUDIO (1977 Edition)
 * Ứng dụng tạo phim video có lời bình, phụ đề & tích hợp AI API Key
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // =========================================================================
  // 1. STATE & KHO MẪU LỜI BÌNH
  // =========================================================================
  const PRESET_SCRIPTS = {
    'cuoc-song': [
      'Mỗi ngày thức dậy là một món quà diệu kỳ của cuộc sống tươi đẹp.',
      'Hãy mỉm cười thật tươi để đón nhận nguồn năng lượng bình yên và tích cực.',
      'Hạnh phúc nở hoa từ những điều giản dị và chân thành nhất quanh ta.',
      'Sáng tạo, kết nối, lan tỏa yêu thương để mỗi khoảnh khắc đều rạng rỡ.',
      'Mai Hường — Cuộc Sống Tươi Đẹp: Chúc bạn luôn an vui và tràn đầy sức sống!'
    ],
    'du-lich': [
      'Những chuyến đi mở rộng tầm mắt và làm tươi mới tâm hồn.',
      'Đứng giữa thiên nhiên đất trời Việt Nam tươi đẹp, lòng ngập tràn tự hào.',
      'Từng cung đường đi qua đều lưu lại tiếng cười và kỷ niệm khó quên.',
      'Đi để thêm yêu quê hương, thêm trân quý những người bạn đồng hành.',
      'Hành trình tuyệt vời nhất là hành trình có nhau trên mọi nẻo đường!'
    ],
    'gia-dinh': [
      'Không gì quý giá hơn những phút giây sum vầy ấm áp bên người thân và bạn bè.',
      'Tình cảm chân thành là sợi dây gắn kết những trái tim đồng điệu.',
      'Cùng nhau sẻ chia niềm vui, nhân đôi hạnh phúc trong từng khoảnh khắc.',
      'Nụ cười rạng rỡ hôm nay là kỷ niệm vô giá của ngày mai.',
      'Trân trọng và biết ơn tất cả những yêu thương luôn hiện hữu quanh mình.'
    ],
    'the-thao': [
      'Đón ánh bình minh trong lành bằng những bước chân khỏe khoắn mỗi sớm mai.',
      'Sức khỏe và sự dẻo dai là nền tảng của một cuộc sống tươi đẹp.',
      'Rèn luyện thân thể, giữ tâm trí bình an giữa nhịp sống hiện đại.',
      'Năng lượng tích cực lan tỏa từ tinh thần thể thao đầy nhiệt huyết.',
      'Mỗi ngày khỏe hơn, trẻ hơn và yêu đời hơn cùng Mai Hường!'
    ],
    'ai-music': [
      'Từ AI đến Trái Tim — Khi công nghệ hiện đại hòa quyện cùng cảm xúc chân thành.',
      'Vì mỗi chúng ta đều xứng đáng có một tác phẩm âm nhạc và thước phim của riêng mình.',
      'Biến những kỷ niệm yêu thương thành giai điệu và hình ảnh sống động vượt thời gian.',
      'Học AI dễ dàng, ứng dụng thực tế, nhân công suất và lan tỏa giá trị tốt đẹp.',
      'Kết nối cùng Mai Hường (0982 909 515) để cùng sáng tạo những điều kỳ diệu!'
    ],
    'tho-ca': [
      'Sớm mai nắng trải hiên nhà, mỉm cười đón nhận món quà bình yên.',
      'Đi qua năm tháng dịu hiền, giữ tâm trong sáng, ưu phiền rời xa.',
      'Đất trời rực rỡ sắc hoa, tình thân gắn kết chan hòa yêu thương.',
      'Dẫu bao vạn nẻo dặm đường, lòng luôn rạng rỡ sắc hương cuộc đời.',
      'Mai Hường gửi trọn nụ cười, chúc cho cuộc sống muôn người nở hoa!'
    ]
  };

  const state = {
    slides: [], // { id, type: 'image'|'video', url, element, caption, base64 }
    currentSlideIndex: 0,
    slideElapsed: 0, // seconds within current slide
    isPlaying: false,
    isExporting: false,
    aspectRatio: '16:9',
    slideDuration: 5,
    visualEffect: 'golden-sparkles',
    frameStyle: 'gold-luxury',
    movieTitle: 'Mai Hường — Cuộc Sống Tươi Đẹp',
    watermarkText: 'Mai Hường • 0982 909 515',
    subFontSize: 42,
    subColorTheme: 'gold-box',
    subFontFamily: 'Be Vietnam Pro',
    subPosition: 'bottom',
    enableTts: true,
    ttsRate: 0.95,
    builtinBgm: 'peaceful',
    bgmVolume: 0.45,
    voiceVolume: 1.0,
    customBgmUrl: null,
    recordedVoiceUrl: null,
    // AI Config
    aiProvider: localStorage.getItem('mh_ai_provider') || 'gemini',
    aiApiKey: localStorage.getItem('mh_ai_key') || '',
    userPersona:
      localStorage.getItem('mh_user_persona') ||
      'Tôi là Mai Hường (sinh năm 1977), yêu cuộc sống tươi đẹp, thích văn phong ấm áp, chân thành, giàu năng lượng tích cực, yêu thiên nhiên, gia đình, bạn bè và đam mê sáng tạo âm nhạc từ AI đến trái tim.',
    learnedSentences: JSON.parse(localStorage.getItem('mh_learned_sentences') || '[]')
  };

  // DOM References
  const canvas = document.getElementById('videoCanvas');
  const ctx = canvas.getContext('2d');
  const slidesContainer = document.getElementById('slidesContainer');
  const slideCountText = document.getElementById('slideCountText');
  const masterScriptInput = document.getElementById('masterScriptInput');
  const previewSlideIndicator = document.getElementById('previewSlideIndicator');
  const quickSlideNumText = document.getElementById('quickSlideNumText');
  const quickSlideCaptionInput = document.getElementById('quickSlideCaptionInput');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playPauseText = document.getElementById('playPauseText');
  const aiStatusDot = document.getElementById('aiStatusDot');

  // Toast helper
  const showToast = (msg) => {
    const toast = document.getElementById('studioToast');
    const toastText = document.getElementById('studioToastText');
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  };

  // =========================================================================
  // 2. STEPPER NAVIGATION (BƯỚC 1 - 2 - 3 - 4)
  // =========================================================================
  const stepTabs = document.querySelectorAll('.step-tab');
  const stepPanels = document.querySelectorAll('.step-panel');

  const goToStep = (stepNum) => {
    stepTabs.forEach((tab) => {
      tab.classList.toggle('active', Number(tab.dataset.step) === Number(stepNum));
    });
    stepPanels.forEach((panel, idx) => {
      panel.classList.toggle('active', idx + 1 === Number(stepNum));
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  stepTabs.forEach((tab) => {
    tab.addEventListener('click', () => goToStep(tab.dataset.step));
  });

  document.querySelectorAll('.next-step-btn').forEach((btn) => {
    btn.addEventListener('click', () => goToStep(btn.dataset.next));
  });

  document.querySelectorAll('.prev-step-btn').forEach((btn) => {
    btn.addEventListener('click', () => goToStep(btn.dataset.prev));
  });

  // =========================================================================
  // 3. QUẢN LÝ TƯ LIỆU ẢNH & VIDEO (BƯỚC 1)
  // =========================================================================
  const mediaFileInput = document.getElementById('mediaFileInput');
  const triggerUploadBtn = document.getElementById('triggerUploadBtn');
  const loadSampleBtn = document.getElementById('loadSampleBtn');
  const clearAllMediaBtn = document.getElementById('clearAllMediaBtn');

  triggerUploadBtn?.addEventListener('click', () => mediaFileInput?.click());

  const fileToDataUrl = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });

  const createSlideFromUrl = (url, type, defaultCaption, base64Data = null) =>
    new Promise((resolve) => {
      const id = 'slide_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      if (type === 'video') {
        const video = document.createElement('video');
        video.src = url;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';
        video.onloadeddata = () => {
          resolve({ id, type: 'video', url, element: video, caption: defaultCaption, base64: null });
        };
        video.onerror = () => resolve(null);
      } else {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          resolve({ id, type: 'image', url, element: img, caption: defaultCaption, base64: base64Data });
        };
        img.onerror = () => resolve(null);
        img.src = url;
      }
    });

  mediaFileInput?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    showToast(`Đang nạp ${files.length} tệp tư liệu...`);
    const presetPool = PRESET_SCRIPTS['cuoc-song'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const objectUrl = URL.createObjectURL(file);
      let base64 = null;
      if (!isVideo && file.size < 6 * 1024 * 1024) {
        base64 = await fileToDataUrl(file);
      }
      const nextCaption = presetPool[(state.slides.length + i) % presetPool.length];
      const slide = await createSlideFromUrl(objectUrl, isVideo ? 'video' : 'image', nextCaption, base64);
      if (slide) {
        state.slides.push(slide);
      }
    }

    mediaFileInput.value = '';
    syncSlidesUI();
    showToast(`Đã thêm thành công! Hiện có ${state.slides.length} cảnh.`);
  });

  // Load Sample Photos of Mai Hường
  const loadSamplePhotos = async () => {
    const samples = [
      {
        url: 'a1.jpg',
        caption: 'Chào mừng bạn đến với không gian Mai Hường — Cuộc Sống Tươi Đẹp!'
      },
      {
        url: 'a7.jpg',
        caption: 'Từ AI đến Trái Tim — Trải nghiệm thực hành AI cùng âm nhạc đầy cảm xúc.'
      },
      {
        url: 'a5.jpg',
        caption: 'Hành trình khám phá thiên nhiên tươi đẹp cùng những người bạn tuyệt vời.'
      },
      {
        url: 'a6.jpg',
        caption: 'Gắn kết yêu thương, lưu giữ những kỷ niệm đáng nhớ trên mọi miền Tổ quốc.'
      },
      {
        url: 'a8.jpg',
        caption: 'Học AI dễ dàng, ứng dụng thực tế và lan tỏa năng lượng tích cực mỗi ngày!'
      }
    ];

    state.slides = [];
    for (const item of samples) {
      const slide = await createSlideFromUrl(item.url, 'image', item.caption, null);
      if (slide) state.slides.push(slide);
    }
    state.currentSlideIndex = 0;
    state.slideElapsed = 0;
    syncSlidesUI();
  };

  loadSampleBtn?.addEventListener('click', async () => {
    await loadSamplePhotos();
    showToast('Đã nạp bộ 5 bức ảnh mẫu của chị Mai Hường!');
  });

  clearAllMediaBtn?.addEventListener('click', () => {
    state.slides = [];
    state.currentSlideIndex = 0;
    syncSlidesUI();
    showToast('Đã xóa danh sách cảnh.');
  });

  const syncSlidesUI = () => {
    if (slideCountText) slideCountText.textContent = String(state.slides.length);

    if (!slidesContainer) return;
    slidesContainer.innerHTML = '';

    if (state.slides.length === 0) {
      slidesContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #7a646b; background: #fff9fb; border-radius: 14px; border: 1px dashed #d8b4c0;">
          Chưa có ảnh hoặc video nào. Chị hãy bấm nút <strong>"Chọn Ảnh / Video Từ Máy"</strong> hoặc <strong>"Nạp Bộ Ảnh Mẫu Của Mai Hường"</strong> ở trên nhé!
        </div>
      `;
      if (masterScriptInput) masterScriptInput.value = '';
      if (previewSlideIndicator) previewSlideIndicator.textContent = '0 / 0';
      return;
    }

    if (state.currentSlideIndex >= state.slides.length) {
      state.currentSlideIndex = 0;
    }

    state.slides.forEach((slide, idx) => {
      const card = document.createElement('div');
      card.className = 'slide-item-card' + (idx === state.currentSlideIndex ? ' active-slide' : '');

      const mediaTag =
        slide.type === 'video'
          ? `<video src="${slide.url}" muted></video>`
          : `<img src="${slide.url}" alt="Cảnh ${idx + 1}" />`;

      card.innerHTML = `
        <div class="slide-thumb-wrap" data-idx="${idx}" title="Bấm để xem cảnh này">
          ${mediaTag}
          <span class="slide-order-badge">Cảnh ${idx + 1}</span>
        </div>
        <div class="slide-caption-col">
          <label>Lời bình / Phụ đề Cảnh ${idx + 1}:</label>
          <input type="text" class="big-input slide-caption-input" data-idx="${idx}" value="${slide.caption.replace(/"/g, '&quot;')}" placeholder="Nhập lời bình cho cảnh ${idx + 1}..." />
        </div>
        <div class="slide-item-actions">
          <button type="button" class="btn btn-sm btn-outline move-up-btn" data-idx="${idx}" title="Đưa lên trước" ${idx === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="btn btn-sm btn-outline move-down-btn" data-idx="${idx}" title="Đưa xuống sau" ${idx === state.slides.length - 1 ? 'disabled' : ''}>▼</button>
          <button type="button" class="btn btn-sm btn-ghost delete-slide-btn" data-idx="${idx}" title="Xóa cảnh này">✕</button>
        </div>
      `;
      slidesContainer.appendChild(card);
    });

    // Attach listeners
    slidesContainer.querySelectorAll('.slide-thumb-wrap').forEach((el) => {
      el.addEventListener('click', () => {
        state.currentSlideIndex = Number(el.dataset.idx);
        state.slideElapsed = 0;
        syncSlidesUI();
      });
    });

    slidesContainer.querySelectorAll('.slide-caption-input').forEach((input) => {
      input.addEventListener('input', () => {
        const idx = Number(input.dataset.idx);
        if (state.slides[idx]) {
          state.slides[idx].caption = input.value;
          updateMasterTextareaFromSlides();
          if (idx === state.currentSlideIndex && quickSlideCaptionInput) {
            quickSlideCaptionInput.value = input.value;
          }
        }
      });
    });

    slidesContainer.querySelectorAll('.move-up-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        if (idx > 0) {
          const temp = state.slides[idx - 1];
          state.slides[idx - 1] = state.slides[idx];
          state.slides[idx] = temp;
          state.currentSlideIndex = idx - 1;
          syncSlidesUI();
        }
      });
    });

    slidesContainer.querySelectorAll('.move-down-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        if (idx < state.slides.length - 1) {
          const temp = state.slides[idx + 1];
          state.slides[idx + 1] = state.slides[idx];
          state.slides[idx] = temp;
          state.currentSlideIndex = idx + 1;
          syncSlidesUI();
        }
      });
    });

    slidesContainer.querySelectorAll('.delete-slide-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        state.slides.splice(idx, 1);
        syncSlidesUI();
      });
    });

    updateMasterTextareaFromSlides();
    updateQuickCaptionBox();
  };

  const updateMasterTextareaFromSlides = () => {
    if (!masterScriptInput) return;
    masterScriptInput.value = state.slides.map((s) => s.caption).join('\n');
  };

  const updateQuickCaptionBox = () => {
    const total = state.slides.length;
    const cur = total > 0 ? state.currentSlideIndex + 1 : 0;
    if (previewSlideIndicator) {
      previewSlideIndicator.textContent = `Cảnh ${cur} / ${total}`;
    }
    if (quickSlideNumText) {
      quickSlideNumText.textContent = `Cảnh ${cur}`;
    }
    if (quickSlideCaptionInput && state.slides[state.currentSlideIndex]) {
      quickSlideCaptionInput.value = state.slides[state.currentSlideIndex].caption;
    }
  };

  quickSlideCaptionInput?.addEventListener('input', () => {
    const slide = state.slides[state.currentSlideIndex];
    if (slide) {
      slide.caption = quickSlideCaptionInput.value;
      updateMasterTextareaFromSlides();
      const inputInList = slidesContainer?.querySelector(
        `.slide-caption-input[data-idx="${state.currentSlideIndex}"]`
      );
      if (inputInList) inputInList.value = slide.caption;
    }
  });

  // Apply Master Script Button
  document.getElementById('applyMasterScriptBtn')?.addEventListener('click', () => {
    const lines = (masterScriptInput?.value || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    state.slides.forEach((s, idx) => {
      if (lines[idx]) s.caption = lines[idx];
    });
    // Record into learned memory so AI adapts to Ms. Mai Hường's phrasing
    lines.slice(0, 5).forEach((line) => {
      if (line.length > 15 && !state.learnedSentences.includes(line)) {
        state.learnedSentences.unshift(line);
      }
    });
    state.learnedSentences = state.learnedSentences.slice(0, 12);
    localStorage.setItem('mh_learned_sentences', JSON.stringify(state.learnedSentences));
    updateAiMemoryUI();

    syncSlidesUI();
    showToast('Đã cập nhật lời bình vào toàn bộ các cảnh & lưu học văn phong!');
  });

  // Preset Chips
  document.querySelectorAll('.preset-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.preset || 'cuoc-song';
      const pool = PRESET_SCRIPTS[key] || PRESET_SCRIPTS['cuoc-song'];
      state.slides.forEach((s, idx) => {
        s.caption = pool[idx % pool.length];
      });
      syncSlidesUI();
      showToast('Đã áp dụng mẫu lời bình! Chị có thể xem ngay trên màn hình bên phải.');
    });
  });

  // =========================================================================
  // 4. TÍCH HỢP AI API KEY & HỌC PHONG CÁCH (GEMINI VISION / OPENAI)
  // =========================================================================
  const aiModalBackdrop = document.getElementById('aiModalBackdrop');
  const openAiModalBtn = document.getElementById('openAiModalBtn');
  const configAiInlineBtn = document.getElementById('configAiInlineBtn');
  const closeAiModalBtn = document.getElementById('closeAiModalBtn');
  const aiProviderSelect = document.getElementById('aiProviderSelect');
  const aiApiKeyInput = document.getElementById('aiApiKeyInput');
  const userPersonaInput = document.getElementById('userPersonaInput');
  const saveAiConfigBtn = document.getElementById('saveAiConfigBtn');
  const testAiKeyBtn = document.getElementById('testAiKeyBtn');
  const toggleShowKeyBtn = document.getElementById('toggleShowKeyBtn');
  const aiMemoryStatsText = document.getElementById('aiMemoryStatsText');
  const aiFeedbackBanner = document.getElementById('aiFeedbackBanner');

  const updateAiStatusIndicator = () => {
    if (aiStatusDot) {
      aiStatusDot.classList.toggle('connected', Boolean(state.aiApiKey && state.aiApiKey.length > 10));
    }
  };

  const updateAiMemoryUI = () => {
    if (!aiMemoryStatsText) return;
    if (state.learnedSentences.length === 0) {
      aiMemoryStatsText.textContent =
        'AI đang sẵn sàng học và ghi nhớ những câu lời bình chị yêu thích nhất để tối ưu lần sau.';
    } else {
      aiMemoryStatsText.textContent = `AI đã học ${state.learnedSentences.length} câu mẫu mang phong cách riêng của chị Mai Hường (Ví dụ: "${state.learnedSentences[0]}").`;
    }
  };

  const openAiModal = () => {
    if (aiProviderSelect) aiProviderSelect.value = state.aiProvider;
    if (aiApiKeyInput) aiApiKeyInput.value = state.aiApiKey;
    if (userPersonaInput) userPersonaInput.value = state.userPersona;
    updateAiMemoryUI();
    aiModalBackdrop?.removeAttribute('hidden');
  };

  const closeAiModal = () => {
    aiModalBackdrop?.setAttribute('hidden', '');
  };

  openAiModalBtn?.addEventListener('click', openAiModal);
  configAiInlineBtn?.addEventListener('click', openAiModal);
  closeAiModalBtn?.addEventListener('click', closeAiModal);

  toggleShowKeyBtn?.addEventListener('click', () => {
    if (!aiApiKeyInput) return;
    aiApiKeyInput.type = aiApiKeyInput.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('ResetAiMemoryBtn')?.addEventListener('click', () => {
    state.learnedSentences = [];
    localStorage.removeItem('mh_learned_sentences');
    updateAiMemoryUI();
    showToast('Đã làm mới bộ nhớ học văn phong AI.');
  });

  saveAiConfigBtn?.addEventListener('click', () => {
    state.aiProvider = aiProviderSelect?.value || 'gemini';
    state.aiApiKey = (aiApiKeyInput?.value || '').trim();
    state.userPersona = (userPersonaInput?.value || '').trim();

    localStorage.setItem('mh_ai_provider', state.aiProvider);
    localStorage.setItem('mh_ai_key', state.aiApiKey);
    localStorage.setItem('mh_user_persona', state.userPersona);

    updateAiStatusIndicator();
    closeAiModal();
    showToast('Đã lưu cài đặt AI API Key và hồ sơ phong cách Mai Hường!');
  });

  // Helper to call Gemini or OpenAI API
  const callAiModel = async (promptText, imageBase64List = []) => {
    const key = state.aiApiKey.trim();
    if (!key) {
      throw new Error('NO_KEY');
    }

    if (state.aiProvider === 'gemini') {
      const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      let lastErr = null;

      for (const modelName of models) {
        try {
          const parts = [{ text: promptText }];
          imageBase64List.slice(0, 5).forEach((b64) => {
            if (b64 && b64.includes('base64,')) {
              const [meta, data] = b64.split('base64,');
              const mimeMatch = meta.match(/data:(.*?);/);
              const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
              parts.push({ inline_data: { mime_type: mimeType, data } });
            }
          });

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(key)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: { temperature: 0.75 }
              })
            }
          );

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData?.error?.message || `HTTP ${res.status}`);
          }

          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) return text;
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr || new Error('Không thể kết nối Gemini API');
    } else {
      // OpenAI API
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: state.userPersona },
            { role: 'user', content: promptText }
          ],
          temperature: 0.75
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      return data?.choices?.[0]?.message?.content || '';
    }
  };

  testAiKeyBtn?.addEventListener('click', async () => {
    state.aiProvider = aiProviderSelect?.value || 'gemini';
    state.aiApiKey = (aiApiKeyInput?.value || '').trim();
    if (!state.aiApiKey) {
      showToast('Chị vui lòng dán mã API Key vào ô trước khi kiểm tra nhé!');
      return;
    }
    testAiKeyBtn.disabled = true;
    try {
      const reply = await callAiModel('Hãy chào chị Mai Hường bằng 1 câu thật ấm áp và ngắn gọn.');
      showToast('Kết nối AI thành công: ' + reply.slice(0, 60));
      updateAiStatusIndicator();
    } catch (err) {
      showToast('Lỗi kết nối Key: ' + (err.message || 'Vui lòng kiểm tra lại mã Key'));
    } finally {
      testAiKeyBtn.disabled = false;
    }
  });

  // Generate Script with AI
  document.getElementById('generateAiScriptBtn')?.addEventListener('click', async () => {
    const count = Math.max(state.slides.length, 5);
    const topicSelect = document.getElementById('aiTopicSelect');
    const topicLabel = topicSelect?.options[topicSelect.selectedIndex]?.text || 'Cuộc sống tươi đẹp';
    const customIdea = (document.getElementById('aiCustomPrompt')?.value || '').trim();
    const topicKey = topicSelect?.value || 'cuoc-song';

    if (aiFeedbackBanner) {
      aiFeedbackBanner.hidden = false;
      aiFeedbackBanner.textContent = '⏳ Trợ lý AI đang phân tích hình ảnh và sáng tác lời bình cho từng cảnh...';
    }

    try {
      const learnedContext =
        state.learnedSentences.length > 0
          ? `\nCác câu mẫu chị Mai Hường từng yêu thích để học theo văn phong:\n- ${state.learnedSentences.slice(0, 5).join('\n- ')}`
          : '';

      const prompt = `${state.userPersona}${learnedContext}
Hãy đóng vai chị Mai Hường và viết chính xác ${count} câu lời bình/phụ đề video (mỗi câu trên 1 dòng, độ dài mỗi câu khoảng 12 đến 24 chữ, không đánh số thứ tự đầu dòng, không dùng dấu ngoặc kép) cho video có ${count} cảnh.
Chủ đề: ${topicLabel}.
${customIdea ? `Bối cảnh / Kỷ niệm cụ thể: ${customIdea}.` : ''}
Nếu có hình ảnh đính kèm, hãy viết lời bình khớp tinh tế với cảm xúc và khung cảnh trong ảnh.`;

      const b64Images = state.slides.map((s) => s.base64).filter(Boolean);
      const aiResponse = await callAiModel(prompt, b64Images);

      const lines = aiResponse
        .split('\n')
        .map((l) => l.replace(/^(\d+[\.\)\-\:]|\-|\*)\s*/, '').trim())
        .filter((l) => l.length > 4);

      if (lines.length > 0) {
        state.slides.forEach((s, idx) => {
          s.caption = lines[idx % lines.length];
        });
        syncSlidesUI();
        if (aiFeedbackBanner) {
          aiFeedbackBanner.textContent =
            '✨ Đã sáng tác lời bình bằng AI API Key thành công! Chị có thể xem ngay trên màn hình chiếu.';
        }
        showToast('AI đã sáng tác xong lời bình cho toàn bộ các cảnh!');
        return;
      }
    } catch (err) {
      // Fallback intelligent generator when no API key is entered yet
      const basePool = PRESET_SCRIPTS[topicKey] || PRESET_SCRIPTS['cuoc-song'];
      state.slides.forEach((s, idx) => {
        if (customIdea && idx === 0) {
          s.caption = `${customIdea} — Khoảnh khắc đáng nhớ cùng Mai Hường.`;
        } else {
          s.caption = basePool[idx % basePool.length];
        }
      });
      syncSlidesUI();
      if (aiFeedbackBanner) {
        aiFeedbackBanner.textContent = state.aiApiKey
          ? '✨ Đã tạo lời bình thông minh theo chủ đề đã chọn!'
          : '✨ Đã tạo lời bình mẫu thông minh! (Mẹo: Chị có thể bấm "Cài đặt AI API Key" ở góc trên để AI nhìn ảnh viết lời bình riêng nhé).';
      }
      showToast('Đã tạo lời bình cho từng cảnh!');
    }
  });

  // Polish existing script & learn style
  document.getElementById('polishScriptBtn')?.addEventListener('click', async () => {
    const currentLines = (masterScriptInput?.value || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (currentLines.length === 0) {
      showToast('Chị hãy nhập hoặc chọn mẫu lời bình trước nhé!');
      return;
    }

    // Save into learned memory
    currentLines.forEach((line) => {
      if (line.length > 12 && !state.learnedSentences.includes(line)) {
        state.learnedSentences.unshift(line);
      }
    });
    state.learnedSentences = state.learnedSentences.slice(0, 12);
    localStorage.setItem('mh_learned_sentences', JSON.stringify(state.learnedSentences));
    updateAiMemoryUI();

    if (state.aiApiKey) {
      try {
        const prompt = `${state.userPersona}\nHãy trau chuốt lại ${currentLines.length} câu phụ đề dưới đây cho mượt mà, giàu cảm xúc và thơ mộng hơn (giữ nguyên số dòng, mỗi dòng 1 câu, không đánh số thứ tự):\n${currentLines.join('\n')}`;
        const reply = await callAiModel(prompt);
        const polished = reply
          .split('\n')
          .map((l) => l.replace(/^(\d+[\.\)\-\:]|\-|\*)\s*/, '').trim())
          .filter(Boolean);
        if (polished.length > 0) {
          state.slides.forEach((s, idx) => {
            if (polished[idx]) s.caption = polished[idx];
          });
          syncSlidesUI();
          showToast('AI đã trau chuốt câu chữ và ghi nhớ văn phong của chị!');
          return;
        }
      } catch {
        // Fallback below
      }
    }

    showToast('Đã lưu học văn phong của chị Mai Hường và đồng bộ phụ đề!');
  });

  // =========================================================================
  // 5. CÀI ĐẶT CHỮ PHỤ ĐỀ, KHUNG HÌNH & HIỆU ỨNG
  // =========================================================================
  document.getElementById('subFontSize')?.addEventListener('change', (e) => {
    state.subFontSize = Number(e.target.value);
  });
  document.getElementById('subColorTheme')?.addEventListener('change', (e) => {
    state.subColorTheme = e.target.value;
  });
  document.getElementById('subFontFamily')?.addEventListener('change', (e) => {
    state.subFontFamily = e.target.value;
  });
  document.getElementById('subPosition')?.addEventListener('change', (e) => {
    state.subPosition = e.target.value;
  });

  document.getElementById('aspectRatioSelect')?.addEventListener('change', (e) => {
    state.aspectRatio = e.target.value;
    if (state.aspectRatio === '16:9') {
      canvas.width = 1280;
      canvas.height = 720;
    } else if (state.aspectRatio === '9:16') {
      canvas.width = 720;
      canvas.height = 1280;
    } else {
      canvas.width = 1080;
      canvas.height = 1080;
    }
    initParticles();
  });

  document.getElementById('slideDurationSelect')?.addEventListener('change', (e) => {
    state.slideDuration = Number(e.target.value);
  });
  document.getElementById('visualEffectSelect')?.addEventListener('change', (e) => {
    state.visualEffect = e.target.value;
    initParticles();
  });
  document.getElementById('frameStyleSelect')?.addEventListener('change', (e) => {
    state.frameStyle = e.target.value;
  });
  document.getElementById('movieTitleInput')?.addEventListener('input', (e) => {
    state.movieTitle = e.target.value;
  });
  document.getElementById('watermarkTextInput')?.addEventListener('input', (e) => {
    state.watermarkText = e.target.value;
  });

  // =========================================================================
  // 6. HỆ THỐNG ÂM THANH: GHI ÂM GIỌNG THẬT, TTS AI & NHẠC NỀN WEBAUDIO
  // =========================================================================
  let mediaRecorderVoice = null;
  let voiceChunks = [];
  let isRecordingVoice = false;
  let recTimerInterval = null;
  let recSeconds = 0;

  const startRecordBtn = document.getElementById('startRecordBtn');
  const recordBtnText = document.getElementById('recordBtnText');
  const recordingTimer = document.getElementById('recordingTimer');
  const recTimeText = document.getElementById('recTimeText');
  const recordedAudioPreviewBox = document.getElementById('recordedAudioPreviewBox');
  const recordedAudioPlayer = document.getElementById('recordedAudioPlayer');

  startRecordBtn?.addEventListener('click', async () => {
    if (!isRecordingVoice) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        voiceChunks = [];
        mediaRecorderVoice = new MediaRecorder(stream);

        mediaRecorderVoice.ondataavailable = (ev) => {
          if (ev.data.size > 0) voiceChunks.push(ev.data);
        };

        mediaRecorderVoice.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(voiceChunks, { type: 'audio/webm' });
          state.recordedVoiceUrl = URL.createObjectURL(blob);
          if (recordedAudioPlayer) recordedAudioPlayer.src = state.recordedVoiceUrl;
          if (recordedAudioPreviewBox) recordedAudioPreviewBox.hidden = false;
          showToast('Đã lưu bản thu âm giọng thật của chị Mai Hường!');
        };

        mediaRecorderVoice.start();
        isRecordingVoice = true;
        recSeconds = 0;
        startRecordBtn.classList.add('recording');
        if (recordBtnText) recordBtnText.textContent = 'Đang Thu Âm... (Bấm Để Dừng & Lưu)';
        if (recordingTimer) recordingTimer.hidden = false;

        recTimerInterval = setInterval(() => {
          recSeconds++;
          const m = String(Math.floor(recSeconds / 60)).padStart(2, '0');
          const s = String(recSeconds % 60).padStart(2, '0');
          if (recTimeText) recTimeText.textContent = `${m}:${s}`;
        }, 1000);
      } catch {
        showToast('Không tìm thấy Micro hoặc trình duyệt chưa được cấp quyền thu âm.');
      }
    } else {
      mediaRecorderVoice?.stop();
      isRecordingVoice = false;
      clearInterval(recTimerInterval);
      startRecordBtn.classList.remove('recording');
      if (recordBtnText) recordBtnText.textContent = 'Bấm Để Thu Âm Lại Giọng Nói';
      if (recordingTimer) recordingTimer.hidden = true;
    }
  });

  document.getElementById('clearRecordedVoiceBtn')?.addEventListener('click', () => {
    state.recordedVoiceUrl = null;
    if (recordedAudioPlayer) recordedAudioPlayer.src = '';
    if (recordedAudioPreviewBox) recordedAudioPreviewBox.hidden = true;
    showToast('Đã xóa bản thu âm.');
  });

  // TTS (Giọng đọc AI tiếng Việt)
  const enableTtsCheckbox = document.getElementById('enableTtsCheckbox');
  const ttsRateRange = document.getElementById('ttsRateRange');
  const ttsRateVal = document.getElementById('ttsRateVal');

  enableTtsCheckbox?.addEventListener('change', (e) => {
    state.enableTts = e.target.checked;
  });

  ttsRateRange?.addEventListener('input', (e) => {
    state.ttsRate = Number(e.target.value);
    if (ttsRateVal) ttsRateVal.textContent = `${state.ttsRate}x`;
  });

  const speakVietnameseText = (text) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'vi-VN';
    utter.rate = state.ttsRate;
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.toLowerCase().includes('vi'));
    if (viVoice) utter.voice = viVoice;
    window.speechSynthesis.speak(utter);
  };

  document.getElementById('testTtsBtn')?.addEventListener('click', () => {
    const sampleCaption =
      state.slides[state.currentSlideIndex]?.caption ||
      'Chào mừng bạn đến với Mai Hường Cuộc Sống Tươi Đẹp!';
    speakVietnameseText(sampleCaption);
  });

  // Background Music Upload & Procedural Synthesizer
  const bgmFileInput = document.getElementById('bgmFileInput');
  const triggerBgmUploadBtn = document.getElementById('triggerBgmUploadBtn');
  const bgmFileNameText = document.getElementById('bgmFileNameText');
  const builtinBgmSelect = document.getElementById('builtinBgmSelect');

  triggerBgmUploadBtn?.addEventListener('click', () => bgmFileInput?.click());

  bgmFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    state.customBgmUrl = URL.createObjectURL(file);
    state.builtinBgm = 'custom';
    if (builtinBgmSelect) builtinBgmSelect.value = 'custom';
    if (bgmFileNameText) bgmFileNameText.textContent = file.name;
    showToast(`Đã nạp file nhạc: ${file.name}`);
  });

  builtinBgmSelect?.addEventListener('change', (e) => {
    state.builtinBgm = e.target.value;
  });

  document.getElementById('bgmVolumeRange')?.addEventListener('input', (e) => {
    state.bgmVolume = Number(e.target.value) / 100;
    const label = document.getElementById('bgmVolText');
    if (label) label.textContent = `${e.target.value}%`;
  });

  document.getElementById('voiceVolumeRange')?.addEventListener('input', (e) => {
    state.voiceVolume = Number(e.target.value) / 100;
    const label = document.getElementById('voiceVolText');
    if (label) label.textContent = `${e.target.value}%`;
  });

  // WebAudio Engine for Mixing & Recording into Exported Video
  let audioCtx = null;
  let synthInterval = null;
  let customBgmAudioEl = null;
  let voicePlayAudioEl = null;

  const stopAllAudio = () => {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
    if (customBgmAudioEl) {
      customBgmAudioEl.pause();
      customBgmAudioEl = null;
    }
    if (voicePlayAudioEl) {
      voicePlayAudioEl.pause();
      voicePlayAudioEl = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const startSoundtrack = (streamDestination = null) => {
    stopAllAudio();
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Play recorded voice if available
    if (state.recordedVoiceUrl) {
      voicePlayAudioEl = new Audio(state.recordedVoiceUrl);
      voicePlayAudioEl.volume = state.voiceVolume;
      if (streamDestination) {
        const srcNode = audioCtx.createMediaElementSource(voicePlayAudioEl);
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = state.voiceVolume;
        srcNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.connect(streamDestination);
      }
      voicePlayAudioEl.play().catch(() => {});
    }

    if (state.builtinBgm === 'none') return;

    if (state.builtinBgm === 'custom' && state.customBgmUrl) {
      customBgmAudioEl = new Audio(state.customBgmUrl);
      customBgmAudioEl.loop = true;
      customBgmAudioEl.volume = state.bgmVolume;
      if (streamDestination) {
        const bgmSource = audioCtx.createMediaElementSource(customBgmAudioEl);
        const bgmGain = audioCtx.createGain();
        bgmGain.gain.value = state.bgmVolume;
        bgmSource.connect(bgmGain);
        bgmGain.connect(audioCtx.destination);
        bgmGain.connect(streamDestination);
      }
      customBgmAudioEl.play().catch(() => {});
      return;
    }

    // Procedural Piano/Ambient Melody (Guaranteed copyright-free & works offline/online)
    const scales = {
      peaceful: [261.63, 329.63, 392.0, 523.25, 440.0, 349.23, 392.0, 493.88],
      joyful: [293.66, 369.99, 440.0, 587.33, 493.88, 587.33, 659.25, 587.33],
      nostalgic: [220.0, 261.63, 329.63, 440.0, 392.0, 329.63, 293.66, 329.63]
    };
    const notes = scales[state.builtinBgm] || scales.peaceful;
    let step = 0;

    const playNote = () => {
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = state.builtinBgm === 'joyful' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(notes[step % notes.length], now);

      const maxVol = Math.max(0.01, state.bgmVolume * 0.22);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(maxVol, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (streamDestination) {
        gain.connect(streamDestination);
      }

      osc.start(now);
      osc.stop(now + 1.45);
      step++;
    };

    playNote();
    synthInterval = setInterval(playNote, 650);
  };

  let isPreviewingBgm = false;
  document.getElementById('previewBgmBtn')?.addEventListener('click', () => {
    if (!isPreviewingBgm) {
      startSoundtrack();
      isPreviewingBgm = true;
      showToast('Đang phát thử nhạc nền...');
    } else {
      stopAllAudio();
      isPreviewingBgm = false;
      showToast('Đã dừng nghe thử nhạc.');
    }
  });

  // =========================================================================
  // 7. BỘ DỰNG HÌNH CANVAS 60FPS (HIỆU ỨNG, KHUNG VIỀN, PHỤ ĐỀ CỠ LỚN)
  // =========================================================================
  let particles = [];
  const initParticles = () => {
    particles = [];
    for (let i = 0; i < 32; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 4 + Math.random() * 10,
        speedY: 0.4 + Math.random() * 1.1,
        speedX: (Math.random() - 0.5) * 0.7,
        alpha: 0.35 + Math.random() * 0.55
      });
    }
  };
  initParticles();

  const drawCoverMedia = (mediaEl, zoomFactor = 1.0) => {
    const cw = canvas.width;
    const ch = canvas.height;
    const mw = mediaEl.videoWidth || mediaEl.naturalWidth || cw;
    const mh = mediaEl.videoHeight || mediaEl.naturalHeight || ch;

    const scale = Math.max(cw / mw, ch / mh) * zoomFactor;
    const dw = mw * scale;
    const dh = mh * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.drawImage(mediaEl, dx, dy, dw, dh);
  };

  const wrapTextLines = (text, maxWidth) => {
    const words = (text || '').split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const renderFrame = (dt) => {
    const cw = canvas.width;
    const ch = canvas.height;

    // Clear background
    ctx.fillStyle = '#140d10';
    ctx.fillRect(0, 0, cw, ch);

    if (state.slides.length === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Chưa có ảnh/video. Hãy chọn ảnh ở Bước 1!', cw / 2, ch / 2);
      return;
    }

    const slide = state.slides[state.currentSlideIndex] || state.slides[0];
    const progress = Math.min(1, state.slideElapsed / state.slideDuration);

    // 1. Draw Slide Image/Video with smooth Ken Burns Zoom
    const zoom = 1.0 + progress * 0.08;
    if (slide && slide.element) {
      if (slide.type === 'video' && slide.element.paused) {
        slide.element.play().catch(() => {});
      }
      ctx.save();
      drawCoverMedia(slide.element, zoom);
      ctx.restore();
    }

    // Subtle vignette for subtitle readability
    const grad = ctx.createLinearGradient(0, ch * 0.55, 0, ch);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(10,6,8,0.68)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    // 2. Draw Visual Effect Particles
    if (state.visualEffect !== 'clean') {
      ctx.save();
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        if (p.y < -20) p.y = ch + 20;
        if (p.x < -20) p.x = cw + 20;
        if (p.x > cw + 20) p.x = -20;

        ctx.globalAlpha = p.alpha;
        if (state.visualEffect === 'golden-sparkles') {
          ctx.fillStyle = '#ffd43b';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.55, 0, Math.PI * 2);
          ctx.fill();
        } else if (state.visualEffect === 'petals') {
          ctx.fillStyle = '#ff85a1';
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size * 0.7, p.size * 0.4, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (state.visualEffect === 'hearts') {
          ctx.font = `${Math.round(p.size * 1.8)}px sans-serif`;
          ctx.fillText('💖', p.x, p.y);
        }
      });
      ctx.restore();
    }

    // 3. Draw Luxury Frame
    if (state.frameStyle === 'gold-luxury') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 212, 59, 0.85)';
      ctx.lineWidth = 4;
      ctx.strokeRect(24, 24, cw - 48, ch - 48);
      ctx.strokeStyle = 'rgba(255, 212, 59, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(34, 34, cw - 68, ch - 68);
      ctx.restore();
    } else if (state.frameStyle === 'cinema-bars') {
      const barH = Math.round(ch * 0.07);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, cw, barH);
      ctx.fillRect(0, ch - barH, cw, barH);
    } else if (state.frameStyle === 'rose-glow') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 133, 161, 0.85)';
      ctx.lineWidth = 8;
      ctx.strokeRect(16, 16, cw - 32, ch - 32);
      ctx.restore();
    }

    // 4. Draw Watermark Badge (Top Right)
    if (state.watermarkText.trim()) {
      ctx.save();
      ctx.font = 'bold 22px "Be Vietnam Pro", sans-serif';
      const wmText = state.watermarkText.trim();
      const wmW = ctx.measureText(wmText).width + 36;
      const wmX = cw - wmW - 42;
      const wmY = 42;

      ctx.fillStyle = 'rgba(20, 13, 16, 0.65)';
      ctx.beginPath();
      ctx.roundRect(wmX, wmY, wmW, 44, 22);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 212, 59, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fff5f8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(wmText, wmX + wmW / 2, wmY + 22);
      ctx.restore();
    }

    // 5. Draw Opening Movie Title Banner on Slide 1 (First 2.5 seconds)
    if (state.currentSlideIndex === 0 && state.slideElapsed < 2.6 && state.movieTitle.trim()) {
      ctx.save();
      ctx.font = 'bold 28px "Be Vietnam Pro", sans-serif';
      const tText = '✦ ' + state.movieTitle.trim() + ' ✦';
      ctx.fillStyle = 'rgba(214, 51, 108, 0.88)';
      const tW = ctx.measureText(tText).width + 48;
      ctx.beginPath();
      ctx.roundRect(42, 42, tW, 48, 24);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tText, 42 + tW / 2, 66);
      ctx.restore();
    }

    // 6. Draw Large, Clear Subtitles (Lời bình / Phụ đề)
    const caption = (slide?.caption || '').trim();
    if (caption) {
      ctx.save();
      const fontSize = state.subFontSize;
      ctx.font = `700 ${fontSize}px "${state.subFontFamily}", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const maxTextWidth = cw * 0.84;
      const lines = wrapTextLines(caption, maxTextWidth);
      const lineHeight = fontSize * 1.32;
      const totalBlockHeight = lines.length * lineHeight;

      let baseY = ch - totalBlockHeight - 68;
      if (state.subPosition === 'center') {
        baseY = (ch - totalBlockHeight) / 2;
      } else if (state.subPosition === 'top') {
        baseY = 110;
      }

      // Measure widest line for background box
      let widest = 0;
      lines.forEach((l) => {
        const w = ctx.measureText(l).width;
        if (w > widest) widest = w;
      });

      const boxPadX = 36;
      const boxPadY = 20;
      const boxX = (cw - widest) / 2 - boxPadX;
      const boxY = baseY - boxPadY;
      const boxW = widest + boxPadX * 2;
      const boxH = totalBlockHeight + boxPadY * 2;

      if (state.subColorTheme === 'gold-box') {
        ctx.fillStyle = 'rgba(18, 12, 15, 0.78)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 20);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 212, 59, 0.75)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (state.subColorTheme === 'rose-badge') {
        ctx.fillStyle = 'rgba(194, 37, 92, 0.86)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 20);
        ctx.fill();
      } else if (state.subColorTheme === 'emerald-box') {
        ctx.fillStyle = 'rgba(9, 146, 104, 0.86)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 20);
        ctx.fill();
      }

      lines.forEach((line, idx) => {
        const ly = baseY + idx * lineHeight + lineHeight / 2;
        if (state.subColorTheme === 'white-outline') {
          ctx.lineWidth = 8;
          ctx.strokeStyle = '#000000';
          ctx.strokeText(line, cw / 2, ly);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(line, cw / 2, ly);
        } else if (state.subColorTheme === 'gold-box') {
          ctx.fillStyle = '#ffd43b';
          ctx.fillText(line, cw / 2, ly);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.fillText(line, cw / 2, ly);
        }
      });

      ctx.restore();
    }
  };

  // Animation Loop
  let lastTime = performance.now();
  const tick = (now) => {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    if (state.isPlaying && state.slides.length > 0) {
      state.slideElapsed += dt;
      if (state.slideElapsed >= state.slideDuration) {
        state.slideElapsed = 0;
        if (state.currentSlideIndex < state.slides.length - 1) {
          state.currentSlideIndex++;
          updateQuickCaptionBox();
          if (state.enableTts && !state.recordedVoiceUrl) {
            speakVietnameseText(state.slides[state.currentSlideIndex]?.caption || '');
          }
        } else {
          // Reached end of movie
          if (!state.isExporting) {
            state.currentSlideIndex = 0;
            setPlayingState(false);
          }
        }
      }
    }

    renderFrame(dt);
    requestAnimationFrame(tick);
  };

  // =========================================================================
  // 8. ĐIỀU KHIỂN PHÁT XEM THỬ & XUẤT FILE VIDEO HOÀN CHỈNH (STEP 4)
  // =========================================================================
  const setPlayingState = (play, streamDestination = null) => {
    state.isPlaying = play;
    if (play) {
      if (playPauseText) playPauseText.textContent = 'Tạm Dừng Xem Thử';
      startSoundtrack(streamDestination);
      if (state.enableTts && !state.recordedVoiceUrl && state.slides[state.currentSlideIndex]) {
        speakVietnameseText(state.slides[state.currentSlideIndex].caption);
      }
    } else {
      if (playPauseText) playPauseText.textContent = 'Phát Xem Thử Toàn Bộ Phim';
      stopAllAudio();
    }
  };

  playPauseBtn?.addEventListener('click', () => {
    if (state.slides.length === 0) return;
    if (!state.isPlaying && state.currentSlideIndex === state.slides.length - 1 && state.slideElapsed > 0) {
      state.currentSlideIndex = 0;
      state.slideElapsed = 0;
    }
    setPlayingState(!state.isPlaying);
  });

  document.getElementById('prevSlideBtn')?.addEventListener('click', () => {
    if (state.slides.length === 0) return;
    state.currentSlideIndex =
      (state.currentSlideIndex - 1 + state.slides.length) % state.slides.length;
    state.slideElapsed = 0;
    syncSlidesUI();
  });

  document.getElementById('nextSlideBtn')?.addEventListener('click', () => {
    if (state.slides.length === 0) return;
    state.currentSlideIndex = (state.currentSlideIndex + 1) % state.slides.length;
    state.slideElapsed = 0;
    syncSlidesUI();
  });

  // EXPORT FULL VIDEO
  const exportVideoBtn = document.getElementById('exportVideoBtn');
  const exportProgressBox = document.getElementById('exportProgressBox');
  const exportStatusText = document.getElementById('exportStatusText');
  const exportPercentText = document.getElementById('exportPercentText');
  const exportProgressFill = document.getElementById('exportProgressFill');
  const downloadReadyBox = document.getElementById('downloadReadyBox');
  const manualDownloadLink = document.getElementById('manualDownloadLink');

  exportVideoBtn?.addEventListener('click', async () => {
    if (state.slides.length === 0) {
      showToast('Chị vui lòng chọn ít nhất 1 bức ảnh ở Bước 1 trước khi xuất video nhé!');
      return;
    }
    if (state.isExporting) return;

    state.isExporting = true;
    exportVideoBtn.disabled = true;
    if (downloadReadyBox) downloadReadyBox.hidden = true;
    if (exportProgressBox) exportProgressBox.hidden = false;

    // Prepare Audio Stream + Canvas Stream
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    const audioDest = audioCtx.createMediaStreamDestination();
    const canvasStream = canvas.captureStream(30);

    const combinedTracks = [
      ...canvasStream.getVideoTracks(),
      ...audioDest.stream.getAudioTracks()
    ];
    const combinedStream = new MediaStream(combinedTracks);

    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    const recordedChunks = [];
    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 4500000
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    const totalDurationSec = state.slides.length * state.slideDuration;
    let elapsedExportSec = 0;

    recorder.onstop = () => {
      setPlayingState(false);
      state.isExporting = false;
      exportVideoBtn.disabled = false;

      const blob = new Blob(recordedChunks, { type: mimeType });
      const videoUrl = URL.createObjectURL(blob);
      const fileName = `Mai-Huong-Video-${Date.now()}.webm`;

      if (manualDownloadLink) {
        manualDownloadLink.href = videoUrl;
        manualDownloadLink.download = fileName;
      }
      if (downloadReadyBox) downloadReadyBox.hidden = false;

      // Auto trigger download
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      showToast('🎉 Đã xuất và tải file Video hoàn chỉnh về máy!');
    };

    // Start playing from Slide 0
    state.currentSlideIndex = 0;
    state.slideElapsed = 0;
    updateQuickCaptionBox();

    recorder.start(200);
    setPlayingState(true, audioDest);

    const progressTimer = setInterval(() => {
      elapsedExportSec += 0.25;
      const pct = Math.min(100, Math.round((elapsedExportSec / totalDurationSec) * 100));
      if (exportPercentText) exportPercentText.textContent = `${pct}%`;
      if (exportProgressFill) exportProgressFill.style.width = `${pct}%`;
      if (exportStatusText) {
        exportStatusText.textContent = `Đang ghi hình Cảnh ${state.currentSlideIndex + 1}/${state.slides.length}... (${pct}%)`;
      }

      if (elapsedExportSec >= totalDurationSec) {
        clearInterval(progressTimer);
        recorder.stop();
      }
    }, 250);
  });

  // =========================================================================
  // 9. KHỞI TẠO BAN ĐẦU (NẠP SẴN ẢNH MẪU ĐỂ CHỊ MAI HƯỜNG THẤY NGAY)
  // =========================================================================
  updateAiStatusIndicator();
  updateAiMemoryUI();
  loadSamplePhotos().then(() => {
    requestAnimationFrame(tick);
  });
});
