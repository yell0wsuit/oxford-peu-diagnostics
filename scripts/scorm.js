var Scrom = function () {
    var _this = this;
    this.checkUserAnswer = function (index, cb) {
        let controller_status = false;
        let dataItem = localStorage.getItem("peu-diagnostic-data_" + index);
        if (dataItem !== null) {
            controller_status = true;
            cb(true);
        } else {
            cb(false);
        }
    }

    this.getExcercisedata = function (cb) {
        const peuDiagnosticData = localStorage.getItem("peu-diagnostic-main");
        let controller_status = false;

        if (peuDiagnosticData === null) {
            fetch("db/main.json")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    localStorage.setItem("peu-diagnostic-main", JSON.stringify(data));
                    controller_status = true;
                    cb(data);
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                });
        } else {
            const data = JSON.parse(peuDiagnosticData);
            controller_status = true;
            cb(data);
        }
    };

    this.uploadExcercisedata = function (data, cb) {
        localStorage.setItem("peu-diagnostic-main", JSON.stringify(data));
    };

    this.getuserData = function (file, cb) {
        const savedDataJSON = localStorage.getItem("peu-diagnostic-" + file);
        const data = JSON.parse(savedDataJSON);
        cb(data);
    };

    this.updateUserData = function (file, data, cb) {
        localStorage.setItem("peu-diagnostic-" + file, JSON.stringify(data));
    };

    this.upload_controller = function (cb) {
        fetch("db/main.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                _this.getExcercisedata(cb);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    };
};
