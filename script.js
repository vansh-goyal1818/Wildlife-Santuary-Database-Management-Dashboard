const API = "http://localhost:3000";

let currentTable = "";

function setAppEnabled(enabled) {
    var ids = ["tableSelect", "btnShow", "btnAdd", "btnDel", "btnUpd", "btnFirst", "btnLast", "btnCalc", "btnSearch", "btnQuery"];
    ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.disabled = !enabled;
    });

    if (!enabled) {
        document.getElementById("output").innerHTML =
            "<p class='error-banner'>⚠️ Server is not available. Start server with `npm start` and open <strong>http://localhost:3000</strong>.</p>";
    }
}

/* ─────────────────────────────────────────
   INIT — runs after full page load
───────────────────────────────────────── */
window.addEventListener("DOMContentLoaded", function () {
    if (window.location.protocol === "file:") {
        setAppEnabled(false);
        document.getElementById("output").innerHTML =
            "<p class='error-banner'>⚠️ Do not open index.html directly. Use <strong>http://localhost:3000</strong> after running server.js (`npm start`).</p>";
        return;
    }

    setAppEnabled(false);

    /* Listen for table change */
    document.getElementById("tableSelect").addEventListener("change", function () {
        currentTable = this.value;
        loadColumns(currentTable);
        document.getElementById("output").innerHTML = "";
    });

    /* Wire buttons */
    document.getElementById("btnShow").addEventListener("click", loadTable);
    document.getElementById("btnAdd").addEventListener("click", addRecord);
    document.getElementById("btnDel").addEventListener("click", deleteRecord);
    document.getElementById("btnUpd").addEventListener("click", updateRecord);
    document.getElementById("btnFirst").addEventListener("click", firstRecord);
    document.getElementById("btnLast").addEventListener("click", lastRecord);
    document.getElementById("btnCalc").addEventListener("click", calc);
    document.getElementById("btnSearch").addEventListener("click", searchRecord);
    document.getElementById("btnQuery").addEventListener("click", customQuery);

    /* Fetch all table names first */
    fetch(API + "/tables")
        .then(function (res) {
            if (!res.ok) throw new Error("Server returned " + res.status);
            return res.json();
        })
        .then(function (data) {
            var sel = document.getElementById("tableSelect");
            sel.innerHTML = "";
            data.forEach(function (t) {
                var name = Object.values(t)[0];
                var opt = document.createElement("option");
                opt.value = name;
                opt.textContent = name;
                sel.appendChild(opt);
            });
            /* Pick first table and load its columns */
            if (sel.options.length > 0) {
                currentTable = sel.options[0].value;
                sel.value = currentTable;
                loadColumns(currentTable);
            }
            setAppEnabled(true);
        })
        .catch(function (err) {
            console.error("Cannot connect to server:", err);
            setAppEnabled(false);
        });
});

/* ─────────────────────────────────────────
   LOAD COLUMNS for a given table name
───────────────────────────────────────── */
function loadColumns(tableName) {
    if (!tableName) return;

    fetch(API + "/columns/" + tableName)
        .then(function (res) { return res.json(); })
        .then(function (cols) {

            /* === ADD: one labelled input per column === */
            var addFields = document.getElementById("addFields");
            addFields.innerHTML = "";
            cols.forEach(function (c) {
                var div = document.createElement("div");
                div.className = "field-group";
                div.innerHTML =
                    "<label>" + c.Field + "</label>" +
                    "<input data-col='" + c.Field + "' placeholder='Enter " + c.Field + "'>";
                addFields.appendChild(div);
            });

            /* === DELETE column dropdown === */
            var delCol = document.getElementById("delCol");
            delCol.innerHTML = "";
            cols.forEach(function (c) {
                var opt = document.createElement("option");
                opt.value = c.Field;
                opt.textContent = c.Field;
                delCol.appendChild(opt);
            });

            /* === UPDATE column dropdown === */
            var updCol = document.getElementById("updCol");
            updCol.innerHTML = "";
            cols.forEach(function (c) {
                var opt = document.createElement("option");
                opt.value = c.Field;
                opt.textContent = c.Field;
                updCol.appendChild(opt);
            });

            /* === CALC column dropdown === */
            var calcCol = document.getElementById("calcCol");
            calcCol.innerHTML = "";
            cols.forEach(function (c) {
                var opt = document.createElement("option");
                opt.value = c.Field;
                opt.textContent = c.Field;
                calcCol.appendChild(opt);
            });

            /* === SEARCH column dropdown === */
            var searchCol = document.getElementById("searchCol");
            searchCol.innerHTML = "";
            cols.forEach(function (c) {
                var opt = document.createElement("option");
                opt.value = c.Field;
                opt.textContent = c.Field;
                searchCol.appendChild(opt);
            });
        })
        .catch(function (err) {
            console.error("loadColumns failed:", err);
        });
}

/* ─────────────────────────────────────────
   SHOW TABLE
───────────────────────────────────────── */
function loadTable() {
    if (!currentTable) return;
    fetch(API + "/table/" + currentTable)
        .then(function (res) { return res.json(); })
        .then(show)
        .catch(function (err) { showMsg("output", "❌ " + err.message, "error"); });
}

/* ─────────────────────────────────────────
   ADD RECORD
───────────────────────────────────────── */
function addRecord() {
    var data = {};
    var inputs = document.querySelectorAll("#addFields input");

    if (inputs.length === 0) {
        alert("No fields loaded. Select a table first.");
        return;
    }

    inputs.forEach(function (inp) {
        data[inp.getAttribute("data-col")] = inp.value;
    });

    fetch(API + "/add/" + currentTable, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(function (res) {
        if (!res.ok) return res.json().then(function (e) { throw new Error(e.error || "Server error"); });
        return res.json();
    })
    .then(function () {
        showMsg("addMsg", "✅ Record added!", "success");
        document.querySelectorAll("#addFields input").forEach(function (inp) { inp.value = ""; });
        loadTable();
    })
    .catch(function (err) { showMsg("addMsg", "❌ " + err.message, "error"); });
}

/* ─────────────────────────────────────────
   DELETE RECORD
───────────────────────────────────────── */
function deleteRecord() {
    var column = document.getElementById("delCol").value;
    var value  = document.getElementById("delVal").value.trim();

    if (!value) { showMsg("delMsg", "⚠️ Enter a value to delete.", "error"); return; }

    fetch(API + "/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: currentTable, column: column, value: value })
    })
    .then(function (res) {
        if (!res.ok) return res.json().then(function (e) { throw new Error(e.error || "Server error"); });
        return res.json();
    })
    .then(function () {
        showMsg("delMsg", "✅ Record deleted!", "success");
        document.getElementById("delVal").value = "";
        loadTable();
    })
    .catch(function (err) { showMsg("delMsg", "❌ " + err.message, "error"); });
}

/* ─────────────────────────────────────────
   UPDATE RECORD
───────────────────────────────────────── */
function updateRecord() {
    var column   = document.getElementById("updCol").value;
    var oldValue = document.getElementById("oldVal").value.trim();
    var newValue = document.getElementById("newVal").value.trim();

    if (!oldValue) { showMsg("updMsg", "⚠️ Enter the old value.", "error"); return; }
    if (!newValue) { showMsg("updMsg", "⚠️ Enter the new value.", "error"); return; }

    fetch(API + "/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: currentTable, column: column, oldValue: oldValue, newValue: newValue })
    })
    .then(function (res) {
        if (!res.ok) return res.json().then(function (e) { throw new Error(e.error || "Server error"); });
        return res.json();
    })
    .then(function () {
        showMsg("updMsg", "✅ Record updated!", "success");
        document.getElementById("oldVal").value = "";
        document.getElementById("newVal").value = "";
        loadTable();
    })
    .catch(function (err) { showMsg("updMsg", "❌ " + err.message, "error"); });
}

/* ─────────────────────────────────────────
   FIRST / LAST
───────────────────────────────────────── */
function firstRecord() {
    fetch(API + "/first/" + currentTable)
        .then(function (res) { return res.json(); })
        .then(show);
}

function lastRecord() {
    fetch(API + "/last/" + currentTable)
        .then(function (res) { return res.json(); })
        .then(show);
}

/* ─────────────────────────────────────────
   CALCULATION
───────────────────────────────────────── */
function calc() {
    var col  = document.getElementById("calcCol").value;
    var func = document.getElementById("func").value;

    fetch(API + "/calc/" + currentTable + "/" + col + "/" + func)
        .then(function (res) { return res.json(); })
        .then(function (d) {
            document.getElementById("output").innerHTML =
                "<div class='calc-result'>" +
                "<span class='calc-func'>" + func + "</span> of " +
                "<span class='calc-col'>" + col + "</span> = " +
                "<strong>" + d[0].result + "</strong>" +
                "</div>";
        });
}

/* ─────────────────────────────────────────
   SEARCH RECORD
───────────────────────────────────────── */
function searchRecord() {
    var column = document.getElementById("searchCol").value;
    var value = document.getElementById("searchVal").value.trim();

    if (!value) { showMsg("searchMsg", "⚠️ Enter a value to search.", "error"); return; }

    fetch(API + "/search/" + currentTable + "/" + encodeURIComponent(column) + "/" + encodeURIComponent(value))
        .then(function (res) {
            if (!res.ok) return res.text().then(function (text) { throw new Error(text || res.statusText); });
            return res.json();
        })
        .then(show)
        .catch(function (err) { showMsg("searchMsg", "❌ " + err.message, "error"); });
}

/* ─────────────────────────────────────────
   CUSTOM QUERY
───────────────────────────────────────── */
function customQuery() {
    var sql = document.getElementById("sqlQuery").value.trim();

    if (!sql) { showMsg("queryMsg", "⚠️ Enter an SQL query.", "error"); return; }

    fetch(API + "/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sql })
    })
    .then(function (res) {
        if (!res.ok) return res.text().then(function (text) { throw new Error(text || res.statusText); });
        return res.json();
    })
    .then(show)
    .catch(function (err) { showMsg("queryMsg", "❌ " + err.message, "error"); });
}

/* ─────────────────────────────────────────
   DISPLAY TABLE
───────────────────────────────────────── */
function show(data) {
    var output = document.getElementById("output");
    if (!data || data.length === 0) {
        output.innerHTML = "<p class='empty'>No records found.</p>";
        return;
    }

    var keys = Object.keys(data[0]);
    var html = "<div class='table-wrap'><table><thead><tr>";
    keys.forEach(function (k) { html += "<th>" + k + "</th>"; });
    html += "</tr></thead><tbody>";
    data.forEach(function (r) {
        html += "<tr>";
        keys.forEach(function (k) { html += "<td>" + (r[k] !== null && r[k] !== undefined ? r[k] : "") + "</td>"; });
        html += "</tr>";
    });
    html += "</tbody></table></div>";
    output.innerHTML = html;
}

/* ─────────────────────────────────────────
   STATUS MESSAGE HELPER
───────────────────────────────────────── */
function showMsg(id, text, type) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = "msg " + type;
    setTimeout(function () { el.textContent = ""; el.className = "msg"; }, 3500);
}