const Calculator = (() => {
    const HISTORY_KEY = "stockHistory";
    const state = {
        currency: "USD",
        changeSign: -1
    };

    const dom = {
        currencyButtons: document.querySelectorAll("[data-currency]"),
        autoDecimal: document.getElementById("autoDecimal"),
        currentPrice: document.getElementById("currentPrice"),
        changePercent: document.getElementById("changePercent"),
        changeSignBtn: document.getElementById("changeSignBtn"),
        convertPriceBtn: document.getElementById("convertPriceBtn"),
        basePrice: document.getElementById("basePrice"),
        targetSection: document.getElementById("targetSection"),
        targetTableBody: document.getElementById("targetTableBody"),
        historyBody: document.getElementById("historyBody"),
        clearHistoryBtn: document.getElementById("clearHistoryBtn")
    };

    function parseInput(value) {
        const cleanValue = String(value).replace(/,/g, "").trim();
        const number = Number(cleanValue);

        return Number.isFinite(number) ? number : 0;
    }

    function formatPrice(value, currency = state.currency) {
        const options = currency === "USD"
            ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            : { maximumFractionDigits: 0 };

        return Number(value).toLocaleString("ko-KR", options);
    }

    function getCurrencySymbol(currency = state.currency) {
        return currency === "USD" ? "$" : "₩";
    }

    function formatHistoryAmount(value, currency) {
        const text = String(value ?? "");

        if (text.startsWith("$") || text.startsWith("₩")) {
            return text;
        }

        return `${getCurrencySymbol(currency)}${text}`;
    }

    function normalizePriceInput(input) {
        let cleanValue = input.value.replace(/[^0-9.]/g, "");

        if (state.currency === "KRW") {
            cleanValue = cleanValue.replace(/\./g, "");
            input.dataset.manualDot = "false";
            input.value = cleanValue;
            return;
        }

        const parts = cleanValue.split(".");

        if (parts.length > 2) {
            cleanValue = `${parts[0]}.${parts.slice(1).join("")}`;
        }

        if (!cleanValue || !cleanValue.includes(".")) {
            input.dataset.manualDot = "false";
        }

        if (
            state.currency === "USD"
            && dom.autoDecimal.checked
            && input.dataset.manualDot !== "true"
            && !cleanValue.includes(".")
        ) {
            if (cleanValue.length === 0) {
                input.value = "";
                return;
            }

            const number = Number(cleanValue);

            if (cleanValue.length === 1) {
                input.value = String(number);
                return;
            }

            if (cleanValue.length === 2) {
                input.value = (number / 10).toFixed(1);
                return;
            }

            input.value = (number / 100).toFixed(2);
            return;
        }

        input.value = cleanValue;
    }

    function handleDecimalKey(event, input) {
        if (event.key !== "." || state.currency !== "USD") return;

        const cleanValue = input.value.replace(/\./g, "");

        if (!cleanValue || input.dataset.manualDot === "true") return;

        event.preventDefault();
        input.value = `${cleanValue}.`;
        input.dataset.manualDot = "true";
    }

    function normalizePercentInput(input) {
        const parts = input.value.replace(/[^0-9.]/g, "").split(".");
        input.value = parts.length > 2
            ? `${parts[0]}.${parts.slice(1).join("")}`
            : parts.join(".");
    }

    function getTickSize(price) {
        if (state.currency === "USD") return 0.01;
        if (price < 2000) return 1;
        if (price < 5000) return 5;
        if (price < 20000) return 10;
        if (price < 50000) return 50;
        if (price < 200000) return 100;
        if (price < 500000) return 500;

        return 1000;
    }

    function roundToTick(value) {
        const tick = getTickSize(value);

        return Math.round(value / tick) * tick;
    }

    function calculateTargets(price, percent) {
        return {
            buy: roundToTick(price * (1 - percent / 100)),
            sell: roundToTick(price * (1 + percent / 100))
        };
    }

    function loadHistory() {
        try {
            const history = JSON.parse(localStorage.getItem(HISTORY_KEY));

            return Array.isArray(history) ? history : [];
        } catch (error) {
            console.warn("계산 기록을 불러오지 못했습니다.", error);
            return [];
        }
    }

    function saveHistory(history) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        UIFeedback.showToast();
    }

    function addHistory(record) {
        const history = loadHistory();

        history.unshift(record);
        saveHistory(history.slice(0, 8));
        renderHistory();
    }

    function renderTargets() {
        const price = parseInput(dom.basePrice.value);

        if (price <= 0) {
            dom.targetSection.hidden = true;
            dom.targetTableBody.innerHTML = "";
            return;
        }

        dom.targetSection.hidden = false;
        dom.targetTableBody.innerHTML = "";

        for (let percent = 1; percent <= 10; percent += 1) {
            const targets = calculateTargets(price, percent);
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${percent}%</td>
                <td class="buy-text">${getCurrencySymbol()}${formatPrice(targets.buy)}</td>
                <td class="sell-text">${getCurrencySymbol()}${formatPrice(targets.sell)}</td>
                <td>
                    <button class="table-action" type="button" data-percent="${percent}">
                        저장
                    </button>
                </td>
            `;

            dom.targetTableBody.appendChild(tr);
        }
    }

    function saveTarget(percent) {
        const price = parseInput(dom.basePrice.value);

        if (price <= 0) return;

        const targets = calculateTargets(price, percent);

        addHistory({
            id: Date.now(),
            time: new Date().toLocaleTimeString("ko-KR", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit"
            }),
            price,
            pct: percent,
            buy: formatPrice(targets.buy),
            sell: formatPrice(targets.sell),
            currency: state.currency
        });

        dom.basePrice.focus();
        dom.basePrice.select();
    }

    function renderHistory() {
        const history = loadHistory();

        if (history.length === 0) {
            dom.historyBody.innerHTML = `
                <tr>
                    <td colspan="6" style="color:#64748b;">
                        아직 저장된 기록이 없습니다.
                    </td>
                </tr>
            `;
            return;
        }

        dom.historyBody.innerHTML = history.map(record => {
            const currency = record.currency || "USD";
            const symbol = getCurrencySymbol(currency);

            return `
                <tr>
                    <td>${record.time || "-"}</td>
                    <td>${symbol}${formatPrice(record.price, currency)}</td>
                    <td>${record.pct}%</td>
                    <td class="buy-text">${formatHistoryAmount(record.buy, currency)}</td>
                    <td class="sell-text">${formatHistoryAmount(record.sell, currency)}</td>
                    <td>
                        <button class="danger-link" type="button" data-delete-id="${record.id}">
                            삭제
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function deleteHistory(id) {
        const history = loadHistory().filter(record => record.id !== id);

        saveHistory(history);
        renderHistory();
    }

    function clearHistory() {
        if (!confirm("최근 기록을 모두 삭제하시겠습니까?")) return;

        localStorage.removeItem(HISTORY_KEY);
        renderHistory();
    }

    function setCurrency(currency) {
        state.currency = currency;

        dom.currencyButtons.forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.currency === currency
            );
        });

        dom.currentPrice.value = "";
        dom.basePrice.value = "";
        dom.changePercent.value = "";
        dom.currentPrice.dataset.manualDot = "false";
        dom.basePrice.dataset.manualDot = "false";
        renderTargets();
    }

    function toggleSign() {
        state.changeSign *= -1;

        dom.changeSignBtn.textContent = state.changeSign < 0 ? "-" : "+";
        dom.changeSignBtn.classList.toggle("positive", state.changeSign > 0);
    }

    function convertPrice() {
        const currentPrice = parseInput(dom.currentPrice.value);
        const changePercent = Math.abs(parseInput(dom.changePercent.value));

        if (currentPrice <= 0 || changePercent <= 0) {
            alert("현재가와 등락률을 모두 0보다 큰 숫자로 입력해 주세요.");
            return;
        }

        const signedPercent = changePercent * state.changeSign;
        const basePrice = currentPrice / (1 + signedPercent / 100);

        dom.basePrice.value = state.currency === "USD"
            ? basePrice.toFixed(2)
            : String(Math.round(basePrice));

        renderTargets();
        dom.basePrice.focus();
        dom.basePrice.select();
    }

    function bindEvents() {
        dom.currencyButtons.forEach(button => {
            button.addEventListener("click", () => {
                setCurrency(button.dataset.currency);
            });
        });

        dom.changeSignBtn.addEventListener("click", toggleSign);
        dom.convertPriceBtn.addEventListener("click", convertPrice);
        dom.clearHistoryBtn.addEventListener("click", clearHistory);

        [dom.currentPrice, dom.basePrice].forEach(input => {
            input.dataset.manualDot = "false";

            input.addEventListener("input", () => {
                normalizePriceInput(input);
                if (input === dom.basePrice) renderTargets();
            });

            input.addEventListener("keydown", event => {
                handleDecimalKey(event, input);
            });

            input.addEventListener("focus", () => input.select());
        });

        dom.changePercent.addEventListener("input", () => {
            normalizePercentInput(dom.changePercent);
        });

        dom.changePercent.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                convertPrice();
            }
        });

        dom.basePrice.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                renderTargets();
            }
        });

        dom.targetTableBody.addEventListener("click", event => {
            const button = event.target.closest("[data-percent]");

            if (!button) return;

            saveTarget(Number(button.dataset.percent));
        });

        dom.historyBody.addEventListener("click", event => {
            const button = event.target.closest("[data-delete-id]");

            if (!button) return;

            deleteHistory(Number(button.dataset.deleteId));
        });
    }

    function init() {
        SilverSettings.applyTheme(document);
        bindEvents();
        renderHistory();
        renderTargets();
    }

    return {
        init
    };
})();

Calculator.init();
