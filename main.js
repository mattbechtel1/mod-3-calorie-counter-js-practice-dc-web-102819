// your code here, it may be worth it to ensure this file only runs AFTER the dom has loaded.
const calorieEntriesRoute = 'http://localhost:3000/api/v1/calorie_entries';


document.addEventListener('DOMContentLoaded', () => {
    populateList()
    updateProgressBar()

    const newCalForm = document.getElementById('new-calorie-form');
    let newCalFormBtn = newCalForm.querySelector('.uk-button');
    newCalFormBtn.type = 'submit';
    newCalForm.addEventListener('submit', addNewItem);

    const editForm = document.getElementById('edit-calorie-form')
    editForm.addEventListener('submit', saveChange)

    const bmrForm = document.getElementById('bmr-calculator');
    bmrForm.addEventListener('submit', calculateBmr)
 })

function saveChange(event) {
    const id = document.getElementById('submitBtn').dataset.id
    event.preventDefault();

    let configObj = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            action: 'application/json'
        },
        body: JSON.stringify({
            calorie: parseInt(document.getElementById('cal-num-input').value),
            note: document.getElementById('notes-input').value
        })
    }

    fetch(calorieEntriesRoute + '/' + id, configObj)
    .then(response => response.json())
    .then(json => { 
        update(json);
        updateProgressBar();
    })
    .catch(err => console.log(err.message));
}

function update(data) {
    const searchFor = 'item-' + data.id;
    const li = document.getElementById(searchFor);

    li.querySelector('strong').innerText = data.calorie;
    li.querySelector('em').innerText = data.note;
}

function populateList() {
    fetch(calorieEntriesRoute)
    .then(response => response.json())
    .then(data => data.forEach(entry => appendEntry(entry)))
}

function updateProgressBar(newMax) {
    const progressBar = document.querySelector('.uk-progress')
    
    let max = newMax || progressBar.max
    progressBar.max = max;
    
    function getSum(items) {
        let reductionObj = {
            calorie: 0
        };
        items.unshift(reductionObj);
        let sum = items.reduce((totalObj, item) => {
            totalObj.calorie = totalObj.calorie + item.calorie
            return totalObj
        });
        progressBar.value = sum.calorie;
    }

    fetch(calorieEntriesRoute)
    .then(response => response.json())
    .then(data => { getSum(data) })
}

function appendEntry(entry, location) {
    const caloriesList = document.getElementById('calories-list');
    
    let li = document.createElement('li');
    li.classList.add('calories-list-item');
    li.id = 'item-' + entry.id;

    let grid = document.createElement('div');
    grid.classList.add('uk-grid');

    let innerGrid = document.createElement('div');
    innerGrid.classList.add('uk-width-1-6');
    
    let calCount = document.createElement('strong');
    calCount.innerText = entry.calorie;
    let calUnit = document.createElement('span');
    calUnit.innerText = 'kcal';
    innerGrid.append(calCount, calCount);
    
    let descriptionContainer = document.createElement('div');
    descriptionContainer.classList.add('uk-width-4-5');
    let description = document.createElement('em');
    description.innerText = entry.note;
    descriptionContainer.appendChild(description)

    let menu = document.createElement('div');
    menu.classList.add('list-item-menu');

    let pencilLink = document.createElement('a');
    pencilLink.classList.add('edit-button');
    pencilLink.dataset.ukIcon = "icon: pencil";
    pencilLink.dataset.ukToggle = "target: #edit-form-container";
    pencilLink.addEventListener('click', populateModal);

    let deleteBtn = document.createElement('a');
    deleteBtn.classList.add('delete-button')
    deleteBtn.dataset.ukIcon = "icon: trash";
    deleteBtn.addEventListener('click', deleteItem);

    grid.append(innerGrid, descriptionContainer);
    menu.append(pencilLink, deleteBtn);
    li.append(grid, menu);

    if (location === 'before') {
        caloriesList.prepend(li);
    } else {
        caloriesList.append(li);
    }

}

function addNewItem(event) {
    event.preventDefault()
    let newNote =  event.target.querySelector('.uk-textarea').value;
    let newCalCount = event.target.querySelector('.uk-input').value;

    let configObj = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            'calorie': newCalCount,
            'note': newNote
        })
    }

    fetch(calorieEntriesRoute, configObj)
    .then(response => response.json())
    .then(data => { 
        appendEntry(data, 'before');
        updateProgressBar();
    });
}

function deleteItem(event) {
    let li = event.currentTarget.parentNode.parentNode
    let id = li.id.split('-')[1];

    let configObj = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }

    fetch(calorieEntriesRoute + '/' + id, configObj)
    .then(response => response.json())
    .then(data => {
        removeItem(li);
        updateProgressBar();
    })
}

function removeItem(li) {
    li.remove();
}

function populateModal(event) {
    const li = event.currentTarget.parentNode.parentNode;
    let calCountContainer = li.querySelector('strong');
    const initCalCount = calCountContainer.innerText;
    let calNoteContainer = li.querySelector('em')
    const initCalNote = calNoteContainer.innerText;
    const id = li.id.split('-')[1];
    
    let submitBtn = document.getElementById('submitBtn');
    submitBtn.type = 'submit';
    submitBtn.dataset.id = id;
    
    let calInput = document.getElementById('cal-num-input') 
    calInput.value = initCalCount;
    let noteInput = document.getElementById('notes-input');
    noteInput.value = initCalNote;
}

function calculateBmr(event) {
    event.preventDefault();
    
    const lowerBmrContainer = document.getElementById('lower-bmr-range');
    const upperBmrContainer = document.getElementById('higher-bmr-range');
    
    const weight = parseInt(event.currentTarget.weight.value);
    const height = parseInt(event.currentTarget.height.value);
    const age = parseInt(event.currentTarget.age.value);
    
    if (isNaN(weight) || isNaN(height) || isNaN(age)) {
        alert('Please only enter integers in the BMR calculator')
    } else {

    let lowerBmr = Math.round(655 + (4.35 * weight) + (4.7 * height) - (4.7 * age));
    let upperBmr = Math.round(66 + (6.23 * weight) + (12.7 * height) - (6.8 * age));

    lowerBmrContainer.innerText = lowerBmr;
    upperBmrContainer.innerText = upperBmr;

    const bmrAvg = (lowerBmr + upperBmr) / 2;

    updateProgressBar(bmrAvg);
    }
}