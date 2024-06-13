const inputs = document.querySelectorAll('input');

inputs.forEach(input => {
	let value = localStorage.getItem(input.id);
	const profit = input.id === 'min-profit';
	input.value = profit ? value ? value + '%' : value : '';
});

inputs.forEach(input => {
	input.addEventListener('change', () => {
		let value = input.value;
		const profit = input.id === 'min-profit';
		if (profit) {
			value = value.replace(/\D/g, '');
			input.value = value + '%';
			
		}
		localStorage.setItem(input.id, value);
	});
});

const addBtn = document.querySelector('.logs__button__check');
const deleteBtn = document.querySelector('.logs__button__trash');

const itemNameInput = document.querySelector('.logs-buttons input');
let selectableDivs = document.querySelectorAll('.item-name');

const storage = localforage.createInstance({ name: 'storage' });

function genKey() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

// load items from storage
storage.iterate((value, key) => {
	loadItems(key, value);
}).catch(console.error);

selectableDivs.forEach(div => {
	div.addEventListener('click', function() {
		this.classList.toggle('selected');
	});
});

deleteBtn.addEventListener('click', async function(e) {
  e.preventDefault();
  const selectedDivs = document.querySelectorAll('.item-name.selected');
  if (selectedDivs) {
    for (const div of selectedDivs) {
      const key = div.dataset.key;
      div.parentElement.remove();
      await storage.removeItem(key).catch(console.error);
    }
  }
});

addBtn.addEventListener('click', async (e) => {
	e.preventDefault();
	const itemNameText = itemNameInput.value;
	if (itemNameInput.value.length < 5) return;
	
	itemNameInput.value = '';
	const key = genKey();
	await loadItems(key, { name: itemNameText, minFloat: '', maxFloat: '', maxPrice: '' });
});


async function loadItems(key, item) {

	const newItemContainer = document.createElement('div');
	const newUl = document.createElement('ul');
	newItemContainer.classList.add('logs-content__info-row');
	
	const itemName = document.createElement('h4');
	itemName.classList.add('item-name');
	itemName.textContent = item.name;
	newItemContainer.appendChild(itemName);
  
	const minFloatLi = document.createElement('li');
	const minFloatInput = document.createElement('input');
	minFloatInput.type = "number";
	minFloatInput.value = item.minFloat;
	minFloatInput.name = "minFloat";
	minFloatLi.appendChild(minFloatInput);
	newUl.appendChild(minFloatLi);
  
	const maxFloatLi = document.createElement('li');
	const maxFloatInput = document.createElement('input');
	maxFloatInput.type = "number";
	maxFloatInput.value = item.maxFloat;
	maxFloatInput.name = "maxFloat";
	maxFloatLi.appendChild(maxFloatInput);
	newUl.appendChild(maxFloatLi);

	const maxPriceLi = document.createElement('li');
	const maxPriceInput = document.createElement('input');
	maxPriceInput.type = "number";
	maxPriceInput.value = item.maxPrice;
	maxPriceInput.name = "maxPrice";
	maxPriceLi.appendChild(maxPriceInput);
	newUl.appendChild(maxPriceLi);
  
	newItemContainer.appendChild(newUl);

	itemName.dataset.key = key;

	logsTable.appendChild(newItemContainer);

	itemName.addEventListener('click', function() {
		this.classList.toggle('selected');
	});

	storage.setItem(key, item);

	// if (!item.name) await storage.setItem(itemNameText, { name: itemNameText, ...item });

	newItemContainer.querySelectorAll('input').forEach(input => {
		input.addEventListener('change', async function(e) {
			storage.getItem(key)
			.then(item => {
				item[e.target.name] = +(e.target.value);
				storage.setItem(key, item);
			})
			.catch(console.error);
		});
	});
}
