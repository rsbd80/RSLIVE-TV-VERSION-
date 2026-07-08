document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('channel-container');
    const searchInput = document.getElementById('channelSearch');

    // ============================================================
    //  🔥 JSONBin.io ডেটা - CORS সমাধান সহ
    // ============================================================
    const JSONBIN_API_KEY = "$2a$10$yxEV5C5whOMmNwLqYCgz2.yjbkZGBdnX1qeT1GUIxO2l0R2V8E2Y6";
    const CHANNELS_BIN_ID = "6a4bac5cda38895dfe3533ca";
    const SETTINGS_BIN_ID = "6a4babc3f5f4af5e2966be9c";

    // ============================================================
    //  📦 JSONBin.io থেকে ডেটা লোড (CORS ফিক্স)
    // ============================================================
    async function fetchFromJSONBin(binId) {
        try {
            // JSONBin.io এর CORS ইস্যু সমাধানের জন্য proxy ব্যবহার
            const url = `https://api.allorigins.win/raw?url=https://api.jsonbin.io/v3/b/${binId}/latest`;
            
            const response = await fetch(url, {
                headers: {
                    'X-Master-Key': JSONBIN_API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.record || data;
        } catch (error) {
            console.error('Fetch error:', error);
            // ব্যাকআপ ডেটা
            return getBackupData();
        }
    }

    // ============================================================
    //  📦 ব্যাকআপ ডেটা (যখন JSONBin কাজ করবে না)
    // ============================================================
    function getBackupData() {
        return {
            channels: [
                { name: "Movie Bangladesh TV", url: "https://bestiptv.bestiptv-pro.workers.dev/?url=http://alvetv.com/moviebanglatv/8080/index.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false },
                { name: "Star Jalsha", url: "https://example.com/stream.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false },
                { name: "Zee Bangla", url: "https://example.com/stream.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false },
                { name: "Colors Bangla", url: "https://example.com/stream.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false },
                { name: "Sony Aath", url: "https://example.com/stream.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false },
                { name: "DD Bangla", url: "https://example.com/stream.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false },
                { name: "Ruposhi Bangla", url: "https://example.com/stream.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false },
                { name: "ATN Bangla", url: "https://example.com/stream.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false },
                { name: "Channel i", url: "https://example.com/stream.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false },
                { name: "NTV", url: "https://example.com/stream.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false }
            ],
            settings: {
                notice: "📢 সব চ্যানেল ফ্রিতে দেখুন! নতুন চ্যানেল যোগ করা হচ্ছে।",
                telegram: "https://t.me/rslivetv",
                maintenance: "OFF"
            }
        };
    }

    // ============================================================
    //  🚀 মেইন ফাংশন
    // ============================================================
    async function loadAllData() {
        try {
            let channels = [];
            let settings = {};

            try {
                // প্রথমে JSONBin থেকে লোড করার চেষ্টা
                const channelsData = await fetchFromJSONBin(CHANNELS_BIN_ID);
                const settingsData = await fetchFromJSONBin(SETTINGS_BIN_ID);
                
                channels = channelsData.channels || channelsData || [];
                settings = settingsData.settings || settingsData || {};
            } catch (error) {
                console.warn('JSONBin failed, using backup data:', error);
                const backup = getBackupData();
                channels = backup.channels;
                settings = backup.settings;
            }

            // মেইনটেইন্যান্স চেক
            if (settings.maintenance === "ON") {
                document.body.innerHTML = `
                    <div style="text-align:center; padding:100px 20px; color:white; background:#020617; min-height:100vh; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                        <h1 style="font-size:32px; margin-bottom:15px; color:#f87171;">🛠️ সিস্টেম আপডেট চলছে...</h1>
                        <p style="font-size:16px; color:#94a3b8; max-width:500px; margin-bottom:25px;">সাময়িকভাবে আমাদের সার্ভার মেইনটেইন্যান্স করা হচ্ছে। খুব দ্রুতই আমরা লাইভে ফিরবো।</p>
                        ${settings.telegram ? `<a href="${settings.telegram}" target="_blank" style="background:#10b981; color:#020617; text-decoration:none; font-weight:bold; padding:12px 24px; border-radius:10px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">আমাদের টেলিগ্রাম গ্রুপে জয়েন করুন</a>` : ''}
                    </div>
                `;
                return;
            }

            // নোটিশ বার আপডেট
            const noticeBar = document.getElementById('noticeBar');
            if (noticeBar && settings.notice) {
                noticeBar.innerHTML = settings.notice;
            }

            // টেলিগ্রাম লিংক আপডেট
            const telegramBtn = document.getElementById('telegramBtn');
            if (telegramBtn && settings.telegram) {
                telegramBtn.href = settings.telegram;
            }

            // চ্যানেল রেন্ডার
            renderChannels(channels);

        } catch (error) {
            console.error('Error loading data:', error);
            // ব্যাকআপ চ্যানেল দেখান
            const backup = getBackupData();
            renderChannels(backup.channels);
            
            if (container) {
                const notice = document.createElement('p');
                notice.style.cssText = 'color:#ffaa00; text-align:center; font-size:11px; padding:5px; margin:0; background:rgba(255,170,0,0.1); border-radius:5px;';
                notice.textContent = '⚠️ অনলাইন ডেটা লোড করতে সমস্যা, ব্যাকআপ চ্যানেল দেখানো হচ্ছে';
                container.prepend(notice);
            }
        }
    }

    // ============================================================
    //  📺 চ্যানেল রেন্ডার
    // ============================================================
    function renderChannels(channels) {
        if (!container) return;

        // শুধু ভিজিবল চ্যানেল দেখাবে
        const visibleChannels = Array.isArray(channels) ? channels.filter(ch => ch.hidden !== true) : [];

        if (!visibleChannels || visibleChannels.length === 0) {
            container.innerHTML = `
                <p style="color:#aaa; text-align:center; padding:20px;">
                    😕 কোনো চ্যানেল পাওয়া যায়নি!<br>
                    <span style="font-size:12px; color:#666;">দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন</span>
                </p>
            `;
            return;
        }

        container.innerHTML = '';

        visibleChannels.forEach((channel, index) => {
            const li = document.createElement('li');
            li.setAttribute('tabindex', '0');
            li.setAttribute('role', 'button');
            li.setAttribute('aria-label', `Watch ${channel.name || 'Channel'}`);
            
            const name = channel.name || `চ্যানেল ${index + 1}`;
            const image = channel.image || 'https://i.postimg.cc/mD1VCt2C/RS-Live.png';
            const url = channel.url || '#';

            li.innerHTML = `
                <div style="display: block; text-decoration: none; pointer-events: none; width: 100%;">
                    <img src="${image}" alt="${name}" loading="lazy" onerror="this.src='https://i.postimg.cc/mD1VCt2C/RS-Live.png';">
                    <div class="channel-info-box">
                        <p class="channel-title">${name}</p>
                    </div>
                </div>
            `;

            // চ্যানেলে ক্লিক করলে সরাসরি JW Player-এ লোড
            li.addEventListener('click', function(e) {
                e.preventDefault();
                loadChannel(url, name);
            });

            // এন্টার কী সাপোর্ট
            li.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    loadChannel(url, name);
                }
            });
            
            container.appendChild(li);
        });

        setupSearchFilter();
    }

    // ============================================================
    //  📡 চ্যানেল লোড ফাংশন
    // ============================================================
    function loadChannel(url, name) {
        if (!url || url === '#') {
            console.warn('Invalid channel URL');
            return;
        }

        console.log(`Loading channel: ${name} - ${url}`);

        // JW Player-এ লোড
        try {
            var player = jwplayer("direct-player");
            if (player && typeof player.load === 'function') {
                player.load({
                    file: url,
                    type: "hls"
                });
                player.play();
                
                // লোডার দেখান
                const loader = document.getElementById('intro-loader');
                if (loader) {
                    loader.style.display = 'flex';
                    loader.style.opacity = '1';
                    loader.style.visibility = 'visible';
                    setTimeout(() => {
                        loader.style.opacity = '0';
                        loader.style.visibility = 'hidden';
                        setTimeout(() => { loader.style.display = 'none'; }, 500);
                    }, 3000);
                }
            } else {
                // ব্যাকআপ: iFrame ব্যবহার
                const iframe = document.querySelector('#tv-player-iframe');
                if (iframe) {
                    iframe.src = url;
                }
            }
        } catch (error) {
            console.error('Player error:', error);
            alert('চ্যানেল লোড করতে সমস্যা হচ্ছে!');
        }

        // সার্চ ক্লিয়ার
        if (searchInput) {
            searchInput.value = '';
            const channelItems = container.querySelectorAll('li');
            channelItems.forEach(item => item.style.display = "");
        }
    }

    // ============================================================
    //  🔍 সার্চ ফিল্টার
    // ============================================================
    function setupSearchFilter() {
        if (!searchInput) return;
        
        if (searchInput._listenerAdded) return;
        searchInput._listenerAdded = true;

        searchInput.addEventListener('input', function() {
            const filterValue = this.value.toLowerCase().trim();
            const channelItems = container.querySelectorAll('li');

            channelItems.forEach(item => {
                const channelTitle = item.querySelector('.channel-title');
                if (channelTitle) {
                    const text = channelTitle.textContent.toLowerCase();
                    item.style.display = text.includes(filterValue) ? "" : "none";
                }
            });
        });
    }

    // ============================================================
    //  🚀 অ্যাপ স্টার্ট
    // ============================================================
    // লোডার হাইড
    setTimeout(() => {
        const loader = document.getElementById('intro-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(() => { 
                loader.style.display = 'none'; 
            }, 500);
        }
    }, 1500);

    // ডেটা লোড
    loadAllData();

    // ============================================================
    //  📺 টিভি ফোকাস
    // ============================================================
    function initTVFocus() {
        setTimeout(() => {
            const firstChannel = document.querySelector('#channel-container li');
            const searchInput = document.getElementById('channelSearch');
            if (firstChannel && document.activeElement !== searchInput) {
                firstChannel.focus();
            }
        }, 800);
    }

    initTVFocus();

    // কীবোর্ড নেভিগেশন
    document.addEventListener('keydown', function(event) {
        const items = Array.from(document.querySelectorAll('#channel-container li'))
            .filter(el => el.style.display !== 'none');
        const active = document.activeElement;
        const searchInput = document.getElementById('channelSearch');

        if (active === searchInput) {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (items.length > 0) {
                    items[0].click();
                }
                searchInput.blur();
                return;
            }
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (items.length > 0) items[0].focus();
            }
            return;
        }

        if (items.length === 0) return;
        let index = items.indexOf(active);

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            let nextIndex = index + 1;
            if (nextIndex < items.length) items[nextIndex].focus();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            let prevIndex = index - 1;
            if (prevIndex >= 0) {
                items[prevIndex].focus();
            } else if (prevIndex === -1 && searchInput) {
                searchInput.focus();
            }
        } else if (event.key === 'Enter' || event.key === ' ') {
            if (active && active.tagName === 'LI') {
                event.preventDefault();
                active.click();
            }
        }
    });

    // রিসাইজে প্লেয়ার ঠিক রাখা
    window.addEventListener('resize', function() {
        try {
            var player = jwplayer("direct-player");
            if (player && typeof player.resize === 'function') {
                player.resize(window.innerWidth, window.innerHeight);
            }
        } catch(e) {}
    });

    console.log('✅ RS Live TV App Started!');
});
