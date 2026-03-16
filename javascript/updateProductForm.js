import { convertSVGToDOMNode } from "./convertSVG";
import plusIcon from "../icons/plus.svg";
import minusIcon from "../icons/minus.svg";

const plusSVG = convertSVGToDOMNode(plusIcon, 20, 20);
const minusSVG = convertSVGToDOMNode(minusIcon, 20, 20);

export function addSellEvent() {
  const sellStockBtn = document.getElementById('sell-stock-btn');
  const addStockBtn = document.getElementById('add-stock-btn');
  const updateStockForm = document.getElementById('update-stock-form');
  const actionNameInput = document.getElementById('action-name');

  if (!updateStockForm) return;
  if (!actionNameInput) return;

  const productStock = Number(document.getElementById('product-stock').innerText);

  updateStockForm.addEventListener("keydown", (e) => {
    if (e.key === 'Enter') e.preventDefault();
  });

  [
    {
      switchBtn: sellStockBtn,
      actionName: "sell"
    },
    {
      switchBtn: addStockBtn,
      actionName: "add"
    }
  ].forEach(({ switchBtn, actionName }) => {
    if (switchBtn) {
      switchBtn.addEventListener("click", updateResultTable(actionName, updateStockForm));
    }
  })

  const updateQuantityInput = document.getElementById('update-quantity');
  updateQuantityInput.addEventListener("input", (e) => {
    const realNumberValue = e.target.value.replace(/[^0-9]/g, "");

    updateQuantityInput.value = realNumberValue.length >= 1 ? Number(realNumberValue) : '';

    if (Number(updateQuantityInput.value) > productStock && actionNameInput.value === "sell") {
      updateQuantityInput.value = productStock;
    }

    updateResultTable(actionNameInput.value, null)(null);
  });

  updateQuantityInput.addEventListener("focus", (e) => {
    requestAnimationFrame(() => {
      const length = e.target.value.length;
      e.target.setSelectionRange(length, length);
    });
  });

  updateQuantityInput.addEventListener("focusout", (e) => {
    const currentValue = Number(e.target.value);
    if (currentValue === 0) {
      updateQuantityInput.value = 1;
    }
    else if (currentValue > productStock && actionNameInput.value === "sell") {
      updateQuantityInput.value = productStock;
    }

    updateResultTable(actionNameInput.value, null)(null);
  });


  const decrementBtn = document.getElementById('decrement');
  const incrementBtn = document.getElementById('increment');

  decrementBtn.appendChild(minusSVG);
  incrementBtn.appendChild(plusSVG);
}


const updateResultTable = (actionName, stockFormRef) => (e) => {
  if (stockFormRef) {
    stockFormRef.style.display = "block";
  }

  const actionNameInput = document.getElementById('action-name');
  actionNameInput.value = actionName;
  const quantity = Number(document.getElementById('update-quantity').value);
  const tableHeaderActionName = document.getElementById('table-header-action-name');
  const tableDataFinalQuantity = document.getElementById('table-data-final-quantity');
  const resultTable = document.getElementById('result-table');

  const productStock = Number(document.getElementById('product-stock').innerText);

  let finalQuantity = 0;
  switch (actionName) {
    case "sell":
      finalQuantity = productStock - quantity;
      tableHeaderActionName.innerText = "ขาย";
      resultTable.classList.remove("add")
      resultTable.classList.add("sell")
      break;
    case "add":
      finalQuantity = productStock + quantity;
      tableHeaderActionName.innerText = "เพิ่ม";
      resultTable.classList.remove("sell");
      resultTable.classList.add("add");
      break;
  }

  tableDataFinalQuantity.innerText = finalQuantity;
}