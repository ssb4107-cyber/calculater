function saveStocks() {
    
    localStorage.setItem("portfolioStocks", JSON.stringify(stocks));
}

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

