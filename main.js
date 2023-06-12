// 共通変数
const week = ["日", "月", "火", "水", "木", "金", "土"];
const today = new Date();
// 月末だとずれる可能性があるため、1日固定で取得
let showDate = new Date(today.getFullYear(), today.getMonth(), 1);

// 表示対象の年月を取得
const now_month = today.getFullYear() + "/" + (today.getMonth() + 1);
const now_day =
  today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate();

const target_month = document.querySelector("#target_month");
target_month.insertAdjacentHTML("beforeend", now_month);

const target_date = document.querySelector("#target_date");
target_date.insertAdjacentHTML("beforeend", now_day);
// 共通変数

// タブメニュー
// 任意のタブにURLからリンクするための設定
function getHashID(hashIDName) {
  if (hashIDName) {
    // タブ設定
    const li = document.querySelectorAll(".tab li");
    li.forEach((v) => {
      const idName = v.querySelector("a").getAttribute("href");
      const group = document.querySelectorAll(".input-group");
      v.classList.remove("active");
      if (idName === hashIDName) {
        v.classList.add("active");
        group.forEach((x) => {
          x.classList.remove("is-active");
        });
        document.querySelector(hashIDName).classList.add("is-active");
      }
    });
  }
}
// タブをクリックしたら
const tab_a = document.querySelectorAll(".tab a");
for (let i = 0; i < tab_a.length; i++) {
  tab_a[i].addEventListener("click", (event) => {
    event.preventDefault();
    const idName = event.target.getAttribute("href");
    getHashID(idName);
  });
}
// タブメニュー

// カレンダー
// 祝日取得
let request;

(function () {
  request = new XMLHttpRequest();
  request.open("get", "syukujitsu.csv", true);
  request.send(null);
  request.onload = function () {
    // 初期表示
    showProcess(today, calendar);

    // ローカルストレージから表を作成
    buildTable();
    // 画面表示時に合計値を計算
    expenditureSum();
    incomeSum();
    totalSum();
    // 挿入した行のボタンイベントをイベントハンドラへ登録する
    createDeleteEvent();

    // カレンダー日付選択
    calendarSelect();

    //タブ初期表示
    document.querySelector(".tab li:first-of-type").classList.add("active");
    document.querySelector(".input-group").classList.add("is-active");
    let hashName = location.hash;
    getHashID(hashName);
    //タブ初期表示
  };
})();

// 日付クリックしたときのマーカー用
let clickDate = target_date.textContent;

// 前月リンク押下時の処理
const getBeforeMonth = document.querySelector("#get_before_month");
getBeforeMonth.addEventListener("click", () => {
  showDate.setMonth(showDate.getMonth() - 1);
  showProcess(showDate);

  // テーブルフォームの再作成
  buildTable();
  // 支出・収入の合計値を再計算
  expenditureSum();
  incomeSum();
  totalSum();
  // 挿入した行のボタンイベントをイベントハンドラへ登録する
  createDeleteEvent();

  // カレンダー日付選択
  calendarSelect();
});

// 翌月リンク押下時の処理
const getNextMonth = document.querySelector("#get_next_month");
getNextMonth.addEventListener("click", () => {
  showDate.setMonth(showDate.getMonth() + 1);
  showProcess(showDate);

  // テーブルフォームの再作成
  buildTable();
  // 支出・収入の合計値を再計算
  expenditureSum();
  incomeSum();
  totalSum();
  // 挿入した行のボタンイベントをイベントハンドラへ登録する
  createDeleteEvent();

  // カレンダー日付選択
  calendarSelect();
});

// カレンダー表示
function showProcess(date) {
  let year = date.getFullYear();
  let month = date.getMonth();
  document.querySelector("#target_month").innerHTML = year + "/" + (month + 1);

  // 先月ボタンにクラスを付与
  getBeforeMonth.classList = year + "/" + month;

  // 翌月ボタンにクラスを付与
  getNextMonth.classList = year + "/" + (month + 2);

  let calendar = createProcess(year, month);
  document.querySelector("#calendar").innerHTML = calendar;

  // 記入日付チェック用
  let clickDateMonth = clickDate.substring(clickDate.lastIndexOf("/"), 0);
  let clickDateDay = clickDate.split("/")[2];
  if (clickDateMonth === target_month.textContent) {
    document.querySelectorAll("tr td.day").forEach((v) => {
      if (v.dataset.num === clickDateDay) {
        v.classList.add("click");
      } else {
        v.classList.remove("click");
      }
    });
  } else {
    document.querySelectorAll("tr td.day").forEach((v) => {
      v.classList.remove("click");
    });
  }
}

// カレンダー作成
function createProcess(year, month) {
  // 曜日
  let calendar = '<table><tr class="dayOfWeek">';
  for (let i of week) {
    calendar += "<th>" + i + "</th>";
  }
  calendar += "</tr>";

  let count = 0;
  let startDayOfWeek = new Date(year, month, 1).getDay();
  let endDate = new Date(year, month + 1, 0).getDate();
  let lastMonthEndDate = new Date(year, month, 0).getDate();
  let row = Math.ceil((startDayOfWeek + endDate) / week.length);

  for (let i = 0; i < row; i++) {
    calendar += "<tr>";
    // 1column単位で設定
    for (let j = 0; j < week.length; j++) {
      if (i == 0 && j < startDayOfWeek) {
        // 1行目で1日まで先月の日付を設定
        calendar +=
          '<td class="last disabled day">' +
          "<span>" +
          (lastMonthEndDate - startDayOfWeek + j + 1) +
          "</span>" +
          "</td>";
      } else if (count >= endDate) {
        // 最終行で最終日以降、翌月の日付を設定
        count++;
        calendar +=
          '<td class="next disabled day">' +
          "<span>" +
          (count - endDate) +
          "</span>" +
          "</td>";
      } else {
        // 当月の日付を曜日に照らし合わせて設定
        count++;
        let dateInfo = checkDate(year, month, count);

        if (dateInfo.isToday) {
          calendar +=
            '<td class="day" data-num=' +
            count +
            ">" +
            "<span class='today'>" +
            count +
            "</span>" +
            '<span class="income">' +
            "</span>" +
            '<span class="expenditure">' +
            "</span>" +
            "</td>";
        } else if (dateInfo.isHoliday) {
          calendar +=
            '<td class="holiday day" title="' +
            dateInfo.holidayName +
            '" data-num=' +
            count +
            ">" +
            "<span>" +
            count +
            "</span>" +
            '<span class="income">' +
            "</span>" +
            '<span class="expenditure">' +
            "</span>" +
            "</td>";
        } else {
          calendar +=
            '<td class="day"data-num=' +
            count +
            ">" +
            "<span>" +
            count +
            "</span>" +
            '<span class="income">' +
            "</span>" +
            '<span class="expenditure">' +
            "</span>" +
            "</td>";
        }
      }
    }
    calendar += "</tr>";
  }

  return calendar;
}

// 日付チェック
function checkDate(year, month, day) {
  if (isToday(year, month, day)) {
    return {
      isToday: true,
      isHoliday: false,
      holidayName: "",
    };
  }

  let checkHoliday = isHoliday(year, month, day);
  return {
    isToday: false,
    isHoliday: checkHoliday[0],
    holidayName: checkHoliday[1],
  };
}

// 当日かどうか
function isToday(year, month, day) {
  return (
    year == today.getFullYear() &&
    month == today.getMonth() &&
    day == today.getDate()
  );
}

// 祝日かどうか
function isHoliday(year, month, day) {
  let checkDate = year + "/" + (month + 1) + "/" + day;
  let dateList = request.responseText.split("\n");
  // 1行目はヘッダーのため、初期値1で開始
  for (let i = 1; i < dateList.length; i++) {
    if (dateList[i].split(",")[0] === checkDate) {
      return [true, dateList[i].split(",")[1]];
    }
  }
  return [false, ""];
}
// カレンダー

// 家計簿
// カレンダー日付選択関数
function calendarSelect() {
  const calendarDate = document.querySelectorAll("#calendar td");
  calendarDate.forEach((el) => {
    el.addEventListener("click", (event) => {
      let target = event.target.querySelector("span");

      // 日付選択のマーカー
      document.querySelectorAll(".click").forEach((v) => {
        if (v.dataset.num !== target.textContent) {
          v.classList.remove("click");
        }
      });
      event.target.classList.add("click");
      console.log(event.target);

      if (event.target.classList.contains("last")) {
        target_date.textContent =
          getBeforeMonth.classList + "/" + target.textContent;
        clickDate = target_date.textContent;
        console.log(clickDate);
      } else if (event.target.classList.contains("next")) {
        target_date.textContent =
          getNextMonth.classList + "/" + target.textContent;
        clickDate = target_date.textContent;
        console.log(clickDate);
      } else {
        target_date.textContent =
          target_month.textContent + "/" + target.textContent;
        clickDate = target_date.textContent;
        console.log(clickDate);
      }
    });
  });
}
function removeLocalStorage(name) {
  if (isBlank(name)) {
    alert("error!!");
    return false;
  }
  // ローカルストレージから削除
  localStorage.removeItem(name);
}

function removeLocalStorageAll() {
  // ★ローカルストレージを全てクリア
  localStorage.clear();
}

function getLocalStorageItem(name) {
  if (isBlank(name)) return;
  return localStorage.getItem(name);
}

function saveLocalStorage(name, data) {
  if (isBlank(name) || isBlank(data)) {
    alert("error!!");
    return false;
  }

  // ローカルストレージに新規保存or上書き
  localStorage.setItem(name, data);
  return true;
}

// ローカルストレージ名作成
// 支出
function expenditureLocalStorageName(ym = "") {
  const base_name = "_expenditure";
  if (isBlank(ym)) {
    ym = target_month.textContent.replace(/\//g, "");
  }
  return ym + base_name;
}
// 収入
function incomeLocalStorageName(ym = "") {
  const base_name = "_income";
  if (isBlank(ym)) {
    ym = target_month.textContent.replace(/\//g, "");
  }
  return ym + base_name;
}
// 各月 ローカルストレージ名
// 支出
function expenditureSelectLocalStorageName(selectMonth) {
  const base_name = "_expenditure";
  let ym = selectMonth.replace(/\//g, "");
  return ym + base_name;
}
// 収入
function incomeSelectLocalStorageName(selectMonth) {
  const base_name = "_income";
  let ym = selectMonth.replace(/\//g, "");
  return ym + base_name;
}

// テーブルを自動生成する
function buildTable() {
  let tableBody = "";
  // テーブルを初期化
  const tr = document.querySelectorAll("table.expenses tbody tr");
  tr.forEach((el) => {
    el.remove();
  });

  // ローカルストレージ名取得
  // 支出
  const expenditure_name = expenditureLocalStorageName();
  const expenditureSt = getLocalStorageItem(expenditure_name);
  // 収入
  const income_name = incomeLocalStorageName();
  const incomeSt = getLocalStorageItem(income_name);

  // ローカルストレージのデータ取得
  // JSON形式から連想配列に変換
  const expenditureStJSON = JSON.parse(expenditureSt);
  const incomeStJSON = JSON.parse(incomeSt);
  console.log(expenditureStJSON, incomeStJSON);

  if (expenditureStJSON) {
    expenditureStJSON.map(function (val) {
      tableBody += '<tr class="expenditure">';
      tableBody += "<td class='date'>" + val["date"] + "</td>";
      tableBody += "<td class='name'>" + val["name"] + "</td>";
      tableBody +=
        "<td class='price'><span>" +
        Number(val["price"]).toLocaleString() +
        "</span>円</td>";
      tableBody +=
        '<td class="delete-td"><input type="button" class="delete" value="削除"></td>';
      tableBody += "</tr>";

      let dayIndex = val["date"].lastIndexOf("/");
      let dayNumber = val["date"].substr(dayIndex + 1);

      let data = document.querySelector(
        '[data-num="' + dayNumber + '"] .expenditure'
      );
      if (data.childNodes[0]) {
        const useMoney = Number(
          data.childNodes[0].textContent.replace(/,/g, "")
        );
        const payment = Number(val["price"].replace(/,/g, ""));
        const result = useMoney + payment;

        data.childNodes[0].textContent = result.toLocaleString();
      } else {
        data.insertAdjacentHTML(
          "beforeend",
          Number(val["price"].replace(/,/g, "")).toLocaleString()
        );
      }
    });
  }
  if (incomeStJSON) {
    incomeStJSON.map(function (val) {
      tableBody += '<tr class="income">';
      tableBody += "<td class='date'>" + val["date"] + "</td>";
      tableBody += "<td class='name'>" + val["name"] + "</td>";
      tableBody +=
        "<td class='price'><span>" +
        Number(val["price"]).toLocaleString() +
        "</span>円</td>";
      tableBody +=
        '<td class="delete-td"><input type="button" class="delete" value="削除"></td>';
      tableBody += "</tr>";

      let dayIndex = val["date"].lastIndexOf("/");
      let dayNumber = val["date"].substr(dayIndex + 1);

      let data = document.querySelector(
        '[data-num="' + dayNumber + '"] .income'
      );
      if (data.childNodes[0]) {
        const useMoney = Number(
          data.childNodes[0].textContent.replace(/,/g, "")
        );
        const payment = Number(val["price"].replace(/,/g, ""));
        const result = useMoney + payment;

        data.childNodes[0].textContent = result.toLocaleString();
      } else {
        data.insertAdjacentHTML(
          "beforeend",
          Number(val["price"].replace(/,/g, "")).toLocaleString()
        );
      }
    });
  }

  const tbody = document.querySelectorAll("table.expenses tbody");
  tbody.forEach((el) => {
    el.insertAdjacentHTML("beforeend", tableBody);
  });

  const tB = document.querySelector("table.expenses tbody");
  const exTr = document.querySelectorAll("table.expenses tbody tr");
  let trArr = Array.from(exTr)
    .map((v) => {
      let value =
        v
          .querySelector(".date")
          .innerHTML.replace(/<.+>/, "")
          .replace(/\D/g, "") - 0;
      return { dom: v, value: value };
    })
    .sort((a, b) => b.value - a.value);
  console.log(trArr);

  trArr.forEach((v) => tB.appendChild(v.dom));
}

// 空欄チェック
function isBlank(data) {
  if (data.length == 0 || data == "") {
    return true;
  } else {
    return false;
  }
}

// 合計値を求める
let exTotal;
let inTotal;

function expenditureSum() {
  let priceList = Array.from(
    document.querySelectorAll(
      'table.expenses tr.expenditure td[class="price"] span'
    )
  ).map((val) => {
    let price = Number(val.textContent.replace(/,/g, ""));
    if (price >= 0) {
      return price;
    } else {
      return null;
    }
  });

  // 価格の合計を求める
  let total = 0;
  priceList.forEach((val) => (total += val));
  exTotal = total;
  console.log(total);

  let expenditure_price = document.querySelector(".expenditure_price .money");
  expenditure_price.textContent = total.toLocaleString();
}
function incomeSum() {
  let priceList = Array.from(
    document.querySelectorAll('table.expenses tr.income td[class="price"] span')
  ).map((val) => {
    let price = Number(val.textContent.replace(/,/g, ""));
    if (price >= 0) {
      return price;
    } else {
      return null;
    }
  });

  // 価格の合計を求める
  let total = 0;
  priceList.forEach((val) => (total += val));
  inTotal = total;
  console.log(total);

  let income_price = document.querySelector(".income_price .money");
  income_price.textContent = total.toLocaleString();
}
function totalSum() {
  // 価格の合計を求める
  total = inTotal - exTotal;

  let income_price = document.querySelector(".total_price .money");
  income_price.textContent = total.toLocaleString();
}

// テーブル情報を読み込みJSON形式変換して返す
function getExJsonFromTable() {
  let counter = 0;
  let line = [];
  Array.from(
    document.querySelectorAll("table.expenses tbody .expenditure")
  ).map((val) => {
    line[counter] = {
      date: val.childNodes[0].textContent,
      name: val.childNodes[1].textContent,
      price: val.childNodes[2]
        .querySelector("span")
        .textContent.replace(/,/g, ""),
    };
    counter += 1;
  });
  return line;
}
function getInJsonFromTable() {
  let counter = 0;
  let line = [];
  Array.from(document.querySelectorAll("table.expenses tbody .income")).map(
    (val) => {
      line[counter] = {
        date: val.childNodes[0].textContent,
        name: val.childNodes[1].textContent,
        price: val.childNodes[2]
          .querySelector("span")
          .textContent.replace(/,/g, ""),
      };
      counter += 1;
    }
  );
  return line;
}

function createDeleteEvent() {
  const exDel = document.querySelectorAll(".expenditure .delete");
  exDel.forEach((el) => {
    el.addEventListener("click", (event) => {
      const target = event.target;
      const minus = target.closest("tr").children[2];
      console.log(minus);
      target.closest("tr").remove();
      // 合計値を再計算
      expenditureSum();
      totalSum();
      const line = getExJsonFromTable();
      console.log(line);
      // 連想配列からJSON形式に変換
      const mainJSON = JSON.stringify(line);
      // ローカルストレージに保存
      saveLocalStorage(expenditureLocalStorageName(), mainJSON);

      const expenditureStorage_name = expenditureLocalStorageName();
      const expenditureSt = getLocalStorageItem(expenditureStorage_name);
      const expenditureStJSON = JSON.parse(expenditureSt);

      if (expenditureStJSON) {
        expenditureStJSON.map(function (val) {
          const dayIndex = val["date"].lastIndexOf("/");
          const dayNumber = val["date"].substr(dayIndex + 1);

          const data = document.querySelector('[data-num="' + dayNumber + '"]');
          if (data.childNodes[2]) {
            const useMoney = Number(
              data.childNodes[2].textContent.replace(/,/g, "")
            );
            const payment = Number(val["price"].replace(/,/g, ""));
            const result = useMoney + payment;

            data.childNodes[2].textContent = result.toLocaleString();
          }
        });
      }

      // カレンダー再表示
      showProcess(showDate);
      buildTable();

      // 支出の合計値を再計算
      expenditureSum();
      totalSum();
      // 挿入した行のボタンイベントをイベントハンドラへ登録する
      createDeleteEvent();

      // カレンダー日付選択
      calendarSelect();

      console.log("消したよ");
    });
  });
  const inDel = document.querySelectorAll(".income .delete");
  inDel.forEach((el) => {
    el.addEventListener("click", (event) => {
      const target = event.target;
      const minus = target.closest("tr").children[2];
      console.log(minus);
      target.closest("tr").remove();
      // 合計値を再計算
      incomeSum();
      totalSum();
      const line = getInJsonFromTable();
      console.log(line);
      // 連想配列からJSON形式に変換
      const mainJSON = JSON.stringify(line);
      // ローカルストレージに保存
      saveLocalStorage(incomeLocalStorageName(), mainJSON);

      const incomeStorage_name = incomeLocalStorageName();
      const incomeSt = getLocalStorageItem(incomeStorage_name);
      const incomeStJSON = JSON.parse(incomeSt);

      if (incomeStJSON) {
        incomeStJSON.map(function (val) {
          const dayIndex = val["date"].lastIndexOf("/");
          const dayNumber = val["date"].substr(dayIndex + 1);

          const data = document.querySelector('[data-num="' + dayNumber + '"]');
          if (data.childNodes[1]) {
            const useMoney = Number(
              data.childNodes[1].textContent.replace(/,/g, "")
            );
            const payment = Number(val["price"].replace(/,/g, ""));
            const result = useMoney + payment;

            data.childNodes[1].textContent = result.toLocaleString();
          }
        });
      }

      // カレンダー再表示
      showProcess(showDate);
      buildTable();

      // 収入の合計値を再計算
      incomeSum();
      totalSum();

      // 挿入した行のボタンイベントをイベントハンドラへ登録する
      createDeleteEvent();

      // カレンダー日付選択
      calendarSelect();

      console.log("消したよ");
    });
  });
}

// テキストボックスアニメーション
const input = document.querySelectorAll(".input-group input");
input.forEach((el) => {
  el.addEventListener("focusin", (event) => {
    if (!event.target.value) {
      event.target.parentNode.querySelector("label").classList.add("active");
    }
  });
  el.addEventListener("focusout", (event) => {
    if (!event.target.value) {
      event.target.parentNode.querySelector("label").classList.remove("active");
    }
  });
});

// addボタン押下時の処理
const expenditureAdd = document.querySelector("#expenditure_add");
expenditureAdd.addEventListener("click", () => {
  const name = document.querySelector("#expenditure_name").value;
  const price = document.querySelector("#expenditure_price").value;
  const str_date = target_date.textContent;

  // 空欄チェック
  if (isBlank(name) || isBlank(price)) {
    alert("空欄の項目があります。");
    return;
  }
  if (isNaN(price)) {
    alert("価格は数値で入力してください。");
    return;
  }

  const str_month_place = str_date.lastIndexOf("/");
  const str_month = str_date.substring(0, str_month_place);

  const table = document.querySelector("table.expenses tbody");

  const addText =
    '<tr class="expenditure"><td>' +
    str_date +
    "</td>" +
    '<td class="name">' +
    name +
    "</td>" +
    '<td class="price"><span>' +
    Number(price).toLocaleString() +
    "</span>円</td>" +
    '<td class="delete-td"><input type="button" class="delete" value="削除"></td>' +
    "</tr>";

  if (target_month.textContent === str_month) {
    // 行を追加
    table.insertAdjacentHTML("afterbegin", addText);

    // ローカルストレージに保存
    const product = { date: str_date, name: name, price: price };
    console.log(product);

    // 既存のローカルストレージの値を取得
    let expenditureArray = [];
    const expenditureStJSON = getLocalStorageItem(
      expenditureLocalStorageName()
    );

    // 支出用
    if (expenditureStJSON != null && expenditureStJSON != "") {
      // JSON形式から連想配列に変換
      expenditureArray = JSON.parse(expenditureStJSON);
      expenditureArray.push(product);

      if (expenditureArray) {
        const dayIndex =
          expenditureArray[expenditureArray.length - 1]["date"].lastIndexOf(
            "/"
          );
        const dayNumber = expenditureArray[expenditureArray.length - 1][
          "date"
        ].substring(dayIndex + 1);

        const data = document.querySelector('[data-num="' + dayNumber + '"]');
        if (data.childNodes[2]) {
          const useMoney = Number(
            data.childNodes[2].textContent.replace(/,/g, "")
          );
          const payment = Number(
            expenditureArray[expenditureArray.length - 1]["price"]
          );
          const result = useMoney + payment;

          data.childNodes[2].textContent = result.toLocaleString();
        } else {
          data.insertAdjacentHTML(
            "beforeend",
            '<p class="use-money">' +
              Number(
                expenditureArray[expenditureArray.length - 1]["price"]
              ).toLocaleString() +
              "</p>"
          );
        }
      }
    } else {
      expenditureArray.push(product);

      if (expenditureArray) {
        const dayIndex =
          expenditureArray[expenditureArray.length - 1]["date"].lastIndexOf(
            "/"
          );
        const dayNumber = expenditureArray[expenditureArray.length - 1][
          "date"
        ].substring(dayIndex + 1);

        const data = document.querySelector('[data-num="' + dayNumber + '"]');
        if (data.childNodes[2]) {
          const useMoney = Number(
            data.childNodes[2].textContent.replace(/,/g, "")
          );
          const payment = Number(
            expenditureArray[expenditureArray.length - 1]["price"]
          );
          const result = useMoney + payment;

          data.childNodes[2].textContent = result.toLocaleString();
        } else {
          data.insertAdjacentHTML(
            "beforeend",
            '<p class="use-money">' +
              Number(
                expenditureArray[expenditureArray.length - 1]["price"]
              ).toLocaleString() +
              "</p>"
          );
        }
      }
    }

    // 連想配列からJSON形式に変換
    const expenditureJSON = JSON.stringify(expenditureArray);
    // ローカルストレージに保存
    saveLocalStorage(expenditureLocalStorageName(), expenditureJSON);
  } else if (getNextMonth.classList[0] === str_month) {
    console.log("翌月のデータベースに保存");
    console.log(expenditureSelectLocalStorageName(getNextMonth.classList[0]));

    // ローカルストレージに保存
    const product = { date: str_date, name: name, price: price };
    console.log(product);
    // 翌月のローカルストレージの値を取得
    let nextExpenditureArray = [];
    const nextExpenditureStJSON = getLocalStorageItem(
      expenditureSelectLocalStorageName(getNextMonth.classList[0])
    );
    console.log(nextExpenditureStJSON);

    if (nextExpenditureStJSON != null && nextExpenditureStJSON != "") {
      // JSON形式から連想配列に変換
      nextExpenditureArray = JSON.parse(nextExpenditureStJSON);
      nextExpenditureArray.push(product);
    } else {
      nextExpenditureArray.push(product);
      console.log(nextExpenditureArray);
    }

    // 連想配列からJSON形式に変換
    const nextExpenditureJSON = JSON.stringify(nextExpenditureArray);
    // ローカルストレージに保存
    saveLocalStorage(
      expenditureSelectLocalStorageName(getNextMonth.classList[0]),
      nextExpenditureJSON
    );
  } else if (getBeforeMonth.classList[0] === str_month) {
    console.log("先月のデータベースに保存");
    console.log(expenditureSelectLocalStorageName(getBeforeMonth.classList[0]));

    // ローカルストレージに保存
    const product = { date: str_date, name: name, price: price };
    console.log(product);
    // 翌月のローカルストレージの値を取得
    let beforeExpenditureArray = [];
    const beforeExpenditureLocalStJSON = getLocalStorageItem(
      expenditureSelectLocalStorageName(getBeforeMonth.classList[0])
    );
    console.log(beforeExpenditureLocalStJSON);

    if (
      beforeExpenditureLocalStJSON != null &&
      beforeExpenditureLocalStJSON != ""
    ) {
      // JSON形式から連想配列に変換
      beforeExpenditureArray = JSON.parse(beforeExpenditureLocalStJSON);
      beforeExpenditureArray.push(product);
    } else {
      beforeExpenditureArray.push(product);
      console.log(beforeExpenditureArray);
    }

    // 連想配列からJSON形式に変換
    const beforeExpenditureJSON = JSON.stringify(beforeExpenditureArray);
    // ローカルストレージに保存
    saveLocalStorage(
      expenditureSelectLocalStorageName(getBeforeMonth.classList[0]),
      beforeExpenditureJSON
    );
  }

  // フォームの値削除
  document.querySelector("#expenditure_name").value = "";
  document.querySelector("#expenditure_price").value = "";
  input.forEach((el) => {
    const label = el.parentNode.querySelector("label");
    if (el.value === "" && label.className === "active") {
      label.classList.remove("active");
    }
  });

  // テーブルを再作成
  showProcess(showDate);
  buildTable();

  // 支出・収入の合計値を再計算
  expenditureSum();
  incomeSum();
  totalSum();

  // 挿入した行のボタンイベントをイベントハンドラへ登録する
  createDeleteEvent();

  // カレンダー日付選択
  calendarSelect();
});
const incomeAdd = document.querySelector("#income_add");
incomeAdd.addEventListener("click", () => {
  const name = document.querySelector("#income_name").value;
  const price = document.querySelector("#income_price").value;
  const date = new Date();
  const str_date = target_date.textContent;

  // 空欄チェック
  if (isBlank(name) || isBlank(price)) {
    alert("空欄の項目があります。");
    return;
  }
  if (isNaN(price)) {
    alert("価格は数値で入力してください。");
    return;
  }

  const str_month_place = str_date.lastIndexOf("/");
  const str_month = str_date.substring(0, str_month_place);

  const table = document.querySelector("table.expenses tbody");

  const addText =
    '<tr class="income"><td>' +
    str_date +
    "</td>" +
    '<td class="name">' +
    name +
    "</td>" +
    '<td class="price"><span>' +
    Number(price).toLocaleString() +
    "</span>円</td>" +
    '<td class="delete-td"><input type="button" class="delete" value="削除"></td>' +
    "</tr>";

  if (target_month.textContent === str_month) {
    // 行を追加
    table.insertAdjacentHTML("afterbegin", addText);

    // ローカルストレージに保存
    const product = { date: str_date, name: name, price: price };
    console.log(product);

    // 既存のローカルストレージの値を取得
    let incomeArray = [];
    const incomeStJSON = getLocalStorageItem(incomeLocalStorageName());
    console.log(incomeStJSON);

    // 収入用
    if (incomeStJSON != null && incomeStJSON != "") {
      // JSON形式から連想配列に変換
      incomeArray = JSON.parse(incomeStJSON);
      incomeArray.push(product);

      if (incomeArray) {
        const dayIndex =
          incomeArray[incomeArray.length - 1]["date"].lastIndexOf("/");
        const dayNumber = incomeArray[incomeArray.length - 1]["date"].substring(
          dayIndex + 1
        );

        const data = document.querySelector('[data-num="' + dayNumber + '"]');
        if (data.childNodes[1]) {
          const useMoney = Number(
            data.childNodes[1].textContent.replace(/,/g, "")
          );
          const payment = Number(incomeArray[incomeArray.length - 1]["price"]);
          const result = useMoney + payment;

          data.childNodes[1].textContent = result.toLocaleString();
        } else {
          data.insertAdjacentHTML(
            "beforeend",
            '<p class="income-money">' +
              Number(
                incomeArray[incomeArray.length - 1]["price"]
              ).toLocaleString() +
              "</p>"
          );
        }
      }
    } else {
      incomeArray.push(product);

      if (incomeArray) {
        const dayIndex =
          incomeArray[incomeArray.length - 1]["date"].lastIndexOf("/");
        const dayNumber = incomeArray[incomeArray.length - 1]["date"].substring(
          dayIndex + 1
        );

        const data = document.querySelector('[data-num="' + dayNumber + '"]');
        if (data.childNodes[1]) {
          const useMoney = Number(
            data.childNodes[1].textContent.replace(/,/g, "")
          );
          const payment = Number(incomeArray[incomeArray.length - 1]["price"]);
          const result = useMoney + payment;

          data.childNodes[1].textContent = result.toLocaleString();
        } else {
          data.insertAdjacentHTML(
            "beforeend",
            '<p class="income-money">' +
              Number(
                incomeArray[incomeArray.length - 1]["price"]
              ).toLocaleString() +
              "</p>"
          );
        }
      }
    }
    // 連想配列からJSON形式に変換
    const incomeJSON = JSON.stringify(incomeArray);
    // ローカルストレージに保存
    saveLocalStorage(incomeLocalStorageName(), incomeJSON);
  } else if (getNextMonth.classList[0] === str_month) {
    console.log("翌月のデータベースに保存");
    console.log(incomeSelectLocalStorageName(getNextMonth.classList[0]));

    // ローカルストレージに保存
    const product = { date: str_date, name: name, price: price };
    console.log(product);
    // 翌月のローカルストレージの値を取得
    let nextIncomeArray = [];
    const nextIncomeStJSON = getLocalStorageItem(
      expenditureSelectLocalStorageName(getNextMonth.classList[0])
    );
    console.log(nextIncomeStJSON);

    if (nextIncomeStJSON != null && nextIncomeStJSON != "") {
      // JSON形式から連想配列に変換
      nextIncomeArray = JSON.parse(nextIncomeStJSON);
      nextIncomeArray.push(product);
    } else {
      nextIncomeArray.push(product);
      console.log(nextIncomeArray);
    }

    // 連想配列からJSON形式に変換
    const nextIncomeJSON = JSON.stringify(nextIncomeArray);
    // ローカルストレージに保存
    saveLocalStorage(
      incomeSelectLocalStorageName(getNextMonth.classList[0]),
      nextIncomeJSON
    );
  } else if (getBeforeMonth.classList[0] === str_month) {
    console.log("先月のデータベースに保存");
    console.log(incomeSelectLocalStorageName(getBeforeMonth.classList[0]));

    // ローカルストレージに保存
    const product = { date: str_date, name: name, price: price };
    console.log(product);
    // 翌月のローカルストレージの値を取得
    let beforeIncomeArray = [];
    const beforeIncomeLocalStJSON = getLocalStorageItem(
      incomeSelectLocalStorageName(getBeforeMonth.classList[0])
    );
    console.log(beforeIncomeLocalStJSON);

    if (beforeIncomeLocalStJSON != null && beforeIncomeLocalStJSON != "") {
      // JSON形式から連想配列に変換
      beforeIncomeArray = JSON.parse(beforeIncomeLocalStJSON);
      beforeIncomeArray.push(product);
    } else {
      beforeIncomeArray.push(product);
      console.log(beforeIncomeArray);
    }

    // 連想配列からJSON形式に変換
    const beforeIncomeJSON = JSON.stringify(beforeIncomeArray);
    // ローカルストレージに保存
    saveLocalStorage(
      incomeSelectLocalStorageName(getBeforeMonth.classList[0]),
      beforeIncomeJSON
    );
  }

  // フォームの値削除
  document.querySelector("#income_name").value = "";
  document.querySelector("#income_price").value = "";
  input.forEach((el) => {
    const label = el.parentNode.querySelector("label");
    if (el.value === "" && label.className === "active") {
      label.classList.remove("active");
    }
  });

  // テーブルを再作成
  showProcess(showDate);
  buildTable();

  // 支出・収入の合計値を再計算
  expenditureSum();
  incomeSum();
  totalSum();

  // 挿入した行のボタンイベントをイベントハンドラへ登録する
  createDeleteEvent();

  // カレンダー日付選択
  calendarSelect();
});

// clearボタン押下時の処理
const exClear = document.querySelector("#expenditure_clear");
exClear.addEventListener("click", () => {
  if (!confirm("当月分の支出データを削除します。よろしいですか？")) {
    return false;
  } else {
    removeLocalStorage(expenditureLocalStorageName());
    const tr = document.querySelectorAll("table.expenses tbody tr");
    tr.forEach((el) => {
      el.remove();
    });
    showProcess(showDate);
    buildTable();
    expenditureSum();
    incomeSum();
    totalSum();

    // 挿入した行のボタンイベントをイベントハンドラへ登録する
    createDeleteEvent();

    // カレンダー日付選択
    calendarSelect();
  }
});
const inClear = document.querySelector("#income_clear");
inClear.addEventListener("click", () => {
  if (!confirm("当月分の収入データを削除します。よろしいですか？")) {
    return false;
  } else {
    removeLocalStorage(incomeLocalStorageName());
    const tr = document.querySelectorAll("table.expenses tbody tr");
    tr.forEach((el) => {
      el.remove();
    });
    showProcess(showDate);
    buildTable();
    expenditureSum();
    incomeSum();
    totalSum();

    // 挿入した行のボタンイベントをイベントハンドラへ登録する
    createDeleteEvent();

    // カレンダー日付選択
    calendarSelect();
  }
});
// 家計簿
