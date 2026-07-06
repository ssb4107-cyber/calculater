
const frame = document.getElementById("pageFrame");
const menus = document.querySelectorAll(".menu");

const pages = {
    calculator: "pages/calculator.html",
    portfolio: "pages/portfolio.html",
    settings: "pages/settings.html"
};

menus.forEach(menu => {

    menu.addEventListener("click", () => {

        // active 제거
        menus.forEach(m => m.classList.remove("active"));

        // 현재 버튼 활성화
        menu.classList.add("active");

        // 페이지 변경
        const page = menu.dataset.page;

        frame.src = pages[page];

    });

});

function renderStocks() {

    stockList.innerHTML = "";

    stocks.forEach((stock, index) => {

        const div = document.createElement("div");

        div.className = "stock-item";

        if (index === selectedIndex) {
            div.classList.add("active");
        }

        div.textContent = stock.symbol;

        div.onclick = () => {

            selectedIndex = index;

            renderStocks();

            stockTitle.textContent = stock.symbol;

            stockInfo.textContent = stock.name;
            renderPositions();

            stockForm.style.display = "none";
        };

        stockList.appendChild(div);

    });

}

function renderPositions(){

    const positionList=document.getElementById("positionList");
    positionList.innerHTML="";

    const positions=stocks[selectedIndex].positions;

    const openPositions =
    positions.filter(p=>p.status==="OPEN");

    const partialPositions =
    positions.filter(p=>p.status==="PARTIAL");

    const closedPositions =
    positions.filter(p=>p.status==="CLOSED");

    if(positions.length===0){

        positionList.innerHTML="아직 Position이 없습니다.";

        return;

    }

    


    renderPositionGroup("🟢 OPEN", openPositions);
    renderPositionGroup("🟡 PARTIAL", partialPositions);
    renderPositionGroup("⚫ CLOSED", closedPositions);
    

    bindPositionEvents();
    renderDashboard();

}