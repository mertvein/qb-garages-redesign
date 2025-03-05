window.addEventListener("message", function (event) {
    const data = event.data;
    if (data.action === "VehicleList") {
        const garageLabel = data.garageLabel;
        const vehicles = data.vehicles;
        populateVehicleList(garageLabel, vehicles);
        displayUI();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeGarageMenu();
    }
});

function butonkapat(){
    closeGarageMenu();
}

function closeGarageMenu() {
    const container = document.querySelector(".container");
    container.style.display = "none";

    fetch("https://qb-garages/closeGarage", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({}),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data === "ok") {
                return;
            } else {
                console.error("Failed to close Garage UI");
            }
        });
}


function displayUI() {
    const container = document.querySelector(".container");
    container.style.display = "block";
}

function populateVehicleList(garageLabel, vehicles) {
    const vehicleContainerElem = document.querySelector(".vehicle-table");
    const fragment = document.createDocumentFragment();

    while (vehicleContainerElem.firstChild) {
        vehicleContainerElem.removeChild(vehicleContainerElem.firstChild);
    }

    const garageHeader = document.getElementById("garage-header");
    garageHeader.textContent = garageLabel;

    vehicles.forEach((v) => {
        
        const vehicleItem = document.createElement("div");
        vehicleItem.classList.add("vehicle-item");

        // Vehicle Info: Name, Plate & Mileage
        const vehicleInfo = document.createElement("div");
        vehicleInfo.classList.add("vehicle-info");

        const vehicleName = document.createElement("span");
        vehicleName.classList.add("vehicle-name");
        vehicleName.textContent = v.vehicleLabel;
        vehicleInfo.appendChild(vehicleName);

        const plate = document.createElement("span");
        plate.classList.add("plate");
        plate.textContent = v.plate;
        vehicleInfo.appendChild(plate);

        const mileage = document.createElement("span");
        mileage.classList.add("mileage");
        mileage.textContent = `${v.mileage} KM`;
        vehicleInfo.appendChild(mileage);
        
        const statgoster = document.createElement("span");
        statgoster.classList.add("statgosteramk");
        statgoster.innerHTML = `<i class="fa-solid fa-angle-down"></i>`;
        vehicleInfo.appendChild(statgoster);
        vehicleItem.appendChild(vehicleInfo);

        // Finance Info
        const financeDriveContainer = document.createElement("div");
        financeDriveContainer.classList.add("finance-drive-container");
        const financeInfo = document.createElement("div");
        financeInfo.classList.add("finance-info");

        if (v.balance && v.balance > 0) {
            financeInfo.textContent = "Balance: $" + v.balance.toFixed(0);
        } else {
            financeInfo.textContent = "Paid Off";
        }

        financeDriveContainer.appendChild(financeInfo);

        // Drive Button
        let status;
        let isDepotPrice = false;

        if (v.state === 0) {
            if (v.depotPrice && v.depotPrice > 0) {
                isDepotPrice = true;

                if (v.type === "public") {
                    status = "Çekilmiş";
                } else if (v.type === "depot") {
                    status = "Aracını Teslim Al ($" + v.depotPrice.toFixed(0) + ")";
                } else {
                    status = "Dışarıda";
                }
            } else {
                status = "Dışarıda";
            }
        } else if (v.state === 1) {
            if (v.depotPrice && v.depotPrice > 0) {
                isDepotPrice = true;
                if (v.type === "depot") {
                    status = "Teslim Al $" + v.depotPrice.toFixed(0);
                } else if (v.type === "public") {
                    if (v.garajim == "0$") {
                        status = "Aracı Garajdan Al";
                    } else if (v.garajim == "100$") {
                        status = "Garaj Değiştir ve Al (100$)"
                    } else {
                        status = "Aracın Garajında";
                    }
                } else if (v.garajim == "0$") {
                    status = "Aracı Garajdan Al";
                } else if (v.garajim == "100$") {
                    status = "Garaj Değiştir ve Al (100$)"
                }
            } else if (v.garajim == "0$") {
                status = "Aracı Garajdan Al";
            } else if (v.garajim == "100$") {
                status = "Garaj Değiştir ve Al (100$)"
            }
        } else if (v.state === 2) {
            status = "Çekilmiş";
        }

        const driveButton = document.createElement("button");
        driveButton.classList.add("drive-btn");
        driveButton.textContent = status;

        if (status === "Çekilmiş" || status === "Çekilmiş") {
            driveButton.style.backgroundColor = "#222";
            driveButton.disabled = true;
        }

        if (status === "Dışarıda") {
            driveButton.style.backgroundColor = "#222";
        }

        driveButton.onclick = function () {
            if (driveButton.disabled) return;

            const vehicleStats = {
                fuel: v.fuel,
                engine: v.engine,
                body: v.body,
            };

            const vehicleData = {
                vehicle: v.vehicle,
                garage: v.garage,
                index: v.index,
                plate: v.plate,
                type: v.type,
                depotPrice: v.depotPrice,
                stats: vehicleStats,
                helal: v.garajim
            };

            if (status === "Dışarıda") {
                fetch("https://qb-garages/trackVehicle", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8",
                    },
                    body: JSON.stringify(v.plate),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data === "ok") {
                            closeGarageMenu();
                        } else {
                            return;
                        }
                    });
            } else if (isDepotPrice) {
                fetch("https://qb-garages/takeOutDepo", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8",
                    },
                    body: JSON.stringify(vehicleData),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data === "ok") {
                            closeGarageMenu();
                        } else {
                            console.error("Failed to pay depot price.");
                        }
                    });
            } else {
                fetch("https://qb-garages/takeOutVehicle", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8",
                    },
                    body: JSON.stringify(vehicleData),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data === "ok") {
                            closeGarageMenu();
                        } else {
                            console.error("Failed to close Garage UI.");
                        }
                    });
            }
        };

        /* financeDriveContainer.appendChild(driveButton);
        vehicleItem.appendChild(financeDriveContainer); */

        // Progress Bars: Fuel, Engine, Body
        const stats = document.createElement("div");
        stats.classList.add("stats");
        stats.style.display = "none";

        const maxValues = {
            fuel: 100,
            engine: 1000,
            body: 1000,
        };

        ["fuel", "engine", "body"].forEach((statLabel) => {
            const stat = document.createElement("div");
            stat.classList.add("stat");
            const label = document.createElement("div");
            label.classList.add("label");
            label.textContent = statLabel.charAt(0).toUpperCase() + statLabel.slice(1);
            stat.appendChild(label);
            const progressBar = document.createElement("div");
            progressBar.classList.add("progress-bar");
            const progress = document.createElement("span");
            const progressText = document.createElement("span");
            progressText.classList.add("progress-text");
            const percentage = (v[statLabel] / maxValues[statLabel]) * 100;
            progress.style.width = percentage + "%";
            progressText.textContent = Math.round(percentage) + "%";

            if (percentage >= 75) {
                progress.classList.add("bar-green");
            } else if (percentage >= 50) {
                progress.classList.add("bar-yellow");
            } else {
                progress.classList.add("bar-red");
            }

            progressBar.appendChild(progressText);
            progressBar.appendChild(progress);
            stat.appendChild(progressBar);
            stats.appendChild(stat);
            stats.appendChild(driveButton);
            vehicleItem.appendChild(stats);
        });
        

        vehicleInfo.addEventListener("click", function() {
            if (stats) {
                stats.style.display = stats.style.display === "none" ? "block" : "none";
        
                const icon = statgoster.querySelector("i");
                if (icon) {
                    if (stats.style.display === "block") {
                        icon.classList.remove("fa-angle-down");
                        icon.classList.add("fa-angle-up");
                    } else {
                        icon.classList.remove("fa-angle-up");
                        icon.classList.add("fa-angle-down");
                    }
                }
            } else {
                console.error("stats divini bulamadımamkki");
            }
        });        
        fragment.appendChild(vehicleItem);
    });

    vehicleContainerElem.appendChild(fragment);
}

document.addEventListener("DOMContentLoaded", function () {
    const aracimnerdeeee = document.getElementById("aracimiveraq");

    aracimnerdeeee.addEventListener("input", function () {
        const searchTerm = aracimnerdeeee.value.toLowerCase();
        filterVehicleList(searchTerm);
    });
});

function filterVehicleList(searchTerm) {
    const vehicleItems = document.querySelectorAll(".vehicle-item");

    vehicleItems.forEach((item) => {
        const vehicleName = item.querySelector(".vehicle-name").textContent.toLowerCase();
        const plate = item.querySelector(".plate").textContent.toLowerCase();

        if (vehicleName.includes(searchTerm) || plate.includes(searchTerm)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}
