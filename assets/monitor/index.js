setInterval(() => {
    getActiveMembers();
}, 1000);

function getActiveMembers() {
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: "getMembers" }),
    };
    fetch('/api', options)
        .then(res => res.json())
        .then(data => {
            let members = data.members;
            let list = document.getElementById('activeMembers');
            list.innerHTML = '';
            members.forEach(member => {
                let li = document.createElement('li');
                li.textContent = member;
                list.appendChild(li);
            });
        });
}
