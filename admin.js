document.addEventListener('DOMContentLoaded', function () {
  console.log('✅ admin.js 正確載入！');

  const memberDataUrl = 'https://script.google.com/macros/s/AKfycbxz_MRdTBhr39nt9vPKOgoQ9D-P8xlNIVJrcehKpp763AlqzI8hHVb5iBtOx1nj7ZC1/exec';

  const actionSelect = document.getElementById('actionSelect');
  actionSelect.addEventListener('change', function () {
    document.getElementById('addMemberSection').classList.add('hidden');
    document.getElementById('adjustPointsSection').classList.add('hidden');

    if (this.value === 'addMember') {
      document.getElementById('addMemberSection').classList.remove('hidden');
    } else if (this.value === 'adjustPoints') {
      document.getElementById('adjustPointsSection').classList.remove('hidden');
    }
  });

  const addMemberBtn = document.getElementById('addMemberBtn');
  addMemberBtn.addEventListener('click', function submitMember(forced = false) {
    console.log('▶️ 點了加入會員');

    const name = document.getElementById('newName').value.trim();
    const phone = document.getElementById('newPhone').value.trim();
    const lineID = document.getElementById('newLineID').value.trim();
    const dept = document.getElementById('newDept').value.trim();
    const initialPoints = document.getElementById('newInitialPoints').value.trim();
    const addMsg = document.getElementById('addMemberMsg');

    if (!name || !phone || !dept || !initialPoints) {
      addMsg.textContent = '請完整填寫所有欄位（姓名、電話、處室、點數）';
      return;
    }

    addMsg.textContent = '新增會員中...';
    console.log('📦 傳送參數：', { name, phone, lineID, dept, point: initialPoints, force });

    const params = new URLSearchParams({
      name,
      phone,
      lineID,
      dept,
      point: initialPoints
    });

    if (forced) {
      params.append('force', 'true');
    }

    fetch(`${memberDataUrl}?${params.toString()}`)
      .then(res => res.text())
      .then(text => {
        console.log('🧾 原始回傳內容：', text);
        let json;
        try {
          if (text.trim().startsWith('callback(')) {
            json = JSON.parse(text.replace(/^callback\(/, '').replace(/\);$/, ''));
          } else {
            json = JSON.parse(text);
          }

          console.log('✅ JSON 解析結果:', json);

          if (json.status === 'duplicate') {
            console.log('⚠️ 進入 duplicate 判斷區塊！');
            alert('🟡 有相同姓名與電話的會員！');

            const confirmAdd = confirm(json.message || '已有相同會員，是否仍要新增？');
            if (confirmAdd) {
              console.log('✔️ 使用者選擇強制新增');
              submitMember(true);
            } else {
              console.log('🚫 使用者取消新增');
              addMsg.textContent = '已取消新增';
            }
          } else if (json.status === 'exists') {
            console.log('🛑 LINE ID 重複');
            addMsg.textContent = json.message;
          } else if (json.status === 'success') {
            console.log('✅ 新增成功！');
            addMsg.textContent = '會員新增成功！';
            document.getElementById('newName').value = '';
            document.getElementById('newPhone').value = '';
            document.getElementById('newLineID').value = '';
            document.getElementById('newDept').value = '';
            document.getElementById('newInitialPoints').value = '';
          } else {
            console.log('❓ 未知狀態：', json.status);
            addMsg.textContent = json.message || '新增失敗';
          }
        } catch (e) {
          console.error('❌ JSON 解析失敗:', text);
          addMsg.textContent = '無法解析伺服器資料';
        }
      })
      .catch(err => {
        console.error('❌ 網路錯誤:', err);
        addMsg.textContent = '新增失敗，請稍後再試';
      });
  });
});
