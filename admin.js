document.addEventListener('DOMContentLoaded', function () {
  const memberDataUrl = 'https://script.google.com/macros/s/AKfycbxz_MRdTBhr39nt9vPKOgoQ9D-P8xlNIVJrcehKpp763AlqzI8hHVb5iBtOx1nj7ZC1/exec';
  const adjustPointsUrl = 'https://script.google.com/macros/s/待會會換成你點數調整的URL/exec';

  // 功能選單切換
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

  // 新增會員功能
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
        try {
          // 自動判斷 JSON / JSONP 格式
          if (text.trim().startsWith('callback(')) {
            json = JSON.parse(text.replace(/^callback\(/, '').replace(/\);$/, ''));
          } else {
            json = JSON.parse(text);
          }

          if (json.status === 'duplicate') {
            const confirmAdd = confirm(json.message || '已有相同姓名與電話的會員，是否仍要新增？');
            if (confirmAdd) {
              submitMember(true); // 強制新增
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
          console.error('解析錯誤:', text);
          addMsg.textContent = '無法解析伺服器資料';
        }
      })
      .catch(err => {
        console.error(err);
        addMsg.textContent = '新增失敗，請稍後再試';
      });
  });
});
