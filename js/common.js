// Error handling
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
    // Add error reporting logic here
});

// Common utilities
const utils = {
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },
    
    showNotification(message, type = 'info') {
        // Add notification logic here
    }
};

// Authentication handling
const auth = {
    checkAuth() {
        // Add authentication check logic
    },
    
    logout() {
        // Add logout logic
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // 更新用户名显示
    const userNameElement = document.querySelector('.header-right span');
    if (userNameElement) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (userInfo.fullName) {
            userNameElement.textContent = `Welcome, ${userInfo.fullName}`;
        }
    }

    // 处理登出
    const signOutBtn = document.querySelector('.sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function() {
            // 清除用户信息
            localStorage.removeItem('userInfo');
            // 重定向到登录页面
            window.location.href = 'login.html';
        });
    }
}); 