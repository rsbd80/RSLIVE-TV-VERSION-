document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('channel-container');
    const searchInput = document.getElementById('channelSearch');

    // একই সাথে প্লেলিস্ট এবং সেটিংস লোড করার ট্রিক
    Promise.all([
        fetch('playlist.json?t=' + Date.now()).then(res => res.json()).catch(() => []),
        fetch('app_settings.json?t=' + Date.now()).then(res => res.json()).catch(() => ({})),
        fetch('notice.json?t=' + Date.now()).then(res => res.json()).catch(() => ({})) // আপনার পুরনো নোটিশ ফাইল ব্যাকআপ হিসেবে
    ])
    .then(([playlistData, settingsData, oldNoticeData]) => {
        container.innerHTML = ''; 

        // 🛠️ ১. মেইনটেইন্যান্স মোড চেক (যদি অ্যাডমিন প্যানেল থেকে ON করা হয়)
        const isMaintenance = settingsData.maintenance === "ON";
        
        if (isMaintenance) {
            document.body.innerHTML = `
                <div style="text-align:center; padding:100px 20px; color:white; background:#020617; min-height:100vh; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <h1 style="font-size:32px; margin-bottom:15px; color:#f87171;">🛠️ সিস্টেম আপডেট চলছে...</h1>
                    <p style="font-size:16px; color:#94a3b8; max-width:500px; margin-bottom:25px;">সাময়িকভাবে আমাদের সার্ভার মেইনটেইন্যান্স করা হচ্ছে। খুব দ্রুতই আমরা লাইভে ফিরবো।</p>
                    ${settingsData.telegram ? `<a href="${settingsData.telegram}" target="_blank" style="background:#10b981; color:#020617; text-decoration:none; font-weight:bold; padding:12px 24px; border-radius:10px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">আমাদের টেলিগ্রাম গ্রুপে জয়েন করুন</a>` : ''}
                </div>
            `;
            return; // মেইনটেইন্যান্স অন থাকলে কোড এখানেই স্টপ হয়ে যাবে
        }

        // 📢 ২. লাইভ স্ক্রোল নোটিশ বার আপডেট
        const liveNotice = document.getElementById('noticeBar') || document.getElementById('notice'); 
        // নতুন সেটিংস ফাইলে নোটিশ না থাকলে পুরনো notice.json ফাইল থেকে নোটিশ দেখাবে
        const currentNotice = settingsData.notice || oldNoticeData.notice || "";
        
        if (liveNotice && currentNotice) {
            liveNotice.innerText = currentNotice;
        }

        // 📢 ৩. টেলিগ্রাম বাটনের লিংক আপডেট (যদি আপনার সাইটে টেলিগ্রাম বাটন থাকে)
        const telegramBtn = document.getElementById('telegramBtn') || document.getElementById('telegramLink');
        if (telegramBtn && settingsData.telegram) {
            telegramBtn.href = settingsData.telegram;
        }

        // 📺 ৪. চ্যানেল লিস্ট প্রসেসিং
        // যদি ডাটা ভুলে অবজেক্ট আকারেও আসে, তবে সেটিকে চ্যানেলের অ্যারেতে কনভার্ট করবে
        const channelList = Array.isArray(playlistData) ? playlistData : (playlistData.channels || []);

        if (channelList.length === 0) {
            container.innerHTML = '<p style="color:#aaa; text-align:center; padding:20px;">কোনো চ্যানেল পাওয়া যায়নি!</p>';
            return;
        }

        // চ্যানেলগুলো স্ক্রিনে রেন্ডার করা
        channelList.forEach((channel, index) => {
            const li = document.createElement('li');
            li.setAttribute('tabindex', '0');
            
            li.innerHTML = `
                <div style="display: block; text-decoration: none; pointer-events: none; width: 100%;">
                    <img src="${channel.image}" alt="${channel.name}" loading="lazy" onerror="this.src='https://i.postimg.cc/mD1VCt2C/RS-Live.png';">
                    <div class="channel-info-box">
                        <p class="channel-title">${channel.name}</p>
                    </div>
                </div>
            `;

            // চ্যানেলে ক্লিক করলে প্লে হওয়ার লজিক
            li.addEventListener('click', function() {
                if (window.frames['player']) {
                    window.frames['player'].location.href = channel.url;
                } else if (window.player) {
                    player.location.href = channel.url;
                }

                // চ্যানেল প্লে হলে সার্চবক্স ক্লিয়ার হবে
                if (searchInput) {
                    searchInput.value = '';
                    const channelItems = container.querySelectorAll('li');
                    channelItems.forEach(item => item.style.display = "");
                }
            });
            
            container.appendChild(li);
        });

        // 🔍 ৫. লাইভ সার্চ ফিল্টার লজিক
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const filterValue = this.value.toLowerCase().trim();
                const channelItems = container.querySelectorAll('li');

                channelItems.forEach(item => {
                    const channelTitle = item.querySelector('.channel-title').textContent.toLowerCase();
                    if (channelTitle.includes(filterValue)) {
                        item.style.display = ""; 
                    } else {
                        item.style.display = "none"; 
                    }
                });
            });
        }

        // প্রজেক্টের অ্যান্ড্রয়েড টিভি রিমোট কন্ট্রোল ফোকাস সচল করা
        if (typeof initTVFocus === 'function') {
            initTVFocus();
        }
    })
    .catch(error => {
        console.error('Error loading assets:', error);
        if (container) {
            container.innerHTML = '<p style="color:red; text-align:center; padding:20px;">সিস্টেম লোড হতে সমস্যা হয়েছে!</p>';
        }
    });
});
