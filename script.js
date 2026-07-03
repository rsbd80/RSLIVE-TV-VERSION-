const channels = [
    { name: "Channel 1", category: "Sports", url: "url1" },
    { name: "Channel 2", category: "News", url: "url2" }
];

function renderChannels(data) {
    const grid = document.getElementById('channelGrid');
    grid.innerHTML = "";
    data.forEach(ch => {
        grid.innerHTML += `<div class="channel-card">${ch.name}</div>`;
    });
}

// সার্চ ফাংশন
function filterChannels() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const filtered = channels.filter(c => c.name.toLowerCase().includes(query));
    renderChannels(filtered);
}

// ক্যাটাগরি ফিল্টার
function filterByCategory(cat) {
    const filtered = cat === 'All' ? channels : channels.filter(c => c.category === cat);
    renderChannels(filtered);
}

// শুরুতে সব চ্যানেল লোড করা
renderChannels(channels);
