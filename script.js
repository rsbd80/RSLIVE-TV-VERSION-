let allChannels = []; 
let filteredChannels = []; // বর্তমানে স্ক্রিনে থাকা চ্যানেলের ট্র্যাক রাখার জন্য
let currentFocusIndex = -1; 

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('channel-container');

    // JSON ফাইল থেকে চ্যানেল লোড করা
    fetch('playlist.json')
        .then(response => response.json())
        .then(data => {
            allChannels = data;
            filteredChannels = data; // শুরুতে সব চ্যানেলই ফিল্টারড লিস্টে থাকবে
            displayChannels(allChannels); 
            setupRemoteControl(); 
        })
        .catch(error => {
            console.error('Error loading playlist:', error);
            if(container) container.innerHTML = '<p style="color:red; font-size:12px; text-align:center;">Error loading channels!</p>';
        });
});

// চ্যানেল রেন্ডার করার ফাংশন
function displayChannels(channels) {
    const container = document.getElementById('channel-container');
    container.innerHTML = ''; 
    currentFocusIndex = -1; 

    if(channels.length === 0) {
        container.innerHTML = '<p style="color:#777; font-size:12px; text-align:center; padding-top:20px; font-family:Arial;">No channels found</p>';
        return;
    }

    channels.forEach((channel, index) => {
        const li = document.createElement('li');
        
        // আপনার অরিজিনাল onclick প্লেয়ার লজিক এবং নামের কাস্টম ক্লাস এখানে সেট করা হয়েছে
        li.innerHTML = `
            <a href="javascript:void(0);" onclick="player.location.href='${channel.url}'" class="channel-item" data-index="${index}" tabindex="0">
                <img src="${channel.image}" alt="${channel.name}">
                <span class="channel-title-text">${channel.name}</span>
            </a>
        `;
        container.appendChild(li);
    });
}

// ১. ক্যাটাগরি ফিল্টার ফাংশন
function filterCategory(categoryName) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // ক্লিক করা বাটনটিকে একটিভ করা
    const event = window.event;
    if(event && event.target) {
        event.target.classList.add('active');
    }

    if (categoryName === 'All') {
        filteredChannels = allChannels;
    } else {
        filteredChannels = allChannels.filter(channel => channel.category === categoryName);
    }
    displayChannels(filteredChannels);
}

// ২. রিমোট কন্ট্রোল টিভি কিবোর্ড সাপোর্ট
function setupRemoteControl() {
    document.addEventListener('keydown', function(e) {
        const visibleChannels = document.querySelectorAll('.channel-item');
        if (visibleChannels.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocusIndex++;
            if (currentFocusIndex >= visibleChannels.length) currentFocusIndex = 0;
            updateRemoteFocus(visibleChannels);
        } 
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocusIndex--;
            if (currentFocusIndex < 0) currentFocusIndex = visibleChannels.length - 1;
            updateRemoteFocus(visibleChannels);
        } 
        else if (e.key === 'Enter') {
            if (currentFocusIndex >= 0 && currentFocusIndex < visibleChannels.length) {
                e.preventDefault();
                visibleChannels[currentFocusIndex].click(); // ফোকাস করা চ্যানেলটি প্লে হবে
            }
        }
    });
}

function updateRemoteFocus(elements) {
    elements.forEach(el => el.classList.remove('remote-focus'));
    
    if (currentFocusIndex >= 0 && elements[currentFocusIndex]) {
        const activeEl = elements[currentFocusIndex];
        activeEl.classList.add('remote-focus');
        activeEl.focus(); 
        
        // রিমোট দিয়ে স্ক্রল ঠিক রাখা
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function disableClick() {
    document.oncontextmenu = function() { return false; };
}
