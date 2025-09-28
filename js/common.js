/**
 * IAFEI Common Components Manager
 * 公共组件管理器
 */
class CommonComponents {
    /**
     * 渲染语言选择器
     * @param {string} position - 位置 ('top-right' | 'footer')
     * @returns {string} HTML字符串
     */
    static renderLanguageSelector(position = 'top-right') {
        const selectorClass = position === 'footer' ? 'footer-language-selector' : 'language-selector';
        
        return `
            <div class="${selectorClass}">
                <button class="language-toggle" id="languageBtn">
                    <span class="language-icon">🌐</span>
                    <span class="language-current" id="currentLanguageText">English</span>
                    <span class="language-arrow">▼</span>
                </button>
                <div class="language-dropdown" id="languageDropdown">
                    <button class="language-option" data-lang="en">
                        <span class="flag-icon">🇺🇸</span>
                        English
                    </button>
                    <button class="language-option" data-lang="zh-cn">
                        <span class="flag-icon">🇨🇳</span>
                        简体中文
                    </button>
                    <button class="language-option" data-lang="zh-tw">
                        <span class="flag-icon">🇹🇼</span>
                        繁體中文
                    </button>
                    <button class="language-option" data-lang="ja">
                        <span class="flag-icon">🇯🇵</span>
                        日本語
                    </button>
                    <button class="language-option" data-lang="de">
                        <span class="flag-icon">🇩🇪</span>
                        Deutsch
                    </button>
                    <button class="language-option" data-lang="it">
                        <span class="flag-icon">🇮🇹</span>
                        Italiano
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 初始化语言选择器到指定位置
     * @param {string} position - 位置 ('top-right' | 'footer')
     */
    static initLanguageSelector(position = 'top-right') {
        console.log(`🎛️ Initializing language selector at ${position}...`);
        
        // 检查是否已存在语言选择器
        const existingSelector = document.querySelector('.language-selector') || 
                                document.querySelector('.footer-language-selector');
        
        if (existingSelector) {
            console.log('✅ Language selector already exists');
            return;
        }

        // 创建语言选择器
        const selectorHTML = this.renderLanguageSelector(position);
        
        if (position === 'top-right') {
            // 添加到body开始处
            document.body.insertAdjacentHTML('afterbegin', selectorHTML);
        } else if (position === 'footer') {
            // 添加到footer中
            const footer = document.querySelector('.footer-bottom-content');
            if (footer) {
                footer.insertAdjacentHTML('beforeend', selectorHTML);
            }
        }

        console.log(`✅ Language selector added to ${position}`);
    }

    /**
     * 初始化多语言支持
     * @param {string} currentPage - 当前页面标识
     */
    static async initI18n(currentPage = 'home') {
        try {
            console.log(`🌐 Initializing i18n for page: ${currentPage}`);
            
            // 确保i18n脚本已加载
            if (typeof I18nManager === 'undefined') {
                console.warn('⚠️ I18nManager not loaded, loading i18n.js...');
                await this.loadScript('../js/i18n.js');
            }

            // 初始化语言选择器
            this.initLanguageSelector('top-right');

            // 等待DOM完全加载后初始化i18n
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.startI18n(currentPage);
                });
            } else {
                this.startI18n(currentPage);
            }

        } catch (error) {
            console.error('❌ Failed to initialize i18n:', error);
        }
    }

    /**
     * 启动i18n系统
     * @param {string} currentPage - 当前页面
     */
    static async startI18n(currentPage) {
        try {
            // 创建全局i18n实例
            if (!window.i18nManager) {
                window.i18nManager = new I18nManager();
            }
            
            // 初始化i18n
            await window.i18nManager.init();
            console.log(`✅ I18n initialized successfully for ${currentPage}`);
            
        } catch (error) {
            console.error('❌ Failed to start i18n:', error);
        }
    }

    /**
     * 动态加载脚本
     * @param {string} src - 脚本路径
     * @returns {Promise}
     */
    static loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * 为页面添加多语言属性
     * @param {Object} translations - 翻译映射对象
     */
    static addI18nAttributes(translations) {
        Object.keys(translations).forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!element.hasAttribute('data-i18n')) {
                    element.setAttribute('data-i18n', translations[selector]);
                }
            });
        });
    }

    /**
     * 获取页面路径信息
     * @returns {Object} 路径信息
     */
    static getPageInfo() {
        const pathname = window.location.pathname;
        const isSubPage = pathname.includes('/pages/');
        const pageName = isSubPage ? 
            pathname.split('/').pop().replace('.html', '') : 
            'home';
        
        return {
            isSubPage,
            pageName,
            basePath: isSubPage ? '../' : './'
        };
    }

    /**
     * 更新页面中的相对路径
     * @param {boolean} isSubPage - 是否为子页面
     */
    static updateResourcePaths(isSubPage) {
        if (!isSubPage) return;

        // 更新CSS路径
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        cssLinks.forEach(link => {
            if (link.href.includes('css/styles.css') && !link.href.includes('../')) {
                link.href = '../css/styles.css';
            }
        });

        // 更新JS脚本路径
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (script.src.includes('js/') && !script.src.includes('../')) {
                script.src = script.src.replace('js/', '../js/');
            }
        });
    }
}

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    const pageInfo = CommonComponents.getPageInfo();
    console.log('📄 Page info:', pageInfo);
    
    // 自动初始化多语言支持
    CommonComponents.initI18n(pageInfo.pageName);
});

// 导出到全局
window.CommonComponents = CommonComponents;