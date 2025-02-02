document.addEventListener("DOMContentLoaded", function () {
    let map = L.map('map'); // Initialize the map without a center

    // Load tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Get user's live location and center map
    navigator.geolocation.getCurrentPosition(function (position) {
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        map.setView([lat, lng], 13);
        console.log("Map centered at user location:", lat, lng);
    }, function () {
        alert("Unable to retrieve location. Defaulting to world view.");
        map.setView([20, 0], 2); // Default view if location access is denied
    });

    // Store unsafe locations globally
    let unsafeLocations = [];

    // Allow user to mark a location as unsafe by clicking on the map
    map.on("click", function (e) {
        let lat = e.latlng.lat;
        let lng = e.latlng.lng;
        let description = prompt("Enter a description for this unsafe location:");

        if (description) {
            let marker = L.marker([lat, lng]).addTo(map)
                .bindPopup(`<b>Unsafe Area</b><br>${description}`)
                .openPopup();

            // Save the unsafe location in localStorage globally
            let storedIncidents = JSON.parse(localStorage.getItem("incidents")) || [];
            storedIncidents.push({ lat, lng, description });
            localStorage.setItem("incidents", JSON.stringify(storedIncidents));

            console.log("Unsafe location added:", lat, lng, description);
        }
    });

    // Load incidents from localStorage and display on the map (global, not user-specific)
    function loadIncidents() {
        let storedIncidents = JSON.parse(localStorage.getItem("incidents")) || [];
        storedIncidents.forEach(incident => {
            L.marker([incident.lat, incident.lng]).addTo(map)
                .bindPopup(`<b>Unsafe Area</b><br>${incident.description}`)
                .openPopup();
        });
    }

    // Call loadIncidents immediately when the page loads to display all incidents
    loadIncidents();

    // Handle login form display
    document.getElementById("login-button").addEventListener("click", function () {
        let username = document.getElementById("login-username").value.trim();
        if (username && localStorage.getItem(username)) {
            // Successful login: store username in localStorage
            localStorage.setItem("username", username);
            document.getElementById("login-form").classList.add("hidden");
            document.getElementById("contact-section").classList.remove("hidden");
            document.getElementById("sign-out-button").classList.remove("hidden");

            // Load and display user contacts
            loadContacts(username);
        } else {
            alert("Username does not exist. Please sign up.");
        }
    });

    // Handle signup form display
    document.getElementById("signup-button").addEventListener("click", function () {
        let username = document.getElementById("signup-username").value.trim();
        if (username) {
            // Save user to localStorage
            if (!localStorage.getItem(username)) {
                localStorage.setItem(username, JSON.stringify([])); // Empty contacts list for new user
                alert("Account created successfully! Please login.");
                document.getElementById("signup-form").classList.add("hidden");
                document.getElementById("login-form").classList.remove("hidden");
            } else {
                alert("Username already exists. Please choose another username.");
            }
        }
    });

    // Switch between SignUp and Login form
    document.getElementById("show-login").addEventListener("click", function () {
        document.getElementById("signup-form").classList.add("hidden");
        document.getElementById("login-form").classList.remove("hidden");
    });

    document.getElementById("show-signup").addEventListener("click", function () {
        document.getElementById("login-form").classList.add("hidden");
        document.getElementById("signup-form").classList.remove("hidden");
    });

    // Load contacts for the logged-in user
    function loadContacts(username) {
        let storedContacts = localStorage.getItem(username);
        let contactList = document.getElementById("contact-list");
        contactList.innerHTML = ""; // Clear current contact list

        if (storedContacts) {
            storedContacts = JSON.parse(storedContacts);
            storedContacts.forEach(contact => {
                let listItem = document.createElement("li");
                listItem.textContent = `${contact.name} - ${contact.phone}`;
                contactList.appendChild(listItem);
            });
        }
    }

    // Handle adding trusted contacts
    document.getElementById("add-contact").addEventListener("click", function () {
        document.getElementById("contact-form").classList.toggle("hidden");
    });

    document.getElementById("save-contact").addEventListener("click", function () {
        let username = localStorage.getItem("username");
        if (!username) {
            alert("Please login first.");
            return;
        }

        let name = document.getElementById("contact-name").value.trim();
        let phone = document.getElementById("contact-phone").value.trim();

        if (name && phone) {
            let contact = { name, phone };
            let storedContacts = localStorage.getItem(username);

            if (storedContacts) {
                storedContacts = JSON.parse(storedContacts);
            } else {
                storedContacts = [];
            }

            storedContacts.push(contact);
            localStorage.setItem(username, JSON.stringify(storedContacts));  // Save contacts in localStorage
            loadContacts(username);  // Reload the contact list

            document.getElementById("contact-name").value = "";
            document.getElementById("contact-phone").value = "";
            document.getElementById("contact-form").classList.add("hidden");

            console.log("Trusted contact added:", name, phone);
        } else {
            alert("Please enter valid contact details.");
        }
    });

    // Handle SOS button
    document.getElementById("sos-button").addEventListener("click", function () {
        let username = localStorage.getItem("username");
        if (!username) {
            alert("Please login first.");
            return;
        }

        let contacts = JSON.parse(localStorage.getItem(username)) || [];
        if (contacts.length === 0) {
            alert("No trusted contacts available.");
            return;
        }

        navigator.geolocation.getCurrentPosition(function (position) {
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            let message = `Emergency! My location: https://www.google.com/maps?q=${lat},${lng}`;

            contacts.forEach(contact => {
                console.log("Sending SOS to:", contact.name, "Message:", message);
            });

            alert("SOS sent to trusted contacts!");
        }, function () {
            alert("Unable to retrieve location.");
        });
    });

    // Sign out
    document.getElementById("sign-out-button").addEventListener("click", function () {
        localStorage.removeItem("username");
        document.getElementById("contact-section").classList.add("hidden");
        document.getElementById("login-form").classList.remove("hidden");
        document.getElementById("sign-out-button").classList.add("hidden");
    });
});
