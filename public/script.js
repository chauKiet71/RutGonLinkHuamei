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
            // Use domain tiengtrunghuamei.com.vn if possible, or just the short string
            const displayUrl = `tiengtrunghuamei.com.vn/${data.slug}`;
            
            resultMsg.innerHTML = `
                Tạo link thành công! <br>
                <a href="/${data.slug}" target="_blank" style="color: inherit; font-weight: bold; margin-top: 10px; display: inline-block;">${displayUrl}</a>
                <button class="copy-btn" onclick="copyToClipboard('http://${displayUrl}')">Copy</button>
            `;
            resultMsg.classList.add('success', 'show');
            resultMsg.style.display = 'block';
            
            // Clear form
            slugInput.value = '';
            destinationInput.value = '';
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

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Đã copy link!');
    }).catch(err => {
        console.error('Lỗi khi copy: ', err);
    });
}
