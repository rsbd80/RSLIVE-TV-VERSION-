document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('channel-container');

    if (!container) return;

    // JSON ফাইল থেকে চ্যানেল ডেটা ফেচ করা
    fetch('playlist.json')
        .then(response => {
            if (!response.ok) throw new Error("Playlist response not ok");
            return response.json();
        })
        .then(data => {
            container.innerHTML = ""; // আগের ডেটা থাকলে ক্লিয়ার করা
            
            data.forEach(channel => {
                const li = document.createElement('li');
                li.style.listStyle = "none";
                li.style.marginBottom = "10px";
                
                // এখানে channel.html ফাইলে প্যারামিটার হিসেবে সরাসরি url পাঠানো হচ্ছে
                li.innerHTML = `
                    <a href="channel.html?url=${encodeURIComponent(channel.url)}" target="player_iframe">
                        <img src="${channel.image}" alt="${channel.name}" style="width:100%; border-radius:5px; transition: transform 0.2s;">
                    </a>
                `;
                container.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error loading playlist:', error);
            container.innerHTML = '<p style="color:#ff3366; font-size:12px; text-align:center; padding:10px;">Failed to load playlist!</p>';
        });
});
