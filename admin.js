document.addEventListener("DOMContentLoaded", function () {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  const resultDiv = document.getElementById("result");
  const editSection = document.getElementById("editSection");

  const nameSpan = document.getElementById("name");
  const phoneSpan = document.getElementById("phone");
  const lineIdSpan = document.getElementById("lineId");
  const schoolIdSpan = document.getElementById("schoolId");
  const currentPointsSpan = document.getElementById("currentPoints");

  const actionType = document.getElementById("actionType");
  const amountInput = document.getElementById("amount");
  const descriptionInput = document.getElementById("description");
  const cashierInput = document.getElementById("cashier");
  const submitBtn = document.getElementById("submitBtn");

  let currentMember = null;

  // 查詢會員
  searchBtn.addEventListener("click", () => {
    const keyword = searchInput.value.trim();
    if (!keyword) {
      alert("請輸入要查詢的姓名、電話或 LINE ID");
      return;
    }

    fetch("https://script.google.com/macros/s/AKfycbyHGyVzcMn4QZ_jX3B61s7FErQzhq6FPBUirrVZVl6jq83ssCYZl9y4kjvxreCqXAc6Mg/exec?keyword=" + encodeURIComponent(keyword))
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.member) {
          currentMember = data.member;

          nameSpan.textContent = currentMember.name;
          phoneSpan.textContent = currentMember.phone;
          lineIdSpan.textContent = currentMember.lineId;
          schoolIdSpan.textContent = currentMember.schoolId;
          currentPointsSpan.textContent = currentMember.points;

          editSection.style.display = "block";
          resultDiv.textContent = "";
        } else {
          editSection.style.display = "none";
          resultDiv.textContent = "查無此會員";
        }
      })
      .catch((err) => {
        console.error("查詢錯誤：", err);
        resultDiv.textContent = "發生錯誤，請稍後再試。";
      });
  });

  // 儲值或扣款
  submitBtn.addEventListener("click", () => {
    if (!currentMember) return;

    const action = actionType.value;
    const amount = parseInt(amountInput.value, 10);
    const description = descriptionInput.value.trim();
    const cashier = cashierInput.value.trim();

    if (isNaN(amount) || amount <= 0) {
      alert("請輸入正確的金額");
      return;
    }

    if (!description || !cashier) {
      alert("請填寫結帳內容與結帳人");
      return;
    }

    const payload = {
      lineId: currentMember.lineId,
      name: currentMember.name,
      phone: currentMember.phone,
      schoolId: currentMember.schoolId,
      action,
      amount,
      description,
      cashier,
    };

    fetch("https://script.google.com/macros/s/AKfycbwRZjtQWPdlpd4lrDqd7aQl6eLp1745BWPJ5wkAcL8GtVqikXCDJYVfTQ5ivW5mQ1iFgg/exec", {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          alert("操作成功！");
          currentPointsSpan.textContent = data.newPoints;
          amountInput.value = "";
          descriptionInput.value = "";
          cashierInput.value = "";
        } else {
          alert("操作失敗：" + data.message);
        }
      })
      .catch((err) => {
        console.error("提交錯誤：", err);
        alert("發生錯誤，請稍後再試。");
      });
  });
});
