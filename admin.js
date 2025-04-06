document.addEventListener('DOMContentLoaded', function() {
  // 請將以下 URL 替換成你的後台 App Script 部署 URL
  // 會員資料功能 (新增會員 & 查詢會員)
  const memberDataUrl = 'https://script.google.com/macros/s/AKfycbwQi3bYG8F_sgSdqysaP3aK6B6C2gsbUyb6wpl55H_ikwAtS4JSdpA4qFByk9pJ_VD5/exec';
  // 點數調整功能
  const adjustPointsUrl = 'https://script.google.com/macros/s/AKfycbwxXd4ZRvBD--eOMEz3S-etWTWX7gGTmF3tyPk6fa8Eo7s4X0sdiJ-4kwnTehZK3KaZ/exec';

  // JSONP 請求輔助函式
  function jsonpRequest(url, callback) {
    const callbackName = 'jsonp_' + Date.now();
    const script = document.createElement('script');
    script.src = url + (url.indexOf('?') === -1 ? '?' : '&') + 'callback=' + callbackName;
    window[callbackName] = function(data) {
      callback(data);
      delete window[callbackName];
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
    document.body.appendChild(script);
  }

  // 功能選擇下拉選單事件
  const actionSelect = document.getElementById('actionSelect');
  actionSelect.addEventListener('change', function() {
    const selectedAction = actionSelect.value;
    // 隱藏所有區塊（只操作新增會員與點數調整區塊）
    document.getElementById('addMemberSection').classList.add('hidden');
    document.getElementById('adjustPointsSection').classList.add('hidden');
    
    if (selectedAction === 'addMember') {
      document.getElementById('addMemberSection').classList.remove('hidden');
    } else if (selectedAction === 'adjustPoints') {
      document.getElementById('adjustPointsSection').classList.remove('hidden');
    }
  });

  // -----------------------
  // 新增會員功能（使用 JSONP GET 請求）
  const addMemberBtn = document.getElementById('addMemberBtn');
  addMemberBtn.addEventListener('click', function() {
    const name = document.getElementById('newName').value.trim();
    const phone = document.getElementById('newPhone').value.trim();
    const lineID = document.getElementById('newLineID').value.trim();
    const dept = document.getElementById('newDept').value.trim();
    const initialPoints = document.getElementById('newInitialPoints').value.trim();
    const addMsg = document.getElementById('addMemberMsg');

    if (!name || !phone || !lineID || !dept || !initialPoints) {
      addMsg.textContent = '請完整填寫所有欄位';
      return;
    }

    addMsg.textContent = '新增會員中...';
    const url = `${memberDataUrl}?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&lineID=${encodeURIComponent(lineID)}&dept=${encodeURIComponent(dept)}&point=${encodeURIComponent(initialPoints)}`;
    jsonpRequest(url, function(data) {
      addMsg.textContent = data.message || JSON.stringify(data);
    });
  });

  // -----------------------
  // 會員點數調整功能（含會員查詢與操作）
  const searchBtn = document.getElementById('searchBtn');
  const memberInfoDiv = document.getElementById('memberInfo');
  const adjustOperationDiv = document.getElementById('adjustOperation');
  const adjustMsg = document.getElementById('adjustMsg');
  let selectedMember = null;

  searchBtn.addEventListener('click', function() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) {
      alert('請輸入會員識別資訊 (姓名、電話或 LINE ID)');
      return;
    }
    
    adjustMsg.textContent = '查詢中...';
    memberInfoDiv.classList.add('hidden');
    adjustOperationDiv.classList.add('hidden');
    selectedMember = null;
    
    const url = `${memberDataUrl}?keyword=${encodeURIComponent(keyword)}`;
    jsonpRequest(url, function(data) {
      if (data.status === 'success' && data.data) {
        selectedMember = data.data;
        document.getElementById('infoName').textContent = selectedMember.姓名 || '無';
        document.getElementById('infoPhone').textContent = selectedMember.電話 || '無';
        document.getElementById('infoLineID').textContent = selectedMember.LINE_ID || '無';
        document.getElementById('infoDept').textContent = selectedMember.學校處室編號 || '無';
        document.getElementById('infoBalance').textContent = selectedMember.點數餘額 || '無';
        
        memberInfoDiv.classList.remove('hidden');
        adjustOperationDiv.classList.remove('hidden');
        adjustMsg.textContent = '';
      } else {
        adjustMsg.textContent = '查無會員資料';
      }
    });
  });

  // 調整點數操作：使用 fetch POST 請求
  const adjustBtn = document.getElementById('adjustBtn');
  adjustBtn.addEventListener('click', function() {
    const action = document.getElementById('actionType').value;
    const amount = parseInt(document.getElementById('adjustAmount').value.trim(), 10);
    const desc = document.getElementById('adjustDesc').value.trim();
    const operator = document.getElementById('adjustOperator').value.trim();
    
    if (!selectedMember || isNaN(amount) || !desc || !operator) {
      alert('請填寫所有欄位');
      return;
    }
    
    const postData = {
      line_id: selectedMember.LINE_ID,
      phone: selectedMember.電話,
      name: selectedMember.姓名,
      unit: selectedMember.學校處室編號,
      action: action,
      amount: amount,
      content: desc,
      cashier: operator
    };
    
    adjustMsg.textContent = '處理中...';
    adjustBtn.disabled = true;
    
    fetch(adjustPointsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    })
      .then(res => res.json())
      .then(result => {
        if (result.status === 'success') {
          adjustMsg.textContent = '操作成功！ 新點數：' + result.newPoints;
          document.getElementById('adjustAmount').value = '';
          document.getElementById('adjustDesc').value = '';
          document.getElementById('adjustOperator').value = '';
        } else {
          adjustMsg.textContent = '操作失敗：' + result.message;
        }
      })
      .catch(err => {
        console.error(err);
        adjustMsg.textContent = '調整點數時發生錯誤';
      })
      .finally(() => {
        adjustBtn.disabled = false;
      });
  });
});
