document.addEventListener('DOMContentLoaded', function() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const deviceGrid = document.querySelector('.device-grid');
    const deviceTable = document.querySelector('.device-table');

    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有视图按钮的 active 类
            viewButtons.forEach(btn => btn.classList.remove('active'));
            // 为当前点击的按钮添加 active 类
            this.classList.add('active');

            // 根据按钮的 data-view 属性切换视图
            const viewType = this.getAttribute('data-view');
            if (viewType === 'grid') {
                deviceGrid.classList.add('active');
                deviceTable.classList.remove('active');
            } else {
                deviceGrid.classList.remove('active');
                deviceTable.classList.add('active');
            }
        });
    });

    // 分页功能
    const tableContent = document.querySelector('.table-content');
    const paginationInfo = document.querySelector('.pagination-info');
    const pageNumbers = document.querySelector('.page-numbers');
    const prevBtn = document.querySelector('[data-action="prev"]');
    const nextBtn = document.querySelector('[data-action="next"]');

    // 检查必要的分页元素是否存在
    if (tableContent && paginationInfo && pageNumbers && prevBtn && nextBtn) {
        const itemsPerPage = 20;
        const totalItems = 20;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        let currentPage = 1;

        function updatePagination() {
            // 更新显示信息
            const start = (currentPage - 1) * itemsPerPage + 1;
            const end = Math.min(currentPage * itemsPerPage, totalItems);
            paginationInfo.innerHTML = `Showing <span>${start}-${end}</span> of <span>${totalItems}</span> items`;

            // 更新按钮状态
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;

            // 更新页码按钮
            pageNumbers.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement('button');
                button.className = `page-btn${i === currentPage ? ' active' : ''}`;
                button.textContent = i;
                button.addEventListener('click', () => goToPage(i));
                pageNumbers.appendChild(button);
            }

            // 显示当前页的内容
            const rows = tableContent.querySelectorAll('.table-row');
            rows.forEach((row, index) => {
                const shouldShow = index >= (currentPage - 1) * itemsPerPage && 
                                 index < currentPage * itemsPerPage;
                row.style.display = shouldShow ? 'grid' : 'none';
            });
        }

        function goToPage(page) {
            currentPage = page;
            updatePagination();
        }

        // 绑定上一页/下一页按钮事件
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                goToPage(currentPage - 1);
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                goToPage(currentPage + 1);
            }
        });

        // 初始化分页
        updatePagination();
    }

    // 添加筛选弹窗相关的 JavaScript
    const filterModal = document.getElementById('filterModal');
    const openFilterBtn = document.getElementById('openFilter');
    const closeFilterBtn = document.getElementById('closeFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');

    if (!filterModal || !openFilterBtn || !closeFilterBtn) {
        console.error('Filter elements not found');
        return;
    }

    // 打开筛选弹窗
    openFilterBtn.addEventListener('click', () => {
        console.log('Opening filter modal'); // 添加调试日志
        filterModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // 关闭筛选弹窗
    function closeModal() {
        filterModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeFilterBtn.addEventListener('click', closeModal);
    filterModal.addEventListener('click', (e) => {
        if (e.target === filterModal) {
            closeModal();
        }
    });

    // 应用筛选
    applyFiltersBtn.addEventListener('click', () => {
        // 获取所有筛选值
        const filters = {
            country: document.getElementById('countryFilter').value,
            state: document.getElementById('stateFilter').value,
            city: document.getElementById('cityFilter').value,
            status: document.getElementById('statusFilter').value,
            site: document.getElementById('siteFilter').value,
            rmu: document.getElementById('rmuFilter').value
        };

        // 更新筛选标记数量
        const activeFilters = Object.values(filters).filter(Boolean).length;
        const filterBadge = document.querySelector('.filter-badge');
        filterBadge.textContent = activeFilters;
        filterBadge.style.display = activeFilters ? 'inline-block' : 'none';

        // 应用筛选逻辑
        applyFilters(filters);
        closeModal();
    });

    // 重置筛选
    resetFiltersBtn.addEventListener('click', () => {
        document.querySelectorAll('.filter-modal select').forEach(select => {
            select.value = '';
        });
    });

    // 级联选择逻辑
    document.getElementById('countryFilter').addEventListener('change', function() {
        updateStateOptions(this.value);
    });

    document.getElementById('stateFilter').addEventListener('change', function() {
        updateCityOptions(this.value);
    });
});

function applyFilters(filters) {
    // 实现筛选逻辑
    console.log('Applying filters:', filters);
}

function updateStateOptions(country) {
    // 根据选择的国家更新州/省选项
}

function updateCityOptions(state) {
    // 根据选择的州/省更新城市选项
} 