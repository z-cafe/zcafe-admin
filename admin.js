// admin.js

// ✅ Toast 訊息系統
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => toast.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('✅ admin.js 正確載入！');

  const memberDataUrl = 'https://script.google.com/macros/s/AKfycbxz_MRdTBhr39nt9vPKOgoQ9D-P8xlNIVJrcehKpp763AlqzI8hHVb5iBtOx1nj7ZC1/exec';
  const adjustPointsUrl = 'https://script.google.com/macros/s/AKfycbwxXd4ZRvBD--eOMEz3S-etWTWX7gGTmF3tyPk6fa8Eo7s4X0sdiJ-4kwnTehZK3KaZ/exec';

  const addBtn = document.getElementById('addMemberBtn');
  const searchBtn = document.getElementById('searchMemberBtn');
  const confirmBtn = document.getElementById('confirmAdjustBtn');
  const selectMemberBtn = document.getElementById('selectMemberBtn');
  const memberSelect = document.getElementById('memberSelect');

  let currentMember = null;

  function clearInputs(ids) {
    ids.forEach(id => document.getElementById(id).value = '');
  }

  function disableBtn(btn, text) {
    btn.disabled = true;
    btn.dataset.oldText = btn.textContent;
    btn.textContent = text;
  }

  function enableBtn(btn) {
    btn.disabled = false;
    if (btn.dataset.oldText) btn.textContent = btn.dataset.oldText;
  }

  function validateFields(fields) {
    let valid = true;
    fields.forEach(id => {
      const input = document.getElementById(id);
      input.classList.remove('error');
      if (!input.value.trim()) {
        input.classList.add('error');
        valid = false;
      }
    });
    return valid;
  }

  addBtn.addEventListener('click', () => {
    if (!validateFields(['newName', 'newPhone', 'newDept', 'newInitialPoints'])) {
      showToast('請完整填寫新增會員欄位', 'error');
      return;
    }

    const name = document.getElementById('newName').value.trim();
    let phone = document.getElementById('newPhone').value.trim().replace(/^0/, '');
    const lineID = document.getElementById('newLineID').value.trim();
    const dept = document.getElementById('newDept').value.trim();
    const point = document.getElementById('newInitialPoints').value.trim();

    disableBtn(addBtn, '新增中...');

    const params = new URLSearchParams({ name, phone, lineID, dept, point });

    fetch(`${memberDataUrl}?${params.toString()}`)
      .then(res => res.text())
      .then(text => {
        const json = text.trim().startsWith('callback(') ?
          JSON.parse(text.replace(/^callback\(/, '').replace(/\);$/, '')) :
          JSON.parse(text);

        if (json.status === 'duplicate') {
          if (confirm(json.message)) {
            fetch(`${memberDataUrl}?${params.toString()}&force=true`)
              .then(r => r.text())
              .then(resp => showToast('✅ 已強制新增會員', 'success'));
          } else {
            showToast('❌ 已取消新增', 'info');
          }
        } else if (json.status === 'success') {
          showToast('✅ 會員新增成功！', 'success');
          clearInputs(['newName', 'newPhone', 'newLineID', 'newDept', 'newInitialPoints']);
        } else {
          showToast(json.message || '❌ 新增失敗', 'error');
        }
      })
      .catch(err => {
        console.error(err);
        showToast('❌ 請求失敗', 'error');
      })
      .finally(() => enableBtn(addBtn));
  });

  searchBtn.addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return showToast('請輸入會員姓名、電話或 LINE ID', 'info');

    disableBtn(searchBtn, '查詢中...');

    fetch(`${adjustPointsUrl}?query=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.members)) {
          memberSelect.innerHTML = '';
          data.members.forEach((m, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `姓名：${m.name}｜電話：${m.phone}｜LINE ID：${m.lineID}`;
            memberSelect.appendChild(opt);
          });
          document.getElementById('multipleResults').classList.remove('hidden');
          memberSelect.dataset.members = JSON.stringify(data.members);
        } else if (data.status === 'found') {
          document.getElementById('multipleResults').classList.add('hidden');
          showMember(data);
        } else {
          showToast(data.message || '查無會員', 'info');
        }
      })
      .catch(err => {
        console.error(err);
        showToast('❌ 查詢失敗', 'error');
      })
      .finally(() => enableBtn(searchBtn));
  });

  selectMemberBtn.addEventListener('click', () => {
    const list = JSON.parse(memberSelect.dataset.members);
    const member = list[memberSelect.value];
    showMember(member);
    document.getElementById('multipleResults').classList.add('hidden');
  });

  function showMember(m) {
    currentMember = m;
    document.getElementById('adjustName').textContent = m.name;
    document.getElementById('adjustPhone').textContent = m.phone;
    document.getElementById('adjustLineID').textContent = m.lineID;
    document.getElementById('adjustDept').textContent = m.dept;
    document.getElementById('adjustPoint').textContent = m.point;
    document.getElementById('memberInfo').classList.remove('hidden');
    document.getElementById('adjustForm').classList.remove('hidden');
  }

  confirmBtn.addEventListener('click', () => {
    if (!validateFields(['adjustAmount', 'adjustReason', 'adjustCashier'])) {
      showToast('請完整填寫儲值 / 扣款欄位', 'error');
      return;
    }

    const type = document.getElementById('adjustType').value;
    const amount = document.getElementById('adjustAmount').value.trim();
    const reason = document.getElementById('adjustReason').value.trim();
    const cashier = document.getElementById('adjustCashier').value.trim();

    disableBtn(confirmBtn, '處理中...');

    const params = new URLSearchParams({
      action: type,
      name: currentMember.name,
      phone: currentMember.phone,
      lineID: currentMember.lineID,
      dept: currentMember.dept,
      amount,
      reason,
      cashier
    });

    fetch(`${adjustPointsUrl}?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          showToast(`✅ 成功，餘額：${data.newPoint}`, 'success');
          document.getElementById('adjustPoint').textContent = data.newPoint;
          clearInputs(['adjustAmount', 'adjustReason', 'adjustCashier']);
        } else {
          showToast(data.message || '❌ 調整失敗', 'error');
        }
      })
      .catch(err => {
        console.error(err);
        showToast('❌ 請求失敗', 'error');
      })
      .finally(() => enableBtn(confirmBtn));
  });
});
