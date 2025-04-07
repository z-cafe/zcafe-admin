document.addEventListener('DOMContentLoaded', function() {
  // 你的 API URL（來自你剛剛部署）
  const memberDataUrl = 'https://script.google.com/macros/s/AKfycbxz_MRdTBhr39nt9vPKOgoQ9D-P8xlNIVJrcehKpp763AlqzI8hHVb5iBtOx1nj7ZC1/exec';
  const adjustPointsUrl = 'https://script.google.com/macros/s/待會會換成你點數調整的URL/exec'; // 先放佔位

  // 功能選擇
  const actionSelect = document.getElementById('actionSelect');
  actionSelect.addEventListener('change', function() {
    document.getElementById('addMemberSection').classList.add('hidden');
    document.getElementById('adjustPointsSection').classList.add('hidden');

    if (this.value === 'addMember') {
      document.getElementById('addMemberSection').classList.remove('hidden');
    } else if (this.value === 'adjustPoints') {
      document.getElementById('adjustPointsSection').classList.remove('hidden');
    }
  });

  // -----------------------
  // 新增會員
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

    fetch(url)
      .then(res => res.text())
      .then(text => {
        try {
          const json = JSON.parse(text.replace(/^callback\(/, '').replace(/\);$/, ''));
          addMsg.textContent = json.message || JSON.stringify(json);
        } catch (e) {
          addMsg.textContent = '資料解析失敗';
          console.error('回傳資料解析失敗:', text);
        }
      })
      .catch(err => {
        addMsg.textContent = '新增失敗';
        console.error(err);
      });
  });
});
