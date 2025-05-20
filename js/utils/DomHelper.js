/**
 * DomHelper.js
 * DOM操作輔助函數集合，提供方便的DOM元素操作方法
 */

class DomHelper {
    /**
     * 根據ID獲取DOM元素
     * @param {string} id - 元素ID
     * @returns {HTMLElement|null} 找到的元素或null
     */
    static getElementById(id) {
        return document.getElementById(id);
    }

    /**
     * 根據選擇器獲取DOM元素
     * @param {string} selector - CSS選擇器
     * @returns {HTMLElement|null} 找到的第一個元素或null
     */
    static querySelector(selector) {
        return document.querySelector(selector);
    }
    /**
     * 簡化方法：根據 CSS 選擇器獲取元素（等同於 querySelector）
     * @param {string} selector - CSS選擇器（如 '#mainCanvas'）
     * @returns {HTMLElement|null}
     */
    static get(selector) {
        return this.querySelector(selector);
    }

    /**
     * 根據選擇器獲取多個DOM元素
     * @param {string} selector - CSS選擇器
     * @returns {NodeList} 找到的所有元素
     */
    static querySelectorAll(selector) {
        return document.querySelectorAll(selector);
    }

    /**
     * 從模板創建元素
     * @param {string} templateId - 模板的ID
     * @returns {DocumentFragment} 從模板創建的文檔片段
     */
    static createFromTemplate(templateId) {
        const template = document.getElementById(templateId);
        if (!template) {
            console.error(`Template with ID "${templateId}" not found`);
            return null;
        }
        return template.content.cloneNode(true);
    }

    /**
     * 顯示元素
     * @param {HTMLElement} element - 要顯示的元素
     */
    static showElement(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    }

    /**
     * 隱藏元素
     * @param {HTMLElement} element - 要隱藏的元素
     */
    static hideElement(element) {
        if (element) {
            element.classList.add('hidden');
        }
    }

    /**
     * 切換元素的可見性
     * @param {HTMLElement} element - 要切換可見性的元素
     * @returns {boolean} 切換後的可見狀態（true表示可見）
     */
    static toggleElement(element) {
        if (element) {
            const isHidden = element.classList.toggle('hidden');
            return !isHidden;
        }
        return false;
    }

    /**
     * 添加事件監聽器
     * @param {HTMLElement} element - 要添加監聽器的元素
     * @param {string} eventType - 事件類型
     * @param {Function} callback - 回調函數
     * @param {Object} [options] - 事件選項
     */
    static addEventListener(element, eventType, callback, options) {
        if (element) {
            element.addEventListener(eventType, callback, options);
        }
    }

    /**
     * 移除事件監聽器
     * @param {HTMLElement} element - 要移除監聽器的元素
     * @param {string} eventType - 事件類型
     * @param {Function} callback - 回調函數
     * @param {Object} [options] - 事件選項
     */
    static removeEventListener(element, eventType, callback, options) {
        if (element) {
            element.removeEventListener(eventType, callback, options);
        }
    }

    /**
     * 為多個元素添加同一事件監聽器
     * @param {NodeList|Array} elements - 要添加監聽器的元素集合
     * @param {string} eventType - 事件類型
     * @param {Function} callback - 回調函數
     * @param {Object} [options] - 事件選項
     */
    static addEventListenerAll(elements, eventType, callback, options) {
        if (elements && elements.length) {
            elements.forEach(element => {
                element.addEventListener(eventType, callback, options);
            });
        }
    }

    /**
     * 設置元素的HTML內容
     * @param {HTMLElement} element - 目標元素
     * @param {string} html - HTML內容
     */
    static setHTML(element, html) {
        if (element) {
            element.innerHTML = html;
        }
    }

    /**
     * 設置元素的文本內容
     * @param {HTMLElement} element - 目標元素
     * @param {string} text - 文本內容
     */
    static setText(element, text) {
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * 添加CSS類
     * @param {HTMLElement} element - 目標元素
     * @param {string|Array} classNames - 要添加的CSS類名
     */
    static addClass(element, classNames) {
        if (element) {
            if (Array.isArray(classNames)) {
                element.classList.add(...classNames);
            } else {
                element.classList.add(classNames);
            }
        }
    }

    /**
     * 移除CSS類
     * @param {HTMLElement} element - 目標元素
     * @param {string|Array} classNames - 要移除的CSS類名
     */
    static removeClass(element, classNames) {
        if (element) {
            if (Array.isArray(classNames)) {
                element.classList.remove(...classNames);
            } else {
                element.classList.remove(classNames);
            }
        }
    }

    /**
     * 切換CSS類
     * @param {HTMLElement} element - 目標元素
     * @param {string} className - 要切換的CSS類名
     * @param {boolean} [force] - 強制添加或移除
     * @returns {boolean} 切換後的類狀態
     */
    static toggleClass(element, className, force) {
        if (element) {
            return element.classList.toggle(className, force);
        }
        return false;
    }

    /**
     * 檢查元素是否有指定的CSS類
     * @param {HTMLElement} element - 目標元素
     * @param {string} className - 要檢查的CSS類名
     * @returns {boolean} 如果有返回true，否則返回false
     */
    static hasClass(element, className) {
        if (element) {
            return element.classList.contains(className);
        }
        return false;
    }

    /**
     * 創建HTML元素
     * @param {string} tagName - 標籤名
     * @param {Object} [attributes] - 屬性對象
     * @param {string|HTMLElement} [content] - 文本內容或子元素
     * @returns {HTMLElement} 創建的元素
     */
    static createElement(tagName, attributes, content) {
        const element = document.createElement(tagName);

        // 設置屬性
        if (attributes) {
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'class') {
                    value.split(' ').forEach(cls => {
                        if (cls) element.classList.add(cls);
                    });
                } else {
                    element.setAttribute(key, value);
                }
            });
        }

        // 設置內容
        if (content !== undefined) {
            if (typeof content === 'string') {
                element.textContent = content;
            } else if (content instanceof HTMLElement) {
                element.appendChild(content);
            }
        }

        return element;
    }

    /**
     * 清空元素內容
     * @param {HTMLElement} element - 要清空的元素
     */
    static clearElement(element) {
        if (element) {
            element.innerHTML = '';
        }
    }

    /**
     * 在元素末尾添加子元素
     * @param {HTMLElement} parent - 父元素
     * @param {HTMLElement|Array} children - 子元素或子元素數組
     */
    static appendChildren(parent, children) {
        if (parent) {
            if (Array.isArray(children)) {
                children.forEach(child => {
                    if (child) {
                        parent.appendChild(child);
                    }
                });
            } else if (children) {
                parent.appendChild(children);
            }
        }
    }

    /**
     * 在元素前面插入子元素
     * @param {HTMLElement} parent - 父元素
     * @param {HTMLElement} newChild - 新子元素
     * @param {HTMLElement} [referenceChild] - 參考子元素，新元素將插入在此元素之前
     */
    static insertBefore(parent, newChild, referenceChild) {
        if (parent && newChild) {
            parent.insertBefore(newChild, referenceChild || null);
        }
    }

    /**
     * 顯示通知消息
     * @param {string} message - 消息內容
     * @param {string} [type='info'] - 消息類型（info, success, warning, error）
     * @param {number} [duration=3000] - 顯示時間（毫秒）
     */
    static showNotification(message, type = 'info', duration = 3000) {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');

        if (notification && notificationText) {
            // 清除之前的類名
            notification.className = 'notification';

            // 添加新的類名
            notification.classList.add('show', type);

            // 設置消息
            notificationText.textContent = message;

            // 顯示通知
            notification.classList.remove('hidden');

            // 設定定時器自動隱藏
            setTimeout(() => {
                notification.classList.add('hidden');
            }, duration);
        }
    }

    /**
     * 顯示載入中遮罩
     * @param {boolean} [show=true] - 是否顯示遮罩
     */
    static toggleLoading(show = true) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.remove('hidden');
            } else {
                loadingOverlay.classList.add('hidden');
            }
        }
    }

    /**
     * 禁用/啟用按鈕
     * @param {HTMLElement} button - 按鈕元素
     * @param {boolean} [disabled=true] - 是否禁用
     */
    static toggleButtonDisabled(button, disabled = true) {
        if (button) {
            button.disabled = disabled;
            if (disabled) {
                button.classList.add('disabled');
            } else {
                button.classList.remove('disabled');
            }
        }
    }

    /**
     * 設置表單元素的值
     * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} element - 表單元素
     * @param {string|number|boolean} value - 要設置的值
     */
    static setFormValue(element, value) {
        if (element) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = Boolean(value);
            } else {
                element.value = value;
            }

            // 觸發變更事件
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        }
    }

    /**
     * 獲取表單元素的值
     * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} element - 表單元素
     * @returns {string|boolean|null} 元素的值
     */
    static getFormValue(element) {
        if (element) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                return element.checked;
            } else {
                return element.value;
            }
        }
        return null;
    }
}

export { DomHelper };
