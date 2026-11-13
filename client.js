window.__ModuleLoader__.load({
  id: '@cosmos-voyage/llm-quick-launch',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    // ---------------------------------------------------------------- storage
    const STORE_SITES = 'llm-quick-launch/sites/v1';
    const STORE_RECENT = 'llm-quick-launch/recent/v1';
    const STORE_PINNED = 'llm-quick-launch/pinned/v1';

    function lsGet(key) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }
    function lsSet(key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    }

    // ---------------------------------------------------------- logo sources
    // Priority: manual icon -> CDN mark (session cache) -> logos/<id>.svg -> vendor favicon -> resolver -> inline.
    const LOGO_SLUGS = {
      chatgpt: 'openai', claude: 'anthropic', gemini: 'googlegemini', grok: 'x',
      perplexity: 'perplexity', lechat: 'mistralai', deepseek: 'deepseek',
      kimi: 'kimi', qwen: 'qwen',
    };
    const LOGO_MEMORY = {};

    // Older versions persisted logos in localStorage; drop that leftover cache.
    try {
      const stale = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (key && key.indexOf('llm-quick-launch/logo/') === 0) stale.push(key);
      }
      stale.forEach(function (key) {
        try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
      });
    } catch (e) { /* ignore */ }

    function assetBase() {
      try {
        const boot = window.__DSH_BOOT__;
        const entry = boot && boot.entries && boot.entries.filter(function (e) {
          return e.id === '@cosmos-voyage/llm-quick-launch';
        })[0];
        if (!entry || !entry.url) return null;
        return new URL('.', new URL(entry.url, window.location.href)).href;
      } catch (e) {
        return null;
      }
    }

    function domainOf(url) {
      try {
        let host = new URL(url).hostname;
        if (host.indexOf('www.') === 0) host = host.slice(4);
        return host;
      } catch (e) {
        return null;
      }
    }

    function cachedLogo(slug) {
      return LOGO_MEMORY[slug] || null;
    }

    function fetchLogo(slug) {
      if (LOGO_MEMORY[slug]) return Promise.resolve(LOGO_MEMORY[slug]);
      if (typeof fetch !== 'function') return Promise.resolve(null);
      return fetch('https://cdn.simpleicons.org/' + slug + '/ffffff').then(function (res) {
        if (!res.ok) return null;
        return res.text();
      }).then(function (text) {
        if (!text || !/<svg[\s>]/i.test(text)) return null;
        const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text);
        LOGO_MEMORY[slug] = url;
        return url;
      }).catch(function () {
        return null;
      });
    }

    // ------------------------------------------------------------- brands/meta
    const DEFAULT_SITES = [
      { id: 'chatgpt',    url: 'https://chatgpt.com',           group: 'intl', logo: 'openai',    color: '#10a37f' },
      { id: 'claude',     url: 'https://claude.ai',             group: 'intl', logo: 'anthropic', color: '#d97757' },
      { id: 'gemini',     url: 'https://gemini.google.com',     group: 'intl', logo: 'gemini',    color: '#4285f4' },
      { id: 'grok',       url: 'https://grok.com',              group: 'intl', logo: 'x',         color: '#1a1a1a' },
      { id: 'perplexity', url: 'https://www.perplexity.ai',     group: 'intl', logo: 'perplexity',color: '#20808d' },
      { id: 'copilot',    url: 'https://copilot.microsoft.com', group: 'intl', logo: 'microsoft', color: '#f5f5f5', favicon: 'https://copilot.microsoft.com/favicon.ico' },
      { id: 'lechat',     url: 'https://chat.mistral.ai',       group: 'intl', logo: 'mistral',   color: '#ff5000' },
      { id: 'deepseek',   url: 'https://chat.deepseek.com',     group: 'intl', logo: 'deepseek',  color: '#4d6bfe' },
      { id: 'kimi',       url: 'https://www.kimi.com',          group: 'cn',   logo: 'kimi',      color: '#2e2e2e' },
      { id: 'qwen',       url: 'https://chat.qwen.ai',          group: 'cn',   logo: 'qwen',      color: '#615ced' },
      { id: 'doubao',     url: 'https://www.doubao.com',        group: 'cn',   logo: 'doubao',    color: '#00b578' },
      { id: 'yuanbao',    url: 'https://yuanbao.tencent.com',   group: 'cn',   logo: 'yuanbao',   color: '#0052d9', favicon: 'https://yuanbao.tencent.com/favicon.ico' },
      { id: 'wenxin',     url: 'https://yiyan.baidu.com',       group: 'cn',   logo: 'char', char: '文', color: '#2932e1', favicon: 'https://yiyan.baidu.com/favicon.ico' },
      { id: 'spark',      url: 'https://xinghuo.xfyun.cn',      group: 'cn',   logo: 'spark',    color: '#2878ff', favicon: 'https://xinghuo.xfyun.cn/favicon.ico' },
      { id: 'zhipu',      url: 'https://chatglm.cn',            group: 'cn',   logo: 'char', char: '智', color: '#4b57e8', favicon: 'https://chatglm.cn/favicon.ico' },
      { id: 'hailuo',     url: 'https://hailuoai.com',          group: 'cn',   logo: 'char', char: '海', color: '#7b5cf0', favicon: 'https://hailuoai.com/favicon.ico' },
    ];

    // Official vendor marks (Simple Icons, monochrome path data).
    const LOGO_PATHS = {
      openai: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z',
      anthropic: 'M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z',
      gemini: 'M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81',
      x: 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z',
      perplexity: 'M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z',
      copilot: 'M23.922 16.997C23.061 18.492 18.063 22.02 12 22.02 5.937 22.02.939 18.492.078 16.997A.641.641 0 0 1 0 16.741v-2.869a.883.883 0 0 1 .053-.22c.372-.935 1.347-2.292 2.605-2.656.167-.429.414-1.055.644-1.517a10.098 10.098 0 0 1-.052-1.086c0-1.331.282-2.499 1.132-3.368.397-.406.89-.717 1.474-.952C7.255 2.937 9.248 1.98 11.978 1.98c2.731 0 4.767.957 6.166 2.093.584.235 1.077.546 1.474.952.85.869 1.132 2.037 1.132 3.368 0 .368-.014.733-.052 1.086.23.462.477 1.088.644 1.517 1.258.364 2.233 1.721 2.605 2.656a.841.841 0 0 1 .053.22v2.869a.641.641 0 0 1-.078.256Zm-11.75-5.992h-.344a4.359 4.359 0 0 1-.355.508c-.77.947-1.918 1.492-3.508 1.492-1.725 0-2.989-.359-3.782-1.259a2.137 2.137 0 0 1-.085-.104L4 11.746v6.585c1.435.779 4.514 2.179 8 2.179 3.486 0 6.565-1.4 8-2.179v-6.585l-.098-.104s-.033.045-.085.104c-.793.9-2.057 1.259-3.782 1.259-1.59 0-2.738-.545-3.508-1.492a4.359 4.359 0 0 1-.355-.508Zm2.328 3.25c.549 0 1 .451 1 1v2c0 .549-.451 1-1 1-.549 0-1-.451-1-1v-2c0-.549.451-1 1-1Zm-5 0c.549 0 1 .451 1 1v2c0 .549-.451 1-1 1-.549 0-1-.451-1-1v-2c0-.549.451-1 1-1Zm3.313-6.185c.136 1.057.403 1.913.878 2.497.442.544 1.134.938 2.344.938 1.573 0 2.292-.337 2.657-.751.384-.435.558-1.15.558-2.361 0-1.14-.243-1.847-.705-2.319-.477-.488-1.319-.862-2.824-1.025-1.487-.161-2.192.138-2.533.529-.269.307-.437.808-.438 1.578v.021c0 .265.021.562.063.893Zm-1.626 0c.042-.331.063-.628.063-.894v-.02c-.001-.77-.169-1.271-.438-1.578-.341-.391-1.046-.69-2.533-.529-1.505.163-2.347.537-2.824 1.025-.462.472-.705 1.179-.705 2.319 0 1.211.175 1.926.558 2.361.365.414 1.084.751 2.657.751 1.21 0 1.902-.394 2.344-.938.475-.584.742-1.44.878-2.497Z',
      mistral: 'M17.143 3.429v3.428h-3.429v3.429h-3.428V6.857H6.857V3.43H3.43v13.714H0v3.428h10.286v-3.428H6.857v-3.429h3.429v3.429h3.429v-3.429h3.428v3.429h-3.428v3.428H24v-3.428h-3.43V3.429z',
      deepseek: 'M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86.47.234.962.328 1.78.398.629.058 1.235-.031 1.705-.129.735-.155.684-.836.418-.961-2.155-1.004-1.682-.595-2.112-.926 1.095-1.295 2.768-3.598 3.284-6.733.05-.346.115-.834.108-1.114-.004-.171.035-.238.23-.257a4.2 4.2 0 0 0 1.545-.475c1.397-.763 1.96-2.016 2.093-3.517.02-.23-.004-.467-.247-.588M11.58 18.168c-2.088-1.642-3.101-2.183-3.52-2.16-.39.024-.32.472-.234.763.09.288.207.487.371.74.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.168-1.361-.801-2.5-1.86-3.301-3.306-.775-1.393-1.225-2.888-1.299-4.482-.02-.385.094-.522.477-.592a4.7 4.7 0 0 1 1.53-.038c2.131.311 3.946 1.264 5.467 2.774.868.86 1.525 1.887 2.202 2.89.72 1.066 1.494 2.082 2.48 2.915.348.291.626.513.892.677-.802.09-2.14.109-3.055-.615zm1.001-6.44a.306.306 0 0 1 .415-.287.3.3 0 0 1 .113.074.3.3 0 0 1 .086.214c0 .17-.136.307-.308.307a.303.303 0 0 1-.306-.307m3.11 1.596c-.2.081-.4.151-.591.16a1.25 1.25 0 0 1-.798-.254c-.274-.23-.47-.358-.551-.758a1.7 1.7 0 0 1 .015-.588c.07-.327-.007-.537-.238-.727-.188-.156-.426-.199-.689-.199a.6.6 0 0 1-.254-.078.253.253 0 0 1-.114-.358 1 1 0 0 1 .192-.21c.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.392.451.462.576.685.915.176.264.336.536.446.848.066.194-.02.353-.25.45',
      kimi: 'M21.765.351C22.998.351 24 1.353 24 2.586S22.998 4.82 21.765 4.82h-1.974c-.15 0-.26-.12-.26-.26V2.586A2.237 2.237 0 0 1 21.765.35M9.41 13.388l8.447-8.377c.16-.16.07-.471-.14-.471h-4.55s-.1.02-.14.06l-9.099 9.029c-.14.14-.35.02-.35-.21V4.81c0-.15-.1-.27-.221-.27H.22c-.12 0-.22.12-.22.27v18.57c0 .15.1.27.22.27h3.137c.12 0 .22-.12.22-.27v-3.79c0-.08.03-.16.08-.21l2.826-2.796c.07-.07.16-.08.241-.03l7.546 5.551a8.9 8.9 0 0 0 4.018 1.493c.12.01.23-.11.23-.27V19.76c0-.14-.08-.25-.19-.26a5.8 5.8 0 0 1-2.355-.942l-6.533-4.73c-.14-.09-.15-.32-.03-.441',
      qwen: 'M23.919 14.545 20.817 9.17l1.47-2.544a.56.56 0 0 0 0-.566l-1.633-2.83a.57.57 0 0 0-.49-.283h-6.207L12.487.402a.57.57 0 0 0-.49-.284H8.732a.56.56 0 0 0-.49.284L5.139 5.775h-2.94a.56.56 0 0 0-.49.284L.077 8.887a.56.56 0 0 0 0 .567L3.18 14.83l-1.47 2.545a.56.56 0 0 0 0 .566l1.634 2.83a.57.57 0 0 0 .49.283h6.205l1.47 2.545a.57.57 0 0 0 .49.284h3.266a.57.57 0 0 0 .49-.284l3.104-5.375h2.94a.57.57 0 0 0 .49-.283l1.634-2.828a.55.55 0 0 0-.004-.568M8.733.686l1.634 2.828-1.634 2.828H21.8L20.164 9.17H7.425L5.63 6.06Zm1.306 19.801-6.205-.002 1.634-2.83h3.265L2.201 6.344h3.267q3.182 5.517 6.367 11.032zm10.124-5.66L18.53 12l-6.532 11.315-1.634-2.83c2.129-3.673 4.25-7.351 6.373-11.028h3.592l3.102 5.374z',
      bytedance: 'M19.8772 1.4685L24 2.5326v18.9426l-4.1228 1.0563V1.4685zm-13.3481 9.428l4.115 1.0641v8.9786l-4.115 1.0642v-11.107zM0 2.572l4.115 1.0642v16.7354L0 21.428V2.572zm17.4553 5.6205v11.107l-4.1228-1.0642V9.2568l4.1228-1.0642z',
      tencent: 'M21.395 15.035a39.548 39.548 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a38.97 38.97 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673zM12.662 4.846c.039-1.052.659-1.878 1.385-1.846s1.281.912 1.242 1.964c-.039 1.051-.659 1.878-1.385 1.846s-1.282-.912-1.242-1.964zM9.954 3c.725-.033 1.345.794 1.384 1.846.04 1.052-.517 1.931-1.242 1.963-.726.033-1.346-.794-1.385-1.845C8.672 3.912 9.228 3.033 9.954 3zM7.421 8.294c.194-.43 2.147-.908 4.566-.908h.026c2.418 0 4.372.479 4.566.908a.14.14 0 0 1 .014.061c0 .031-.01.059-.026.083-.163.238-2.333 1.416-4.553 1.416h-.026c-2.221 0-4.39-1.178-4.553-1.416a.136.136 0 0 1-.014-.144zm10.422 8.622c-.22 3.676-2.403 5.987-5.774 6.021h-.137c-3.37-.033-5.554-2.345-5.773-6.021-.081-1.35.001-2.496.147-3.43.318.063.638.122.958.176v3.506s1.658.334 3.318.103v-3.225c.488.027.96.04 1.406.034h.025c1.678.021 3.714-.204 5.683-.594.146.934.227 2.08.147 3.43zM10.48 5.804c.313-.041.542-.409.508-.825-.033-.415-.314-.72-.629-.679-.313.04-.541.409-.508.824.034.417.315.72.629.68zM14.479 5.156c.078.037.221.042.289-.146.035-.095.025-.165-.009-.214-.023-.033-.133-.118-.371-.176-.904-.22-1.341.384-1.405.499-.04.072-.012.176.056.227.067.051.139.037.179-.006.58-.628 1.21-.208 1.261-.184z',
      baidu: 'M9.154 0C7.71 0 6.54 1.658 6.54 3.707c0 2.051 1.171 3.71 2.615 3.71 1.446 0 2.614-1.659 2.614-3.71C11.768 1.658 10.6 0 9.154 0zm7.025.594C14.86.58 13.347 2.589 13.2 3.927c-.187 1.745.25 3.487 2.179 3.735 1.933.25 3.175-1.806 3.422-3.364.252-1.555-.995-3.364-2.362-3.674a1.218 1.218 0 0 0-.261-.03zM3.582 5.535a2.811 2.811 0 0 0-.156.008c-2.118.19-2.428 3.24-2.428 3.24-.287 1.41.686 4.425 3.297 3.864 2.617-.561 2.262-3.68 2.183-4.362-.125-1.018-1.292-2.773-2.896-2.75zm16.534 1.753c-2.308 0-2.617 2.119-2.617 3.616 0 1.43.121 3.425 2.988 3.362 2.867-.063 2.553-3.238 2.553-3.988 0-.745-.62-2.99-2.924-2.99zm-8.264 2.478c-1.424.014-2.708.925-3.323 1.947-1.118 1.868-2.863 3.05-3.112 3.363-.25.309-3.61 2.116-2.864 5.42.746 3.301 3.365 3.237 3.365 3.237s1.93.19 4.171-.31c2.24-.495 4.17.123 4.17.123s5.233 1.748 6.665-1.616c1.43-3.364-.808-5.109-.808-5.109s-2.99-2.306-4.736-4.798c-1.072-1.665-2.348-2.268-3.528-2.257zm-2.234 3.84l1.542.024v8.197H7.758c-1.47-.291-2.055-1.292-2.13-1.462-.072-.173-.488-.976-.268-2.343.635-2.049 2.447-2.196 2.447-2.196h1.81zm3.964 2.39v3.881c.096.413.612.488.612.488h1.614v-4.343h1.689v5.782h-3.915c-1.517-.39-1.59-1.465-1.59-1.465v-4.317zm-5.458 1.147c-.66.197-.978.708-1.05.928-.076.22-.247.78-.1 1.269.294 1.095 1.248 1.144 1.248 1.144h1.37v-3.34z',
      minimax: 'M11.43 3.92a.86.86 0 1 0-1.718 0v14.236a1.999 1.999 0 0 1-3.997 0V9.022a.86.86 0 1 0-1.718 0v3.87a1.999 1.999 0 0 1-3.997 0V11.49a.57.57 0 0 1 1.139 0v1.404a.86.86 0 0 0 1.719 0V9.022a1.999 1.999 0 0 1 3.997 0v9.134a.86.86 0 0 0 1.719 0V3.92a1.998 1.998 0 1 1 3.996 0v11.788a.57.57 0 1 1-1.139 0zm10.572 3.105a2 2 0 0 0-1.999 1.997v7.63a.86.86 0 0 1-1.718 0V3.923a1.999 1.999 0 0 0-3.997 0v16.16a.86.86 0 0 1-1.719 0V18.08a.57.57 0 1 0-1.138 0v2a1.998 1.998 0 0 0 3.996 0V3.92a.86.86 0 0 1 1.719 0v12.73a1.999 1.999 0 0 0 3.996 0V9.023a.86.86 0 1 1 1.72 0v6.686a.57.57 0 0 0 1.138 0V9.022a2 2 0 0 0-1.998-1.997',
    };

    // -------------------------------------------------------------- locales
    const EN = {
      'title': 'AI quick launch',
      'label': 'AI models',
      'subtitle': 'One-click access to the AI chat services you use, opened in a new tab.',
      'group.pinned': 'Pinned',
      'group.recent': 'Recently used',
      'group.intl': 'International',
      'group.cn': 'China',
      'search.placeholder': 'Search services…',
      'action.manage': 'Manage',
      'action.done': 'Done',
      'action.refresh': 'Refresh',
      'action.refreshed': 'Refreshed',
      'action.add': 'Add service',
      'action.reset': 'Reset to defaults',
      'action.edit': 'Edit',
      'action.delete': 'Delete',
      'action.pin': 'Pin to top',
      'action.unpin': 'Unpin',
      'action.save': 'Save',
      'action.cancel': 'Cancel',
      'editor.titleAdd': 'Add service',
      'editor.titleEdit': 'Edit service',
      'editor.name': 'Name',
      'editor.url': 'URL',
      'editor.sub': 'Description',
      'editor.subPlaceholder': 'Optional',
      'editor.group': 'Group',
      'editor.color': 'Color',
      'editor.icon': 'Icon',
      'editor.iconPlaceholder': 'Image URL (optional)',
      'editor.chooseFile': 'Choose file',
      'editor.nameRequired': 'Please enter a name.',
      'editor.urlInvalid': 'Please enter a valid http(s) URL.',
      'editor.group.intl': 'International',
      'editor.group.cn': 'China',
      'empty.noResults': 'No services match your search.',
      'empty.noSites': 'No services yet. Add one to get started.',
      'model.chatgpt': 'ChatGPT', 'model.chatgpt.sub': 'OpenAI',
      'model.claude': 'Claude', 'model.claude.sub': 'Anthropic',
      'model.gemini': 'Gemini', 'model.gemini.sub': 'Google',
      'model.grok': 'Grok', 'model.grok.sub': 'xAI',
      'model.perplexity': 'Perplexity', 'model.perplexity.sub': 'Perplexity',
      'model.copilot': 'Copilot', 'model.copilot.sub': 'Microsoft',
      'model.lechat': 'Le Chat', 'model.lechat.sub': 'Mistral AI',
      'model.deepseek': 'DeepSeek', 'model.deepseek.sub': 'DeepSeek',
      'model.kimi': 'Kimi', 'model.kimi.sub': 'Moonshot AI',
      'model.qwen': 'Qwen', 'model.qwen.sub': 'Alibaba',
      'model.doubao': 'Doubao', 'model.doubao.sub': 'ByteDance',
      'model.yuanbao': 'Tencent Yuanbao', 'model.yuanbao.sub': 'Tencent',
      'model.wenxin': 'ERNIE Bot', 'model.wenxin.sub': 'Baidu',
      'model.spark': 'Spark', 'model.spark.sub': 'iFlytek',
      'model.zhipu': 'ChatGLM', 'model.zhipu.sub': 'Zhipu AI',
      'model.hailuo': 'Hailuo', 'model.hailuo.sub': 'MiniMax',
    };

    const ZH = {
      'title': '大模型快捷入口',
      'label': '大模型入口',
      'subtitle': '一键直达常用 AI 对话服务，在新标签页中打开。',
      'group.pinned': '置顶',
      'group.recent': '最近使用',
      'group.intl': '国际',
      'group.cn': '国内',
      'search.placeholder': '搜索站点…',
      'action.manage': '管理',
      'action.done': '完成',
      'action.refresh': '刷新',
      'action.refreshed': '已刷新',
      'action.add': '添加站点',
      'action.reset': '恢复默认',
      'action.edit': '编辑',
      'action.delete': '删除',
      'action.pin': '置顶',
      'action.unpin': '取消置顶',
      'action.save': '保存',
      'action.cancel': '取消',
      'editor.titleAdd': '新增站点',
      'editor.titleEdit': '编辑站点',
      'editor.name': '名称',
      'editor.url': '网址',
      'editor.sub': '说明',
      'editor.subPlaceholder': '可选',
      'editor.group': '分组',
      'editor.color': '颜色',
      'editor.icon': '图标',
      'editor.iconPlaceholder': '图片 URL（可选）',
      'editor.chooseFile': '选择文件',
      'editor.nameRequired': '请输入名称。',
      'editor.urlInvalid': '请输入有效的 http(s) 网址。',
      'editor.group.intl': '国际',
      'editor.group.cn': '国内',
      'empty.noResults': '没有匹配的站点。',
      'empty.noSites': '还没有站点，添加一个吧。',
      'model.chatgpt': 'ChatGPT', 'model.chatgpt.sub': 'OpenAI',
      'model.claude': 'Claude', 'model.claude.sub': 'Anthropic',
      'model.gemini': 'Gemini', 'model.gemini.sub': 'Google',
      'model.grok': 'Grok', 'model.grok.sub': 'xAI',
      'model.perplexity': 'Perplexity', 'model.perplexity.sub': 'Perplexity',
      'model.copilot': 'Copilot', 'model.copilot.sub': '微软',
      'model.lechat': 'Le Chat', 'model.lechat.sub': 'Mistral AI',
      'model.deepseek': 'DeepSeek', 'model.deepseek.sub': '深度求索',
      'model.kimi': 'Kimi', 'model.kimi.sub': '月之暗面',
      'model.qwen': '通义千问', 'model.qwen.sub': '阿里',
      'model.doubao': '豆包', 'model.doubao.sub': '字节跳动',
      'model.yuanbao': '腾讯元宝', 'model.yuanbao.sub': '腾讯',
      'model.wenxin': '文心一言', 'model.wenxin.sub': '百度',
      'model.spark': '讯飞星火', 'model.spark.sub': '科大讯飞',
      'model.zhipu': '智谱清言', 'model.zhipu.sub': '智谱',
      'model.hailuo': '海螺AI', 'model.hailuo.sub': 'MiniMax',
    };

    // ---------------------------------------------------------------- styles
    const CSS = `
.llmq-panel { height:100%; overflow:auto; padding:24px 28px; box-sizing:border-box; background:var(--dsw-alias-bg-base); color:var(--dsw-alias-label-primary); }
.llmq-head { display:flex; align-items:flex-start; gap:16px; margin-bottom:16px; }
.llmq-headings { flex:1; min-width:0; }
.llmq-head-actions { display:flex; gap:8px; flex:none; }
.llmq-title { margin:0; font-size:20px; font-weight:600; }
.llmq-sub { margin:6px 0 0; font-size:13px; color:var(--dsw-alias-label-secondary); }
.llmq-btn { display:inline-flex; align-items:center; gap:6px; height:30px; padding:0 12px; border-radius:8px; border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font-size:13px; cursor:pointer; white-space:nowrap; }
.llmq-btn:hover { background:var(--dsw-alias-bg-layer-2); }
.llmq-btn.primary { background:var(--dsw-alias-bg-layer-2); border-color:var(--dsw-alias-brand-primary); color:var(--dsw-alias-brand-primary); font-weight:600; }
.llmq-btn.primary:hover { background:var(--dsw-alias-bg-layer-1); }
.llmq-btn.active { border-color:var(--dsw-alias-brand-primary); color:var(--dsw-alias-brand-primary); }
.llmq-search { position:relative; margin-bottom:20px; }
.llmq-search input { width:100%; box-sizing:border-box; height:36px; padding:0 12px 0 34px; border-radius:10px; border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font-size:13px; outline:none; }
.llmq-search input:focus { border-color:var(--dsw-alias-brand-primary); }
.llmq-search input::placeholder { color:var(--dsw-alias-label-secondary); }
.llmq-search-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); display:inline-flex; color:var(--dsw-alias-label-secondary); pointer-events:none; }
.llmq-toolbar { display:flex; gap:8px; margin-bottom:16px; }
.llmq-section { margin-bottom:22px; }
.llmq-group-title { margin:0 0 10px; font-size:12px; font-weight:600; letter-spacing:.04em; color:var(--dsw-alias-label-secondary); text-transform:uppercase; }
.llmq-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:12px; }
.llmq-cardwrap { position:relative; }
.llmq-card { display:flex; align-items:center; gap:12px; padding:12px 14px; box-sizing:border-box; border:1px solid var(--dsw-alias-border-l1); border-radius:12px; background:var(--dsw-alias-bg-layer-1); text-decoration:none; color:var(--dsw-alias-label-primary); transition:border-color .12s ease, background .12s ease; }
.llmq-cardwrap:hover .llmq-card { border-color:var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-layer-2); }
.llmq-card:focus-visible { outline:2px solid var(--dsw-alias-brand-primary); outline-offset:2px; }
.llmq-card-static { cursor:default; }
.llmq-logo { flex:none; width:36px; height:36px; border-radius:9px; display:inline-flex; align-items:center; justify-content:center; color:#fff; overflow:hidden; }
.llmq-body { display:flex; flex-direction:column; min-width:0; flex:1; }
.llmq-name { font-size:14px; font-weight:600; line-height:1.25; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.llmq-sub2 { margin-top:2px; font-size:12px; color:var(--dsw-alias-label-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.llmq-arrow { flex:none; color:var(--dsw-alias-label-secondary); display:inline-flex; opacity:0; transform:translateX(-2px); transition:opacity .12s ease, transform .12s ease; }
.llmq-cardwrap:hover .llmq-arrow { opacity:1; transform:translateX(0); }
.llmq-card:focus-visible .llmq-arrow { opacity:1; }
.llmq-star { position:absolute; top:7px; right:8px; display:none; align-items:center; justify-content:center; width:22px; height:22px; padding:0; border:none; border-radius:6px; background:transparent; color:var(--dsw-alias-label-secondary); cursor:pointer; }
.llmq-cardwrap:hover .llmq-star, .llmq-star.on { display:inline-flex; }
.llmq-star.on { color:var(--dsw-alias-brand-primary); }
.llmq-star:hover { background:var(--dsw-alias-bg-overlay); }
.llmq-iconbtn { position:absolute; top:7px; display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; padding:0; border:1px solid var(--dsw-alias-border-l1); border-radius:6px; background:var(--dsw-alias-bg-overlay); color:var(--dsw-alias-label-primary); cursor:pointer; font-size:12px; line-height:1; }
.llmq-iconbtn:hover { border-color:var(--dsw-alias-border-l2); }
.llmq-empty { padding:44px 0; text-align:center; color:var(--dsw-alias-label-secondary); font-size:13px; }
.llmq-form { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:16px; margin-bottom:18px; border:1px solid var(--dsw-alias-border-l1); border-radius:12px; background:var(--dsw-alias-bg-layer-1); }
.llmq-form-title { grid-column:1 / -1; margin:0 0 2px; font-size:14px; font-weight:600; }
.llmq-field { display:flex; flex-direction:column; gap:5px; min-width:0; }
.llmq-field label { font-size:12px; color:var(--dsw-alias-label-secondary); }
.llmq-field input, .llmq-field select { height:32px; box-sizing:border-box; padding:0 10px; border-radius:8px; border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-base); color:var(--dsw-alias-label-primary); font-size:13px; outline:none; }
.llmq-field input:focus, .llmq-field select:focus { border-color:var(--dsw-alias-brand-primary); }
.llmq-field input[type=color] { padding:2px; }
.llmq-error { grid-column:1 / -1; color:var(--dsw-alias-state-error-primary); font-size:12px; }
.llmq-form-actions { grid-column:1 / -1; display:flex; gap:8px; justify-content:flex-end; }
.llmq-field-wide { grid-column:1 / -1; }
.llmq-icon-row { display:flex; align-items:center; gap:8px; }
.llmq-icon-input { flex:1; min-width:0; }
.llmq-icon-row .llmq-btn { flex:none; }
`;

    // ----------------------------------------------------------------- icons
    function LauncherIcon(props) {
      const size = props.size || 20;
      const cells = [];
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          cells.push(h('rect', {
            key: row + '-' + col,
            x: 4 + col * 6, y: 4 + row * 6,
            width: 4, height: 4, rx: 1.2,
            fill: 'currentColor',
          }));
        }
      }
      return h('svg', { viewBox: '0 0 24 24', width: size, height: size, 'aria-hidden': true, style: { display: 'block' } }, cells);
    }

    function ArrowIcon() {
      return h('svg', { viewBox: '0 0 24 24', width: 15, height: 15, 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M7 17L17 7M17 7H8M17 7V16' }));
    }

    function SearchIcon() {
      return h('svg', { viewBox: '0 0 24 24', width: 15, height: 15, 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('circle', { cx: 11, cy: 11, r: 6.5 }),
        h('path', { d: 'M16 16l4.5 4.5' }));
    }

    function StarIcon(props) {
      const filled = props && props.filled;
      return h('svg', { viewBox: '0 0 24 24', width: 14, height: 14, 'aria-hidden': true, fill: filled ? 'currentColor' : 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinejoin: 'round' },
        h('path', { d: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z' }));
    }

    function ModelLogo(props) {
      const site = props.site;
      const inner = site.color;
      if (site.logo === 'char') {
        return h('span', { style: { fontSize: 17, fontWeight: 700, lineHeight: 1 } }, site.char || (site.name ? site.name.charAt(0) : '?'));
      }
      if (site.logo === 'doubao') {
        return h('svg', { viewBox: '0 0 24 24', width: 22, height: 22, 'aria-hidden': true, focusable: 'false' },
          h('path', { d: 'M5.31 15.756c.172-3.75 1.883-5.999 2.549-6.739-3.26 2.058-5.425 5.658-6.358 8.308v1.12C1.501 21.513 4.226 24 7.59 24a6.59 6.59 0 002.2-.375c.353-.12.7-.248 1.039-.378.913-.899 1.65-1.91 2.243-2.992-4.877 2.431-7.974.072-7.763-4.5l.002.001z', fill: 'currentColor', fillOpacity: 0.5 }),
          h('path', { d: 'M22.57 10.283c-1.212-.901-4.109-2.404-7.397-2.8.295 3.792.093 8.766-2.1 12.773a12.782 12.782 0 01-2.244 2.992c3.764-1.448 6.746-3.457 8.596-5.219 2.82-2.683 3.353-5.178 3.361-6.66a2.737 2.737 0 00-.216-1.084v-.002zM14.303 1.867C12.955.7 11.248 0 9.39 0 7.532 0 5.883.677 4.545 1.807 2.791 3.29 1.627 5.557 1.5 8.125v9.201c.932-2.65 3.097-6.25 6.357-8.307.5-.318 1.025-.595 1.569-.829 1.883-.801 3.878-.932 5.746-.706-.222-2.83-.718-5.002-.87-5.617h.001z', fill: 'currentColor' }),
          h('path', { d: 'M17.305 4.961a199.47 199.47 0 01-1.08-1.094c-.202-.213-.398-.419-.586-.622l-1.333-1.378c.151.615.648 2.786.869 5.617 3.288.395 6.185 1.898 7.396 2.8-1.306-1.275-3.475-3.487-5.266-5.323z', fill: 'currentColor', fillOpacity: 0.5 }));
      }
      if (site.logo === 'yuanbao') {
        return h('svg', { viewBox: '0 0 24 24', width: 22, height: 22, 'aria-hidden': true, focusable: 'false' },
          h('path', { d: 'M3.5 12.5 C7 15.2 17 15.2 20.5 12.5 L17 20 Q12 21.5 7 20 Z', fill: '#f7c948' }),
          h('path', { d: 'M3.5 12.5 C7 9.6 17 9.6 20.5 12.5 C17 15.2 7 15.2 3.5 12.5 Z', fill: '#ffd76a' }));
      }
      if (site.logo === 'spark') {
        return h('svg', { viewBox: '0 0 24 24', width: 22, height: 22, 'aria-hidden': true, focusable: 'false' },
          h('path', { d: 'M12 3 C14.5 7.5 18 8.5 18 13 A6 6 0 0 1 6 13 C6 9.5 9.5 8 12 3 Z', fill: 'currentColor' }),
          h('path', { d: 'M12 11 C13.2 13 14.5 13.5 14.5 16 A2.5 2.5 0 0 1 9.5 16 C9.5 14 10.8 13 12 11 Z', fill: inner }));
      }
      if (site.logo === 'microsoft') {
        return h('svg', { viewBox: '0 0 24 24', width: 22, height: 22, 'aria-hidden': true, focusable: 'false' },
          h('rect', { x: 4, y: 4, width: 7, height: 7, fill: '#f25022' }),
          h('rect', { x: 13, y: 4, width: 7, height: 7, fill: '#7fba00' }),
          h('rect', { x: 4, y: 13, width: 7, height: 7, fill: '#00a4ef' }),
          h('rect', { x: 13, y: 13, width: 7, height: 7, fill: '#ffb900' }));
      }
      const d = LOGO_PATHS[site.logo];
      if (d) {
        return h('svg', { viewBox: '0 0 24 24', width: 22, height: 22, 'aria-hidden': true, focusable: 'false' },
          h('path', { d: d, fill: 'currentColor' }));
      }
      return h('svg', { viewBox: '0 0 24 24', width: 22, height: 22, 'aria-hidden': true, focusable: 'false' },
        h('circle', { cx: 12, cy: 12, r: 8, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }),
        h('path', { d: 'M4 12h16M12 4c2.5 2.2 3.8 5 3.8 8s-1.3 5.8-3.8 8c-2.5-2.2-3.8-5-3.8-8s1.3-5.8 3.8-8z', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 }));
    }

    function Logo(props) {
      const candidates = props.candidates || [];
      const site = props.site;
      const [index, setIndex] = React.useState(0);
      const key = candidates.join('|');
      React.useEffect(function () { setIndex(0); }, [key]);
      const src = candidates[index];
      if (src) {
        return h('img', {
          src: src,
          alt: '',
          width: 22,
          height: 22,
          onError: function () { setIndex(index + 1); },
          style: { display: 'block', objectFit: 'contain' },
        });
      }
      return h(ModelLogo, { site: site });
    }

    // -------------------------------------------------------------- components
    function useLocaleTick(ctx) {
      const [tick, setTick] = React.useState(0);
      React.useEffect(function () {
        return ctx.locale.subscribe(function () {
          setTick(function (value) { return value + 1; });
        });
      }, [ctx]);
      return tick;
    }

    function seedSites(t) {
      return DEFAULT_SITES.map(function (site) {
        return {
          id: site.id,
          url: site.url,
          group: site.group,
          logo: site.logo,
          char: site.char,
          color: site.color,
          name: t('model.' + site.id),
          sub: t('model.' + site.id + '.sub'),
        };
      });
    }

    function SiteEditor(props) {
      const t = props.t;
      const initial = props.initial || {};
      const [name, setName] = React.useState(initial.name || '');
      const [url, setUrl] = React.useState(initial.url || '');
      const [sub, setSub] = React.useState(initial.sub || '');
      const [group, setGroup] = React.useState(initial.group || 'intl');
      const [color, setColor] = React.useState(initial.color || '#4d6bfe');
      const [iconUrl, setIconUrl] = React.useState(initial.iconUrl || '');
      const [error, setError] = React.useState('');

      function pickIcon(event) {
        const file = event.target.files && event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function () {
            if (typeof reader.result === 'string') setIconUrl(reader.result);
          };
          reader.readAsDataURL(file);
        }
        event.target.value = '';
      }

      function submit(event) {
        if (event) event.preventDefault();
        const trimmedName = name.trim();
        const trimmedUrl = url.trim();
        if (!trimmedName) { setError(t('editor.nameRequired')); return; }
        if (!/^https?:\/\//i.test(trimmedUrl)) { setError(t('editor.urlInvalid')); return; }
        props.onSave({ name: trimmedName, url: trimmedUrl, sub: sub.trim(), group: group, color: color, iconUrl: iconUrl.trim() });
      }

      return h('form', { className: 'llmq-form', onSubmit: submit },
        h('h2', { className: 'llmq-form-title' }, initial.id ? t('editor.titleEdit') : t('editor.titleAdd')),
        h('div', { className: 'llmq-field' },
          h('label', null, t('editor.name')),
          h('input', { value: name, onChange: function (e) { setName(e.target.value); }, placeholder: 'ChatGPT' }),
        ),
        h('div', { className: 'llmq-field' },
          h('label', null, t('editor.url')),
          h('input', { value: url, onChange: function (e) { setUrl(e.target.value); }, placeholder: 'https://example.com' }),
        ),
        h('div', { className: 'llmq-field' },
          h('label', null, t('editor.sub')),
          h('input', { value: sub, onChange: function (e) { setSub(e.target.value); }, placeholder: t('editor.subPlaceholder') }),
        ),
        h('div', { className: 'llmq-field' },
          h('label', null, t('editor.group')),
          h('select', { value: group, onChange: function (e) { setGroup(e.target.value); } },
            h('option', { value: 'intl' }, t('editor.group.intl')),
            h('option', { value: 'cn' }, t('editor.group.cn')),
          ),
        ),
        h('div', { className: 'llmq-field' },
          h('label', null, t('editor.color')),
          h('input', { type: 'color', value: color, onChange: function (e) { setColor(e.target.value); } }),
        ),
        h('div', { className: 'llmq-field llmq-field-wide' },
          h('label', null, t('editor.icon')),
          h('div', { className: 'llmq-icon-row' },
            h('input', { type: 'text', className: 'llmq-icon-input', value: iconUrl, onChange: function (e) { setIconUrl(e.target.value); }, placeholder: t('editor.iconPlaceholder') }),
            h('label', { className: 'llmq-btn' },
              t('editor.chooseFile'),
              h('input', { type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: pickIcon }),
            ),
            iconUrl ? h('img', { src: iconUrl, alt: '', width: 22, height: 22, style: { flex: 'none', objectFit: 'contain' } }) : null,
          ),
        ),
        error ? h('div', { className: 'llmq-error' }, error) : null,
        h('div', { className: 'llmq-form-actions' },
          h('button', { type: 'button', className: 'llmq-btn', onClick: props.onCancel }, t('action.cancel')),
          h('button', { type: 'submit', className: 'llmq-btn primary' }, t('action.save')),
        ),
      );
    }

    function Panel(props) {
      const t = props.t;
      const ctx = props.ctx;
      useLocaleTick(ctx);

      const [networkLogos, setNetworkLogos] = React.useState(function () {
        const map = {};
        DEFAULT_SITES.forEach(function (def) {
          const slug = LOGO_SLUGS[def.id];
          const cached = slug ? cachedLogo(slug) : null;
          if (cached) map[def.id] = cached;
        });
        return map;
      });
      const assetBaseUrl = React.useState(function () { return assetBase(); })[0];
      const [refreshTick, setRefreshTick] = React.useState(0);
      const [refreshLabel, setRefreshLabel] = React.useState('');

      React.useEffect(function () {
        let alive = true;
        DEFAULT_SITES.forEach(function (def) {
          const slug = LOGO_SLUGS[def.id];
          if (!slug || networkLogos[def.id]) return;
          fetchLogo(slug).then(function (url) {
            if (!alive || !url) return;
            setNetworkLogos(function (prev) {
              if (prev[def.id]) return prev;
              const next = Object.assign({}, prev);
              next[def.id] = url;
              return next;
            });
          });
        });
        return function () { alive = false; };
      }, [refreshTick]);

      const [localLogos, setLocalLogos] = React.useState([]);
      React.useEffect(function () {
        if (!assetBaseUrl || typeof fetch !== 'function') return undefined;
        let alive = true;
        fetch(assetBaseUrl + 'logos/index.json').then(function (res) {
          return res.ok ? res.json() : null;
        }).then(function (list) {
          if (alive && Array.isArray(list)) {
            setLocalLogos(list.filter(function (id) { return typeof id === 'string'; }));
          }
        }).catch(function () { /* no overrides */ });
        return function () { alive = false; };
      }, [assetBaseUrl, refreshTick]);

      function logoSources(site) {
        const list = [];
        if (site.iconUrl) list.push(site.iconUrl);
        if (networkLogos[site.id]) list.push(networkLogos[site.id]);
        if (assetBaseUrl && localLogos.indexOf(site.id) >= 0) {
          list.push(assetBaseUrl + 'logos/' + site.id + '.svg');
        }
        const def = DEFAULT_SITES.filter(function (d) { return d.id === site.id; })[0];
        if (def && def.favicon) list.push(def.favicon);
        const domain = domainOf(site.url);
        if (domain) list.push('https://a.favicon.im/' + domain);
        return list;
      }

      function refreshLogos() {
        Object.keys(LOGO_MEMORY).forEach(function (key) { delete LOGO_MEMORY[key]; });
        setNetworkLogos({});
        setLocalLogos([]);
        setRefreshTick(function (value) { return value + 1; });
        setRefreshLabel(t('action.refreshed'));
        window.setTimeout(function () { setRefreshLabel(''); }, 1400);
      }

      const [sites, setSites] = React.useState(function () {
        const stored = lsGet(STORE_SITES);
        if (Array.isArray(stored) && stored.length) {
          // Refresh brand marks for built-in entries whose logo changed in an update.
          return stored.map(function (site) {
            const def = DEFAULT_SITES.filter(function (d) { return d.id === site.id; })[0];
            if (!def) return site;
            if (site.logo === def.logo && site.char === def.char) return site;
            return Object.assign({}, site, { logo: def.logo, char: def.char, color: def.color });
          });
        }
        return seedSites(t);
      });
      const [recent, setRecent] = React.useState(function () {
        const stored = lsGet(STORE_RECENT);
        return Array.isArray(stored) ? stored : [];
      });
      const [pinned, setPinned] = React.useState(function () {
        const stored = lsGet(STORE_PINNED);
        return Array.isArray(stored) ? stored : [];
      });
      const [query, setQuery] = React.useState('');
      const [editing, setEditing] = React.useState(false);
      const [draft, setDraft] = React.useState(null);

      function persistSites(next) { setSites(next); lsSet(STORE_SITES, next); }
      function persistRecent(next) { setRecent(next); lsSet(STORE_RECENT, next); }
      function persistPinned(next) { setPinned(next); lsSet(STORE_PINNED, next); }

      function openSite(id) {
        persistRecent([id].concat(recent.filter(function (x) { return x !== id; })).slice(0, 6));
      }
      function togglePin(id) {
        persistPinned(pinned.indexOf(id) >= 0 ? pinned.filter(function (x) { return x !== id; }) : [id].concat(pinned));
      }
      function saveDraft(data) {
        if (draft && draft.id) {
          persistSites(sites.map(function (site) {
            return site.id === draft.id ? Object.assign({}, site, data) : site;
          }));
        } else {
          const id = 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
          persistSites(sites.concat([Object.assign({ id: id, logo: 'link', color: '#4d6bfe' }, data)]));
        }
        setDraft(null);
      }
      function deleteSite(id) {
        persistSites(sites.filter(function (site) { return site.id !== id; }));
        persistRecent(recent.filter(function (x) { return x !== id; }));
        persistPinned(pinned.filter(function (x) { return x !== id; }));
      }
      function resetSites() {
        persistSites(seedSites(t));
        persistRecent([]);
        persistPinned([]);
        setDraft(null);
      }

      const q = query.trim().toLowerCase();
      function matches(site) {
        if (!q) return true;
        return (site.name || '').toLowerCase().indexOf(q) >= 0
          || (site.sub || '').toLowerCase().indexOf(q) >= 0
          || (site.url || '').toLowerCase().indexOf(q) >= 0;
      }
      const filtered = sites.filter(matches);
      const byId = {};
      sites.forEach(function (site) { byId[site.id] = site; });

      const pinnedSites = q ? [] : pinned.map(function (id) { return byId[id]; }).filter(Boolean);
      const recentSites = q ? [] : recent.map(function (id) { return byId[id]; })
        .filter(function (site) { return site && pinned.indexOf(site.id) < 0; })
        .slice(0, 4);
      function groupSites(group) {
        return filtered.filter(function (site) { return site.group === group; });
      }

      function card(site) {
        if (editing) {
          return h('div', { key: site.id, className: 'llmq-cardwrap' },
            h('div', { className: 'llmq-card llmq-card-static' },
              h('span', { className: 'llmq-logo', style: { background: site.color } }, h(Logo, { site: site, candidates: logoSources(site) })),
              h('span', { className: 'llmq-body' },
                h('span', { className: 'llmq-name' }, site.name),
                site.sub ? h('span', { className: 'llmq-sub2' }, site.sub) : null,
              ),
            ),
            h('button', {
              type: 'button', className: 'llmq-iconbtn', style: { right: 40 }, title: t('action.edit'),
              onClick: function () { setDraft({ id: site.id, name: site.name, url: site.url, sub: site.sub || '', group: site.group, color: site.color, iconUrl: site.iconUrl || '' }); },
            }, '✎'),
            h('button', {
              type: 'button', className: 'llmq-iconbtn', style: { right: 10 }, title: t('action.delete'),
              onClick: function () { deleteSite(site.id); },
            }, '✕'),
          );
        }
        const isPinned = pinned.indexOf(site.id) >= 0;
        return h('div', { key: site.id, className: 'llmq-cardwrap' },
          h('a', {
            className: 'llmq-card',
            href: site.url,
            target: '_blank',
            rel: 'noreferrer noopener',
            onClick: function () { openSite(site.id); },
          },
            h('span', { className: 'llmq-logo', style: { background: site.color } }, h(Logo, { site: site, candidates: logoSources(site) })),
            h('span', { className: 'llmq-body' },
              h('span', { className: 'llmq-name' }, site.name),
              site.sub ? h('span', { className: 'llmq-sub2' }, site.sub) : null,
            ),
            h('span', { className: 'llmq-arrow' }, h(ArrowIcon)),
          ),
          h('button', {
            type: 'button',
            className: 'llmq-star' + (isPinned ? ' on' : ''),
            title: isPinned ? t('action.unpin') : t('action.pin'),
            'aria-pressed': isPinned,
            onClick: function () { togglePin(site.id); },
          }, h(StarIcon, { filled: isPinned })),
        );
      }

      function section(key, title, list) {
        if (!list.length) return null;
        return h('section', { className: 'llmq-section', key: key },
          h('h2', { className: 'llmq-group-title' }, title),
          h('div', { className: 'llmq-grid' }, list.map(card)),
        );
      }

      const intlSites = groupSites('intl');
      const cnSites = groupSites('cn');

      return h('div', { className: 'llmq-panel' },
        h('div', { className: 'llmq-head' },
          h('div', { className: 'llmq-headings' },
            h('h1', { className: 'llmq-title' }, t('title')),
            h('p', { className: 'llmq-sub' }, t('subtitle')),
          ),
          h('div', { className: 'llmq-head-actions' },
            h('button', {
              type: 'button',
              className: 'llmq-btn',
              title: t('action.refresh'),
              onClick: refreshLogos,
            }, refreshLabel || t('action.refresh')),
            h('button', {
              type: 'button',
              className: 'llmq-btn' + (editing ? ' active' : ''),
              onClick: function () { setEditing(!editing); setDraft(null); },
            }, editing ? t('action.done') : t('action.manage')),
          ),
        ),

        h('div', { className: 'llmq-search' },
          h('span', { className: 'llmq-search-icon' }, h(SearchIcon)),
          h('input', {
            value: query,
            placeholder: t('search.placeholder'),
            'aria-label': t('search.placeholder'),
            onChange: function (e) { setQuery(e.target.value); },
          }),
        ),

        editing && !draft ? h('div', { className: 'llmq-toolbar' },
          h('button', { type: 'button', className: 'llmq-btn primary', onClick: function () { setDraft({}); } }, '+ ' + t('action.add')),
          h('button', { type: 'button', className: 'llmq-btn', onClick: resetSites }, t('action.reset')),
        ) : null,

        draft ? h(SiteEditor, { key: draft.id || 'new', initial: draft, onSave: saveDraft, onCancel: function () { setDraft(null); }, t: t }) : null,

        section('pinned', t('group.pinned'), pinnedSites),
        section('recent', t('group.recent'), recentSites),
        section('intl', t('group.intl'), intlSites),
        section('cn', t('group.cn'), cnSites),

        !filtered.length ? h('div', { className: 'llmq-empty' }, sites.length ? t('empty.noResults') : t('empty.noSites')) : null,
      );
    }

    // ------------------------------------------------------------------ apply
    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(function () {
          const el = document.createElement('style');
          el.setAttribute('data-plugin', 'llm-quick-launch');
          el.textContent = CSS;
          document.head.appendChild(el);
          return function () { el.remove(); };
        });
        ctx.effect(function () { return ctx.locale.register('llm-quick-launch', 'en', EN); });
        ctx.effect(function () { return ctx.locale.register('llm-quick-launch', 'zh', ZH); });
        const t = ctx.locale.bind('llm-quick-launch');

        ctx.slots.inject('sidebar.panellist', function () {
          return ctx.slots.register({
            name: 'sidebar.panellist',
            id: 'llm-quick-launch',
            order: 20,
            label: function () { return t('label'); },
          }, LauncherIcon);
        });

        ctx.slots.inject('main', function () {
          return ctx.slots.register({
            name: 'main',
            key: 'llm-quick-launch',
          }, function MainPanel() {
            return h(Panel, { t: t, ctx: ctx });
          });
        });
      },
    };
  },
});
