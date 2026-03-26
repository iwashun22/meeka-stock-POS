

const UIMap = new Map();

export default function handleEditableForm() {
  const editButtons = document.querySelectorAll("button.admin-edit-btn");

  // setting everything to Map()
  editButtons.forEach(btn => {
    const refId = btn.dataset.htmlFor;
    const inputDefaultValue = btn.dataset.inputValue;
    const targetForm = document.getElementById(refId);
    const parent = btn.parentElement.parentElement;

    if (!targetForm) return;
    const closeFormBtn = targetForm.querySelector(".cancel-editable");
    const inputElement = targetForm.querySelector("input[type=text]") || targetForm.querySelector("textarea");

    const restoreDefault = () => {
      if (inputElement) {
        inputElement.value = inputDefaultValue;
      }
    }
    UIMap.set(btn, { form: targetForm, container: parent, closeBtn: closeFormBtn, restoreDefault });
  });


  // Apply event handler
  UIMap.forEach((element, btn) => {
    const { form, container, closeBtn, restoreDefault } = element;

    btn.addEventListener("click", (e) => {
      UIMap.values().forEach(({ form: otherForm, container: otherContainer }) => {
        otherForm.classList.remove("show");
        otherContainer.style.display = "flex";
      });

      restoreDefault();
      form.classList.add("show");
      container.style.display = "none";
    });

    closeBtn.addEventListener("click", (e) => {
      form.classList.remove("show");
      container.style.display = "flex";
    });
  });

  checkPriceInput();
}


function checkPriceInput() {
  const editPriceInput = document.getElementById("edit-price-input");
  if (!editPriceInput) return;

  // check each input with filter
  editPriceInput.addEventListener("input", (e) => {
    const value = filterValue(e.target.value);
    editPriceInput.value = value;
  });

  // add last two decimal place when focus out
  editPriceInput.addEventListener("focusout", (e) => {
    const value = filterValue(e.target.value);
    const twoDecimalString = Number(value).toFixed(2).toString();
    editPriceInput.value = twoDecimalString;
  });
}

function filterValue(x) {
  let value = x.replace(/[^\d.]/g, "");

  // remove invalid characters
  value = value.replace(/[^\d.]/g, '');

    // allow only one dot
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }

  // limit to 2 decimal places
  if (parts[1]) {
    parts[1] = parts[1].slice(0, 2);
    value = parts[0] + '.' + parts[1];
  }

  return value;
}