document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    var container = document.getElementById('channel-container');
    var searchInput = document.getElementById('channelSearch');

    // ============================================================
    //  🔥 JSONBin API
    // ============================================================
    var JSONBIN_API_KEY = "$2a$10$yxEV5C5whOMmNwLqYCgz2.yjbkZGBdnX1qeT1GUIxO2l0R2V8E2Y6";
    var CHANNELS_BIN_ID = "6a4bac5cda38895dfe3533ca";
    var SETTINGS_BIN_ID = "6a4babc3f5f4af5e2966be9c";

    // ============================================================
    //  📦 JSONBin থেকে ডেটা লোড
    // ============================================================
    async function fetchFromJSONBin(binId) {
        // পদ্ধতি 1: allorigins.win
        try {
            var url = 'https://api.allorigins.win/raw?url=https://api.jsonbin.io/v3/b/' + binId + '/latest';
            var response = await fetch(url, {
                headers: { 'X-Master-Key': JSONBIN_API_KEY }
            });
            if (response.ok) {
                var data = await response.json();
                return data.record || data;
            }
        } catch (e) { console.log('allorigins failed:', e); }

        // পদ্ধতি 2: সরাসরি JSONBin
        try {
            var url2 = 'https://api.jsonbin.io/v3/b/' + binId + '/latest';
            var response2 = await fetch(url2, {
                headers: { 'X-Master-Key': JSONBIN_API_KEY }
            });
            if (response2.ok) {
                var data2 = await response2.json();
                return data2.record || data2;
            }
        } catch (e) { console.log('direct failed:', e); }

        return null;
    }

    // ============================================================
    //  📡 চ্যানেল লোড
    // ============================================================
    function loadChannel(url, name) {
        if (!url || url === '#') {
            console.warn('Invalid channel URL');
            return;
        }

        console.log('📺 Loading:', name);

        try {
            var player = window.jwPlayerInstance || jwplayer("direct-player");
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
        var channelItems = container.querySelectorAll('li[data-channel]');
        channelItems.forEach(function(item) {
            var title = item.querySelector('.channel-title');
            if (title) {
                var text = title.textContent.toLowerCase();
                item.style.display = text.includes(filterValue) ? "" : "none";
            }
        });
    }

    // ============================================================
    //  📺 চ্যানেল রেন্ডার
    // ============================================================
    function renderChannels(channels) {
        if (!container) return;

        var visibleChannels = Array.isArray(channels) ? channels.filter(function(ch) { return ch.hidden !== true; }) : [];

        if (!visibleChannels || visibleChannels.length === 0) {
            container.innerHTML = `
                <li style="background:transparent;border:none;box-shadow:none;text-align:center;padding:20px 0;cursor:default;display:block;width:100%;">
                    <div style="color:#ff6b6b;font-size:14px;">😕 কোনো চ্যানেল পাওয়া যায়নি!</div>
                    <div style="color:#666;font-size:11px;margin-top:5px;">JSONBin-এ চ্যানেল যোগ করুন</div>
                </li>
            `;
            return;
        }

        container.innerHTML = '';

        visibleChannels.forEach(function(channel) {
            var li = document.createElement('li');
            li.setAttribute('tabindex', '0');
            li.setAttribute('role', 'button');
            li.setAttribute('data-channel', 'true');

            var name = channel.name || 'Unknown Channel';
            var image = channel.image || 'https://i.postimg.cc/mD1VCt2C/RS-Live.png';
            var url = channel.url || '#';

            li.innerHTML = `
                <div style="display:block;text-decoration:none;pointer-events:none;width:100%;">
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

        setTimeout(function() {
            var firstChannel = container.querySelector('li[data-channel]');
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

            var channelsData = await fetchFromJSONBin(CHANNELS_BIN_ID);

            var channels = [];
            var settings = {};

            if (channelsData) {
                channels = channelsData.channels || channelsData || [];
                console.log('✅ Channels loaded:', channels.length);
            } else {
                console.warn('⚠️ No data from JSONBin');
            }

            var settingsData = await fetchFromJSONBin(SETTINGS_BIN_ID);
            if (settingsData) {
                settings = settingsData.settings || settingsData || {};
            }

            var noticeBar = document.getElementById('noticeBar');
            if (noticeBar && settings.notice) {
                noticeBar.innerHTML = settings.notice;
            }

            var telegramBtn = document.getElementById('telegramBtn');
            if (telegramBtn && settings.telegram) {
                telegramBtn.href = settings.telegram;
            }

            if (settings.maintenance === "ON") {
                document.body.innerHTML = `
                    <div style="text-align:center;padding:100px 20px;color:white;background:#020617;min-height:100vh;font-family:sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;">
                        <h1 style="font-size:32px;margin-bottom:15px;color:#f87171;">🛠️ সিস্টেম আপডেট চলছে...</h1>
                        <p style="font-size:16px;color:#94a3b8;max-width:500px;margin-bottom:25px;">সাময়িকভাবে আমাদের সার্ভার মেইনটেইন্যান্স করা হচ্ছে।</p>
                        ${settings.telegram ? '<a href="'+settings.telegram+'" target="_blank" style="background:#10b981;color:#020617;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:10px;">টেলিগ্রামে জয়েন করুন</a>' : ''}
                    </div>
                `;
                return;
            }

            renderChannels(channels);

        } catch (error) {
            console.error('❌ Error:', error);
            container.innerHTML = `
                <li style="background:transparent;border:none;box-shadow:none;text-align:center;padding:20px 0;cursor:default;display:block;width:100%;">
                    <div style="color:#ff6b6b;font-size:14px;">⚠️ চ্যানেল লোড করতে সমস্যা!</div>
                    <div style="color:#666;font-size:11px;margin-top:5px;">ইন্টারনেট কানেকশন চেক করুন</div>
                </li>
            `;
        }
    }

    // ===== লোডার =====
    setTimeout(function() {
        var loader = document.getElementById('intro-loader');
        if (loader && loader.style.display !== 'none') {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(function() { loader.style.display = 'none'; }, 500);
        }
    }, 3000);

    loadAllData();

    console.log('✅ RS Live TV App Started!');
});
