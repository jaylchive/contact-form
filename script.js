'use strict';

const form = document.querySelector('.form');
const submitBtn = document.querySelector('.submit-btn');

const toast = document.getElementById('toast');

const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const message = document.getElementById('message');

const general = document.getElementById('general');
const support = document.getElementById('support');

const checkbox = document.getElementById('consent');

const inputArr = [firstName, lastName, email, message];

const queryTypeContainer = document.querySelector('.input--query');

const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/g;

/////////////////////////////////////////////////////////////////////////
function handleRadioBtn(event) {
  const btn = event.target.closest('.radio--btn');

  if (!btn) return;

  btn.type = 'button';

  const targetRadioBtn = btn.querySelector('input');
  const targetRadioBtnId = targetRadioBtn.id;
  const untargetedId = targetRadioBtnId === 'general' ? 'support' : 'general';
  const untargetedBtn = document.querySelector(`.radio--btn:has(#${untargetedId})`);
  const untargetedRadioBtn = untargetedBtn.querySelector('input');

  targetRadioBtn.click();
  btn.classList.add('selected');
  queryTypeContainer.querySelector('.error-state')?.remove();

  if (targetRadioBtn.checked && untargetedRadioBtn.checked) {
    untargetedRadioBtn.checked = false;
    untargetedBtn.classList.remove('selected');
  }
}

function handleCheckBtn() {
  if (!checkbox.checked) return;
  checkbox.closest('.input-row').querySelector('.error-state')?.remove();
}

function handleInputErrorState(event) {
  const { target } = event;
  const inputRow = target.closest('.input-row');

  if (!target.value.trim()) return;

  target.classList.contains('error') && target.classList.remove('error');
  inputRow.querySelector('.error-state')?.remove();
}

function checkEmailValidation(fieldName, value) {
  const isValid = regex.test(value);

  if (isValid) return;

  generateInputErrorState(fieldName);
  generateErrorMessage(fieldName, value);
}

function checkCheckboxValidation() {
  if (!checkbox.checked) generateErrorMessage('consent');
}

function checkRequired(arr) {
  for (const [key, value] of arr) {
    if (!value.trim()) {
      generateErrorMessage(key);
      generateInputErrorState(key);
    }
    if (value.trim() && key === 'email') checkEmailValidation(key, value.trim());
  }
}

function generateInputErrorState(fieldName) {
  document.getElementById(fieldName).classList.add('error');
}

function generateErrorMessage(fieldName, value = '') {
  let markup;

  const defaultInvalidInputMessage = 'This field is required';
  const inputRow = document.querySelector(`.input-row:has(#${fieldName})`);

  const generateMarkup = content => `<p class="error-state">${content}</p>`;

  if (fieldName !== 'email' || fieldName !== 'consent') markup = generateMarkup(defaultInvalidInputMessage);

  if (fieldName === 'email') {
    if (value) markup = generateMarkup('Please enter a valid email address');
    if (!value) markup = generateMarkup(defaultInvalidInputMessage);
  }

  if (fieldName === 'consent') markup = generateMarkup('To submit this form, please consent to being contacted');

  inputRow.querySelector('.error-state')?.remove();
  inputRow.insertAdjacentHTML('beforeend', markup);
}

function checkRadioBtnState() {
  let activeRadio = 0;

  if (general.checked) activeRadio++;
  if (support.checked) activeRadio++;

  if (!activeRadio) {
    general
      .closest('.input-row')
      .insertAdjacentHTML('beforeend', `<p class="error-state">Please select a query type</p>`);
  }

  return activeRadio > 0;
}

function checkCheckboxBtnState() {
  return checkbox.checked;
}

function checkFormValid(dataArr) {
  let errorNum = 0;

  for (const [fieldName] of dataArr) {
    const inputRow = document.querySelector(`.input-row:has(#${fieldName})`);
    inputRow?.querySelector('.error-state') && errorNum++;
  }

  return errorNum <= 0;
}

function validateForm(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  queryTypeContainer.querySelector('.error-state')?.remove();

  checkRequired(Object.entries(data));
  checkCheckboxValidation();

  const isRadioChecked = checkRadioBtnState();
  const isCheckboxChecked = checkCheckboxBtnState();
  const isFormValid = checkFormValid(Object.entries(data));

  if (isRadioChecked && isFormValid && isCheckboxChecked) {
    form.reset();
    general.closest('button').classList.remove('selected');
    support.closest('button').classList.remove('selected');
    toast.classList.add('active');
  }
}

function cleartoastActiveState() {
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3000);
}

/////////////////////////////////////////////////////////////////////////
queryTypeContainer.addEventListener('click', handleRadioBtn);
submitBtn.addEventListener('click', validateForm);
checkbox.addEventListener('input', handleCheckBtn);
toast.addEventListener('animationend', cleartoastActiveState);

for (const input of inputArr) input.addEventListener('input', handleInputErrorState);
