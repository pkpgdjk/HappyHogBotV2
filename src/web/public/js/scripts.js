let settingData = {};
let accountData = {};

const changeAccountStatus = (el, id) => {
  fetch(`/web/api/account/${id}/status`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: el.checked }),
  })
    .then((res) => {
      el.setAttribute('checked', true);
    })
    .catch((err) => {
      el.setAttribute('checked', false);
    });
};

const manualCheck = (accountId, type) => {
  fetch(`/web/api/account/${accountId}/check-${type}`, { method: 'POST' }).then((res) => {});
};

const deleteAccount = (accountId) => {
  fetch(`/web/api/account/${accountId}`, { method: 'DELETE' }).then((res) => {
    window.location.reload();
  });
};

const loadLogs = () => {
  let els = document.querySelectorAll('[name="log"]');
  els.forEach((e) => {
    var accountId = e.getAttribute('data-accountId');
    fetch(`/web/api/account/${accountId}/log`)
      .then((res) => res.text())
      .then((text) => {
        e.innerHTML = text;
      });
  });
};

const clearLogs = (accountId) => {
  fetch(`/web/api/account/${accountId}/log`, { method: 'DELETE' }).then((res) => {
    loadLogs();
    alert(`ลบ log เรียบร้อยแล้ว`);
  });
};

setInterval(loadLogs, 3000);

const showSetting = (e) => {
  let data = {
    autoFarm: e.getAttribute('data-autoFarm') == 'true',
    autoMission: e.getAttribute('data-autoMission') == 'true',
    speedMatingMission: e.getAttribute('data-speedMatingMission') == 'true',
    autoBuyItem: e.getAttribute('data-autoBuyItem') == 'true',
    sellGodPig: e.getAttribute('data-sellGodPig') == 'true',
    poisonFarm: e.getAttribute('data-poisonFarm'),
    foodId: e.getAttribute('data-foodId'),
    accountId: e.getAttribute('data-accountId'),
  };
  settingData = data;
  var myModal = new bootstrap.Modal(document.getElementById('show-setting'), {
    keyboard: false,
  });
  myModal.show();
};

const showAccount = (e, mode) => {
  if (mode == 'add') {
    accountData = {};
  } else {
    let data = {
      name: e.getAttribute('data-name'),
      accountId: e.getAttribute('data-accountId'),
    };
    accountData = data;
    console.log(data);
  }
  var myModal = new bootstrap.Modal(document.getElementById('show-account'), {
    keyboard: false,
  });
  myModal.show();
};

const submit = (el, id) => {
  document.querySelector(`#${id}`).submit();
  el.setAttribute('disabled', true);
};

var modalSetting = document.getElementById('show-setting');
modalSetting.addEventListener('show.bs.modal', function (event) {
  document.querySelector('#show-setting #autoFarm').checked = settingData.autoFarm;
  document.querySelector('#show-setting #autoMission').checked = settingData.autoMission;
  document.querySelector('#show-setting #speedMatingMission').checked = settingData.speedMatingMission;
  document.querySelector('#show-setting #autoBuyItem').checked = settingData.autoBuyItem;
  document.querySelector('#show-setting #sellGodPig').checked = settingData.sellGodPig;
  document.querySelector('#show-setting #poisonFarm').value = settingData.poisonFarm;
  document.querySelector('#show-setting #foodId').value = settingData.foodId;
  document.querySelector('#show-setting #accountId').value = settingData.accountId;
});

modalSetting.addEventListener('hidden.bs.modal', function (event) {
  settingData = {};
  document.querySelector('#show-setting #submit').removeAttribute('disabled');
});

var modalAccount = document.getElementById('show-account');
modalAccount.addEventListener('show.bs.modal', function (event) {
  document.querySelector('#show-account #name').value = accountData.name || '';
  document.querySelector('#show-account #accountId').value = accountData.accountId || '';
});

modalAccount.addEventListener('hidden.bs.modal', function (event) {
  accountData = {};
  document.querySelector('#show-account #submit').removeAttribute('disabled');
});

var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl);
});

function confirm(header, callback, options = {}) {
  var confirmModal = $(
    '<div class="modal fade">' +
      '<div class="modal-dialog">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<h5 class="modal-title" >' +
      header +
      '</h5>' +
      '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>      ' +
      '</div>' +
      '<div class="modal-body">' +
      '<p>' +
      (options.content || '') +
      '</p>' +
      '</div>' +
      '<div class="modal-footer">' +
      '<a href="#!" class="btn" data-dismiss="modal">' +
      (options.cancelButtonTxt || 'ยกเลิก') +
      '</a>' +
      '<a href="#!" id="okButton" class="btn btn-primary">' +
      (options.okButtonTxt || 'ตกลง') +
      '</a>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>',
  );

  confirmModal.find('#okButton').click(function (event) {
    callback();
    confirmModal.modal('hide');
  });

  confirmModal.modal('show');
}
