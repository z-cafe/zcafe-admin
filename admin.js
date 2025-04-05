const queryUrl = 'https://script.google.com/macros/s/AKfycbwRZjtQWPdlpd4lrDqd7aQl6eLp1745BWPJ5wkAcL8GtVqikXCDJYVfTQ5ivW5mQ1iFgg/exec';
const actionUrl = 'https://script.google.com/macros/s/AKfycbxx57qpph9PcjK_W7HOAakgbo4QceR894xDbk1m3XkerT-KptqvgxsAtEHBVG1py7ib/exec';

const searchBtn = document.getElementById('searchBtn');
const confirmBtn = document.getElementById('confirmBtn');
const userInfo = document.getElementById('userInfo');
const operationSection = document.getElementById('operationSection');
const messageBox = document.getElementById('messageBox');

let selectedMember = null;

// 查詢會員資料
searchBtn.addEventListener('click', () => {
  const keyword = document.getElementById('searchInput').value.trim();
  if (!keyword) {
    alert('請輸入電話、LINE ID 或姓名');
    return;
  }

  userInfo.textContent = '查詢中...';
  operationSection.classList.add('hidden');
  selectedMember = null;

  fetch(`${queryUrl}?keyword=${encodeURIComponent(keyword)}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success' && data.data) {
        selectedMember = data.data;
        userInfo.innerHTML = `
          <strong>姓名：</strong>${selectedMember.姓名}<br>
          <strong>電話：</strong>${selectedMember.電話}<br>
          <strong>LINE ID：</strong>${selectedMember.LINE_ID}<br>
          <strong>目前點數：</strong>${selectedMember.點數餘額}
        `;
        operationSection.classList.remove('hidden');
      } else {
        userInfo.textContent = '查無會員資料';
      }
    })
    .catch(err => {
      console.error(err);
      userInfo.textContent = '查詢發生錯誤';
    });
});

// 儲值或扣款確認
confirmBtn.addEventListener('click', () => {
  const action = document.getElementById('actionSelect').value;
  const amount = parseInt(document.getElementById('amountInput').value.trim(), 10);
  const content = document.getElementById('contentInput').value.trim();
  const cashier = document.getElementById('cashierInput').value.trim();

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
        document.getElementById('amountInput').value = '';
        document.getElementById('contentInput').value = '';
        document.getElementById('cashierInput').value = '';
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
