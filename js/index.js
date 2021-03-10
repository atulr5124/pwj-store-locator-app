var map;
var infoWindow
var markers = []

var stylesArray = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    {
        elementType: "labels.text.stroke",
        stylers: [{ color: "#242f3e" }],
    },
    {
        elementType: "labels.text.fill",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
]
function initMap() {
    let losAngeles = {
        lat: 34.063380,
        lng: -118.358080
    }
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: losAngeles.lat, lng: losAngeles.lng },
        zoom: 11,
        styles: stylesArray
    })
    infoWindow = new google.maps.InfoWindow()
    // createMarker(losAngeles)
}

const onEnter = (e) => {
    if(e.key =="Enter") {
        getStores()
    }
}

const getStores = () => {
    const zipCode = document.getElementById('zip-code').value
    if(!zipCode) {
        return
    }
    const API_URL = `http://localhost:3000/api/stores`
    const fullURL = `${API_URL}?zip_code=${zipCode}`
    fetch(fullURL)
        .then((response) => {
            if(response.status == 200) {
                return response.json()
            } else {
                throw new Error(response.status)
            }
        }).then((data) => {
            if(data.length > 0) {
                clearLocations()
                searchLocationsNearby(data)
                setStoresList(data)
                setOnClickListener()
            } else {
                clearLocations()
                nostoresFound()
            }
        })
}

const searchLocationsNearby = (stores) => {
    let bounds = new google.maps.LatLngBounds;
    stores.forEach((store, index) => {
        let latlng = new google.maps.LatLng(
            store.location.coordinates[1],
            store.location.coordinates[0]
        )
        let name = store.storeName
        let address = store.addressLines[0]
        let status = store.openStatusText
        let phone = store.phoneNumber
        bounds.extend(latlng)
        createMarker(latlng, name, address, index+1, status, phone)
    })
    map.fitBounds(bounds)
}

const createMarker = (latlng, name, address, storeNumber, status, phone) => {
    var html = `
        <div class="store-info-window">
            <div class="store-info-name">
                ${name}
            </div>
            <div class="store-info-status">
                ${status}
            </div>
            <div class="store-info-address">
                <div class="icon">
                    <i class="fa fa-map-marker-alt"></i>
                </div>
                ${address}
            </div>
            <div class="store-info-phone">
                <div class="icon">
                    <i class="fa fa-phone-alt"></i>
                </div>
                <span>
                    <a href="tel:${phone}">${phone}</a>
                </span>
            </div>
        </div>
    `
    var marker = new google.maps.Marker({
        position: latlng,
        map,
        label: `${storeNumber}`,
        title: name
    })
    google.maps.event.addListener(marker, 'click', () => {
        infoWindow.setContent(html)
        infoWindow.open(map, marker)
    })
    markers.push(marker)
}

const clearLocations = () => {
    infoWindow.close()
    for(var i=0;i<markers.length;i++) {
        markers[i].setMap(null)
    }
    markers.length = 0
}

const nostoresFound = () => {
    const html = `
        <div class="no-stores-found">
            No stores found!
        </div>
    `
    document.querySelector('.stores-list').innerHTML = html
}

const setOnClickListener = () => {
    let storeElements = document.querySelectorAll('.store-container')
    storeElements.forEach((el, index) => {
        el.addEventListener('click', () => {
            google.maps.event.trigger(markers[index], 'click')
        })
    })
}

const setStoresList = (stores) => {
    let html = ''
    stores.forEach((store, index) => {
        html += `
            <div class="store-container">
                <div class="store-info-container">
                    <div class="store-address">
                        <span>${store.addressLines[0]}</span>
                        <span>${store.addressLines[1]}</span>
                    </div>
                    <div class="store-phone-number">
                        ${store.phoneNumber}
                    </div>
                </div>
                <div class="store-number-container">
                    <div class="store-number">
                        ${index+1}
                    </div>
                </div>
            </div>
        `
    })
    document.querySelector('.stores-list').innerHTML = html
}

