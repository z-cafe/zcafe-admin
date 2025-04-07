document.addEventListener('DOMContentLoaded', function () {
  console.log('✅ admin.js 正確載入！');

  const memberDataUrl = 'https://script.google.com/macros/s/AKfycbxz_MRdTBhr39nt9vPKOgoQ9D-P8xlNIVJrcehKpp763AlqzI8hHVb5iBtOx1nj7ZC1/exec';
  const adjustPointsUrl = 'https://script.google.com/macros/s/待會會換成你點數調整的URL/exec';

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
        let json;
        console.log('🧾 原始回傳內容：', text);
        try {
          if (text.trim().startsWith('callback(')) {
            json = JSON.parse(text.replace(/^callback\(/, '').replace(/\);$/, ''));
          } else {
            json = JSON.parse(text);
          }
          console.log('✅ JSON 解析結果:', json);

          if (json.status === 'duplicate') {
            const confirmAdd = confirm(json.message || '已有相同姓名與電話的會員，是否仍要新增？');
            if (confirmAdd) {
              submitMember(true);
            } else {
              addMsg.textContent = '已取消新增';
            }
          } else if (json.status === 'exists') {
            addMsg.textContent = json.message;
          } else if (json.status === 'success') {
            addMsg.textContent = '會員新增成功！';
            document.getElementById('newName').value = '';
            document.getElementById('newPhone').value = '';
            document.getElementById('newLineID').value = '';
            document.getElementById('newDept').value = '';
            document.getElementById('newInitialPoints').value = '';
          } else {
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
