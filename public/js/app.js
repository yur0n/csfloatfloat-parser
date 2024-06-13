const openModalButtons = document.querySelectorAll('.open-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const toggleActiveEl = document.querySelectorAll('.toggle-active');
const startButton = document.querySelector('.table-top__start');
const clearButton = document.querySelector('.table-top__clear');
const modals = document.querySelectorAll('.modal');
const table = document.querySelector('.table-content__info');
const logsTable = document.querySelector('.logs-content__info');

let timeout;
const histrory = [];

openModalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modals.forEach(modal => {
            if (modal.classList.contains(btn.getAttribute('data-modal-open'))) {
                modal.classList.toggle('active');
            }
        })
    })
});

closeModalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modals.forEach(modal => {
            if (modal.classList.contains(btn.getAttribute('data-modal-close'))) {
                modal.classList.remove('active');
            }
        })
    })
});

toggleActiveEl.forEach(el => {
    el.addEventListener('click', () => {
        el.classList.toggle('active');
    })
});

startButton.addEventListener('click', () => {
    if (startButton.classList.contains('active')) {
        start();
    } else {
        clearTimeout(timeout);
    }
});

clearButton.addEventListener('click', () => {
    table.innerHTML = '';
    logsTable.innerHTML = '';
    if (clearButton.classList.contains('active')) {
        setTimeout(() => {
            clearButton.classList.remove('active');
        }, 300)
    }
});


async function start() {
    const minProfitCoef = 1 + parseFloat(localStorage.getItem('min-profit')) / 100;
    const items = [];
    await storage.iterate((value, key) => {
        items.push(value);
    }).catch(console.error);
    const data = {
        items,
        minProfit: minProfitCoef || 1.01,
    }

    window.postMessage({ parseFloat: true, data }, "*");
    timeout = setTimeout(() => {
        start();
    }, 20_000);
}

window.addEventListener("message", (e) => {
    if (e.data.parsedSkinsFloat) {
        const skins = e.data.parsedSkinsFloat
        if (skins.error) {

            const row = document.createElement('div');
            row.classList.add('table-content__info-row');
            row.innerHTML = `<h4>${formatDate()} - ${skins.error}</h4><p>Status: ${skins?.status}</p>`;
            logsTable.appendChild(row);
            if (skins.status === 409) {
                startButton.classList.toggle('active');
                clearTimeout(timeout);
            }
            return;
        }
        console.log(skins);
        const toBot = [];
        skins.forEach(skin => {
            if (histrory.includes(skin.id)) return;
            histrory.push(skin.id);
            toBot.push(skin);
            const row = document.createElement('div');
            row.classList.add('table-content__info-row');
            row.innerHTML = `
            <div>
                <h3>Found profitable skin:</h3>
            </div>
            <div>
                <h4>${skin.name}</h4><p>|</p><p>CSFloat Price: ${skin.csPrice}</p><p>|</p><p>Profit: ${skin.profit}%</p>
            </div>
            <div>
                <p>Float: ${skin.float}</p><p>|</p><p><a href="${skin.link}" target="_blank">СSFloat Link</a></p>
            </div>
            `;
            table.appendChild(row);
        });
        const chatId = localStorage.getItem('telegram-id');
        if (toBot.length && chatId) {
            fetch('/telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ chatId, data: toBot })
            })
            .then(res => res.json())
            .then(console.log)
            .catch(console.error);
        }
    }
});

function formatDate() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return `${hours}:${minutes}:${seconds}`;
}