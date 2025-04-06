document.addEventListener('DOMContentLoaded', function() {
  // 請將以下 URL 替換為你的後台 App Script 部署 URL
  // 會員資料功能 (新增會員 & 查詢會員) 使用同一個 Excel：
  const addMemberUrl = 'https://script.google.com/macros/s/AKfycbwRZjtQWPdlpd4lrDqd7aQl6eLp1745BWPJ5wkAcL8GtVqikXCDJYVfTQ5ivW5mQ1iFgg/exec'; // 修改為實際 URL
  const queryUrl = 'https://script.google.com/macros/s/AKfycbwRZjtQWPdlpd4lrDqd7aQl6eLp1745BWPJ5wkAcL8GtVqikXCDJYVfTQ5ivW5mQ1iFgg/exec';   // 修改為實際 URL
  
  // 點數調整功能 使用另一個 Excel：
  const adjustPointsUrl = 'https://script.google.com/macros/s/AKfycbxx57qpph9PcjK_W7HOAakgbo4QceR894xDbk1m3XkerT-KptqvgxsAtEHBVG1py7ib/exec'; // 修改為實際 URL

  // 新增會員功能
  const addMemberBtn = document.getElementById('addMemberBtn');
  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', () => {
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

      // 使用 GET 傳送新增會員資料
      const url = `${addMemberUrl}?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&lineID=${encodeURIComponent(lineID)}&dept=${encodeURIComponent(dept)}&point=${encodeURIComponent(initialPoints)}`;
      
      fetch(url)
        .then(res => res.text())
        .then(data => {
          addMsg.textContent = data;
        })
        .catch(err => {
          console.error(err);
          addMsg.textContent = '新增會員時發生錯誤';
        });
    });
  } else {
    console.error("找不到元素 addMemberBtn");
  }

  // 查詢會員資料 (使用會員資料試算表)
  const searchBtn = document.getElementById('searchBtn');
  const memberInfoDiv = document.getElementById('memberInfo');
  const adjustOperationDiv = document.getElementById('adjustOperation');
  const adjustMsg = document.getElementById('adjustMsg');

  let selectedMember = null;

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const keyword = document.getElementById('searchInput').value.trim();
      if (!keyword) {
        alert('請輸入會員識別資訊 (姓名、電話或 LINE ID)');
        return;
      }
      
      adjustMsg.textContent = '查詢中...';
      memberInfoDiv.classList.add('hidden');
      adjustOperationDiv.classList.add('hidden');
      selectedMember = null;
      
      fetch(`${queryUrl}?keyword=${encodeURIComponent(keyword)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success' && data.data) {
            selectedMember = data.data;
            // 更新會員資料顯示
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
        })
        .catch(err => {
          console.error(err);
          adjustMsg.textContent = '查詢發生錯誤';
        });
    });
  } else {
    console.error("找不到元素 searchBtn");
  }

  // 調整點數操作 (使用點數調整試算表)
  const adjustBtn = document.getElementById('adjustBtn');
  if (adjustBtn) {
    adjustBtn.addEventListener('click', () => {
      const action = document.getElementById('actionType').value; // "add" 或 "deduct"
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
            adjustMsg.textContent = '操作成功！';
            // 清除操作欄位
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
  } else {
    console.error("找不到元素 adjustBtn");
  }
});
