/**
 * IAFEI Internationalization (i18n) Manager
 * 多语言国际化管理系统
 */
class I18nManager {
    constructor() {
        this.currentLanguage = 'en'; // 默认语言
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
            console.log('🚀 Starting i18n initialization...');
            
            // 检测用户首选语言
            this.currentLanguage = this.detectLanguage();
            console.log(`🔍 Detected language: ${this.currentLanguage}`);
            
            // 加载翻译文件
            await this.loadTranslations(this.currentLanguage);
            console.log(`📄 Translations loaded for: ${this.currentLanguage}`);
            
            // 应用翻译
            this.applyTranslations();
            console.log('🎨 Translations applied to DOM');
            
            // 更新HTML语言属性
            this.updateHtmlLang();
            console.log('🔗 HTML lang attribute updated');
            
            // 初始化语言切换器
            this.initLanguageSelector();
            console.log('🎛️ Language selector initialized');
            
            console.log(`✅ i18n initialized successfully with language: ${this.currentLanguage}`);
            
            // 添加调试信息到控制台
            this.debugInfo();
            
        } catch (error) {
            console.error('❌ i18n initialization failed:', error);
            console.error('Stack trace:', error.stack);
            
            // 使用默认语言作为后备
            if (this.currentLanguage !== this.fallbackLang) {
                console.log(`🔄 Falling back to default language: ${this.fallbackLang}`);
                await this.switchLanguage(this.fallbackLang);
            }
        }
    }

    /**
     * 调试信息
     */
    debugInfo() {
        console.log('🐛 I18n Debug Info:', {
            currentLanguage: this.currentLanguage,
            supportedLanguages: Object.keys(this.supportedLanguages),
            translationsLoaded: !!this.translations,
            languageBtn: !!document.getElementById('languageBtn'),
            languageDropdown: !!document.getElementById('languageDropdown'),
            languageOptions: document.querySelectorAll('.language-option').length
        });
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
            // 根据当前页面路径调整翻译文件路径
            const currentPath = window.location.pathname;
            const basePath = currentPath.includes('/pages/') ? '../lang/' : 'lang/';
            
            const response = await fetch(`${basePath}${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}: ${response.status}`);
            }
            
            this.translations = await response.json();
            console.log(`📄 Loaded translations for: ${lang} from ${basePath}${lang}.json`);
            
        } catch (error) {
            console.error(`❌ Error loading translations for ${lang}:`, error);
            
            // 如果不是后备语言，尝试加载后备语言
            if (lang !== this.fallbackLang) {
                console.log(`🔄 Falling back to ${this.fallbackLang}`);
                const currentPath = window.location.pathname;
                const basePath = currentPath.includes('/pages/') ? '../lang/' : 'lang/';
                const fallbackResponse = await fetch(`${basePath}${this.fallbackLang}.json`);
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
            const translation = this.t(key);
            
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
            const translation = this.t(key);
            
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
            const siteTitle = this.t('meta.siteTitle') || 'IAFEI - International Association of Financial Executives Institutes';
            
            if (pageName && pageName !== 'home') {
                titleElement.textContent = `${this.t(`pages.${pageName}.title`)} - ${siteTitle}`;
            } else {
                titleElement.textContent = siteTitle;
            }
        }

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && this.translations.meta) {
            const description = this.t('meta.description');
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
        const htmlLang = this.translations.meta?.htmlLang || this.currentLanguage;
        document.documentElement.lang = htmlLang;
        
        // 更新文档方向（如果需要）
        const isRTL = ['ar', 'he', 'fa'].includes(this.currentLanguage);
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

        if (newLang === this.currentLanguage) {
            return;
        }

        try {
            // 显示加载状态
            this.showLoadingState();
            
            // 加载新语言的翻译
            await this.loadTranslations(newLang);
            
            // 更新当前语言
            this.currentLanguage = newLang;
            
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
     * 设置语言（switchLanguage的别名）
     */
    async setLanguage(newLang) {
        return await this.switchLanguage(newLang);
    }

    /**
     * 更新语言选择器显示
     */
    updateLanguageSelector() {
        // 更新现有的语言选择器
        this.updateLanguageSelectorDisplay();
        
        // 更新传统语言选择器（如果存在）
        const currentSpan = document.querySelector('.language-current');
        if (currentSpan) {
            currentSpan.textContent = this.supportedLanguages[this.currentLanguage];
        }
        
        // 更新所有语言选项的active状态
        const allOptions = document.querySelectorAll('.language-option');
        allOptions.forEach(option => {
            const lang = option.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    /**
     * 初始化语言选择器
     */
    initLanguageSelector() {
        console.log('🎛️ Initializing language selector...');
        
        // 使用微延迟确保DOM完全加载
        setTimeout(() => {
            // 检查页面中是否已有语言选择器
            const existingButton = document.getElementById('languageBtn');
            const existingDropdown = document.getElementById('languageDropdown');
            
            console.log('🔍 Language selector elements check:', {
                button: !!existingButton,
                dropdown: !!existingDropdown,
                buttonId: existingButton?.id,
                dropdownId: existingDropdown?.id
            });
            
            if (existingButton && existingDropdown) {
                console.log('✅ Using existing language selector');
                // 使用现有的语言选择器
                this.bindExistingLanguageSelectorEvents();
                this.updateLanguageSelectorDisplay();
            } else {
                console.log('⚠️ Creating new language selector');
                // 创建新的语言选择器（向后兼容）
                const languageSelector = this.createLanguageSelector();
                document.body.appendChild(languageSelector);
                this.bindLanguageSelectorEvents();
            }
        }, 50);
    }

    /**
     * 绑定现有语言选择器的事件
     */
    bindExistingLanguageSelectorEvents() {
        console.log('🔧 Starting bindExistingLanguageSelectorEvents');
        
        // 移除之前可能存在的事件监听器
        const existingBtn = document.getElementById('languageBtn');
        const existingDropdown = document.getElementById('languageDropdown');
        
        if (!existingBtn || !existingDropdown) {
            console.error('❌ Language selector elements not found:', {
                btn: !!existingBtn,
                dropdown: !!existingDropdown
            });
            return;
        }
        
        // 克隆按钮以移除所有旧的事件监听器
        const newBtn = existingBtn.cloneNode(true);
        existingBtn.parentNode.replaceChild(newBtn, existingBtn);
        
        const dropdown = document.getElementById('languageDropdown'); // 重新获取
        const options = dropdown.querySelectorAll('.language-option');
        
        console.log(`� Found ${options.length} language options`);
        
        // 简化的点击事件处理
        newBtn.onclick = (e) => {
            console.log('🖱️ Language button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = dropdown.classList.contains('open');
            dropdown.classList.toggle('open');
            
            console.log(`🔄 Dropdown ${isOpen ? 'closed' : 'opened'}`);
        };
        
        // 外部点击关闭
        document.onclick = (e) => {
            if (!newBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        };
        
        // 语言选项事件
        options.forEach((option, index) => {
            option.onclick = async (e) => {
                console.log(`🔄 Language option ${index} clicked`);
                e.preventDefault();
                e.stopPropagation();
                
                const lang = option.getAttribute('data-lang');
                console.log(`🌍 Switching to: ${lang}`);
                
                if (lang && lang !== this.currentLanguage) {
                    try {
                        await this.setLanguage(lang);
                        dropdown.classList.remove('open');
                        console.log(`✅ Language switched successfully to: ${lang}`);
                    } catch (error) {
                        console.error('❌ Language switch failed:', error);
                    }
                }
            };
        });
        
        console.log('✅ Language selector events bound with onclick handlers');
    }    /**
     * 重新绑定语言选择器（用于页面动态更新后）
     */
    rebindLanguageSelector() {
        console.log('🔄 Rebinding language selector...');
        this.bindExistingLanguageSelectorEvents();
        this.updateLanguageSelectorDisplay();
    }

    /**
     * 更新语言选择器显示
     */
    updateLanguageSelectorDisplay() {
        const currentLanguageSpan = document.getElementById('currentLanguageText');
        const options = document.querySelectorAll('.language-option');
        
        if (currentLanguageSpan) {
            currentLanguageSpan.textContent = this.supportedLanguages[this.currentLanguage];
        }
        
        // 更新选项的active状态
        options.forEach(option => {
            const lang = option.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
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
                <span class="language-current">${this.supportedLanguages[this.currentLanguage]}</span>
                <span class="language-arrow">▼</span>
            </button>
            <div class="language-dropdown">
                ${Object.entries(this.supportedLanguages).map(([code, name]) => `
                    <button class="language-option ${code === this.currentLanguage ? 'active' : ''}" 
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
            dropdown.classList.toggle('open');
            toggle.classList.toggle('active');
        });
        
        // 选择语言
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const newLang = e.target.getAttribute('data-lang');
                this.switchLanguage(newLang);
                dropdown.classList.remove('open');
                toggle.classList.remove('active');
            });
        });
        
        // 点击外部关闭下拉菜单
        document.addEventListener('click', () => {
            dropdown.classList.remove('open');
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
            currentSpan.textContent = this.supportedLanguages[this.currentLanguage];
        }
        
        options.forEach(option => {
            const lang = option.getAttribute('data-lang');
            option.classList.toggle('active', lang === this.currentLanguage);
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
                oldLang: this.currentLanguage,
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
        return this.currentLanguage;
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 创建全局i18n实例
        if (!window.i18n) {
            window.i18n = new I18nManager();
        }
        
        // 初始化系统
        await window.i18n.init();
        
        console.log('✅ I18n system initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize i18n system:', error);
    }
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}