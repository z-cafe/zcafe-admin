document.addEventListener('DOMContentLoaded', function () {
  console.log('✅ admin.js 正確載入！');

  const memberDataUrl = 'https://script.google.com/macros/s/AKfycbxz_MRdTBhr39nt9vPKOgoQ9D-P8xlNIVJrcehKpp763AlqzI8hHVb5iBtOx1nj7ZC1/exec';
  const adjustPointsUrl = 'https://script.google.com/macros/s/AKfycbwxXd4ZRvBD--eOMEz3S-etWTWX7gGTmF3tyPk6fa8Eo7s4X0sdiJ-4kwnTehZK3KaZ/exec';

  const actionSelect = document.getElementById('actionSelect');
  const memberSelect = document.getElementById('memberSelect');
  const selectMemberBtn = document.getElementById('selectMemberBtn');
  const multipleResults = document.getElementById('multipleResults');

  actionSelect.addEventListener('change', function () {
    document.getElementById('addMemberSection').classList.add('hidden');
    document.getElementById('adjustPointsSection').classList.add('hidden');

    if (this.value === 'addMember') {
      document.getElementById('addMemberSection').classList.remove('hidden');
    } else if (this.value === 'adjustPoints') {
      document.getElementById('adjustPointsSection').classList.remove('hidden');
    }
  });

  function submitMember(forced = false) {
    const name = document.getElementById('newName').value.trim();
    let phone = document.getElementById('newPhone').value.trim();
    phone = phone.replace(/^0/, '');
    const lineID = document.getElementById('newLineID').value.trim();
    const dept = document.getElementById('newDept').value.trim();
    const initialPoints = document.getElementById('newInitialPoints').value.trim();
    const addMsg = document.getElementById('addMemberMsg');

    if (!name || !phone || !dept || !initialPoints) {
      addMsg.textContent = '請完整填寫所有欄位（姓名、電話、處室、點數）';
      return;
    }

    addMsg.textContent = '新增會員中...';
    const params = new URLSearchParams({ name, phone, lineID, dept, point: initialPoints });
    if (forced) params.append('force', 'true');

    fetch(`${memberDataUrl}?${params.toString()}`)
      .then(res => res.text())
      .then(text => {
        let json;
        try {
          json = text.trim().startsWith('callback(')
            ? JSON.parse(text.replace(/^callback\(/, '').replace(/\);$/, ''))
            : JSON.parse(text);

          if (json.status === 'duplicate') {
            alert('🟡 有相同姓名與電話的會員！');
            if (confirm(json.message || '已有相同會員，是否仍要新增？')) {
              submitMember(true);
            } else {
              addMsg.textContent = '已取消新增';
            }
          } else if (json.status === 'exists') {
            addMsg.textContent = json.message;
          } else if (json.status === 'success') {
            addMsg.textContent = '會員新增成功！';
            ['newName', 'newPhone', 'newLineID', 'newDept', 'newInitialPoints'].forEach(id =>
              document.getElementById(id).value = ''
            );
          } else {
            addMsg.textContent = json.message || '新增失敗';
          }
        } catch (e) {
          console.error('JSON 解析錯誤', text);
          addMsg.textContent = '無法解析伺服器回應';
        }
      })
      .catch(err => {
        console.error('錯誤', err);
        addMsg.textContent = '新增失敗';
      });
  }

  document.getElementById('addMemberBtn').addEventListener('click', () => submitMember(false));

  const searchBtn = document.getElementById('searchMemberBtn');
  const confirmAdjustBtn = document.getElementById('confirmAdjustBtn');
  let currentMember = null;

  searchBtn.addEventListener('click', () => {
    console.log('🔍 查詢會員按下！');

    const keyword = document.getElementById('searchInput').value.trim();
    const adjustMsg = document.getElementById('adjustMsg');
    if (!keyword) {
      adjustMsg.textContent = '請輸入會員姓名、電話或 LINE ID';
      return;
    }

    adjustMsg.textContent = '查詢中...';
    fetch(`${adjustPointsUrl}?query=${encodeURIComponent(keyword)}`)
      .then(res => res.json())
      .then(data => {
        console.log('🔁 查詢回應：', data);

        if (Array.isArray(data.members)) {
          // 顯示多筆會員選擇器
          multipleResults.classList.remove('hidden');
          memberSelect.innerHTML = '';
          data.members.forEach((member, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `姓名：${member.name}｜電話：${member.phone}｜LINE ID：${member.lineID}｜處室：${member.dept}｜點數：${member.point}`;
            memberSelect.appendChild(option);
          });
          // 儲存可選成員資訊
          memberSelect.dataset.members = JSON.stringify(data.members);
          adjustMsg.textContent = '';
          return;
        }

        if (data.status === 'found') {
          multipleResults.classList.add('hidden');
          showMemberData(data);
        } else {
          multipleResults.classList.add('hidden');
          document.getElementById('memberInfo').classList.add('hidden');
          document.getElementById('adjustForm').classList.add('hidden');
          adjustMsg.textContent = data.message || '查無會員';
        }
      })
      .catch(err => {
        console.error('查詢失敗', err);
        adjustMsg.textContent = '查詢發生錯誤';
      });
  });

  selectMemberBtn.addEventListener('click', () => {
    const members = JSON.parse(memberSelect.dataset.members || '[]');
    const selected = members[memberSelect.value];
    if (selected) {
      showMemberData(selected);
      multipleResults.classList.add('hidden');
    }
  });

  function showMemberData(data) {
    currentMember = {
      name: String(data.name || '').trim() || '-',
      phone: String(data.phone || '').trim() || '-',
      lineID: String(data.lineID || '').trim() || '-',
      dept: String(data.dept || '').trim() || '-'
    };

    document.getElementById('adjustName').textContent = currentMember.name;
    document.getElementById('adjustPhone').textContent = currentMember.phone;
    document.getElementById('adjustLineID').textContent = currentMember.lineID;
    document.getElementById('adjustDept').textContent = currentMember.dept;
    document.getElementById('adjustPoint').textContent = String(data.point || '').trim();
    document.getElementById('memberInfo').classList.remove('hidden');
    document.getElementById('adjustForm').classList.remove('hidden');
  }

  confirmAdjustBtn.addEventListener('click', () => {
    console.log('🟡 點了確認新增');

    const adjustType = document.getElementById('adjustType').value;
    const adjustAmountRaw = document.getElementById('adjustAmount').value.trim();
    const adjustReason = document.getElementById('adjustReason').value.trim();
    const adjustCashier = document.getElementById('adjustCashier').value.trim();
    const adjustMsg = document.getElementById('adjustMsg');
    const adjustAmount = Number(adjustAmountRaw);

    console.log('📦 動作:', adjustType);
    console.log('📦 金額:', adjustAmount);
    console.log('📦 原因:', adjustReason);
    console.log('📦 出資人:', adjustCashier);
    console.log('📦 currentMember:', currentMember);

    if (!adjustType || isNaN(adjustAmount) || adjustAmount <= 0 || !adjustReason || !adjustCashier) {
      adjustMsg.textContent = '請完整填寫「儲值 / 扣款內容」欄位';
      return;
    }

    const params = new URLSearchParams({
      action: adjustType,
      name: currentMember?.name || '-',
      phone: currentMember?.phone || '-',
      lineID: currentMember?.lineID || '-',
      dept: currentMember?.dept || '-',
      amount: adjustAmount,
      reason: adjustReason,
      cashier: adjustCashier
    });

    fetch(`${adjustPointsUrl}?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          adjustMsg.textContent = `✅ 點數調整成功，新餘額：${data.newPoint}`;
          document.getElementById('adjustPoint').textContent = data.newPoint;
        } else {
          adjustMsg.textContent = data.message || '❌ 調整失敗';
        }
      })
      .catch(err => {
        console.error('❌ 請求失敗', err);
        adjustMsg.textContent = '❌ 請求失敗，請稍後再試';
      });
  });
});
