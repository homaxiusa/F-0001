document.addEventListener('DOMContentLoaded', function() {
    // 获取表单元素
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // 密码可见性切换
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // 更新图标
            const eyeIcon = this.querySelector('svg');
            if (type === 'text') {
                eyeIcon.innerHTML = `
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                `;
            } else {
                eyeIcon.innerHTML = `
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                `;
            }
        });
    });

    // 登录表单处理
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = new FormData(this);
            const data = {
                email: formData.get('email'),
                password: formData.get('password'),
                remember: formData.get('remember') === 'on'
            };

            try {
                const submitButton = this.querySelector('button[type="submit"]');
                submitButton.classList.add('loading');
                
                // 模拟API调用延迟
                await new Promise(resolve => setTimeout(resolve, 1500));

                // 保存用户信息到 localStorage
                const userInfo = {
                    email: data.email,
                    // 这里应该从后端获取用户全名，现在模拟从邮箱中提取
                    fullName: data.email.split('@')[0]  // 从邮箱中提取用户名
                };
                localStorage.setItem('userInfo', JSON.stringify(userInfo));

                // 登录成功后重定向到仪表板
                window.location.href = 'dashboard0.html';
                
            } catch (error) {
                console.error('Login failed:', error);
                showError(this, 'Invalid email or password');
            } finally {
                submitButton.classList.remove('loading');
            }
        });
    }

    // 注册表单处理
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = new FormData(this);
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };

            // 验证密码匹配
            if (data.password !== data.confirmPassword) {
                showError(this, 'Passwords do not match');
                return;
            }

            try {
                // 显示加载状态
                const submitButton = this.querySelector('button[type="submit"]');
                submitButton.classList.add('loading');

                // 这里添加实际的注册API调用
                // const response = await fetch('/api/register', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json'
                //     },
                //     body: JSON.stringify(data)
                // });

                // 模拟API调用延迟
                await new Promise(resolve => setTimeout(resolve, 1500));

                // 注册成功后重定向到登录页面
                window.location.href = 'login.html';
                
            } catch (error) {
                console.error('Registration failed:', error);
                showError(this, 'Registration failed. Please try again.');
            } finally {
                submitButton.classList.remove('loading');
            }
        });
    }

    // 显示错误消息的辅助函数
    function showError(form, message) {
        // 移除现有的错误消息
        const existingError = form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // 创建并添加新的错误消息
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        form.querySelector('button[type="submit"]').insertAdjacentElement('beforebegin', errorDiv);

        // 3秒后自动移除错误消息
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    // 处理登出按钮
    const signOutBtn = document.querySelector('.sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function() {
            // 清除用户信息
            localStorage.removeItem('userInfo');
            // 重定向到登录页面
            window.location.href = 'index.html';
        });
    }
}); 