// ১. চ্যানেল সার্চ ফিল্টার
function filterChannels() {
    let input = document.getElementById('channelSearch').value.toLowerCase();
    let items = document.querySelectorAll('#channel-container li');
    items.forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(input) ? "" : "none";
    });
}

// ২. রিমোট ও কিবোর্ড কন্ট্রোল
document.addEventListener('keydown', function(event) {
    // যদি সার্চবারে ফোকাস থাকে, তবে রিমোট লজিক কাজ করবে না (টাইপিং ঠিক রাখতে)
    if (document.activeElement.id === 'channelSearch') return;

    const items = Array.from(document.querySelectorAll('#channel-container li')).filter(el => el.style.display !== 'none');
    if (items.length === 0) return;
    
    const active = document.activeElement;
    let index = items.indexOf(active);

    if (event.keyCode === 32) event.preventDefault(); // স্পেস বাটন লক

    if (event.keyCode === 40) { // Down
        event.preventDefault();
        if (index + 1 < items.length) items[index + 1].focus();
    } else if (event.keyCode === 38) { // Up
        event.preventDefault();
        if (index - 1 >= 0) items[index - 1].focus();
    } else if (event.keyCode === 13) { // Enter
        if (active && active.tagName === 'LI') active.click();
    }
});

// ৩. অটো স্ক্রোল
window.addEventListener('focus', function(event) {
    if (event.target && event.target.tagName === 'LI') {
        event.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
}, true);
