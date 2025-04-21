// ==UserScript==
// @name         mooket
// @namespace    http://tampermonkey.net/
// @version      20250419.1.7
// @description  银河奶牛历史价格（包含强化物品）history(enhancement included) price for milkywayidle
// @author       IOMisaka
// @match        https://www.milkywayidle.com/*
// @match        https://test.milkywayidle.com/*
// @icon         https://www.milkywayidle.com/favicon.svg
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js
// @run-at       document-start
// @license MIT
// ==/UserScript==

(function () {
  'use strict';
  let injectSpace = "mwi";//use window.mwi to access the injected object
  if (window[injectSpace]) return;//已经注入
  let mwi = {//供外部调用的接口
    version: "0.1.5",//版本号，未改动原有接口只更新最后一个版本号，更改了接口会更改次版本号，主版本暂时不更新，等稳定之后再考虑主版本号更新
    MWICoreInitialized: false,//是否初始化完成，完成会还会通过window发送一个自定义事件 MWICoreInitialized

    /*一些可以直接用的游戏数据，欢迎大家一起来整理
    game.state.levelExperienceTable //经验表
    game.state.skillingActionTypeBuffsDict },
    game.state.characterActions //[0]是当前正在执行的动作，其余是队列中的动作
    */
    game: null,//注入游戏对象，可以直接访问游戏中的大量数据和方法以及消息事件等
    lang: null,//语言翻译, 例如中文物品lang.zh.translation.itemNames['/items/coin']
    buffCalculator: null,//注入buff计算对象buffCalculator.mergeBuffs()合并buffs，计算加成效果等
    alchemyCalculator: null,//注入炼金计算对象


    /* marketJson兼容接口 */
    get marketJson() {
      return this.MWICoreInitialized && new Proxy(this.coreMarket, {
        get(coreMarket, prop) {
          if (prop === "market") {
            return new Proxy(coreMarket, {
              get(coreMarket, itemHridOrName) {
                return coreMarket.getItemPrice(itemHridOrName);
              }
            });
          }
          return null;
        }

      });
    },
    coreMarket: null,//coreMarket.marketData 格式{"/items/apple_yogurt:0":{ask,bid,time}}
    itemNameToHridDict: null,//物品名称反查表
    ensureItemHrid: function (itemHridOrName) {
      let itemHrid = this.itemNameToHridDict[itemHridOrName];
      if (itemHrid) return itemHrid;
      if (itemHridOrName?.startsWith("/items/") && this?.game?.state?.itemDetailDict) return itemHridOrName;
      return null;
    },//各种名字转itemHrid，找不到返回原itemHrid或者null
    hookCallback: hookCallback,//hook回调，用于hook游戏事件等 例如聊天消息mwi.hookCallback(mwi.game, "handleMessageChatMessageReceived", (_,obj)=>{console.log(obj)})
    fetchWithTimeout: fetchWithTimeout,//带超时的fetch
  };
  window[injectSpace] = mwi;

  async function patchScript(node) {
    try {
      const scriptUrl = node.src;
      node.remove();
      const response = await fetch(scriptUrl);
      if (!response.ok) throw new Error(`Failed to fetch script: ${response.status}`);

      let sourceCode = await response.text();

      // Define injection points as configurable patterns
      const injectionPoints = [
        {
          pattern: "Ca.a.use",
          replacement: `window.${injectSpace}.lang=Oa;Ca.a.use`,
          description: "注入语言翻译对象"
        },
        {
          pattern: "class lp extends s.a.Component{constructor(e){var t;super(e),t=this,",
          replacement: `class lp extends s.a.Component{constructor(e){var t;super(e),t=this,window.${injectSpace}.game=this,`,
          description: "注入游戏对象"

        },
        {
          pattern: "var Q=W;",
          replacement: `window.${injectSpace}.buffCalculator=W;var Q=W;`,
          description: "注入buff计算对象"
        },
        {
          pattern: "class Dn",
          replacement: `window.${injectSpace}.alchemyCalculator=Mn;class Dn`,
          description: "注入炼金计算对象"
        },
        {
          pattern: "var z=q;",
          replacement: `window.${injectSpace}.actionManager=q;var z=q;`,
          description: "注入动作管理对象"
        }
      ];

      injectionPoints.forEach(({ pattern, replacement, description }) => {
        if (sourceCode.includes(pattern)) {
          sourceCode = sourceCode.replace(pattern, replacement);
          console.info(`MWICore injecting: ${description}`);
        } else {
          console.warn(`MWICore injecting failed: ${description}`);
        }
      });

      const newNode = document.createElement('script');
      newNode.textContent = sourceCode;
      document.body.appendChild(newNode);
      console.info('MWICore patched successfully.')
    } catch (error) {
      console.error('MWICore patching failed:', error);
    }
  }
  new MutationObserver((mutationsList, obs) => {
    mutationsList.forEach((mutationRecord) => {
      for (const node of mutationRecord.addedNodes) {
        if (node.src) {
          if (node.src.search(/.*main\..*\.chunk.js/) === 0) {
            obs.disconnect();
            patchScript(node);
          }
        }
      }
    });
  }).observe(document, { childList: true, subtree: true });

  /**
   * Hook回调函数并添加后处理
   * @param {Object} targetObj 目标对象
   * @param {string} callbackProp 回调属性名
   * @param {Function} handler 后处理函数
   */
  function hookCallback(targetObj, callbackProp, handler) {
    const originalCallback = targetObj[callbackProp];

    if (!originalCallback) {
      throw new Error(`Callback ${callbackProp} does not exist`);
    }

    targetObj[callbackProp] = function (...args) {
      const result = originalCallback.apply(this, args);

      // 异步处理
      if (result && typeof result.then === 'function') {
        return result.then(res => {
          handler(res, ...args);
          return res;
        });
      }

      // 同步处理
      handler(result, ...args);
      return result;
    };

    // 返回取消Hook的方法
    return () => {
      targetObj[callbackProp] = originalCallback;
    };
  }
  /**
   * 带超时功能的fetch封装
   * @param {string} url - 请求URL
   * @param {object} options - fetch选项
   * @param {number} timeout - 超时时间(毫秒)，默认10秒
   * @returns {Promise} - 返回fetch的Promise
   */
  function fetchWithTimeout(url, options = {}, timeout = 10000) {
    // 创建AbortController实例
    const controller = new AbortController();
    const { signal } = controller;

    // 设置超时计时器
    const timeoutId = setTimeout(() => {
      controller.abort(new Error(`请求超时: ${timeout}ms`));
    }, timeout);

    // 合并选项，添加signal
    const fetchOptions = {
      ...options,
      signal
    };

    // 发起fetch请求
    return fetch(url, fetchOptions)
      .then(response => {
        // 清除超时计时器
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        return response;
      })
      .catch(error => {
        // 清除超时计时器
        clearTimeout(timeoutId);

        // 如果是中止错误，重新抛出超时错误
        if (error.name === 'AbortError') {
          throw new Error(`请求超时: ${timeout}ms`);
        }
        throw error;
      });
  }
  class ReconnectWebSocket {
    constructor(url, options = {}) {
      this.url = url; // WebSocket 服务器地址
      this.reconnectInterval = options.reconnectInterval || 10000; // 重连间隔（默认 5 秒）
      this.heartbeatInterval = options.heartbeatInterval || 60000; // 心跳间隔（默认 60 秒）
      this.maxReconnectAttempts = options.maxReconnectAttempts || 9999999; // 最大重连次数
      this.reconnectAttempts = 0; // 当前重连次数
      this.ws = null; // WebSocket 实例
      this.heartbeatTimer = null; // 心跳定时器
      this.isManualClose = false; // 是否手动关闭连接

      // 绑定事件处理器
      this.onOpen = options.onOpen || (() => { });
      this.onMessage = options.onMessage || (() => { });
      this.onClose = options.onClose || (() => { });
      this.onError = options.onError || (() => { });

      this.connect();
    }

    // 连接 WebSocket
    connect() {
      this.ws = new WebSocket(this.url);

      // WebSocket 打开事件
      this.ws.onopen = () => {
        console.log('WebMooket connected');
        this.reconnectAttempts = 0; // 重置重连次数
        this.startHeartbeat(); // 启动心跳
        this.onOpen();
      };

      // WebSocket 消息事件
      this.ws.onmessage = (event) => {
        this.onMessage(event.data);
      };

      // WebSocket 关闭事件
      this.ws.onclose = () => {
        console.log('WebMooket disconnected');
        this.stopHeartbeat(); // 停止心跳
        this.onClose();

        if (!this.isManualClose) {
          this.reconnect();
        }
      };

      // WebSocket 错误事件
      this.ws.onerror = (error) => {
        console.error('WebMooket error:', error);
        this.onError(error);
      };
    }

    // 启动心跳
    startHeartbeat() {
      this.heartbeatTimer = setInterval(() => {
        if (this.ws.readyState === WebSocket.OPEN) {
          //this.ws.send("ping");
        }
      }, this.heartbeatInterval);
    }

    // 停止心跳
    stopHeartbeat() {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
    }

    // 自动重连
    reconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`Reconnecting in ${this.reconnectInterval / 1000} seconds...`);
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, this.reconnectInterval);
      } else {
        console.error('Max reconnection attempts reached');
      }
    }

    // 发送消息
    send(data) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(data);
      } else {
        console.error('WebMooket is not open');
      }
    }

    // 手动关闭连接
    close() {
      this.isManualClose = true;
      this.ws.close();
    }
  }
  /*实时市场模块*/
  const HOST = "https://mooket.qi-e.top";
  const MWIAPI_URL = "https://raw.githubusercontent.com/holychikenz/MWIApi/main/milkyapi.json";

  class CoreMarket {
    marketData = {};//市场数据，带强化等级，存储格式{"/items/apple_yogurt:0":{ask,bid,time}}
    fetchTimeDict = {};//记录上次API请求时间，防止频繁请求
    ttl = 300;//缓存时间，单位秒
    trade_ws = null;
    constructor() {
      //core data
      let marketDataStr = localStorage.getItem("MWICore_marketData") || "{}";
      this.marketData = JSON.parse(marketDataStr);
      
      if(mwi.game?.state?.character?.gameMode==="standard"){//标准模式才连接ws服务器，铁牛模式不连接ws服务器
        this.trade_ws = new ReconnectWebSocket(`${HOST}/market/ws`);
      }

      //mwiapi data
      let mwiapiJsonStr = localStorage.getItem("MWIAPI_JSON") || localStorage.getItem("MWITools_marketAPI_json");
      let mwiapiObj = null;
      if (mwiapiJsonStr) {
        mwiapiObj = JSON.parse(mwiapiJsonStr);
        this.mergeMWIData(mwiapiObj);
      }
      if (!mwiapiObj || Date.now() / 1000 - mwiapiObj.time > 600) {//超过10分才更新
        fetch(MWIAPI_URL).then(res => {
          res.text().then(mwiapiJsonStr => {
            mwiapiObj = JSON.parse(mwiapiJsonStr);
            this.mergeMWIData(mwiapiObj);
            //更新本地缓存数据
            localStorage.setItem("MWIAPI_JSON", mwiapiJsonStr);//更新本地缓存数据
            console.info("MWIAPI_JSON updated:", new Date(mwiapiObj.time * 1000).toLocaleString());
          })
        });
      }
      (this.trade_ws??{}).onMessage = (data) => {
        if (data === "ping") { return; }//心跳包，忽略
        let obj = JSON.parse(data);
        if (obj && obj.type === "marketItemOrderBooksUpdated") {
          this.handleMessageMarketItemOrderBooksUpdated(obj, false);//收到市场服务器数据，不上传
        } else if (obj && obj.type === "ItemPrice") {
          this.processItemPrice(obj);
        }


      }
      //市场数据更新
      hookCallback(mwi.game, "handleMessageMarketItemOrderBooksUpdated", (res, obj) => this.handleMessageMarketItemOrderBooksUpdated(obj, true));
      setInterval(() => { this.save(); }, 1000 * 600);//十分钟保存一次
    }
    handleMessageMarketItemOrderBooksUpdated(obj, upload = false) {
      //更新本地,游戏数据不带时间戳，市场服务器数据带时间戳
      let timestamp = obj.time || parseInt(Date.now() / 1000);
      let itemHrid = obj.marketItemOrderBooks.itemHrid;
      obj.marketItemOrderBooks?.orderBooks?.forEach((item, enhancementLevel) => {
        let bid = item.bids?.length > 0 ? item.bids[0].price : -1;
        let ask = item.asks?.length > 0 ? item.asks[0].price : -1;
        this.updateItem(itemHrid + ":" + enhancementLevel, { bid: bid, ask: ask, time: timestamp });
      });
      obj.time = timestamp;//添加时间戳
      //上报数据
      if (this.trade_ws) {//标准模式走ws
        if (!upload) return;//只在game收到消息的时候上报
        this.trade_ws.send(JSON.stringify(obj));//ws上报
      } else {//铁牛上报
        fetchWithTimeout(`${HOST}/market/upload/order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(obj)
        });
      }
    }
    /**
     * 合并MWIAPI数据，只包含0级物品
     *
     * @param obj 包含市场数据的对象
     */
    mergeMWIData(obj) {
      Object.entries(obj.market).forEach(([itemName, price]) => {
        let itemHrid = mwi.ensureItemHrid(itemName);
        if (itemHrid) this.updateItem(itemHrid + ":" + 0, { bid: price.bid, ask: price.ask, time: obj.time }, false);//本地更新
      });
      this.save();
    }
    mergeCoreDataBeforeSave() {
      let obj = JSON.parse(localStorage.getItem("MWICore_marketData") || "{}");
      Object.entries(obj).forEach(([itemHridLevel, priceObj]) => {
        this.updateItem(itemHridLevel, priceObj, false);//本地更新
      });
      //不保存，只合并
    }
    save() {//保存到localStorage
      this.mergeCoreDataBeforeSave();//从其他角色合并保存的数据
      localStorage.setItem("MWICore_marketData", JSON.stringify(this.marketData));
    }

    /**
     * 部分特殊物品的价格
     * 例如金币固定1，牛铃固定为牛铃袋/10的价格
     * @param {string} itemHrid - 物品hrid
     * @returns {Price|null} - 返回对应商品的价格对象，如果没有则null
     */
    getSpecialPrice(itemHrid) {
      switch (itemHrid) {
        case "/items/coin":
          return { bid: 1, ask: 1, time: Date.now() / 1000 };
        case "/items/cowbell": {
          let cowbells = this.getItemPrice("/items/bag_of_10_cowbells");
          return cowbells && { bid: cowbells.bid / 10, ask: cowbells.ask / 10, time: cowbells.time };
        }
        default:
          return null;
      }
    }
    /**
     * 获取商品的价格
     *
     * @param {string} itemHridOrName 商品HRID或名称
     * @param {number} [enhancementLevel=0] 装备强化等级，普通商品默认为0
     * @param {boolean} [peek=false] 是否只查看本地数据，不请求服务器数据
     * @returns {number|null} 返回商品的价格，如果商品不存在或无法获取价格则返回null
     */
    getItemPrice(itemHridOrName, enhancementLevel = 0, peek = false) {
      let itemHrid = mwi.ensureItemHrid(itemHridOrName);
      if (!itemHrid) return null;
      let specialPrice = this.getSpecialPrice(itemHrid);
      if (specialPrice) return specialPrice;
      let itemHridLevel = itemHrid + ":" + enhancementLevel;

      let priceObj = this.marketData[itemHridLevel];
      if (peek) return priceObj;

      if (Date.now() / 1000 - this.fetchTimeDict[itemHridLevel] < this.ttl) return priceObj;//1分钟内直接返回本地数据，防止频繁请求服务器
      this.fetchTimeDict[itemHridLevel] = Date.now() / 1000;
      this.trade_ws?.send(JSON.stringify({ type: "GetItemPrice", name: itemHrid, level: enhancementLevel }));
      return priceObj;
    }
    processItemPrice(resObj) {
      let itemHridLevel = resObj.name + ":" + resObj.level;
      let priceObj = { bid: resObj.bid, ask: resObj.ask, time: resObj.time };
      if (resObj.ttl) this.ttl = resObj.ttl;//更新ttl
      this.updateItem(itemHridLevel, priceObj);
    }
    updateItem(itemHridLevel, priceObj, isFetch = true) {
      let localItem = this.marketData[itemHridLevel];
      if (isFetch) this.fetchTimeDict[itemHridLevel] = Date.now() / 1000;//fetch时间戳
      if (!localItem || localItem.time < priceObj.time) {//服务器数据更新则更新本地数据

        let risePercent = 0;
        if (localItem) {
          let oriPrice = (localItem.ask + localItem.bid);
          let newPrice = (priceObj.ask + priceObj.bid);
          if (oriPrice != 0) risePercent = newPrice / oriPrice - 1;
        }
        this.marketData[itemHridLevel] = { rise: risePercent, ask: priceObj.ask, bid: priceObj.bid, time: priceObj.time };//更新本地数据
        dispatchEvent(new CustomEvent("MWICoreItemPriceUpdated"), priceObj);//触发事件
      }
    }
    resetRise() {
      Object.entries(this.marketData).forEach(([k, v]) => {
        v.rise = 0;
      });
    }
    save() {
      localStorage.setItem("MWICore_marketData", JSON.stringify(this.marketData));
    }
  }

  function init() {
    mwi.itemNameToHridDict = {};
    Object.entries(mwi.lang.en.translation.itemNames).forEach(([k, v]) => { mwi.itemNameToHridDict[v] = k });
    Object.entries(mwi.lang.zh.translation.itemNames).forEach(([k, v]) => { mwi.itemNameToHridDict[v] = k });
    mwi.coreMarket = new CoreMarket();

    mwi.MWICoreInitialized = true;
    window.dispatchEvent(new CustomEvent("MWICoreInitialized"))
    console.info("MWICoreInitialized event dispatched. window.mwi.MWICoreInitialized=true");
  }
  new Promise(resolve => {
    const interval = setInterval(() => {
      if (mwi.game&& mwi.lang&&mwi?.game?.state?.character?.gameMode ) {//等待必须组件加载完毕后再初始化
        clearInterval(interval);
        resolve();
      }
    }, 200);
  }).then(() => {
    init();
    mooket();
  });

  function mooket() {

    window.mwi.hookCallback(window.mwi.game, "handleMessageMarketListingsUpdated", (_, obj) => {
      obj.endMarketListings.forEach(order => {
        if (order.filledQuantity == 0) return;//没有成交的订单不记录
        let key = order.itemHrid + "_" + order.enhancementLevel;

        let tradeItem = trade_history[key] || {}
        if (order.isSell) {
          tradeItem.sell = order.price;
        } else {
          tradeItem.buy = order.price;
        }
        trade_history[key] = tradeItem;
      });
      if (window.mwi?.game?.state?.character?.gameMode === "standard")//只记录标准模式的数据，因为铁牛不能交易
        localStorage.setItem("mooket_trade_history", JSON.stringify(trade_history));//保存挂单数据
    });

    let trade_history = JSON.parse(localStorage.getItem("mooket_trade_history") || "{}");

    let cur_day = 1;
    let curHridName = null;
    let curLevel = 0;
    let curShowItemName = null;
    let chartWidth = 500;
    let chartHeight = 280

    let configStr = localStorage.getItem("mooket_config");
    let config = configStr ? JSON.parse(configStr) : { "dayIndex": 0, "visible": true, "filter": { "bid": true, "ask": true, "mean": true } };
    cur_day = config.day;//读取设置

    window.onresize = function () {
      checkSize();
    };
    function checkSize() {
      if (window.innerWidth < window.innerHeight) {//竖屏，强制设置
        config.w = chartWidth = window.innerWidth * 0.618;
        config.h = chartHeight = chartWidth * 0.618;
      } else {
        chartWidth = 400;
        chartHeight = 250;
      }
    }
    checkSize();

    // 创建容器元素并设置样式和位置
    const container = document.createElement('div');
    container.style.border = "1px solid #ccc"; //边框样式
    container.style.backgroundColor = "#fff";
    container.style.position = "fixed";
    container.style.zIndex = 10000;
    container.style.top = `${Math.max(0, Math.min(config.y || 0, window.innerHeight - 50))}px`; //距离顶部位置
    container.style.left = `${Math.max(0, Math.min(config.x || 0, window.innerWidth - 50))}px`; //距离左侧位置
    container.style.width = `${Math.max(0, Math.min(config.w || chartWidth, window.innerWidth))}px`; //容器宽度
    container.style.height = `${Math.max(0, Math.min(config.h || chartHeight, window.innerHeight))}px`; //容器高度
    container.style.resize = "both";
    container.style.overflow = "auto";
    container.style.display = "none";
    container.style.flexDirection = "column";
    container.style.flex = "1";
    container.style.minHeight = "33px";
    container.style.minWidth = "68px";
    container.style.cursor = "move";
    container.style.userSelect = "none";

    let mouseDragging = false;
    let touchDragging = false;
    let offsetX, offsetY;

    let resizeEndTimer = null;
    container.addEventListener("resize", () => {
      if (resizeEndTimer) clearTimeout(resizeEndTimer);
      resizeEndTimer = setTimeout(save_config, 1000);
    });
    container.addEventListener("mousedown", function (e) {
      if (mouseDragging || touchDragging) return;
      const rect = container.getBoundingClientRect();
      if (container.style.resize === "both" && (e.clientX > rect.right - 10 || e.clientY > rect.bottom - 10)) return;
      mouseDragging = true;
      offsetX = e.clientX - container.offsetLeft;
      offsetY = e.clientY - container.offsetTop;
    });

    document.addEventListener("mousemove", function (e) {
      if (mouseDragging) {
        var newX = e.clientX - offsetX;
        var newY = e.clientY - offsetY;

        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX > window.innerWidth - container.offsetWidth) newX = window.innerWidth - container.offsetWidth;
        if (newY > window.innerHeight - container.offsetHeight) newY = window.innerHeight - container.offsetHeight;

        container.style.left = newX + "px";
        container.style.top = newY + "px";
      }
    });

    document.addEventListener("mouseup", function () {
      if (mouseDragging) {
        mouseDragging = false;
        save_config();
      }
    });

    container.addEventListener("touchstart", function (e) {
      if (mouseDragging || touchDragging) return;
      const rect = container.getBoundingClientRect();
      let touch = e.touches[0];
      if (container.style.resize === "both" && (e.clientX > rect.right - 10 || e.clientY > rect.bottom - 10)) return;
      touchDragging = true;
      offsetX = touch.clientX - container.offsetLeft;
      offsetY = touch.clientY - container.offsetTop;
    });

    document.addEventListener("touchmove", function (e) {
      if (touchDragging) {
        let touch = e.touches[0];
        var newX = touch.clientX - offsetX;
        var newY = touch.clientY - offsetY;

        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX > window.innerWidth - container.offsetWidth) newX = window.innerWidth - container.offsetWidth;
        if (newY > window.innerHeight - container.offsetHeight) newY = window.innerHeight - container.offsetHeight;

        container.style.left = newX + "px";
        container.style.top = newY + "px";
      }
    });

    document.addEventListener("touchend", function () {
      if (touchDragging) {
        touchDragging = false;
        save_config();
      }
    });
    document.body.appendChild(container);

    const ctx = document.createElement('canvas');
    ctx.id = "myChart";
    container.appendChild(ctx);



    // 创建下拉菜单并设置样式和位置
    let wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.top = '5px';
    wrapper.style.right = '16px';
    wrapper.style.fontSize = '14px';

    //wrapper.style.backgroundColor = '#fff';
    wrapper.style.flexShrink = 0;
    container.appendChild(wrapper);

    const days = [1, 3, 7, 14, 30, 180, 360];
    const dayTitle = ['1天', '3天', '1周', '2周', '1月', '半年', '一年'];
    cur_day = days[config.dayIndex];

    let select = document.createElement('select');
    select.style.cursor = 'pointer';
    select.style.verticalAlign = 'middle';
    select.onchange = function () {
      config.dayIndex = days.indexOf(parseInt(this.value));
      if (curHridName) requestItemPrice(curHridName, this.value, curLevel);
      save_config();
    };

    for (let i = 0; i < days.length; i++) {
      let option = document.createElement('option');
      option.value = days[i];
      option.text = dayTitle[i];
      if (i === config.dayIndex) option.selected = true;
      select.appendChild(option);
    }

    wrapper.appendChild(select);

    // 创建一个容器元素并设置样式和位置
    const leftContainer = document.createElement('div');
    leftContainer.style.padding = '2px'
    leftContainer.style.display = 'flex';
    leftContainer.style.flexDirection = 'row';
    leftContainer.style.alignItems = 'center'
    container.appendChild(leftContainer);

    //添加一个btn隐藏canvas和wrapper
    let btn_close = document.createElement('input');
    btn_close.type = 'button';
    btn_close.value = '📈隐藏';
    btn_close.style.margin = 0;
    btn_close.style.cursor = 'pointer';

    leftContainer.appendChild(btn_close);


    //一个固定的文本显示买入卖出历史价格
    let price_info = document.createElement('div');

    price_info.style.fontSize = '14px';
    price_info.title = "我的最近买/卖价格"
    price_info.style.width = "max-content";
    price_info.style.whiteSpace = "nowrap";
    price_info.style.lineHeight = '25px';
    price_info.style.display = 'none';
    price_info.style.marginLeft = '5px';

    let buy_price = document.createElement('span');
    let sell_price = document.createElement('span');
    price_info.appendChild(buy_price);
    price_info.appendChild(sell_price);
    buy_price.style.color = 'red';
    sell_price.style.color = 'green';

    leftContainer.appendChild(price_info);

    let lastWidth;
    let lastHeight;
    btn_close.onclick = toggle;
    function toggle() {
      if (wrapper.style.display === 'none') {
        wrapper.style.display = ctx.style.display = 'block';
        container.style.resize = "both";
        btn_close.value = '📈隐藏';
        leftContainer.style.position = 'absolute'
        leftContainer.style.top = '1px';
        leftContainer.style.left = '1px';
        container.style.width = lastWidth;
        container.style.height = lastHeight;
        config.visible = true;
        save_config();
      } else {
        lastWidth = container.style.width;
        lastHeight = container.style.height;
        wrapper.style.display = ctx.style.display = 'none';
        container.style.resize = "none";
        container.style.width = "auto";
        container.style.height = "auto";


        btn_close.value = '📈显示';
        leftContainer.style.position = 'relative'
        leftContainer.style.top = 0;
        leftContainer.style.left = 0;

        config.visible = false;
        save_config();
      }
    };

    let chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: '市场',
          data: [],
          backgroundColor: 'rgba(255,99,132,0.2)',
          borderColor: 'rgba(255,99,132,1)',
          borderWidth: 1
        }]
      },
      options: {
        onClick: save_config,
        responsive: true,
        maintainAspectRatio: false,
        pointRadius: 0,
        pointHitRadius: 20,
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              // 自定义刻度标签格式化
              callback: showNumber
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: "",
          }
        }
      }
    });

    function requestItemPrice(itemHridName, day = 1, level = 0) {
      if (!itemHridName) return;
      if (curHridName === itemHridName && curLevel === level && cur_day === day) return;//防止重复请求

      curHridName = itemHridName;
      curLevel = level;
      cur_day = day;

      curShowItemName = localStorage.getItem("i18nextLng")?.startsWith("zh") ?
        window.mwi.lang.zh.translation.itemNames[itemHridName] : window.mwi.lang.en.translation.itemNames[itemHridName];
      curShowItemName += curLevel > 0 ? "+" + curLevel : "";

      let time = day * 3600 * 24;
      //const HOST = "https://mooket.qi-e.top";上面定义了
      if (curLevel > 0 || day < 2) {
        const params = new URLSearchParams();
        params.append("name", curHridName);
        params.append("level", curLevel);
        params.append("time", time);
        fetch(`${HOST}/market/item/history?${params}`).then(res => {
          res.json().then(data => updateChart(data, cur_day));
        })
      }//新api
      else {//旧api
        let itemNameEN = window.mwi.game.state.itemDetailDict[itemHridName].name;
        fetch(`${HOST}/market`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: itemNameEN,
            time: time
          })
        }).then(res => {
          res.json().then(data => updateChart(data, cur_day));
        })
      }
    }

    function formatTime(timestamp, range) {
      const date = new Date(timestamp * 1000);
      const pad = n => n.toString().padStart(2, '0');

      // 获取各时间组件
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const shortYear = date.getFullYear().toString().slice(-2);

      // 根据时间范围选择格式
      switch (parseInt(range)) {
        case 1: // 1天：只显示时间
          return `${hours}:${minutes}`;

        case 3: // 3天：日+时段
          return `${hours}:${minutes}`;

        case 7: // 7天：月/日 + 时段
          return `${day}.${hours}`;
        case 14: // 14天：月/日 + 时段
          return `${day}.${hours}`;
        case 30: // 30天：月/日
          return `${month}/${day}`;

        default: // 180天：年/月
          return `${shortYear}/${month}`;
      }
    }

    function showNumber(num) {
      if (isNaN(num)) return num;
      if (num === 0) return "0"; // 单独处理0的情况

      const absNum = Math.abs(num);

      //num保留一位小数
      if (num < 1) return num.toFixed(2);

      return absNum >= 1e10 ? `${(num / 1e9).toFixed(1)}B` :
        absNum >= 1e7 ? `${(num / 1e6).toFixed(1)}M` :
          absNum >= 1e4 ? `${Math.floor(num / 1e3)}K` :
            `${Math.floor(num)}`;
    }
    //data={'bid':[{time:1,price:1}],'ask':[{time:1,price:1}]}
    function updateChart(data, day) {
      //字段名差异
      data.bid = data.bid || data.bids
      data.ask = data.ask || data.asks;
      //过滤异常元素
      for (let i = data.bid.length - 1; i >= 0; i--) {
        if (data.bid[i].price < 0 && data.ask[i].price < 0) {//都小于0，认为是异常数据，直接删除
          data.bid.splice(i, 1);
          data.ask.splice(i, 1);
        } else {//小于0则设置为0
          data.bid[i].price = Math.max(0, data.bid[i].price);
          data.ask[i].price = Math.max(0, data.ask[i].price);
        }
      }

      //timestamp转日期时间
      //根据day输出不同的时间表示，<3天显示时分，<=7天显示日时，<=30天显示月日，>30天显示年月

      //显示历史价格
      let enhancementLevel = document.querySelector(".MarketplacePanel_infoContainer__2mCnh .Item_enhancementLevel__19g-e")?.textContent.replace("+", "") || "0";
      let tradeName = curHridName + "_" + parseInt(enhancementLevel);
      if (trade_history[tradeName]) {
        let buy = trade_history[tradeName].buy || "无";
        let sell = trade_history[tradeName].sell || "无";
        price_info.style.display = "inline-block";
        let levelStr = enhancementLevel > 0 ? "(+" + enhancementLevel + ")" : "";
        price_info.innerHTML = `<span style="color:red">${showNumber(buy)}</span>/<span style="color:green">${showNumber(sell)}</span>${levelStr}`;
        container.style.minWidth = price_info.clientWidth + 70 + "px";

      } else {
        price_info.style.display = "none";
        container.style.minWidth = "68px";
      }

      let labels = data.bid.map(x => formatTime(x.time, day));

      chart.data.labels = labels;

      let sma = [];
      let sma_size = 6;
      let sma_window = [];
      for (let i = 0; i < data.bid.length; i++) {
        sma_window.push((data.bid[i].price + data.ask[i].price) / 2);
        if (sma_window.length > sma_size) sma_window.shift();
        sma.push(sma_window.reduce((a, b) => a + b, 0) / sma_window.length);
      }
      chart.options.plugins.title.text = curShowItemName
      chart.data.datasets = [
        {
          label: '买入',
          data: data.bid.map(x => x.price),
          borderColor: '#ff3300',
          backgroundColor: '#ff3300',
          borderWidth: 1.5
        },
        {
          label: '卖出',
          data: data.ask.map(x => x.price),
          borderColor: '#00cc00',
          backgroundColor: '#00cc00',
          borderWidth: 1.5
        },
        {
          label: '均线',
          data: sma,
          borderColor: '#ff9900',
          borderWidth: 3,
          tension: 0.5,
          fill: true
        }
      ];
      chart.setDatasetVisibility(0, config.filter.ask);
      chart.setDatasetVisibility(1, config.filter.bid);
      chart.setDatasetVisibility(2, config.filter.mean);

      chart.update()
    }
    function save_config() {

      if (chart && chart.data && chart.data.datasets && chart.data.datasets.length == 3) {
        config.filter.ask = chart.getDatasetMeta(0).visible;
        config.filter.bid = chart.getDatasetMeta(1).visible;
        config.filter.mean = chart.getDatasetMeta(2).visible;
      }
      config.x = Math.max(0, Math.min(container.getBoundingClientRect().x, window.innerWidth - 50));
      config.y = Math.max(0, Math.min(container.getBoundingClientRect().y, window.innerHeight - 50));
      if (container.style.width != "auto") {
        config.w = container.clientWidth;
        config.h = container.clientHeight;
      }

      localStorage.setItem("mooket_config", JSON.stringify(config));
    }
    setInterval(() => {
      if (document.querySelector(".MarketplacePanel_marketplacePanel__21b7o")?.checkVisibility()) {
        container.style.display = "block"
        try {
          let currentItem = document.querySelector(".MarketplacePanel_currentItem__3ercC");
          let level = currentItem?.querySelector(".Item_enhancementLevel__19g-e");
          let itemHrid = mwi.ensureItemHrid(currentItem?.querySelector(".Icon_icon__2LtL_")?.ariaLabel);
          requestItemPrice(itemHrid, cur_day, parseInt(level?.textContent.replace("+", "") || "0"))
        } catch (e) {
          console.log(e)
        }
      } else {
        container.style.display = "none"
      }
    }, 500);
    //setInterval(updateInventoryStatus, 60000);
    toggle();
    let itemUpdateTimer = null;
    addEventListener("MWICoreItemPriceUpdated", () => {
      if (itemUpdateTimer) clearTimeout(itemUpdateTimer);
      itemUpdateTimer = setTimeout(updateInventoryRise, 1000);
    });
    function updateInventoryStatus(priceObj) {
      document.querySelectorAll(".Inventory_items__6SXv0 .Item_item__2De2O").forEach(x => {

        let level = parseInt(x?.querySelector(".Item_enhancementLevel__19g-e")?.textContent.replace("+", "") || "0");
        let itemHrid = mwi.ensureItemHrid(x?.querySelector(".Icon_icon__2LtL_")?.ariaLabel);
        if (itemHrid) {
          let priceObj = mwi.coreMarket.getItemPrice(itemHrid, level, true);
          let now = Date.now() / 1000;
          let elapsed = now - priceObj.time;
          let timeout = 300;
          if (elapsed < timeout) {
            x.style.backgroundColor = `rgba(0,255,0,${(1 - elapsed / timeout) * 0.2})`;
          } else {
            x.style.backgroundColor = `rgba(255,0,0,${Math.min(0.2, ((elapsed - timeout) / 3600) * 0.2)})`;
          }

        }

      });
    }
    function updateInventoryRise(priceObj) {
      document.querySelectorAll(".Inventory_items__6SXv0 .Item_item__2De2O")?.forEach(x => {

        let level = parseInt(x?.querySelector(".Item_enhancementLevel__19g-e")?.textContent.replace("+", "") || "0");
        let itemHrid = mwi.ensureItemHrid(x?.querySelector(".Icon_icon__2LtL_")?.ariaLabel);
        if (itemHrid) {
          let priceObj = mwi.coreMarket.getItemPrice(itemHrid, level, true)
          let rise = priceObj?.rise || 0;
          if (rise < 0) {
            x.style.backgroundColor = `rgba(0,255,0,${Math.min(0.25 * Math.sqrt(Math.abs(rise)), 0.25) + 0.05})`;//绿跌
          } else if (rise > 0) {
            x.style.backgroundColor = `rgba(255,0,0,${Math.min(0.25 * Math.sqrt(Math.abs(rise)), 0.25) + 0.05})`;//红涨
          } else {
            x.style.backgroundColor = "#2c2e45";
          }

        }

      });
    }
    console.info("mooket 初始化完成");
  }
})();