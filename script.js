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
    //  📦 ব্যাকআপ চ্যানেল (JSONBin কাজ না করলে)
    // ============================================================
    var BACKUP_CHANNELS = [
        { name: "📺 Movie Bangladesh TV", url: "https://bestiptv.bestiptv-pro.workers.dev/?url=http://alvetv.com/moviebanglatv/8080/index.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false },
        { name: "📺 Somoy TV", url: "https://bestiptv.bestiptv-pro.workers.dev/?url=https://somoytv.com/live.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false },
        { name: "📺 Independent TV", url: "https://bestiptv.bestiptv-pro.workers.dev/?url=https://independent24.tv/live.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false },
        { name: "📺 Channel 24", url: "https://bestiptv.bestiptv-pro.workers.dev/?url=https://channel24.com/live.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false },
        { name: "📺 Bangla Vision", url: "https://bestiptv.bestiptv-pro.workers.dev/?url=https://banglavision.com/live.m3u8", image: "https://i.postimg.cc/mD1VCt2C/RS-Live.png", hidden: false }
    ];

    // ============================================================
    //  ⏱️ ফাস্ট JSONBin লোড (টাইমআউট সহ - ৪ সেকেন্ড)
    // ============================================================
    function fetchWithTimeout(url, options, timeout) {
        timeout = timeout || 4000; // ৪ সেকেন্ড টাইমআউট
        return Promise.race([
            fetch(url, options),
            new Promise(function(_, reject) {
                setTimeout(function() {
                    reject(new Error('⏱️ সময় শেষ!'));
                }, timeout);
            })
        ]);
    }

    async function fetchFromJSONBin(binId) {
        var methods = [
            // পদ্ধতি 1: allorigins.win (দ্রুত)
            async function() {
                var url = 'https://api.allorigins.win/raw?url=https://api.jsonbin.io/v3/b/' + binId + '/latest';
                var response = await fetchWithTimeout(url, {
                    headers: { 'X-Master-Key': JSONBIN_API_KEY }
                }, 4000);
                if (response.ok) {
                    var data = await response.json();
                    return data.record || data;
                }
                throw new Error('allorigins failed');
            },
            // পদ্ধতি 2: সরাসরি JSONBin
            async function() {
                var url = 'https://api.jsonbin.io/v3/b/' + binId + '/latest';
                var response = await fetchWithTimeout(url, {
                    headers: { 'X-Master-Key': JSONBIN_API_KEY }
                }, 4000);
                if (response.ok) {
                    var data = await response.json();
                    return data.record || data;
                }
                throw new Error('direct failed');
            }
        ];

        for (var i = 0; i < methods.length; i++) {
            try {
                var result = await methods[i]();
                if (result) {
                    console.log('✅ JSONBin loaded via method', i + 1);
                    return result;
                }
            } catch (e) {
                console.log('⚠️ Method', i + 1, 'failed:', e.message);
            }
        }

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

        // লোডার দেখান
        showLoader('📡 ' + name + ' লোড হচ্ছে...');

        try {
            var player = window.jwPlayerInstance || jwplayer("direct-player");
            if (player && typeof player.load === 'function') {
                player.load({
                    file: url,
                    type: "hls"
                });
                player.play();

                // ৩ সেকেন্ড পর লোডার হাইড
                setTimeout(function() {
                    hideLoader();
                }, 3000);
            }
        } catch (error) {
            console.error('Player error:', error);
            hideLoader();
        }

        if (searchInput) {
            searchInput.value = '';
            filterChannels('');
        }
    }

    // ============================================================
    //  💬 লোডার কন্ট্রোল
    // ============================================================
    function showLoader(message) {
        var loader = document.getElementById('intro-loader');
        if (loader) {
            var textEl = loader.querySelector('.welcome-text');
            if (textEl) {
                textEl.textContent = message || '⏳ লোড হচ্ছে...';
                textEl.style.fontSize = '16px';
                textEl.style.color = '#00f0ff';
                textEl.style.letterSpacing = '1px';
            }
            var brandText = loader.querySelector('.brand-text');
            if (brandText) {
                brandText.style.display = 'none';
            }
            loader.style.display = 'flex';
            loader.style.opacity = '1';
            loader.style.visibility = 'visible';
        }
    }

    function hideLoader() {
        var loader = document.getElementById('intro-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(function() {
                loader.style.display = 'none';
            }, 500);
        }
    }

    // ============================================================
    //  📺 সুন্দর মেসেজ দেখানো
    // ============================================================
    function showMessage(icon, title, desc, color, subDesc) {
        container.innerHTML = `
            <li style="background:transparent;border:none;box-shadow:none;text-align:center;padding:30px 15px;cursor:default;display:block;width:100%;">
                <div style="font-size:52px;margin-bottom:12px;display:block;">${icon}</div>
                <div style="color:${color || '#ff6b6b'};font-size:16px;font-weight:700;margin-bottom:6px;">${title}</div>
                <div style="color:#999;font-size:12px;max-width:220px;margin:0 auto;line-height:1.6;">${desc}</div>
                ${subDesc ? '<div style="color:#666;font-size:11px;margin-top:8px;border-top:1px solid rgba(255,255,255,0.05);padding-top:8px;">'+subDesc+'</div>' : ''}
            </li>
        `;
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
    function renderChannels(channels, fromBackup) {
        if (!container) return;

        var visibleChannels = Array.isArray(channels) ? channels.filter(function(ch) { return ch.hidden !== true; }) : [];

        if (!visibleChannels || visibleChannels.length === 0) {
            showMessage(
                '📭',
                'কোনো চ্যানেল পাওয়া যায়নি!',
                'JSONBin-এ চ্যানেল যোগ করুন অথবা কিছুক্ষণ পর আবার চেষ্টা করুন।',
                '#ff6b6b',
                '📌 চ্যানেল যোগ করতে টেলিগ্রামে মেসেজ দিন'
            );
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

        // ব্যাকআপ থেকে দেখালে নোটিশ
        if (fromBackup) {
            var notice = document.createElement('li');
            notice.style.cssText = 'background:rgba(255,170,0,0.08);border:1px solid rgba(255,170,0,0.25);border-radius:6px;text-align:center;padding:6px 10px;cursor:default;display:block;width:100%;margin-top:5px;';
            notice.innerHTML = '<span style="color:#ffaa00;font-size:9px;">⚠️ JSONBin সংযোগ নেই, ব্যাকআপ চ্যানেল দেখানো হচ্ছে</span>';
            container.prepend(notice);
        }

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
        // লোডার দেখান
        showLoader('⏳ চ্যানেল লোড হচ্ছে...');

        try {
            console.log('🔄 Loading channels from JSONBin...');

            // চ্যানেল লোড (টাইমআউট সহ)
            var channelsData = await fetchFromJSONBin(CHANNELS_BIN_ID);

            var channels = [];
            var settings = {};
            var fromBackup = false;

            if (channelsData && channelsData.channels && channelsData.channels.length > 0) {
                channels = channelsData.channels || [];
                console.log('✅ Channels loaded from JSONBin:', channels.length);
            } else if (channelsData && Array.isArray(channelsData) && channelsData.length > 0) {
                channels = channelsData;
                console.log('✅ Channels loaded from JSONBin (array):', channels.length);
            } else {
                console.warn('⚠️ JSONBin failed or empty, using backup channels');
                channels = BACKUP_CHANNELS;
                fromBackup = true;
            }

            // সেটিংস লোড
            try {
                var settingsData = await fetchFromJSONBin(SETTINGS_BIN_ID);
                if (settingsData) {
                    settings = settingsData.settings || settingsData || {};
                }
            } catch (e) {
                console.log('⚠️ Settings load failed, using defaults');
            }

            // নোটিশ আপডেট
            var noticeBar = document.getElementById('noticeBar');
            if (noticeBar) {
                if (settings.notice) {
                    noticeBar.innerHTML = settings.notice;
                } else if (fromBackup) {
                    noticeBar.innerHTML = '⚠️ JSONBin ডেটা লোড করতে সমস্যা, ব্যাকআপ চ্যানেল দেখানো হচ্ছে';
                } else {
                    noticeBar.innerHTML = '📢 সব চ্যানেল ফ্রিতে দেখুন! নতুন চ্যানেল যোগ করা হচ্ছে।';
                }
            }

            // টেলিগ্রাম লিংক
            var telegramBtn = document.getElementById('telegramBtn');
            if (telegramBtn && settings.telegram) {
                telegramBtn.href = settings.telegram;
            }

            // মেইনটেইন্যান্স চেক
            if (settings.maintenance === "ON") {
                document.body.innerHTML = `
                    <div style="text-align:center;padding:80px 20px;color:white;background:radial-gradient(circle at center,#0f0f16 0,#040406 100%);min-height:100vh;font-family:sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;">
                        <div style="font-size:64px;margin-bottom:20px;">🔧</div>
                        <h1 style="font-size:28px;margin-bottom:10px;color:#f87171;">সিস্টেম আপডেট চলছে...</h1>
                        <p style="font-size:15px;color:#94a3b8;max-width:400px;margin-bottom:20px;line-height:1.6;">সাময়িকভাবে আমাদের সার্ভার মেইনটেইন্যান্স করা হচ্ছে। খুব দ্রুতই আমরা ফিরে আসবো।</p>
                        ${settings.telegram ? '<a href="'+settings.telegram+'" target="_blank" style="background:linear-gradient(135deg,#00f0ff,#0072ff);color:#fff;text-decoration:none;font-weight:bold;padding:14px 32px;border-radius:10px;box-shadow:0 4px 20px rgba(0,240,255,0.3);">📱 টেলিগ্রামে জয়েন করুন</a>' : ''}
                        <div style="margin-top:30px;color:#555;font-size:12px;">© 2026 RS LIVE TV</div>
                    </div>
                `;
                return;
            }

            // চ্যানেল রেন্ডার
            renderChannels(channels, fromBackup);

            // লোডার হাইড
            setTimeout(function() {
                hideLoader();
            }, 500);

        } catch (error) {
            console.error('❌ Error:', error);
            
            // কানেকশন এরর চেক
            if (error.message && error.message.includes('timeout')) {
                showMessage(
                    '⏱️',
                    'সংযোগ করতে সময় বেশি লাগছে!',
                    'আপনার ইন্টারনেট স্পিড কম থাকতে পারে। অনুগ্রহ করে অপেক্ষা করুন।',
                    '#ffaa00',
                    '🔄 স্বয়ংক্রিয়ভাবে ব্যাকআপ চ্যানেল দেখানো হচ্ছে...'
                );
            } else {
                showMessage(
                    '🌐',
                    'ইন্টারনেট সংযোগ নেই!',
                    'দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন এবং আবার চেষ্টা করুন।',
                    '#ff6b6b',
                    '📱 টেলিগ্রামে যোগ দিন: t.me/rslivetv'
                );
            }

            // ব্যাকআপ চ্যানেল দেখান
            setTimeout(function() {
                renderChannels(BACKUP_CHANNELS, true);
            }, 1500);

            // লোডার হাইড
            setTimeout(function() {
                hideLoader();
            }, 2000);
        }
    }

    // ============================================================
    //  🚀 অ্যাপ স্টার্ট
    // ============================================================

    // JW Player রেডি হলে লোডার হাইড
    function checkPlayerReady() {
        try {
            var player = window.jwPlayerInstance || jwplayer("direct-player");
            if (player && player.getState) {
                var state = player.getState();
                if (state === 'playing' || state === 'buffering' || state === 'idle') {
                    hideLoader();
                }
            }
        } catch (e) {}
    }

    var checkInterval = setInterval(checkPlayerReady, 500);

    setTimeout(function() {
        clearInterval(checkInterval);
        hideLoader();
    }, 5000);

    // ডেটা লোড
    loadAllData();

    console.log('✅ RS Live TV App Started!');
});
