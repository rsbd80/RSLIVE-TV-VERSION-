// 📋 চ্যানেল ডাটাবেস (আপনার প্রয়োজন অনুযায়ী চ্যানেল অ্যাড বা এডিট করতে পারবেন)
const channels = [
    { name: "Sony Sports 1", category: "Sports", id: "sony_sports_1", src: "https://example.com/stream1" },
    { name: "Star Sports HD", category: "Sports", id: "star_sports", src: "https://example.com/stream2" },
    { name: "Somoy TV", category: "News", id: "somoy_tv", src: "https://example.com/stream3" },
    { name: "Jamuna TV", category: "News", id: "jamuna_tv", src: "https://example.com/stream4" },
    { name: "Zee Bangla", category: "Entertainment", id: "zee_bangla", src: "https://example.com/stream5" },
    { name: "Star Jalsha", category: "Entertainment", id: "star_jalsha", src: "https://example.com/stream6" },
    { name: "HBO HD", category: "Movies", id: "hbo", src: "https://example.com/stream7" },
    { name: "Sony Pix", category: "Movies", id: "sony_pix", src: "https://example.com/stream8" }
];

// 🚀 পেজ লোড হওয়ার সাথে সাথে চ্যানেল লিস্ট জেনারেট করা
document.addEventListener("DOMContentLoaded", () => {
    generateChannelList(channels);
});

// 📺 চ্যানেল লিস্ট ডাইনামিকালি তৈরি করার ফাংশন (যা ঝাঁকি বা লাফালাফি প্রতিরোধ করে)
function generateChannelList(channelArray) {
    const container = document.getElementById("channel-container");
    if (!container) return;

    container.innerHTML = ""; // আগের লিস্ট ক্লিয়ার করা

    channelArray.forEach((channel) => {
        const li = document.createElement("li");
        li.setAttribute("data-category", channel.category);
        li.setAttribute("tabindex", "0"); // রিমোট বা কিবোর্ড নেভিগেশনের জন্য
        
        // লিস্টের ভেতরের ডিজাইন (আপনার স্টাইল অনুযায়ী পরিবর্তন করতে পারেন)
        li.innerHTML = `
            <div class="channel-card-item" onclick="playChannel('${channel.src}')">
                <span class="channel-name-text">${channel.name}</span>
                <span class="badge-category">${channel.category}</span>
            </div>
        `;
        
        container.appendChild(li);
    });
}

// 🎬 ভিডিও প্লেয়ারে চ্যানেল প্লে করার আল্ট্রা-স্মুথ ফাংশন
function playChannel(streamUrl) {
    const iframe = document.getElementById("tv-player-iframe");
    if (!iframe) return;

    // 🔒 প্লেয়ারে ক্লিক করার সময় পেজ যাতে স্ক্রোল ডাউন বা লাফালাফি না করে তার লক মেকানিজম
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // আপনার মেইন স্ট্রিম লিঙ্কের সাথে প্লেয়ার আইফ্রেম কানেক্ট করা
    // (এখানে channel.html এর সাথে সোর্স পাস করা হচ্ছে, আপনার সিস্টেমে সরাসরি লিঙ্ক হলে src = streamUrl দিতে পারেন)
    iframe.src = `channel.html?id=${encodeURIComponent(streamUrl)}`;

    // ক্লিক করার পর স্ক্রোল পজিশন আগের জায়গায় লক করে রাখা (জিরো ঝাঁকি)
    setTimeout(() => {
        window.scrollTo(scrollX, scrollY);
    }, 0);
}
