/**
 * IAFEI Internationalization (i18n) Manager
 * 多语言国际化管理系统
 */
class I18nManager {
    constructor() {
        this.currentLang = 'en'; // 默认语言
        this.translations = {};
        this.supportedLanguages = {
            'en': 'English',
            'zh-cn': '简体中文',
            'zh-tw': '繁體中文',
            'ja': '日本語',
            'de': 'Deutsch',
            'it': 'Italiano'
        };
        this.fallbackLang = 'en';
        this.isLoading = false;
    }

    /**
     * 初始化国际化系统
     */
    async init() {
        try {
            // 检测用户首选语言
            this.currentLang = this.detectLanguage();
            
            // 加载翻译文件
            await this.loadTranslations(this.currentLang);
            
            // 应用翻译
            this.applyTranslations();
            
            // 更新HTML语言属性
            this.updateHtmlLang();
            
            // 初始化语言切换器
            this.initLanguageSelector();
            
            console.log(`✅ i18n initialized with language: ${this.currentLang}`);
        } catch (error) {
            console.error('❌ i18n initialization failed:', error);
            // 使用默认语言作为后备
            if (this.currentLang !== this.fallbackLang) {
                await this.switchLanguage(this.fallbackLang);
            }
        }
    }

    /**
     * 检测用户首选语言
     */
    detectLanguage() {
        // 优先级：URL参数 > localStorage > 浏览器语言 > 默认语言
        
        // 1. 检查URL参数
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.supportedLanguages[urlLang]) {
            return urlLang;
        }

        // 2. 检查localStorage
        const storedLang = localStorage.getItem('iafei-language');
        if (storedLang && this.supportedLanguages[storedLang]) {
            return storedLang;
        }

        // 3. 检查浏览器语言
        const browserLang = navigator.language.toLowerCase();
        
        // 精确匹配
        if (this.supportedLanguages[browserLang]) {
            return browserLang;
        }

        // 语言代码匹配
        const langCode = browserLang.split('-')[0];
        if (langCode === 'zh') {
            // 中文特殊处理
            if (browserLang.includes('tw') || browserLang.includes('hk') || browserLang.includes('mo')) {
                return 'zh-tw';
            }
            return 'zh-cn';
        }
        
        // 其他语言匹配
        const matchedLang = Object.keys(this.supportedLanguages).find(lang => 
            lang.startsWith(langCode)
        );
        if (matchedLang) {
            return matchedLang;
        }

        // 4. 返回默认语言
        return this.fallbackLang;
    }

    /**
     * 加载翻译文件
     */
    async loadTranslations(lang) {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        
        try {
            const response = await fetch(`./lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}: ${response.status}`);
            }
            
            this.translations = await response.json();
            console.log(`📄 Loaded translations for: ${lang}`);
            
        } catch (error) {
            console.error(`❌ Error loading translations for ${lang}:`, error);
            
            // 如果不是后备语言，尝试加载后备语言
            if (lang !== this.fallbackLang) {
                console.log(`🔄 Falling back to ${this.fallbackLang}`);
                const fallbackResponse = await fetch(`./lang/${this.fallbackLang}.json`);
                this.translations = await fallbackResponse.json();
            } else {
                throw error;
            }
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 获取翻译文本
     */
    t(key, fallback = '') {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`🔍 Translation missing for key: ${key}`);
                return fallback || key;
            }
        }
        
        return value || fallback || key;
    }

    /**
     * 应用翻译到页面元素
     */
    applyTranslations() {
        if (!this.translations) {
            console.warn('No translations available');
            return;
        }

        console.log('Applying translations for language:', this.currentLanguage);

        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                // Handle different types of content
                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = translation;
                } else if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                } else if (element.hasAttribute('title')) {
                    element.title = translation;
                } else {
                    element.textContent = translation;
                }
            } else {
                console.warn(`Translation not found for key: ${key}`);
            }
        });

        // Update elements with data-i18n-aria attribute
        const ariaElements = document.querySelectorAll('[data-i18n-aria]');
        ariaElements.forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            const translation = this.getTranslation(key);
            
            if (translation) {
                element.setAttribute('aria-label', translation);
            }
        });

        // Update page meta information
        this.updatePageMeta();

        console.log('Translations applied successfully');
    }

    updatePageMeta() {
        // Update page title
        const titleElement = document.querySelector('title');
        if (titleElement && this.translations.meta) {
            const pageName = this.getPageName();
            const siteTitle = this.getTranslation('meta.siteTitle') || 'IAFEI - International Association of Financial Executives Institutes';
            
            if (pageName && pageName !== 'home') {
                titleElement.textContent = `${this.getTranslation(`pages.${pageName}.title`)} - ${siteTitle}`;
            } else {
                titleElement.textContent = siteTitle;
            }
        }

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && this.translations.meta) {
            const description = this.getTranslation('meta.description');
            if (description) {
                metaDesc.setAttribute('content', description);
            }
        }

        // Update html lang attribute
        document.documentElement.setAttribute('lang', this.currentLanguage);
    }

    getPageName() {
        const path = window.location.pathname;
        if (path.includes('contact.html')) return 'contact';
        if (path.includes('about.html')) return 'about';
        if (path.includes('members.html')) return 'members';
        if (path.includes('news.html')) return 'news';
        if (path.includes('publications.html')) return 'publications';
        return 'home';
    }

    /**
     * 更新HTML语言属性
     */
    updateHtmlLang() {
        const htmlLang = this.translations.meta?.htmlLang || this.currentLang;
        document.documentElement.lang = htmlLang;
        
        // 更新文档方向（如果需要）
        const isRTL = ['ar', 'he', 'fa'].includes(this.currentLang);
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }

    /**
     * 切换语言
     */
    async switchLanguage(newLang) {
        if (!this.supportedLanguages[newLang]) {
            console.error(`❌ Unsupported language: ${newLang}`);
            return;
        }

        if (newLang === this.currentLang) {
            return;
        }

        try {
            // 显示加载状态
            this.showLoadingState();
            
            // 加载新语言的翻译
            await this.loadTranslations(newLang);
            
            // 更新当前语言
            this.currentLang = newLang;
            
            // 保存到localStorage
            localStorage.setItem('iafei-language', newLang);
            
            // 应用翻译
            this.applyTranslations();
            
            // 更新HTML语言属性
            this.updateHtmlLang();
            
            // 更新语言选择器
            this.updateLanguageSelector();
            
            // 隐藏加载状态
            this.hideLoadingState();
            
            // 触发语言切换事件
            this.dispatchLanguageChangeEvent(newLang);
            
            console.log(`🔄 Language switched to: ${newLang}`);
            
        } catch (error) {
            console.error(`❌ Error switching to language ${newLang}:`, error);
            this.hideLoadingState();
        }
    }

    /**
     * 初始化语言选择器
     */
    initLanguageSelector() {
        // 创建语言选择器HTML
        const languageSelector = this.createLanguageSelector();
        
        // 将选择器添加到页面左下角
        document.body.appendChild(languageSelector);
        
        // 绑定事件
        this.bindLanguageSelectorEvents();
    }

    /**
     * 创建语言选择器HTML
     */
    createLanguageSelector() {
        const selector = document.createElement('div');
        selector.className = 'language-selector';
        selector.innerHTML = `
            <button class="language-toggle" aria-label="${this.t('common.language', 'Language')}" title="${this.t('common.language', 'Language')}">
                <span class="language-icon">🌐</span>
                <span class="language-current">${this.supportedLanguages[this.currentLang]}</span>
                <span class="language-arrow">▼</span>
            </button>
            <div class="language-dropdown">
                ${Object.entries(this.supportedLanguages).map(([code, name]) => `
                    <button class="language-option ${code === this.currentLang ? 'active' : ''}" 
                            data-lang="${code}" 
                            aria-label="${name}">
                        ${name}
                    </button>
                `).join('')}
            </div>
        `;
        
        return selector;
    }

    /**
     * 绑定语言选择器事件
     */
    bindLanguageSelectorEvents() {
        const toggle = document.querySelector('.language-toggle');
        const dropdown = document.querySelector('.language-dropdown');
        const options = document.querySelectorAll('.language-option');
        
        // 切换下拉菜单
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            toggle.classList.toggle('active');
        });
        
        // 选择语言
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const newLang = e.target.getAttribute('data-lang');
                this.switchLanguage(newLang);
                dropdown.classList.remove('show');
                toggle.classList.remove('active');
            });
        });
        
        // 点击外部关闭下拉菜单
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
            toggle.classList.remove('active');
        });
    }

    /**
     * 更新语言选择器状态
     */
    updateLanguageSelector() {
        const currentSpan = document.querySelector('.language-current');
        const options = document.querySelectorAll('.language-option');
        
        if (currentSpan) {
            currentSpan.textContent = this.supportedLanguages[this.currentLang];
        }
        
        options.forEach(option => {
            const lang = option.getAttribute('data-lang');
            option.classList.toggle('active', lang === this.currentLang);
        });
    }

    /**
     * 显示加载状态
     */
    showLoadingState() {
        const toggle = document.querySelector('.language-toggle');
        if (toggle) {
            toggle.classList.add('loading');
            toggle.disabled = true;
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoadingState() {
        const toggle = document.querySelector('.language-toggle');
        if (toggle) {
            toggle.classList.remove('loading');
            toggle.disabled = false;
        }
    }

    /**
     * 触发语言切换事件
     */
    dispatchLanguageChangeEvent(newLang) {
        const event = new CustomEvent('languageChanged', {
            detail: {
                oldLang: this.currentLang,
                newLang: newLang,
                translations: this.translations
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 获取当前语言
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * 获取支持的语言列表
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    /**
     * 检查是否支持某种语言
     */
    isLanguageSupported(lang) {
        return !!this.supportedLanguages[lang];
    }
}

// 全局i18n实例
window.i18n = new I18nManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.init();
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}