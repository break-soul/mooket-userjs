// ==UserScript==
// @name         mooket
// @namespace    http://tampermonkey.net/
// @version      2025-03-19
// @description  银河奶牛历史价格 show history market data for milkywayidle
// @author       IOMisaka
// @match        https://www.milkywayidle.com/*
// @match        https://test.milkywayidle.com/*
// @connect      mooket.qi-e.top
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js
// @license MIT
// ==/UserScript==


(function () {
  'use strict';
  let initData_itemDetailMap = null;
  if (localStorage.getItem("initClientData")) {
    const obj = JSON.parse(localStorage.getItem("initClientData"));
    initData_itemDetailMap = obj.itemDetailMap;
  }
  function hookWS() {
    const dataProperty = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data");
    const oriGet = dataProperty.get;
    dataProperty.get = hookedGet;
    Object.defineProperty(MessageEvent.prototype, "data", dataProperty);

    function hookedGet() {
      const socket = this.currentTarget;
      if (!(socket instanceof WebSocket)) {
        return oriGet.call(this);
      }
      if (socket.url.indexOf("api.milkywayidle.com/ws") <= -1 && socket.url.indexOf("api-test.milkywayidle.com/ws") <= -1) {
        return oriGet.call(this);
      }
      const message = oriGet.call(this);
      Object.defineProperty(this, "data", { value: message }); // Anti-loop
      return handleMessage(message);
    }
  }
  function handleMessage(message) {
    let obj = JSON.parse(message);
    if (obj && obj.type === "market_item_order_books_updated") {
      requestMarket(obj.marketItemOrderBooks.itemHrid);
    }
    return message;
  }

  hookWS();

  let cur_day = 1;
  let cur_name = null;
  let w = "600px";
  let h = "330px";

  window.onresize = function () {
    checkSize();
  };
  function checkSize() {
    if (window.innerWidth < window.innerHeight) {
      w = "330px";
      h = "600px";
    } else {
      w = "600px";
      h = "330px";
    }
  }
  checkSize();
  // 创建容器元素并设置样式和位置
  const container = document.createElement('div');
  container.style.border = "1px solid #ccc"; //边框样式
  container.style.backgroundColor = "#fff";
  container.style.position = "fixed";
  container.style.zIndex = 10000;
  container.style.top = "50px"; //距离顶部位置
  container.style.left = "50px"; //距离左侧位置
  container.style.width = w; //容器宽度
  container.style.height = h; //容器高度
  container.style.cursor = "move";
  container.addEventListener("mousedown", function (e) {
    let disX = e.clientX - container.offsetLeft;
    let disY = e.clientY - container.offsetTop;
    document.onmousemove = function (e) {
      let x = e.clientX - disX;
      let y = e.clientY - disY;
      container.style.left = x + 'px';
      container.style.top = y + 'px';
    };
    document.onmouseup = function () {
      document.onmousemove = document.onmouseup = null;
    };
  });
  document.body.appendChild(container);

  const ctx = document.createElement('canvas');
  ctx.id = "myChart";
  container.appendChild(ctx);

  // 创建按钮组并设置样式和位置
  let wrapper = document.createElement('div');
  wrapper.style.display = 'inline-block';
  container.appendChild(wrapper);

  const days = [1, 3, 7, 30, 180]
  const dayTitle = ['1天', '3天', '7天', '30天', '半年']
  for (let i = 0; i < 5; i++) {
    let btn = document.createElement('input');
    btn.id = 'chartType' + i;
    btn.type = 'radio';
    btn.name = 'chartType';
    btn.value = days[i];
    btn.style.cursor = 'pointer';
    btn.style.verticalAlign = "middle";
    btn.checked = i == 0;
    btn.onclick = function () { cur_day = this.value; requestMarket(cur_name, cur_day); };

    let label = document.createElement('label');
    label.innerText = dayTitle[i];
    label.style.display = 'inline-block';
    label.style.verticalAlign = 'middle';
    label.style.textAlign = 'center';
    label.htmlFor = btn.id;
    label.style.margin = '1px';
    wrapper.appendChild(btn);
    wrapper.appendChild(label);
  }
  //添加一个btn隐藏canvas和wrapper
  let btn_close = document.createElement('input');
  btn_close.type = 'button';
  btn_close.value = '📈隐藏';
  btn_close.style.textAlign = 'center';
  btn_close.style.display = 'inline';
  btn_close.style.margin = 0;
  btn_close.style.top = '1px';
  btn_close.style.left = '1px';
  btn_close.style.cursor = 'pointer';
  btn_close.style.position = 'absolute';
  btn_close.onclick = function () {
    if (wrapper.style.display === 'none') {
      wrapper.style.display = ctx.style.display = 'block';
      btn_close.value = '📈隐藏';
      container.style.width = w;
      container.style.height = h;
    } else {
      wrapper.style.display = ctx.style.display = 'none';
      container.style.width = "63px";
      container.style.height = "25px";
      btn_close.value = '📈显示';
    }
  };

  container.appendChild(btn_close);


  let chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['一月', '二月', '三月'],
      datasets: [{
        label: '销量',
        data: [12, 19, 3],
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1
      }]
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });

  function requestMarket(name, day = 1) {
    if (initData_itemDetailMap && initData_itemDetailMap[name]) {
      name = initData_itemDetailMap[name].name;
    }

    cur_name = name;
    cur_day = day;

    let time = day * 3600 * 24;
    fetch("https://mooket.qi-e.top/market", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        time: time
      })
    }).then(res => {
      res.json().then(data => updateChart(data, day));
    })
  }
  function formatTime(timestamp, day) {
    let date = new Date(timestamp * 1000);
    if (day <= 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    else if (day <= 3) {
      return date.toLocaleDateString([], { day: 'numeric', hour: '2-digit' });
    } else if (day <= 7) {
      return date.toLocaleDateString([], { day: 'numeric', hour: '2-digit' });
    } else if (day <= 30) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else
      return date.toLocaleDateString([], { year: 'numeric', month: 'short' });
  }

  //data={'bid':[{time:1,price:1}],'ask':[{time:1,price:1}]}
  function updateChart(data, day) {
    //timestamp转日期时间
    //根据day输出不同的时间表示，<3天显示时分，<=7天显示日时，<=30天显示月日，>30天显示年月

    let labels = data.bid.map(x => formatTime(x.time, day));

    chart.data.labels = labels;

    chart.data.datasets = [
      {
        label: '买入',
        data: data.bid.map(x => x.price),
        backgroundColor: '#ff3300',
        borderColor: '#990000',
        borderWidth: 1
      },
      {
        label: '卖出',
        data: data.ask.map(x => x.price),
        backgroundColor: '#00cc00',
        borderColor: '#006600',
        borderWidth: 1
      },
      {
        label: '均价',
        data: data.bid.map(({ price: bidPrice }, index) => {
          const { price: askPrice } = data.ask[index];
          return (bidPrice + askPrice) / 2;
        }),
        backgroundColor: '#ff9900',
        borderColor: '#996600',
        borderWidth: 1
      }
    ];
    chart.update()
  }
  requestMarket('Apple', 1);

})();