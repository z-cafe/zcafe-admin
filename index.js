// 請將以下 URL 替換為你的後台功能 App Script 部署 URL
const queryUrl = 'https://script.google.com/macros/s/AKfycbwRZjtQWPdlpd4lrDqd7aQl6eLp1745BWPJ5wkAcL8GtVqikXCDJYVfTQ5ivW5mQ1iFgg/exec';
const actionUrl = 'https://script.google.com/macros/s/AKfycbxx57qpph9PcjK_W7HOAakgbo4QceR894xDbk1m3XkerT-KptqvgxsAtEHBVG1py7ib/exec';

const searchBtn = document.getElementById('searchBtn');
const confirmBtn = document.getElementById('confirmBtn');
const memberInfo = document.getElementById('memberInfo');
const messageBox = document.getElementById('messageBox');

let selectedMember = null;

// 查詢會員資料
searchBtn.addEventListener('click', () => {
  const keyword = document.getElementById('searchInput').value.trim();
  if (!keyword) {
    alert('請輸入電話、LINE ID 或姓名');
    return;
  }

  // 清除前次查詢結果
  memberInfo.classList.add('hidden');
  messageBox.textContent = '查詢中...';
  selectedMember = null;

  fetch(`${queryUrl}?keyword=${encodeURIComponent(keyword)}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success' && data.data) {
        selectedMember = data.data;
        // 更新會員資料顯示（上下排列，每個欄位獨立顯示）
        document.getElementById('infoName').textContent = selectedMember.姓名 || '無';
        document.getElementById('infoPhone').textContent = selectedMember.電話 || '無';
        document.getElementById('infoLineId').textContent = selectedMember.LINE_ID || '無';
        document.getElementById('infoDept').textContent = selectedMember.學校處室編號 || '無';
        document.getElementById('infoBalance').textContent = selectedMember.點數餘額 || '無';

        memberInfo.classList.remove('hidden');
        messageBox.textContent = '';
      } else {
        messageBox.textContent = '查無會員資料';
      }
    })
    .catch(err => {
      console.error(err);
      messageBox.textContent = '查詢發生錯誤';
    });
});

// 儲值或扣款確認
confirmBtn.addEventListener('click', () => {
  const action = document.getElementById('actionType').value;
  const amount = parseInt(document.getElementById('amountInput').value.trim(), 10);
  const content = document.getElementById('descInput').value.trim();
  const cashier = document.getElementById('operatorInput').value.trim();

  if (!selectedMember || isNaN(amount) || !content || !cashier) {
    alert('請填寫所有欄位');
    return;
  }

  const postData = {
    line_id: selectedMember.LINE_ID,
    phone: selectedMember.電話,
    name: selectedMember.姓名,
    unit: selectedMember.學校處室編號,
    action,
    amount,
    content,
    cashier
  };

  confirmBtn.disabled = true;
  messageBox.textContent = '處理中...';

  fetch(actionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  })
    .then(res => res.json())
    .then(result => {
      if (result.status === 'success') {
        messageBox.textContent = '操作成功！';
        // 清空操作欄位
        document.getElementById('amountInput').value = '';
        document.getElementById('descInput').value = '';
        document.getElementById('operatorInput').value = '';
      } else {
        messageBox.textContent = '操作失敗：' + result.message;
      }
    })
    .catch(err => {
      console.error(err);
      messageBox.textContent = '發生錯誤';
    })
    .finally(() => {
      confirmBtn.disabled = false;
    });
});
