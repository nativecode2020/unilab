'use strict';

const ROOT = document.getElementById('root');
const BaseUrl = `${`${__domain__}`}app/index.php/reports/`;

fetchData({
    url: BaseUrl + 'todayIncomes',
});

function fetchData({ url, method = 'GET', data = {}, headers = { 'Authorization': 'Bearer ' + localStorage.getItem('token') } }) {
    fetch(url, {
        method: method,
        headers: headers,
    })
        .catch((error) => {
            console.error(error);
        })
        .then((response) => response.json())
        .then((result) => {
            localStorage.setItem("last_url", window.location.href);
            if (result.status == false || result.isAuth == false) {
                window.location.href = 'login/login.html';
            }
            else {
                let data = result.data;
                for (let [title, value] of Object.entries(data.cards)) {
                    let card = Components.card({
                        title,
                        value,
                        icon: 'fas fa-money',
                        width: 'col-md-4 col-sm-6 col-xs-12 text-center my-3',
                        color: 'bg-white',
                    });
                    ROOT.innerHTML += card;
                }
                // let filter = Components.filterDate({
                //     id: 'filterDate',
                //     label: 'تقرير تاريخ معين',
                //     width: 'col-md-4 col-sm-6 col-xs-12 text-center my-3',
                //     onClick: 'filterByDay()',
                //     defaultValue: TODAY
                // });
                let filterStart = Components.filterDate({
                    id: 'filterDateStart',
                    label: 'بداية الفترة',
                    width: 'col-md-4 col-sm-6 col-xs-12 text-center my-3',
                    onClick: 'filterByRange()',
                    defaultValue: FIRSTDAYOFMONTH
                });
                let filterEnd = Components.filterDate({
                    id: 'filterDateEnd',
                    label: 'نهاية الفترة',
                    width: 'col-md-4 col-sm-6 col-xs-12 text-center my-3',
                    onClick: 'filterByRange()',
                    defaultValue: TODAY
                });
                ROOT.innerHTML += `<div class="w-100"></div>`;
                // ROOT.innerHTML += filter;
                ROOT.innerHTML += filterStart;
                ROOT.innerHTML += filterEnd;
                let visits = Components.table({
                    id: 'visits',
                    columns: [
                        'اسم المريض',
                        'الدكتور',
                        'تاريخ الزيارة',
                        'السعر قبل التخفيض',
                        'التخفيض',
                        'السعر بعد التخفيض',
                    ],
                    data: `
                    ${data.allVisits.map((visit) => {
                        return `
                        <tr onclick="location.href='visit_history.html?visit=${visit.hash}'">
                            <td>${visit.name}</td>
                            <td>${visit.doctor ?? 'بدون دكتور'}</td>
                            <td>${visit.visit_date}</td>
                            <td>${parseInt(visit.total_price)?.toLocaleString()} IQD</td>
                            <td>${parseInt(visit.dicount)?.toLocaleString()} IQD</td>
                            <td>${parseInt(visit.net_price)?.toLocaleString()} IQD</td>
                        </tr>
                        `;
                    }).join('')}
                    `,
                });
                ROOT.innerHTML += visits;
                let visitsTable = setTable_2('visits');
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

function filterByDay() {
    let date = document.getElementById('filterDate').value;
    if (date == '') {
        niceSwal('error', 'top-end', 'يجب اختيار تاريخ');
        return;
    }
    ROOT.innerHTML = '';
    let url = BaseUrl + 'todayIncomes?date=' + date;
    fetchData({
        url,
    });
    $('.page-header').html(`<h3 class="page-title"> تقرير الواردات للتاريخ ${date} </h3>`);
}

function filterByRange() {
    let start = document.getElementById('filterDateStart').value;
    let end = document.getElementById('filterDateEnd').value;
    if (start == '' || end == '') {
        niceSwal('error', 'top-end', 'يجب اختيار تاريخ');
        return;
    }
    ROOT.innerHTML = '';
    let url = BaseUrl + 'todayIncomes?startDate=' + start + '&endDate=' + end;
    fetchData({
        url,
    });
    $('.page-header').html(`<h3 class="page-title"> تقرير الواردات من ${start} الى ${end} </h3>`);
}

const Components = {
    card: function ({ title, value, icon = 'eye', color = '', id = title, width = 'col-md-3' }) {
        return `
            <div class="${width}" id="${id}">
                <div class="card">
                    <div class="card-header ${color}">
                        <h3 class="card-title">${title}</h3>
                    </div>
                    <div class="card-body h3 ${color}">
                        ${value}
                        <i class="${icon} fa-2x"></i>
                    </div>
                </div>
            </div>`

    },
    table:
        function ({ id = 'table', columns = [], data = [], width = 'col-md-12' }) {
            return `
            <div class="w-100"></div>
            <div class="${width}">
                <table id="${id}" class="style1">
                    <thead>
                        <tr>
                            ${columns.map((column) => `<th>${column}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data}
                    </tbody>
                </table>
            </div>
            `
        },
    filterDate: function ({ id, label = '', width = 'col-md-12', onClick = () => { }, defaultValue = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}` }) {
        return `
            <div class="${width}">
                <label for="${id}" class="h5 text-black">${label}</label>
                <div class="input-group mb-4">
                    <input type="date" class="form-control" id="${id}" aria-label="Recipient's username" aria-describedby="button-addon2" value="${defaultValue}">
                    <div class="input-group-append">
                        <button class="btn btn-primary" type="button" onclick="${onClick}">
                            تقرير
                        </button>
                    </div>
                </div>
            </div>
            `

    }
}

function setTable_2(id, options = {}) {
    return $(`#${id}`).DataTable({
        "dom": `<'dt--top-section'
        <'row flex-row-reverse'
            <'col-6 col-md-2 d-flex justify-content-md-end justify-content-center mb-md-3 mb-3'l>
            <'col-6 col-md-2 d-flex justify-content-md-end justify-content-center mb-md-3 mb-3'f>
            <'col-sm-12 col-md-8 d-flex justify-content-md-start justify-content-center addCustomItem'>
        >
    >`+
            "<'table-responsive'tr>" +
            `<'dt--bottom-section'
        <'row'
            <'col-sm-12 col-md-6 d-flex justify-content-md-start justify-content-center mb-md-3 mb-3'i>
            <'col-sm-12 col-md-6 d-flex justify-content-md-end justify-content-center mb-md-3 mb-3 pagination'>
            <'col-12 d-flex justify-content-center mb-md-3 mb-3'B>
        >
    >`,
        "language": {
            "oPaginate": {
                "sPrevious": '<i class="fas fa-caret-right"></i>',
                "sNext": '<i class="fas fa-caret-left"></i>',
            },
            "lengthMenu": `عرض _MENU_  شريحة`,
            "sSearch": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
            "sSearchPlaceholder": "بحث...",
            "sInfo": "عرض _PAGE_ من اصل _PAGES_ صفحة",
        },
        buttons: {
            buttons: [
                // { extend: 'csv', className: 'btn btn-sm btn-info', text: '<i class="fa fa-file-excel-o"></i> تصدير pdf' },
                { extend: 'excel', className: 'btn btn-sm btn-outline-print print-excel', text: '<i class="far fa-file-spreadsheet"></i> تصدير إكسيل' },
                { extend: 'print', className: 'btn btn-sm btn-outline-print print-page', text: '<i class="far fa-print"></i> طباعة' },
            ]
        },
        ...options
    })
}