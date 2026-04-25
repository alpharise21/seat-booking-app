'use strict';

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
        // get sectors array
        const sectors = this.getSectorsArray();
        sectors.forEach((sector) => {
            const sectorId = sector.getId();
            const sectorPrice = sector.getPriceMultiplier();
            this._priceMultipliers.push(
                {
                    sector: sectorId,
                    priceMultiplier: sectorPrice
                }
            );
        });
    }
    getPriceMultipliersArray() {
        return this._priceMultipliers;
    }

    renderSectorsList() {
        // get price multipliers array
        const sectors = this.getPriceMultipliersArray()
        // get container for sectors list (<ul>)
        const container = document.querySelector(`#sectors-list`);
        // clear container
        container.innerHTML = "";
        // populate container with existing sectors
        sectors.forEach((sector) => {
            const listElement = document.createElement('li');
            const name = document.createElement('span')
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
        })
    }
    // ----------------------

    addService(service) {
        this._services.push(service);
    }
    getServicesArray() {
        return this._services;
    }
    renderServicesList() {
        // get services array
        const services = this.getServicesArray();
        // get container (dropdown element from Document)
        const dropdownElement = document.querySelector(`#services-list`);
        // clear container
        dropdownElement.innerHTML = "";
        // populate container with existing services
        services.forEach((service) => {
            const optionElement = document.createElement('option');
            optionElement.setAttribute('value', service.getId());
            optionElement.textContent = service.getName();
            dropdownElement.appendChild(optionElement);
        })
        // set initial active service
        this.setCurrentServiceId(dropdownElement.value)
    }
    getCurrentServiceId() {
        return this._currentServiceId;
    }
    getCurrentService() {
        // this.renderServicesList();
        // get services array
        const services = this.getServicesArray();
        return services.find((service) => {
            return service.getId() === this.getCurrentServiceId()
        })
    }
    setCurrentServiceId(serviceId) {
        this._currentServiceId = serviceId;
        // console.log(this.getCurrentService());
    }
    renderCurrentServiceData() {
        // get current service
        const currentService = this.getCurrentService();

        if(currentService) {
            // get input elements
            const inputServiceName = document.querySelector(`#service-name`);
            const inputServicePrice = document.querySelector(`#service-price`);
            // set current service data as input values
            inputServiceName.value = currentService.getName();
            inputServicePrice.value = currentService.getPrice();
        }
    }
    cacheServices() {
        // check if localStorage is available
        if(typeof(Storage) !== "undefined") {
            // localStorage is available
            localStorage.setItem(`sba-services-${this.getName()}`, JSON.stringify(this.getServicesArray()));
        } else {
            // localStorage is not available
            window.alert(`Access to localStorage in this browser is not available. Data cannot be saved.`);
            throw Error(`Access to localStorage in this browser is not available. Data cannot be saved.`);
        }
    }
    fetchServices() {
        // fetch data from localStorage
        const servicesJSON = JSON.parse(localStorage.getItem(`sba-services-${this.getName()}`));

        if(!servicesJSON) {
            // if there's no data, notify user
            console.log(`Let's add some services. Use the form on the left.`)
        } else {
            servicesJSON.forEach((service) => {
                // create Service instances and add to app's array
                const serviceInstance = (new Service(service._name, service._price))
                serviceInstance.setBookedSeatsArray(service._seatsBooked);
                this.addService(serviceInstance)
            })
        }
    }
    updateOrderDetails() {
        // get current service
        const currentService = this.getCurrentService();
        // get current service price
        const servicePrice = currentService.getPrice();
        // get price multipliers
        const priceMultipliers = this.getPriceMultipliersArray();
        // get reserved seats for current service
        const reservedSeats = currentService.getReservedSeats();
        // get and clear `order-details` container
        const container = document.querySelector(`#order-details`);
        container.innerHTML = '';
        // get and clear `total-price` <span> element
        const totalPriceContainer = document.querySelector(`#order-total-price`);
        totalPriceContainer.innerHTML = '';
        let totalPrice = 0;
        // loop through reserved seats and render every element
        reservedSeats.forEach((seat) => {
            // get reserved-seat's parent's id (sector's id)
            const currentSecotrId = seat.parentElement.parentElement.id;
            // find price multiplier for this sector
            const sectorPrice = priceMultipliers.find((element) => {
                return element.sector === currentSecotrId;
            }).priceMultiplier
            // calculate price for this seat
            const seatPrice = parseFloat((servicePrice * sectorPrice).toFixed(2))
            // update total price for reserved seats
            totalPrice += seatPrice;

            // render list object for this seat
            const listItem = document.createElement(`li`)
            const listItemId = document.createElement(`span`)
            listItemId.textContent = seat.id
            const listItemPrice = document.createElement(`span`)
            listItemPrice.textContent = `$${seatPrice}`
            container.appendChild(listItem)
            listItem.appendChild(listItemId)
            listItem.appendChild(listItemPrice)
            // render updated total price element
            const totalPriceElement = document.createElement(`span`)
            totalPriceElement.textContent = `Total price: $${parseFloat(totalPrice.toFixed(2))}`
            totalPriceContainer.innerHTML = '';
            totalPriceContainer.appendChild(totalPriceElement)
        })
    }
};

class Service {
    constructor(name, price) {
        this._id = crypto.randomUUID();
        this._name = name;
        this._price = price;
        this._seatsReserved = []; // contains seats' IDs
        this._seatsBooked = []; // contains seats' IDs
    }
    getId() {
        return this._id;
    }
    getName() {
        return this._name;
    }
    getPrice() {
        return this._price;
    }
    setName(name) {
        this._name = name;
    }
    setPrice(price) {
        this._price = price;
    }
    getBookedSeats() {
        return this._seatsBooked;
    }
    bookSeats() {
        // get reserved seats
        const reservedSeats = this.getReservedSeats();
        // transfer elements to array for booked seats
        reservedSeats.forEach((seat) => {
            this._seatsBooked.push(seat.id)
        })
        // clear `reserved seats` array
        this.clearReservedSeats();
        // update corresponding `seat` elements on the page
        this.markBookedSeats();
    }
    getReservedSeats() {
        return this._seatsReserved;
    }
    addReservedSeat(seat) {
        this._seatsReserved.push(seat)
    }
    removeReservedSeat(seatId) {
        const index = this._seatsReserved.findIndex((seat) => {
            return seat === seatId
        })
        this._seatsReserved.splice(index, 1)
    }
    clearReservedSeats() {
        this._seatsReserved = [];
    }
    setBookedSeatsArray(array) {
        this._seatsBooked = array;
    }
    markBookedSeats() {
        // get all rendered seat elements
        const seatElements = document.querySelectorAll('.seat');
        // refresh seats' classes
        seatElements.forEach((seat) => {
            if(this._seatsBooked.includes(seat.id)) {
            seat.classList.remove('seat--reserved');
            seat.classList.add('seat--booked');  
            }
        })
    }
};

class Sector {
    constructor(id, priceMultiplier = 1, ...seatsInRow) {
        this._id = `s-${String(id)}`;
        this._priceMultiplier = priceMultiplier;
        this._rows = seatsInRow.length;
        this._seats = [...seatsInRow];
        
        // create array of rows and seats
        for(let i = 1; i <= seatsInRow.length; i++) {
            const rowId = `${this._id}-${i}`;
            for(let j = 1; j <= seatsInRow[i-1]; j++) {
                const seatId = `${rowId}-${j}`;
                this._seats.push({
                    sector: this._id,
                    row: rowId,
                    seat: seatId
                });
            }
        }
    }
    getId() {
        return this._id;
    }
    getPriceMultiplier() {
        return this._priceMultiplier;
    }
    setPriceMultiplier(priceMultiplier) {
        this._priceMultiplier = priceMultiplier;
    }
    renderSector() {
        const appContainer = document.querySelector(`#seat-booking-app`);
        if(!appContainer) throw Error(`App container not found`);
        
        const seatsContainer = document.querySelector(`#seats`);
        if(!seatsContainer) throw Error(`Seats container not found`);
        const sectorId = this._id;
        const sectorName = sectorId.slice(2);
        const seats = this._seats;

        const sectorElement = document.createElement('div');
        sectorElement.classList.add(`sector`);
        sectorElement.setAttribute(`id`, sectorId);
        sectorElement.style.gridArea = sectorName;
        seatsContainer.appendChild(sectorElement);

        for(let i = 0; i < this._rows; i++) {
            const rowElement = document.createElement('div');
            rowElement.classList.add(`row`);
            rowElement.setAttribute(`id`, `${sectorId}-${i + 1}`);
            sectorElement.appendChild(rowElement);

            for(let j = 0; j < seats.length; j++) {
                if (seats[j].row === `${sectorId}-${i + 1}`) {
                    const seatElement = document.createElement('div');
                    seatElement.classList.add(`seat`);
                    seatElement.setAttribute(`id`, seats[j].seat);
                    rowElement.appendChild(seatElement);
                };
            };
        };

        const sectorLabel = document.createElement('span');
        sectorLabel.textContent = sectorId;
        sectorLabel.classList.add('sector__label');
        sectorElement.appendChild(sectorLabel);
    };
};


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

const initializeApp = (instanceName) => new SeatBookingApp(instanceName);
const showingRoom1 = initializeApp(`showingRoom1`);

showingRoom1.addSector(sectorA1)
showingRoom1.addSector(sectorA2)
showingRoom1.addSector(sectorB1)
showingRoom1.addSector(sectorB1L)
showingRoom1.addSector(sectorB2L)
showingRoom1.addSector(sectorC1L)
showingRoom1.setPriceMultipliersArray()
showingRoom1.fetchServices();
showingRoom1.renderSectorsList();
showingRoom1.renderServicesList();
showingRoom1.renderCurrentServiceData();


const seatElements = document.querySelectorAll('.seat');
seatElements.forEach((seat) => {
    seat.addEventListener('click', (e) => {
        if (!seat.classList.contains(`seat--booked`)) {
            e.target.classList.toggle('seat--reserved');
            const currentService = showingRoom1.getCurrentService()
            if(seat.classList.contains(`seat--reserved`)) {
                currentService.addReservedSeat(e.target);
                showingRoom1.updateOrderDetails()
            } else {
                currentService.removeReservedSeat(e.target.id);
            }
        };
    });
});

const dropdownElement = document.querySelector(`#services-list`);
dropdownElement.addEventListener('change', (e) => {
    showingRoom1.setCurrentServiceId(e.target.value);
    showingRoom1.renderCurrentServiceData();
});

document.querySelector(`#service-add-btn`).addEventListener('click', () => {
    const name = document.querySelector(`#service-name`).value;
    const price = document.querySelector(`#service-price`).value;
    const newService = new Service(name, price);
    showingRoom1.addService(newService);
    showingRoom1.cacheServices();
    showingRoom1.renderServicesList();
});

document.querySelector(`#book-seats-btn`).addEventListener('click', () => {
    showingRoom1.getCurrentService().bookSeats();
    showingRoom1.cacheServices();
});