document.addEventListener('DOMContentLoaded', function() {
    // 模拟用户数据
    const mockUsers = [
        {
            id: 1,
            firstName: 'Bob',
            lastName: 'Wu',
            email: 'test@test.com',
            role: 'Administrator',
            status: 'active',
            lastLogin: '2024-03-15 10:30'
        },
        {
            id: 2,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'Manager',
            status: 'active',
            lastLogin: '2024-03-15 09:45'
        },
        {
            id: 3,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            status: 'inactive',
            lastLogin: '2024-03-14 15:20'
        }
    ];

    // 获取DOM元素
    const tableBody = document.querySelector('.table-body');
    const addUserBtn = document.getElementById('addUserBtn');
    const userModal = document.getElementById('userModal');
    const closeModalBtn = userModal.querySelector('.close-btn');
    const modalForm = userModal.querySelector('form');
    const searchInput = document.querySelector('.search-input input');

    // 渲染用户列表
    function renderUsers(users) {
        tableBody.innerHTML = users.map(user => `
            <div class="table-row">
                <div class="table-cell">
                    <input type="checkbox" class="select-user" data-id="${user.id}">
                </div>
                <div class="table-cell">${user.firstName} ${user.lastName}</div>
                <div class="table-cell">${user.email}</div>
                <div class="table-cell">
                    <span class="role-badge">${user.role}</span>
                </div>
                <div class="table-cell">
                    <span class="status-badge status-${user.status}">
                        ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                </div>
                <div class="table-cell">${user.lastLogin}</div>
                <div class="table-cell">
                    <div class="action-buttons">
                        <button class="action-btn tooltip" onclick="editUser(${user.id})" title="Edit User">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn tooltip" onclick="deleteUser(${user.id})" title="Delete User">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 6h18"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 初始化渲染
    renderUsers(mockUsers);

    // 搜索功能
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredUsers = mockUsers.filter(user => 
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
        renderUsers(filteredUsers);
    });

    // 打开添加用户模态框
    addUserBtn.addEventListener('click', function() {
        modalForm.reset();
        userModal.classList.add('active');
    });

    // 关闭模态框
    closeModalBtn.addEventListener('click', function() {
        userModal.classList.remove('active');
    });

    // 点击模态框外部关闭
    userModal.addEventListener('click', function(e) {
        if (e.target === userModal) {
            userModal.classList.remove('active');
        }
    });

    // 表单提交处理
    modalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const userData = {
            id: mockUsers.length + 1,
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            role: formData.get('role'),
            status: formData.get('status'),
            lastLogin: 'Never'
        };

        mockUsers.push(userData);
        renderUsers(mockUsers);
        userModal.classList.remove('active');
    });

    // 全选功能
    const selectAllCheckbox = document.querySelector('.select-all');
    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.select-user');
        checkboxes.forEach(checkbox => checkbox.checked = this.checked);
    });
});

// 编辑用户
function editUser(userId) {
    // 实现编辑用户功能
    console.log('Edit user:', userId);
}

// 删除用户
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        console.log('Delete user:', userId);
        // 实现删除用户功能
    }
} 