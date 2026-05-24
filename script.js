let channelList = [];
let currentChannelIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('channel-container');

    // JSON ফাইল থেকে চ্যানেল লোড করা
    fetch('playlist.json')
        .then(response => response.json())
        .then(data => {
            channelList = data; // গ্লোবাল ভ্যারিয়েবলে ডাটা সেভ রাখা হলো
            
            data.forEach((channel, index) => {
                const li = document.createElement('li');
                li.className = 'channel-item'; // সিএসএস ক্লাস যুক্ত করা হলো
                li.innerHTML = `
                    <a href="javascript:void(0);" onclick="playChannel(${index})">
                        <img src="${channel.image}" alt="${channel.name}">
                        <span class="channel-name">${channel.name}</span>
                    </a>
                `;
                container.appendChild(li);
            });
            
            // প্রথম চ্যানেলটি ডিফল্ট হিসেবে সেট করতে চাইলে (ঐচ্ছিক):
            // if(channelList.length > 0) currentChannelIndex = 0;

        })
        .catch(error => {
            console.error('Error loading playlist:', error);
            container.innerHTML = '<p style="color:red; font-size:12px; text-align:center;">Error loading channels!</p>';
        });

    // Previous বাটনের কাজ
    document.getElementById('prev-btn').addEventListener('click', function() {
        if (channelList.length > 0) {
            currentChannelIndex = (currentChannelIndex - 1 + channelList.length) % channelList.length;
            playChannel(currentChannelIndex);
        }
    });

    // Next বাটনের কাজ
    document.getElementById('next-btn').addEventListener('click', function() {
        if (channelList.length > 0) {
            currentChannelIndex = (currentChannelIndex + 1) % channelList.length;
            playChannel(currentChannelIndex);
        }
    });
});

// চ্যানেল প্লে করার ও আইফ্রেম আপডেট করার ফাংশন
function playChannel(index) {
    currentChannelIndex = index;
    const channel = channelList[index];
    const iframePlayer = document.getElementById('player');
    
    if (iframePlayer && channel) {
        // channel.html এর ভেতর jwplayer আছে, তাই সেটির ইউআরএল কুয়েরি প্যারামিটার হিসেবে পাঠানো হচ্ছে
        iframePlayer.src = "channel.html?url=" + encodeURIComponent(channel.url);
        
        // অথবা আপনার আগের কোড অনুযায়ী সরাসরি ইউআরএল লোড করতে চাইলে:
        // iframePlayer.src = channel.url;
    }
}

// রাইট ক্লিক বন্ধ করার ফাংশন
function disableClick() {
    document.oncontextmenu = function() { return false; };
}
