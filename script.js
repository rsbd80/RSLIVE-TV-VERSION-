document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('channel-container');
    const searchInput = document.getElementById('channelSearch');

    fetch('playlist.json?t=' + Date.now())
        .then(response => response.json())
        .then(data => {
            container.innerHTML = ''; 

            data.forEach((channel, index) => {
                const li = document.createElement('li');
                
                // রিমোট ফোকাস ধরার জন্য স্ট্যান্ডার্ড tabindex
                li.setAttribute('tabindex', '0');
                
                li.innerHTML = `
                    <div style="display: block; text-decoration: none; pointer-events: none; width: 100%;">
                        <img src="${channel.image}" alt="${channel.name}" loading="lazy">
                        <div class="channel-info-box">
                            <p class="channel-title">${channel.name}</p>
                        </div>
                    </div>
                `;

                // 🎯 ক্লিক লজিক
                li.addEventListener('click', function() {
                    if (window.frames['player']) {
                        window.frames['player'].location.href = channel.url;
                    } else {
                        player.location.href = channel.url;
                    }
                });
                
                container.appendChild(li);
            });

            // 🔍 ইনস্ট্যান্ট লাইভ চ্যানেল ফিল্টার সার্চ লজিক
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    const filterValue = this.value.toLowerCase().trim();
                    const channelItems = container.querySelectorAll('li');

                    channelItems.forEach(item => {
                        const channelTitle = item.querySelector('.channel-title').textContent.toLowerCase();
                        if (channelTitle.includes(filterValue)) {
                            item.style.display = ""; // মিললে দেখাবে
                        } else {
                            item.style.display = "none"; // না মিললে হাইড হবে
                        }
                    });
                });
            }

            // প্লেলিস্ট লোড সম্পন্ন হলে টিভি ফোকাস সচল হবে
            if (typeof initTVFocus === 'function') {
                initTVFocus();
            }
        })
        .catch(error => {
            console.error('Error loading playlist:', error);
            container.innerHTML = '<p style="color:red; font-size:10px; text-align:center; padding:20px;">Playlist Load Error!</p>';
        });
});
