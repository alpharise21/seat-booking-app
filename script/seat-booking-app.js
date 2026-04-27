'use strict';

// ###########################################################################
// Fix #10: Concurrency Issues - Debounce Utility
// ###########################################################################
function debounce(func, wait = 300) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

class SeatBookingApp {
    constructor(name) {
        this._name = name;
        this._sectors = [];
        this._priceMultipliers = [];
        this._services = [];
        this._currentServiceId = '';
    }
    getName() {
        return this._name;
    }
    addSector(sector) {
        this._sectors.push(sector);
    }
    getSectorsArray() {
        return this._sectors;
    }
    setPriceMultipliersArray() {
        const sectors = this.getSectorsArray();
        sectors.forEach((sector) => {
            const sectorId = sector.getId();
            const sectorPrice = sector.getPriceMultiplier();
            this._priceMultipliers.push({
                sector: sectorId,
                priceMultiplier: sectorPrice
            });
        });
    }
    getPriceMultipliersArray() {
        return this._priceMultipliers;
    }

    renderSectorsList() {
        const sectors = this.getPriceMultipliersArray();
        const container = document.querySelector(`#sectors-list`);
        container.innerHTML = "";
        sectors.forEach((sector) => {
            const listElement = document.createElement('li');
            const name = document.createElement('span');
            name.textContent = sector.sector;

            const price = document.createElement('input')
            // fix 1
            const uniqueId = `price-${sector.sector}`;
            price.setAttribute('id', uniqueId);
            
            // fix 2
            price.setAttribute('aria-label', `Price multiplier for sector ${sector.sector}`);
            
            price.type = 'number'; 
            price.step = '0.1';
            price.value = sector.priceMultiplier;

            listElement.appendChild(name);
            listElement.appendChild(price);
            container.appendChild(listElement);
        });
    }
    // ----------------------

    addService(service) {
        this._services.push(service);
    }
    getServicesArray() {
        return this._services;
    }
    renderServicesList() {
        const services = this.getServicesArray();
        const dropdownElement = document.querySelector(`#services-list`);
        dropdownElement.innerHTML = "";
        services.forEach((service) => {
            const optionElement = document.createElement('option');
            optionElement.setAttribute('value', service.getId());
            optionElement.textContent = service.getName();
            dropdownElement.appendChild(optionElement);
        });
        this.setCurrentServiceId(dropdownElement.value);
    }
    getCurrentServiceId() {
        return this._currentServiceId;
    }
    getCurrentService() {
        const services = this.getServicesArray();
        return services.find((service) => service.getId() === this.getCurrentServiceId());
    }
    setCurrentServiceId(serviceId) {
        this._currentServiceId = serviceId;
    }
    renderCurrentServiceData() {
        const currentService = this.getCurrentService();
        const inputServiceName = document.querySelector(`#service-name`);
        const inputServicePrice = document.querySelector(`#service-price`);
        if (currentService) {
            inputServiceName.value = currentService.getName();
            inputServicePrice.value = currentService.getPrice();
        } else {
            inputServiceName.value = '';
            inputServicePrice.value = '';
        }
    }
    cacheServices() {
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem(`sba-services-${this.getName()}`, JSON.stringify(this.getServicesArray()));
        } else {
            window.alert(`Access to localStorage in this browser is not available. Data cannot be saved.`);
            throw Error(`Access to localStorage in this browser is not available. Data cannot be saved.`);
        }
    }
    fetchServices() {
        const servicesJSON = JSON.parse(localStorage.getItem(`sba-services-${this.getName()}`));
        if (!servicesJSON) {
            console.log(`Let's add some services. Use the form on the left.`);
        } else {
            servicesJSON.forEach((service) => {
                const serviceInstance = new Service(service._name, service._price);
                serviceInstance.setBookedSeatsArray(service._seatsBooked);
                this.addService(serviceInstance);
            });
        }
    }
    updateOrderDetails() {
        const currentService = this.getCurrentService();
        if (!currentService) return;
        const servicePrice = currentService.getPrice();
        const priceMultipliers = this.getPriceMultipliersArray();
        const reservedSeats = currentService.getReservedSeats();
        const container = document.querySelector(`#order-details`);
        container.innerHTML = '';
        const totalPriceContainer = document.querySelector(`#order-total-price`);
        totalPriceContainer.innerHTML = '';
        let totalPrice = 0;
        reservedSeats.forEach((seat) => {
            const currentSecotrId = seat.parentElement.parentElement.id;
            const sectorPrice = priceMultipliers.find((element) => element.sector === currentSecotrId).priceMultiplier;
            const seatPrice = parseFloat((servicePrice * sectorPrice).toFixed(2));
            totalPrice += seatPrice;
            const listItem = document.createElement(`li`);
            const listItemId = document.createElement(`span`);
            listItemId.textContent = seat.id;
            const listItemPrice = document.createElement(`span`);
            listItemPrice.textContent = `$${seatPrice}`;
            container.appendChild(listItem);
            listItem.appendChild(listItemId);
            listItem.appendChild(listItemPrice);
        });
        const totalPriceElement = document.createElement(`span`);
        totalPriceElement.textContent = `Total price: $${parseFloat(totalPrice.toFixed(2))}`;
        totalPriceContainer.appendChild(totalPriceElement);
    }
}

class Service {
    constructor(name, price) {
        this._id = crypto.randomUUID();
        this._name = name;
        this._price = price;
        this._seatsReserved = [];
        this._seatsBooked = [];
    }
    getId() { return this._id; }
    getName() { return this._name; }
    getPrice() { return this._price; }
    setName(name) { this._name = name; }
    setPrice(price) { this._price = price; }
    getBookedSeats() { return this._seatsBooked; }
    bookSeats() {
        const reservedSeats = this.getReservedSeats();
        reservedSeats.forEach((seat) => {
            if (!this._seatsBooked.includes(seat.id)) {
                this._seatsBooked.push(seat.id);
            }
        });
        this.clearReservedSeats();
        this.markBookedSeats();
    }
    getReservedSeats() { return this._seatsReserved; }
    addReservedSeat(seat) { this._seatsReserved.push(seat); }
    removeReservedSeat(seatId) {
        const index = this._seatsReserved.findIndex((seat) => seat.id === seatId);
        if (index !== -1) this._seatsReserved.splice(index, 1);
    }
    clearReservedSeats() { this._seatsReserved = []; }
    setBookedSeatsArray(array) { this._seatsBooked = array; }
    markBookedSeats() {
        const seatElements = document.querySelectorAll('.seat');
        seatElements.forEach((seat) => {
            if (this._seatsBooked.includes(seat.id)) {
                seat.classList.remove('seat--reserved');
                seat.classList.add('seat--booked');
            }
        });
    }
}

class Sector {
    constructor(id, priceMultiplier = 1, ...seatsInRow) {
        this._id = `s-${String(id)}`;
        this._priceMultiplier = priceMultiplier;
        this._rows = seatsInRow.length;
        this._seats = [...seatsInRow];
        for (let i = 1; i <= seatsInRow.length; i++) {
            const rowId = `${this._id}-${i}`;
            for (let j = 1; j <= seatsInRow[i-1]; j++) {
                const seatId = `${rowId}-${j}`;
                this._seats.push({
                    sector: this._id,
                    row: rowId,
                    seat: seatId
                });
            }
        }
    }
    getId() { return this._id; }
    getPriceMultiplier() { return this._priceMultiplier; }
    setPriceMultiplier(priceMultiplier) { this._priceMultiplier = priceMultiplier; }
    renderSector() {
        const appContainer = document.querySelector(`#seat-booking-app`);
        if (!appContainer) throw Error(`App container not found`);
        const seatsContainer = document.querySelector(`#seats`);
        if (!seatsContainer) throw Error(`Seats container not found`);
        const sectorId = this._id;
        const sectorName = sectorId.slice(2);
        const seats = this._seats;
        const sectorElement = document.createElement('div');
        sectorElement.classList.add(`sector`);
        sectorElement.setAttribute(`id`, sectorId);
        sectorElement.style.gridArea = sectorName;
        seatsContainer.appendChild(sectorElement);
        for (let i = 0; i < this._rows; i++) {
            const rowElement = document.createElement('div');
            rowElement.classList.add(`row`);
            rowElement.setAttribute(`id`, `${sectorId}-${i + 1}`);
            sectorElement.appendChild(rowElement);
            for (let j = 0; j < seats.length; j++) {
                if (seats[j].row === `${sectorId}-${i + 1}`) {
                    const seatElement = document.createElement('div');
                    seatElement.classList.add(`seat`);
                    seatElement.setAttribute(`id`, seats[j].seat);
                    rowElement.appendChild(seatElement);
                }
            }
        }
        const sectorLabel = document.createElement('span');
        sectorLabel.textContent = sectorId;
        sectorLabel.classList.add('sector__label');
        sectorElement.appendChild(sectorLabel);
    }
}

// CREATE SECTORS -------------------------------------------------------------
const sectorA1 = new Sector(`A1`, 1.0, 20, 20);
sectorA1.renderSector();
const sectorA2 = new Sector(`A2`, 1.2, 20, 20, 20);
sectorA2.renderSector();
const sectorB1 = new Sector(`B1`, 1.2, 20, 20, 20, 20);
sectorB1.renderSector();
const sectorB1L = new Sector(`B1L`, 1.4, 1, 1, 1, 1, 1, 1);
sectorB1L.renderSector();
const sectorB2L = new Sector(`B2L`, 1.4, 1, 1, 1, 1, 1, 1);
sectorB2L.renderSector();
const sectorC1L = new Sector(`C1L`, 1.5, 12);
sectorC1L.renderSector();

// UTILITY FUNCTIONS ----------------------------------------------------------
const localStorageSpace = function() {
    let data = '';
    console.log('Current local storage: ');
    for (let key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
            data += window.localStorage[key];
            console.log(key + " = " + ((window.localStorage[key].length * 16)/(8 * 1024)).toFixed(2) + ' KB');
        }
    }
    console.log(data ? '\n' + 'Total space used: ' + ((data.length * 16)/(8 * 1024)).toFixed(2) + ' KB' : 'Empty (0 KB)');
    console.log(data ? 'Approx. space remaining: ' + (5120 - ((data.length * 16)/(8 * 1024)).toFixed(2)) + ' KB' : '5 MB');
};

function initializeApp(instanceName) {
    console.log(`Seat-Booking App instance "${instanceName}" has been successfully created!`);
    return new SeatBookingApp(instanceName);
}

function renderBookedSeats() {
    const currentService = showingRoom1.getCurrentService();
    const seatElements = document.querySelectorAll('.seat');
    
    if (currentService) {
        const bookedSeats = currentService.getBookedSeats();
        seatElements.forEach((seat) => {
            if (bookedSeats.includes(seat.id)) {
                seat.classList.add(`seat--booked`);
            } else {
                seat.classList.remove(`seat--booked`);
            }
        });
    } else {
        seatElements.forEach(seat => seat.classList.remove(`seat--booked`));
    }
}

function clearReservedUI() {
    const currentService = showingRoom1.getCurrentService();
    if (currentService) {
        currentService.clearReservedSeats();
    }
    document.querySelectorAll('.seat--reserved').forEach(seat => {
        seat.classList.remove('seat--reserved');
    });
    const container = document.querySelector(`#order-details`);
    if (container) container.innerHTML = '';
    const totalPriceContainer = document.querySelector(`#order-total-price`);
    if (totalPriceContainer) totalPriceContainer.innerHTML = '';
}

// INITIALIZE APP -------------------------------------------------------------
const showingRoom1 = initializeApp(`showingRoom1`);
const initializeApp = (instanceName) => new SeatBookingApp(instanceName);
showingRoom1.addSector(sectorA1);
showingRoom1.addSector(sectorA2);
showingRoom1.addSector(sectorB1);
showingRoom1.addSector(sectorB1L);
showingRoom1.addSector(sectorB2L);
showingRoom1.addSector(sectorC1L);
showingRoom1.setPriceMultipliersArray();
showingRoom1.fetchServices();
showingRoom1.renderSectorsList();
showingRoom1.renderServicesList();
showingRoom1.renderCurrentServiceData();

// GET ELEMENTS FROM DOM ------------------------------------------------------
const seatElements = document.querySelectorAll('.seat');
seatElements.forEach((seat) => {
    // Seat hover tooltip (from main)
    seat.addEventListener('mouseover', (e) => {
        const seatInfo = document.createElement('div');
        seatInfo.classList.add(`seat__info`);
        seatInfo.textContent = e.target.id;
        e.target.parentElement.appendChild(seatInfo);
    });
    seat.addEventListener('mouseleave', () => {
        const info = document.querySelector(`.seat__info`);
        if (info) info.remove();
    });

    // Seat click event (merged logic)
    seat.addEventListener('click', (e) => {
        if (!seat.classList.contains(`seat--booked`)) {
            e.target.classList.toggle('seat--reserved');
            const currentService = showingRoom1.getCurrentService();
            if (currentService) {
                if (seat.classList.contains(`seat--reserved`)) {
                    currentService.addReservedSeat(e.target);
                } else {
                    currentService.removeReservedSeat(e.target.id);
                }
                // Update order details (placed outside to ensure update on both add and remove)
                showingRoom1.updateOrderDetails();
            }
        }
    });
});

// Service dropdown change event
const dropdownElement = document.querySelector(`#services-list`);
dropdownElement.addEventListener('change', (e) => {
    showingRoom1.setCurrentServiceId(e.target.value);
    clearReservedUI(); // From main
    renderBookedSeats(); // From main
    showingRoom1.renderCurrentServiceData();
});

// Add new service button (with debounce + state lock)
const serviceAddBtn = document.querySelector(`#service-add-btn`);
serviceAddBtn.addEventListener('click', debounce((e) => {
    if (serviceAddBtn.disabled) return;
    serviceAddBtn.disabled = true;

    // Get input values and add new service (merged variable names and logic)
    const inputServiceName = document.querySelector(`#service-name`).value;
    const inputServicePrice = document.querySelector(`#service-price`).value;
    const newService = new Service(inputServiceName, inputServicePrice);
    
    showingRoom1.addService(newService);
    showingRoom1.cacheServices();
    showingRoom1.renderServicesList();
    
    // UI update and state preservation (from main)
    const dropdown = document.querySelector(`#services-list`);
    dropdown.value = newService.getId();
    showingRoom1.setCurrentServiceId(newService.getId());
    clearReservedUI();
    showingRoom1.renderCurrentServiceData();
    console.log(`"${inputServiceName}" has been successfully added`);
    localStorageSpace();

    serviceAddBtn.disabled = false;
}, 300));

// Update service button (with debounce + state lock)
const serviceUpdateBtn = document.querySelector(`#service-update-btn`);
serviceUpdateBtn.addEventListener('click', debounce(() => {
    if (serviceUpdateBtn.disabled) return;
    serviceUpdateBtn.disabled = true;

    const inputServiceName = document.querySelector(`#service-name`).value;
    const inputServicePrice = document.querySelector(`#service-price`).value;
    const currentService = showingRoom1.getCurrentService();
    if (currentService) {
        currentService.setName(inputServiceName);
        currentService.setPrice(inputServicePrice);
        showingRoom1.cacheServices();
        showingRoom1.renderCurrentServiceData();
        clearReservedUI();
        console.log(`"${inputServiceName}" has been successfully updated`);
        localStorageSpace();
    }

    serviceUpdateBtn.disabled = false;
}, 300));

// Delete service button (with debounce + state lock)
const serviceDeleteBtn = document.querySelector(`#service-delete-btn`);
serviceDeleteBtn.addEventListener('click', debounce(() => {
    if (serviceDeleteBtn.disabled) return;
    serviceDeleteBtn.disabled = true;

    const inputServiceName = document.querySelector(`#service-name`).value;
    const currentServiceId = showingRoom1.getCurrentServiceId();
    const servicesArray = showingRoom1.getServicesArray();
    const indexToDelete = servicesArray.findIndex(service => service.getId() === currentServiceId);
    if (indexToDelete !== -1) {
        servicesArray.splice(indexToDelete, 1);
        showingRoom1.cacheServices();
        showingRoom1.renderServicesList();
        showingRoom1.renderCurrentServiceData();
        clearReservedUI();
        renderBookedSeats();
        console.log(`"${inputServiceName}" has been successfully removed`);
        localStorageSpace();
    }

    serviceDeleteBtn.disabled = false;
}, 300));

// Book seats button (with debounce + state lock)
const bookSeatsBtn = document.querySelector(`#book-seats-btn`);
bookSeatsBtn.addEventListener('click', debounce(() => {
    if (bookSeatsBtn.disabled) return;
    bookSeatsBtn.disabled = true;

    const currentService = showingRoom1.getCurrentService();
    if (currentService) {
        currentService.bookSeats();
        showingRoom1.cacheServices();
        
        // Clear reserved UI state after booking (from main)
        document.querySelectorAll('.seat--reserved').forEach(seat => {
            seat.classList.remove('seat--reserved');
        });
        showingRoom1.updateOrderDetails();
    }

    bookSeatsBtn.disabled = false;
}, 300));

// TRANSLATIONS & LANGUAGE SUPPORT ---------------------------------------------
const translations = {
  en: {
    languageLabel: "Language:",
    servicesListLabel: "Service list:",
    movieTitleLabel: "Movie title:",
    priceBaseLabel: "Price base:",
    addNew: "Add new",
    saveChanges: "Save changes",
    deleteText: "Delete",
    editSectorPrices: "Edit sectors' prices",
    sectorMultipliersLabel: "Price multipliers for each sector:",
    saveText: "Save",
    ticketsLabel: "Tickets:",
    buyText: "Buy",
    screenText: "Screen"
  },
  zh: {
    languageLabel: "语言：",
    servicesListLabel: "服务列表：",
    movieTitleLabel: "电影标题：",
    priceBaseLabel: "基础票价：",
    addNew: "新增",
    saveChanges: "保存修改",
    deleteText: "删除",
    editSectorPrices: "编辑分区价格",
    sectorMultipliersLabel: "各分区票价系数：",
    saveText: "保存",
    ticketsLabel: "票券：",
    buyText: "购买",
    screenText: "屏幕"
  }
};

function applyLanguage(lang) {
  const t = translations[lang];

  const languageLabel = document.getElementById("language-label");
  const servicesListLabel = document.getElementById("services-list-label");
  const movieTitleLabel = document.getElementById("movie-title-label");
  const priceBaseLabel = document.getElementById("price-base-label");
  const serviceAddBtn = document.getElementById("service-add-btn");
  const serviceUpdateBtn = document.getElementById("service-update-btn");
  const serviceDeleteBtn = document.getElementById("service-delete-btn");
  const sectorsPriceBtn = document.getElementById("sectors-price-btn");
  const sectorMultipliersLabel = document.getElementById("sector-multipliers-label");
  const sectorsSaveBtn = document.getElementById("sectors-save-btn");
  const ticketsLabel = document.getElementById("tickets-label");
  const bookSeatsBtn = document.getElementById("book-seats-btn");
  const screen = document.getElementById("screen");

  if (languageLabel) languageLabel.textContent = t.languageLabel;
  if (servicesListLabel) servicesListLabel.textContent = t.servicesListLabel;
  if (movieTitleLabel) movieTitleLabel.textContent = t.movieTitleLabel;
  if (priceBaseLabel) priceBaseLabel.textContent = t.priceBaseLabel;
  if (serviceAddBtn) serviceAddBtn.textContent = t.addNew;
  if (serviceUpdateBtn) serviceUpdateBtn.textContent = t.saveChanges;
  if (serviceDeleteBtn) serviceDeleteBtn.textContent = t.deleteText;
  if (sectorsPriceBtn) sectorsPriceBtn.textContent = t.editSectorPrices;
  if (sectorMultipliersLabel) sectorMultipliersLabel.textContent = t.sectorMultipliersLabel;
  if (sectorsSaveBtn) sectorsSaveBtn.textContent = t.saveText;
  if (ticketsLabel) ticketsLabel.textContent = t.ticketsLabel;
  if (bookSeatsBtn) bookSeatsBtn.textContent = t.buyText;
  if (screen) screen.textContent = t.screenText;

  localStorage.setItem("selectedLanguage", lang);
}

document.addEventListener("DOMContentLoaded", () => {
  const languageSelect = document.getElementById("language-select");
  const savedLanguage = localStorage.getItem("selectedLanguage") || "en";

  if (languageSelect) {
    languageSelect.value = savedLanguage;
    applyLanguage(savedLanguage);

    languageSelect.addEventListener("change", (event) => {
      applyLanguage(event.target.value);
    });
  }
});