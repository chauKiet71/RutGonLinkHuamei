document.getElementById('link-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const slugInput = document.getElementById('slug');
    const destinationInput = document.getElementById('destination');
    const submitBtn = document.getElementById('submit-btn');
    const loader = document.getElementById('loader');
    const btnText = submitBtn.querySelector('span');
    const resultMsg = document.getElementById('result-message');
    
    const slug = slugInput.value.trim();
    const destination = destinationInput.value.trim();
    
    if (!destination) return;
    
    // UI Loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    loader.style.display = 'block';
    resultMsg.style.display = 'none';
    resultMsg.className = 'message';
    
    try {
        const response = await fetch('/api/links', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ slug, destination })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Success
            const shortUrl = `${window.location.origin}/${data.slug}`;
            const displayUrl = `${window.location.host}/${data.slug}`;
            
            resultMsg.innerHTML = `
                Tạo link thành công! <br>
                <a href="/${data.slug}" target="_blank" style="color: inherit; font-weight: bold; margin-top: 10px; display: inline-block;">${displayUrl}</a>
                <button class="copy-btn" onclick="copyToClipboard('${shortUrl}')">Copy</button>
            `;
            resultMsg.classList.add('success', 'show');
            resultMsg.style.display = 'block';
            
            // Clear form
            slugInput.value = '';
            destinationInput.value = '';

            // Reload links list
            loadLinks();
        } else {
            // Error
            resultMsg.textContent = data.message || 'Có lỗi xảy ra khi tạo link.';
            resultMsg.classList.add('error', 'show');
            resultMsg.style.display = 'block';
        }
    } catch (err) {
        resultMsg.textContent = 'Lỗi kết nối đến máy chủ.';
        resultMsg.classList.add('error', 'show');
        resultMsg.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        loader.style.display = 'none';
    }
});

async function loadLinks() {
    const linksList = document.getElementById('links-list');
    try {
        const response = await fetch('/api/links');
        if (!response.ok) throw new Error('Không thể tải danh sách link');
        const links = await response.json();
        
        if (links.length === 0) {
            linksList.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">Chưa có link nào được tạo.</td>
                </tr>
            `;
            return;
        }
        
        linksList.innerHTML = links.map(link => {
            const shortUrl = `${window.location.origin}/${link.slug}`;
            const displayUrl = `${window.location.host}/${link.slug}`;
            const formattedDate = new Date(link.createdAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <tr>
                    <td>
                        <a href="/${link.slug}" target="_blank" class="link-url">${displayUrl}</a>
                    </td>
                    <td>
                        <div class="dest-url-wrapper" title="${link.destination}">
                            <a href="${link.destination}" target="_blank" class="dest-url">${link.destination}</a>
                        </div>
                    </td>
                    <td style="text-align: center;">
                        <span class="click-badge">${link.clicks}</span>
                    </td>
                    <td>${formattedDate}</td>
                    <td style="text-align: center;">
                        <button class="action-btn" onclick="copyToClipboard('${shortUrl}')">
                            Copy
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        linksList.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state" style="color: var(--error);">Lỗi: ${err.message}</td>
            </tr>
        `;
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Đã copy link!');
    }).catch(err => {
        console.error('Lỗi khi copy: ', err);
    });
}

// Load links on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLinks);
} else {
    loadLinks();
}
