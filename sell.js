// sell.js — 背包与出售逻辑（纯原生JS，无依赖）

(function (global) {
  const RARITY_MULT = { '普通':1.0, '罕见':1.5, '稀有':2.2, '史诗':3.5, '传奇':5.0 };

  let coins = 0;
  let inventory = [];
  let els = { coins:null, list:null, empty:null, sellCommonsBtn:null };

  // 读取/保存
  function load() {
    coins = Number(localStorage.getItem('coins') || 0);
    try { inventory = JSON.parse(localStorage.getItem('inventory') || '[]'); }
    catch { inventory = []; }
  }
  function save() {
    localStorage.setItem('coins', String(coins));
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }

  // 价格
  function price(it) {
    const mul = RARITY_MULT[it.rarity] || 1;
    return Math.max(1, Math.floor(it.baseValue * mul * (1 + (it.level - 1) * 0.25)));
  }

  // 渲染
  function render() {
    if (els.coins) els.coins.textContent = String(coins);

    if (!els.list || !els.empty) return;
    els.list.innerHTML = '';

    if (inventory.length === 0) {
      els.empty.style.display = '';
      return;
    }
    els.empty.style.display = 'none';

    inventory.forEach((it, idx) => {
      const li = document.createElement('li');
      li.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:#111827;border-radius:8px;padding:8px 12px;';

      const info = document.createElement('div');
      info.style.fontSize = '12px';
      info.innerHTML = `
        <div>${it.name} <span style="opacity:.7">Lv.${it.level} · ${it.rarity}</span></div>
        <div style="opacity:.7">数量：${it.qty || 1} ｜ 单价：${price(it)} 金币</div>
      `;

      const btn = document.createElement('button');
      btn.textContent = `出售（+${price(it)}）`;
      btn.style.cssText = 'padding:6px 10px;border-radius:6px;background:#2563eb;color:#e5e7eb;font-size:12px;';
      btn.onclick = () => sellOne(idx);

      li.appendChild(info);
      li.appendChild(btn);
      els.list.appendChild(li);
    });
  }

  // 核心操作
  function addToInventory(item) {
    const i = inventory.findIndex(x => x.id === item.id && x.level === item.level && x.rarity === item.rarity);
    if (i >= 0) {
      inventory[i].qty = (inventory[i].qty || 1) + (item.qty || 1);
    } else {
      inventory.push({ ...item, qty: item.qty || 1 });
    }
    save(); render();
  }

  function sellOne(i) {
    const it = inventory[i]; if (!it) return;
    coins += price(it);
    if ((it.qty || 1) > 1) it.qty -= 1;
    else inventory.splice(i, 1);
    save(); render();
  }

  function sellAllCommons() {
    let gain = 0;
    const keep = [];
    for (const it of inventory) {
      if (it.rarity === '普通') {
        gain += price(it) * (it.qty || 1);
      } else {
        keep.push(it);
      }
    }
    inventory = keep;
    coins += gain;
    save(); render();
  }

  // 初始化 UI 绑定
  function initUI({ coinsElId, listElId, emptyElId, sellCommonsBtnId }) {
    load();
    els.coins = document.getElementById(coinsElId || 'coins-value');
    els.list = document.getElementById(listElId || 'bag-list');
    els.empty = document.getElementById(emptyElId || 'bag-empty');
    els.sellCommonsBtn = document.getElementById(sellCommonsBtnId || 'btn-sell-commons');

    if (els.sellCommonsBtn) els.sellCommonsBtn.onclick = sellAllCommons;
    render();
  }

  // 暴露到全局
  global.SELL = {
    initUI,
    addToInventory,
    sellOne,
    sellAllCommons,
    price,
  };
})(window);
