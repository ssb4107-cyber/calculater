// ===== Portfolio =====

let stocks = JSON.parse(localStorage.getItem("portfolioStocks")) || [

    {
        name:"PAAS",
        symbol:"PAAS",
        memo:"",
        positions:[]
    },

    {
        name:"AG",
        symbol:"AG",
        memo:"",
        positions:[]
    }

];

stocks.forEach(stock=>{

    if(!stock.positions){

        stock.positions=[];

    }

});

let selectedIndex = 0;

const stockList = document.getElementById("stockList");
const stockTitle = document.getElementById("stockTitle");
const stockInfo = document.getElementById("stockInfo");

const stockForm = document.getElementById("stockForm");

const stockName = document.getElementById("stockName");
const stockSymbol = document.getElementById("stockSymbol");
const stockMemo = document.getElementById("stockMemo");

function saveStocks() {
    
    localStorage.setItem("portfolioStocks", JSON.stringify(stocks));
}

function renderPositions(){

    const positionList=document.getElementById("positionList");

    const positions=stocks[selectedIndex].positions;

    const openPositions = positions.filter(p => p.remainQty === p.buyQty);

    const partialPositions = positions.filter(
        p => p.remainQty > 0 && p.remainQty < p.buyQty
    );

    const closedPositions = positions.filter(
        p => p.remainQty === 0
    );

    if(positions.length===0){

        positionList.innerHTML="아직 Position이 없습니다.";

        return;

    }

    


    renderPositionGroup("🟢 OPEN", openPositions);
    renderPositionGroup("🟡 PARTIAL", partialPositions);
    renderPositionGroup("⚫ CLOSED", closedPositions);
    

    bindPositionEvents();

}

function renderPositionGroup(title, list){

    const positionList = document.getElementById("positionList");

    positionList.insertAdjacentHTML("beforeend",`
        <h3 style="margin:20px 0 10px;">
            ${title}
        </h3>
    `);

    if(list.length===0){

        positionList.insertAdjacentHTML("beforeend",`
            <div style="margin-bottom:15px;color:#888;">
                없음
            </div>
        `);

        return;
    }

    list
        .sort((a,b)=>b.buyPrice-a.buyPrice)
        .forEach(position=>{

            positionList.insertAdjacentHTML("beforeend",`

            <div class="position-card">

                <div class="position-title">

                    ${position.buyPrice.toFixed(2)}$

                </div>

                <div>
                    현재보유 : ${position.remainQty}주
                </div>

                <div>
                    최초매수 : ${position.buyQty}주
                </div>

                <div>
                    매도수량 : ${position.buyQty-position.remainQty}주
                </div>

                <div>

                    진행률 :
                    ${Math.round((position.remainQty/position.buyQty)*100)}%

                </div>

                <div style="margin-top:6px;">

                <div style="
                height:8px;
                background:#ddd;
                border-radius:5px;
                overflow:hidden;
                ">

                <div style="
                width:${Math.round((position.remainQty/position.buyQty)*100)}%;
                height:100%;
                background:#22c55e;
                ">
                </div>

                </div>

                </div>

                <div>
                    날짜 : ${position.buyDate}
                </div>

                <div>
                    메모 : ${position.memo || "-"}
                </div>

                <br>

                <button class="toggleBtn"
                        data-id="${position.id}">
                    ▶ Position 열기
                </button>

                <div
                    class="tradeArea"
                    id="trade-${position.id}"
                    style="display:none;margin-top:15px;">

                    <button
                        class="sellBtn"
                        data-id="${position.id}">
                        매도
                    </button>

                    <hr>

                    <div class="tradeHistory">

                        ${
                            position.trades.length===0
                            ?
                            "거래내역이 없습니다."
                            :
                            position.trades.map(trade=>`

                                <div class="trade-item">

                                    📅 ${trade.date.substring(0,10)}<br>
                                    💰 ${trade.price.toFixed(2)}$<br>
                                    📦 ${trade.qty}주

                                </div>

                                <hr>

                            `).join("")
                        }

                    </div>

                </div>

            </div>

            `);

        });

}

function bindPositionEvents(){

    document.querySelectorAll(".toggleBtn").forEach(btn=>{

        btn.onclick=()=>{

            const area=document.getElementById("trade-"+btn.dataset.id);

            if(!area) return;

            if(area.style.display==="none"){

                area.style.display="block";
                btn.textContent="▼ Position 닫기";

            }else{

                area.style.display="none";
                btn.textContent="▶ Position 열기";

            }

        };

    });

    document.querySelectorAll(".sellBtn").forEach(btn=>{

        btn.onclick=()=>{

            const id=Number(btn.dataset.id);

            const position=stocks[selectedIndex].positions.find(p=>p.id===id);

            if(!position) return;

            const sellPrice=Number(prompt("매도가"));

            if(!sellPrice) return;

            const sellQty=Number(prompt("매도수량"));

            if(!sellQty) return;

            if(sellQty>position.remainQty){

                alert("남은 수량보다 많이 매도할 수 없습니다.");
                return;

            }

            position.trades.push({

                type:"SELL",
                price:sellPrice,
                qty:sellQty,
                date:new Date().toISOString()

            });

            position.remainQty-=sellQty;

            saveStocks();
            renderPositions();

        };

    });

}

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

document.getElementById("addStockBtn").onclick = () => {

    stockTitle.textContent = "새 종목";

    stockInfo.textContent = "종목 정보를 입력하세요.";

    stockForm.style.display = "block";

};

document.getElementById("saveStockBtn").onclick = () => {

    if (stockSymbol.value.trim() === "") {
        alert("심볼을 입력하세요.");
        return;
    }

    stocks.push({
    name: stockName.value.trim(),
    symbol: stockSymbol.value.trim().toUpperCase(),
    memo: stockMemo.value.trim(),
    positions:[]
});

    selectedIndex = stocks.length - 1;

    saveStocks();
    renderPositions();

    renderStocks();

    stockTitle.textContent = stocks[selectedIndex].symbol;
    stockInfo.textContent = stocks[selectedIndex].name;

    stockForm.style.display = "none";

    stockName.value = "";
    stockSymbol.value = "";
    stockMemo.value = "";

};

renderStocks();

stockTitle.textContent = stocks[selectedIndex].symbol;
stockInfo.textContent = stocks[selectedIndex].name;
renderPositions();

const positionList=document.getElementById("positionList");

const positionForm=document.getElementById("positionForm");


document.getElementById("addPositionBtn").onclick=()=>{

    positionForm.style.display="block";

};

document.getElementById("savePositionBtn").onclick=()=>{

    const price=Number(document.getElementById("buyPrice").value);

    const qty=Number(document.getElementById("buyQty").value);

    const date=document.getElementById("buyDate").value;

    const memo=document.getElementById("buyMemo").value;

    if(!price || !qty){

        alert("매수가와 수량을 입력하세요.");

        return;

    }

    const position={

        id:Date.now(),

        buyPrice:price,

        buyQty:qty,

        remainQty:qty,

        buyDate:date,

        memo:memo,

        trades:[]

    };

    stocks[selectedIndex].positions.push(position);

    saveStocks();
    renderPositions();

    console.log(stocks[selectedIndex].positions);

    alert("Position 저장 완료");

    positionForm.style.display="none";
    

};