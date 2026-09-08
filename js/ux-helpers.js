/* =========================================================
   SHOTMARKET UX HELPERS
   Consistent loading states, error messages & notifications
========================================================= */

const ShotMarketUX = {
    
    // ============================================================
    // LOADING STATES
    // ============================================================

    showLoading: function(elementId, message = "Loading...") {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.innerHTML = `
            <div class="loading-state">
                <div class="spinner">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                </div>
                <p>${message}</p>
            </div>
        `;
        element.classList.add('loading');
    },

    hideLoading: function(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.classList.remove('loading');
        element.innerHTML = '';
    },

    // ============================================================
    // ERROR STATES
    // ============================================================

    showError: function(elementId, title = "Error", message = "Something went wrong", details = null) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let detailsHTML = '';
        if (details) {
            detailsHTML = `<small>${details}</small>`;
        }

        element.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fa-solid fa-exclamation-circle"></i>
                </div>
                <h3>${title}</h3>
                <p>${message}</p>
                ${detailsHTML}
            </div>
        `;
        element.classList.add('error');
    },

    // ============================================================
    // EMPTY STATES
    // ============================================================

    showEmpty: function(elementId, title = "No Items", message = "Nothing to display", icon = "inbox") {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fa-regular fa-${icon}"></i>
                </div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
        element.classList.add('empty');
    },

    // ============================================================
    // SUCCESS MESSAGES
    // ============================================================

    showSuccess: function(message = "Success!", duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fa-solid fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        return toast;
    },

    // ============================================================
    // ERROR TOASTS
    // ============================================================

    showErrorToast: function(message = "An error occurred", duration = 4000) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fa-solid fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        return toast;
    },

    // ============================================================
    // WARNING TOASTS
    // ============================================================

    showWarning: function(message = "Warning", duration = 3500) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-warning';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        return toast;
    },

    // ============================================================
    // INFO TOASTS
    // ============================================================

    showInfo: function(message = "Information", duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-info';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fa-solid fa-info-circle"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        return toast;
    },

    // ============================================================
    // BUTTON STATES
    // ============================================================

    setButtonLoading: function(buttonId, loadingText = "Loading...") {
        const button = document.getElementById(buttonId);
        if (!button) return;

        button.dataset.originalHTML = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            ${loadingText}
        `;
        button.classList.add('loading');
    },

    setButtonSuccess: function(buttonId, successText = "Success!", duration = 2000) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        button.disabled = true;
        button.innerHTML = `
            <i class="fa-solid fa-check"></i>
            ${successText}
        `;
        button.classList.add('success');

        setTimeout(() => {
            this.resetButton(buttonId);
        }, duration);
    },

    setButtonError: function(buttonId, errorText = "Error") {
        const button = document.getElementById(buttonId);
        if (!button) return;

        button.disabled = false;
        button.innerHTML = `
            <i class="fa-solid fa-exclamation"></i>
            ${errorText}
        `;
        button.classList.add('error');

        setTimeout(() => {
            this.resetButton(buttonId);
        }, 3000);
    },

    resetButton: function(buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        if (button.dataset.originalHTML) {
            button.innerHTML = button.dataset.originalHTML;
            delete button.dataset.originalHTML;
        }

        button.disabled = false;
        button.classList.remove('loading', 'success', 'error');
    },

    // ============================================================
    // CONFIRMATION DIALOGS
    // ============================================================

    confirm: function(title, message, options = {}) {
        return new Promise((resolve) => {
            const defaults = {
                okText: "Confirm",
                cancelText: "Cancel",
                type: "warning" // "warning" | "danger" | "info"
            };

            const config = { ...defaults, ...options };

            const modal = document.createElement('div');
            modal.className = 'confirmation-modal';
            modal.innerHTML = `
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${title}</h2>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-cancel">${config.cancelText}</button>
                        <button class="btn-confirm btn-${config.type}">${config.okText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const cancelBtn = modal.querySelector('.btn-cancel');
            const confirmBtn = modal.querySelector('.btn-confirm');

            cancelBtn.addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });

            confirmBtn.addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });

            // Click backdrop to cancel
            const backdrop = modal.querySelector('.modal-backdrop');
            backdrop.addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });

            // ESC key to cancel
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', escHandler);
                    modal.remove();
                    resolve(false);
                }
            };
            document.addEventListener('keydown', escHandler);
        });
    },

    // ============================================================
    // HELPER FUNCTION FOR TRY-CATCH PATTERNS
    // ============================================================

    handleError: function(error, context = "Operation") {
        console.error(`${context} Error:`, error);

        let message = "An unexpected error occurred";
        let details = null;

        if (error.message) {
            message = error.message;
        }

        if (error.status) {
            details = `Error ${error.status}`;
        }

        // Common error patterns
        if (message.includes("Failed to fetch")) {
            message = "Unable to connect to the server";
            details = "Please check your internet connection";
        }

        if (message.includes("not authenticated")) {
            message = "Authentication required";
            details = "Please log in again";
        }

        if (message.includes("Permission")) {
            message = "Permission denied";
            details = "You don't have access to this resource";
        }

        return { message, details };
    },

    // ============================================================
    // PAGE STATE MANAGEMENT
    // ============================================================

    setPageState: function(state, message = "") {
        const main = document.querySelector('main');
        if (!main) return;

        main.dataset.state = state;

        if (state === 'loading') {
            this.showLoading('page-content', message || 'Loading...');
        } else if (state === 'error') {
            this.showError('page-content', 'Error', message || 'Something went wrong');
        } else if (state === 'empty') {
            this.showEmpty('page-content', 'No Content', message || 'Nothing to display');
        }
    },

    clearPageState: function() {
        const main = document.querySelector('main');
        if (!main) return;

        delete main.dataset.state;
        const content = document.getElementById('page-content');
        if (content) {
            content.innerHTML = '';
            content.classList.remove('loading', 'error', 'empty');
        }
    }
};

// ============================================================
// CSS INJECTION FOR TOAST STYLES
// ============================================================

(function() {
    const style = document.createElement('style');
    style.textContent = `
        /* Toast Notifications */
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 16px 20px;
            min-width: 300px;
            z-index: 9999;
            opacity: 0;
            transform: translateY(100px);
            transition: all 0.3s ease;
            animation: slideUp 0.3s ease forwards;
        }

        .toast.show {
            opacity: 1;
            transform: translateY(0);
        }

        .toast-content {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
        }

        .toast-success {
            border-left: 4px solid #10b981;
        }

        .toast-success i {
            color: #10b981;
        }

        .toast-error {
            border-left: 4px solid #ef4444;
        }

        .toast-error i {
            color: #ef4444;
        }

        .toast-warning {
            border-left: 4px solid #f59e0b;
        }

        .toast-warning i {
            color: #f59e0b;
        }

        .toast-info {
            border-left: 4px solid #3b82f6;
        }

        .toast-info i {
            color: #3b82f6;
        }

        /* Confirmation Modal */
        .confirmation-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
        }

        .modal-content {
            position: relative;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 25px rgba(0,0,0,0.15);
            min-width: 320px;
            max-width: 500px;
            overflow: hidden;
        }

        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
            margin: 0;
            font-size: 18px;
        }

        .modal-body {
            padding: 20px;
        }

        .modal-footer {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            padding: 16px 20px;
            border-top: 1px solid #e5e7eb;
        }

        .modal-footer button {
            padding: 10px 20px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-weight: 500;
        }

        .btn-cancel {
            background: #f3f4f6;
            color: #374151;
        }

        .btn-cancel:hover {
            background: #e5e7eb;
        }

        .btn-confirm {
            background: #3b82f6;
            color: white;
        }

        .btn-confirm:hover {
            background: #2563eb;
        }

        .btn-confirm.btn-danger {
            background: #ef4444;
        }

        .btn-confirm.btn-danger:hover {
            background: #dc2626;
        }

        /* Loading State */
        .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            gap: 16px;
        }

        .spinner {
            font-size: 32px;
            color: #3b82f6;
        }

        /* Error State */
        .error-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            gap: 12px;
            text-align: center;
        }

        .error-icon {
            font-size: 48px;
            color: #ef4444;
        }

        /* Empty State */
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            gap: 12px;
            text-align: center;
        }

        .empty-icon {
            font-size: 48px;
            color: #9ca3af;
        }

        @media (max-width: 640px) {
            .toast {
                min-width: 280px;
                right: 12px;
                bottom: 12px;
            }

            .modal-content {
                margin: 20px;
            }
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(100px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
})();

// Export if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShotMarketUX;
}
