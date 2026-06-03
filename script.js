// 🚀 পেজ লোড হওয়ার সাথে সাথে JSON ফাইল থেকে চ্যানেল লোড করা
document.addEventListener("DOMContentLoaded", () => {
    loadPlaylistData();
});

// 📂 playlist.json ফাইল থেকে ডাটা ফেচ (Fetch) করার ফাংশন
function loadPlaylistData() {
    fetch('playlist.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("JSON ফাইল লোড করতে সমস্যা হচ্ছে!");
            }
            return response.json();
        })
        .then(data => {
            // সফলভাবে ডাটা পেলে চ্যানেল লিস্ট জেনারেট করা
            generateChannelList(data);
        })
        .catch(error => {
            console.error("Error loading playlist:", error);
            // যদি কোনো কারণে ফাইল না পায়, ব্যাকআপ হিসেবে একটি মেসেজ দেখাবে
            const container = document.getElementById("channel-container");
            if(container) {
                container.innerHTML = `<li style="color: #ff0055; padding: 10px; font-size: 12px; text-align: center;">প্লেলিস্ট লোড করা যায়নি!</li>`;
            }
        });
}

// 📺 চ্যানেল লিস্ট ডাইনামিকালি তৈরি করার ফাংশন (এক লাইনে নাম লক করার CSS সহ)
function generateChannelList(channelArray) {
    const container = document.getElementById("channel-container");
    if (!container) return;

    container.innerHTML = ""; // আগের ডিফল্ট বা ডামি লিস্ট ক্লিয়ার করা

    channelArray.forEach((channel) => {
        const li = document.createElement("li");
        
        // index.html এর ফিল্টারিং সিস্টেমের সাথে মিল রেখে এট্রিবিউট সেট করা
        li.setAttribute("data-category", channel.category || "All");
        li.setAttribute("tabindex", "0"); // রিমোট/কিবোর্ড নেভিগেশনের জন্য
        
        /* 
           💡 CSS ইনলাইন স্টাইল দিয়ে নামগুলোকে ১ লাইনে ফিক্সড করা হয়েছে। 
           নাম বেশি বড় হলে যেন ভেঙে নিচে না যায়, বরং শেষে সুন্দর করে '...' দেখায়।
        */
        li.innerHTML = `
            <div class="channel-card-item" onclick="playChannel('${channel.url}')" style="display: flex; flex-direction: column; gap: 4px; padding: 8px; background: #111116; border-radius: 6px; margin-bottom: 6px; cursor: pointer; border: 1px solid rgba(255,255,255,0.02);">
                <span class="channel-name-text" style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; font-size: 12px; font-weight: 600; width: 100%;">
                    ${channel.name}
                </span>
                <span class="badge-category" style="font-size: 9px; color: #00f0ff; opacity: 0.7; font-weight: bold; text-transform: uppercase;">
                    ${channel.category || "All"}
                </span>
            </div>
        `;
        
        container.appendChild(li);
    });
}

// 🎬 ভিডিও প্লেয়ারে চ্যানেল প্লে করার আল্ট্রা-স্মুথ ফাংশন (জিরো ঝাঁকি প্রোটেকশন)
function playChannel(streamUrl) {
    const iframe = document.getElementById("tv-player-iframe");
    if (!iframe) return;

    // 🔒 স্ক্রোল পজিশন লক রাখা হলো যেন এক পিক্সেলও পেজ না লাফায় বা ঝাঁকি না দেয়
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // আইফ্রেমে সোর্স বা ইউআরএল পাস করা
    iframe.src = streamUrl;

    // ক্লিক করার পর স্ক্রোল পজিশন আগের জায়গায় লক করে রাখা
    setTimeout(() => {
        window.scrollTo(scrollX, scrollY);
    }, 0);
}
