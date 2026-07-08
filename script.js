document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const container = document.getElementById('channel-container');
    const searchInput = document.getElementById('channelSearch');

    // ============================================================
    //  🔥 JSONBin API কনফিগারেশন
    // ============================================================
    const JSONBIN_API_KEY = "$2a$10$yxEV5C5whOMmNwLqYCgz2.yjbkZGBdnX1qeT1GUIxO2l0R2V8E2Y6";
    const CHANNELS_BIN_ID = "6a4bac5cda38895dfe3533ca";
    const SETTINGS_BIN_ID = "6a4babc3f5f4af5e2966be9c";

    // ============================================================
    //  📦 JSONBin.io থেকে ডেটা লোড
    // ============================================================
    async function fetchFromJSONBin(binId) {
        // পদ্ধতি 1: allorigins.win (সবচেয়ে ভালো)
        try {
            const url = `https://api.allorigins.win/raw?url=https://api.jsonbin.io/v3/b/${binId}/latest`;
            const response = await fetch(url, {
                headers: { 'X-Master-Key': JSONBIN_API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                return data.record || data;
            }
        } catch(e) { console.log('allorigins failed:', e); }

        // পদ্ধতি 2: সরাসরি JSONBin
        try {
            const url = `https://api.jsonbin.io/v3/b/${binId}/latest`;
            const response = await fetch(url, {
                headers: { 'X-Master-Key': JSONBIN_API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                return data.record || data;
            }
        } catch(e) { console.log('direct failed:', e); }

        return null;
    }

    // ============================================================
    //  📡 চ্যানেল লোড ফাংশন
    // ============================================================
    function loadChannel(url, name) {
        if (!url || url === '#') {
            console.warn('Invalid channel URL');
            return;
        }

        console.log('📺 Loading:', name);

        try {
            const player = window.jwPlayerInstance || jwplayer("direct-player");
            if (player && typeof player.load === 'function') {
                player.load({
                    file: url,
                    type: "hls"
                });
                player.play();
            }
        } catch (error) {
            console.error('Player error:', error);
        }

        // সার্চ ক্লিয়ার
        if (searchInput) {
            searchInput.value = '';
            filterChannels('');
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
            filterChannels(this.value.toLowerCase().trim());
        });
    }

    function filterChannels(filterValue) {
        const channelItems = container.querySelectorAll('li[data-channel]');
        channelItems.forEach(item => {
            const title = item.querySelector('.channel-title');
            if (title) {
                const text = title.textContent.toLowerCase();
                item.style.display = text.includes(filterValue) ? "" : "none";
            }
        });
    }

    // ============================================================
    //  📺 চ্যানেল রেন্ডার
    // ============================================================
    function renderChannels(channels) {
        if (!container) return;

        // শুধু ভিজিবল চ্যানেল
        const visibleChannels = Array.isArray(channels) ? channels.filter(ch => ch.hidden !== true) : [];

        if (!visibleChannels || visibleChannels.length === 0) {
            container.innerHTML = `
                <li style="background:transparent;border:none;box-shadow:none;text-align:center;padding:20px 0;cursor:default;">
                    <div style="color:#ff6b6b;font-size:14px;">😕 কোনো চ্যানেল পাওয়া যায়নি!</div>
                    <div style="color:#666;font-size:11px;margin-top:5px;">JSONBin-এ চ্যানেল যোগ করুন</div>
                </li>
            `;
            return;
        }

        container.innerHTML = '';

        visibleChannels.forEach((channel) => {
            const li = document.createElement('li');
            li.setAttribute('tabindex', '0');
            li.setAttribute('role', 'button');
            li.setAttribute('data-channel', 'true');
            
            const name = channel.name || 'Unknown Channel';
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

            li.addEventListener('click', function(e) {
                e.preventDefault();
                loadChannel(url, name);
            });

            li.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    loadChannel(url, name);
                }
            });
            
            container.appendChild(li);
        });

        setupSearchFilter();

        // প্রথম চ্যানেল ফোকাস
        setTimeout(() => {
            const firstChannel = container.querySelector('li[data-channel]');
            if (firstChannel && document.activeElement !== searchInput) {
                firstChannel.focus();
            }
        }, 300);
    }

    // ============================================================
    //  🚀 মেইন ফাংশন
    // ============================================================
    async function loadAllData() {
        try {
            console.log('🔄 Loading channels from JSONBin...');

            // চ্যানেল লোড
            const channelsData = await fetchFromJSONBin(CHANNELS_BIN_ID);
            
            let channels = [];
            let settings = {};

            if (channelsData) {
                channels = channelsData.channels || channelsData || [];
                console.log('✅ Channels loaded:', channels.length);
            } else {
                console.warn('⚠️ No data from JSONBin');
            }

            // সেটিংস লোড
            const settingsData = await fetchFromJSONBin(SETTINGS_BIN_ID);
            if (settingsData) {
                settings = settingsData.settings || settingsData || {};
            }

            // নোটিশ আপডেট
            const noticeBar = document.getElementById('noticeBar');
            if (noticeBar && settings.notice) {
                noticeBar.innerHTML = settings.notice;
            }

            // টেলিগ্রাম লিংক
            const telegramBtn = document.getElementById('telegramBtn');
            if (telegramBtn && settings.telegram) {
                telegramBtn.href = settings.telegram;
            }

            // মেইনটেইন্যান্স চেক
            if (settings.maintenance === "ON") {
                document.body.innerHTML = `
                    <div style="text-align:center; padding:100px 20px; color:white; background:#020617; min-height:100vh; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                        <h1 style="font-size:32px; margin-bottom:15px; color:#f87171;">🛠️ সিস্টেম আপডেট চলছে...</h1>
                        <p style="font-size:16px; color:#94a3b8; max-width:500px; margin-bottom:25px;">সাময়িকভাবে আমাদের সার্ভার মেইনটেইন্যান্স করা হচ্ছে। খুব দ্রুতই আমরা লাইভে ফিরবো।</p>
                        ${settings.telegram ? `<a href="${settings.telegram}" target="_blank" style="background:#10b981; color:#020617; text-decoration:none; font-weight:bold; padding:12px 24px; border-radius:10px;">টেলিগ্রামে জয়েন করুন</a>` : ''}
                    </div>
                `;
                return;
            }

            // চ্যানেল রেন্ডার
            renderChannels(channels);

        } catch (error) {
            console.error('❌ Error:', error);
            container.innerHTML = `
                <li style="background:transparent;border:none;box-shadow:none;text-align:center;padding:20px 0;cursor:default;">
                    <div style="color:#ff6b6b;font-size:14px;">⚠️ চ্যানেল লোড করতে সমস্যা!</div>
                    <div style="color:#666;font-size:11px;margin-top:5px;">ইন্টারনেট কানেকশন চেক করুন</div>
                </li>
            `;
        }
    }

    // ============================================================
    //  🚀 অ্যাপ স্টার্ট
    // ============================================================
    // লোডার হাইড (JW Player ready হলে হাইড হবে)
    setTimeout(() => {
        const loader = document.getElementById('intro-loader');
        if (loader && loader.style.display !== 'none') {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(() => { loader.style.display = 'none'; }, 500);
        }
    }, 3000);

    // ডেটা লোড
    loadAllData();

    console.log('✅ RS Live TV App Started!');
});
